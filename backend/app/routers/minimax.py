# -*- coding: utf-8 -*-
"""MiniMax 提示词格式校验器（确定性算法，不依赖 LLM）

依据 MiniMax 音乐网页版 / Music-3.0 API 文档核实的能力边界：
- 歌词：上限 3500 字符，支持 14 种英文结构标签，标签独占一行
- 风格描述（prompt/Styles）：上限 2000 字符
- 标签后可加编曲/人声/情绪注记（圆括号行）
"""
import re
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/minimax", tags=["minimax"])

# MiniMax Music API 官方支持的 14 种结构标签（文档口径）
ALLOWED_TAGS = [
    "Intro", "Verse", "Pre-Chorus", "Pre Chorus", "Chorus", "Interlude",
    "Bridge", "Outro", "Post-Chorus", "Post Chorus", "Transition",
    "Break", "Hook", "Build Up", "Build-Up", "Inst", "Solo",
]
# 带序号形式，如 [Verse 1] [Verse 2]
TAG_PATTERN = re.compile(r"^\[([^\]]+)\]\s*$")
NUMBERED_TAG_PATTERN = re.compile(r"^(Verse|Chorus|Bridge|Hook|Inst|Solo)\s+\d+$")
# 中文标签 → 英文标签映射（LLM 常见错误，自动给出替换建议）
CN_TAG_MAP = {
    "主歌": "Verse", "副歌": "Chorus", "前奏": "Intro", "尾奏": "Outro",
    "间奏": "Interlude", "桥段": "Bridge", "导歌": "Pre-Chorus",
    "主歌1": "Verse 1", "主歌2": "Verse 2", "副歌1": "Chorus 1",
}

LYRICS_MAX = 3500    # 歌词字符上限（API 口径）
STYLES_MAX = 2000    # 风格描述字符上限（API 口径）
NOTE_PATTERN = re.compile(r"^\((.+)\)\s*$")  # 标签后的注记行


class ValidateRequest(BaseModel):
    styles: Optional[str] = ""          # 风格描述（Styles 输入框内容）
    meta_tags: Optional[str] = ""        # 结构化元标签（本地存档用）
    lyrics: Optional[str] = ""           # 歌词（含结构标签）
    instrumental: bool = False          # 纯音乐模式（网页版开关）


class Issue(BaseModel):
    level: str          # error / warning / info
    where: str          # lyrics / styles
    message: str


class ValidateResponse(BaseModel):
    ok: bool
    issues: List[Issue]
    stats: dict


def _check_tag(tag: str) -> Optional[str]:
    """校验单个标签是否为 MiniMax 支持的写法；返回错误消息或 None"""
    normalized = tag.strip()
    # 中文标签检测（含中文字符）
    if re.search(r"[\u4e00-\u9fff]", normalized):
        suggestion = CN_TAG_MAP.get(normalized)
        if suggestion:
            return f"标签 [{tag}] 为中文写法，MiniMax 不识别，应改为 [{suggestion}]"
        return f"标签 [{tag}] 含中文，MiniMax 要求英文结构标签"
    if normalized in ALLOWED_TAGS:
        return None
    if NUMBERED_TAG_PATTERN.match(normalized):
        return None
    # 常见拼写错误提示
    lower = normalized.lower()
    for allowed in ALLOWED_TAGS:
        if lower == allowed.lower():
            return f"标签 [{tag}] 大小写不规范，建议改为 [{allowed}]"
    return f"标签 [{tag}] 不在 MiniMax 支持的 14 种结构标签内"


