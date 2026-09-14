import { useState } from 'react'
import type { ReactNode } from 'react'
import StepIndicator from './StepIndicator'
import SettingsModal from '../settings/SettingsModal'
import { MINIMAX_MUSIC_URL } from '../../constants/limits'
import { openExternal } from '../../utils/external'

interface AppLayoutProps {
  children: ReactNode
  currentStep: number
}

export default function AppLayout({ children, currentStep }: AppLayoutProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="min-h-screen bg-ink text-rice flex flex-col">
      <header className="border-b border-gold/30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gold tracking-wider">
            古韵AI — 古风音乐提示词工坊
          </h1>
          <div className="flex items-center gap-2">
            <button
              className="px-3 h-9 flex items-center gap-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-sm"
              onClick={() => openExternal(MINIMAX_MUSIC_URL)}
              title="在系统默认浏览器中打开 MiniMax 音乐创作页"
            >
              🎵 MiniMax
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
              onClick={() => setShowSettings(true)}
              title="设置"
            >
              ⚙
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-gold/20 px-6 py-3">
        <div className="max-w-5xl mx-auto">
          <StepIndicator currentStep={currentStep} />
        </div>
      </nav>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="border-t border-gold/20 px-6 py-3 text-center text-rice-dark text-xs">
        古韵AI © 2026 — 古风音乐提示词生成工具 · 输出适配 MiniMax Music
      </footer>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}
