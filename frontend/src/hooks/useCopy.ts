import { useCallback, useEffect, useRef, useState } from 'react'

/** 复制成功提示的持续时间（毫秒） */
const FEEDBACK_DURATION = 1500

/** 写入剪贴板；navigator.clipboard 不可用时（非 HTTPS / 旧浏览器）降级为隐藏 textarea */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  }
}

/**
 * 复制逻辑 hook：返回当前处于「已复制」状态的键与复制方法。
 * 同页面多个复制按钮共用一个 hook，保证同一时刻只有一个按钮显示成功反馈。
 */
export function useCopy(duration: number = FEEDBACK_DURATION) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  // 卸载时清理定时器，避免在已卸载组件上 setState
  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    []
  )

  const copy = useCallback(
    async (key: string, text: string) => {
      if (!text.trim()) return
      const ok = await copyText(text)
      if (!ok) return
      setCopiedKey(key)
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setCopiedKey(null), duration)
    },
    [duration]
  )

  return { copiedKey, copy }
}
