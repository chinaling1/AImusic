/**
 * 渲染探针：在真实 Electron 环境中加载指定 index.html，
 * 捕获资源加载失败事件与最终 DOM 内容长度，用于判定是否白屏。
 *
 * 用法：electron scripts/probe_render.js <index.html 绝对路径>
 */
const { app, BrowserWindow } = require('electron');

const INDEX = process.argv[2];

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  const failures = [];
  const consoleMsgs = [];

  // 资源加载失败（404 / 协议错误）会在这里暴露
  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    failures.push({ code, desc, url });
  });

  // 渲染进程 console 输出
  win.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    consoleMsgs.push({ level, message: String(message).slice(0, 300), sourceId: String(sourceId).slice(0, 120) });
  });

  try {
    await win.loadFile(INDEX);
  } catch (err) {
    console.log('[LOADFILE_ERROR]', err.message);
  }

  // 等待异步资源与 React 挂载
  await new Promise((r) => setTimeout(r, 4000));

  let info;
  try {
    info = await win.webContents.executeJavaScript(`
      JSON.stringify({
        url: location.href,
        protocol: location.protocol,
        title: document.title,
        bodyHtmlLen: document.body ? document.body.innerHTML.length : -1,
        rootHtmlLen: document.getElementById('root') ? document.getElementById('root').innerHTML.length : -1,
        scriptSrcs: [...document.querySelectorAll('script')].map(s => s.src),
        linkHrefs: [...document.querySelectorAll('link')].map(l => l.href),
        scriptCount: document.querySelectorAll('script').length
      })
    `);
  } catch (err) {
    info = JSON.stringify({ error: err.message });
  }

  console.log('===== PAGE_INFO =====');
  console.log(info);
  console.log('===== LOAD_FAILURES (' + failures.length + ') =====');
  failures.forEach((f) => console.log(`  code=${f.code} desc=${f.desc} url=${f.url}`));
  console.log('===== CONSOLE (' + consoleMsgs.length + ') =====');
  consoleMsgs.forEach((m) => console.log(`  [L${m.level}] ${m.message}  <- ${m.sourceId}`));

  // 白屏判定：root 为空即渲染失败
  let verdict = 'UNKNOWN';
  try {
    const parsed = JSON.parse(info);
    verdict = parsed.rootHtmlLen > 0 ? 'RENDERED_OK' : 'BLANK_SCREEN';
  } catch (_) {
    verdict = 'UNKNOWN';
  }
  console.log('===== VERDICT: ' + verdict + ' =====');

  app.exit(0);
});
