const API_BASE = '/api'

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
