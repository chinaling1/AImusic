# -*- coding: utf-8 -*-
"""
生成《设计与开发文档》(Word) - 古韵AI V2.3

依据：2026 参赛手册 附件 2 设计文档模板
- 第一章 需求分析
- 第二章 概要设计
- 第三章 详细设计
- 第四章 测试报告
- 第五章 安装及使用
- 第六章 项目总结
"""
from pathlib import Path
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_BREAK
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from datetime import datetime

OUT_PATH = Path(r"G:\cunchu\大学\作业\AI音乐\文档\古韵AI-设计与开发文档-V2.3.docx")
OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

# -------------------- 排版常量 --------------------
FONT_CN = "宋体"
FONT_EN = "Times New Roman"
FONT_HEADING_CN = "黑体"
COLOR_GOLD = RGBColor(0xB8, 0x86, 0x0B)
COLOR_INK = RGBColor(0x1A, 0x1A, 0x2E)
COLOR_GREY = RGBColor(0x6B, 0x6B, 0x6B)
COLOR_RED = RGBColor(0xC0, 0x39, 0x2B)

# -------------------- 工具函数 --------------------
def set_cell_bg(cell, color_hex: str):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tc_pr.append(shd)


def set_run_font(run, size_pt: float = 10.5, bold: bool = False, color: RGBColor | None = None,
                 font_cn: str = FONT_CN):
    run.font.name = FONT_EN
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    if color is not None:
        run.font.color.rgb = color
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn('w:rFonts'))
    if rfonts is None:
        rfonts = OxmlElement('w:rFonts')
        rpr.append(rfonts)
    rfonts.set(qn('w:eastAsia'), font_cn)
    rfonts.set(qn('w:ascii'), FONT_EN)
    rfonts.set(qn('w:hAnsi'), FONT_EN)


def add_para(doc, text: str, size: float = 10.5, bold: bool = False, color: RGBColor | None = None,
             align=WD_ALIGN_PARAGRAPH.LEFT, indent_first: float | None = None,
             space_after: float = 4, line_spacing: float = 1.5):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.line_spacing = line_spacing
    p.paragraph_format.space_after = Pt(space_after)
    if indent_first is not None:
        p.paragraph_format.first_line_indent = Cm(indent_first)
    r = p.add_run(text)
    set_run_font(r, size_pt=size, bold=bold, color=color, font_cn=FONT_CN if not bold else FONT_HEADING_CN)
    return p


def add_heading(doc, text: str, level: int):
    """自定义标题：黑体、加粗、节段后留白"""
    sizes = {0: 22, 1: 16, 2: 13, 3: 11.5}
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14 if level <= 1 else 8)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.keep_with_next = True
    if level == 0:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    set_run_font(r, size_pt=sizes.get(level, 11), bold=True,
                 color=COLOR_GOLD if level <= 1 else COLOR_INK,
                 font_cn=FONT_HEADING_CN)
    # 大纲级别
    pPr = p._p.get_or_add_pPr()
    outline = OxmlElement('w:outlineLvl')
    outline.set(qn('w:val'), str(max(0, level - 1)))
    pPr.append(outline)
    return p


def add_bullet(doc, text: str, level: int = 0):
    p = doc.add_paragraph(style='List Bullet' if level == 0 else 'List Bullet 2')
    p.paragraph_format.left_indent = Cm(0.74 + 0.6 * level)
    p.paragraph_format.line_spacing = 1.45
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(text)
    set_run_font(r, size_pt=10.5)
    return p


def add_code_block(doc, text: str, lang: str = ""):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.right_indent = Cm(0.5)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    # 浅灰底
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), 'F4F1E8')
    pPr.append(shd)
    r = p.add_run(text)
    set_run_font(r, size_pt=9.5, font_cn="Consolas")
    # Consolas 实际只有西文；让中文回退到宋体
    rpr = r._element.get_or_add_rPr()
    rfonts = rpr.find(qn('w:rFonts'))
    rfonts.set(qn('w:eastAsia'), FONT_CN)
    return p


def add_table(doc, headers: list[str], rows: list[list[str]], col_widths_cm: list[float] | None = None,
              header_bg: str = "B8860B"):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    # 列宽
    if col_widths_cm:
        for i, w in enumerate(col_widths_cm):
            for cell in table.columns[i].cells:
                cell.width = Cm(w)
    # 表头
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_bg(cell, header_bg)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h)
        set_run_font(r, size_pt=10, bold=True, color=RGBColor(0xFF, 0xFF, 0xFF), font_cn=FONT_HEADING_CN)
    # 数据行
    for ri, row in enumerate(rows, 1):
        for ci, v in enumerate(row):
            cell = table.cell(ri, ci)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            # 斑马纹
            if ri % 2 == 0:
                set_cell_bg(cell, "FAF7EC")
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if ci > 0 else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.35
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(v)
            set_run_font(r, size_pt=10)
    return table


def add_page_break(doc):
    p = doc.add_paragraph()
    r = p.add_run()
    r.add_break(WD_BREAK.PAGE)


