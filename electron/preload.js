const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  // 在系统默认浏览器里打开外部链接（MiniMax 音乐创作页等），
  // 而不是开第二个 BrowserWindow 抢焦点
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
