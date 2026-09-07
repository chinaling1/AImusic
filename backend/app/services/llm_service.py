from openai import AsyncOpenAI
from app.config import settings


class LLMService:
    def __init__(self):
        self._deepseek_key = settings.DEEPSEEK_API_KEY
        self._qwen_key = settings.QWEN_API_KEY
        self.deepseek_client = AsyncOpenAI(
            api_key=self._deepseek_key,
            base_url=settings.DEEPSEEK_API_BASE_URL,
        )
        self.qwen_client = AsyncOpenAI(
            api_key=self._qwen_key,
            base_url=settings.QWEN_API_BASE_URL,
        )

    def update_keys(self, deepseek_key: str = None, qwen_key: str = None):
        if deepseek_key:
            self._deepseek_key = deepseek_key
            self.deepseek_client = AsyncOpenAI(
                api_key=self._deepseek_key,
                base_url=settings.DEEPSEEK_API_BASE_URL,
            )
        if qwen_key:
            self._qwen_key = qwen_key
            self.qwen_client = AsyncOpenAI(
                api_key=self._qwen_key,
                base_url=settings.QWEN_API_BASE_URL,
            )

    async def call_deepseek_pro(self, prompt: str, system_prompt: str = "") -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.deepseek_client.chat.completions.create(
            model=settings.DEEPSEEK_PRO_MODEL,
            messages=messages,
        )
        return response.choices[0].message.content

    async def call_deepseek_flash(self, prompt: str, system_prompt: str = "") -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.deepseek_client.chat.completions.create(
            model=settings.DEEPSEEK_FLASH_MODEL,
            messages=messages,
            max_tokens=256,
            temperature=0.3,
        )
        return response.choices[0].message.content

    async def call_qwen(self, prompt: str, system_prompt: str = "") -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.qwen_client.chat.completions.create(
            model=settings.QWEN_MODEL,
            messages=messages,
        )
        return response.choices[0].message.content

    async def optimize_prompt(self, user_prompt: str, step: str = "prompt") -> str:
        """使用DeepSeek Pro优化提示词"""
        system_prompt = """你是一位专业的古风音乐创作顾问。你的任务是将用户提供的音乐创作描述优化为专业、精确的创作提示词。
优化要求：
1. 补充古风音乐专业术语（如：宫调式、羽调式、五声音阶等）
2. 明确音乐结构（前奏-主歌-副歌-间奏-尾奏）
3. 细化情感层次和意境描述
4. 指定节奏特征（如：慢板、中板、快板）
5. 描述配器建议（古筝、钢琴、小提琴等）
6. 保持用户原始意图，仅做专业化扩展
请直接输出优化后的提示词，不要解释。"""
        return await self.call_deepseek_pro(user_prompt, system_prompt)

    async def generate_lyrics(self, prompt: str, style: str = "古风") -> str:
        """使用DeepSeek Pro生成歌词"""
        system_prompt = f"""你是一位古风歌词创作大师。根据提示词创作古风歌词。
要求：
1. 使用{style}风格
2. 歌词结构：主歌-副歌-主歌-副歌-桥段-副歌
3. 每行歌词前标注时间戳，格式：[MM:SS.xx]
4. 使用古风意象和修辞手法
5. 押韵工整，意境深远
6. 在歌词前用[段落标记]标注结构（如[主歌1][副歌]等）

输出格式示例：
[主歌1]
[00:00.00]第一行歌词
[00:04.50]第二行歌词
[副歌]
[00:12.00]副歌第一行
..."""
        return await self.call_deepseek_pro(prompt, system_prompt)

    async def quick_suggest(self, text: str, context: str = "") -> str:
        """使用DeepSeek Flash提供快速建议"""
        system_prompt = """你是音乐创作助手，提供简短的修改建议。只输出建议内容，不超过50字。"""
        full_prompt = f"上下文：{context}\n请对以下内容提供简短修改建议：{text}" if context else f"请对以下内容提供简短修改建议：{text}"
        return await self.call_deepseek_flash(full_prompt, system_prompt)

    async def optimize_score_prompt(self, user_prompt: str) -> str:
        """使用千问优化曲谱提示词"""
        system_prompt = """你是一位专业的音乐理论家和曲谱编排专家。将用户的曲谱描述优化为专业的音乐创作指令。
优化要求：
1. 使用专业音乐术语（调性、拍号、速度、力度等）
2. 明确人声旋律线的特征
3. 指定伴奏织体类型（柱式和弦、分解和弦、琶音等）
4. 标注调式（如C宫调式、D羽调式等五声调式）
5. 描述各乐器的演奏技法和音区
请直接输出优化后的曲谱创作指令。"""
        return await self.call_qwen(user_prompt, system_prompt)

    async def generate_score(self, lyrics: str, score_prompt: str, instrument: str = "钢琴") -> str:
        """使用千问生成ABC记谱法曲谱"""
        system_prompt = f"""你是一位精通ABC记谱法的专业作曲家。根据歌词和曲谱指令创作古风音乐的ABC记谱法曲谱。

要求：
1. 生成两个独立的ABC曲谱：人声音轨（vocal）和{instrument}伴奏音轨
2. 使用五声音阶（宫商角徵羽）创作旋律
3. 人声音轨包含歌词对齐（使用w:字段）
4. {instrument}音轨使用适合的伴奏织体
5. 标注调性、拍号、速度

输出格式：
===人声音轨===
X:1
T:人声旋律
M:4/4
L:1/8
Q:1/4=72
K:C
[ABC记谱法人声旋律]

w:歌词对齐

==={instrument}音轨===
X:2
T:{instrument}伴奏
M:4/4
L:1/8
Q:1/4=72
K:C
[ABC记谱法{instrument}伴奏]"""
        full_prompt = f"歌词：\n{lyrics}\n\n曲谱指令：\n{score_prompt}"
        return await self.call_qwen(full_prompt, system_prompt)


llm_service = LLMService()
