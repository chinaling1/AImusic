# AI古风音乐创作系统 — 详细执行规格

## Why
面向专业人士的AI古风音乐创作工具，需要实现完整的四步创作流程（提示词→歌词→曲谱→MIDI），支持AI辅助与人工修改闭环，同时确保提示词全链路可追溯记录。项目需要打包为可执行文件，集成DeepSeek（Pro/Flash双模型）和千问AI模型（各司其职），实现音轨即时播放能力，并安装Trae Skill辅助开发。

## What Changes
- 创建完整的React + TypeScript前端项目结构
- 创建Python FastAPI后端项目结构
- 实现四步工作流UI组件
- 集成DeepSeek（Pro/Flash双模型，负责提示词优化+歌词生成）和千问（负责曲谱ABC生成）AI模型API
- 实现ABC记谱法渲染与音频播放
- 实现LRC歌词文件生成
- 实现MIDI文件生成与导出
- 实现提示词版本历史管理系统
- 配置Electron打包为exe可执行文件
- 实现音轨生成后即时播放功能
- 安装并安全审查Trae Skill（web-dev等）

## Impact
- 新增: 前端React应用、后端FastAPI服务、AI模型集成、音乐处理模块、打包配置、Trae Skill
- 涉及系统: 用户界面、AI调用、音频处理、文件生成、版本管理

## ADDED Requirements

### Requirement: Trae Skill安装与安全审查
系统开发过程 SHALL 先安装Trae Skill辅助开发，安装前进行安全审查确认无风险。

#### Scenario: Skill安装流程
- **WHEN** 开始项目开发前
- **THEN** 首先检查可用Skill列表，对相关Skill进行安全审查，审查通过后安装使用

#### Scenario: web-dev Skill使用
- **WHEN** 需要创建前端Web界面
- **THEN** 使用web-dev Skill辅助创建生产级Web界面

### Requirement: 项目环境构建
系统 SHALL 提供完整的前后端开发环境，包含依赖安装、开发服务器配置、联调环境。

#### Scenario: 环境初始化
- **WHEN** 开发者执行环境安装命令
- **THEN** 前后端依赖自动安装，开发服务器可启动

### Requirement: AI模型分工集成
系统 SHALL 集成DeepSeek（Pro/Flash）和千问两类AI模型，各司其职：

**DeepSeek** — 负责创意性文本生成任务，根据任务复杂度选择Pro或Flash模型：
- **DeepSeek Pro (deepseek-chat)** — 高质量创意任务：
  - Step 1: 提示词优化（将用户模糊描述优化为专业古风音乐创作提示词，需要深度理解和创意扩展）
  - Step 2: 歌词生成（基于提示词生成古风歌词，含段落结构和时间戳建议，需要文学创作能力）
- **DeepSeek Flash** — 快速轻量任务：
  - 歌词微调建议（用户修改歌词时提供快速建议）
  - 提示词快速润色（用户对已优化提示词做小幅调整时）

**千问 (qwen)** — 负责结构化专业输出任务（无需区分模型版本）：
- Step 3: 曲谱ABC记谱法生成（基于歌词+提示词生成精确的ABC记谱法曲谱，含人声轨和乐器轨）
- 曲谱提示词优化（将用户曲谱描述优化为专业音乐术语提示词）

选择理由：
- DeepSeek Pro在中文创意写作方面表现优秀，适合歌词和提示词的深度创意优化
- DeepSeek Flash响应速度快，适合交互式快速建议场景
- 千问在结构化输出和专业知识领域（音乐理论/ABC记谱法）方面更精确，适合曲谱生成

#### Scenario: DeepSeek Pro提示词优化
- **WHEN** 用户输入原始提示词并点击AI优化
- **THEN** 系统调用DeepSeek Pro API，返回专业优化后的提示词

#### Scenario: DeepSeek Pro歌词生成
- **WHEN** 用户确认提示词并点击生成歌词
- **THEN** 系统调用DeepSeek Pro API，生成结构化古风歌词

#### Scenario: DeepSeek Flash快速建议
- **WHEN** 用户在编辑歌词/提示词时请求快速建议
- **THEN** 系统调用DeepSeek Flash API，快速返回小幅修改建议

#### Scenario: 千问曲谱提示词优化
- **WHEN** 用户输入曲谱提示词并点击AI优化
- **THEN** 系统调用千问API，返回专业音乐术语优化后的曲谱提示词

#### Scenario: 千问曲谱生成
- **WHEN** 用户确认曲谱提示词并点击生成曲谱
- **THEN** 系统调用千问API，生成ABC记谱法格式的曲谱（人声轨+乐器轨）

#### Scenario: AI模型配置
- **WHEN** 用户在设置中配置DeepSeek API Key和千问API Key
- **THEN** 系统分别验证两个API Key的有效性，并保存配置；DeepSeek Pro和Flash共用同一API Key

### Requirement: AI文本到音频/歌词文件的转换
系统 SHALL 将AI生成的文本准确转换为对应的音频和歌词文件格式。

#### Scenario: AI歌词文本转LRC文件
- **WHEN** DeepSeek Pro返回结构化歌词文本
- **THEN** 后端解析歌词文本，提取时间戳和歌词行，生成标准LRC格式文件

#### Scenario: AI曲谱文本转可播放音频
- **WHEN** 千问返回ABC记谱法曲谱文本
- **THEN** 后端使用music21解析ABC文本，生成MIDI数据，前端通过Tone.js即时播放

#### Scenario: ABC曲谱文本转MIDI文件
- **WHEN** 用户确认曲谱并进入Step 4
- **THEN** 后端使用music21将ABC文本转换为标准MIDI文件

### Requirement: 歌词文件生成
系统 SHALL 将AI生成的歌词文本转换为标准LRC格式文件（带时间戳）。

#### Scenario: 生成LRC文件
- **WHEN** 用户确认歌词内容
- **THEN** 系统生成标准LRC格式文件供下载

### Requirement: 曲谱即时播放
系统 SHALL 在曲谱生成完成后立即提供音频播放能力，无需等待额外处理。

#### Scenario: 曲谱生成后播放
- **WHEN** 千问生成曲谱完成
- **THEN** 前端通过Tone.js立即播放人声音轨和乐器音轨，同时abcjs渲染五线谱

### Requirement: 可执行文件打包
系统 SHALL 打包为Windows可执行文件（.exe），包含前后端完整功能。

#### Scenario: 打包exe
- **WHEN** 执行打包命令
- **THEN** 生成独立可执行的.exe文件，内嵌Python运行时和前端资源

### Requirement: 提示词版本历史
系统 SHALL 记录所有步骤的提示词变化，包括原始输入、AI优化、人工修改。

#### Scenario: 查看历史版本
- **WHEN** 用户打开提示词历史面板
- **THEN** 显示所有历史版本，支持对比和恢复

## MODIFIED Requirements
无（全新项目）

## REMOVED Requirements
无（全新项目）