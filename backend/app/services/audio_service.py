import os
from app.config import settings


class AudioService:
    def __init__(self):
        self.output_dir = settings.OUTPUT_DIR
        os.makedirs(self.output_dir, exist_ok=True)

    def midi_to_audio(self, midi_path: str, output_filename: str = "output.wav") -> str:
        audio_path = os.path.join(self.output_dir, output_filename)
        return audio_path


audio_service = AudioService()
