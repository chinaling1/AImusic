# -*- coding: utf-8 -*-
"""歌词生成路由（主流程第 2 步）

输出的歌词为 MiniMax 音乐网页版格式：英文结构标签独占一行，
标签后可加圆括号编曲/人声注记。MiniMax 不接收时间轴，因此不再生成 LRC。

健壮性：LLM 调用失败统一转 502；输出做确定性净化（去代码围栏与前言）。
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.models.schemas import LyricGenerateRequest, LyricGenerateResponse
from app.services.llm_service import llm_service, LLMServiceError
import uuid

router = APIRouter(prefix="/api/lyric", tags=["lyric"])


def sanitize_lyrics(raw: str) -> str:
    """确定性净化 LLM 歌词输出（防粘贴污染，双保险：提示词已禁止围栏/前言）

    1. 去除 markdown 代码围栏行（``` 及语言标注）
    2. 若首段存在非标签前言行（如"以下是歌词："），裁掉第一个结构标签行之前的所有内容
    """
    lines = (raw or "").strip().split("\n")
    lines = [ln for ln in lines if not ln.strip().startswith("```")]
    text = "\n".join(lines).strip()

    # 找到第一个结构标签行（以 [ 开头），丢弃其之前的前言
    for idx, ln in enumerate(text.split("\n")):
        if ln.strip().startswith("["):
            if idx > 0:
                text = "\n".join(text.split("\n")[idx:])
            break
    return text.strip()


@router.post("/generate", response_model=LyricGenerateResponse)
async def generate_lyrics(request: LyricGenerateRequest):
    session_id = request.session_id or str(uuid.uuid4())

    try:
        lyrics = sanitize_lyrics(
            await llm_service.generate_lyrics(request.prompt, request.style or "古风"))
    except LLMServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return LyricGenerateResponse(
        lyrics=lyrics,
        # 保留字段以兼容旧前端，但 MiniMax 格式不含时间轴，恒为 None
        lrc_content=None,
        model="deepseek_pro",
        session_id=session_id
    )


@router.post("/export")
async def export_lrc(request: dict):
    """下载歌词文本（LRC 时间轴已废弃，现为纯歌词导出）"""
    content = request.get("lyrics", request.get("lrc_content", ""))
    filename = request.get("filename", "lyrics.txt")
    return Response(
        content=content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
