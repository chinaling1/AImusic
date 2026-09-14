/**
 * Electron 主进程：桌面外壳 + 本地后端生命周期管理。
 *
 * 【打包态启动顺序】
 *   1. 探测一个空闲的本地端口 —— 规避固定 8000 被占用时后端直接 FATAL 退出的问题；
 *   2. 以 PORT=<端口> 环境变量拉起 PyInstaller 打包的后端 exe；
 *   3. 轮询后端健康检查，确认就绪后才加载前端页面。
 *      （PyInstaller --onefile 每次启动都需把运行时解压到临时目录，实测约 3~6 秒；
 *        原先固定 setTimeout(2000) 会在后端就绪前就加载页面，导致首屏接口请求全部失败）
 *   4. 后端启动失败时展示可读的中文错误页，而不是留下一片白屏让人无从排查。
 *
 * 【为什么必须用 preload 注入端口】
 *   端口由主进程动态决定，渲染进程无从知晓，且打包态（file://）下相对路径会失效，
 *   因此把端口经 additionalArguments 传给 preload，再暴露给前端 API 层拼接基址。
 */
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const net = require('net');
const http = require('http');
const { spawn, execFile } = require('child_process');

let mainWindow = null;
let backendProcess = null;
let backendPort = 0;
/** 后端进程是否已异常退出，用于让健康检查轮询立即失败而不是空等到超时 */
let backendExited = false;
let backendExitDetail = '';

/** 等待后端就绪的最长时间（毫秒）。首次运行需解压 Python 运行时，留足余量。 */
const BACKEND_READY_TIMEOUT = 60000;
/** 健康检查轮询间隔（毫秒） */
const BACKEND_POLL_INTERVAL = 300;

/**
 * 探测一个空闲的本地端口。
 * 让操作系统临时分配（listen 0）后立即释放并复用该端口号，
 * 比在固定端口上反复重试更可靠，且能自然避开被其他程序占用的端口。
 *
 * @returns {Promise<number>} 可用的端口号
 */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    // 绑定回环地址：本应用只需要本机访问，不对外暴露
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/**
 * 对后端根路径做一次带超时的 HTTP 探测。
 * 只要返回 200 就认为服务已可接受请求。
 *
 * @param {number} port 后端端口
 * @returns {Promise<boolean>} 是否就绪
 */
