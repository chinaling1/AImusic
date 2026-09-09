# -*- coding: utf-8 -*-
"""MiniMax 提示词格式校验器（确定性算法，不依赖 LLM）

依据 MiniMax 音乐网页版 / Music-3.0 API 文档核实的能力边界：
- 歌词：上限 3500 字符，支持 14 种英文结构标签，标签独占一行
- 风格描述（prompt/Styles）：上限 2000 字符
- 标签后可加编曲/人声/情绪注记（圆括号行）
- 歌词留空时官方允许按 Styles 自动生成（属可控性权衡，非错误）
"""
import re
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/minimax", tags=["minimax"])

# MiniMax Music API 官方支持的 14 种结构标签（含连字符/空格两种官方写法，共 17 条）
ALLOWED_TAGS = [
    "Intro", "Verse", "Pre-Chorus", "Pre Chorus", "Chorus", "Interlude",
    "Bridge", "Outro", "Post-Chorus", "Post Chorus", "Transition",
    "Break", "Hook", "Build Up", "Build-Up", "Inst", "Solo",
]
# 标签行：整行仅一对英文方括号
TAG_PATTERN = re.compile(r"^\[([^\]]+)\]\s*$")
# 带序号写法：任意支持标签 + 数字序号，如 [Verse 1] [Pre-Chorus 2]
NUMBERED_TAG_PATTERN = re.compile(
    r"^(" + "|".join(re.escape(t) for t in ALLOWED_TAGS) + r")\s+\d+$"
)
# 中文标签 → 英文标签映射（LLM 常见错误，自动给出替换建议）
CN_TAG_MAP = {
    "主歌": "Verse", "副歌": "Chorus", "前奏": "Intro", "尾奏": "Outro",
    "间奏": "Interlude", "桥段": "Bridge", "导歌": "Pre-Chorus",
    "主歌1": "Verse 1", "主歌2": "Verse 2", "副歌1": "Chorus 1",
    "主歌一": "Verse 1", "主歌二": "Verse 2",
}

LYRICS_MAX = 3500    # 歌词字符上限（API 口径）
STYLES_MAX = 2000    # 风格描述字符上限（API 口径）
STYLES_SHORT = 80    # 风格描述过短阈值（与提示文案"建议 80-200 字"一致）
NOTE_PATTERN = re.compile(r"^[(（].+[)）]\s*$")   # 注记行：半角/全角圆括号均可
META_TAG_NAMES = ["Genre", "BPM", "Key", "Vocals", "Instruments", "Arrangement"]


class ValidateRequest(BaseModel):
    styles: Optional[str] = ""           # 风格描述（Styles 输入框内容）
    meta_tags: Optional[str] = ""        # 结构化元标签（六项完整性校验）
    lyrics: Optional[str] = ""           # 歌词（含结构标签）
    instrumental: bool = False           # 纯音乐模式（网页版开关）


class Issue(BaseModel):
    level: str          # error / warning / info
    where: str          # lyrics / styles / meta
    message: str


class ValidateResponse(BaseModel):
    ok: bool
    issues: List[Issue]
    stats: dict


def _normalize_tag(tag: str) -> str:
    """标签归一化：小写 + 连字符统一为空格 + 去序号，用于结构检查"""
    t = tag.strip().lower().replace("-", " ")
    return re.sub(r"\s+\d+$", "", t).strip()


def _check_tag(tag: str) -> tuple:
    """校验单个标签写法。

    返回 (level, message)：level 为 None 表示合法。
    """
    normalized = tag.strip()
    # 中文标签检测（含中文字符）
    if re.search(r"[\u4e00-\u9fff]", normalized):
        suggestion = CN_TAG_MAP.get(normalized)
        if suggestion:
            return "error", f"标签 [{tag}] 为中文写法，MiniMax 不识别，应改为 [{suggestion}]"
        return "error", f"标签 [{tag}] 含中文，MiniMax 要求英文结构标签"
    if normalized in ALLOWED_TAGS or NUMBERED_TAG_PATTERN.match(normalized):
        return None, None
    # 大小写不规范：官方不区分大小写的可能性高，降为警告而非错误
    lower = normalized.lower()
    for allowed in ALLOWED_TAGS:
        if lower == allowed.lower():
            return "warning", f"标签 [{tag}] 大小写不规范，建议改为 [{allowed}]"
    return "error", f"标签 [{tag}] 不在 MiniMax 支持的 14 种结构标签内"


def _check_meta_tags(meta_tags: str) -> List[Issue]:
    """元标签六项完整性校验（warning 级，不影响 ok）"""
    issues: List[Issue] = []
    text = (meta_tags or "").strip()
    if not text:
        return issues
    missing = [name for name in META_TAG_NAMES if f"[{name}]" not in text]
    if missing:
        issues.append(Issue(
            level="warning", where="meta",
            message=f"元标签缺少 {'、'.join('[' + m + ']' for m in missing)}，"
                    f"完整六项为 {('、'.join('[' + m + ']' for m in META_TAG_NAMES))}"))
    return issues


