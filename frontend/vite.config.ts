import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 【关键】Electron 打包态以 file:// 协议加载 index.html。
  // 若沿用 Vite 默认的 base: '/'，产物中会写出 /assets/index-xxx.js 这类绝对路径，
  // 在 file:// 下会被解析为 file:///盘符/assets/...（即盘符根目录），文件必然不存在，
  // 结果是脚本与样式全部 404、#root 为空、界面呈现全白。
  // 改用相对路径 './' 后，引用变为 ./assets/index-xxx.js，可正确指向 asar 内同级目录。
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // 固定 127.0.0.1 而非 localhost：避免部分 Windows 环境把 localhost
        // 解析为 IPv6 的 ::1，而后端仅监听 IPv4 回环导致代理连接失败
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
