# 週次報告の KPI（架電・アポ・A/B/Cランク）を日次報告から計算する。
# 使い方：python3 kpi.py <日次報告「集計」を get_values した保存ファイル> <今回のMTG日 YYYY-MM-DD> <前回のMTG日 YYYY-MM-DD>
# 出力：kpi-slide の JSON（標準出力）
# 決まり（【CS週報】の高橋さんの数字と 11/13・11/16・11/20 で一致を確認済み）：
#  - 集計の範囲は「その月の1日〜MTG日の前日」。種別はテレアポ・ウェビナーテレアポの両方を含む。
#  - 稼働社数＝その期間に架電数が1以上の SIS の数。
#  - ランク＝その期間の SIS ごとのアポ率（アポ獲得件数÷架電数）で、A：1.0%以上／B：0.4%以上1.0%未満／C：0.4%未満。
import json, sys, collections, datetime

def num(x):
    s = str(x).replace(',', '').strip()
    try: return float(s)
    except ValueError: return 0.0

def calc(rows, I, mtg):
    d = datetime.date.fromisoformat(mtg)
    end = (d - datetime.timedelta(days=1)).isoformat()
    start = d.replace(day=1).isoformat() if d.day > 1 else (d - datetime.timedelta(days=1)).replace(day=1).isoformat()
    calls = collections.defaultdict(float); appts = collections.defaultdict(float)
    for r in rows:
        if len(r) <= I['アポ獲得件数']: continue
        day = str(r[I['日付']])
        if start <= day <= end:
            calls[r[I['SIS']]] += num(r[I['架電数']]); appts[r[I['SIS']]] += num(r[I['アポ獲得件数']])
    active = [s for s in calls if calls[s] > 0]
    tc, ta = sum(calls.values()), sum(appts.values())
    a = b = c = 0
    for s in active:
        rate = appts[s] / calls[s] * 100
        if rate >= 1.0: a += 1
        elif rate >= 0.4: b += 1
        else: c += 1
    n = len(active) or 1
    return {'start': start, 'end': end, 'calls': int(tc), 'appts': int(ta), 'rate': (ta / tc * 100 if tc else 0),
            'active': len(active), 'A': a, 'B': b, 'C': c, 'pA': round(a / n * 100), 'pB': round(b / n * 100), 'pC': round(c / n * 100)}

def md(iso):
    d = datetime.date.fromisoformat(iso); return f"{d.month}/{d.day}"

def main():
    path, mtg, prev = sys.argv[1], sys.argv[2], sys.argv[3]
    v = json.load(open(path, encoding='utf-8'))['values']
    I = {k: i for i, k in enumerate(v[0])}
    rows = v[1:]
    cur, pre = calc(rows, I, mtg), calc(rows, I, prev)
    same_month = cur['start'] == pre['start']
    month = int(cur['start'][5:7])
    def f(n): return f"{n:,}"
    pl = (lambda x: f"（{md(prev)}）") if same_month else (lambda x: f"（{md(prev)}・前月）")
    slide = {
        'type': 'kpi-slide', 'section': 'KPI',
        'title': f"架電・アポ・ランク（{month}月累計・{md(cur['end'])}まで） 稼働{cur['active']}社",
        'calls': {'prev': f(pre['calls']) + pl(0), 'current': f(cur['calls']), 'diff': (f"+{f(cur['calls'] - pre['calls'])}" if same_month else '')},
        'appts': {'prev': f(pre['appts']) + pl(0), 'current': f(cur['appts']), 'diff': (f"+{f(cur['appts'] - pre['appts'])}" if same_month else ''), 'rate': f"{cur['rate']:.1f}%"},
        'tiers': [{'name': k, 'current': f"{cur['p' + k]}%（{cur[k]}社）", 'prev': f"{pre['p' + k]}%"} for k in 'ABC'],
        'auto': {'source': '日次報告（キントーン出力）「集計」', 'cur': cur, 'prev': pre},
    }
    print(json.dumps(slide, ensure_ascii=False))

if __name__ == '__main__':
    main()