@router.post("/validate", response_model=ValidateResponse)
async def validate_prompt(request: ValidateRequest):
    """确定性校验：字符上限、标签合法性、结构顺序、注记格式、元标签完整性"""
    issues: List[Issue] = []
    styles = request.styles or ""
    lyrics = request.lyrics or ""

    # ---- Styles 校验 ----
    if len(styles) > STYLES_MAX:
        issues.append(Issue(level="error", where="styles",
                            message=f"风格描述 {len(styles)} 字符，超过 MiniMax 上限 {STYLES_MAX}"))
    if not request.instrumental and styles and len(styles.strip()) < STYLES_SHORT:
        issues.append(Issue(level="warning", where="styles",
                            message=f"风格描述过短（建议 80-200 字，当前 {len(styles.strip())} 字），过短会降低生成质量"))

    # ---- 元标签完整性（存档与举证用，warning 级）----
    issues.extend(_check_meta_tags(request.meta_tags))

    # ---- 歌词校验 ----
    if request.instrumental:
        # 纯音乐模式：官方要求歌词留空；如有内容仅提示，且跳过标签逐行校验
        if lyrics.strip():
            issues.append(Issue(level="info", where="lyrics",
                                message="纯音乐模式下歌词框应留空（当前内容将被忽略），创意请写在 Styles 中"))
        if len(lyrics) > LYRICS_MAX:
            issues.append(Issue(level="info", where="lyrics",
                                message=f"歌词 {len(lyrics)} 字符超过上限 {LYRICS_MAX}，但纯音乐模式下将被忽略"))
    else:
        if not lyrics.strip():
            # 官方允许留空由 Styles 自动生成，属可控性权衡而非错误
            issues.append(Issue(level="warning", where="lyrics",
                                message="歌词为空：MiniMax 将按 Styles 自动生成歌词，可控性较差；如需掌控内容请填写歌词"))
        if len(lyrics) > LYRICS_MAX:
            issues.append(Issue(level="error", where="lyrics",
                                message=f"歌词 {len(lyrics)} 字符，超过 MiniMax 上限 {LYRICS_MAX}"))

        # 逐行解析标签（仅非纯音乐模式执行）
        lines = lyrics.split("\n")
        tag_lines: List[tuple] = []   # (行号, 标签名)
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped.startswith("["):
                continue
            m = TAG_PATTERN.match(stripped)
            if m:
                level, err = _check_tag(m.group(1))
                if err:
                    issues.append(Issue(level=level, where="lyrics", message=f"第 {i+1} 行：{err}"))
                tag_lines.append((i + 1, m.group(1).strip()))
            else:
                # 形如 [xx] 但同行还有其他内容 → 标签未独占一行（所有标签一律要求）
                issues.append(Issue(level="error", where="lyrics",
                                    message=f"第 {i+1} 行：结构标签必须独占一行，方括号后不能跟其他内容"))

        # 结构顺序检查（归一化后判断，warning 级）
        normalized_names = [_normalize_tag(t) for _, t in tag_lines]
        name_set = set(normalized_names)
        if normalized_names and normalized_names[0] not in ("intro", "verse"):
            issues.append(Issue(level="warning", where="lyrics",
                                message="歌曲开头建议使用 [Intro] 或 [Verse 1]"))
        if "chorus" not in name_set:
            issues.append(Issue(level="warning", where="lyrics",
                                message="未检测到 [Chorus] 段落，缺少副歌会影响歌曲完成度"))
        if "chorus" in name_set and "verse" not in name_set:
            issues.append(Issue(level="warning", where="lyrics",
                                message="未检测到 [Verse] 段落，主歌缺失会使叙事不完整"))

        # 注记行格式：标签行的下一行允许一个圆括号注记（半角/全角均可）
        for lineno, _ in tag_lines:
            if lineno < len(lines):
                next_line = lines[lineno].strip()   # 行号从 1 计，lines[lineno] 即下一行
                if next_line.startswith("(") or next_line.startswith("（"):
                    if not NOTE_PATTERN.match(next_line):
                        issues.append(Issue(level="warning", where="lyrics",
                                            message=f"第 {lineno+1} 行：注记未以圆括号闭合，格式如 (古筝渐入) 或 （古筝渐入）"))

    has_error = any(i.level == "error" for i in issues)
    return ValidateResponse(
        ok=not has_error,
        issues=issues,
        stats={
            "styles_chars": len(styles),
            "styles_limit": STYLES_MAX,
            "lyrics_chars": len(lyrics),
            "lyrics_limit": LYRICS_MAX,
            "sections": [t for _, t in tag_lines] if not request.instrumental else [],
            "section_count": len(tag_lines) if not request.instrumental else 0,
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
