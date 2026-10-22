"""「1億への道筋」の数字をディレクターごとに作る（director-day の 06 ROAD）。
使い方: python3 road.py <cfg.json> <pl.json> <cu.json> <fee.json> <jd.json> <YYYY-MM-DD 今日> > road.json
  cfg.json : 設定シート「顧客」タブ（A〜R。P=月額費用 Q=初期費用 R=契約開始月）
  pl.json  : JD営業支援_アポ一覧「パートナー一覧」A1:L1200（App424）
  cu.json  : 同「顧客情報」A1:P4500
  fee.json : 同「月額変更推移」A1:H1000
  jd.json  : jd.py の出力
定義（画面にも書く）：1億＝担当顧客の月額×12（ストック）。初期費用は営業の獲得なので含めず参考表示。
"""
import json, sys, re, datetime, collections, statistics, unicodedata
N = lambda s: unicodedata.normalize('NFKC', str(s or '')).strip()
num = lambda s: int(re.sub(r'[^\d]', '', N(s)) or 0)
cfg_p, pl_p, cu_p, fee_p, jd_p, today_s = sys.argv[1:7]
TODAY = datetime.date.fromisoformat(today_s); Y1 = str(TODAY - datetime.timedelta(days=365))
GOAL = 100_000_000; CAP = 50
def tab(p):
    v = json.load(open(p))['values']; h = v[0]; return [dict(zip(h, [N(x) for x in r] + [''] * (len(h) - len(r)))) for r in v[1:]]
cfg = tab(cfg_p); C = {r['SIS']: r for r in cfg if r['SIS']}
act = {s for s, c in C.items() if c.get('状態') in ('稼働中', '稼働前') and (c.get('契約状況（顧客情報）', '契約中') in ('', '契約中', '請求停止') or c.get('扱い（手動の例外）', '').startswith('稼働中として扱う'))}
PL = {}
for r in sorted(tab(pl_p), key=lambda r: r.get('更新日時', '')): PL[r['SIS']] = r
DIRN = lambda d: d.replace('髙', '高')
CU = collections.defaultdict(list)
for r in tab(cu_p): CU[r['SIS']].append(r)
JD = json.load(open(jd_p)) if jd_p != '-' else {}
# 過去1年の「増えた・減った」（キントーンのメインディレクターで集計）
hist = collections.defaultdict(lambda: dict(up=[0, 0], down=[0, 0], churn=[0, 0]))
for s, p in PL.items():
    d = DIRN(p.get('メインディレクター', ''))
    if not d or d == '解約': continue
    c = [x for x in CU.get(s, []) if x['ステータス'] in ('解約', '解約処理中') and x['解約日'] >= Y1]
    if c: hist[d]['churn'][0] += 1; hist[d]['churn'][1] += num(p['月額費用']) or num(c[-1]['月額費用金額'])
for r in tab(fee_p):
    if r['月額費用変更日'].replace('/', '-') < Y1: continue
    d = DIRN(PL.get(r['SIS'], {}).get('メインディレクター', ''))
    if not d: continue
    diff = num(r['変更後金額']) - num(r['変更前金額'])
    k = 'up' if diff > 0 else 'down'; hist[d][k][0] += 1; hist[d][k][1] += abs(diff)
ups_all = [num(r['変更後金額']) - num(r['変更前金額']) for r in tab(fee_p) if num(r['変更後金額']) > num(r['変更前金額'])]
UP_MED = int(statistics.median(ups_all)) if ups_all else 30000
def ym(s):
    m = re.match(r'(\d{4})[/-](\d{1,2})', s or ''); return datetime.date(int(m.group(1)), int(m.group(2)), 1) if m else None
out = dict(goal=GOAL, cap=CAP, up_med=UP_MED, per=round(GOAL / 12 / CAP), dirs={})
for d in sorted({C[s]['担当'] for s in act if C[s].get('担当')}):
    mine = [s for s in act if C[s].get('担当') == d]
    fee = {s: num(C[s].get('月額費用', '')) for s in mine}
    mrr = sum(fee.values()); paid = [s for s in mine if fee[s] > 0]; nofee = [s for s in mine if fee[s] == 0]
    avg = round(mrr / len(paid)) if paid else 0
    # 継続の山（6か月以内に満了）
    renew = []
    for s in mine:
        rd = ym(C[s].get('契約満了月（更新情報）', ''))
        if rd and TODAY.replace(day=1) <= rd <= (TODAY + datetime.timedelta(days=183)):
            renew.append(dict(sis=s, name=C[s]['会社名'], m=f'{rd.year}/{rd.month}', yomi=C[s].get('継続ヨミ', '') or '未入力', fee=fee[s]))
    renew.sort(key=lambda x: (x['m'] if len(x['m']) == 7 else x['m'][:5] + '0' + x['m'][5:]))
    risk = [x for x in renew if not re.match(r'[AB]', x['yomi'])]  # Aヨミ・Bヨミ以外（Cのまま・未入力）
    small = sorted([dict(sis=s, name=C[s]['会社名'], fee=fee[s]) for s in paid if fee[s] < out['per']], key=lambda x: x['fee'])
    # データの抜け（いまの管理の見えないところ）
    q = dict(nofee=len(nofee), yomi=sum(1 for s in mine if not re.match(r'[AB]', C[s].get('継続ヨミ', ''))), blank=sum(JD.get(s, {}).get('appts', {}).get('blank_past', 0) for s in mine),
             task=sum(1 for s in mine for t in JD.get(s, {}).get('tasks', []) if t['due'] and t['due'] < str(TODAY)),
             mism=sum(1 for s in mine if C[s].get('キントーン担当（App424）') and DIRN(C[s]['キントーン担当（App424）']) != d))
    h = hist.get(d, dict(up=[0, 0], down=[0, 0], churn=[0, 0]))
    seats = max(0, CAP - len(mine))
    L1 = seats * avg * 12                                  # 50社まで担当を増やす
    L2 = len(small) * UP_MED * 12                          # 1社あたり月額をふつうの値上げ幅で上げる
    L3 = sum(x['fee'] for x in risk) * 12                  # 更新の山を落とさない（守り）
    out['dirs'][d] = dict(n=len(mine), paid=len(paid), mrr=mrr, arr=mrr * 12, avg=avg, gap=max(0, GOAL - mrr * 12),
        levers=[dict(k='seats', v=L1, n=seats), dict(k='price', v=L2, n=len(small)), dict(k='keep', v=L3, n=len(risk))],
        renew=renew[:12], nrenew=len(renew), small=small[:8], nofee=[C[s]['会社名'] for s in nofee][:10], q=q, hist=h)
print(json.dumps(out, ensure_ascii=False))
