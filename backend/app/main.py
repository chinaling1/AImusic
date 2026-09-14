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
import sys
import time

# Windows 上 PyInstaller 打包的控制台程序，stdout/stderr 默认沿用系统 ANSI 代码页（常为 GBK）。
# Electron 主进程以管道方式读取后端输出并按 UTF-8 解码，若此处不做处理，中文日志会呈乱码，
# 直接影响启动问题的定位。
# 策略：仅在输出被重定向（非终端）时切换为 UTF-8；用户直接双击运行时保持系统编码，
# 以免 Windows 控制台（代码页 936）反而显示乱码。
if sys.stdout is not None and not sys.stdout.isatty():
    for _stream in (sys.stdout, sys.stderr):
        try:
            _stream.reconfigure(encoding="utf-8")
        except Exception:
            # 流不支持 reconfigure（如被替换为重定向对象）时保持原样，不影响主流程
            pass

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
    import os
    import socket
    import sys

    import uvicorn

    # ---------------------------------------------------------------
    # 端口决策
    #   1) Electron 主进程启动时会动态探测空闲端口并以 PORT 环境变量注入，
    #      此时必须严格使用该端口——若自行换端口，前端将指向错误地址。
    #   2) 用户直接双击 exe 独立运行时没有 PORT，默认 8000；
    #      若 8000 被残留进程占用，则向后探测一个可用端口，而不是直接退出。
    # ---------------------------------------------------------------
    raw_port = os.environ.get("PORT", "").strip()
    port_injected = raw_port != ""
    try:
        start_port = int(raw_port) if port_injected else 8000
    except ValueError:
        port_injected = False
        start_port = 8000

    def is_port_available(port: int) -> bool:
        """尝试绑定回环地址以判断端口是否可用（SO_REUSEADDR 避免 TIME_WAIT 误判）。"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(("127.0.0.1", port))
                return True
            except OSError:
                return False

    port = start_port
    if not is_port_available(port):
        if port_injected:
            # 主进程已探测为空闲，走到这里说明探测与绑定之间存在竞态
            print("=" * 60, file=sys.stderr)
            print(f"[FATAL] 主进程指定的端口 {port} 已被占用，服务无法启动。", file=sys.stderr)
            print("  请关闭占用该端口的程序后重新打开应用。", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
            sys.exit(1)

        # 独立运行场景：向后探测可用端口
        for candidate in range(start_port + 1, start_port + 21):
            if is_port_available(candidate):
                port = candidate
                print(
                    f"[提示] 端口 {start_port} 被占用，已自动改用 {port}",
                    file=sys.stderr,
                )
                break
        else:
            print("=" * 60, file=sys.stderr)
            print(f"[FATAL] 从 {start_port} 起连续 20 个端口均被占用，服务无法启动。", file=sys.stderr)
            print("  请在任务管理器中结束残留的 gu-yun-backend.exe 后重试。", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
            sys.exit(1)

    # 仅监听回环地址：本应用只服务本机桌面客户端，
    # 绑 0.0.0.0 会把接口暴露给同一局域网内的其他主机，属不必要的风险面。
    print(f"[启动] 后端监听 http://127.0.0.1:{port}", file=sys.stderr, flush=True)
    uvicorn.run(app, host="127.0.0.1", port=port)
