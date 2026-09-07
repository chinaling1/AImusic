# AI古风音乐创作系统 — 实施计划

## 项目概述
面向专业人士的AI古风音乐创作工具，将创作流程分为4步：提示词优化 → 歌词生成 → 曲谱生成 → MIDI导出。每步均支持AI辅助与人工修改的闭环协作。

**核心要求**: 所有步骤的提示词（原始输入、AI修改、人工修改）必须准确、完整、可追溯地记录。

---

## 技术选型

### 前端
- **框架**: React + TypeScript (Vite构建)
- **UI**: TailwindCSS + shadcn/ui 组件库
- **曲谱渲染**: abcjs (ABC记谱法) 或 VexFlow (五线谱/简谱渲染)
- **音频播放**: Web Audio API + Tone.js (音频合成与播放)
- **MIDI预览**: midi-player-js

### 后端
- **框架**: Python FastAPI
- **AI/LLM调用**: 通过API调用大语言模型进行提示词优化、歌词生成、曲谱生成
- **音乐处理**: music21 (Python音乐库，用于曲谱解析与MIDI转换)
- **音频合成**: FluidSynth (将MIDI渲染为音频) 或使用 soundfonts

### 文件存储
- 歌词文件: `.lrc` 格式 (带时间戳的歌词文件，业界标准)
- 曲谱文件: ABC记谱格式 或 MusicXML
- MIDI文件: 标准 `.mid` 格式
- 音频文件: `.wav` / `.mp3`

### 提示词版本记录 (核心)
- **存储方式**: 前端 Zustand 持久化 + 后端 SQLite/JSON 文件双重记录
- **记录范围**: 所有步骤中产生的每一版提示词（原始输入、AI修改、人工修改）
- **记录字段**: `版本ID` | `所属步骤` | `版本类型(原始/AI优化/人工修改)` | `提示词内容` | `修改时间` | `修改原因/备注`
- **前端UI**: 每步提供「提示词历史」侧边面板，可查看所有历史版本、对比差异、回溯恢复

---

## 实施步骤

### 阶段0：项目初始化
1. 使用 Vite 创建 React + TypeScript 前端项目
2. 创建 Python FastAPI 后端项目结构
3. 配置前后端联调环境和依赖安装
4. 创建基础UI布局框架（顶部导航 + 步骤指示器 + 内容区）

---

### 阶段1：Step 1 — 提示词输入与AI优化

#### 前端
1. 创建 `PromptStep` 组件
   - 文本输入框：用户输入原始古风音乐创作提示词（主题、风格、情感、乐器偏好等）
   - "AI优化"按钮：调用后端API优化提示词
   - 优化结果展示区：显示AI优化后的提示词
   - 可编辑优化结果：用户可手动修改AI优化后的提示词
   - "确认提示词"按钮：锁定最终提示词，进入下一步
   - **提示词历史记录面板**（可展开/收起的侧边抽屉）
     - 按时间倒序列出所有版本
     - 每条记录显示：`[原始输入] 2025-05-13 10:30` | `[AI优化] 2025-05-13 10:31` | `[人工修改] 2025-05-13 10:35`
     - 点击任意版本可查看完整内容
     - 两版本对比高亮差异（新增绿色、删除红色）
     - "恢复此版本"按钮可将任意历史版本加载到编辑区

#### 后端
1. 创建 `/api/prompt/optimize` 接口
   - 接收用户原始提示词
   - 构造专业音乐创作System Prompt，调用LLM进行专业化优化（补充古风音乐专业术语、明确调式、节奏、情感层次等）
   - 返回优化后的提示词
   - **同时将原始提示词、AI优化后的提示词写入后端版本记录**

2. 创建 `/api/prompt/history` 接口
   - 返回当前会话的所有提示词版本历史

3. 创建 `/api/prompt/restore` 接口
   - 接收版本ID，返回该版本的完整提示词内容

---

### 阶段2：Step 2 — 歌词生成与人工修改

#### 前端
1. 创建 `LyricStep` 组件
   - 显示Step 1确认的最终提示词（只读参考）
   - 额外参数：歌词结构（主歌/副歌/桥段）、段落数、押韵偏好
   - "生成歌词"按钮：调用后端生成歌词
   - 歌词编辑器：分行文本编辑器，支持用户修改每行歌词
   - 时间轴编辑：用户可为每行歌词设置起始时间戳（格式 MM:SS.mmm）
   - "保存歌词"按钮：下载 `.lrc` 文件
   - "确认歌词"按钮：进入下一步

#### 后端
1. 创建 `/api/lyric/generate` 接口
   - 接收优化后的提示词 + 歌词结构参数
   - 调用LLM生成古风歌词，按段落结构输出
   - 返回结构化歌词（段落标记 + 每行歌词 + 建议时间戳）