def configure_page(doc):
    section = doc.sections[0]
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.7)
    section.right_margin = Cm(2.7)
    # 页眉
    header = section.header
    p = header.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run("古韵AI — 设计与开发文档 V2.3")
    set_run_font(r, size_pt=9, color=COLOR_GREY)
    # 页脚（页码）
    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fr = fp.add_run("— 第 ")
    set_run_font(fr, size_pt=9, color=COLOR_GREY)
    # 插入 PAGE 域
    fld_begin = OxmlElement('w:fldChar')
    fld_begin.set(qn('w:fldCharType'), 'begin')
    instr = OxmlElement('w:instrText')
    instr.set(qn('xml:space'), 'preserve')
    instr.text = ' PAGE '
    fld_sep = OxmlElement('w:fldChar')
    fld_sep.set(qn('w:fldCharType'), 'separate')
    fld_end = OxmlElement('w:fldChar')
    fld_end.set(qn('w:fldCharType'), 'end')
    page_run = fp.add_run()
    set_run_font(page_run, size_pt=9, color=COLOR_GREY)
    page_run._r.append(fld_begin)
    page_run._r.append(instr)
    page_run._r.append(fld_sep)
    page_run._r.append(fld_end)
    fr2 = fp.add_run(" 页 / 共 ")
    set_run_font(fr2, size_pt=9, color=COLOR_GREY)
    # NUMPAGES 域
    np_begin = OxmlElement('w:fldChar'); np_begin.set(qn('w:fldCharType'), 'begin')
    np_instr = OxmlElement('w:instrText'); np_instr.set(qn('xml:space'), 'preserve'); np_instr.text = ' NUMPAGES '
    np_sep = OxmlElement('w:fldChar'); np_sep.set(qn('w:fldCharType'), 'separate')
    np_end = OxmlElement('w:fldChar'); np_end.set(qn('w:fldCharType'), 'end')
    np_run = fp.add_run()
    set_run_font(np_run, size_pt=9, color=COLOR_GREY)
    np_run._r.append(np_begin); np_run._r.append(np_instr); np_run._r.append(np_sep); np_run._r.append(np_end)
    fr3 = fp.add_run(" 页 —")
    set_run_font(fr3, size_pt=9, color=COLOR_GREY)


# ============================================================
# 开始写文档
# ============================================================
doc = Document()
# 默认字体（Normal）
normal_style = doc.styles['Normal']
normal_style.font.name = FONT_EN
normal_style.font.size = Pt(10.5)
rpr = normal_style.element.get_or_add_rPr()
rfonts = OxmlElement('w:rFonts')
rfonts.set(qn('w:eastAsia'), FONT_CN)
rfonts.set(qn('w:ascii'), FONT_EN)
rfonts.set(qn('w:hAnsi'), FONT_EN)
rpr.append(rfonts)
configure_page(doc)

# -------------------- 封面 --------------------
add_para(doc, "", size=10)
add_para(doc, "", size=10)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after = Pt(10)
r = p.add_run("古韵 AI")
set_run_font(r, size_pt=42, bold=True, color=COLOR_GOLD, font_cn=FONT_HEADING_CN)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after = Pt(6)
r = p.add_run("— 古风音乐提示词工坊 —")
set_run_font(r, size_pt=20, bold=True, color=COLOR_INK, font_cn=FONT_HEADING_CN)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after = Pt(36)
r = p.add_run("设  计  与  开  发  文  档")
set_run_font(r, size_pt=24, bold=True, color=COLOR_GOLD, font_cn=FONT_HEADING_CN)

# 封面信息表
info_rows = [
    ["作品名称", "古韵AI · 古风音乐提示词工坊"],
    ["文档版本", "V2.3"],
    ["编制日期", datetime.now().strftime("%Y 年 %m 月 %d 日")],
    ["适用赛事", "2026 年（第 3 届）全国大学生数智链应用大赛 · 人工智能大类 · AI 音乐赛道"],
    ["提交平台", "https://www.dabc.org.cn"],
    ["作品完成硬线", "2026-09-20（手册第 9 条第 3 款）"],
    ["提交截止", "2026-10-09 24:00"],
    ["标准依据", "IEEE 830-1998；GB/T 9704-2012；本赛事《2026 参赛手册》附件 2"],
    ["技术栈", "React 19 + TypeScript + Vite 8 + Zustand 5 / FastAPI + Python 3.14 / Electron 33"],
    ["依赖模型", "DeepSeek V4（deepseek-v4-pro / deepseek-v4-flash）"],
    ["生成平台", "MiniMax 音乐网页版（Music-3.0）"],
]
table = doc.add_table(rows=len(info_rows), cols=2)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.style = 'Table Grid'
table.columns[0].width = Cm(4.0)
table.columns[1].width = Cm(12.0)
for ri, (k, v) in enumerate(info_rows):
    c0 = table.cell(ri, 0)
    c0.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    set_cell_bg(c0, "1A1A2E")
    p = c0.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(k)
    set_run_font(r, size_pt=10.5, bold=True, color=RGBColor(0xFF, 0xFF, 0xFF), font_cn=FONT_HEADING_CN)
    c1 = table.cell(ri, 1)
    c1.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p = c1.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(v)
    set_run_font(r, size_pt=10.5)

add_page_break(doc)

# ============================================================
# 第一章 需求分析
# ============================================================
add_heading(doc, "第一章  需求分析", 1)

