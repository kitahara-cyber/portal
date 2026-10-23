"""ディレクター株価（ローソク足）。1,000円から始め、毎営業日「その日のアポ − 自分のふだんのアポ」で上げ下げ。
受注・顧客アンケート・ロープレ評価などの出来事（設定シート「株価イベント」タブ）があれば、その日に上下させる。
使い方: python3 candle.py <crm.json> <cfg.json> <clients.json> <events.json or -> <YYYY-MM-DD 今日> [jd.json] > candle.json"""
import json, sys, datetime, collections, unicodedata
N = lambda s: unicodedata.normalize('NFKC', str(s or '')).strip()
crm_p, cfg_p, cl_p, ev_p, today_s = sys.argv[1:6]
jd_p = sys.argv[6] if len(sys.argv) > 6 else '-'  # jd.py の出力（受注）
TODAY = datetime.date.fromisoformat(today_s)
rows = json.load(open(crm_p))['values']; ix = {h: i for i, h in enumerate(rows[0])}
f = lambda r, k: r[ix[k]] if k in ix and ix[k] < len(r) else ''
num = lambda x: int(float(str(x).replace(',', '') or 0)) if str(x).replace(',', '').replace('.', '').isdigit() else 0
cfg = json.load(open(cfg_p))['values']; H = cfg[0]
DIR = {N(r[0]): dict(zip(H, r + [''] * len(H))).get('担当', '') for r in cfg[1:] if r}
for s, o in json.load(open(cl_p)).items(): DIR.setdefault(s, o.get('director', ''))
day = collections.defaultdict(lambda: collections.Counter())
for r in rows[1:]:
    if not r: continue
    try: d = datetime.date.fromisoformat(f(r, '日付')[:10])
    except: continue
    who = DIR.get(N(r[0]), '')
    if who: day[who][d] += num(f(r, 'アポ獲得件数'))
tot = collections.Counter()
for w in day: 
    for d, v in day[w].items(): tot[d] += v
START = TODAY - datetime.timedelta(days=7 * 12); START -= datetime.timedelta(days=START.weekday())
days = [START + datetime.timedelta(days=i) for i in range((TODAY - START).days) if (START + datetime.timedelta(days=i)).weekday() < 5]
days = [d for d in days if d < TODAY and tot[d] > 0]  # 報告がある日だけ
EV = collections.defaultdict(list)
if jd_p != '-':
    for s_, x in json.load(open(jd_p)).items():
        for dt, org in x.get('appts', {}).get('recent_win', []):
            if DIR.get(s_): EV[(DIR[s_], datetime.date.fromisoformat(dt))].append(('受注', 3.0, ''))
if ev_p != '-':
    v = json.load(open(ev_p))['values']; h = v[0]
    for r in v[1:]:
        e = dict(zip(h, [N(x) for x in r] + [''] * len(h)))
        try: EV[(e['ディレクター'], datetime.date.fromisoformat(e['日付'].replace('/', '-')[:10]))].append((e['種類'], float(e['上げ下げ（%）'] or 0), e['メモ']))
        except: pass
out = dict(start=1000, note='1,000円から。毎営業日、その日のアポ数を自分のふだん（直近20営業日の1日平均）と比べて上げ下げ（ふだんの2倍で+4%、0件で−4%、1日の上限±10%）。担当のお客様の商談が受注になった日は+3%。顧客アンケート・ロープレのAI評価は設定シート「株価イベント」に入れると、その日に上乗せ。', dirs={})
for w in sorted(day):
    hist = []; p = 1000.0; wk = collections.OrderedDict(); evs = []
    for d in days:
        prev = [day[w][x] for x in days if x < d][-20:]
        avg = (sum(prev) / len(prev)) if prev else (day[w][d] or 1)
        o = p; r = max(-0.10, min(0.10, 0.04 * (day[w][d] - avg) / max(avg, 1)))
        hi = p * (1 + max(r, 0) + 0.004); lo = p * (1 + min(r, 0) - 0.004)
        p = p * (1 + r)
        for kind, pct, memo in EV.get((w, d), []):
            p *= 1 + pct / 100; hi = max(hi, p); lo = min(lo, p); evs.append([str(d), kind, pct, memo])
        k = d - datetime.timedelta(days=d.weekday())
        if k not in wk: wk[k] = [o, max(o, hi), min(o, lo), p, 0]
        c = wk[k]; c[1] = max(c[1], hi, p); c[2] = min(c[2], lo, p); c[3] = p; c[4] += day[w][d]
    if sum(c[4] for c in wk.values()) == 0: continue
    out['dirs'][w] = dict(c=[[f'{k.month}/{k.day}', round(v[0]), round(v[1]), round(v[2]), round(v[3]), v[4]] for k, v in wk.items()], ev=evs[-10:], now=round(p))
print(json.dumps(out, ensure_ascii=False))
