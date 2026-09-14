# -*- coding: utf-8 -*-
"""
诊断脚本：启动打包版 GUI，检测进程存活、窗口句柄、前端加载错误、后端端口。
用途：定位"软件无法运行"的真实根因（闪退 / 白屏 / 后端未起）。
"""
import ctypes
import ctypes.wintypes as wt
import os
import socket
import subprocess
import sys
import time

EXE = r"G:\cunchu\大学\作业\AI音乐\release\win-unpacked\古韵AI.exe"
DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200


def port_open(port: int) -> bool:
    """检测本机端口是否有监听。"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def enum_windows_for_pid(pid: int):
    """枚举指定进程的所有顶层窗口，返回 (hwnd, 标题) 列表。"""
    user32 = ctypes.windll.user32
    results = []

    WNDENUMPROC = ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM)

    def _cb(hwnd, _lparam):
        wpid = wt.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(wpid))
        if wpid.value == pid:
            length = user32.GetWindowTextLengthW(hwnd)
            buf = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buf, length + 1)
            cls = ctypes.create_unicode_buffer(256)
            user32.GetClassNameW(hwnd, cls, 256)
            visible = bool(user32.IsWindowVisible(hwnd))
            results.append((hwnd, buf.value, cls.value, visible))
        return True

    user32.EnumWindows(WNDENUMPROC(_cb), 0)
    return results


def main():
    print("=" * 60)
    print("[诊断] 启动前状态")
    print(f"  EXE 存在: {os.path.exists(EXE)}")
    print(f"  8000 端口监听: {port_open(8000)}")

    print("=" * 60)
    print("[诊断] 启动进程（脱离控制台）...")
    proc = subprocess.Popen(
        [EXE],
        creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        close_fds=True,
    )
    print(f"  PID = {proc.pid}")

    # 分阶段观测，捕捉闪退时点（按绝对时间点采样）
    prev = 0
    for t in (2, 4, 6, 9, 12):
        time.sleep(t - prev)
        prev = t
        alive = proc.poll() is None
        wins = enum_windows_for_pid(proc.pid)
        bport = port_open(8000)
        print(f"  [T+{t:>2}s] 存活={alive}  窗口数={len(wins)}  8000监听={bport}")
        if not alive:
            print(f"  >>> 进程已退出，退出码 = {proc.returncode}")
            break
        for hwnd, title, cls, visible in wins:
            print(f"        hwnd={hwnd} visible={visible} class={cls!r} title={title!r}")

    alive = proc.poll() is None
    print("=" * 60)
    print("[诊断] 最终状态")
    print(f"  进程存活: {alive}")
    print(f"  8000 端口: {port_open(8000)}")
    if alive:
        wins = enum_windows_for_pid(proc.pid)
        print(f"  窗口列表 ({len(wins)} 个):")
        for hwnd, title, cls, visible in wins:
            print(f"    - visible={visible} class={cls!r} title={title!r}")

    # 子进程若已退出，输出其捕获的输出
    if not alive:
        try:
            out, err = proc.communicate(timeout=3)
            print(f"  stdout: {out.decode('utf-8', 'replace')[:2000]}")
            print(f"  stderr: {err.decode('utf-8', 'replace')[:2000]}")
        except Exception as exc:  # noqa: BLE001
            print(f"  读取输出失败: {exc}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
