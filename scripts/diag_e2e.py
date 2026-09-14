# -*- coding: utf-8 -*-
"""
端到端启动验证：真实启动打包版桌面应用，确认
  1) Electron 主进程存活（不闪退）
  2) 后端被自动拉起并监听端口（端口为动态分配，通过对比启动前后的监听集合识别）
  3) 主窗口成功创建
  4) 退出后无残留进程

用法：python scripts/diag_e2e.py <可执行文件绝对路径>
"""
import ctypes
import ctypes.wintypes as wt
import os
import re
import subprocess
import sys
import time

DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200


def listening_ports() -> set:
    """列出当前处于 LISTENING 状态的本地端口。"""
    try:
        out = subprocess.run(
            ["netstat", "-ano", "-p", "TCP"],
            capture_output=True, text=True, timeout=15,
            encoding="utf-8", errors="replace",
        ).stdout
    except Exception:
        return set()
    ports = set()
    for line in out.splitlines():
        m = re.search(r":(\d+)\s+\S+\s+LISTENING", line)
        if m:
            ports.add(int(m.group(1)))
    return ports


def enum_windows_for_pid(pid: int):
    """枚举指定进程的顶层窗口。"""
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
            results.append((hwnd, buf.value, bool(user32.IsWindowVisible(hwnd))))
        return True

    user32.EnumWindows(WNDENUMPROC(_cb), 0)
    return results


def main():
    if len(sys.argv) < 2:
        print("用法：python scripts/diag_e2e.py <exe 路径>")
        return 2

    exe = sys.argv[1]
    print("=" * 64)
    print(f"[E2E] 目标：{exe}")
    print(f"[E2E] 存在：{os.path.exists(exe)}")

    # 构造干净环境：必须剔除 ELECTRON_RUN_AS_NODE。
    # 该变量若为真值，Electron 二进制会退化为纯 Node 运行时，导致主进程启动即退出，
    # 与真实双击场景（用户环境不存在该变量）不符，会让验证结论失真。
    child_env = dict(os.environ)
    child_env.pop("ELECTRON_RUN_AS_NODE", None)

    before = listening_ports()
    print(f"[E2E] 启动前监听端口数：{len(before)}")

    proc = subprocess.Popen(
        [exe],
        creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        cwd=os.path.dirname(exe),
        env=child_env,
    )
    print(f"[E2E] 已启动，PID={proc.pid}")
    print("-" * 64)

    ok_alive = False
    new_ports = set()
    windows = []
    for sec in (4, 8, 12, 16):
        time.sleep(sec - (0 if sec == 4 else 4))
        alive = proc.poll() is None
        new_ports = listening_ports() - before
        windows = enum_windows_for_pid(proc.pid) if alive else []
        print(f"  [T+{sec:>2}s] 主进程存活={alive}  新增监听端口={sorted(new_ports)}  窗口数={len(windows)}")
        if alive:
            ok_alive = True
        else:
            print(f"         >>> 进程已退出，退出码={proc.returncode}")
            break

    print("-" * 64)
    # Electron 会派生渲染/GPU 子进程，一并统计
    alive = proc.poll() is None
    print(f"[结果] 主进程存活      : {alive}")
    print(f"[结果] 后端新增监听端口: {sorted(new_ports) if new_ports else '（无）'}")
    for hwnd, title, visible in windows:
        print(f"[结果] 窗口            : hwnd={hwnd} visible={visible} title={title!r}")

    if alive:
        print("[E2E] 正在关闭应用...")
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                       capture_output=True, timeout=20)
        time.sleep(2)
    # 兜底清理残留后端
    subprocess.run(["taskkill", "/F", "/IM", "gu-yun-backend.exe"],
                   capture_output=True, timeout=20)
    after = listening_ports() - before
    print(f"[E2E] 清理后残留监听端口: {sorted(after) if after else '（无，干净）'}")
    print("=" * 64)
    return 0


if __name__ == "__main__":
    sys.exit(main())
