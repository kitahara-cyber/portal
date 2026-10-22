"""朝のブリーフィング（ディレクターごと）の文面を作る。
使い方: python3 brief.py <日次報告 集計!D1:Y を取った保存ファイル> <顧客.json> <今日の定例.json> <YYYY-MM-DD 今日> > brief.json
  顧客.json : 設定シート「顧客」タブを get_values した保存ファイル（1行目が見出し）
  今日の定例.json : [{"director":"小山","time":"16:00","sis":"5473","name":"スクエアプランニング","deck":true}] ※deck=定例資料が作成済みか
出力: {"小山": "Slack に送る本文", ...}
"""
import json, sys, datetime, collections, unicodedata
N = lambda s: unicodedata.normalize('NFKC', str(s or '')).strip()
crm_p, cfg_p, ev_p, today_s = sys.argv[1:5]
TODAY = datetime.date.fromisoformat(today_s)
rows = json.load(open(crm_p))['values']; H = rows[0]; ix = {h: i for i, h in enumerate(H)}
f = lambda r, k: r[ix[k]] if k in ix and ix[k] < len(r) else ''
def num(x):
    try: return int(float(str(x).replace(',', '')))
    except: return 0
cfg = json.load(open(cfg_p))['values']; CH = cfg[0]
C = {N(r[0]): dict(zip(CH, r + [''] * (len(CH) - len(r)))) for r in cfg[1:] if r and N(r[0])}
act = {s for s, c in C.items() if c.get('状態') in ('稼働中', '稼働前')}
days = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0, 0]))  # sis -> date -> [架電, 会話, アポ]
renew = {}
for r in rows[1:]:
    if not r: continue
    s = N(r[0])
    if s not in act: continue
    try: d = datetime.date.fromisoformat(f(r, '日付')[:10])
    except: continue
    v = days[s][d]; v[0] += num(f(r, '架電数')); v[1] += num(f(r, 'ターゲット着電数')); v[2] += num(f(r, 'アポ獲得件数'))
    m = N(f(r, '1年目の契約満了月'))
    if m: renew[s] = m
def span(s, a, b):  # a <= d < b
    t = [0, 0, 0]
    for d, v in days[s].items():
        if a <= d < b:
            for j in range(3): t[j] += v[j]
    return t
tot_by_day = collections.Counter()
for s in days:
    for d, v in days[s].items(): tot_by_day[d] += v[0]
full = [d for d, v in tot_by_day.items() if d < TODAY and v >= 500]  # 報告がそろっている日だけ
last = max(full) if full else TODAY - datetime.timedelta(days=1)
ev = json.load(open(ev_p)) if ev_p != '-' else []
out = {}
for dname in sorted({c['担当'] for c in C.values() if c.get('担当')}):
    mine = [s for s in act if C[s].get('担当') == dname]
    if not mine: continue
    y = {s: span(s, last, last + datetime.timedelta(days=1)) for s in mine}
    ytot = [sum(v[j] for v in y.values()) for j in range(3)]
    alerts = []
    for s in mine:
        nm = C[s]['会社名']
        w4 = span(s, TODAY - datetime.timedelta(days=28), TODAY); p4 = span(s, TODAY - datetime.timedelta(days=56), TODAY - datetime.timedelta(days=28))
        w1 = span(s, TODAY - datetime.timedelta(days=10), TODAY)
        if w4[0] >= 300 and w4[2] == 0: alerts.append((0, f'{nm}：4週で{w4[0]:,}件架電してアポ0件 → リストかトークを今週変える'))
        elif p4[0] >= 200 and w4[0] >= 200 and p4[2] and (w4[2] / w4[0]) < (p4[2] / p4[0]) * 0.5: alerts.append((1, f'{nm}：アポ率が前の4週の半分以下（{p4[2]/p4[0]*100:.1f}%→{w4[2]/w4[0]*100:.1f}%）'))
        if C[s].get('状態') == '稼働中' and p4[0] > 0 and w1[0] == 0: alerts.append((2, f'{nm}：10日間架電がありません → 止まっている理由を確認'))
        rm = renew.get(s, '')
        try:
            rd = datetime.date.fromisoformat(rm.replace('/', '-')[:10])
            if 0 <= (rd - TODAY).days <= 45: alerts.append((3, f'{nm}：契約満了 {rd.month}/{rd.day}（あと{(rd - TODAY).days}日）→ 次の定例で成果のまとめと継続のご提案'))
        except: pass
    alerts.sort()
    good = sorted([(v[2], C[s]['会社名']) for s, v in y.items() if v[2] > 0], reverse=True)[:3]
    meets = [e for e in ev if e.get('director') == dname]
    L = [f'おはようございます。{TODAY.month}/{TODAY.day}（{"月火水木金土日"[TODAY.weekday()]}）の朝のブリーフィングです。']
    L.append(f'■ 今日の定例 {len(meets)}件')
    L += [f'・{e["time"]} {e["name"]}様　{"資料あり（ポータルの定例資料タブ）" if e.get("deck") else "資料なし"}' for e in meets] or ['・なし']
    L.append(f'■ {last.month}/{last.day} の動き（担当{len(mine)}社）：架電 {ytot[0]:,}件・ご担当者と会話 {ytot[1]:,}件・アポ {ytot[2]}件')
    if good: L.append('・アポが出た案件：' + '、'.join(f'{n} {a}件' for a, n in good))
    L.append(f'■ 気にしておく案件 {len(alerts)}件' + ('（上から優先）' if alerts else ''))
    L += ['・' + a for _, a in alerts[:6]] or ['・なし']
    if len(alerts) > 6: L.append(f'・ほか{len(alerts)-6}件は社内ポータルの「ディレクター別」へ')
    L.append('■ 今日やる3つ')
    todo = []
    if meets: todo.append(f'定例{len(meets)}件：ポータルの定例資料を画面共有して、5/10/15分の型で進める')
    if alerts: todo.append(alerts[0][1].split('：', 1)[0] + 'の打ち手を決める')
    todo.append('アップセル事例・企業マッチングから1社に打診する')
    L += [f'{i+1}. {t}' for i, t in enumerate(todo[:3])]
    if TODAY.weekday() == 0:
        L.append('■ 今週のCSMTGまとめ（下書き）')
        L.append('・担当案件の数字は社内ポータル「ディレクター別」、課題と練り直したい戦略は同じタブの02にあります。そのまま貼って使えます。')
    L.append('社内ポータル：https://kitahara-cyber.github.io/portal/')
    out[dname] = '\n'.join(L)
print(json.dumps(out, ensure_ascii=False, indent=1))
