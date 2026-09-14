/**
 * 预加载脚本：在隔离上下文中，向渲染进程暴露一组受限的、显式声明的能力。
 *
 * 后端端口是主进程在启动时动态探测得到的，可能不是 8000，
 * 因此必须由主进程经 additionalArguments 注入，再透传给前端 API 层使用。
 */
const { contextBridge, ipcRenderer } = require('electron');

// 主进程通过 webPreferences.additionalArguments 传入 --backend-port=<端口>
const portArg = process.argv.find((arg) => arg.startsWith('--backend-port='));
const backendPort = portArg ? Number(portArg.split('=')[1]) || 0 : 0;

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  /** 后端实际监听端口；0 表示未注入（如开发态走 Vite 代理） */
  backendPort,
  /**
   * 在系统默认浏览器里打开外部链接（MiniMax 音乐创作页等），
   * 而不是开第二个 BrowserWindow 抢焦点。
   * 主进程侧已限定仅放行 http/https，挡掉自定义协议注入。
   */
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
