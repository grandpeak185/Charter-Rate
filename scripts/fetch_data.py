# -*- coding: utf-8 -*-
"""
多数据源抓取脚本

抓取集装箱船期租租金行情数据,整合多源,输出 JSON 供前端展示。
每日北京时间12:00由GitHub Actions触发。

数据源优先级:
1. VHBS New ConTex 官网(免费,最权威) — https://www.vhbs.de/index.php?id=28
2. Hellenic Shipping News(转载New ConTex周报) — 兜底/补充
3. 种子历史数据(seed_data.py) — 2026年1月起的关键时点数据

输出文件:
- data/time_series.json   — 时序数据(综合指数+各船型)
- data/fixtures.json      — 租船成交案例
- data/last_update.json   — 更新元信息
"""

import json
import os
import sys
import re
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

# 让脚本能找到同目录模块
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seed_data import (
    NEWCONTEX_INDEX_HISTORY, NEWCONTEX_RATES_HISTORY,
    ALPHALINER_ASSESSMENTS, CLARKSONS_REFERENCE,
    FIXTURES_HISTORY, MARKET_EVENTS, SOURCES_META
)

# 数据输出到 docs/data/ (GitHub Pages根目录可访问)
# 同时保留 /data 副本用于仓库结构展示
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO_ROOT, "docs", "data")
DATA_DIR_BACKUP = os.path.join(REPO_ROOT, "data")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(DATA_DIR_BACKUP, exist_ok=True)

# 北京时间
BJT = timezone(timedelta(hours=8))


def http_get(url, timeout=30, retries=2):
    """带UA和重试的HTTP GET"""
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; CharterTracker/1.0; +https://github.com)"
    }
    last_err = None
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except Exception as e:
            last_err = e
            time.sleep(2 * (i + 1))
    print(f"[WARN] GET {url} failed: {last_err}", file=sys.stderr)
    return None


# ====================== 数据源1: VHBS New ConTex 官网 ======================
def fetch_vhbs_newcontex():
    """
    抓取VHBS官网最新2期New ConTex数据
    页面表格列顺序(从WebFetch观察):
    日期 | 1100(6m) | 1800(6m) | 2500(12m) | 2700(12m) | 3500(12m) | 4250(12m)
         | ConTex指数 | 2500(24m) | 2700(24m) | 3500(24m) | 4250(24m)
         | 5700(24m) | 6500(24m) | 1100(12m) | 1800(12m) | 5700(12m) | 6500(12m)

    船型租金: 德式千分位 17.959 -> 17959
    ConTex指数: 4位纯数字 1588
    """
    url = "https://www.vhbs.de/index.php?id=28"
    html = http_get(url)
    if not html:
        return [], "VHBS官网抓取失败(网络错误)"

    # 步骤1: 找到"数据行"的特征 — 包含 dd.mm.yyyy 且后续有多个数字
    # 用宽松正则匹配数字: X.XXX(德式租金) 或 XXXX(4位ConTex指数)
    # 先移除所有日期格式 dd.mm.yyyy 避免干扰数字匹配
    date_re = re.compile(r"(\d{2})\.(\d{2})\.(\d{4})")

    # 找到所有日期位置
    date_matches = list(date_re.finditer(html))
    if not date_matches:
        return [], "VHBS官网未找到日期"

    # 表格数据行特征: 日期紧邻多个数字
    # 表格列顺序
    ship_types = ["1100", "1800", "2500", "2700", "3500", "4250"]

    results = []
    seen_dates = set()

    for dm in date_matches:
        dd, mm, yyyy = dm.group(1), dm.group(2), dm.group(3)
        # 只处理2025年以后的日期(过滤页面其他位置的旧日期)
        if int(yyyy) < 2025:
            continue
        date_str = f"{yyyy}-{mm}-{dd}"
        if date_str in seen_dates:
            continue

        # 在日期后700字符内查找数字
        chunk = html[dm.end():dm.end() + 700]
        # 移除chunk内其他日期干扰
        chunk_clean = date_re.sub("", chunk)

        # 匹配数字: 德式 17.959 或 纯4位 1588
        nums = re.findall(r"\d{1,2}\.\d{3}|\b\d{4}\b", chunk_clean)
        if len(nums) < 7:  # 至少6船型+1指数
            continue

        rates = {}
        try:
            # 前6个: 船型租金(德式)
            for i, st in enumerate(ship_types):
                val = nums[i].replace(".", "")
                rates[st] = int(val)
            # 第7个: ConTex指数(4位纯数字)
            contex_raw = nums[6].replace(".", "")
            contex_index = int(contex_raw)
            # 合理性校验: ConTex指数通常在1000-3000区间
            if not (500 <= contex_index <= 5000):
                continue
        except (ValueError, IndexError):
            continue

        # 附加信息列(24个月期和12个月期大船)
        addl_keys = ["2500_24m", "2700_24m", "3500_24m", "4250_24m",
                     "5700_24m", "6500_24m", "1100_12m", "1800_12m",
                     "5700_12m", "6500_12m"]
        if len(nums) >= 17:
            try:
                for i, key in enumerate(addl_keys):
                    rates[key] = int(nums[7 + i].replace(".", ""))
            except (ValueError, IndexError):
                pass

        results.append({
            "date": date_str,
            "rates": rates,
            "contex_index": contex_index,
            "source": "VHBS官网"
        })
        seen_dates.add(date_str)

        # 只取最近3期(过滤多余)
        if len(results) >= 3:
            break

    # 按日期降序取最近2期
    results.sort(key=lambda x: x["date"], reverse=True)
    results = results[:2]
    # 恢复升序(便于合并)
    results.reverse()

    return results, "OK" if results else "VHBS解析失败"