function probeBackendOnce(port) {
  return new Promise((resolve) => {
    const req = http.get(
      { host: '127.0.0.1', port, path: '/', timeout: 1500 },
      (res) => {
        res.resume(); // 丢弃响应体，释放连接
        resolve(res.statusCode === 200);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * 轮询等待后端就绪。
 * 若期间后端进程已退出，立即以退出原因拒绝，避免用户白等 60 秒。
 *
 * @param {number} port 后端端口
 * @returns {Promise<void>}
 */
function waitForBackendReady(port) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + BACKEND_READY_TIMEOUT;

    const tick = async () => {
      if (backendExited) {
        reject(new Error(backendExitDetail || '后端进程已退出'));
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error(`等待后端就绪超时（${BACKEND_READY_TIMEOUT / 1000} 秒）`));
        return;
      }
      const ok = await probeBackendOnce(port);
      if (ok) {
        resolve();
        return;
      }
      setTimeout(tick, BACKEND_POLL_INTERVAL);
    };

    tick();
  });
}

/**
 * 拉起打包后的后端可执行文件。
 *
 * @param {number} port 由主进程指定并注入的端口
 */
function startBackend(port) {
  const backendPath = path.join(process.resourcesPath, 'backend', 'gu-yun-backend.exe');

  backendExited = false;
  backendExitDetail = '';

  backendProcess = spawn(backendPath, [], {
    cwd: path.dirname(backendPath),
    // PORT 注入：后端据此监听指定端口（见 backend/app/main.py）
    env: { ...process.env, PORT: String(port) },
    windowsHide: true,
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[后端] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    const text = String(data);
    console.error(`[后端] ${text}`);
    // 保留最近一段输出作为启动失败时的诊断依据
    backendExitDetail = text.trim().slice(-800);
  });

  backendProcess.on('error', (err) => {
    backendExited = true;
    backendExitDetail = `无法启动后端进程：${err.message}`;
  });

  backendProcess.on('exit', (code) => {
    backendExited = true;
    if (!backendExitDetail) {
      backendExitDetail = `后端进程异常退出，退出码 ${code}`;
    }
    backendProcess = null;
  });
}

/**
 * 结束后端进程树。
 *
 * 注意：PyInstaller --onefile 生成的 exe 会派生引导进程与实际服务进程，
 * 单纯调用 child.kill() 只能结束父进程，子进程会残留并继续占用端口。
 * 因此 Windows 下用 taskkill /T 递归结束整棵进程树。
 */
function stopBackend() {
  if (!backendProcess || backendProcess.killed) return;
  const pid = backendProcess.pid;
  if (process.platform === 'win32') {
    // execFile 直接调用可执行文件，不经过 shell，避免路径转换与注入问题
    execFile('taskkill', ['/PID', String(pid), '/T', '/F'], () => {
      /* 进程可能已自行退出，忽略此处错误 */
    });
  } else {
    try {
      process.kill(pid, 'SIGTERM');
    } catch (_err) {
      /* 进程已退出 */
    }
  }
  backendProcess = null;
}

/**
 * 生成启动失败时的错误页 HTML。
 * 用 data URL 直接加载，保证在后端不可用时界面仍能给出可操作的提示。
 *
 * @param {string} message 失败原因
 * @returns {string} 完整 HTML 文本
 */
function buildErrorPage(message) {
  const safe = String(message)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>古韵AI — 启动失败</title>
<style>
  html,body{height:100%;margin:0}
  body{
    background:#1a1a2e;color:#e8e8f0;
    font-family:"Microsoft YaHei","PingFang SC",sans-serif;
    display:flex;align-items:center;justify-content:center;
  }
  .box{max-width:640px;padding:40px 44px;line-height:1.9}
  h1{font-size:19px;margin:0 0 18px;color:#ff8a8a;font-weight:600}
  .msg{background:#23233c;border-left:3px solid #ff8a8a;padding:14px 16px;
       font-family:Consolas,monospace;font-size:12.5px;white-space:pre-wrap;
       word-break:break-all;color:#ffd7d7}
  ol{margin:22px 0 0;padding-left:22px;font-size:13.5px;color:#b9b9d0}
  li{margin-bottom:10px}
  code{background:#23233c;padding:2px 6px;border-radius:3px;color:#9ad9ff}
</style>
</head>
<body>
  <div class="box">
    <h1>后端服务启动失败，应用无法正常工作</h1>
    <div class="msg">${safe}</div>
    <ol>
      <li>确认没有其他程序占用本机端口，或重启电脑后重试。</li>
      <li>检查杀毒软件是否拦截了 <code>gu-yun-backend.exe</code>，将其加入信任列表。</li>
      <li>若问题持续，请在资源管理器中结束残留的
          <code>gu-yun-backend.exe</code> 进程后重新打开本应用。</li>
    </ol>
  </div>
</body>
</html>`;
}

/**
 * 创建主窗口。
 *
 * @param {number} port 后端端口；0 表示开发态（走 Vite 代理，无需端口注入）
 * @param {string} [errorMessage] 若提供，则显示错误页而不是应用界面
 */
function createWindow(port, errorMessage) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: '古韵AI — 古风音乐创作工坊',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      // 必须显式挂载 preload，否则渲染进程拿不到 window.electronAPI，
      // 外链跳转会退化为开新窗口、且无法获知后端端口
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      additionalArguments: [`--backend-port=${port || 0}`],
    },
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (errorMessage) {
    mainWindow.loadURL(
      'data:text/html;charset=utf-8,' + encodeURIComponent(buildErrorPage(errorMessage))
    );
    return;
  }

  if (app.isPackaged) {
    // 相对 frontend/dist/index.html（index.html 内部已使用相对资源路径）
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }
}

/**
 * 打包态启动流程：先备好后端，再开窗口。
 */
async function bootstrapPackaged() {
  try {
    backendPort = await findFreePort();
    console.log(`[主进程] 选定后端端口：${backendPort}`);
    startBackend(backendPort);
    await waitForBackendReady(backendPort);
    console.log('[主进程] 后端已就绪，加载界面');
    createWindow(backendPort);
  } catch (err) {
    console.error('[主进程] 后端启动失败：', err.message);
    createWindow(0, err.message);
  }
}

// 单实例锁：避免用户重复双击导致起多个后端争抢端口
const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // 在系统默认浏览器中打开外部链接（仅放行 http/https，挡掉自定义协议注入）
    ipcMain.handle('open-external', async (_event, url) => {
      if (typeof url !== 'string') return false;
      if (!/^https?:\/\//i.test(url)) return false;
      await shell.openExternal(url);
      return true;
    });

    if (app.isPackaged) {
      bootstrapPackaged();
    } else {
      // 开发态后端由开发者手动启动（npm run dev:backend），此处直接开窗口
      createWindow(0);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(app.isPackaged ? backendPort : 0);
      }
    });
  });
}

app.on('window-all-closed', () => {
  stopBackend();
  app.quit();
});

app.on('before-quit', () => {
  stopBackend();
});

// 进程被强制结束（如任务管理器）时，尽力清理后端，避免端口残留
process.on('exit', () => {
  stopBackend();
});
