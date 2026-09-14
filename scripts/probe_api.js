/**
 * API 链路探针：验证打包态下
 *   1) preload 是否成功注入 window.electronAPI.backendPort
 *   2) 渲染进程能否用该端口成功访问后端接口（含 CORS）
 *   3) 前端页面能否正常挂载
 *
 * 用法：electron scripts/probe_api.js <后端端口> <index.html 路径>
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');

const PORT = process.argv[2];
const INDEX = process.argv[3];
// 复用打包产物内的 preload，确保验证的是真实链路
const PRELOAD = path.resolve(__dirname, '..', 'release-v234', 'win-unpacked', 'resources', 'app.asar', 'electron', 'preload.js');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: PRELOAD,
      nodeIntegration: false,
      contextIsolation: true,
      additionalArguments: [`--backend-port=${PORT}`],
    },
  });

  const failures = [];
  win.webContents.on('did-fail-load', (_e, code, desc, url) => failures.push(`${code} ${desc} ${url}`));

  await win.loadFile(INDEX);
  await new Promise((r) => setTimeout(r, 2500));

  const result = await win.webContents.executeJavaScript(`
    (async () => {
      const info = {
        hasElectronAPI: typeof window.electronAPI !== 'undefined',
        injectedPort: window.electronAPI ? window.electronAPI.backendPort : null,
        isElectron: window.electronAPI ? window.electronAPI.isElectron : null,
        rootHtmlLen: document.getElementById('root') ? document.getElementById('root').innerHTML.length : -1,
        title: document.title,
      };
      try {
        const r = await fetch('http://127.0.0.1:${PORT}/api/minimax/format-spec');
        info.apiStatus = r.status;
        info.apiOk = r.ok;
        const j = await r.json();
        info.apiKeys = Object.keys(j).slice(0, 6);
      } catch (e) {
        info.apiError = String(e);
      }
      return JSON.stringify(info);
    })()
  `);

  console.log('===== API_CHAIN_RESULT =====');
  console.log(result);
  console.log('===== LOAD_FAILURES: ' + failures.length + ' =====');
  failures.forEach((f) => console.log('  ' + f));

  const parsed = JSON.parse(result);
  const pass =
    parsed.hasElectronAPI &&
    Number(parsed.injectedPort) === Number(PORT) &&
    parsed.apiOk === true &&
    parsed.rootHtmlLen > 0;
  console.log('===== VERDICT: ' + (pass ? 'API_CHAIN_OK' : 'API_CHAIN_FAILED') + ' =====');

  app.exit(0);
});