# ====================== 数据源2: Hellenic Shipping News(兜底) ======================
def fetch_hellenic_contex():
    """从Hellenic Shipping News搜索New ConTex周报转载"""
    url = "https://www.hellenicshippingnews.com/?s=New+ConTex"
    html = http_get(url, timeout=20)
    if not html:
        return None, "Hellenic抓取失败"
    # 简化:只返回是否可访问,实际解析较复杂
    return None, "Hellenic兜底(需手动维护)"


# ====================== 主流程 ======================
def merge_history_with_live(live_data, history_data):
    """合并实时数据与历史数据,去重"""
    seen_dates = {item["date"] for item in live_data}
    merged = list(live_data)
    for item in history_data:
        if item["date"] not in seen_dates:
            merged.append(item)
            seen_dates.add(item["date"])
    # 按日期排序
    merged.sort(key=lambda x: x["date"])
    return merged


def build_time_series(live_contex):
    """构建完整时序数据集"""
    # New ConTex指数历史(合并实时)
    live_index = [
        {"date": d["date"], "index": d["contex_index"], "source": d["source"]}
        for d in live_contex if d.get("contex_index")
    ]
    history_index = [
        {"date": d[0], "index": d[1], "source": d[2]}
        for d in NEWCONTEX_INDEX_HISTORY
    ]
    all_index = merge_history_with_live(live_index, history_index)

    # 各船型日租金(合并实时与历史快照)
    live_rates = [
        {"date": d["date"], "rates": d["rates"], "source": d["source"]}
        for d in live_contex if d.get("rates")
    ]
    history_rates = [
        {"date": d[0], "rates": d[1], "source": d[2]}
        for d in NEWCONTEX_RATES_HISTORY
    ]
    all_rates = merge_history_with_live(live_rates, history_rates)

    return {
        "contex_index": all_index,
        "rates_by_type": all_rates,
        "alphaliner_assessments": [
            {"date": d[0], "teu": d[1], "rate": d[2], "source": d[3]}
            for d in ALPHALINER_ASSESSMENTS
        ],
        "clarksons_reference": [
            {"date": d[0], "desc": d[1], "rate": d[2], "source": d[3]}
            for d in CLARKSONS_REFERENCE
        ]
    }


def build_fixtures():
    """构建fixtures数据"""
    return [
        {
            "date": f[0], "vessel": f[1], "teu": f[2], "built": f[3],
            "charterer": f[4], "period": f[5], "rate": f[6], "source": f[7]
        }
        for f in FIXTURES_HISTORY
    ]


def main():
    print("=" * 60)
    print(f"集装箱船期租租金行情数据抓取 - {datetime.now(BJT).strftime('%Y-%m-%d %H:%M:%S')} BJT")
    print("=" * 60)

    fetch_status = {}

    # 1. VHBS New ConTex
    print("\n[1/2] 抓取 VHBS New ConTex 官网...")
    live_contex, msg = fetch_vhbs_newcontex()
    fetch_status["vhbs_newcontex"] = {
        "fetched": len(live_contex), "status": msg,
        "last_url": "https://www.vhbs.de/index.php?id=28"
    }
    print(f"  -> {msg}, 获取 {len(live_contex)} 期数据")
    if live_contex:
        for d in live_contex:
            print(f"     {d['date']}: ConTex={d.get('contex_index')}")

    # 2. Hellenic兜底
    print("\n[2/2] 检查 Hellenic Shipping News 兜底...")
    _, hmsg = fetch_hellenic_contex()
    fetch_status["hellenic"] = {"status": hmsg}
    print(f"  -> {hmsg}")

    # 构建输出
    time_series = build_time_series(live_contex)
    fixtures = build_fixtures()

    # 元信息
    meta = {
        "last_update_bjt": datetime.now(BJT).strftime("%Y-%m-%d %H:%M:%S %Z"),
        "last_update_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "fetch_status": fetch_status,
        "data_sources": SOURCES_META,
        "market_events": MARKET_EVENTS,
        "notes": [
            "完整New ConTex历史数据需VHBS会员订阅,本站整合公开渠道数据",
            "Alphaliner/Clarkson为付费数据,本站仅展示公开引用部分",
            "fixtures来自媒体报道(Braemar/Lloyd's List/The Loadstar/Dynamar)",
            "数据仅供租船决策参考,实际成交以经纪商确认数据为准"
        ]
    }

    # 写入文件(docs/data + data 两份)
    files = [
        ("time_series.json", time_series),
        ("fixtures.json", fixtures),
        ("last_update.json", meta),
    ]
    for name, content in files:
        for d in (DATA_DIR, DATA_DIR_BACKUP):
            with open(os.path.join(d, name), "w", encoding="utf-8") as f:
                json.dump(content, f, ensure_ascii=False, indent=2)

    ts_path = os.path.join(DATA_DIR, "time_series.json")
    fx_path = os.path.join(DATA_DIR, "fixtures.json")
    meta_path = os.path.join(DATA_DIR, "last_update.json")

    print(f"\n[OK] 数据写入完成:")
    print(f"  - {ts_path} (指数:{len(time_series['contex_index'])}期, 船型快照:{len(time_series['rates_by_type'])}期)")
    print(f"  - {fx_path} (fixtures:{len(fixtures)}条)")
    print(f"  - {meta_path}")
    print(f"  - 同时备份至 {DATA_DIR_BACKUP}")
    print(f"\n下次更新: GitHub Actions 每日北京时间12:00自动触发")


if __name__ == "__main__":
    main()
