import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PromptVersion {
  id: string
  step: 'prompt' | 'score'
  type: 'original' | 'ai_optimized' | 'human_modified' | 'restored'
  content: string
  timestamp: string
  parentVersionId: string | null
  note?: string
}

interface MusicState {
  // ---- 全局 ----
  currentStep: number
  sessionId: string
  loading: boolean
  error: string | null

  // ---- 提示词链路（步骤①）----
  originalPrompt: string
  optimizedPrompt: string
  /** 结构化元标签（Structured Caption），创作过程存档用 */
  metaTags: string
  /** 风格描述，粘贴到 MiniMax 的 Styles 输入框 */
  stylesCaption: string
  finalPrompt: string
  promptVersions: PromptVersion[]

  // ---- 歌词链路（步骤②）----
  generatedLyrics: string
  finalLyrics: string
  instrumental: boolean

  // ---- 全局 ----
  setStep: (step: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void

  // ---- 提示词链路 ----
  setOriginalPrompt: (prompt: string) => void
  setOptimizedPrompt: (prompt: string) => void
  setMetaTags: (tags: string) => void
  setStylesCaption: (caption: string) => void
  setFinalPrompt: (prompt: string) => void
  addPromptVersion: (version: PromptVersion) => void

  // ---- 歌词链路 ----
  setGeneratedLyrics: (lyrics: string) => void
  setFinalLyrics: (lyrics: string) => void
  setInstrumental: (instrumental: boolean) => void
}

/** 持久化到 localStorage 的状态（loading / error 为瞬时状态，不写入） */
type PersistedMusicState = Omit<MusicState, 'loading' | 'error'>

/** 生成一份初始状态，每次调用都会开一个新的会话 ID */
function createInitialState() {
  return {
    currentStep: 0,
    sessionId: crypto.randomUUID(),
    loading: false,
    error: null as string | null,

    originalPrompt: '',
    optimizedPrompt: '',
    metaTags: '',
    stylesCaption: '',
    finalPrompt: '',
    promptVersions: [] as PromptVersion[],

    generatedLyrics: '',
    finalLyrics: '',
    instrumental: false,
  }
}

/** 已从主流程移除的兜底管线字段，迁移时清理历史 localStorage 残留 */
const LEGACY_SCORE_KEYS = [
  'scorePrompt',
  'optimizedScorePrompt',
  'selectedInstrument',
  'vocalAbc',
  'instrumentAbc',
  'scorePromptVersions',
  'midiUrl',
] as const

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      ...createInitialState(),

      // ---- 全局 ----
      setStep: (step) => set({ currentStep: step }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      // 重置保留当前会话标识以外的全部内容，并开一个新的会话
      reset: () => set({ ...createInitialState() }),

      // ---- 提示词链路 ----
      setOriginalPrompt: (prompt) => set({ originalPrompt: prompt }),
      setOptimizedPrompt: (prompt) => set({ optimizedPrompt: prompt }),
      setMetaTags: (tags) => set({ metaTags: tags }),
      setStylesCaption: (caption) => set({ stylesCaption: caption }),
      setFinalPrompt: (prompt) => set({ finalPrompt: prompt }),
      addPromptVersion: (version) =>
        set((state) => ({ promptVersions: [...state.promptVersions, version] })),

      // ---- 歌词链路 ----
      setGeneratedLyrics: (lyrics) => set({ generatedLyrics: lyrics }),
      setFinalLyrics: (lyrics) => set({ finalLyrics: lyrics }),
      setInstrumental: (instrumental) => set({ instrumental }),
    }),
    {
      name: 'guyun-music-store',
      version: 1,
      // loading / error 属于瞬时状态，不持久化，避免刷新后残留错误横幅
      partialize: (state): PersistedMusicState => {
        const { loading: _loading, error: _error, ...persisted } = state
        return persisted
      },
      migrate: (persisted): PersistedMusicState => {
        const state = (persisted || {}) as Record<string, unknown>
        // 清理本次重构移除的兜底管线字段
        for (const key of LEGACY_SCORE_KEYS) delete state[key]
        return state as unknown as PersistedMusicState
      },
      // 老数据里 sessionId 可能为空字符串，回灌一个新的
      onRehydrateStorage: () => (state) => {
        if (state && !state.sessionId) {
          state.sessionId = crypto.randomUUID()
        }
      },
    }
  )
)
