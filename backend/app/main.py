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
from app.routers import prompt, lyric, score, midi, minimax
from app.services.llm_service import llm_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：建库 + 记录启动耗时，便于量化启动性能"""
    started = time.perf_counter()
    await init_db()
    print(f"[启动] 数据库就绪，耗时 {time.perf_counter() - started:.2f}s")
    yield


app = FastAPI(title="古韵AI — MiniMax 提示词工坊", version="2.0.0", lifespan=lifespan)

# CORS：本地桌面应用，开发态前端 5173、打包态 file:// 均需访问
# 注意：allow_origins=["*"] 与 allow_credentials=True 组合不符合规范，
# 收紧前需先解决 Electron 打包态 Origin 为 null 的问题（见重构报告待确认项）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    qwen_api_key: Optional[str] = None


@app.post("/api/settings/keys")
async def update_api_keys(request: ApiKeyRequest):
    """运行时更新大模型密钥（仅内存生效，重启后需重新配置）"""
    llm_service.update_keys(request.deepseek_api_key, request.qwen_api_key)
    return {"status": "ok"}


@app.get("/api/settings/keys/status")
async def check_api_keys_status():
    """查询密钥配置状态（不返回密钥内容）"""
    return {
        "deepseek_configured": bool(llm_service._deepseek_key),
        "qwen_configured": bool(llm_service._qwen_key),
    }


@app.get("/")
async def root():
    return {"message": "AI音乐生成后端服务"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
