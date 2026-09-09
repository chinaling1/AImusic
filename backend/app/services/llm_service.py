# -*- coding: utf-8 -*-
"""大模型调用服务

职责边界：只负责「怎么调模型」，不负责「调什么提示词」。
所有 system prompt 集中在 app/prompts/prompt_library.py。

对外方法（签名与行为保持不变）：
- call_deepseek_pro / call_deepseek_flash / call_qwen
- optimize_prompt / generate_lyrics / quick_suggest
- optimize_score_prompt / generate_score（P1 兜底管线）
"""
from openai import AsyncOpenAI

from app.config import settings
from app.prompts import prompt_library


class LLMService:
    def __init__(self):
        self._deepseek_key = settings.DEEPSEEK_API_KEY
        self._qwen_key = settings.QWEN_API_KEY
        self.deepseek_client = self._build_client(self._deepseek_key, settings.DEEPSEEK_API_BASE_URL)
        self.qwen_client = self._build_client(self._qwen_key, settings.QWEN_API_BASE_URL)

    @staticmethod
    def _build_client(api_key: str, base_url: str) -> AsyncOpenAI:
        """构建 OpenAI 兼容客户端

        timeout 显式设为 300 秒：歌词生成属长输出任务，需留出充足时间，
        同时避免无限等待导致前端长期挂起。
        """
        return AsyncOpenAI(api_key=api_key, base_url=base_url, timeout=300.0)

    def update_keys(self, deepseek_key: str = None, qwen_key: str = None):
        if deepseek_key:
            self._deepseek_key = deepseek_key
            self.deepseek_client = self._build_client(
                self._deepseek_key, settings.DEEPSEEK_API_BASE_URL)
        if qwen_key:
            self._qwen_key = qwen_key
            self.qwen_client = self._build_client(self._qwen_key, settings.QWEN_API_BASE_URL)

    # ---------------- 底层调用 ----------------

    async def _chat(self, client: AsyncOpenAI, model: str, prompt: str,
                    system_prompt: str = "", **kwargs) -> str:
        """统一的对话调用（拼装消息 + 透传模型参数）"""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        # v4 系列默认开启思考模式；创作类任务不需要链式推理，关闭以降低延迟与输出噪声
        if client is self.deepseek_client and settings.DEEPSEEK_DISABLE_THINKING:
            kwargs.setdefault("extra_body", {"thinking": {"type": "disabled"}})

        response = await client.chat.completions.create(model=model, messages=messages, **kwargs)
        return response.choices[0].message.content

    async def call_deepseek_pro(self, prompt: str, system_prompt: str = "") -> str:
        return await self._chat(self.deepseek_client, settings.DEEPSEEK_PRO_MODEL,
                                prompt, system_prompt)

    async def call_deepseek_flash(self, prompt: str, system_prompt: str = "") -> str:
        return await self._chat(self.deepseek_client, settings.DEEPSEEK_FLASH_MODEL,
                                prompt, system_prompt, max_tokens=2048, temperature=0.3)

    async def call_qwen(self, prompt: str, system_prompt: str = "") -> str:
        return await self._chat(self.qwen_client, settings.QWEN_MODEL, prompt, system_prompt)

    # ---------------- 主流程：提示词与歌词 ----------------

    async def optimize_prompt(self, user_prompt: str, step: str = "prompt") -> str:
        """生成 MiniMax 结构化元标签 + 风格描述"""
        return await self.call_deepseek_pro(user_prompt, prompt_library.OPTIMIZE_PROMPT)

    async def generate_lyrics(self, prompt: str, style: str = "古风") -> str:
        """生成 MiniMax 结构标签格式歌词

        style 参数由前端拼装，形如「古风；押韵偏好：ang韵」或「纯音乐意境...」。
        这里根据是否为纯音乐模式追加不同的约束指令。
        """
        is_instrumental = "纯音乐" in style
        extra = (prompt_library.LYRICS_INSTRUMENTAL_EXTRA if is_instrumental
                 else prompt_library.LYRICS_VOCAL_EXTRA)
        system_prompt = prompt_library.LYRICS_PROMPT.format(style=style, extra=extra)
        return await self.call_deepseek_pro(prompt, system_prompt)

    async def quick_suggest(self, text: str, context: str = "") -> str:
        """轻量润色建议"""
        full_prompt = (f"上下文：{context}\n请对以下内容提供简短修改建议：{text}"
                       if context else f"请对以下内容提供简短修改建议：{text}")
        return await self.call_deepseek_flash(full_prompt, prompt_library.QUICK_SUGGEST_PROMPT)

    # ---------------- P1 兜底：曲谱生成 ----------------

    async def optimize_score_prompt(self, user_prompt: str) -> str:
        """优化曲谱描述（兜底管线）"""
        return await self.call_qwen(user_prompt, prompt_library.SCORE_PROMPT_OPTIMIZE)

    async def generate_score(self, lyrics: str, score_prompt: str,
                             instrument: str = "钢琴") -> str:
        """生成 ABC 记谱法曲谱（兜底管线）"""
        system_prompt = prompt_library.SCORE_PROMPT_GENERATE.format(instrument=instrument)
        full_prompt = f"歌词：\n{lyrics}\n\n曲谱指令：\n{score_prompt}"
        return await self.call_qwen(full_prompt, system_prompt)


llm_service = LLMService()
