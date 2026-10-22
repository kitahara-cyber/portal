"""定例資料の数字を計算する。
使い方: python3 calc.py spec.json > data.json
spec.json の例:
{"sis":"5473","name":"スクエアプランニング株式会社","meeting":"2026-10-23","prev":"",
 "crm":"raw/crm.json",                      # 週次報告メール用!集計 D:S を get_values した保存ファイル
 "tabs":[{"name":"営業リスト","files":["raw/5473/a_call.json","raw/5473/a_attr.json"]}]}  # 同じ行範囲で列だけ分けて取ったファイル
各 files は values[0] が見出し行。行の順番で横につなぐ。
"""
import json, sys, re, collections, datetime, unicodedata
N = lambda s: unicodedata.normalize('NFKC', str(s or '')).replace('​', '').strip()
spec = json.load(open(sys.argv[1]))
SIS = spec['sis']; MEET = datetime.date.fromisoformat(spec['meeting'])
YEAR = MEET.year

# ---------- 日次報告（CRM） ----------
crm = json.load(open(spec['crm']))['values']; H = crm[0]
ix = {h: i for i, h in enumerate(H)}
def f(r, k):
    i = ix.get(k); return r[i] if i is not None and i < len(r) else ''
def num(x):
    try: return int(float(str(x).replace(',', '')))
    except: return 0
days = collections.defaultdict(lambda: [0, 0, 0, 0, 0])
for r in crm[1:]:
    if not r or N(r[0]) != SIS: continue
    try: d = datetime.date.fromisoformat(f(r, '日付')[:10])
    except: continue
    v = days[d]
    for j, k in enumerate(['架電数', '通電数', 'ターゲット着電数', 'リード数', 'アポ獲得件数']): v[j] += num(f(r, k))
D = sorted(days)
def tot(ds): return [sum(days[d][j] for d in ds) for j in range(5)]
prev = datetime.date.fromisoformat(spec['prev']) if spec.get('prev') else MEET - datetime.timedelta(days=30)
since = [d for d in D if prev <= d < MEET]
months = collections.OrderedDict()
for d in D:
    k = f'{d.year}-{d.month:02d}'; months.setdefault(k, [0] * 5)
    for j in range(5): months[k][j] += days[d][j]
crm_out = dict(first=str(D[0]) if D else '', last=str(D[-1]) if D else '', total=tot(D), since=tot(since), since_from=str(prev),
               work_days_since=len(since), months=[[k, *v] for k, v in list(months.items())[-6:]],
               recent_days=[[str(d), *days[d]] for d in D[-12:]])

# ---------- 共有シート（営業リスト） ----------
APO = ('初回アポ', 'アポ獲得', 'アポ確定'); NOCONN = ('不通', '番号不備', '使われて', '架電禁止', '対象外')
def cat(st):
    s = N(st)
    if not s: return None
    if any(k in s for k in APO) and 'NG' not in s: return 'アポ'
    if '資料送付' in s: return '資料送付'
    if '担当' in s and 'NG' in s: return '担当者NG'
    if '受付' in s and 'NG' in s or '代表NG' in s: return '受付NG'
    if '不在' in s: return '不在'
    if '再' in s and '架電' in s: return '再度架電'
    if any(k in s for k in NOCONN): return '不通・番号不備'
    return 'その他'
REACH = {'担当者NG', '資料送付', 'アポ'}
MEMO_HEAD = re.compile(r'^\s*(\d{1,2})\s*/\s*(\d{1,2})\s*(?:(\d{1,2})\s*(?:時|:\d{2}))?\s*([^\s\d]{1,6})?\s*')
NG_RULES = [('営業のお電話を一律でお断り', r'営業(電話)?(は)?お断り|新規営業|新規(は)?NG|新規(で)?(の)?(お)?取引|ご?新規は?お断り|一律|セールス|営業電話|営業NG|営業禁止|取次(ぎ)?(不可|できない)|取り?次(ぎ)?でき|お取次ぎできない|断るよう|アポが無い|繋げない|つなげない'),
            ('留守電・ガイダンス（つながらず）', r'ガイダンス|留守電|自動音声'),
            ('費用・有料が合わない', r'有料|費用|予算|高い|コスト'),
            ('フォーム・メールでの連絡を指定', r'フォーム|問い?合わせ|メール|HPから|サイトから|ホームページ'),
            ('必要ない・間に合っている', r'募集(して)?(い)?ない|採用(して)?(い)?ない|募集は?しない|採用予定|必要(が)?あれば|必要なら|折り返す|不要|必要(が)?ない|間に合|充足|足りて|予定(は)?ない|検討(して)?(い)?ない|結構|いらない|興味(が)?ない'),
            ('他社・自社ですでに対応', r'業者を?通し|付き合いがある|決まったところ|別に(い|居)る|既存(先|の取引)|紹介会社(は)?使わない|ハローワーク|他社|取引(先)?が?ある|既に|すでに|提携|自社で|内製|契約して'),
            ('本部・別部署が決める', r'本部|本社|グループ|別の?部署|担当部署|決裁|管轄'),
            ('時期・タイミングが合わない', r'時期|今は|来期|来年|忙し|落ち着|タイミング|繁忙'),
            ('担当者がいない・不明', r'担当(者)?(が)?(い|居)ない|担当不明|わからない|分からない')]
