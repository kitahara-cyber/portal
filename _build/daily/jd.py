"""JD営業支援_アポ一覧（11K2kL-50gSeDtk8PTRUGJUfDsfoWu6GZNjyaYOeBZLI）から、会社ごとの「アポのその後」「CSタスク」「月額の変更」をまとめる。
使い方: python3 jd.py <v2_DH.json> <v2_RX.json> <CSタスク.json> <月額変更推移.json> <YYYY-MM-DD 今日> > jd.json
  v2_DH.json : 「JD営業支援_商談管理表一覧v2」!D1:H10500 を get_values した保存ファイル（SIS・アポ取得日・商談日・時間・会社名）
  v2_RX.json : 同じタブの R1:X10500（実施の有無・進捗ステータス・商談結果・次回アクション日・次回アクション内容・失注理由・商談結果）
  CSタスク.json : 「CSタスク_エクスポート」!A1:S1000
  月額変更推移.json : 「月額変更推移」!A1:H1000
"""
import json, sys, datetime, collections, re, unicodedata
N = lambda s: unicodedata.normalize('NFKC', str(s or '')).strip()
a, b, ct_p, fee_p, today_s = sys.argv[1:6]
TODAY = datetime.date.fromisoformat(today_s)
A = json.load(open(a))['values']; B = json.load(open(b))['values']
def d(s):
    m = re.match(r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})', N(s))
    try: return datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3))) if m else None
    except: return None
def outcome(r):
    t = ' '.join(N(x) for x in r[1:3] + r[6:7]) if r else ''
    jissi = N(r[0]) if r else ''
    if '受注' in t and not re.search(r'受注／失注|受注/失注', t) or re.search(r'^受注|受注決定|成約|契約', t): return '受注'
    if re.search(r'失注|NG|見送|お断り|ニーズ薄|不要', t): return '失注'
    if re.search(r'見込|検討|保留|見積|ヨミ|前向き|再提案|次回', t): return '見込み'
    if re.search(r'情報(提供|収集)|アーカイブ', t): return '情報収集'
    if re.search(r'未実施|リスケ|キャンセル|飛ばれ|不在', jissi + t): return '未実施・リスケ'
    if re.search(r'実施|済|有|OK|完了', jissi + t): return '実施（結果なし）'
    return ''
S = collections.defaultdict(lambda: dict(total=0, done=0, res=collections.Counter(), blank_past=0, upcoming=[], recent_win=[], y90=0))
for i in range(1, len(A)):
    ra = A[i] if i < len(A) else []; rb = B[i] if i < len(B) else []
    if not ra or not N(ra[0]).isdigit(): continue
    sis = N(ra[0]); md = d(ra[2] if len(ra) > 2 else ''); ad = d(ra[1] if len(ra) > 1 else '')
    if not (md or ad) or (md or ad).year < TODAY.year - 1: continue
    o = outcome(rb + [''] * (7 - len(rb)))
    x = S[sis]; x['total'] += 1
    if (md or ad) >= TODAY - datetime.timedelta(days=90): x['y90'] += 1
    if o: x['res'][o] += 1
    if o and o not in ('未実施・リスケ',): x['done'] += 1
    if md and md < TODAY and not o: x['blank_past'] += 1
    if md and TODAY <= md <= TODAY + datetime.timedelta(days=7): x['upcoming'].append([str(md), N(ra[3] if len(ra) > 3 else '')[:5], N(ra[4] if len(ra) > 4 else '')[:30]])
    if o == '受注' and md and md >= TODAY - datetime.timedelta(days=60): x['recent_win'].append([str(md), N(ra[4] if len(ra) > 4 else '')[:30]])
out = {}
for s, x in S.items():
    x['res'] = dict(x['res']); x['upcoming'].sort(); out[s] = dict(appts=x)
C = json.load(open(ct_p))['values']; H = C[0]; ix = {h: i for i, h in enumerate(H)}
g = lambda r, k: N(r[ix[k]]) if k in ix and ix[k] < len(r) else ''
for r in C[1:]:
    s = g(r, 'SIS')
    if not s or g(r, 'CSタスク進捗') == '完了': continue
    name = g(r, 'CSタスク進捗名') or g(r, 'タスク詳細_新規')
    if not name: continue
    due = d(g(r, 'CSタスク進捗期限'))
    out.setdefault(s, {}).setdefault('tasks', []).append(dict(task=name[:60], detail=g(r, 'タスク詳細_新規')[:80], due=str(due) if due else '', ball=g(r, 'タスクのボールは誰が持っているか_新規')[:20], by=g(r, '対応者_新規'), url=g(r, 'レコードURL')))
F = json.load(open(fee_p))['values']; H = F[0]; ix = {h: i for i, h in enumerate(H)}
for r in F[1:]:
    s = g(r, 'SIS'); dt = d(g(r, '月額費用変更日'))
    if not s or not dt or dt < TODAY - datetime.timedelta(days=120): continue
    out.setdefault(s, {}).setdefault('fee', []).append(dict(date=str(dt), kind=g(r, '月額費用変更種別'), before=g(r, '変更前金額'), after=g(r, '変更後金額')))
print(json.dumps(out, ensure_ascii=False))
