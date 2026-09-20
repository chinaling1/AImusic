import { useEffect } from 'react'
import AppLayout from './components/layout/AppLayout'
import { useMusicStore } from './store/musicStore'
import PromptStep from './components/step1/PromptStep'
import LyricStep from './components/step2/LyricStep'
import ExportStep from './components/step3/ExportStep'

const stepComponents = [PromptStep, LyricStep, ExportStep]

export default function App() {
  const { currentStep, loading, error, setStep } = useMusicStore()
  const StepComponent = stepComponents[currentStep] || PromptStep

  // 允许通过 URL ?step=N (0/1/2) 切换步骤，方便演示/截图工具跳转
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stepParam = params.get('step')
    if (stepParam !== null) {
      const n = Number(stepParam)
      if (Number.isInteger(n) && n >= 0 && n < stepComponents.length) {
        setStep(n)
      }
    }
  }, [setStep])

  return (
    <AppLayout currentStep={currentStep}>
      {error && (
        <div className="mb-4 p-4 bg-vermilion/20 border border-vermilion/50 rounded-lg text-vermilion-light text-sm">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-4 p-4 bg-gold/10 border border-gold/30 rounded-lg text-gold text-sm text-center">
          正在处理中，请稍候...
        </div>
      )}
      <StepComponent />
    </AppLayout>
  )
}