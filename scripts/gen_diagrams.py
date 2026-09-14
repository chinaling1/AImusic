# -*- coding: utf-8 -*-
"""
用 graphviz 生成《设计与开发文档》第二章的两张架构图。
- 图 2.1  总体架构（5 层，垂直栈式 + 标注数据流）
- 图 2.2  功能模块图（3 步主流程横向 + 中部数据层 + 底部辅助能力）
"""
from pathlib import Path
from graphviz import Digraph

OUT_DIR = Path(r"G:\cunchu\大学\作业\AI音乐\scripts\diagrams")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 古风主题色
GOLD = "#B8860B"
GOLD_LIGHT = "#F5E6A8"
INK = "#1A1A2E"
INK_LIGHT = "#2A2A4E"
VERMILION = "#C0392B"
VERMILION_LIGHT = "#E0633C"
RICE = "#F4F1E8"
JADE = "#5B9279"
LAVENDER = "#7E6BC4"
CLOUD = "#3D3D60"


# ============================================================
# 图 2.1  总体架构（垂直栈 + 用户顶部 + 平台云端右侧）
# ============================================================
g1 = Digraph("arch_overall", format="png")
g1.attr(
    rankdir="TB",
    bgcolor="white",
    fontname="Microsoft YaHei",
    splines="spline",
    nodesep="0.30",
    ranksep="0.40",
    pad="0.3",
    dpi="160",
)
g1.attr("node",
    fontname="Microsoft YaHei", fontsize="10.5",
    style="filled,rounded", color=GOLD, penwidth="1.4",
)
g1.attr("edge",
    fontname="Microsoft YaHei", fontsize="9",
    color=GOLD, penwidth="1.2", arrowsize="0.8",
)

# ---- 用户（顶部，唯一源点） ----
g1.node("user",
    "创作者  User\n（专业音乐人 / 词作者 / 非遗晚会导演）",
    shape="box3d", fillcolor=LAVENDER, fontcolor="white",
    fontsize="11", width="4.0", height="0.6", penwidth="2.0")

# ---- 前端层 cluster ----
with g1.subgraph(name="cluster_fe") as fe:
    fe.attr(label="前端层  Frontend  ·  React 19 + TypeScript + Vite + Tailwind + Zustand",
             fontname="Microsoft YaHei", fontsize="11", labelloc="t",
             style="rounded,dashed", color=GOLD, penwidth="1.2")
    fe.node("fe_step1", "PromptStep\n创意 → 6 项元标签 + 风格描述",
            shape="box", fillcolor=GOLD_LIGHT, fontcolor=INK, width="3.0")
    fe.node("fe_step2", "LyricStep\n押韵 / 纯音乐 → 英文结构标签歌词",
            shape="box", fillcolor=GOLD_LIGHT, fontcolor=INK, width="3.0")
    fe.node("fe_step3", "ExportStep\n格式校验 + 一键打开 MiniMax",
            shape="box", fillcolor=GOLD_LIGHT, fontcolor=INK, width="3.0")
    fe.node("fe_layout", "AppLayout · 步骤指示器 · 🎵 MiniMax 入口",
            shape="note", fillcolor=INK_LIGHT, fontcolor="white", width="3.0")