2. 创建 `/api/lyric/export` 接口
   - 接收编辑后的歌词数据 + 时间戳
   - 生成标准 `.lrc` 格式文件供下载
   - LRC格式示例：
   ```
   [00:12.00]第一行歌词
   [00:16.50]第二行歌词
   [00:21.00]第三行歌词
   ```

---

### 阶段3：Step 3 — 曲谱生成（核心）

#### 前端
1. 创建 `ScoreStep` 组件
   - 显示Step 2确认的歌词（只读参考）
   - 曲谱生成提示词输入（可选额外描述曲风、节奏、情感等）
   - "AI优化曲谱提示词"按钮 → 用户可修改 → 确认
   - 乐器选择：钢琴 / 古筝 / 小提琴（三选一）
   - "生成曲谱"按钮：调用后端
   - **曲谱提示词历史记录面板**（与Step 1类似）
     - 记录原始曲谱提示词 → AI优化版 → 人工修改版 全流程
     - 支持版本对比、差异高亮、回溯恢复

2. 曲谱可视化展示
   - 使用 **abcjs** 渲染五线谱/简谱（人声音轨 + 乐器音轨分轨显示）
   - 两条音轨并排或切换显示
   - 播放控制：播放/暂停/停止/循环

3. 音频播放
   - 使用 **Tone.js** 或后端生成的音频文件进行播放
   - 人声音轨用正弦波/人声合成音色播放旋律
   - 乐器音轨用对应音色播放（钢琴/古筝/小提琴音色采样）

4. "确认曲谱"按钮 → 进入下一步

#### 后端
1. 创建 `/api/score/generate` 接口
   - 接收：歌词 + 曲谱提示词 + 乐器选择
   - 调用LLM生成曲谱数据（ABC记谱法格式）
   - 返回：人声音轨ABC + 乐器音轨ABC
   - **同时将曲谱提示词的原始/AI优化/人工修改版本写入版本记录**

2. 创建 `/api/score/render-audio` 接口
   - 接收ABC曲谱数据
   - 使用 music21 解析ABC并生成MIDI
   - 使用 FluidSynth + SoundFont 将MIDI渲染为WAV/MP3音频
   - 返回音频文件URL供前端播放

3. 创建 `/api/score/render-sheet` 接口
   - 接收ABC曲谱数据
   - 使用 music21 渲染为乐谱图片(SVG/PNG)或直接返回ABC数据供前端abcjs渲染

4. 创建 `/api/score/prompt/history` 接口
   - 返回曲谱提示词的版本历史

---

### 阶段4：Step 4 — MIDI导出

#### 前端
1. 创建 `MidiStep` 组件
   - 显示曲谱摘要信息
   - "生成MIDI"按钮：调用后端生成合并后的MIDI文件
   - MIDI预览播放器（使用 midi-player-js）
   - "下载MIDI"按钮：下载最终 `.mid` 文件
   - 分轨下载选项：仅人声 / 仅乐器 / 完整合并

#### 后端
1. 创建 `/api/midi/generate` 接口
   - 接收：人声音轨ABC + 乐器音轨ABC
   - 使用 music21 将ABC转换为MIDI
   - 合并两条音轨到同一MIDI文件（不同轨道）
   - 返回MIDI文件URL

2. 创建 `/api/midi/download` 接口
   - 直接返回 `.mid` 文件下载

---

## 项目目录结构

```
ai-music/
├── frontend/                    # React前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # 布局组件
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   └── StepIndicator.tsx
│   │   │   ├── step1/           # 提示词步骤
│   │   │   │   └── PromptStep.tsx
│   │   │   ├── step2/           # 歌词步骤
│   │   │   │   ├── LyricStep.tsx
│   │   │   │   └── LyricEditor.tsx
│   │   │   ├── step3/           # 曲谱步骤
│   │   │   │   ├── ScoreStep.tsx
│   │   │   │   ├── ScoreDisplay.tsx
│   │   │   │   └── AudioPlayer.tsx
│   │   │   └── step4/           # MIDI步骤
│   │   │       ├── MidiStep.tsx
│   │   │       └── MidiPlayer.tsx
│   │   ├── services/
│   │   │   └── api.ts           # API调用封装
│   │   ├── store/
│   │   │   └── musicStore.ts    # 状态管理(Zustand)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # Python后端
│   ├── app/
│   │   ├── main.py              # FastAPI入口
│   │   ├── routers/
│   │   │   ├── prompt.py        # 提示词相关路由
│   │   │   ├── lyric.py         # 歌词相关路由
│   │   │   ├── score.py         # 曲谱相关路由
│   │   │   └── midi.py          # MIDI相关路由
│   │   ├── services/
│   │   │   ├── llm_service.py   # LLM调用服务
│   │   │   ├── music_service.py # 音乐处理服务(music21)
│   │   │   └── audio_service.py # 音频渲染服务
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic数据模型
│   │   └── utils/
│   │       └── lrc_utils.py     # LRC文件工具
│   ├── output/                  # 生成的音频/MIDI输出目录
│   ├── requirements.txt
│   └── config.py
└── README.md
```

