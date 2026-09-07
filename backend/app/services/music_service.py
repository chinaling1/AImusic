import music21
import tempfile
import os
from app.config import settings


class MusicService:
    def __init__(self):
        self.output_dir = settings.OUTPUT_DIR
        os.makedirs(self.output_dir, exist_ok=True)

    def parse_abc(self, abc_notation: str) -> music21.stream.Stream:
        return music21.converter.parseData(abc_notation, format="abc")

    def abc_to_midi_file(self, abc_notation: str, output_path: str):
        score = self.parse_abc(abc_notation)
        mf = music21.midi.translate.streamToMidiFile(score)
        mf.open(output_path, 'wb')
        mf.write()
        mf.close()

    def abc_to_midi_bytes(self, abc_notation: str) -> bytes:
        with tempfile.NamedTemporaryFile(suffix='.mid', delete=False) as tmp:
            self.abc_to_midi_file(abc_notation, tmp.name)
            tmp.seek(0)
            data = tmp.read()
        os.unlink(tmp.name)
        return data

    def abc_to_midi(self, abc_notation: str, filename: str = "output.mid") -> str:
        score = self.parse_abc(abc_notation)
        midi_path = os.path.join(self.output_dir, filename)
        mf = music21.midi.translate.streamToMidiFile(score)
        mf.open(midi_path, "wb")
        mf.write()
        mf.close()
        return midi_path


music_service = MusicService()
