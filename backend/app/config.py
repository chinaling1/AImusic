import os
import sys

from dotenv import load_dotenv

load_dotenv()


def _persistent_base_dir() -> str:
    """返回持久化数据的基准目录。

    注意：PyInstaller --onefile 打包后，__file__ 指向的是临时解压目录
    （形如 %TEMP%\\_MEIxxxxxx，进程退出即被清理）。若据此落盘，
    用户在设置面板保存的 API Key、以及导出的音频会在每次重启后丢失。
    因此冻结态（frozen）改用可执行文件自身所在目录作为基准。

    开发态保持原有行为（backend/app 目录），不影响本地调试。
    """
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


class Settings:
    # ---- DeepSeek（V2 起唯一外部 LLM 依赖）----
    # 官方口径（api-docs.deepseek.com，2026-09 核实）：
    #   deepseek-chat / deepseek-reasoner 已于 2026-07-24 15:59 UTC 退役，调用会直接报错
    #   现行名称为 deepseek-v4-pro（强推理，贵约 3 倍）/ deepseek-v4-flash（通用，性价比高）
    # 任务路由：
    #   - Pro：提示词优化、歌词生成（需中文长文本与结构化输出）
    #   - Flash：曲谱 prompt 优化、曲谱生成（兜底管线）、快速润色（短输出）
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_PRO_MODEL: str = os.getenv("DEEPSEEK_PRO_MODEL", "deepseek-v4-pro")
    DEEPSEEK_FLASH_MODEL: str = os.getenv("DEEPSEEK_FLASH_MODEL", "deepseek-v4-flash")
    DEEPSEEK_API_BASE_URL: str = "https://api.deepseek.com"
    # v4 系列默认开启思考模式，创作类任务无需链式推理，关闭可显著降低延迟与输出噪声
    DEEPSEEK_DISABLE_THINKING: bool = os.getenv("DEEPSEEK_DISABLE_THINKING", "true").lower() == "true"

    # 数据库仍使用相对路径（相对进程工作目录），保持既有部署行为不变；
    # Electron 拉起后端时 cwd = resources/backend，数据库即落在该目录。
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "ai_music.db")
    OUTPUT_DIR: str = os.path.join(_persistent_base_dir(), "output")

    # 运行时密钥持久化文件（设置面板保存的 Key 写入此处，重启自动恢复；
    # 已加入 .gitignore，绝不入库）
    SECRETS_PATH: str = os.path.join(_persistent_base_dir(), ".secrets.json")


settings = Settings()


def load_saved_keys() -> dict:
    """读取设置面板保存的密钥文件（环境变量优先，文件兜底）

    返回 {"deepseek_api_key": str|None}
    """
    import json
    result = {"deepseek_api_key": None}
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


def save_keys_to_disk(deepseek_api_key: str = None):
    """将设置面板保存的密钥写入本地文件（覆盖式，None 表示清除对应项）"""
    import json
    data = load_saved_keys()
    if deepseek_api_key is not None:
        data["deepseek_api_key"] = deepseek_api_key
    with open(settings.SECRETS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