# ---- 后端层 cluster ----
with g1.subgraph(name="cluster_be") as be:
    be.attr(label="后端层  Backend  ·  FastAPI  ·  Python 3.14  ·  端口 8000",
             fontname="Microsoft YaHei", fontsize="11", labelloc="t",
             style="rounded,dashed", color=JADE, penwidth="1.2")
    be.node("be_prompt", "/api/prompt\n优化 · 快速润色 · 版本历史",
            shape="box", fillcolor=RICE, fontcolor=INK)
    be.node("be_lyric",  "/api/lyric\n歌词生成（双模式 + 确定性净化）",
            shape="box", fillcolor=RICE, fontcolor=INK)
    be.node("be_minimax","/api/minimax\n格式校验（确定性算法 · 核心）",
            shape="box", fillcolor=VERMILION_LIGHT, fontcolor="white", penwidth="2.0")
    be.node("be_keys",   "/api/settings/keys\n密钥回填（环境变量 > 文件）",
            shape="box", fillcolor=RICE, fontcolor=INK)
    be.node("be_llm",    "LLMService\n统一 _chat() · 截断检测 · 异常转译",
            shape="component", fillcolor=INK, fontcolor="white", width="2.2")
    be.node("be_db",     "SQLite (aiosqlite)\nprompt_versions 表",
            shape="cylinder", fillcolor=JADE, fontcolor="white", width="1.6")
    be.edge("be_prompt", "be_llm", style="dashed", color=INK, arrowhead="none")
    be.edge("be_lyric",  "be_llm", style="dashed", color=INK, arrowhead="none")
    be.edge("be_minimax","be_db", style="dotted", color=JADE, arrowhead="none")
    be.edge("be_llm",    "be_db", style="dotted", color=JADE)

# ---- 平台云端（右侧浮岛） ----
g1.node("deepseek",
    "DeepSeek V4  API\nhttps://api.deepseek.com\ndeepseek-v4-pro / deepseek-v4-flash",
    shape="box", fillcolor=CLOUD, fontcolor="white",
    fontsize="10.5", width="3.2", style="filled,rounded,dashed", penwidth="1.6")
g1.node("minimax",
    "MiniMax 音乐网页版\nhttps://minimaxi.com/audio/music\nMusic-3.0  (会员账号)",
    shape="box", fillcolor=VERMILION, fontcolor="white",
    fontsize="10.5", width="3.2", style="filled,rounded,dashed", penwidth="1.6")

# ---- 主流程边 ----
g1.edge("user", "fe_layout", label="① 打开 / 输入创意 / 切换模式", fontcolor=INK, color=LAVENDER, penwidth="1.6")
g1.edge("fe_step1", "be_prompt",  label="② POST /api/prompt/optimize", fontcolor=INK)
g1.edge("fe_step2", "be_lyric",   label="③ POST /api/lyric/generate",  fontcolor=INK)
g1.edge("fe_step3", "be_minimax", label="④ POST /api/minimax/validate", fontcolor=INK)
g1.edge("fe_layout","be_keys",    label="⑤ POST /api/settings/keys",   fontcolor=INK, style="dashed")
g1.edge("be_llm",   "deepseek",   label="⑥ HTTPS  OpenAI 兼容协议",    fontcolor=CLOUD, style="bold", color=CLOUD, penwidth="1.8")
g1.edge("fe_step3", "minimax",    label="⑦ 复制提示词包 + 打开\nIPC → 系统默认浏览器",
         fontcolor=VERMILION, style="bold", color=VERMILION, penwidth="2.0")
g1.edge("minimax",  "user",       label="⑧ 粘贴 Styles / Lyrics → 生成 mp3",
         fontcolor=VERMILION, style="bold", color=VERMILION, penwidth="2.0")

g1.render(filename="arch_overall", directory=str(OUT_DIR), cleanup=True)
print(f"[OK] 2.1 总体架构图 → {OUT_DIR / 'arch_overall.png'}")


# ============================================================
# 图 2.2  功能模块图（横向 3 步 + 中部数据层 + 底部辅助能力）
# ============================================================
g2 = Digraph("arch_modules", format="png")
g2.attr(
    rankdir="TB",
    bgcolor="white",
    fontname="Microsoft YaHei",
    splines="spline",
    nodesep="0.30",
    ranksep="0.35",
    pad="0.3",
    dpi="160",
)
g2.attr("node", fontname="Microsoft YaHei", fontsize="10.5",
        style="filled,rounded", penwidth="1.4")
g2.attr("edge", fontname="Microsoft YaHei", fontsize="9",
        color=GOLD, penwidth="1.2", arrowsize="0.8")

