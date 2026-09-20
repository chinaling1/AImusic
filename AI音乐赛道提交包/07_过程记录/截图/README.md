# 工具使用截图

> 本目录包含工具实际启动运行时的真实截图（Edge headless 抓取，非 mockup）。
> 抓取方式：启动 `uvicorn app.main:app` + `vite dev` → `msedge --headless --screenshot http://localhost:5174/?step=N`

## 截图清单

| # | 文件名 | 对应步骤 | 抓取 URL | 抓取状态 |
|---|---|---|---|---|
| 1 | `1-Step1-提示词优化.png` | STEP 1 - 提示词优化 | `http://localhost:5174/?step=0` | ✅ 真实截图 |
| 2 | `2-Step2-歌词生成.png` | STEP 2 - 歌词生成 | `http://localhost:5174/?step=1` | ✅ 真实截图 |
| 3 | `3-Step3-格式校验与交付.png` | STEP 3 - 格式校验与交付 | `http://localhost:5174/?step=2` | ✅ 真实截图 |
| 4 | `4-全链路交付流程.png` | 全流程综合示意图 | （综合示意） | ⚠️ PIL 示意图 |

## 第 4 张「全链路交付流程」是示意图

原因：该图是「STEP 1 → STEP 2 → STEP 3」完整流程的横向时间线 + 三类版本入库证据，
没有单一的 React 组件渲染这个视图，是把三步合并的总结图。为保留可读性，使用 PIL 按布局手绘示意图。

## URL 参数支持

为了让截图工具/评审快速跳到指定步骤，前端 `App.tsx` 已添加 `?step=N` URL 参数支持：

```typescript
// frontend/src/App.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const stepParam = params.get('step')
  if (stepParam !== null) {
    const n = Number(stepParam)
    if (Number.isInteger(n) && n >= 0 && n < stepComponents.length) {
      setStep(n)
    }
  }
}, [setStep])
```

合法值：`?step=0` (PromptStep) / `?step=1` (LyricStep) / `?step=2` (ExportStep)。
不影响默认行为（无参数时按 zustand persist 的当前 step 显示）。

## 如何重新生成真实截图

如评审要求最新真实截图，重新执行以下步骤：

```powershell
# 1. 启动后端（窗口 1）
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8765

# 2. 启动前端（窗口 2）
cd frontend
npx vite --port 5174

# 3. 等待 Vite 输出 "ready in ..." 后（约 5 秒）

# 4. Edge headless 截图（窗口 3）
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless=new --disable-gpu --no-sandbox --hide-scrollbars `
  --window-size=1400,900 `
  --screenshot="C:\edge_shots\s0.png" `
  "http://localhost:5174/?step=0"
# 重复 step=1, step=2 各截一张

# 5. 替换本目录 PNG
```

截图尺寸 1400×900，与 LAYOUT_16x9 PPT 画布一致。