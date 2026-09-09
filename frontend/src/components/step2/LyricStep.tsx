import { useState } from 'react'
import { useMusicStore } from '../../store/musicStore'
import { api } from '../../services/api'

const LYRICS_LIMIT = 3500 // MiniMax 歌词字符上限

// MiniMax 网页版歌词框支持的结构标签（点击插入）
const QUICK_TAGS = ['[Intro]', '[Verse 1]', '[Pre-Chorus]', '[Chorus]', '[Verse 2]', '[Bridge]', '[Interlude]', '[Outro]']

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
      // 风格偏好拼进 style 参数（后端再转成 LLM 指令）
      const styleArg = instrumental
        ? '纯音乐意境（注记为主，正文极少或留空）'
        : `古风；押韵偏好：${rhymePreference === 'auto' ? '自动' : rhymePreference + '韵'}`
      const result = await api.generateLyrics(finalPrompt, styleArg, sessionId)
      const lyrics = result.lyrics || result.content || ''
      setGeneratedLyrics(lyrics)
      setEditingLyrics(lyrics)
      setShowEditor(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成歌词失败')
    } finally {
      setLoading(false)
    }
  }

  const insertTag = (tag: string) => {
    // 在光标处插入结构标签（独占一行）
    const textarea = document.getElementById('lyrics-editor') as HTMLTextAreaElement | null
    if (!textarea) {
      setEditingLyrics((prev) => `${prev}\n${tag}\n`)
      return
    }
    const start = textarea.selectionStart
    const before = editingLyrics.slice(0, start)
    const after = editingLyrics.slice(textarea.selectionEnd)
    // 保证标签前面有换行
    const prefix = before && !before.endsWith('\n') ? '\n' : ''
    const next = `${before}${prefix}${tag}\n${after}`
    setEditingLyrics(next)
    // 光标移到标签行之后
    requestAnimationFrame(() => {
      const pos = (before + prefix + tag + '\n').length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const handleConfirm = () => {
    const lyrics = showEditor ? editingLyrics : generatedLyrics
    if (!lyrics.trim() && !instrumental) return
    setFinalLyrics(lyrics)
    setStep(2)
  }

  const charCount = (showEditor ? editingLyrics : generatedLyrics).length
  const overLimit = charCount > LYRICS_LIMIT

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl text-gold font-bold mb-2">歌词生成</h2>
        <p className="text-rice-dark text-sm">生成 MiniMax 歌词框可直接粘贴的英文结构标签歌词，标签后可带编曲/人声注记</p>
      </div>

      <div className="bg-ink-light border border-gold/20 rounded-xl p-5">
        <h3 className="text-gold text-sm font-medium mb-2">参考提示词</h3>
        <p className="text-rice-dark text-sm leading-relaxed whitespace-pre-wrap">{finalPrompt || '尚未设置提示词'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
            <div className="flex items-center gap-6 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-rice text-sm">押韵偏好</label>
                <select
                  className="bg-ink border border-gold/20 rounded-lg px-3 py-1.5 text-rice text-sm focus:outline-none focus:border-gold/50"
                  value={rhymePreference}
                  onChange={(e) => setRhymePreference(e.target.value)}
                  disabled={instrumental}
                >
                  <option value="auto">自动</option>
                  <option value="ang">ang韵</option>
                  <option value="an">an韵</option>
                  <option value="ing">ing韵</option>
                  <option value="ou">ou韵</option>
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
          </div>

          {showEditor && (
            <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-gold text-sm font-medium">歌词编辑器（MiniMax 格式）</label>
                <span className={`text-xs ${overLimit ? 'text-vermilion-light' : 'text-rice-dark'}`}>
                  {charCount} / {LYRICS_LIMIT} 字符
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1 border border-gold/30 text-gold hover:bg-gold/10 rounded text-xs font-mono transition-colors"
                    onClick={() => insertTag(tag)}
                    title="点击在光标处插入结构标签"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <textarea
                id="lyrics-editor"
                className="w-full h-72 bg-ink border border-gold/20 rounded-lg p-4 text-rice text-sm font-mono placeholder:text-rice-dark/50 focus:outline-none focus:border-gold/50 resize-none leading-6"
                value={editingLyrics}
                onChange={(e) => setEditingLyrics(e.target.value)}
                placeholder={'[Intro]\n(古筝泛音与箫声渐入)\n\n[Verse 1]\n歌词第一行\n歌词第二行\n\n[Chorus]\n...'}
              />
              <p className="text-rice-dark text-xs mt-2 leading-relaxed">
                结构标签独占一行、必须英文（网页版输入 "/" 可快捷插入）；标签下一行可用圆括号写编曲/人声/情绪注记
              </p>
            </div>
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
              disabled={(!generatedLyrics.trim() && !instrumental) || loading}
            >
              确认歌词，进入导出
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
            <h3 className="text-gold text-sm font-medium mb-3">歌词预览</h3>
            <pre className="whitespace-pre-wrap text-rice text-sm leading-relaxed font-serif max-h-96 overflow-y-auto">
              {generatedLyrics || '尚未生成歌词'}
            </pre>
          </div>
          <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
            <h3 className="text-gold text-sm font-medium mb-3">格式要点</h3>
            <ul className="text-rice-dark text-xs space-y-2 leading-relaxed">
              <li>• 标签独占一行：[Intro] [Verse 1] [Chorus] [Bridge] [Outro] 等</li>
              <li>• 标签后注记：圆括号一行，如 (古筝轮指渐入，鼓点渐强)</li>
              <li>• 上限 3500 字符；留空则 MiniMax 按 Styles 自动生成歌词</li>
              <li>• 不要时间戳、不要中文标签（[主歌] 不识别）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
