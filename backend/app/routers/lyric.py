from fastapi import APIRouter
from fastapi.responses import Response
from app.models.schemas import LyricGenerateRequest, LyricGenerateResponse
from app.services.llm_service import llm_service
from app.utils.lrc_utils import generate_lrc
from app.database import save_prompt_version
import uuid

router = APIRouter(prefix="/api/lyric", tags=["lyric"])


@router.post("/generate", response_model=LyricGenerateResponse)
async def generate_lyrics(request: LyricGenerateRequest):
    session_id = request.session_id or str(uuid.uuid4())

    lyrics = await llm_service.generate_lyrics(request.prompt, request.style or "古风")

    lrc_content = generate_lrc(lyrics)

    return LyricGenerateResponse(
        lyrics=lyrics,
        lrc_content=lrc_content,
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
