# -*- coding: utf-8 -*-
"""曲谱/MIDI 兜底管线服务（P1 备用，主流程不经过）

注意：music21 是重型依赖（导入约 0.6 秒），改为函数内延迟导入，
避免主流程启动时为用不到的兜底功能付出启动开销。
"""
import tempfile
import os
from typing import Any
from app.config import settings


class MusicService:
    def __init__(self):
        self.output_dir = settings.OUTPUT_DIR
        os.makedirs(self.output_dir, exist_ok=True)

    def parse_abc(self, abc_notation: str) -> Any:
        """解析 ABC 记谱为 music21 流（延迟导入 music21）"""
        import music21
        return music21.converter.parseData(abc_notation, format="abc")

    def abc_to_midi_file(self, abc_notation: str, output_path: str):
        import music21
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
        import music21
        score = self.parse_abc(abc_notation)
        midi_path = os.path.join(self.output_dir, filename)
        mf = music21.midi.translate.streamToMidiFile(score)
        mf.open(midi_path, "wb")
        mf.write()
        mf.close()
        return midi_path


music_service = MusicService()
