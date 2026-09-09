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
        """将用户想法转化为 MiniMax 音乐网页版可直接使用的提示词：
        结构化元标签（Structured Caption）+ 风格描述（Styles 描述）"""
        system_prompt = """你是一位专业的古风音乐创作顾问，精通 MiniMax Music 的提示词规范。
你的任务是将用户提供的音乐创作想法，转化为可直接粘贴到 MiniMax 音乐网页版的提示词。

输出必须严格分为两段，用以下标记分隔（标记行原样输出，不要加任何其他说明文字）：

===META===
（结构化元标签，每行一个，格式为 [标签名] 值，必须包含全部六项：）
[Genre] 曲风（古风 + 具体融合风格，如：古风流行、国风电子、民谣古风）
[BPM] 速度（如：68 BPM，古风多为慢板 60-80）
[Key] 调性（如：D 羽调式 / A 宫五声调式）
[Vocals] 人声（性别、音色、唱法，如：女声，清亮婉转，副歌加和声）
[Instruments] 乐器（3-6 件，古筝/笛箫/琵琶/古琴/钢琴/弦乐等，主奏在前）
[Arrangement] 编曲走向（一段话描述起承转合：前奏意境 → 主歌铺垫 → 副歌情绪爆发 → 桥段转折 → 尾奏收束）

===STYLES===
（风格描述，一段连贯中文，80-200 字，供 MiniMax 的 Styles 输入框使用。
要求：点明曲风、情绪、场景意境、核心乐器、人声特质；语言具体不空泛；
不出现歌词内容；不使用换行。）

创作原则：
1. 古风专业术语准确（宫调式、羽调式、五声音阶、散板、轮指、泛音等）
2. 保持用户原始意图，仅做专业化扩展
3. 全部用中文输出（标签名保留英文方括号格式）
只输出两段内容，从 ===META=== 开始，不要任何前后缀解释。"""
        return await self.call_deepseek_pro(user_prompt, system_prompt)

    async def generate_lyrics(self, prompt: str, style: str = "古风") -> str:
        """生成 MiniMax 音乐网页版可直接粘贴的歌词：
        英文结构标签 + 标签后编曲/人声/情绪注记 + 古风正文"""
        system_prompt = f"""你是一位古风歌词创作大师。根据提示词创作可直接粘贴进 MiniMax 音乐网页版歌词框的古风歌词。

MiniMax 歌词格式硬性要求：
1. 结构标签必须用英文方括号，且独占一行。可用标签：
   [Intro] [Verse] [Verse 1] [Verse 2] [Pre-Chorus] [Chorus] [Bridge] [Interlude] [Outro] [Hook] [Solo] [Inst]
2. 标签行的紧邻下一行，可以用中文圆括号写编曲/人声/情绪注记，如：
   [Intro]
   (古筝泛音与箫声渐入，空灵悠远)
3. 正文歌词使用中文，古典意象，押韵工整，意境深远
4. 推荐结构：[Intro] → [Verse 1] → [Pre-Chorus] → [Chorus] → [Verse 2] → [Pre-Chorus] → [Chorus] → [Bridge] → [Chorus] → [Outro]
5. 全文总长控制在 1500 字符以内（MiniMax 上限 3500，留出余量）
6. 不要输出时间戳、不要用中文标签（如[主歌]）、不要解释

风格要求：{style}
只输出歌词本体，从 [Intro] 开始。"""
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
