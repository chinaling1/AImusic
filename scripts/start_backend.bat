@echo off
chcp 65001 >nul
REM ============================================================
REM 古韵AI 后端启动器（Windows）—— 应急排查工具
REM
REM 说明：自本版起，后端端口由 Electron 主进程动态探测并注入，
REM       已不存在「8000 被占用导致应用起不来」的问题。
REM       正常使用请直接打开「古韵AI」桌面应用，无需运行本脚本。
REM
REM 本脚本仅用于以下排查场景：
REM       - 需要在没有桌面外壳的情况下单独拉起后端做接口调试
REM       - 需要清理因异常退出而残留的后端进程
REM ============================================================

title 古韵AI 后端启动器（排查用）

echo.
echo ===== 古韵AI 后端启动器（应急排查工具）=====
echo.
echo 提示：日常使用请直接打开「古韵AI」桌面应用。
echo.

REM 1. 清理可能残留的后端进程
REM 端口已动态化，按进程名清理比按固定端口判断更可靠
echo [1/2] 检查残留的 gu-yun-backend.exe ...
tasklist /FI "IMAGENAME eq gu-yun-backend.exe" 2>nul | findstr /I "gu-yun-backend.exe" >nul
if %errorlevel%==0 (
    echo       发现残留进程，正在结束...
    taskkill /F /IM gu-yun-backend.exe >nul 2>&1
    timeout /t 1 /nobreak >nul
    echo       已清理
) else (
    echo       无残留进程
)

REM 2. 启动后端 EXE
REM 注意：%~dp0 指向本脚本所在的 scripts 目录，后端 EXE 位于其上一级的 dist-backend，
REM       故必须写成 "%~dp0..\dist-backend"；早前版本漏写 "..\" 会因目录不存在而启动失败。
set "BACKEND_DIR=%~dp0..\dist-backend"
if not exist "%BACKEND_DIR%\gu-yun-backend.exe" (
    echo.
    echo [错误] 未找到后端程序：%BACKEND_DIR%\gu-yun-backend.exe
    echo        请先执行 npm run build:backend 生成后端可执行文件。
    echo.
    pause
    exit /b 1
)

echo [2/2] 启动 gu-yun-backend.exe ...
echo       未设置 PORT 环境变量时，默认监听 127.0.0.1:8000
cd /d "%BACKEND_DIR%"
start "古韵AI Backend" /min gu-yun-backend.exe
echo.
echo 后端已启动。关闭本窗口不会停止后端服务。