---

## 数据流图

```
用户输入提示词
    ↓
[Step1] AI优化提示词 → 用户修改 → 确认 → 最终提示词
    ↓
[Step2] AI生成歌词 → 用户修改+设置时间戳 → 保存.lrc → 确认 → 最终歌词
    ↓
[Step3] 输入曲谱提示词 → AI优化 → 用户修改 → AI生成曲谱(ABC)
        → 分轨展示(人声+乐器) → 音频播放 → 用户确认 → 最终曲谱
    ↓
[Step4] 生成MIDI → 预览播放 → 下载.mid文件
```

---

## 关键技术点

### 1. ABC记谱法
- 人声音轨：包含旋律音高和歌词对齐
- 乐器音轨：包含和弦/伴奏模式
- abcjs前端渲染，music21后端解析

### 2. LRC歌词格式
- 标准时间戳格式 `[mm:ss.xx]`
- 支持逐行时间标记
- 可被常见音乐播放器识别

### 3. 音频合成
- 后端 FluidSynth + 对应乐器SoundFont 生成音频
- 前端 Tone.js 可直接加载SoundFont进行实时播放（更轻量）

### 4. 音频播放
- 后端响应的音频通过 `<audio>` 标签或 Web Audio API 播放
- MIDI文件通过 midi-player-js 预览
- 乐谱通过 abcjs 渲染为可视化五线谱

---

## 提示词版本管理系统（全局）

### 数据结构

每条提示词记录包含以下字段：

```typescript
interface PromptVersion {
  id: string;              // 唯一版本ID (UUID)
  step: 'prompt' | 'score'; // 所属步骤
  type: 'original' | 'ai_optimized' | 'human_modified' | 'restored'; // 版本类型
  content: string;         // 提示词完整内容
  timestamp: string;       // 创建时间 (ISO 8601)
  parentVersionId: string | null; // 父版本ID（用于追溯修改链）
  note?: string;           // 备注/修改原因
  metadata: {
    instrument?: string;   // 曲谱提示词关联的乐器
    timestamp_ms?: number; // 关联的时间戳信息
  };
}
```

### 前端实现

1. **全局状态管理** (Zustand `promptHistoryStore`)
   - 维护所有提示词版本数组
   - 提供 `addVersion()`, `getHistory()`, `getVersionById()`, `compareVersions(id1, id2)` 方法
   - 使用 `persist` 中间件将数据持久化到 `localStorage`

2. **统一提示词历史组件** (`PromptHistoryDrawer`)
   - 作为全局组件，在 Step1 和 Step3 均可调用
   - 侧边抽屉形式（从右侧滑出），不遮挡主编辑区
   - 功能：
     - 按时间倒序列出所有版本
     - 版本类型用彩色标签区分：`[原始] 蓝色` | `[AI] 紫色` | `[人工] 绿色` | `[回溯] 橙色`
     - 点击版本条目展开显示完整内容
     - "对比此版本"按钮：与当前版本逐行差异对比
     - "恢复此版本"按钮：加载该版本到编辑区，并自动创建 `[回溯]` 类型新版本记录
     - "导出全部历史"按钮：导出所有版本为 JSON 文件

3. **自动记录触发点**
   - 用户首次输入提示词 → 自动记录 `original` 类型
   - AI返回优化结果 → 自动记录 `ai_optimized` 类型
   - 用户修改编辑框内容并点击"确认" → 自动记录 `human_modified` 类型
   - 用户从历史恢复某版本 → 自动记录 `restored` 类型（关联 parentVersionId）

### 后端实现

1. **数据库表结构** (SQLite)
   ```sql
   CREATE TABLE prompt_versions (
     id TEXT PRIMARY KEY,
     step TEXT NOT NULL CHECK(step IN ('prompt', 'score')),
     type TEXT NOT NULL CHECK(type IN ('original', 'ai_optimized', 'human_modified', 'restored')),
     content TEXT NOT NULL,
     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
     parent_version_id TEXT REFERENCES prompt_versions(id),
     note TEXT,
     session_id TEXT NOT NULL
   );
   ```

2. **全局版本历史API** `/api/prompt/history/all`
   - 返回当前会话所有步骤的提示词版本历史（统一视图）
   - 支持按 `step`、`type` 筛选

3. **导出接口** `/api/prompt/history/export`
   - 导出当前会话全部提示词历史为结构化 JSON 文件
   - 包含完整的修改时间链、差异对比信息
