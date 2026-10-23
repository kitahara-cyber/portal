"""「ディレクターの1日」ページを、今日のディレクターごとの指示つきで作る。
使い方: python3 dday.py <crm.json> <cfg.json> <ev.json> <鍵> <YYYY-MM-DD 今日> <出力 body.html> [road.json] [karte.json]
  crm.json / cfg.json / ev.json は朝のブリーフィングと同じもの（RUNBOOK_morning.md）
  鍵 : 設定シート「担当」タブの「鍵」（knowledge.enc を開く）
出力した body.html を lock.py で社内ポータルと同じパスワードにして director-day/index.html に置く。"""
import json, sys, os, base64, datetime, collections, unicodedata, re
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
N = lambda s: unicodedata.normalize('NFKC', str(s or '')).strip()
crm_p, cfg_p, ev_p, key, today_s, out_p = sys.argv[1:7]
road_p = sys.argv[7] if len(sys.argv) > 7 else '-'  # road.py の出力（1億への道筋）
karte_p = sys.argv[8] if len(sys.argv) > 8 else '-'  # 商材カルテ（カルテ!A1:L300 を get_values した保存ファイル）
KT = {}
if karte_p != '-':
    _v = json.load(open(karte_p))['values']; _h = _v[0]
    for _r in _v[1:]:
        _d = dict(zip(_h, [N(x) for x in _r] + [''] * len(_h)))
        if _d.get('SIS'): KT[_d['SIS']] = dict(n=sum(1 for k in _h[3:8] if _d.get(k)), ask=[x for x in _d.get('次の定例で聞くこと', '').split('／') if x])
HERE = os.path.dirname(os.path.abspath(__file__))
TODAY = datetime.date.fromisoformat(today_s)
raw = base64.b64decode(open(os.path.join(HERE, 'knowledge.enc')).read())
KN = json.loads(AESGCM(base64.urlsafe_b64decode(key)).decrypt(raw[:12], raw[12:], None))
K, EX = KN['clients'], KN['examples']
rows = json.load(open(crm_p))['values']; ix = {h: i for i, h in enumerate(rows[0])}
f = lambda r, k: r[ix[k]] if k in ix and ix[k] < len(r) else ''
def num(x):
    try: return int(float(str(x).replace(',', '')))
    except: return 0
cfg = json.load(open(cfg_p))['values']; CH = cfg[0]
C = {N(r[0]): dict(zip(CH, r + [''] * (len(CH) - len(r)))) for r in cfg[1:] if r and N(r[0])}
act = {s for s, c in C.items() if c.get('状態') in ('稼働中', '稼働前') and (c.get('契約状況（顧客情報）', '契約中') in ('', '契約中', '請求停止') or c.get('扱い（手動の例外）', '').startswith('稼働中として扱う'))}
YOMI = {s: c.get('継続ヨミ', '') for s, c in C.items()}
days = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0, 0])); renew = {}
for r in rows[1:]:
    if not r or N(r[0]) not in act: continue
    try: d = datetime.date.fromisoformat(f(r, '日付')[:10])
    except: continue
    v = days[N(r[0])][d]; v[0] += num(f(r, '架電数')); v[1] += num(f(r, 'ターゲット着電数')); v[2] += num(f(r, 'アポ獲得件数'))
    if N(f(r, '1年目の契約満了月')): renew[N(r[0])] = N(f(r, '1年目の契約満了月'))
for _s, _c in C.items():
    if _c.get('契約満了月（更新情報）'): renew[_s] = _c['契約満了月（更新情報）']
def span(s, a, b):
    t = [0, 0, 0]
    for d, v in days[s].items():
        if a <= d < b:
            for j in range(3): t[j] += v[j]
    return t
D = lambda n: TODAY - datetime.timedelta(days=n)
ev = json.load(open(ev_p)) if ev_p != '-' else []
nm = lambda s: K.get(s, {}).get('short') or C[s]['会社名']
def portal(s): return '../' + C[s].get('ポータルの場所', f'c/{s}/')
def list_hint(s):
    L = K.get(s, {}).get('list')
    if not L: return ''
    parts = ['・'.join(L['ind']), '・'.join(L['size']), '・'.join(L['pref'])]
    return '似た会社でアポが取れている条件：' + ' ／ '.join(p for p in parts if p) + (f'（似た会社のアポ率 {L["peer_rate"]*100:.1f}%）' if L.get('peer_rate') else '')
