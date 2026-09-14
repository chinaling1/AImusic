# -*- coding: utf-8 -*-
"""古韵AI 后端入口

路由分组：
- /api/prompt   提示词优化与版本历史（主流程第 1 步）
- /api/lyric    歌词生成（主流程第 2 步）
- /api/minimax  MiniMax 格式校验与格式规格（主流程第 3 步，确定性算法）
- /api/score    ABC 曲谱生成（P1 兜底，主流程不使用）
- /api/midi     MIDI 转换（P1 兜底，主流程不使用）
- /api/settings 运行时密钥配置
"""
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional

from app.database import init_db
from app.config import load_saved_keys, save_keys_to_disk
from app.routers import prompt, lyric, score, midi, minimax
from app.services.llm_service import llm_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：密钥回填 + 建库 + 记录启动耗时"""
    started = time.perf_counter()
    # 密钥回填优先级：环境变量 > 设置面板保存的文件。环境变量已配置时不用文件覆盖，
    # 避免文件中的旧值/测试值压掉环境配置
    saved = load_saved_keys()
    if not llm_service._deepseek_key and saved["deepseek_api_key"]:
        llm_service.update_keys(deepseek_key=saved["deepseek_api_key"])
    await init_db()
    print(f"[启动] 数据库就绪，耗时 {time.perf_counter() - started:.2f}s")
    yield


app = FastAPI(title="古韵AI — MiniMax 提示词工坊", version="2.0.0", lifespan=lifespan)

# CORS：本地桌面应用。
# - 开发态：Vite(5173) 经代理转发，浏览器同源无跨域
# - 打包态：Electron loadFile(file://) 的 Origin 为字符串 "null"
# 注意：仅允许本地来源，不再放行 "*"（此前为 "*" + credentials 非法组合）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "null",  # Electron 打包态 file:// 页面发起请求时的 Origin
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 主流程路由
app.include_router(prompt.router)
app.include_router(lyric.router)
app.include_router(minimax.router)

# P1 兜底管线路由（本地曲谱/MIDI，主流程不经过，保留以保持接口兼容）
app.include_router(score.router)
app.include_router(midi.router)


class ApiKeyRequest(BaseModel):
    deepseek_api_key: Optional[str] = None


@app.post("/api/settings/keys")
async def update_api_keys(request: ApiKeyRequest):
    """更新大模型密钥：内存立即生效 + 本地文件持久化（重启自动恢复）"""
    llm_service.update_keys(deepseek_key=request.deepseek_api_key)
    # 至少提供了一个 Key 才落盘（避免空请求覆盖已有配置）
    if request.deepseek_api_key:
        save_keys_to_disk(request.deepseek_api_key)
    return {"status": "ok"}


@app.get("/api/settings/keys/status")
async def check_api_keys_status():
    """查询密钥配置状态（不返回密钥内容）"""
    return {
        "deepseek_configured": bool(llm_service._deepseek_key),
    }


@app.get("/")
async def root():
    return {"message": "AI音乐生成后端服务"}


if __name__ == "__main__":
    import uvicorn
    import sys
    # 启动前预检端口，避免用户在「双击 EXE」时撞上残留进程闪退看不到原因
    try:
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind(("0.0.0.0", 8000))
    except OSError as exc:
        # winerror 10048 = 端口占用；其他系统 errno 98 同义
        print("=" * 60, file=sys.stderr)
        print(f"[FATAL] 端口 8000 被占用，EXE 无法启动。", file=sys.stderr)
        print(f"  原因：{exc}", file=sys.stderr)
        print("  解决：", file=sys.stderr)
        print("    1) 任务管理器结束残留的 gu-yun-backend.exe", file=sys.stderr)
        print("    2) 或在 PowerShell 执行：", file=sys.stderr)
        print("       Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess", file=sys.stderr)
        print("       Stop-Process -Id <PID> -Force", file=sys.stderr)
        print("    3) 然后重新运行本 EXE", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        sys.exit(1)
    uvicorn.run(app, host="0.0.0.0", port=8000)
