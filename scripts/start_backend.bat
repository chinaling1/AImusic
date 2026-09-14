@echo off
REM ============================================================
REM 古韵AI 后端启动器（Windows）
REM 作用：杀掉端口 8000 上的残留进程 → 启动后端 EXE
REM 用法：双击或在终端运行
REM ============================================================

chcp 65001 >nul
title 古韵AI 后端启动器

echo.
echo ===== 古韵AI 后端启动器 =====
echo.

REM 1. 检查并杀掉 8000 端口上的残留进程
echo [1/3] 检查端口 8000 占用...
set "STALE_PIDS="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    set "STALE_PIDS=!STALE_PIDS! %%P"
)

if defined STALE_PIDS (
    echo       端口 8000 被以下进程占用：%STALE_PIDS%
    echo [2/3] 清理残留进程...
    for %%P in (%STALE_PIDS%) do (
        echo       Stop-Process -Id %%P -Force
        taskkill /PID %%P /F >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
    echo       端口已释放
) else (
    echo [2/3] 端口 8000 空闲
)

REM 2. 启动后端 EXE
echo [3/3] 启动 gu-yun-backend.exe...
echo.
cd /d "%~dp0dist-backend"
start "古韵AI Backend" /min gu-yun-backend.exe
echo 后端已启动，浏览器稍候访问 http://localhost:5173 (开发态)
echo 或直接双击 古韵AI Setup 1.0.0.exe 安装桌面版
echo.
pause
