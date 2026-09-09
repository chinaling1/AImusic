/**
 * API 基址：
 * - 开发态（Vite 5173）与 http 部署：走相对路径 /api，由 Vite 代理或同源后端处理
 * - Electron 打包态（file://）：相对路径会解析为 file:///api/... 导致全部接口失效，
 *   此时回退到本机后端绝对地址（electron/main.js 会以 8000 端口拉起后端）
 */
const API_BASE =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? 'http://127.0.0.1:8000/api'
    : '/api'

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