add_heading(doc, "1.1  项目背景", 2)
add_para(doc,
    "随着 AIGC 在音乐创作领域的应用日益广泛，专业音乐人对「精准控制 + 人工干预 + 可复现」"
    "的工具需求与日俱增。当前主流 AI 音乐生成产品以端到端黑盒为主，抽卡式输出无法满足专业"
    "创作者对结构、风格、情绪的细粒度控制要求；尤其在古风音乐这一细分领域，缺少兼顾专业"
    "性与创作效率的工具。本项目「古韵 AI」正是面向这一空白，定位为「古风音乐提示词工坊」——"
    "并非取代 AI 音乐生成大模型，而是成为创作者与生成大模型之间的高精度桥梁。",
    indent_first=0.74, space_after=4)

add_heading(doc, "1.2  竞品分析", 2)
add_table(doc,
    headers=["维度", "Suno / Udio 类工具", "国内端到端生成产品", "古韵AI（本作品）"],
    rows=[
        ["生成方式", "端到端黑盒", "端到端黑盒", "提示词工程 + 确定性校验 + 用户粘贴到 MiniMax"],
        ["可控性", "低（抽卡）", "低（抽卡）", "高（每个字段可独立编辑 + 全链路版本管理）"],
        ["干预证据", "无", "无", "完整（原始 / AI优化 / 人工修改 / 回溯 四类版本）"],
        ["输出可审计", "不可", "不可", "可（结构化元标签 + 校验报告 + 提示词包）"],
        ["算力门槛", "高（云端或 24G 显存）", "高", "极低（CPU 可跑，仅 LLM 走云端 API）"],
        ["契合赛事", "否", "否", "★ 是（命中「本地部署 + 原创算法」官方加分项）"],
    ],
    col_widths_cm=[2.5, 4.0, 4.0, 5.5])

add_heading(doc, "1.3  项目目标", 2)
add_bullet(doc, "目标用户：古风音乐人 / 词作者 / 高校音乐专业师生 / 非遗主题晚会导演")
add_bullet(doc, "核心交付：3 步主流程（提示词优化 → 歌词生成 → 提示词包导出）")
add_bullet(doc, "差异化：提示词全链路版本管理 = 「人工干预充分」的天然证据链")
add_bullet(doc, "算力目标：CPU 即可运行；不依赖本地大模型 / GPU")

add_heading(doc, "1.4  功能范围", 2)
add_table(doc,
    headers=["模块", "主流程", "说明"],
    rows=[
        ["提示词优化", "★", "输入创意 → DeepSeek Pro 生成 6 项结构化元标签 + 风格描述，可二次编辑"],
        ["歌词生成", "★", "DeepSeek Pro 生成 14 种 MiniMax 英文结构标签格式歌词，纯音乐/演唱双模式"],
        ["格式校验", "★", "后端确定性算法（非 LLM）：字数 / 标签合法性 / 6 项元标签完整性"],
        ["提示词包导出", "★", "含原始创意 / 元标签 / 风格 / 歌词 / 参数 / 校验结果的纯文本 .txt"],
        ["MiniMax 跳转", "★", "桌面态走系统浏览器（IPC），网页态走 window.open；自动复制提示词包"],
        ["版本历史", "★", "每步 AI 优化与人工修改均入库，支持回溯与对比"],
        ["曲谱 / MIDI 渲染", "P1 兜底", "代码保留于 legacy/，可编译可运行，主流程不经过（受算力与赛事评审规则约束）"],
    ],
    col_widths_cm=[3.5, 2.0, 10.5])

add_heading(doc, "1.5  非功能需求", 2)
add_bullet(doc, "性能：后端冷启动 ≤ 3s；主流程单步响应 ≤ 30s（依赖云端 LLM）")
add_bullet(doc, "安全：API Key 落盘加 gitignore；CORS 白名单精确三源；Electron contextIsolation 开启")
add_bullet(doc, "可移植：Windows / macOS / Linux 三平台开发一致；打包仅产出 Windows NSIS 安装包")
add_bullet(doc, "可维护：每文件单一职责；system prompt 集中于 prompt_library.py；路由分组注释清晰")

add_page_break(doc)

# ============================================================
# 第二章 概要设计
# ============================================================
add_heading(doc, "第二章  概要设计", 1)

add_heading(doc, "2.1  总体架构", 2)
add_para(doc, "采用「LLM 提示词工程 + 确定性校验算法 + 用户粘贴到 MiniMax 渲染」的混合架构，"
              "前端、后端、外部生成平台三层解耦，每层都可独立替换。",
         indent_first=0.74, space_after=6)

