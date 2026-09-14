/**
 * 后端基址解析。三种运行形态：
 *
 * 1. Electron 打包态（file://）：相对路径会解析为 file:///api/... 导致接口全部失效，
 *    必须使用本机绝对地址。端口由 Electron 主进程动态探测（规避 8000 被占用），
 *    经 preload 以 window.electronAPI.backendPort 注入，这里优先取注入值。
 * 2. 开发态（Vite 5173 / http 部署）：走相对路径 /api，由 Vite 代理或同源后端处理。
 * 3. 旧版打包产物未注入端口时，回退 8000 保持兼容。
 */
export function resolveApiBase(): string {
  if (typeof window === 'undefined') return '/api'
  if (window.location.protocol !== 'file:') return '/api'

  const injected = window.electronAPI?.backendPort
  const port = typeof injected === 'number' && Number.isFinite(injected) && injected > 0 ? injected : 8000
  return `http://127.0.0.1:${port}/api`
}

const API_BASE = resolveApiBase()

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers as Record<string, string> },
    ...options,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.statusText}`)
  }
  return response.json()
}

export const api = {
  optimizePrompt: (prompt: string, step: string, sessionId?: string) =>
    request('/prompt/optimize', { method: 'POST', body: JSON.stringify({ prompt, step, session_id: sessionId }) }),

  quickSuggest: (text: string, context?: string) =>
    request('/prompt/quick-suggest', { method: 'POST', body: JSON.stringify({ text, context }) }),

  getPromptHistory: (sessionId: string, step?: string) =>
    request(`/prompt/history/${sessionId}${step ? `?step=${step}` : ''}`),

  saveHumanModified: (step: string, content: string, sessionId: string, note?: string) =>
    request('/prompt/history/save', { method: 'POST', body: JSON.stringify({ step, content, session_id: sessionId, note }) }),

  generateLyrics: (prompt: string, style?: string, sessionId?: string) =>
    request('/lyric/generate', { method: 'POST', body: JSON.stringify({ prompt, style, session_id: sessionId }) }),

  // MiniMax 提示词格式校验（确定性算法，本地后端执行）
  validateMiniMax: (payload: { styles?: string; metaTags?: string; lyrics?: string; instrumental?: boolean }) =>
    request('/minimax/validate', {
      method: 'POST',
      body: JSON.stringify({ styles: payload.styles || '', meta_tags: payload.metaTags || '', lyrics: payload.lyrics || '', instrumental: payload.instrumental || false }),
    }),

  getMiniMaxFormatSpec: () =>
    request('/minimax/format-spec'),
}
