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
  currentStep: number
  sessionId: string

  originalPrompt: string
  optimizedPrompt: string
  metaTags: string
  stylesCaption: string
  finalPrompt: string
  promptVersions: PromptVersion[]

  generatedLyrics: string
  finalLyrics: string
  instrumental: boolean

  // ---- 本地曲谱/MIDI 兜底管线（P1 备用，主流程不经过）----
  scorePrompt: string
  optimizedScorePrompt: string
  selectedInstrument: '钢琴' | '古筝' | '小提琴'
  vocalAbc: string
  instrumentAbc: string
  scorePromptVersions: PromptVersion[]

  midiUrl: string

  loading: boolean
  error: string | null

  setStep: (step: number) => void
  setOriginalPrompt: (prompt: string) => void
  setOptimizedPrompt: (prompt: string) => void
  setMetaTags: (tags: string) => void
  setStylesCaption: (caption: string) => void
  setFinalPrompt: (prompt: string) => void
  addPromptVersion: (version: PromptVersion) => void
  setGeneratedLyrics: (lyrics: string) => void
  setFinalLyrics: (lyrics: string) => void
  setInstrumental: (instrumental: boolean) => void
  setScorePrompt: (prompt: string) => void
  setOptimizedScorePrompt: (prompt: string) => void
  setSelectedInstrument: (instrument: '钢琴' | '古筝' | '小提琴') => void
  setVocalAbc: (abc: string) => void
  setInstrumentAbc: (abc: string) => void
  addScorePromptVersion: (version: PromptVersion) => void
  setMidiUrl: (url: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  currentStep: 0,
  sessionId: '',
  originalPrompt: '',
  optimizedPrompt: '',
  metaTags: '',
  stylesCaption: '',
  finalPrompt: '',
  promptVersions: [] as PromptVersion[],
  generatedLyrics: '',
  finalLyrics: '',
  instrumental: false,
  scorePrompt: '',
  optimizedScorePrompt: '',
  selectedInstrument: '钢琴' as const,
  vocalAbc: '',
  instrumentAbc: '',
  scorePromptVersions: [] as PromptVersion[],
  midiUrl: '',
  loading: false,
  error: null as string | null,
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      setOriginalPrompt: (prompt) => set({ originalPrompt: prompt }),
      setOptimizedPrompt: (prompt) => set({ optimizedPrompt: prompt }),
      setMetaTags: (tags) => set({ metaTags: tags }),
      setStylesCaption: (caption) => set({ stylesCaption: caption }),
      setFinalPrompt: (prompt) => set({ finalPrompt: prompt }),
      addPromptVersion: (version) =>
        set((state) => ({ promptVersions: [...state.promptVersions, version] })),
      setGeneratedLyrics: (lyrics) => set({ generatedLyrics: lyrics }),
      setFinalLyrics: (lyrics) => set({ finalLyrics: lyrics }),
      setInstrumental: (instrumental) => set({ instrumental }),
      setScorePrompt: (prompt) => set({ scorePrompt: prompt }),
      setOptimizedScorePrompt: (prompt) => set({ optimizedScorePrompt: prompt }),
      setSelectedInstrument: (instrument) => set({ selectedInstrument: instrument }),
      setVocalAbc: (abc) => set({ vocalAbc: abc }),
      setInstrumentAbc: (abc) => set({ instrumentAbc: abc }),
      addScorePromptVersion: (version) =>
        set((state) => ({ scorePromptVersions: [...state.scorePromptVersions, version] })),
      setMidiUrl: (url) => set({ midiUrl: url }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set({ ...initialState, sessionId: crypto.randomUUID() }),
    }),
    {
      name: 'guyun-music-store',
    }
  )
)
