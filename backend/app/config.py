import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # ---- DeepSeek ----
    # 官方口径（api-docs.deepseek.com，2026-09 核实）：
    #   deepseek-chat / deepseek-reasoner 已于 2026-07-24 15:59 UTC 退役，调用会直接报错
    #   现行名称为 deepseek-v4-pro（强推理，贵约 3 倍）/ deepseek-v4-flash（通用，性价比高）
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_PRO_MODEL: str = os.getenv("DEEPSEEK_PRO_MODEL", "deepseek-v4-pro")
    DEEPSEEK_FLASH_MODEL: str = os.getenv("DEEPSEEK_FLASH_MODEL", "deepseek-v4-flash")
    DEEPSEEK_API_BASE_URL: str = "https://api.deepseek.com"
    # v4 系列默认开启思考模式，创作类任务无需链式推理，关闭可显著降低延迟与输出噪声
    DEEPSEEK_DISABLE_THINKING: bool = os.getenv("DEEPSEEK_DISABLE_THINKING", "true").lower() == "true"

    # ---- 通义千问（阿里云百炼 OpenAI 兼容模式）----
    # qwen-plus 仍在官方支持列表内（Batch / Responses 文档均列出），保持该长期兼容名
    QWEN_API_KEY: str = os.getenv("QWEN_API_KEY", "")
    QWEN_MODEL: str = os.getenv("QWEN_MODEL", "qwen-plus")
    QWEN_API_BASE_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "ai_music.db")
    OUTPUT_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")


settings = Settings()
