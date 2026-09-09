import { useState } from 'react'
import { useMusicStore } from '../../store/musicStore'
import { api } from '../../services/api'
import SectionCard from '../common/SectionCard'
import LyricEditor from './LyricEditor'
import { LYRICS_LIMIT } from '../../constants/limits'

// 押韵偏好下拉选项
const RHYME_OPTIONS = [
  { value: 'auto', label: '自动' },
  { value: 'ang', label: 'ang韵' },
  { value: 'an', label: 'an韵' },
  { value: 'ing', label: 'ing韵' },
  { value: 'ou', label: 'ou韵' },
]

/** 把押韵偏好与纯音乐开关拼成传给后端的 style 参数（后端再转成 LLM 指令） */
function buildStyleArg(rhymePreference: string, instrumental: boolean): string {
  if (instrumental) return '纯音乐意境（注记为主，正文极少或留空）'
  return `古风；押韵偏好：${rhymePreference === 'auto' ? '自动' : rhymePreference + '韵'}`
}

export default function LyricStep() {
  const {
    finalPrompt, generatedLyrics, sessionId, instrumental,
    setGeneratedLyrics, setFinalLyrics, setInstrumental,
    setStep, setLoading, setError, loading,
  } = useMusicStore()

  const [rhymePreference, setRhymePreference] = useState('auto')
  const [editingLyrics, setEditingLyrics] = useState('')
  const [showEditor, setShowEditor] = useState(false)

  const handleGenerate = async () => {
    if (!finalPrompt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.generateLyrics(finalPrompt, buildStyleArg(rhymePreference, instrumental), sessionId)
      const lyrics = result.lyrics || ''
      setGeneratedLyrics(lyrics)
      setEditingLyrics(lyrics)
      setShowEditor(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成歌词失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    const lyrics = showEditor ? editingLyrics : generatedLyrics
    if (!lyrics.trim() && !instrumental) return
    // 超过 MiniMax 上限的内容禁止进入导出页（导出即粘贴目标，必须合规）
    if (lyrics.length > LYRICS_LIMIT && !instrumental) return
    setFinalLyrics(lyrics)
    setStep(2)
  }

  // 确认按钮禁用条件：无内容（非纯音乐）或超限
  const confirmLyrics = showEditor ? editingLyrics : generatedLyrics
  const confirmDisabled =
    (!confirmLyrics.trim() && !instrumental) ||
    loading ||
    (!instrumental && confirmLyrics.length > LYRICS_LIMIT)

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl text-gold font-bold mb-2">歌词生成</h2>
        <p className="text-rice-dark text-sm">生成 MiniMax 歌词框可直接粘贴的英文结构标签歌词，标签后可带编曲/人声注记</p>
      </div>

      <SectionCard title="参考提示词">
        <p className="text-rice-dark text-sm leading-relaxed whitespace-pre-wrap">{finalPrompt || '尚未设置提示词'}</p>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SectionCard>
            <div className="flex items-center gap-6 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-rice text-sm">押韵偏好</label>
                <select
                  className="bg-ink border border-gold/20 rounded-lg px-3 py-1.5 text-rice text-sm focus:outline-none focus:border-gold/50"
                  value={rhymePreference}
                  onChange={(e) => setRhymePreference(e.target.value)}
                  disabled={instrumental}
                >
                  {RHYME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-gold w-4 h-4"
                  checked={instrumental}
                  onChange={(e) => setInstrumental(e.target.checked)}
                />
                <span className="text-rice text-sm">纯音乐模式（对应 MiniMax Instrumental 开关）</span>
              </label>
            </div>
            <button
              className="px-6 py-2.5 bg-gold hover:bg-gold-light text-ink rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerate}
              disabled={!finalPrompt.trim() || loading}
            >
              {loading ? '生成中...' : '生成歌词'}
            </button>
          </SectionCard>

          {showEditor && (
            <LyricEditor value={editingLyrics} onChange={setEditingLyrics} />
          )}

          <div className="flex justify-between">
            <button
              className="px-6 py-3 border border-gold/30 text-gold hover:bg-gold/10 rounded-lg transition-colors"
              onClick={() => setStep(0)}
            >
              上一步
            </button>
            <button
              className="px-8 py-3 bg-vermilion hover:bg-vermilion-light text-rice rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirm}
              disabled={confirmDisabled}
              title={confirmLyrics.length > LYRICS_LIMIT && !instrumental ? `歌词超过 ${LYRICS_LIMIT} 字符上限，请精简后再确认` : undefined}
            >
              确认歌词，进入导出
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SectionCard title="歌词预览">
            <pre className="whitespace-pre-wrap text-rice text-sm leading-relaxed font-serif max-h-96 overflow-y-auto">
              {generatedLyrics || '尚未生成歌词'}
            </pre>
          </SectionCard>
          <SectionCard title="格式要点">
            <ul className="text-rice-dark text-xs space-y-2 leading-relaxed">
              <li>• 标签独占一行：[Intro] [Verse 1] [Chorus] [Bridge] [Outro] 等</li>
              <li>• 标签后注记：圆括号一行，如 (古筝轮指渐入，鼓点渐强)</li>
              <li>• 上限 {LYRICS_LIMIT} 字符；留空则 MiniMax 按 Styles 自动生成歌词</li>
              <li>• 不要时间戳、不要中文标签（[主歌] 不识别）</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
