import { useState, useEffect } from 'react'
import { useMusicStore } from '../../store/musicStore'
import { api } from '../../services/api'

const STYLES_LIMIT = 2000
const LYRICS_LIMIT = 3500

interface Issue {
  level: 'error' | 'warning' | 'info'
  where: string
  message: string
}

interface ValidateResult {
  ok: boolean
  issues: Issue[]
  stats: {
    styles_chars: number
    styles_limit: number
    lyrics_chars: number
    lyrics_limit: number
    sections: string[]
    section_count: number
  }
}

/** 复制文本到剪贴板，带成功反馈 */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 降级方案：隐藏 textarea 复制
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

export default function ExportStep() {
  const {
    metaTags, stylesCaption, finalLyrics, finalPrompt, originalPrompt, instrumental,
    setStep,
  } = useMusicStore()

  const [copied, setCopied] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidateResult | null>(null)
  const [validating, setValidating] = useState(false)

  // 粘贴到 MiniMax Styles 框的内容：风格描述（元标签是设计存档，不必粘贴）
  const stylesText = stylesCaption || finalPrompt
  const lyricsText = finalLyrics

  const handleCopy = async (key: string, text: string) => {
    if (!text.trim()) return
    const ok = await copyText(text)
    if (ok) {
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    }
  }

  const handleValidate = async () => {
    setValidating(true)
    try {
      const result = await api.validateMiniMax({
        styles: stylesText,
        metaTags,
        lyrics: lyricsText,
        instrumental,
      })
      setValidation(result as ValidateResult)
    } catch (err) {
      setValidation({
        ok: false,
        issues: [{ level: 'error', where: 'system', message: err instanceof Error ? err.message : '校验服务不可用' }],
        stats: {
          styles_chars: stylesText.length, styles_limit: STYLES_LIMIT,
          lyrics_chars: lyricsText.length, lyrics_limit: LYRICS_LIMIT,
          sections: [], section_count: 0,
        },
      })
    } finally {
      setValidating(false)
    }
  }

  const handleExportPack = () => {
    // 导出完整提示词包（创作过程存档，对应手册"创作过程说明"要求）
    const now = new Date()
    const pack = [
      '══════════════════════════════════════',
      '  古韵AI × MiniMax 音乐 提示词包',
      `  导出时间：${now.toLocaleString('zh-CN')}`,
      '══════════════════════════════════════',
      '',
      '【原始创意】',
      originalPrompt || '（无）',
      '',
      '【结构化元标签（Structured Caption / 元标签设计存档）】',
      metaTags || '（无）',
      '',
      '【风格描述（→ MiniMax Styles 输入框）】',
      stylesText,
      `（${stylesText.length}/${STYLES_LIMIT} 字符）`,
      '',
      `【歌词（→ MiniMax Lyrics 输入框${instrumental ? '，纯音乐模式留空' : ''}）】`,
      instrumental ? '（纯音乐模式：歌词框留空）' : lyricsText,
      `（${lyricsText.length}/${LYRICS_LIMIT} 字符）`,
      '',
      '【生成参数】',
      `模式：${instrumental ? '纯音乐（Instrumental）' : '歌曲（Lyrics）'}`,
      `结构段落数：${validation?.stats.section_count ?? '未校验'}`,
      validation?.stats.sections?.length ? `段落结构：${validation.stats.sections.join(' → ')}` : '',
      '',
      '—— 由 古韵AI（本地 LLM 提示词引擎 + 确定性格式校验）生成 ——',
    ].filter((line) => line !== '').join('\n')

    const blob = new Blob([pack], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `古韵AI-提示词包-${now.toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    // 进入导出页时自动执行一次校验
    handleValidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stylesOver = stylesText.length > STYLES_LIMIT
  const lyricsOver = lyricsText.length > LYRICS_LIMIT

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl text-gold font-bold mb-2">导出提示词包</h2>
        <p className="text-rice-dark text-sm">
          以下内容可直接粘贴到 MiniMax 音乐网页版（Music-3.0）：Styles 描述填入风格输入框{instrumental ? '；纯音乐模式歌词框留空' : '；歌词填入歌词框'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Styles 卡片 */}
          <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gold text-sm font-medium">
                ① Styles 风格描述 {instrumental && <span className="text-vermilion-light">（纯音乐模式：创意全部写在这里）</span>}
              </label>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${stylesOver ? 'text-vermilion-light' : 'text-rice-dark'}`}>
                  {stylesText.length} / {STYLES_LIMIT}
                </span>
                <button
                  className="px-4 py-1.5 bg-gold hover:bg-gold-light text-ink rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  onClick={() => handleCopy('styles', stylesText)}
                  disabled={!stylesText.trim()}
                >
                  {copied === 'styles' ? '✓ 已复制' : '复制'}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-rice text-sm leading-relaxed bg-ink border border-gold/20 rounded-lg p-4 min-h-20 max-h-56 overflow-y-auto">
              {stylesText || '（无内容）'}
            </pre>
          </div>

          {/* 歌词卡片 */}
          <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gold text-sm font-medium">
                ② 歌词 {instrumental && <span className="text-rice-dark">（纯音乐模式：留空即可）</span>}
              </label>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${lyricsOver ? 'text-vermilion-light' : 'text-rice-dark'}`}>
                  {lyricsText.length} / {LYRICS_LIMIT}
                </span>
                <button
                  className="px-4 py-1.5 bg-gold hover:bg-gold-light text-ink rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  onClick={() => handleCopy('lyrics', lyricsText)}
                  disabled={!lyricsText.trim()}
                >
                  {copied === 'lyrics' ? '✓ 已复制' : '复制'}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-rice text-sm leading-relaxed font-mono bg-ink border border-gold/20 rounded-lg p-4 max-h-72 overflow-y-auto">
              {instrumental ? '（纯音乐模式，歌词框留空）' : lyricsText || '（无内容）'}
            </pre>
          </div>

          <div className="flex justify-between items-center">
            <button
              className="px-6 py-3 border border-gold/30 text-gold hover:bg-gold/10 rounded-lg transition-colors"
              onClick={() => setStep(1)}
            >
              上一步
            </button>
            <div className="flex gap-3">
              <button
                className="px-6 py-3 border border-gold/40 text-gold hover:bg-gold/10 rounded-lg font-medium transition-colors"
                onClick={handleValidate}
                disabled={validating}
              >
                {validating ? '校验中...' : '重新校验'}
              </button>
              <button
                className="px-8 py-3 bg-vermilion hover:bg-vermilion-light text-rice rounded-lg font-medium transition-colors"
                onClick={handleExportPack}
              >
                导出提示词包 (.txt)
              </button>
            </div>
          </div>
        </div>

        {/* 右栏：校验结果 + 粘贴指引 */}
        <div className="flex flex-col gap-4">
          <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gold text-sm font-medium">格式校验</h3>
              {validation && (
                <span className={`text-xs px-2 py-0.5 rounded ${validation.ok ? 'bg-green-600/20 text-green-400' : 'bg-vermilion/20 text-vermilion-light'}`}>
                  {validation.ok ? '通过' : '存在问题'}
                </span>
              )}
            </div>
            {validation ? (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {validation.issues.length === 0 && (
                  <p className="text-green-400 text-xs">✓ 标签、字符数、结构均符合 MiniMax 格式要求</p>
                )}
                {validation.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`text-xs leading-relaxed p-2 rounded ${
                      issue.level === 'error'
                        ? 'bg-vermilion/10 text-vermilion-light'
                        : issue.level === 'warning'
                          ? 'bg-gold/10 text-gold'
                          : 'bg-ink text-rice-dark'
                    }`}
                  >
                    [{issue.level === 'error' ? '错误' : issue.level === 'warning' ? '警告' : '提示'}] {issue.message}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-rice-dark text-xs">校验中...</p>
            )}
          </div>

          {validation?.stats.sections?.length ? (
            <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
              <h3 className="text-gold text-sm font-medium mb-3">段落结构</h3>
              <div className="text-rice-dark text-xs leading-relaxed">
                {validation.stats.sections.join(' → ')}
              </div>
            </div>
          ) : null}

          <div className="bg-ink-light border border-gold/20 rounded-xl p-6">
            <h3 className="text-gold text-sm font-medium mb-3">MiniMax 网页版操作步骤</h3>
            <ol className="text-rice-dark text-xs space-y-2 leading-relaxed list-decimal list-inside">
              <li>打开 minimax.io/audio/music（或国内 minimaxi.com/audio），登录并选择 Music-3.0</li>
              <li>将 ① 复制的 Styles 描述粘贴到风格输入框（ Styles 区）</li>
              {instrumental ? (
                <li>打开 Instrumental 开关，歌词框保持留空，点击生成</li>
              ) : (
                <>
                  <li>将 ② 复制的歌词粘贴到 Lyrics 输入框（输入 "/" 可查看结构标签）</li>
                  <li>确认 Lyrics / Instrumental 开关处于 Lyrics 状态，点击生成</li>
                </>
              )}
              <li>生成后试听；不满意可回到本工具调整提示词重新生成</li>
              <li>满意后下载 mp3，并保存本页导出的提示词包作为创作过程存档</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
