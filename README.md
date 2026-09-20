# 古韵AI — 古风音乐提示词工坊

[![Electron](https://img.shields.io/badge/Electron-33-47848F)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

> 面向专业音乐人的古风 AI 创作工具：提示词工程 → 歌词生成 → 格式校验 → 提示词包导出，三步产出可直接喂给商用 AI 音乐平台的结构化输入。

---

## 项目简介

「古韵AI」是一款桌面端（Windows）AI 古风音乐创作辅助工具。区别于常见的"一键抽卡式"端到端音乐生成，它把工作流拆成可控的三步：

1. **提示词优化**：DeepSeek Pro 把用户的自然语言描述改写成结构化的古风音乐提示词（含调式、节拍、结构、配器）
2. **歌词生成**：基于确认的提示词生成带段落标签的歌词（主歌 / 副歌 / 桥段）
3. **格式校验 + 导出**：确定性算法校验输出符合 MiniMax 风格描述（Structured Caption）规范，导出可直接喂给 MiniMax Audio / Suno / Udio 等商用平台的提示词包

**核心定位**：本地做提示词工程与确定性校验，云端大模型负责创意文本，商用平台负责成品音频 —— 不与音乐学院比拼艺术表达，只做"可审计、可复现、可举证的人工干预链"。

---

## 仓库结构

```
.
├── backend/            # Python FastAPI 后端（提示词 / 歌词 / 校验）
│   ├── app/
│   │   ├── routers/    # REST 路由（prompt / lyric / minimax / settings）
│   │   ├── services/   # LLM 客户端、prompt 库
│   │   ├── prompts/    # system prompt 集中管理
│   │   └── config.py   # 环境变量与本地密钥文件读取
│   ├── tests/          # 端到端测试（API + Playwright UI）
│   ├── requirements.txt
│   └── gu-yun-backend.spec   # PyInstaller 打包配置
├── frontend/           # React + Vite + Tailwind 前端
│   ├── src/            # 组件、store、API 层
│   ├── public/         # 静态资源
│   └── package.json
├── electron/           # Electron 主进程与 preload
│   ├── main.js         # 窗口管理 + 后端生命周期
│   ├── preload.js      # contextBridge 暴露受限能力
│   └── icon.*
├── 文档/                # 设计文档、变更说明、审核报告
├── 参考资料/            # 比赛官方文档（公开）
├── package.json        # npm scripts（dev / build / start）
├── .env.example        # 环境变量示例
├── .gitignore
├── SRS.md              # 软件需求规格说明书
└── README.md
```

---

## 快速开始（开发态）

### 前置依赖

- Node.js ≥ 18
- Python ≥ 3.10
- Windows 10/11（electron-builder 仅配置了 NSIS / win target）

### 安装

```powershell
# 后端依赖
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 前端依赖
cd ..\frontend
npm install
```

### 配置环境变量

复制根 `.env.example` 为 `backend/.env`，填入你的 DeepSeek API Key：

```bash
DEEPSEEK_API_KEY=sk-your-real-key-here
```

> 也可以不写环境变量，启动后通过应用内的「设置」面板填入。设置会持久化到 `backend/app/.secrets.json`（已在 .gitignore 中），重启后无需重新输入。

### 启动

```powershell
# 终端 1：后端
cd backend
python -m uvicorn app.main:app --reload --port 8000

# 终端 2：前端
cd frontend
npm run dev

# 终端 3：Electron 桌面壳
cd ..
npm start
```

浏览器访问 `http://localhost:5173`，或等 Electron 窗口弹出。

### 一键构建

```powershell
npm run build         # 前端构建 + 后端 PyInstaller 打包 + electron-builder 打包
```

产物在 `release/win-unpacked/` 与 `release/古韵AI Setup x.y.z.exe`。

---

## API 速览

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/prompt/optimize` | POST | 提示词优化（DeepSeek Pro） |
| `/api/prompt/quick-suggest` | POST | 快速润色（DeepSeek Flash） |
| `/api/prompt/versions` | GET / POST | 提示词版本历史 |
| `/api/lyric/generate` | POST | 歌词生成（DeepSeek Pro） |
| `/api/lyric/save` | POST | 锁定歌词 |
| `/api/minimax/validate` | POST | MiniMax Structured Caption 格式校验 |
| `/api/minimax/spec` | GET | 当前格式规格定义 |
| `/api/settings/keys` | POST | 更新 API Key（内存 + 本地持久化） |
| `/api/settings/keys/status` | GET | 查询 Key 配置状态（不返回明文） |

启动文档：`http://127.0.0.1:8000/docs`。

---

## 技术栈

| 层 | 选型 | 备注 |
|---|---|---|
| 桌面壳 | Electron 33 | 主进程拉起打包后的后端 exe，preload 暴露受限 API |
| 前端 | React 19 + Vite 8 + Tailwind 4 | Zustand 做状态管理，TypeScript |
| 后端 | FastAPI + Uvicorn | OpenAI 兼容 SDK 调用 DeepSeek |
| LLM | DeepSeek Pro / Flash | V2 起的唯一外部文本依赖 |
| 打包 | electron-builder + PyInstaller | NSIS 安装包 |
| 测试 | pytest + Playwright | 后端 API + 真实浏览器 UI |

---

## 安全与隐私

- **API Key** 只通过环境变量或本地 `backend/app/.secrets.json` 传入，不会上传任何远端
- 密钥持久化文件 `backend/app/.secrets.json` 已在 `.gitignore` 中（`*` 注释确认）
- 前端经 preload 注入的 `window.electronAPI.openExternal` 限定 `http/https`，挡掉自定义协议注入
- 后端 CORS 仅放行本地来源（`http://localhost:5173` / `http://127.0.0.1:5173` / `file://` 的 `null` Origin），不放行 `*`

---

## 开发约定

- 提交前确认 `npm run lint`、`python -m pytest`、`npm run build` 全部通过
- `system prompt` 集中在 `backend/app/prompts/prompt_library.py`，不在 router / service 里写长 prompt
- 新增 LLM 调用统一走 `services/llm_service.py::_chat()`，不要在 router 里直接拼 `messages`
- 前端组件放 `frontend/src/components/`，跨页通用件放 `frontend/src/components/common/`

---

## License

[MIT](./LICENSE)

---

## 致谢

- DeepSeek 提供文本生成能力
- MiniMax Audio / Suno / Udio 提供商用成品音频渲染
- 所有开源依赖（详见 `backend/requirements.txt` 与 `frontend/package.json`）