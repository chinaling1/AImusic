from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.services.music_service import MusicService
import os
import uuid

router = APIRouter(prefix="/api/midi", tags=["midi"])
music_service = MusicService()


@router.post("/generate")
async def generate_midi(request: dict):
    abc_notation = request.get("abc_notation", "")
    session_id = request.get("session_id", str(uuid.uuid4()))

    try:
        output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "output")
        os.makedirs(output_dir, exist_ok=True)

        filename = f"{session_id}.mid"
        filepath = os.path.join(output_dir, filename)

        music_service.abc_to_midi_file(abc_notation, filepath)

        return {"midi_url": f"/api/midi/download/{filename}", "filename": filename}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/download/{filename}")
async def download_midi(filename: str):
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "output")
    filepath = os.path.join(output_dir, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type="audio/midi", filename=filename)
    return {"status": "error", "message": "File not found"}