add_code_block(doc,
"""┌────────────────────────────────────────────────────────────────────────┐
│  ① 创作者（专业音乐人）                                                  │
└──────────────┬─────────────────────────────────────────────────────────┘
               │ 输入创意 / 选择押韵 / 切换模式
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  ② 前端（React 19 + TS + Vite + Tailwind + Zustand）                   │
│   · AppLayout / StepIndicator / 三个步骤组件                              │
│   · 状态：currentStep / promptVersions / metaTags / stylesCaption / ...  │
│   · 自动持久化到 localStorage（瞬时状态除外）                              │
└──────────────┬─────────────────────────────────────────────────────────┘
               │ /api/{prompt,lyric,minimax,settings}
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  ③ 后端（FastAPI + Python 3.14，端口 8000）                              │
│   · /api/prompt        优化 / 快速润色 / 版本历史                          │
│   · /api/lyric         歌词生成（确定性净化 + 纯音乐/演唱双模式）           │
│   · /api/minimax       格式校验（确定性算法，不依赖 LLM）                  │
│   · /api/settings/keys 密钥回填（环境变量 > .secrets.json）                │
│   · LLMService：DeepSeek V4 (Pro / Flash)，统一 _chat()                  │
│   · SQLite（aiosqlite）：提示词版本 / 会话元数据                            │
└──────────────┬─────────────────────────────────────────────────────────┘
               │ HTTPS（OpenAI 兼容协议）
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  ④ DeepSeek V4  API  │  https://api.deepseek.com                       │
│   · Pro：提示词优化、歌词生成（中文长文本与结构化输出）                       │
│   · Flash：曲谱 prompt 优化（兜底）、快速润色（短输出）                     │
└──────────────┬─────────────────────────────────────────────────────────┘
               │ 提示词包（.txt）→ 用户复制
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  ⑤ MiniMax 音乐网页版  │  https://minimaxi.com/audio/music              │
│   · Music-3.0 模型（生成时勾选）                                          │
│   · 用户粘贴 Styles / Lyrics → 生成 mp3 → 下载                            │
└────────────────────────────────────────────────────────────────────────┘""", lang="text")

add_heading(doc, "2.2  功能模块图", 2)
add_code_block(doc,
"""┌─────────────────── 古韵AI 主流程 ──────────────────────┐
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ 步骤1        │    │ 步骤2        │    │ 步骤3        │  │
│  │ 提示词创作   │───▶│ 歌词生成     │───▶│ 导出         │  │
│  │             │    │             │    │             │  │
│  │ · 创意输入  │    │ · 押韵偏好  │    │ · 格式校验  │  │
│  │ · AI 优化   │    │ · 纯音乐开关│    │ · 一键打开  │  │
│  │ · 快速润色  │    │ · 歌词编辑  │    │   MiniMax   │  │
│  │ · 元标签编辑│    │ · 结构校验  │    │ · 提示词包  │  │
│  │ · 风格编辑  │    │             │    │   下载      │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │         │
│         ▼                  ▼                  ▼         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  全链路版本管理（SQLite）                            │ │
│  │  original / ai_optimized / human_modified / restored│ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────── 辅助能力 ────────────────────────┐  │
│  │ · 密钥管理（设置面板）· 历史抽屉 · 字符计数 · 复制  │  │
│  │ · MiniMax URL 常量（可切换主站/海外）               │  │
│  │ · Electron openExternal（系统浏览器唤起）          │  │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘""", lang="text")

add_heading(doc, "2.3  数据流", 2)
add_para(doc, "用户的一次完整创作对应一个 session_id（UUID，由前端生成，存于 Zustand persist），"
              "所有提示词版本均按 session_id + step 维度入库。导出提示词包时附带 session_id，"
              "作为「同一创作周期内不同干预版本」的证据链。",
         indent_first=0.74, space_after=4)

add_heading(doc, "2.4  技术选型", 2)
add_table(doc,
    headers=["层", "选型", "理由"],
    rows=[
        ["前端框架", "React 19 + TypeScript", "组件化、类型安全、生态成熟"],
        ["构建工具", "Vite 8", "1.35s 构建；HMR 体验好"],
        ["样式", "Tailwind 4", "utility-first；古风主题 token 化（gold/vermilion/ink/rice）"],
        ["状态管理", "Zustand 5 + persist", "零样板代码；持久化中间件开箱即用"],
        ["后端框架", "FastAPI 0.104+", "异步原生、Pydantic v2 校验、自动 OpenAPI 文档"],
        ["数据库", "SQLite + aiosqlite", "单文件、零运维、参赛作品足够"],
        ["LLM SDK", "OpenAI Python 1.6+", "DeepSeek V4 走 OpenAI 兼容协议，复用客户端"],
        ["桌面壳", "Electron 33 + electron-builder", "主进程拉起后端，渲染进程装前端，无 Node 集成风险"],
        ["后端打包", "PyInstaller 6（spec）", "music21 走 hiddenimports 显式声明"],
    ],
    col_widths_cm=[2.5, 4.0, 9.5])

add_page_break(doc)

# ============================================================
# 第三章 详细设计
# ============================================================
add_heading(doc, "第三章  详细设计", 1)

add_heading(doc, "3.1  关键模块实现", 2)

add_heading(doc, "3.1.1  格式校验器（minimax.py）—— 项目的算法核心", 3)
add_para(doc, "该模块是项目技术创新的集中体现，纯正则实现，不依赖 LLM，是「以原创或改进算法为核心」评分项的实证。",
         indent_first=0.74, space_after=4)
add_bullet(doc, "维护 14 种官方英文结构标签（含连字符 / 空格两种官方写法，共 17 条）")
add_bullet(doc, "中文标签自动映射给出替换建议（如 [主歌] → [Verse]、[导歌] → [Pre-Chorus]）")
add_bullet(doc, "字数硬约束：歌词 ≤ 3500、Styles ≤ 2000（API 口径）")
add_bullet(doc, "6 项元标签完整性检查：[Genre][BPM][Key][Vocals][Instruments][Arrangement]")
add_bullet(doc, "标签行 / 注记行（圆括号）合法性判断；带序号写法支持 [Verse 1] / [Pre-Chorus 2]")

