import { useState, useEffect } from 'react'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [deepseekKey, setDeepseekKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDeepseekKey(localStorage.getItem('deepseek_api_key') || '')
      setSaved(false)
      setSaveError(null)
    }
  }, [open])

  const handleSave = async () => {
    localStorage.setItem('deepseek_api_key', deepseekKey)
    // file:// 打包态下相对路径失效，与 api.ts 保持同一回退逻辑
    const base = window.location.protocol === 'file:' ? 'http://127.0.0.1:8000/api' : '/api'
    try {
      const resp = await fetch(`${base}/settings/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deepseek_api_key: deepseekKey,
        }),
      })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      setSaveError(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // 保存失败必须如实提示，不得显示"已保存"（此前缺陷会误导排查方向）
      setSaved(false)
      setSaveError('保存失败：后端服务未就绪，请确认服务已启动后重试')
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-ink-light border border-gold/30 rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gold text-lg font-medium">设置</h3>
            <button
              className="text-rice-dark hover:text-rice text-lg transition-colors"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-rice text-sm mb-2">DeepSeek API Key</label>
              <input
                type="password"
                className="w-full bg-ink border border-gold/20 rounded-lg px-4 py-2.5 text-rice placeholder:text-rice-dark/50 focus:outline-none focus:border-gold/50 text-sm"
                placeholder="输入 DeepSeek API Key（V2 起唯一大模型依赖）"
                value={deepseekKey}
                onChange={(e) => setDeepseekKey(e.target.value)}
              />
              <p className="text-rice-dark text-xs mt-2 leading-relaxed">
                用于提示词优化、歌词生成、快速润色三处调用。推荐使用 <code className="text-gold">deepseek-v4-pro</code> 等级的 Key，输出更稳定。
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            {saveError && (
              <span className="text-vermilion-light text-sm">{saveError}</span>
            )}
            {saved && (
              <span className="text-green-400 text-sm">已保存</span>
            )}
            <button
              className="px-5 py-2 border border-gold/30 text-gold hover:bg-gold/10 rounded-lg text-sm transition-colors"
              onClick={onClose}
            >
              取消
            </button>
            <button
              className="px-5 py-2 bg-gold hover:bg-gold-light text-ink rounded-lg text-sm font-medium transition-colors"
              onClick={handleSave}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