def ng_reason(memo):
    t = MEMO_HEAD.sub('', N(memo).split('\n')[0])
    t = re.sub(r'^\s*(\([^)]{1,3}\))?\s*(\d{1,2}\s*(時|:\d{2})\s*)?', '', t)
    if len(t) < 2: return '理由を伺えないまま／記録なし'
    for k, rx in NG_RULES:
        if re.search(rx, t): return k
    return 'その他'
def memo_date(memo):
    m = MEMO_HEAD.match(N(memo))
    if not m: return None
    mo, dd = int(m.group(1)), int(m.group(2))
    y = YEAR if mo <= MEET.month else YEAR - 1
    try: return datetime.date(y, mo, dd)
    except: return None
def size_b(v):
    s = N(v); m = re.search(r'(\d+)', s.replace(',', ''))
    if not m: return '(不明)'
    n = int(m.group(1))
    return '1〜29名' if n < 30 else '30〜99名' if n < 100 else '100〜299名' if n < 300 else '300名以上'
PREF = re.compile(r'(北海道|東京都|京都府|大阪府|.{2,3}県)')
co = []; ev = []
for t in spec['tabs']:
    parts = [json.load(open(p))['values'] for p in t['files']]
    hdr = [];
    for p in parts: hdr += [N(h) for h in p[0]] + [''] * 0
    widths = [len(p[0]) for p in parts]
    n = max(len(p) for p in parts)
    def rowcat(i):
        out = []
        for p, w in zip(parts, widths):
            r = p[i] if i < len(p) else []
            out += [r[j] if j < len(r) else '' for j in range(w)]
        return out
    def col(*keys, ex=()):
        for k in keys:
            for i, h in enumerate(hdr):
                if (h == k or k in h) and not any(e in h for e in ex): return i
        return None
    HC = [i for i, h in enumerate(hdr) if h.startswith('架電履歴')]
    MC = []
    for i in HC:
        j = i + 1
        MC.append(j if j < len(hdr) and (hdr[j].startswith('架電メモ') or hdr[j] == '') else None)
    nm = col('企業名', '会社名', '法人名', '組織名', ex=('メモ',)); sg = col('セグメント', 'リスト種別')
    ad = col('住所', '所在地'); sz = col('被保険者数', '従業員数'); ind = col('東証業種', '業種', ex=('NG',))
    g = lambda r, i: N(r[i]) if i is not None and i < len(r) else ''
    for i in range(1, n):
        r = rowcat(i); name = g(r, nm)
        if not name: continue
        best = None; rank = ['不通・番号不備', 'その他', '不在', '再度架電', '受付NG', '担当者NG', '資料送付', 'アポ']
        for hc, mc in zip(HC, MC):
            c = cat(g(r, hc))
            if not c: continue
            memo = g(r, mc) if mc is not None else ''
            dt = memo_date(memo)
            ev.append(dict(c=c, d=str(dt) if dt else '', ng=ng_reason(memo) if c in ('受付NG', '担当者NG') else ''))
            if best is None or rank.index(c) > rank.index(best): best = c
        pm = PREF.search(g(r, ad))
        co.append(dict(tab=t['name'], seg=(g(r, sg) or '(セグメントなし)')[:24], size=size_b(g(r, sz)) if sz is not None else '(不明)',
                       pref=pm.group(1) if pm else '(不明)', ind=re.split(r'[,，、/\n]', g(r, ind))[0][:14] if ind is not None else '', best=best))
# 期間（前回定例〜）の架電結果。日付のないメモは期間外として扱う
per = [e for e in ev if e['d'] and str(prev) <= e['d'] < str(MEET)]
use = per if len(per) >= 30 else [e for e in ev if e['d'] and e['d'] >= str(MEET - datetime.timedelta(days=60))] or ev
res = collections.Counter(e['c'] for e in use)
ng = collections.Counter(e['ng'] for e in use if e['ng'])
ng_r = collections.Counter(e['ng'] for e in use if e['c'] == '受付NG' and e['ng']); ng_t = collections.Counter(e['ng'] for e in use if e['c'] == '担当者NG' and e['ng'])
def table(key, minn=20):
    g = collections.defaultdict(lambda: [0, 0, 0, 0])
    for c in co:
        v = g[c[key]]; v[0] += 1
        if c['best']: v[1] += 1; v[2] += c['best'] in REACH; v[3] += c['best'] == 'アポ'
    rows = [dict(k=k, rows=v[0], called=v[1], reach=v[2], apo=v[3], reach_rate=round(v[2] / v[1], 4) if v[1] else 0, apo_rate=round(v[3] / v[1], 4) if v[1] else 0, left=v[0] - v[1]) for k, v in g.items()]
    return sorted([r for r in rows if r['called'] >= minn or r['left'] >= 50], key=lambda r: -r['called'])[:10]
first_ev = min((e['d'] for e in ev if e['d']), default=''); last_ev = max((e['d'] for e in ev if e['d']), default='')
out = dict(sis=SIS, name=spec['name'], meeting=str(MEET), period_from=str(prev), crm=crm_out,
           list=dict(companies=len(co), called=sum(1 for c in co if c['best']), left=sum(1 for c in co if not c['best']),
                     events=len(ev), events_period=len(use), period_basis='前回定例から' if use is per else '直近60日',
                     first=first_ev, last=last_ev, results=res.most_common(), ng=ng.most_common(), ng_gate=ng_r.most_common(), ng_talk=ng_t.most_common(),
                     seg=table('seg'), size=table('size', 10), pref=table('pref', 15), tabs=collections.Counter(c['tab'] for c in co).most_common()))
print(json.dumps(out, ensure_ascii=False, indent=1))
