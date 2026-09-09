import { useState, useRef, useEffect } from 'react'
import { useMusicStore } from '../../store/musicStore'
import { api } from '../../services/api'
import MidiPlayer from 'midi-player-js'

export default function MidiStep() {
  const {
    vocalAbc, instrumentAbc, selectedInstrument, midiUrl,
    sessionId, finalLyrics,
    setMidiUrl, setStep, setLoading, setError, loading, reset,
  } = useMusicStore()

  const [downloadType, setDownloadType] = useState<'vocal' | 'instrument' | 'full'>('full')
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<MidiPlayer.Player | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const handleGenerateMidi = async () => {
    const abc = downloadType === 'vocal'
      ? vocalAbc
      : downloadType === 'instrument'
        ? instrumentAbc
        : `${vocalAbc}\n${instrumentAbc}`

    if (!abc.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.generateMidi(abc, sessionId)
      setMidiUrl(result.midi_url || result.url || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成MIDI失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayMidi = async () => {
    if (!midiUrl) return

    if (isPlaying && playerRef.current) {
      playerRef.current.stop()
      setIsPlaying(false)
      return
    }

    try {
      const response = await fetch(midiUrl)
      const arrayBuffer = await response.arrayBuffer()

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      const ctx = audioContextRef.current

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const player = new MidiPlayer.Player((event: any) => {
        if (event.name === 'Note on' && (event.velocity ?? 0) > 0) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = event.frequency || 440
          gain.gain.value = (event.velocity ?? 0) / 127 * 0.3
          osc.start()
          osc.stop(ctx.currentTime + 0.3)
        }
      })

      player.loadArrayBuffer(arrayBuffer)
      playerRef.current = player
      player.play()
      setIsPlaying(true)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(player as any).addListener('endOfFile', () => {
        setIsPlaying(false)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '播放MIDI失败')
    }
  }

  const handleDownload = () => {
    if (!midiUrl) return
    const a = document.createElement('a')
    a.href = midiUrl
    a.download = `guyun_${downloadType}.mid`
    a.click()
  }

  const downloadOptions: Array<{ value: 'vocal' | 'instrument' | 'full'; label: string }> = [
    { value: 'vocal', label: '仅人声' },
    { value: 'instrument', label: '仅乐器' },
    { value: 'full', label: '完整合并' },
  ]

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl text-gold font-bold mb-2">MIDI导出</h2>
        <p className="text-rice-dark text-sm">将曲谱转换为MIDI文件，支持预览与下载</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
            <h3 className="text-gold text-sm font-medium mb-4">曲谱摘要</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-rice-dark">乐器</span>
                <span className="text-rice">{selectedInstrument}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rice-dark">人声音轨</span>
                <span className="text-rice">{vocalAbc ? '已生成' : '未生成'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rice-dark">乐器音轨</span>
                <span className="text-rice">{instrumentAbc ? '已生成' : '未生成'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rice-dark">歌词行数</span>
                <span className="text-rice">{finalLyrics.split('\n').filter((l) => l.trim()).length}行</span>
              </div>
            </div>
          </div>

          <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
            <h3 className="text-gold text-sm font-medium mb-4">下载选项</h3>
            <div className="flex gap-3 mb-4">
              {downloadOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    downloadType === opt.value
                      ? 'bg-gold text-ink shadow-lg shadow-gold/30'
                      : 'border border-gold/30 text-gold hover:bg-gold/10'
                  }`}
                  onClick={() => setDownloadType(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              className="w-full px-6 py-2.5 bg-gold hover:bg-gold-light text-ink rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerateMidi}
              disabled={loading}
            >
              {loading ? '生成中...' : '生成MIDI'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {midiUrl && (
            <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
              <h3 className="text-gold text-sm font-medium mb-4">MIDI预览</h3>
              <div className="flex flex-col items-center gap-4">
                <button
                  className={`w-16 h-16 flex items-center justify-center rounded-full transition-colors ${
                    isPlaying
                      ? 'bg-vermilion/30 text-vermilion-light hover:bg-vermilion/40'
                      : 'bg-gold/20 text-gold hover:bg-gold/30'
                  }`}
                  onClick={handlePlayMidi}
                >
                  <span className="text-2xl">{isPlaying ? '⏸' : '▶'}</span>
                </button>
                <p className="text-rice-dark text-xs">
                  {isPlaying ? '正在播放...' : '点击播放MIDI'}
                </p>
              </div>
            </div>
          )}

          {midiUrl && (
            <button
              className="w-full px-6 py-3 bg-vermilion hover:bg-vermilion-light text-rice rounded-lg font-medium transition-colors"
              onClick={handleDownload}
            >
              下载MIDI
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          className="px-6 py-3 border border-gold/30 text-gold hover:bg-gold/10 rounded-lg transition-colors"
          onClick={() => setStep(2)}
        >
          上一步
        </button>
        <button
          className="px-8 py-3 bg-gold text-ink rounded-lg font-medium hover:bg-gold-light transition-colors"
          onClick={reset}
        >
          重新创作
        </button>
      </div>
    </div>
  )
}