PLAN = {}
for dname in sorted({c['担当'] for c in C.values() if c.get('担当')}):
    mine = [s for s in act if C[s].get('担当') == dname]
    if not mine: continue
    A = collections.defaultdict(list)
    for s in mine:
        w4 = span(s, D(28), TODAY); p4 = span(s, D(56), D(28)); w1 = span(s, D(10), TODAY)
        if w4[0] >= 300 and w4[2] == 0: A['zero'].append((w4[0], s, w4))
        elif p4[0] >= 200 and w4[0] >= 200 and p4[2] and (w4[2] / w4[0]) < (p4[2] / p4[0]) * 0.5: A['drop'].append(((p4[2] / p4[0]) - (w4[2] / w4[0]), s, (p4, w4)))
        if C[s].get('状態') == '稼働中' and p4[0] > 0 and w1[0] == 0: A['stall'].append((p4[0], s, None))
        try:
            rd = datetime.date.fromisoformat(renew.get(s, '').replace('/', '-')[:10])
            if 0 <= (rd - TODAY).days <= 45: A['renew'].append((-(rd - TODAY).days, s, rd))
        except: pass
        u = [x for x in K.get(s, {}).get('ups', []) if x['reaction'] in ('前向き', '検討中') and x['date'] >= str(D(120))]
        if u: A['ups'].append((u[0]['date'], s, u[0]))
        m = K.get(s, {}).get('match')
        if m and m.get('mutual'): A['match'].append((1, s, m))
    for k in A: A[k].sort(key=lambda x: x[0], reverse=True)
    meets = sorted([e for e in ev if e.get('director') == dname], key=lambda e: e['time'])
    hm = lambda t: int(t.split(':')[0]) * 60 + int(t.split(':')[1]) if re.match(r'\d{1,2}:\d{2}', t) else 9999
    fmt = lambda m: f'{m // 60}:{m % 60:02d}'
    am = [e for e in meets if hm(e['time']) < 12 * 60 + 30]; pm = [e for e in meets if hm(e['time']) >= 12 * 60 + 30]
    items = [dict(t='9:00', m=10, who='人', title='朝のブリーフィングと、今日の定例資料に目を通す', do=f'AIが作った定例資料{len(meets)}件の「確認してほしいこと」だけ見る。' if meets else 'AIの指示を読み、今日の4つを確認する（定例なし）。', why='資料と数字はAIが前日に作成済み', link='')]
    first = (A['zero'] or A['drop'] or A['stall'] or [None])[0]
    items.append(dict(t='9:15', m=15, who='人', title='朝会で今日の打ち手を1つ宣言', do=(f'「{nm(first[1])}を今日立て直します」と宣言する。' if first else '「今日は◯◯様にアップセルを打診します」と宣言する。'), why='', link='../cs-internal/'))
    def meet_item(e, moved=False):
        s = e.get('sis'); talk = []
        if any(x[1] == s for x in A['renew']):
            rd = next(x[2] for x in A['renew'] if x[1] == s); talk.append(f'契約満了 {rd.month}/{rd.day}：最後の5分で成果のまとめと継続のご提案')
        u = next((x[2] for x in A['ups'] if x[1] == s), None)
        if u: talk.append(f'前回「{u["detail"]}」の話が{u["reaction"]}で止まっている → 今日その先を確認')
        if any(x[1] == s for x in A['zero'] + A['drop']): talk.append('数字が落ちている案件。資料の「ご提案」を一緒に決めて、次回までの目標を握る')
        kt = KT.get(s)
        if kt and kt['n'] < 4 and kt['ask']: talk.append(f'商材カルテが{kt["n"]}/5。最後に「{kt["ask"][0]}」を聞いてカルテに書く')
        return dict(t=e['time'], m=15, who='人', title=f'{e["name"]}様 定例（5/10/15分）', do='資料を画面共有して15分で終える。' + ('／'.join(talk) if talk else '最後に次回までの宿題を1つ決める。') + ('　※午後の予定です。次回から午前（10:00〜12:00）に寄せるよう、今日の定例でご相談を。' if moved else ''), why='定例資料：' + ('作成済み（ポータルの定例資料タブ）' if e.get('deck') else 'まだ（共有シートと日次報告で口頭説明）'), link=portal(s) if s in C else '')
    items += [meet_item(e) for e in am]
    tasks = []
    for _, s, w4 in A['zero'][:1]:
        tasks.append(dict(m=20, title=f'{nm(s)}：リストを変える', do=f'4週で{w4[0]:,}件架電してアポ0件。次のリストを決めて架電チームに渡す。' + (' ' + list_hint(s) if list_hint(s) else ''), why='同じリストを続けると、次の4週も0件になりやすい', link='../cs-internal/'))
    for _, s, (p4, w4) in A['drop'][:1]:
        tasks.append(dict(m=15, title=f'{nm(s)}：トークの冒頭を直す', do=f'アポ率が{p4[2]/p4[0]*100:.1f}%→{w4[2]/w4[0]*100:.1f}%に半減。共有シートのお断り理由を見て、最初の20秒を変える。', why='リストは同じでも、断られ方が変わっていれば冒頭で直せる', link=portal(s)))
    for _, s, u in A['ups'][:1]:
        if any(e.get('sis') == s for e in meets): continue
        ex = EX.get(u['offer'], '')
        tasks.append(dict(m=10, title=f'{nm(s)}：アップセルを打診', do=f'「{u["detail"]}」が{u["reaction"]}のまま（{u["date"]}）。メールか電話で次の一手を確認する。' + (f' 前向きに返った切り出し方の例：{ex}' if ex else ''), why='議事録から見つけた、話が途中の案件', link='../cs-internal/'))
    for _, s, rd in A['renew'][:1]:
        if any(e.get('sis') == s for e in meets): continue
        tasks.append(dict(m=10, title=f'{nm(s)}：継続のご提案を準備', do=f'契約満了 {rd.month}/{rd.day}（あと{(rd - TODAY).days}日・継続ヨミ {YOMI.get(s) or "未入力"}）。次の定例で、成果のまとめと次の3か月の打ち手を出せるようにする。', why='CSは運用営業。継続とアップセルはここで取る', link=portal(s)))
    for _, s, m in A['match'][:1]:
        od = C.get(m['sis'], {}).get('担当', '')
        tasks.append(dict(m=5, title=f'{nm(s)}様と{nm(m["sis"]) if m["sis"] in C else m["name"]}様の引き合わせを相談', do=f'どちらも相手の業種（{m["tag"]}）に電話しています。' + (f'相手の担当は{od}さん。' if od and od != dname else '') + '両社に紹介してよいか、まず片方に一言聞く。', why='お互いのお客様になりうる組み合わせ', link='../cs-internal/'))
    low = sorted([(KT[s]['n'], s) for s in mine if s in KT and KT[s]['n'] < 3 and not any(e.get('sis') == s for e in meets)])
    for n_, s in low[:1]:
        tasks.append(dict(m=5, title=f'{nm(s)}：商材カルテを埋める（{n_}/5）', do='次の定例かメールで聞くこと：' + '／'.join(KT[s]['ask'][:3]) + '。分かったら商材カルテのシートに書く。', why='商材（誰に・何を・いくらで）が細かいほど、AIの一言とリストの提案が当たる', link=''))
    for _, s, _ in A['stall'][:1]:
        tasks.append(dict(m=5, title=f'{nm(s)}：架電が止まっている理由を確認', do='10日間架電がありません。架電チームに状況を聞き、止めるなら定例でお客様に伝える。', why='止まっている期間はお客様の不満になりやすい', link='../cs-internal/'))
    # 午前の空き時間（9:30〜12:00）に、定例を避けて順に詰める
    taken = [(hm(e['time']), hm(e['time']) + 15) for e in am]
    cur = 9 * 60 + 30
    for t in tasks:
        while any(a0 < cur + t['m'] and cur < b0 for a0, b0 in taken): cur = max(b0 for a0, b0 in taken if a0 < cur + t['m'] and cur < b0)
        if cur + t['m'] > 12 * 60 + 15: break
        items.append(dict(t=fmt(cur), who='人', **t)); taken.append((cur, cur + t['m'])); cur += t['m']
    items.append(dict(t='12:20', m=0, who='AI', title='午前の定例のフォローが届く', do=f'決まったこと・次の一手・お礼メールの下書きが Slack に届く。' if am else '午前の定例はなし。', why='', link=''))
    items.append(dict(t='12:30', m=10 if am else 0, who='人', title='お礼メールを直して送り、今日の業務を終える', do='午後は空き時間。新しい商談・アップセルの商談・急ぎの対応にだけ使う。' + (f'（午後の定例{len(pm)}件は下に。次回から午前に寄せる）' if pm else ''), why='', link=''))
    items += [meet_item(e, True) for e in pm]
    items.sort(key=lambda x: hm(x['t']))
    human = sum(x.get('m', 0) for x in items if x['who'] == '人' and hm(x['t']) <= 12 * 60 + 30)
    head = []
    if meets: head.append(f'定例{len(meets)}件')
    if first: head.append(f'{nm(first[1])}の立て直し')
    if A['ups']: head.append(f'{nm(A["ups"][0][1])}へのアップセル打診')
    elif A['renew']: head.append(f'{nm(A["renew"][0][1])}の継続準備')
    PLAN[dname] = dict(karte_low=sum(1 for s in mine if s in KT and KT[s]['n'] < 3), n=len(mine), meets=len(meets), human=human, pm=len(pm), alerts={k: len(v) for k, v in A.items()}, lead=('今日は「' + '」「'.join(head) + '」に集中するのがいいと思います。') if head else '今日は大きな崩れはありません。アップセルと紹介に時間を使いましょう。', items=items)
tpl = open(os.path.join(HERE, 'dday_template.html')).read()
body = tpl.replace('/*PLAN*/{}', json.dumps(dict(date=f'{TODAY.month}/{TODAY.day}（{"月火水木金土日"[TODAY.weekday()]}）', plan=PLAN), ensure_ascii=False).replace('</', '<\\/'))
body = body.replace('/*ROAD*/{}', (open(road_p).read().strip() if road_p != '-' else '{}').replace('</', '<\\/'))
open(out_p, 'w').write(body)
print('wrote', out_p, {k: len(v['items']) for k, v in PLAN.items()})
