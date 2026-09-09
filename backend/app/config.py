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

    # 运行时密钥持久化文件（设置面板保存的 Key 写入此处，重启自动恢复；
    # 已加入 .gitignore，绝不入库）
    SECRETS_PATH: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".secrets.json")


settings = Settings()


def load_saved_keys() -> dict:
    """读取设置面板保存的密钥文件（环境变量优先，文件兜底）

    返回 {"deepseek_api_key": str|None, "qwen_api_key": str|None}
    """
    import json
    result = {"deepseek_api_key": None, "qwen_api_key": None}
    try:
        with open(settings.SECRETS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        for k in result:
            v = data.get(k)
            if v:
                result[k] = v
    except FileNotFoundError:
        pass
    except Exception:
        pass  # 文件损坏时静默降级为未配置，不阻断启动
    return result


def save_keys_to_disk(deepseek_api_key: str = None, qwen_api_key: str = None):
    """将设置面板保存的密钥写入本地文件（覆盖式，None 表示清除对应项）"""
    import json
    data = load_saved_keys()
    if deepseek_api_key is not None:
        data["deepseek_api_key"] = deepseek_api_key
    if qwen_api_key is not None:
        data["qwen_api_key"] = qwen_api_key
    with open(settings.SECRETS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
