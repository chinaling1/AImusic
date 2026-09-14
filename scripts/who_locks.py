# -*- coding: utf-8 -*-
"""
查询指定文件被哪些进程占用（Windows Restart Manager API）。

用途：诊断构建产物 app.asar 无法删除的原因——删除报 WinError 32 时，
      需要知道究竟是谁持有句柄，否则只能盲等。

用法：python scripts/who_locks.py <文件路径>
"""
import ctypes
import sys
from ctypes import wintypes

rstrtmgr = ctypes.WinDLL("rstrtmgr")

CCH_RM_SESSION_KEY = 32
CCH_RM_MAX_APP_NAME = 255
CCH_RM_MAX_SVC_NAME = 63
ERROR_MORE_DATA = 234
ERROR_SUCCESS = 0


class RM_UNIQUE_PROCESS(ctypes.Structure):
    _fields_ = [
        ("dwProcessId", wintypes.DWORD),
        ("ProcessStartTime", wintypes.FILETIME),
    ]


class RM_PROCESS_INFO(ctypes.Structure):
    _fields_ = [
        ("Process", RM_UNIQUE_PROCESS),
        ("strAppName", wintypes.WCHAR * (CCH_RM_MAX_APP_NAME + 1)),
        ("strServiceShortName", wintypes.WCHAR * (CCH_RM_MAX_SVC_NAME + 1)),
        ("ApplicationType", ctypes.c_uint),
        ("AppStatus", wintypes.ULONG),
        ("TSSessionId", wintypes.DWORD),
        ("bRestartable", wintypes.BOOL),
    ]


def who_locks(path: str):
    """返回占用该文件的进程列表 [(pid, 应用名, 服务名), ...]"""
    session = wintypes.DWORD()
    key = ctypes.create_unicode_buffer(CCH_RM_SESSION_KEY + 1)

    rc = rstrtmgr.RmStartSession(ctypes.byref(session), 0, key)
    if rc != ERROR_SUCCESS:
        raise OSError(f"RmStartSession 失败，错误码 {rc}")

    try:
        files = (wintypes.LPCWSTR * 1)(path)
        rc = rstrtmgr.RmRegisterResources(session, 1, files, 0, None, 0, None)
        if rc != ERROR_SUCCESS:
            raise OSError(f"RmRegisterResources 失败，错误码 {rc}")

        need = wintypes.UINT(0)
        count = wintypes.UINT(0)
        reasons = wintypes.DWORD(0)
        # 首次调用：探明所需缓冲区大小（rgAffectedApps 传 NULL，预期返回 ERROR_MORE_DATA）
        rc = rstrtmgr.RmGetList(
            session, ctypes.byref(need), ctypes.byref(count), None, ctypes.byref(reasons)
        )
        if rc == ERROR_SUCCESS and need.value == 0:
            return []
        if rc != ERROR_MORE_DATA:
            raise OSError(f"RmGetList(探测) 失败，错误码 {rc}")

        # 第二次调用：按所需大小分配缓冲。两次调用之间所需数量可能变化，
        # 故循环重试，直到返回 ERROR_SUCCESS。
        for _ in range(5):
            size = max(need.value, 1)
            arr = (RM_PROCESS_INFO * size)()
            count.value = size
            rc = rstrtmgr.RmGetList(
                session, ctypes.byref(need), ctypes.byref(count), arr, ctypes.byref(reasons)
            )
            if rc == ERROR_SUCCESS:
                return [
                    (arr[i].Process.dwProcessId, arr[i].strAppName, arr[i].strServiceShortName)
                    for i in range(count.value)
                ]
            if rc != ERROR_MORE_DATA:
                raise OSError(f"RmGetList(读取) 失败，错误码 {rc}")
        raise OSError("RmGetList 多次重试仍返回 ERROR_MORE_DATA")
    finally:
        rstrtmgr.RmEndSession(session)


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python scripts/who_locks.py <文件路径>")
        return 2

    path = sys.argv[1]
    print(f"目标文件: {path}")
    try:
        procs = who_locks(path)
    except Exception as exc:  # noqa: BLE001
        print("查询失败:", type(exc).__name__, exc)
        return 1

    if not procs:
        print("未发现占用该文件的进程（可能锁在系统内核或其他会话中）")
        return 0

    print(f"占用该文件的进程（{len(procs)} 个）:")
    for pid, app, svc in procs:
        label = svc if svc else app
        print(f"  PID={pid:<8} 应用={app!r} 服务={svc!r}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
