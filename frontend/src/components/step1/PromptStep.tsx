import { useState } from 'react'
import { useMusicStore, type PromptVersion } from '../../store/musicStore'
import { api } from '../../services/api'
import PromptHistoryDrawer from '../common/PromptHistoryDrawer'
import SectionCard from '../common/SectionCard'

/**
 * 解析 LLM 输出的 META / STYLES 分段（容错版）
 * 兼容：===META=== / === META === / ==meta== 等大小写与空格变体
 * 返回 parsed=false 表示两段标记都未命中（AI 返回了异常格式）
 */
function parseSections(raw: string): { meta: string; styles: string; parsed: boolean } {
  const metaMatch = raw.match(/=+\s*META\s*=+\s*([\s\S]*?)(?:=+\s*STYLES\s*=+|$)/i)
  const stylesMatch = raw.match(/=+\s*STYLES\s*=+\s*([\s\S]*)$/i)
  const meta = (metaMatch?.[1] || '').trim()
  const styles = (stylesMatch?.[1] || '').trim()
  return { meta, styles, parsed: Boolean(metaMatch || stylesMatch) }
}

/** AI 优化结果编辑区：元标签 + 风格描述两个可编辑文本域 */
function OptimizedEditor({
  meta,
  styles,
  onMetaChange,
  onStylesChange,
}: {
  meta: string
  styles: string
  onMetaChange: (value: string) => void
  onStylesChange: (value: string) => void
}) {
  return (
    <SectionCard title="结构化元标签（Structured Caption · 可编辑）">
      <textarea
        className="w-full h-44 bg-ink border border-gold/20 rounded-lg p-4 text-rice text-sm font-mono placeholder:text-rice-dark/50 focus:outline-none focus:border-gold/50 resize-none leading-6"
        value={meta}
        onChange={(e) => onMetaChange(e.target.value)}
        placeholder={'[Genre] ...\n[BPM] ...\n[Key] ...\n[Vocals] ...\n[Instruments] ...\n[Arrangement] ...'}
      />
      <label className="block text-gold text-sm font-medium mt-6 mb-3">
        风格描述（Styles 输入框内容 · 可编辑）
      </label>
      <textarea
        className="w-full h-24 bg-ink border border-gold/20 rounded-lg p-4 text-rice text-sm placeholder:text-rice-dark/50 focus:outline-none focus:border-gold/50 resize-none leading-6"
        value={styles}
        onChange={(e) => onStylesChange(e.target.value)}
        placeholder="一段连贯的风格描述，粘贴到 MiniMax 的 Styles 输入框"
      />
    </SectionCard>
  )
}

/** 右栏：当前提示词 + 历史入口 + 创作提示 */
function PromptSidebar({
  prompt,
  versionCount,
  onOpenHistory,
}: {
  prompt: string
  versionCount: number
  onOpenHistory: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="当前提示词">
        <div className="text-rice text-sm leading-relaxed whitespace-pre-wrap">
          {prompt || '尚未输入提示词'}
        </div>
      </SectionCard>

      <button
        className="w-full px-4 py-3 border border-gold/30 text-gold hover:bg-gold/10 rounded-lg transition-colors text-sm"
        onClick={onOpenHistory}
      >
        查看提示词历史 ({versionCount})
      </button>

      <SectionCard title="创作提示">
        <ul className="text-rice-dark text-xs space-y-2 leading-relaxed">
          <li>• 描述音乐意境，如"月下独酌、清风拂柳"</li>
          <li>• 指定情感基调，如"婉约、豪放、清幽"</li>
          <li>• 说明乐器偏好，如"以古筝为主，笛子对答"</li>
          <li>• 元标签含 Genre/BPM/Key/Vocals/Instruments/Arrangement 六项，对应手册要求的元标签设计</li>
        </ul>
      </SectionCard>
    </div>
  )
}