# ---- 3 步主流程（同一 rank 强制横向） ----
with g2.subgraph() as s:
    s.attr(rank="same")
    s.node("m1",
        "步骤 1 · 提示词创作\nPromptStep\n━━━━━━━━━━━━━━━━\n· 创意输入\n· AI 优化（DeepSeek Pro）\n· 快速润色（DeepSeek Flash）\n· 6 项元标签编辑\n· 风格描述编辑\n· 历史版本抽屉",
        shape="box", fillcolor=GOLD_LIGHT, fontcolor=INK, width="3.2", height="2.6")
    s.node("m2",
        "步骤 2 · 歌词生成\nLyricStep\n━━━━━━━━━━━━━━━━\n· 押韵偏好（ang/an/ing/ou/自动）\n· 纯音乐模式开关\n· AI 歌词生成（DeepSeek Pro）\n· LyricEditor 手工微调\n· 14 种结构标签校验",
        shape="box", fillcolor=GOLD_LIGHT, fontcolor=INK, width="3.2", height="2.6")
    s.node("m3",
        "步骤 3 · 导出与跳转\nExportStep\n━━━━━━━━━━━━━━━━\n· 确定性格式校验\n· 段落结构展示\n· 🚀 一键打开 MiniMax\n· 提示词包 .txt 导出\n· 校验结果可视化",
        shape="box", fillcolor=VERMILION_LIGHT, fontcolor="white",
        width="3.2", height="2.6", penwidth="2.0")

# ---- 数据层（中部） ----
g2.node("db",
    "全链路版本管理  Versioning  ·  SQLite (aiosqlite)\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    "version type:  original · ai_optimized · human_modified · restored\n"
    "session_id  +  step  +  parent_id  +  note  +  created_at",
    shape="cylinder", fillcolor=INK, fontcolor="white",
    width="11", height="1.0", penwidth="1.6")

# ---- 辅助能力（底部） ----
g2.node("aux",
    "辅助能力  Auxiliary  Capabilities\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    "· 密钥管理（设置面板）· 字符计数 · 复制按钮 · 历史抽屉\n"
    "· MINIMAX_MUSIC_URL 常量（主站 / 海外 可切换）\n"
    "· openExternal 工具：Electron 走 IPC → 系统默认浏览器；浏览器态走 window.open",
    shape="box", fillcolor=RICE, fontcolor=INK,
    width="11", height="0.9",
    style="filled,rounded,dashed")

# ---- 横向流转 ----
g2.edge("m1", "m2", label="确认提示词 →", color=GOLD, penwidth="1.8", fontcolor=INK)
g2.edge("m2", "m3", label="确认歌词 →",   color=GOLD, penwidth="1.8", fontcolor=INK)

# ---- 三个步骤都写版本 ----
g2.edge("m1", "db", style="dashed", color=INK, label="写", fontcolor=INK, arrowsize="0.7")
g2.edge("m2", "db", style="dashed", color=INK, label="写", fontcolor=INK, arrowsize="0.7")
g2.edge("m3", "db", style="dashed", color=INK, label="读", fontcolor=INK, arrowsize="0.7")

# ---- 历史回溯（DB → m1） ----
g2.edge("db", "m1", style="dotted", color=GOLD, label="回溯历史", fontcolor=GOLD,
        constraint="false", penwidth="1.4")

# ---- 辅助能力指向上层三步 ----
g2.edge("aux", "m1", style="dotted", color=GOLD, arrowhead="none")
g2.edge("aux", "m2", style="dotted", color=GOLD, arrowhead="none")
g2.edge("aux", "m3", style="dotted", color=GOLD, arrowhead="none")

g2.render(filename="arch_modules", directory=str(OUT_DIR), cleanup=True)
print(f"[OK] 2.2 功能模块图 → {OUT_DIR / 'arch_modules.png'}")