@router.post("/validate", response_model=ValidateResponse)
async def validate_prompt(request: ValidateRequest):
    """确定性校验：字符上限、标签合法性、结构顺序、注记格式"""
    issues: List[Issue] = []
    styles = request.styles or ""
    lyrics = request.lyrics or ""

    # ---- Styles 校验 ----
    if len(styles) > STYLES_MAX:
        issues.append(Issue(level="error", where="styles",
                            message=f"风格描述 {len(styles)} 字符，超过 MiniMax 上限 {STYLES_MAX}"))
    if not request.instrumental and styles and len(styles.strip()) < 20:
        issues.append(Issue(level="warning", where="styles",
                            message="风格描述过短（建议 80-200 字），过短会降低生成质量"))

    # ---- 歌词校验 ----
    if request.instrumental:
        if lyrics.strip():
            issues.append(Issue(level="info", where="lyrics",
                                message="纯音乐模式下歌词框应留空，创意请写在 Styles 中"))
    else:
        if not lyrics.strip():
            issues.append(Issue(level="error", where="lyrics",
                                 message="非纯音乐模式必须提供歌词（或留空让 MiniMax 自动生成，但可控性差）"))
        if len(lyrics) > LYRICS_MAX:
            issues.append(Issue(level="error", where="lyrics",
                                message=f"歌词 {len(lyrics)} 字符，超过 MiniMax 上限 {LYRICS_MAX}"))

    # 逐行解析标签
    lines = lyrics.split("\n")
    tag_lines = []      # (行号, 标签名)
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped.startswith("["):
            continue
        m = TAG_PATTERN.match(stripped)
        if m:
            err = _check_tag(m.group(1))
            if err:
                issues.append(Issue(level="error", where="lyrics", message=f"第 {i+1} 行：{err}"))
            tag_lines.append((i + 1, m.group(1).strip()))
        elif stripped.startswith("[") and not stripped.startswith("[Intro"):
            # 形如 [xx] 但同行还有其他内容 → 标签未独占一行
            issues.append(Issue(level="error", where="lyrics",
                                message=f"第 {i+1} 行：结构标签必须独占一行，方括号后不能跟其他内容"))

    # 结构顺序检查（警告级）
    tag_names = [t.lower() for _, t in tag_lines]
    if tag_names and tag_names[0] not in ("intro", "verse", "verse 1"):
        issues.append(Issue(level="warning", where="lyrics",
                            message="歌曲开头建议使用 [Intro] 或 [Verse 1]"))
    if not request.instrumental and "chorus" not in " ".join(tag_names).replace("-", " "):
        issues.append(Issue(level="warning", where="lyrics",
                            message="未检测到 [Chorus] 段落，缺少副歌会影响歌曲完成度"))
    if tag_names.count("chorus") > 0 and tag_names.count("verse") == 0 and "verse 1" not in tag_names:
        issues.append(Issue(level="warning", where="lyrics",
                            message="未检测到 [Verse] 段落，主歌缺失会使叙事不完整"))

    # 注记行格式：标签行后允许一个圆括号注记行
    for idx, (lineno, _) in enumerate(tag_lines):
        if lineno < len(lines):
            next_line = lines[lineno].strip()  # 下一行（行号从 1 计）
            if next_line.startswith("(") and not NOTE_PATTERN.match(next_line):
                issues.append(Issue(level="warning", where="lyrics",
                                    message=f"第 {lineno+1} 行：注记未以圆括号闭合，格式如 (古筝渐入)"))

    has_error = any(i.level == "error" for i in issues)
    return ValidateResponse(
        ok=not has_error,
        issues=issues,
        stats={
            "styles_chars": len(styles),
            "styles_limit": STYLES_MAX,
            "lyrics_chars": len(lyrics),
            "lyrics_limit": LYRICS_MAX,
            "sections": [t for _, t in tag_lines],
            "section_count": len(tag_lines),
        },
    )


@router.get("/format-spec")
async def format_spec():
    """返回 MiniMax 输入格式规格（单一事实来源，前端展示用）"""
    return {
        "model": "Music-3.0（网页版 Creator Beta）",
        "styles": {
            "limit": STYLES_MAX,
            "hint": "曲风 + 情绪 + 场景 + 乐器 + 人声的连贯描述，纯音乐模式下创意全部写在这里",
        },
        "lyrics": {
            "limit": LYRICS_MAX,
            "tags": ALLOWED_TAGS,
            "hint": "标签独占一行；标签后可加一行圆括号注记描述编曲/人声/情绪；留空则按 Styles 自动生成",
        },
        "instrumental": {
            "hint": "打开纯音乐开关后歌词留空，创意写在 Styles",
        },
        "output": {
            "format": "mp3（44.1kHz）",
            "duration": "最长约 4-5 分钟",
        },
    }
