# -*- coding: utf-8 -*-
"""歌词生成路由（主流程第 2 步）

输出的歌词为 MiniMax 音乐网页版格式：英文结构标签独占一行，
标签后可加圆括号编曲/人声注记。MiniMax 不接收时间轴，因此不再生成 LRC。
"""
from fastapi import APIRouter
from fastapi.responses import Response
from app.models.schemas import LyricGenerateRequest, LyricGenerateResponse
from app.services.llm_service import llm_service
import uuid

router = APIRouter(prefix="/api/lyric", tags=["lyric"])


@router.post("/generate", response_model=LyricGenerateResponse)
async def generate_lyrics(request: LyricGenerateRequest):
    session_id = request.session_id or str(uuid.uuid4())

    lyrics = await llm_service.generate_lyrics(request.prompt, request.style or "古风")

    return LyricGenerateResponse(
        lyrics=lyrics,
        # 保留字段以兼容旧前端，但 MiniMax 格式不含时间轴，恒为 None
        lrc_content=None,
        model="deepseek_pro",
        session_id=session_id
    )


@router.post("/export")
async def export_lrc(request: dict):
    lrc_content = request.get("lrc_content", "")
    filename = request.get("filename", "lyrics.lrc")
    return Response(
        content=lrc_content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
