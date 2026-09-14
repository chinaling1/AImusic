# -*- coding: utf-8 -*-
"""
窗口截图验证脚本（纯标准库，无需 Pillow）。

用途：启动打包后的「古韵AI」，等待主窗口出现，对窗口客户区截图并保存 PNG，
      用于确认界面确实渲染出来（而非白屏）。

实现要点：
- 用 EnumWindows 按标题定位窗口；
- 用 PrintWindow(PW_RENDERFULLCONTENT) 抓取窗口位图，
  该方式即使在窗口被遮挡时也能取到内容，比屏幕区域截屏更可靠；
- 手工构造 PNG（zlib + CRC32），避免为一次性验证引入第三方依赖。
"""
import ctypes
import ctypes.wintypes as wt
import os
import struct
import subprocess
import sys
import time
import zlib

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32

PROJECT = r"G:\cunchu\大学\作业\AI音乐"
BASE = os.path.join(PROJECT, "release-v234", "win-unpacked")
EXE = os.path.join(BASE, "古韵AI.exe")
OUT_PNG = os.path.join(PROJECT, "修复验证-主界面.png")


class BITMAPINFOHEADER(ctypes.Structure):
    _fields_ = [
        ("biSize", wt.DWORD), ("biWidth", wt.LONG), ("biHeight", wt.LONG),
        ("biPlanes", wt.WORD), ("biBitCount", wt.WORD), ("biCompression", wt.DWORD),
        ("biSizeImage", wt.DWORD), ("biXPelsPerMeter", wt.LONG),
        ("biYPelsPerMeter", wt.LONG), ("biClrUsed", wt.DWORD), ("biClrImportant", wt.DWORD),
    ]


def find_window(substring: str, timeout: float = 45.0):
    """按标题子串查找可见的顶层窗口，返回 hwnd；超时返回 None。"""
    deadline = time.time() + timeout
    while time.time() < deadline:
        found = []

        WNDENUMPROC = ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM)

        def _cb(hwnd, _lp):
            if not user32.IsWindowVisible(hwnd):
                return True
            n = user32.GetWindowTextLengthW(hwnd)
            if n > 0:
                buf = ctypes.create_unicode_buffer(n + 1)
                user32.GetWindowTextW(hwnd, buf, n + 1)
                if substring in buf.value:
                    found.append((hwnd, buf.value))
            return True

        user32.EnumWindows(WNDENUMPROC(_cb), 0)
        if found:
            return found[0]
        time.sleep(0.5)
    return None


def write_png(path: str, width: int, height: int, bgra: bytes) -> None:
    """把 BGRA 像素数据写成 PNG（RGBA、8bit、无隔行）。"""
    # BGRA -> RGBA，同时加每行首字节的 filter type(0)
    rows = []
    stride = width * 4
    for y in range(height):
        line = bytearray(bgra[y * stride:(y + 1) * stride])
        # 交换 B 与 R 通道
        line[0::4], line[2::4] = line[2::4], line[0::4]
        rows.append(b"\x00" + bytes(line))
    raw = b"".join(rows)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data)) + tag + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 6))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def capture(hwnd, out_path: str) -> tuple:
    """抓取窗口位图并保存为 PNG，返回 (宽, 高)。"""
    rect = wt.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(rect))
    width = rect.right - rect.left
    height = rect.bottom - rect.top

    hdc_win = user32.GetWindowDC(hwnd)
    hdc_mem = gdi32.CreateCompatibleDC(hdc_win)
    hbmp = gdi32.CreateCompatibleBitmap(hdc_win, width, height)
    gdi32.SelectObject(hdc_mem, hbmp)

    # PW_RENDERFULLCONTENT = 0x00000002：支持 DirectComposition 渲染的内容
    user32.PrintWindow(hwnd, hdc_mem, 2)

    bmi = BITMAPINFOHEADER()
    bmi.biSize = ctypes.sizeof(BITMAPINFOHEADER)
    bmi.biWidth = width
    bmi.biHeight = -height          # 负值表示自上而下存储
    bmi.biPlanes = 1
    bmi.biBitCount = 32
    bmi.biCompression = 0           # BI_RGB

    buf = ctypes.create_string_buffer(width * height * 4)
    gdi32.GetDIBits(hdc_mem, hbmp, 0, height, buf, ctypes.byref(bmi), 0)

    write_png(out_path, width, height, buf.raw)

    gdi32.DeleteObject(hbmp)
    gdi32.DeleteDC(hdc_mem)
    user32.ReleaseDC(hwnd, hdc_win)
    return width, height


def main() -> int:
    env = dict(os.environ)
    # 清除 WorkBuddy 注入的变量，否则 Electron 会退化为纯 Node 模式而秒退
    env.pop("ELECTRON_RUN_AS_NODE", None)

    log_out = open(os.path.join(PROJECT, "capture_out.log"), "wb")
    proc = subprocess.Popen([EXE], cwd=BASE, stdout=log_out, stderr=subprocess.STDOUT, env=env)
    print(f"[截图] 已启动应用，PID = {proc.pid}")

    hit = find_window("古韵AI")
    if not hit:
        print("[截图] 未找到主窗口（应用可能未启动成功）")
        proc.kill()
        return 1

    hwnd, title = hit
    print(f"[截图] 找到窗口：title={title!r} hwnd={hwnd}")

    # 给前端渲染与接口首屏请求留出时间
    time.sleep(6)

    w, h = capture(hwnd, OUT_PNG)
    print(f"[截图] 已保存 {OUT_PNG}  ({w}x{h})")

    proc.kill()
    time.sleep(2)
    subprocess.run(["taskkill", "/F", "/IM", "gu-yun-backend.exe", "/T"],
                   capture_output=True)
    log_out.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