add_code_block(doc,
"""# minimax.py 关键常量（节选）
ALLOWED_TAGS = [
    "Intro", "Verse", "Pre-Chorus", "Pre Chorus", "Chorus", "Interlude",
    "Bridge", "Outro", "Post-Chorus", "Post Chorus", "Transition",
    "Break", "Hook", "Build Up", "Build-Up", "Inst", "Solo",
]
LYRICS_MAX  = 3500    # 歌词字符上限（API 口径）
STYLES_MAX  = 2000    # 风格描述字符上限（API 口径）
STYLES_SHORT = 80     # 风格描述过短阈值（与提示文案「建议 80-200 字」一致）
META_TAG_NAMES = ["Genre", "BPM", "Key", "Vocals", "Instruments", "Arrangement"]""", lang="python")

add_heading(doc, "3.1.2  LLM 调用服务（llm_service.py）", 3)
add_para(doc, "统一 _chat() 拼装消息 + 异常转译 + 截断检测，三类调用仅一行差异。",
         indent_first=0.74, space_after=4)
add_bullet(doc, "V2 起仅依赖 DeepSeek V4（删除千问依赖，单一外部 LLM 降低测试矩阵）")
add_bullet(doc, "Pro：提示词优化、歌词生成（中文长文本 + 结构化输出）")
add_bullet(doc, "Flash：曲谱 prompt 优化、生成、quick_suggest（短输出）")
add_bullet(doc, "v4 系列默认开启思考模式，创作类任务关闭以降低延迟与输出噪声（DEEPSEEK_DISABLE_THINKING）")
add_bullet(doc, "检测 finish_reason == \"length\"，半截输出抛 LLMServiceError 而非静默入库")

add_heading(doc, "3.1.3  提示词全链路版本管理", 3)
add_para(doc, "Zustand store + SQLite 双写，确保「人工干预充分」评分项有可审计的版本链。",
         indent_first=0.74, space_after=4)
add_table(doc,
    headers=["版本类型 type", "触发时机", "证据作用"],
    rows=[
        ["original", "用户首次输入 / 切到新会话", "创意起点"],
        ["ai_optimized", "调用 /api/prompt/optimize 后", "AI 参与轨迹"],
        ["human_modified", "用户二次编辑后回写", "★ 人工干预的直接证据"],
        ["restored", "从历史回溯", "决策可逆性"],
    ],
    col_widths_cm=[3.0, 5.5, 7.5])

add_heading(doc, "3.2  数据库设计", 2)
add_code_block(doc,
"""-- prompt_versions 表（节选）
CREATE TABLE IF NOT EXISTS prompt_versions (
    id           TEXT PRIMARY KEY,        -- UUID
    session_id   TEXT NOT NULL,           -- 创作会话 ID
    step         TEXT NOT NULL,           -- 'prompt' | 'lyric' | 'score'(legacy)
    type         TEXT NOT NULL,           -- original/ai_optimized/human_modified/restored
    content      TEXT NOT NULL,           -- 提示词原文
    parent_id    TEXT,                    -- 父版本 ID（支持版本树）
    note         TEXT,                    -- 用户备注
    created_at   TEXT NOT NULL            -- ISO8601
);""", lang="sql")

add_heading(doc, "3.3  界面设计", 2)
add_para(doc, "三步主流程 + 步骤指示器 + 设置抽屉，详见测试截图（位于 文档/../测试截图/ 目录）：",
         indent_first=0.74, space_after=4)
add_table(doc,
    headers=["截图", "文件名", "展示内容"],
    rows=[
        ["①", "1-输入创意.png", "步骤 1：用户输入创意描述，点击「生成 MiniMax 提示词」"],
        ["②", "2-生成元标签与风格描述.png", "AI 输出 6 项结构化元标签 + 风格描述，可编辑"],
        ["③", "3-生成MiniMax格式歌词.png", "步骤 2：歌词生成，纯音乐 / 演唱双模式切换"],
        ["④", "4-导出提示词包与格式校验.png", "步骤 3：格式校验 + 一键打开 MiniMax 创作页 + 导出 .txt"],
    ],
    col_widths_cm=[1.5, 5.5, 9.0])

add_heading(doc, "3.4  MiniMax 跳转集成", 2)
add_para(doc, "V2.3 关键改进：在主流程每个步骤都嵌入「打开 MiniMax 创作页」入口，确保提示词生成完毕可立即投入使用。",
         indent_first=0.74, space_after=4)
add_table(doc,
    headers=["位置", "形式", "行为"],
    rows=[
        ["AppLayout 顶部", "🎵 MiniMax 按钮（常驻）", "IPC 调主进程 shell.openExternal，系统默认浏览器打开"],
        ["PromptStep / LyricStep 标题下", "「🎵 打开 MiniMax 音乐创作页」胶囊按钮", "同上，提示用户先去看一眼目标平台"],
        ["ExportStep 右栏 MiniMaxSteps 卡片顶部", "「🚀 立即在 MiniMax 中创作」主按钮", "★ 先复制完整提示词包到剪贴板，再打开 URL；用户到对应输入框直接粘贴"],
    ],
    col_widths_cm=[5.0, 5.5, 5.5])

add_code_block(doc,
"""// frontend/src/utils/external.ts —— 跨端打开外部链接
export function openExternal(url: string): boolean {
  if (!url) return false
  // 桌面态：优先 IPC（系统默认浏览器）
  if (window.electronAPI?.openExternal) {
    void window.electronAPI.openExternal(url)
    return true
  }
  // 浏览器态：window.open 兜底
  const w = window.open(url, '_blank', 'noopener,noreferrer')
  return !!w
}""", lang="typescript")

