# UI 示意图说明

> ⚠️ **本目录图片为 UI 示意图（mockup），不是工具实际运行时的真实截图。**

## 为什么是示意图

- 原项目里的真实测试截图（`测试截图/1-输入创意.png` 等 4 张）已在清理项目时被 .gitignore 覆盖删除
- 当前环境无法启动浏览器渲染工具（Playwright 不可用 / Playwright 浏览器未安装），无法重新生成真实截图
- 为保留「工具使用流程」的可视化证据，使用 Python + PIL 按 `frontend/src/components/` 实际代码布局生成了 4 张 UI 示意图

## 4 张图对应的工具步骤 | Steps

| # | 文件名 | 对应工具步骤 | 示意图内容 |
|---|---|---|---|
| 1 | `1-Step1-提示词优化.png` | STEP 1 | 用户输入原始提示词 → DeepSeek Pro 输出 Meta + Styles |
| 2 | `2-Step2-歌词生成.png` | STEP 2 | 确认提示词 → DeepSeek Pro 输出含 14 种结构标签的古风歌词 |
| 3 | `3-Step3-格式校验与交付.png` | STEP 3 | 本地确定性校验 4 项规则全通过 + 一键复制/打开 MiniMax |
| 4 | `4-全链路交付流程.png` | 全流程 | 三步时间线 + 三类版本入库证据 |

## 如何获取真实截图

如需替换为真实工具运行截图，请按以下步骤：

```powershell
# 1. 安装 playwright（如未安装）
pip install playwright
playwright install chromium

# 2. 启动后端
cd backend
python -m uvicorn app.main:app --reload --port 8000

# 3. 启动前端（新窗口）
cd frontend
npm run dev

# 4. 在浏览器访问 http://localhost:5173
# 5. 用 Playwright/Puppeteer 截 4 张关键页面的 PNG

# 6. 替换本目录的 mockup PNG
```

## 示意图与实际代码的一致性

示意图中的文字内容与 `frontend/src/components/` 实际组件保持一致：

- 配色：Vintage & Academic 主题（深蓝 #003049 + 深红 #780000 + 米黄 #fdf0d5）
- STEP 1 组件：`frontend/src/components/step1/PromptStep.tsx`
- STEP 2 组件：`frontend/src/components/step2/LyricStep.tsx`
- STEP 3 组件：`frontend/src/components/step3/MiniMaxSteps.tsx` + `ValidationPanel.tsx`
- 元标签六项：与 `backend/app/routers/minimax.py::META_TAG_NAMES` 一致

## 评审说明

若评审对示意图与真实 UI 的差异有疑问，可要求团队成员：
1. 启动 `npm run dev` + `uvicorn app.main:app`
2. 在浏览器手动操作三步流程
3. 截真实截图替换本目录文件
4. 提交 `git commit -m "替换 UI 示意图为真实截图"`