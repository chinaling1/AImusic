# ============================================================
# 古韵AI 后端残留进程清理脚本（PowerShell）
# 用途：杀掉占着 8000 端口的 gu-yun-backend.exe 残留
# 用法：右键 → 使用 PowerShell 运行；或 .\kill_stale_backend.ps1
# ============================================================
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "===== 古韵AI 后端残留进程清理 =====" -ForegroundColor Cyan
Write-Host ""

# 查端口
$conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    foreach ($c in $conn) {
        $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
        if ($p) {
            Write-Host "  端口 8000 被占用：PID $($c.OwningProcess) - $($p.ProcessName)" -ForegroundColor Yellow
            $answer = Read-Host "  是否杀掉? (Y/N)"
            if ($answer -eq 'Y' -or $answer -eq 'y') {
                Stop-Process -Id $c.OwningProcess -Force
                Write-Host "  ✓ 已清理" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "  ✓ 端口 8000 空闲" -ForegroundColor Green
}

# 同时清掉所有 gu-yun-backend 残留（即使不在 8000）
$procs = Get-Process -Name "gu-yun-backend" -ErrorAction SilentlyContinue
if ($procs) {
    Write-Host ""
    Write-Host "  发现残留的 gu-yun-backend 进程：" -ForegroundColor Yellow
    $procs | Select-Object Id, StartTime, CPU | Format-Table -AutoSize
    $answer = Read-Host "  全部杀掉? (Y/N)"
    if ($answer -eq 'Y' -or $answer -eq 'y') {
        $procs | Stop-Process -Force
        Write-Host "  ✓ 已清理" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "完成。" -ForegroundColor Cyan
Read-Host "按 Enter 退出"