export default function PromptStep() {
  const {
    originalPrompt, optimizedPrompt, finalPrompt, sessionId, promptVersions,
    setOriginalPrompt, setOptimizedPrompt, setMetaTags, setStylesCaption, setFinalPrompt, addPromptVersion,
    setStep, setLoading, setError, loading,
  } = useMusicStore()

  const [editedMeta, setEditedMeta] = useState('')
  const [editedStyles, setEditedStyles] = useState('')
  const [showOptimized, setShowOptimized] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  /**
   * 把 AI 结果写回 store 并记录一个版本
   * @param silent true 时不弹"格式无法识别"错误（用于快速润色等无分段格式的场景）
   * @returns 是否成功解析为分段格式
   */
  const applyResult = (optimized: string, note?: string, silent = false): boolean => {
    const { meta, styles, parsed } = parseSections(optimized)
    if (!parsed || (!meta && !styles)) {
      if (!silent) {
        // AI 返回了无法识别的格式：不覆盖现有内容，让用户直接重试
        setError('AI 返回了无法识别的格式，请点击重试；若反复出现请调整创意描述')
      }
      return false
    }
    setOptimizedPrompt(optimized)
    setMetaTags(meta)
    setStylesCaption(styles)
    setEditedMeta(meta)
    setEditedStyles(styles)
    setShowOptimized(true)
    const version: PromptVersion = {
      id: crypto.randomUUID(),
      step: 'prompt',
      type: 'ai_optimized',
      content: optimized,
      timestamp: new Date().toISOString(),
      parentVersionId: null,
      note,
    }
    addPromptVersion(version)
    return true
  }

  const runWithLoading = async (task: () => Promise<void>, fallbackError: string) => {
    setLoading(true)
    setError(null)
    try {
      await task()
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackError)
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = () => {
    if (!originalPrompt.trim()) return
    void runWithLoading(async () => {
      const result = await api.optimizePrompt(originalPrompt, 'prompt', sessionId)
      applyResult(result.optimized_prompt || '')
    }, 'AI优化失败')
  }

  const handleQuickSuggest = () => {
    const text = showOptimized ? `${editedMeta}\n${editedStyles}` : originalPrompt
    if (!text.trim()) return
    void runWithLoading(async () => {
      const result = await api.quickSuggest(text, 'MiniMax古风音乐提示词润色')
      // 快速润色返回的是整段建议文本（无 META/STYLES 分段），silent 解析后兜底为纯风格描述
      const suggestion = result.suggestion || ''
      if (!applyResult(suggestion, '快速润色', true) && suggestion.trim()) {
        setOptimizedPrompt(suggestion)
        setStylesCaption(suggestion)
        setEditedStyles(suggestion)
        setShowOptimized(true)
      }
    }, '快速润色失败')
  }

  const handleConfirm = () => {
    if (showOptimized) {
      // 用户编辑后的内容回写
      setMetaTags(editedMeta)
      setStylesCaption(editedStyles)
      const combined = `${editedMeta}\n\n${editedStyles}`
      setFinalPrompt(combined)
      if (combined !== optimizedPrompt) {
        addPromptVersion({
          id: crypto.randomUUID(),
          step: 'prompt',
          type: 'human_modified',
          content: combined,
          timestamp: new Date().toISOString(),
          parentVersionId: null,
        })
      }
    } else {
      setFinalPrompt(originalPrompt)
    }
    setStep(1)
  }

  const handleRestore = (version: PromptVersion) => {
    // 历史版本可能是无分段格式的纯文本（如快速润色结果），silent 解析后兜底
    if (!applyResult(version.content, `回溯至 ${version.timestamp}`, true) && version.content.trim()) {
      setOptimizedPrompt(version.content)
      setStylesCaption(version.content)
      setEditedStyles(version.content)
      setShowOptimized(true)
    }
    setShowHistory(false)
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl text-gold font-bold mb-2">提示词创作</h2>
        <p className="text-rice-dark text-sm">描述你的创意，AI 将生成 MiniMax 音乐网页版可直接使用的结构化元标签与风格描述</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SectionCard title="创意描述">
            <textarea
              className="w-full h-32 bg-ink border border-gold/20 rounded-lg p-4 text-rice placeholder:text-rice-dark/50 focus:outline-none focus:border-gold/50 resize-none"
              placeholder="描述你想要创作的古风音乐，如：写一首以匠心传承为主题的古风歌，古筝与笛子对答，副歌大气磅礴..."
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                className="px-6 py-2.5 bg-gold hover:bg-gold-light text-ink rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleOptimize}
                disabled={!originalPrompt.trim() || loading}
              >
                {loading ? '优化中...' : '生成 MiniMax 提示词'}
              </button>
              <button
                className="px-6 py-2.5 border border-gold/40 text-gold hover:bg-gold/10 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleQuickSuggest}
                disabled={!originalPrompt.trim() && !editedStyles.trim() || loading}
              >
                快速润色
              </button>
            </div>
          </SectionCard>

          {showOptimized && (
            <OptimizedEditor
              meta={editedMeta}
              styles={editedStyles}
              onMetaChange={setEditedMeta}
              onStylesChange={setEditedStyles}
            />
          )}

          <div className="flex justify-end">
            <button
              className="px-8 py-3 bg-vermilion hover:bg-vermilion-light text-rice rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirm}
              disabled={!originalPrompt.trim() || loading}
            >
              确认提示词，进入歌词创作
            </button>
          </div>
        </div>

        <PromptSidebar
          prompt={finalPrompt || originalPrompt}
          versionCount={promptVersions.length}
          onOpenHistory={() => setShowHistory(true)}
        />
      </div>

      <PromptHistoryDrawer
        open={showHistory}
        onClose={() => setShowHistory(false)}
        versions={promptVersions}
        onRestore={handleRestore}
      />
    </div>
  )
}