add_code_block(doc,
"""// electron/main.js —— 严格白名单，仅放行 http/https
ipcMain.handle('open-external', async (_event, url) => {
  if (typeof url !== 'string') return false
  if (!/^https?:\\/\\//i.test(url)) return false   // 挡掉自定义协议注入
  await shell.openExternal(url)
  return true
})""", lang="javascript")

add_heading(doc, "3.5  安全设计", 2)
add_bullet(doc, "API Key 落盘：环境变量 > .secrets.json（已 gitignore），启动时回填；设置面板改 Key 立即落盘")
add_bullet(doc, "CORS 白名单：仅放行 http://localhost:5173、http://127.0.0.1:5173、null（Electron file://）")
add_bullet(doc, "Electron：contextIsolation: true、nodeIntegration: false，渲染进程零 Node 能力")
add_bullet(doc, "IPC 白名单：open-external 处理器显式校验协议为 http(s) 再调 shell.openExternal")

add_page_break(doc)

# ============================================================
# 第四章 测试报告
# ============================================================
add_heading(doc, "第四章  测试报告", 1)

add_heading(doc, "4.1  测试环境", 2)
add_table(doc,
    headers=["维度", "配置"],
    rows=[
        ["操作系统", "Windows 11（中文）"],
        ["Python", "3.14.3（含 fastapi 0.104+, uvicorn 0.24+, openai 1.6+, music21 9.1+）"],
        ["Node.js", "v25.7.0（npm 11.12.1）"],
        ["浏览器", "Electron 33 内核（Chromium 130+）"],
        ["LLM 端点", "https://api.deepseek.com（deepseek-v4-pro / deepseek-v4-flash）"],
        ["生成端点", "https://minimaxi.com/audio/music（Music-3.0，订阅会员账号）"],
    ],
    col_widths_cm=[3.0, 13.0])

add_heading(doc, "4.2  后端冒烟测试", 2)
add_table(doc,
    headers=["用例", "期望", "实测", "结论"],
    rows=[
        ["服务冷启动", "≤ 3s 内 HTTP 200", "约 2.16s（重构后实测）", "✓ 通过"],
        ["GET /", "返回 message", "200 / AI音乐生成后端服务", "✓ 通过"],
        ["GET /api/settings/keys/status", "仅 deepseek_configured", "{\"deepseek_configured\":true}", "✓ 通过"],
        ["POST /api/settings/keys（仅 deepseek_api_key）", "200，状态正确", "200 / 状态正确", "✓ 通过"],
        ["GET /api/minimax/format-spec", "返回 14 标签 + 字数上限 + 元标签 6 项", "完整 JSON 返回", "✓ 通过"],
        ["POST /api/minimax/validate", "返回 issues + stats", "含 styles_chars / lyrics_chars / sections 数组", "✓ 通过"],
    ],
    col_widths_cm=[5.0, 4.0, 4.5, 2.5])

add_heading(doc, "4.3  端到端真实生成（e2e_test.py）", 2)
add_para(doc, "主题：匠心传承（非遗晚会场景），DeepSeek Pro 真实 API 调用，输出结果存档于 backend/tests/e2e_result.json。",
         indent_first=0.74, space_after=4)
add_table(doc,
    headers=["指标", "实测值", "MiniMax 上限", "结论"],
    rows=[
        ["Styles 字符数", "162", "2000", "✓ 充裕（80-200 字建议区间内）"],
        ["Lyrics 字符数", "428", "3500", "✓ 充裕"],
        ["段落数", "10", "无硬上限", "✓ 结构完整（Intro/Verse 1/Pre-Chorus/Chorus/Verse 2/.../Outro）"],
        ["校验结果", "ok: true, issues: []", "无 error 级问题", "✓ 通过"],
        ["标签合法性", "全部为 ALLOWED_TAGS 子集", "14 种英文标签", "✓ 全部命中"],
    ],
    col_widths_cm=[4.0, 4.0, 4.0, 4.0])

add_para(doc, "生成歌词片段：", indent_first=0.74, space_after=4)
add_code_block(doc,
"""[Intro]
(古筝泛音与笛声散板对答，空灵悠远)

[Verse 1]
一脉心传未曾移
青石巷里旧人衣
千锤百炼成器日
炉火纯青照夜溪

[Chorus]
山河为卷写传奇
岁月成歌贯东西
匠心未老春常在
星河万点照天梯

[Outro]
(古筝泛音与笛声远引，余韵悠悠)
纤毫落处见虹霓
一脉悠悠照古碑""", lang="text")

add_heading(doc, "4.4  前端构建与类型检查", 2)
add_table(doc,
    headers=["指标", "数值", "备注"],
    rows=[
        ["TypeScript 类型检查", "0 错误", "tsc -b 通过"],
        ["Vite 生产构建", "1.35s", "含 tsc 类型检查"],
        ["主 JS 产物", "225.79 kB（gzip 70.84 kB）", "单一 chunk，无 dynamic import"],
        ["CSS 产物", "24.67 kB（gzip 5.15 kB）", "Tailwind 4 编译输出"],
        ["构建模块数", "38", "去除兜底组件后明显瘦身"],
    ],
    col_widths_cm=[4.5, 5.0, 6.5])

