import { useEffect, useState } from 'react'
import { useMusicStore } from '../../store/musicStore'
import { api } from '../../services/api'
import { STYLES_LIMIT, LYRICS_LIMIT } from '../../constants/limits'
import { useCopy } from '../../hooks/useCopy'
import { countChars } from '../step2/LyricEditor'
import SectionCard from '../common/SectionCard'
import CharCounter from '../common/CharCounter'
import CopyButton from '../common/CopyButton'
import ValidationPanel, { type ValidateResult } from './ValidationPanel'
import MiniMaxSteps from './MiniMaxSteps'

interface PackContent {
  originalPrompt: string
  metaTags: string
  stylesText: string
  lyricsText: string
  instrumental: boolean
  sectionCount?: number
  sections?: string[]
}

/** 组装导出用的提示词包文本（创作过程存档，对应手册"创作过程说明"要求） */
function buildExportPack({
  originalPrompt, metaTags, stylesText, lyricsText, instrumental, sectionCount, sections,
}: PackContent): string {
  const now = new Date()
  return [
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
    `结构段落数：${sectionCount ?? '未校验'}`,
    sections?.length ? `段落结构：${sections.join(' → ')}` : '',
    '',
    '—— 由 古韵AI（本地提示词工程 + 云端大模型 API + 本地确定性校验算法）生成 ——',
  ].filter((line) => line !== '').join('\n')
}

/** 触发浏览器下载一段文本 */
function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportStep() {
  const {
    metaTags, stylesCaption, finalLyrics, finalPrompt, originalPrompt, instrumental,
    setStep,
  } = useMusicStore()

  const [validation, setValidation] = useState<ValidateResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const { copiedKey, copy } = useCopy()

  // 粘贴到 MiniMax Styles 框的内容：风格描述（元标签是设计存档，不必粘贴）
  const stylesText = stylesCaption || finalPrompt
  const lyricsText = finalLyrics

  // 按 Unicode 码点计数，与后端 Python len() 口径一致
  const stylesCount = countChars(stylesText)
  const lyricsCount = countChars(lyricsText)
  const overLimit = stylesCount > STYLES_LIMIT || lyricsCount > LYRICS_LIMIT

  /** 复制并反馈：失败时给出可见提示（此前缺陷为静默失败） */
  const handleCopy = async (key: string, text: string) => {
    const ok = await copy(key, text)
    setCopyFailed(!ok)
    if (!ok) window.setTimeout(() => setCopyFailed(false), 3000)
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
    const pack = buildExportPack({
      originalPrompt,
      metaTags,
      stylesText,
      lyricsText,
      instrumental,
      sectionCount: validation?.stats.section_count,
      sections: validation?.stats.sections,
    })
    const stamp = new Date().toISOString().slice(0, 10)
    downloadTextFile(`古韵AI-提示词包-${stamp}.txt`, pack)
  }

  /**
   * 启动 MiniMax 时优先复制「完整提示词包」到剪贴板（含元标签/校验结果/参数），
   * 用户在 MiniMax 创作页可直接分别粘贴到 Styles / Lyrics 输入框。
   * 复制失败也允许打开，提示用户手动全选复制。
   */
  const buildLaunchPayload = () =>
    buildExportPack({
      originalPrompt,
      metaTags,
      stylesText,
      lyricsText,
      instrumental,
      sectionCount: validation?.stats.section_count,
      sections: validation?.stats.sections,
    })

  useEffect(() => {
    // 进入导出页时自动执行一次校验
    void handleValidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <SectionCard
            title={
              <>
                ① Styles 风格描述 {instrumental && <span className="text-vermilion-light">（纯音乐模式：创意全部写在这里）</span>}
              </>
            }
            actions={
              <div className="flex items-center gap-3">
                <CharCounter current={stylesCount} limit={STYLES_LIMIT} showUnit={false} />
                <CopyButton
                  copied={copiedKey === 'styles'}
                  onCopy={() => handleCopy('styles', stylesText)}
                  disabled={!stylesText.trim()}
                />
              </div>
            }
          >
            <pre className="whitespace-pre-wrap text-rice text-sm leading-relaxed bg-ink border border-gold/20 rounded-lg p-4 min-h-20 max-h-56 overflow-y-auto">
              {stylesText || '（无内容）'}
            </pre>
          </SectionCard>

          {/* 歌词卡片 */}
          <SectionCard
            title={
              <>
                ② 歌词 {instrumental && <span className="text-rice-dark">（纯音乐模式：留空即可）</span>}
              </>
            }
            actions={
              <div className="flex items-center gap-3">
                <CharCounter current={lyricsCount} limit={LYRICS_LIMIT} showUnit={false} />
                <CopyButton
                  copied={copiedKey === 'lyrics'}
                  onCopy={() => handleCopy('lyrics', lyricsText)}
                  disabled={!lyricsText.trim()}
                />
              </div>
            }
          >
            <pre className="whitespace-pre-wrap text-rice text-sm leading-relaxed font-mono bg-ink border border-gold/20 rounded-lg p-4 max-h-72 overflow-y-auto">
              {instrumental ? '（纯音乐模式，歌词框留空）' : lyricsText || '（无内容）'}
            </pre>
          </SectionCard>

          <div className="flex justify-between items-center">
            <button
              className="px-6 py-3 border border-gold/30 text-gold hover:bg-gold/10 rounded-lg transition-colors"
              onClick={() => setStep(1)}
            >
              上一步
            </button>
            <div className="flex flex-col items-end gap-1">
              {copyFailed && (
                <span className="text-vermilion-light text-xs">复制失败，请手动全选文本复制</span>
              )}
              {overLimit && (
                <span className="text-vermilion-light text-xs">内容超过 MiniMax 字符上限，请返回精简后再导出</span>
              )}
              <div className="flex gap-3">
                <button
                  className="px-6 py-3 border border-gold/40 text-gold hover:bg-gold/10 rounded-lg font-medium transition-colors"
                  onClick={handleValidate}
                  disabled={validating}
                >
                  {validating ? '校验中...' : '重新校验'}
                </button>
                <button
                  className="px-8 py-3 bg-vermilion hover:bg-vermilion-light text-rice rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleExportPack}
                  disabled={overLimit}
                  title={overLimit ? '内容超过 MiniMax 字符上限' : undefined}
                >
                  导出提示词包 (.txt)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 右栏：校验结果 + 粘贴指引 */}
        <div className="flex flex-col gap-4">
          <ValidationPanel validation={validation} />

          {validation?.stats.sections?.length ? (
            <SectionCard title="段落结构">
              <div className="text-rice-dark text-xs leading-relaxed">
                {validation.stats.sections.join(' → ')}
              </div>
            </SectionCard>
          ) : null}

          <MiniMaxSteps
            instrumental={instrumental}
            launchPayload={buildLaunchPayload()}
            launchHint="复制失败，请按下方「导出提示词包」按钮下载后手动打开 MiniMax 粘贴"
          />
        </div>
      </div>
    </div>
  )
}
