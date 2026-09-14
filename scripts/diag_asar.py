# -*- coding: utf-8 -*-
"""
解析 app.asar 头部，列出顶层条目，检查 package.json 与 main 入口是否存在。
asar 格式：16 字节 pickle 头 + JSON 目录表 + 文件数据。
"""
import json
import struct
import sys


def read_asar_header(path: str):
    with open(path, "rb") as f:
        head = f.read(16)
        # 前 4 字节：后续 pickle 字段长度；随后 3 个 uint32 描述 header 大小
        _, header_size, _, json_size = struct.unpack("<4I", head)
        raw = f.read(json_size)
        return json.loads(raw.decode("utf-8")), json_size


def walk(node, prefix="", out=None, depth=0, max_depth=3):
    """递归列出目录树（限制深度，避免输出爆炸）。"""
    if out is None:
        out = []
    files = node.get("files", {})
    for name, meta in files.items():
        path = f"{prefix}/{name}"
        if "files" in meta:
            out.append(("DIR ", path))
            if depth < max_depth:
                walk(meta, path, out, depth + 1, max_depth)
        else:
            if "unpacked" in meta:
                out.append(("LINK", f"{path} (unpacked)"))
            else:
                out.append(("FILE", f"{path}  size={meta.get('size')}"))
    return out


def main():
    asar = r"G:\cunchu\大学\作业\AI音乐\release\win-unpacked\resources\app.asar"
    tree, jsize = read_asar_header(asar)
    print(f"asar 头部 JSON 大小: {jsize} 字节")
    print("=" * 60)
    print("[顶层条目]")
    for name in tree.get("files", {}):
        print(f"  {name}")
    print("=" * 60)

    top = tree.get("files", {})
    has_pkg = "package.json" in top
    print(f"根目录 package.json 存在: {has_pkg}")

    if has_pkg:
        pkg_meta = top["package.json"]
        print(f"  package.json meta: {pkg_meta}")
        # 读取 package.json 真实内容
        offset = pkg_meta.get("offset")
        size = pkg_meta.get("size")
        with open(asar, "rb") as f:
            data_start = 16 + jsize
            f.seek(data_start + int(offset))
            content = f.read(int(size)).decode("utf-8", "replace")
        print("  内容:")
        print(content)
        try:
            pkg = json.loads(content)
            print(f"  main 字段 = {pkg.get('main')!r}")
        except Exception as exc:  # noqa: BLE001
            print(f"  JSON 解析失败: {exc}")

    print("=" * 60)
    print("[electron 目录内容]")
    el = top.get("electron", {})
    for name, meta in el.get("files", {}).items():
        print(f"  electron/{name}  {meta}")

    print("=" * 60)
    print("[frontend/dist 内容]")
    fe = top.get("frontend", {}).get("files", {}).get("dist", {})
    for name, meta in fe.get("files", {}).items():
        print(f"  frontend/dist/{name}  {meta}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
