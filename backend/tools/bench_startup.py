# -*- coding: utf-8 -*-
"""后端启动耗时基准测试

用途：量化「进程启动 → 首个 HTTP 200」的耗时，用于验证启动速度优化效果。
用法：python tools/bench_startup.py
"""
import subprocess
import sys
import time
import urllib.request

PY = sys.executable
PORT = "8099"   # 独立端口，避免与开发服务 8000 冲突
URL = f"http://127.0.0.1:{PORT}/api/minimax/format-spec"
TIMEOUT = 120


def wait_for_service(url: str, timeout: int) -> float:
    """轮询直到服务可用，返回耗时（秒）"""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=3):
                return time.time()
        except Exception:
            time.sleep(0.2)
    raise TimeoutError(f"服务在 {timeout}s 内未就绪")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    start = time.time()
    proc = subprocess.Popen(
        [PY, "-X", "utf8", "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", PORT],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        ready_at = wait_for_service(URL, TIMEOUT)
        elapsed = ready_at - start
        print(f"启动就绪耗时：{elapsed:.2f} 秒")
        return elapsed
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()


if __name__ == "__main__":
    main()