add_heading(doc, "4.5  MiniMax 端到端验证（V2.3 验收项）", 2)
add_para(doc, "在已订阅 MiniMax 会员的浏览器会话中实测：", indent_first=0.74, space_after=4)
add_bullet(doc, "✓ 打开 https://minimaxi.com/audio/music 可直接进入 Music-3.0 创作页")
add_bullet(doc, "✓ 将古韵 AI 导出的 Styles 文本粘贴到「风格」输入框，无字符截断")
add_bullet(doc, "✓ 将歌词粘贴到「歌词」输入框，14 种英文结构标签全部识别生效")
add_bullet(doc, "✓ 切换「纯音乐」开关后，歌词框留空可正常生成纯音乐")
add_bullet(doc, "✓ 生成的 mp3 试听无水印，下载链接有效")

add_heading(doc, "4.6  已知边界", 2)
add_bullet(doc, "DeepSeek API 偶发 429 限流：后端统一转 502 提示「AI 服务暂时不可用」，前端展示可重试")
add_bullet(doc, "v4 Flash 模型偶发 finish_reason=\"length\"：歌词较短时罕见，已在 LLMService 抛错转 502")
add_bullet(doc, "歌词超 3500 字符：导出页校验拦截，强制返回步骤 2 精简")

add_page_break(doc)

# ============================================================
# 第五章 安装及使用
# ============================================================
add_heading(doc, "第五章  安装及使用", 1)

add_heading(doc, "5.1  开发环境安装", 2)
add_code_block(doc,
"""# 1. 克隆代码
git clone <your-repo-url> guyun-ai
cd guyun-ai

# 2. 安装后端依赖（Python 3.13+）
cd backend
python -m pip install -r requirements.txt
cp .env.example .env       # 填入 DEEPSEEK_API_KEY

# 3. 安装前端依赖（Node 20+）
cd ../frontend
npm install

# 4. 启动开发态（两个进程）
#    终端 A：后端（http://127.0.0.1:8000）
cd ../backend
python -m uvicorn app.main:app --reload --port 8000

#    终端 B：前端（http://localhost:5173）
cd ../frontend
npm run dev""", lang="bash")

add_heading(doc, "5.2  典型使用流程", 2)
add_bullet(doc, "打开应用，进入「提示词创作」步骤")
add_bullet(doc, "输入创意描述（如「写一首匠心传承主题的古风歌，古筝与笛子对答」）")
add_bullet(doc, "点击「生成 MiniMax 提示词」，AI 输出 6 项结构化元标签 + 风格描述")
add_bullet(doc, "在元标签 / 风格描述框中按需编辑（任意修改都会被记录为 human_modified 版本）")
add_bullet(doc, "点击「确认提示词，进入歌词创作」")
add_bullet(doc, "选择押韵偏好 / 切换纯音乐模式 → 「生成歌词」")
add_bullet(doc, "在 LyricEditor 中可手工微调歌词任意段落")
add_bullet(doc, "点击「确认歌词，进入导出」")
add_bullet(doc, "页面自动做格式校验，校验通过后：")
add_bullet(doc, "    · 右侧「🚀 立即在 MiniMax 中创作」按钮 → 自动复制提示词包 + 打开 MiniMax 网页")
add_bullet(doc, "    · 或「导出提示词包 (.txt)」按钮 → 下载完整提示词包作为创作过程存档")
add_bullet(doc, "在 MiniMax 创作页粘贴 → 生成 mp3 → 下载")

add_heading(doc, "5.3  生产打包", 2)
add_code_block(doc,
"""# 在项目根目录（依赖已就绪）
cd guyun-ai

# 一键：前端构建 + 后端 PyInstaller + Electron NSIS
npm run build
# 产物：release/古韵AI Setup x.y.z.exe（NSIS 安装包）""", lang="bash")

add_heading(doc, "5.4  密钥管理", 2)
add_bullet(doc, "环境变量方式（推荐用于开发）：在 backend/.env 写入 DEEPSEEK_API_KEY=sk-xxx")
add_bullet(doc, "设置面板方式（推荐用于普通用户）：点击右上角 ⚙ → 填入 Key → 保存；后端 .secrets.json 持久化（已 gitignore）")
add_bullet(doc, "优先级：环境变量 > .secrets.json；环境变量已配置时不会被文件覆盖")

add_heading(doc, "5.5  常见问题", 2)
add_table(doc,
    headers=["现象", "原因与解决"],
    rows=[
        ["后端启动报 urllib3 版本警告", "无害，requests 库对 urllib3 版本要求宽松；可忽略"],
        ["前端打不开 / 接口 404", "确认后端 8000 端口已起；浏览器访问 http://127.0.0.1:8000/ 验证"],
        ["AI 优化返回格式异常", "概率性 LLM 输出污染，已在 /api/minimax/validate 兜底拦截；点「重新生成」重试"],
        ["歌词超 3500 字符", "导出页禁止进入；返回步骤 2 精简歌词 / 删减段落"],
        ["桌面态打开外部链接失败", "确认 electron/main.js 已注册 open-external IPC；非 http(s) URL 会被白名单挡掉"],
        ["密钥状态始终 false", "检查 .secrets.json 权限；或重启后端强制回填"],
    ],
    col_widths_cm=[5.0, 11.0])

add_page_break(doc)

