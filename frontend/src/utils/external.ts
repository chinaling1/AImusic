/**
 * 跨端打开外部链接工具。
 *
 * - 桌面态（Electron）：通过 preload 暴露的 IPC 调主进程 shell.openExternal，
 *   走系统默认浏览器，不会再开一个 BrowserWindow 抢夺焦点。
 * - 浏览器态：走 window.open，加 noopener 安全头，避免新窗口反向控制当前页。
 *
 * 该函数对调用方完全无副作用——失败也仅返回 false，不抛异常。
 */

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean
      platform: string
      /** 后端实际监听端口，由 Electron 主进程经 preload 注入；0 表示未注入 */
      backendPort?: number
      openExternal?: (url: string) => Promise<boolean>
    }
  }
}

export function openExternal(url: string): boolean {
  if (!url) return false
  // 桌面态：优先 IPC（系统默认浏览器）
  if (typeof window !== 'undefined' && window.electronAPI?.openExternal) {
    void window.electronAPI.openExternal(url)
    return true
  }
  // 浏览器态：window.open 兜底
  if (typeof window !== 'undefined') {
    const w = window.open(url, '_blank', 'noopener,noreferrer')
    return !!w
  }
  return false
}
