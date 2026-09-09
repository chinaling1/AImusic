# -*- coding: utf-8 -*-
"""MiniMax 提示词工具端到端测试脚本（真实 LLM 调用）

测试链路：提示词优化 → 歌词生成 → 确定性格式校验
用法：python tests/e2e_test.py
"""
import json
import sys
import urllib.request
import urllib.error

BASE = "http://127.0.0.1:8000"
TIMEOUT = 240


def post(path: str, payload: dict) -> dict:
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    idea = "写一首以匠心传承为主题的古风歌曲，古筝与笛子对答，副歌大气磅礴，女声清亮婉转，适合非遗主题晚会演唱"

    print("=" * 60)
    print("【1/3】提示词优化（生成 MiniMax 结构化元标签 + Styles）")
    print("=" * 60)
    r1 = post("/api/prompt/optimize", {"prompt": idea, "step": "prompt"})
    optimized = r1["optimized_prompt"]
    print(optimized)
    has_meta = "===META===" in optimized
    has_styles = "===STYLES===" in optimized
    print(f"\n[断言] 含 ===META=== 段：{has_meta} | 含 ===STYLES=== 段：{has_styles}")

    print()
    print("=" * 60)
    print("【2/3】歌词生成（MiniMax 英文结构标签格式）")
    print("=" * 60)
    r2 = post("/api/lyric/generate", {"prompt": optimized, "style": "古风；押韵偏好：自动"})
    lyrics = r2["lyrics"]
    print(lyrics)
    print(f"\n歌词字符数：{len(lyrics)} / 3500")

    # 解析 META / STYLES 供校验使用
    import re
    meta = re.search(r"===META===\s*([\s\S]*?)(?====STYLES===|$)", optimized)
    styles = re.search(r"===STYLES===\s*([\s\S]*)$", optimized)
    styles_text = styles.group(1).strip() if styles else ""

    print()
    print("=" * 60)
    print("【3/3】确定性格式校验（/api/minimax/validate）")
    print("=" * 60)
    r3 = post("/api/minimax/validate", {
        "styles": styles_text,
        "meta_tags": meta.group(1).strip() if meta else "",
        "lyrics": lyrics,
        "instrumental": False,
    })
    print(f"校验通过：{r3['ok']}")
    print(f"统计：styles {r3['stats']['styles_chars']}/{r3['stats']['styles_limit']} 字符，"
          f"lyrics {r3['stats']['lyrics_chars']}/{r3['stats']['lyrics_limit']} 字符，"
          f"段落 {r3['stats']['section_count']} 个")
    print(f"段落结构：{' → '.join(r3['stats']['sections'])}")
    if r3["issues"]:
        print("问题列表：")
        for i in r3["issues"]:
            print(f"  [{i['level']}] {i['message']}")
    else:
        print("问题列表：无")

    # 保存测试结果供存档
    with open("tests/e2e_result.json", "w", encoding="utf-8") as f:
        json.dump({"idea": idea, "optimized": optimized, "lyrics": lyrics,
                   "validation": r3}, f, ensure_ascii=False, indent=2)
    print("\n结果已保存至 tests/e2e_result.json")

    ok = has_meta and has_styles and r3["ok"]
    print(f"\n【总判定】{'通过' if ok else '存在问题'}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