# ============================================================
# 第六章 项目总结
# ============================================================
add_heading(doc, "第六章  项目总结", 1)

add_heading(doc, "6.1  关键技术决策", 2)
add_bullet(doc, "不依赖端到端音乐生成大模型：MiniMax 音乐 API 2026-08-20 后对新用户停服；开源 MiniMax-Music3 需 24GB 显存")
add_bullet(doc, "采用 LLM + 确定性算法混合架构：LLM 出文，本地算法校验与结构化 → 解决 LLM 输出不可控的根本痛点")
add_bullet(doc, "V2.3 起移除千问：单一外部 LLM 降低测试矩阵，DeepSeek V4 (Pro/Flash) 已能满足全部文本任务")
add_bullet(doc, "MiniMax 跳转深度集成：每个步骤都有「打开 MiniMax」入口，导出页一键复制+打开，确保提示词生成完毕可立即投入使用")
add_bullet(doc, "全链路版本管理作为「人工干预充分」的天然证据：契合手册 65% 权重中的「创作技能」评分项")

add_heading(doc, "6.2  团队分工", 2)
add_table(doc,
    headers=["角色", "职责"],
    rows=[
        ["产品 / 算法", "需求拆解、提示词工程、格式校验算法设计"],
        ["前端", "React + TS + Tailwind + Zustand，三步主流程 + 设置面板 + 历史抽屉"],
        ["后端", "FastAPI 路由分组、LLM 服务封装、SQLite 持久化、密钥管理"],
        ["桌面端", "Electron 主进程 spawn 后端 + 加载前端 + IPC 桥接外部链接"],
        ["文档 / 答辩", "SRS / 参赛方案 / 本设计文档 / 演示视频 / 答辩材料"],
    ],
    col_widths_cm=[3.0, 13.0])

add_heading(doc, "6.3  升级演进", 2)
add_bullet(doc, "短期：增加多主题预设（如「边塞」「江南」「禅意」）一键载入，降低用户冷启动成本")
add_bullet(doc, "中期：支持一次导出多版本提示词包（多 BPM / 多情绪）→ A/B 试投 MiniMax")
add_bullet(doc, "长期：扩展到其他 AI 音乐平台（除 MiniMax 外）的格式适配；引入 MIDI 兜底管线作为离线场景的最后保险")

add_heading(doc, "6.4  商业推广", 2)
add_para(doc, "本作品面向古风音乐创作细分市场，目标用户为：古风音乐人、词作者、高校音乐专业师生、"
              "非遗主题晚会导演、文旅 / 影视 / 游戏行业的古风配乐需求方。可通过以下路径推广：",
         indent_first=0.74, space_after=4)
add_bullet(doc, "音乐人社区：网易云音乐、QQ 音乐、B 站的古风音乐创作圈子")
add_bullet(doc, "高校合作：与音乐学院 / 传媒学院合作，纳入「AI 辅助创作」教学案例")
add_bullet(doc, "非遗晚会：与各地非遗中心、文旅局合作，提供「非遗主题 + AI 配乐」一站式服务")

add_heading(doc, "6.5  心得体会", 2)
add_para(doc,
    "本项目最大的体会是：在 AI 生成不可控的领域，「围绕生成结果做工程」比「让 AI 一次出成品」更靠谱。"
    "本系统通过把 LLM 的输出框定在「提示词」这一天然可审计、可编辑、可复现的载体上，"
    "既享受了 LLM 的创意能力，又通过确定性算法（格式校验器）和版本管理把不确定性压到了最低。"
    "这正是 AI 音乐赛道「人工干预充分」评分项的本意——不是不让人工干预，而是让干预可见、可证、可复现。",
    indent_first=0.74, space_after=4)

# 参考文献（最小化，按官方模板）
add_heading(doc, "参考文献", 2)
add_bullet(doc, "[1] 2026 年（第 3 届）全国大学生数智链应用大赛组织委员会. 2026 年参赛手册 [Z]. 2026.")
add_bullet(doc, "[2] DeepSeek API. API Documentation [EB/OL]. https://api-docs.deepseek.com, 2026-09.")
add_bullet(doc, "[3] MiniMax. Music 3.0 Creator Beta [EB/OL]. https://minimaxi.com/audio/music, 2026.")
add_bullet(doc, "[4] IEEE. IEEE 830-1998 Recommended Practice for Software Requirements Specifications [S]. 1998.")
add_bullet(doc, "[5] 中华人民共和国国家质量监督检验检疫总局, 中国国家标准化管理委员会. GB/T 9704-2012 党政机关公文格式 [S]. 2012.")
add_bullet(doc, "[6] FastAPI Documentation [EB/OL]. https://fastapi.tiangolo.com, 2026.")
add_bullet(doc, "[7] React 19 Documentation [EB/OL]. https://react.dev, 2026.")
add_bullet(doc, "[8] Vite Documentation [EB/OL]. https://vite.dev, 2026.")
add_bullet(doc, "[9] Zustand Documentation [EB/OL]. https://zustand.docs.pmnd.rs, 2026.")
add_bullet(doc, "[10] Electron Documentation [EB/OL]. https://www.electronjs.org/docs, 2026.")

# 保存
doc.save(OUT_PATH)
print(f"[OK] 文档已生成：{OUT_PATH}")
print(f"[OK] 文件大小：{OUT_PATH.stat().st_size:,} bytes")
