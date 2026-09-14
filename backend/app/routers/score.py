from fastapi import APIRouter
from app.models.schemas import ScoreGenerateRequest, ScoreGenerateResponse
from app.services.llm_service import llm_service
from app.services.music_service import MusicService
from app.database import save_prompt_version
import uuid

router = APIRouter(prefix="/api/score", tags=["score"])
music_service = MusicService()


@router.post("/optimize-prompt")
async def optimize_score_prompt(request: dict):
    session_id = request.get("session_id", str(uuid.uuid4()))

    await save_prompt_version(step="score", type="original", content=request.get("prompt", ""), session_id=session_id)

    optimized = await llm_service.optimize_score_prompt(request.get("prompt", ""))

    await save_prompt_version(step="score", type="ai_optimized", content=optimized, session_id=session_id)

    return {"optimized_prompt": optimized, "session_id": session_id}


@router.post("/generate", response_model=ScoreGenerateResponse)
async def generate_score(request: ScoreGenerateRequest):
    session_id = request.session_id or str(uuid.uuid4())
    instrument = request.style or "钢琴"

    abc_notation = await llm_service.generate_score(request.lyrics, request.lyrics, instrument)

    return ScoreGenerateResponse(
        abc_notation=abc_notation,
        model="deepseek_flash",
        session_id=session_id
    )


@router.post("/render-audio")
async def render_audio(request: dict):
    abc_notation = request.get("abc_notation", "")
    try:
        midi_data = music_service.abc_to_midi_bytes(abc_notation)
        return {"status": "ok", "message": "MIDI data generated", "size": len(midi_data)}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/prompt/history")
async def get_score_prompt_history(session_id: str):
    from app.database import get_prompt_versions
    versions = await get_prompt_versions(session_id, "score")
    return {"versions": versions}
