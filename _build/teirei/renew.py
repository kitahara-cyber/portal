"""継続提案資料（契約満了の前月・満了月の定例用）を作る。定例資料と同じ「1章＝1画面」の形。
使い方: python3 renew.py data.json facts.json story.json out.html [--director 林] [--avatar avatar.txt]
  data.json  … calc.py の出力（spec の prev を「契約開始日」にして、契約期間まるごとで計算したもの）
  facts.json … {"start":"2025-12-01","end":"2026-11-30","fee":150000,"init":500000,"status":"契約中",
                "measures":"テレアポ","appts":{キントーンJDの appts},"price":0,"price_note":"",
                "meeting":"2026-11-12","stage":"2か月前"|"満了月"}
  story.json … AIが書く文章（下の KEYS。どれも省略可。省略した欄は「担当が記入」と出る）
章：表紙 → 1 振り返り → 2 実績（定量） → 3 実績（定性） → 4 課題と学び → 5 次期の目標 → 6 次期の施策 → 7 運用とスケジュール → 8 料金・契約条件
料金・割引・特典は AI が決めない。story.json の plan が空なら「担当が記入」の欄にする（資料は下書き扱い）。"""
import json, html, datetime, argparse, re, os, calendar
ap = argparse.ArgumentParser(); ap.add_argument('data'); ap.add_argument('facts'); ap.add_argument('story'); ap.add_argument('out')
ap.add_argument('--director', default=''); ap.add_argument('--avatar', default=''); ap.add_argument('--sis', default=''); ap.add_argument('--no-edit', action='store_true')
a = ap.parse_args()
D = json.load(open(a.data)); F = json.load(open(a.facts)); S = json.load(open(a.story)) if a.story != '-' else {}
E = lambda s: html.escape(str(s))
def pct(x, d=1): return f'{x*100:.{d}f}%' if x is not None else '—'
def ym(s): d = datetime.date.fromisoformat(s[:10]); return f'{d.year}年{d.month}月'
def yen(v): return '—' if not v else (f'{v/1e8:.1f}億円' if v >= 1e8 else f'{round(v/1e4):,}万円')
TODO = lambda t='担当が記入': f'<span class="todo">【{E(t)}】</span>'
name = D['name']; short = re.sub(r'(株式会社|有限会社|合同会社)', '', name).strip()
meet = datetime.date.fromisoformat(F.get('meeting') or D['meeting'])
C = D['crm']; L = D['list']
start = datetime.date.fromisoformat(F['start'][:10]) if F.get('start') else datetime.date.fromisoformat(C['first'])
end = datetime.date.fromisoformat(F['end'][:10])
while end < meet.replace(day=1):  # 満了月が過ぎている（自動更新）ときは、1年ずつ先へ
    end = end.replace(year=end.year + 1) if not (end.month == 2 and end.day == 29) else end.replace(year=end.year + 1, day=28)
_ps = end.replace(year=end.year - 1) + datetime.timedelta(days=1)
if _ps > start: start = _ps  # 今期＝満了日までの1年（契約開始がそれより後なら開始から）
# ---------- 数字 ----------
MA = [m for m in (C.get('months_all') or C['months']) if m[0] >= f'{start.year}-{start.month:02d}']
calls = sum(m[1] for m in MA); conn = sum(m[2] for m in MA); talk = sum(m[3] for m in MA); lead = sum(m[4] for m in MA); apo = sum(m[5] for m in MA)
A = F.get('appts') or {}; R = A.get('res') or {}; AL = F.get('appts_label') or '累計'
meet_n = A.get('done', 0); won = R.get('受注', 0); apo_tbl = A.get('total', 0)
meet_rate = meet_n / apo_tbl if apo_tbl else None
win_rate = won / meet_n if meet_n else None
price = F.get('price') or 0
qs = []  # 3か月ごと
for i in range(0, len(MA), 3):
    g = MA[i:i + 3]; qs.append([f'{int(g[0][0][5:])}月〜{int(g[-1][0][5:])}月', sum(x[1] for x in g), sum(x[3] for x in g), sum(x[5] for x in g)])
last3 = MA[-3:] if len(MA) >= 3 else MA
cpm = sum(m[1] for m in last3) / max(1, len(last3))
rate_now = sum(m[5] for m in last3) / max(1, sum(m[1] for m in last3))
best_q = max((q for q in qs if q[1] >= 300), key=lambda q: q[3] / q[1], default=None)
rate_best = best_q[3] / best_q[1] if best_q else rate_now
NEXT_M = int(S.get('next_months') or 12)
mr = meet_rate if meet_rate is not None else 0.27
wr = win_rate if (win_rate is not None and meet_n >= 20) else 0.13
keep = dict(apo=cpm * NEXT_M * rate_now); keep['meet'] = keep['apo'] * mr; keep['won'] = keep['meet'] * wr
goal = dict(apo=cpm * NEXT_M * max(rate_now, rate_best)); goal['meet'] = goal['apo'] * max(mr, 0.27); goal['won'] = goal['meet'] * max(wr, 0.13)
for k, v in (S.get('targets') or {}).items(): goal[k] = v  # 担当・AIが目標を直したとき
fee = F.get('fee') or 0; cost_next = fee * NEXT_M
# ---------- 部品（定例資料と同じ見た目） ----------
SRC = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'deck.py')).read()
CSS = re.search(r"CSS = r'''(.*?)'''", SRC, re.S).group(1)
JS = re.search(r"JS = r'''(.*?)'''", SRC, re.S).group(1)
CSS += '''
.nx-why{margin:4px 0 24px;font-size:16px;color:var(--mute);max-width:40em}
.nx-flow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr) minmax(0,1fr);align-items:center;gap:18px}
.nx-nd{border:1px solid var(--line);border-radius:18px;padding:20px 22px;background:var(--card)}.nx-nd span{display:block;font-size:13px;color:var(--mute)}
.nx-nd b{display:block;font-size:clamp(46px,6.4vw,84px);font-weight:900;line-height:1.05;letter-spacing:-.02em;color:var(--ink)}.nx-nd b small{font-size:.32em;font-weight:700;margin-left:4px;letter-spacing:0}
.nx-nd.g{border:2px solid var(--accent);background:var(--accent-soft)}.nx-nd.g b{color:var(--accent-ink)}
.nx-ar{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}.nx-op{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}.nx-op span{font-size:13.5px;font-weight:700;background:var(--ink);color:var(--bg);border-radius:999px;padding:6px 14px}.nx-op em{font-style:normal;margin-right:4px}
.nx-ln{display:block;width:100%;height:2px;background:var(--accent);position:relative}.nx-ln::after{content:"";position:absolute;right:-2px;top:-6px;border:7px solid transparent;border-left-color:var(--accent);border-right:0}
.nx-ar>b{font-size:18px;color:var(--accent-ink)}
@media (max-width:760px){.nx-flow{grid-template-columns:minmax(0,1fr)}.nx-ln{width:2px;height:28px}.nx-ln::after{right:-6px;top:auto;bottom:-6px;border:7px solid transparent;border-top-color:var(--accent);border-bottom:0}}
.nx-cmp{margin-top:24px;max-width:560px}.nx-cmp p{margin:0 0 8px;font-size:13px;color:var(--mute)}.nx-cr{display:grid;grid-template-columns:80px minmax(0,1fr) 92px;gap:12px;align-items:center;margin:6px 0;font-size:14px}
.nx-cr i{height:10px;border-radius:5px;background:var(--line2);overflow:hidden}.nx-cr s{display:block;height:100%;background:var(--mute);border-radius:5px}.nx-cr.g s{background:var(--accent)}.nx-cr b{text-align:right}.nx-cr.g b{color:var(--accent-ink)}
.nx-note{margin:14px 0 0;font-size:12px;color:var(--mute)}
.nx-cta{margin-top:24px;display:inline-flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline;background:var(--accent);color:#fff;border-radius:999px;padding:12px 24px}.nx-cta b{font-size:16px}.nx-cta span{font-size:13.5px;font-weight:700}
.nx-more{margin-top:22px}.nx-more>summary{cursor:pointer;font-size:13.5px;color:var(--mute);list-style:none}.nx-more>summary::-webkit-details-marker{display:none}.nx-more>summary::before{content:"＋ "}.nx-more[open]>summary::before{content:"− "}.nx-more .om{margin-top:12px}
.fx{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:14px}@media (max-width:860px){.fx{grid-template-columns:minmax(0,1fr)}}
.fx-main,.fx-c{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:20px 22px;min-width:0}.fx-side{display:grid;gap:14px}.fx-k{margin:0 0 14px;font-size:13px;font-weight:700;color:var(--mute)}
.fc{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;align-items:end;height:230px}
.fc li{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:8px;min-width:0}.fc b{font-size:22px;font-weight:900;line-height:1}.fc b small{font-size:11px;margin-left:1px}
.fc i{display:block;width:100%;max-width:64px;border-radius:10px 10px 4px 4px;background:var(--accent)}.fc li:first-child i{background:var(--ink)}
#flex .fx-main,#flex .fx-c{border-radius:18px}.fc li:last-child i{background:var(--line)}
.fc span{font-size:12px;color:var(--mute);text-align:center;line-height:1.4;min-height:2.8em}
.fx-s{margin:12px 0 0;font-size:13px;color:var(--mute)}
.fx-dl{display:grid;grid-template-columns:1fr auto;gap:8px 12px;margin:0;font-size:14px}.fx-dl dd{margin:0;font-weight:900}
.fx-eq{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0}.fx-eq span{background:var(--line2);border-radius:8px;padding:5px 10px;font-size:13px;font-weight:700}.fx-eq i{font-style:normal;font-weight:900}.fx-big{margin:10px 0 0;font-size:26px;font-weight:900}
.fx-band{margin-top:14px;border-radius:18px;background:var(--ink);color:var(--bg);padding:18px 22px;display:flex;flex-wrap:wrap;gap:6px 16px;align-items:baseline}.fx-band b{font-size:20px}.fx-band span{font-size:14px;opacity:.85}
'''
CSS += '''.hk{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px 24px;align-items:center;margin:0 0 16px}.hk-n b{display:block;font-size:clamp(40px,6vw,64px);font-weight:900;line-height:1.05;color:var(--accent-ink)}.hk-n span{font-size:13px;color:var(--mute)}.hk-w{margin:0 0 18px;font-size:15.5px;line-height:1.9;max-width:44em}
@media (max-width:640px){.hk{grid-template-columns:minmax(0,1fr)}}
.es{margin-top:4px}.es-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr));gap:10px}.es-c{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:2px}.es-c span{font-size:12.5px;color:var(--mute)}.es-c b{font-size:26px;font-weight:900;line-height:1.25}.es-c small{font-size:12px;color:var(--mute)}
.es-c:nth-child(2) b{color:var(--accent-ink)}
.cta{margin-top:16px;border:2px solid var(--accent);border-radius:16px;padding:16px 20px;background:var(--accent-soft)}.cta{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline}.cta b{font-size:16px}.cta span{font-size:14px;font-weight:700;color:var(--accent-ink)}.cta p{margin:6px 0 0;font-size:13.5px}
.pk{background:var(--ink);color:var(--bg);border-radius:18px;padding:22px 24px;margin:4px 0 18px}
.pk-k{margin:0 0 12px;font-size:13px;font-weight:700;opacity:.75}
.pk-row{display:flex;align-items:stretch;gap:12px;flex-wrap:wrap}.pk-t{flex:1 1 220px;min-width:0;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:6px}
.pk-n{font-size:28px;font-weight:900;line-height:1;color:var(--accent-soft)}.pk-t b{font-size:18px;line-height:1.4}.pk-t p{margin:0;font-size:13px;line-height:1.7;opacity:.85}.pk-y{margin-top:auto;padding-top:8px;font-size:15px;font-weight:900;color:var(--accent-soft)}
.pk-plus{font-style:normal;align-self:center;font-size:22px;font-weight:900;opacity:.6}.pk-why{margin:14px 0 0;font-size:14px;line-height:1.8;border-top:1px solid rgba(255,255,255,.18);padding-top:12px}
.om{border:1px solid var(--line);border-radius:14px;background:var(--card);overflow:hidden}.om-h{display:grid;grid-template-columns:1fr 1fr;font-size:12.5px;font-weight:700;color:var(--mute);padding:10px 16px;border-bottom:1px solid var(--line)}
.om ol{list-style:none;margin:0;padding:0}.om li{display:grid;grid-template-columns:minmax(0,1fr) 36px minmax(0,1fr);align-items:center;padding:10px 16px;border-bottom:1px solid var(--line2);font-size:14px;color:var(--mute)}.om li:last-child{border-bottom:0}
.om-a{height:2px;background:var(--line);position:relative}.om-a::after{content:"";position:absolute;right:-1px;top:-4px;border:5px solid transparent;border-left-color:var(--line)}
.om-s b{margin-right:4px}.om li.on{background:var(--accent-soft);color:var(--ink);font-weight:700}.om li.on .om-a{background:var(--accent)}.om li.on .om-a::after{border-left-color:var(--accent)}
@media (max-width:640px){.om-h{display:none}.om li{grid-template-columns:minmax(0,1fr);gap:4px}.om-a{display:none}.om-s::before{content:"→ "}}
.ol{border-top:1px solid var(--line)}.ol-r{border-bottom:1px solid var(--line)}.ol-r>summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:10px;align-items:baseline;padding:12px 4px}.ol-r>summary::-webkit-details-marker{display:none}
.ol-n{font-weight:900;color:var(--mute)}.ol-r b{font-size:15px}.ol-y{font-size:13.5px;font-weight:700;color:var(--ink);text-align:right}.ol-r.on .ol-n{color:var(--accent-ink)}.ol-r.on b::after{content:"おすすめ";margin-left:8px;font-size:11px;color:#fff;background:var(--accent);border-radius:999px;padding:1px 8px;vertical-align:2px}
.ol-b{padding:0 4px 14px 42px;font-size:13.5px}.ol-b p{margin:0 0 6px}
@media (max-width:640px){.ol-r>summary{grid-template-columns:24px minmax(0,1fr)}.ol-y{grid-column:2;text-align:left;color:var(--mute)}.ol-b{padding-left:34px}}
'''
CSS += '''.todo{display:inline-block;background:#fff3c4;color:#7a5600;border:1px dashed #c9a227;border-radius:6px;padding:1px 8px;font-weight:700;font-size:.92em}
.draft{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:60;background:#7a5600;color:#fff;font-weight:700;font-size:12.5px;border-radius:999px;padding:4px 14px}
.ld3{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:12px}.tl{list-style:none;margin:0;padding:0;display:grid;gap:10px}.tl li{display:grid;grid-template-columns:7.5em 1fr;gap:12px;align-items:baseline}.tl b{font-family:var(--mono,monospace)}
.chips{display:flex;flex-wrap:wrap;gap:6px}.chips span{border:1px solid var(--line);border-radius:999px;padding:3px 12px;font-size:13.5px}'''
def bars(items, fmt=lambda v: f'{v:,}', hi=None):
    mx = max([v for _, v in items] + [1])
    return '<div class="bars">' + ''.join(f'<div class="br{" hi" if k == hi else ""}"><span class="bl">{E(k)}</span><span class="bt"><i style="width:{v/mx*100:.1f}%"></i></span><span class="bv">{fmt(v)}</span></div>' for k, v in items) + '</div>'
def stat(lbl, v, sub=''): return f'<div class="st"><span class="sl">{E(lbl)}</span><b>{v}</b>{f"<small>{sub}</small>" if sub else ""}</div>'
def card(t, num, body): return f'<details class="panel card"><summary><h3>{t}</h3>{f"<span class=num>{num}</span>" if num else ""}</summary><div class="body">{body}</div></details>'
def tbl(rows, cols):
    return '<div class="tw"><table><thead><tr>' + ''.join(f'<th{" class=r" if r else ""}>{E(h)}</th>' for h, _, r in cols) + '</tr></thead><tbody>' + ''.join(
        '<tr>' + ''.join(f'<td{" class=r" if r else ""}>{f(x)}</td>' for _, f, r in cols) + '</tr>' for x in rows) + '</tbody></table></div>'
def sec(id, no, lab, title, body, sub=''):
    return f'<section class="slide" id="{id}" data-title="{E(lab)}"><div class="inner"><div class="sh"><span class="no">{no} ／ {id.upper()}</span><h2>{title}</h2>{f"<p>{sub}</p>" if sub else ""}</div>{body}</div></section>'
def ul(xs, empty=''): return '<ul>' + ''.join(f'<li>{x}</li>' for x in xs) + '</ul>' if xs else (f'<p class="tip">{empty}</p>' if empty else '')
# ---------- 自動で埋める（story.json に無い欄を、データから作る。11/4） ----------
AUTO = set()
seg = [x for x in L['seg'] if x['called'] >= 20]; best = max(seg, key=lambda x: (x['apo_rate'], x['reach_rate'])) if seg else None
def fill(k, v):
    if not S.get(k) and v: S[k] = v; AUTO.add(k)
th = F.get('themes') or []
fill('voices', {'interest': [f'「{k}」（{n}件）' for k, n in th[:5]] or [h for h in (F.get('hooks') or [])[:4]]})
fill('talks', [dict(line=m['line'], why=m.get('why', '')) for m in (F.get('magic') or [])[:3]])
fb = []
if apo_tbl: fb.append(f'商談アポ管理表のアポ{apo_tbl}件のうち、商談の実施は{meet_n}件（{pct(meet_rate, 0)}）。')
rs = [(k, v) for k, v in R.items() if v and k != '受注']
if rs: fb.append('商談の結果は ' + '・'.join(f'{k}{v}件' for k, v in sorted(rs, key=lambda x: -x[1])[:4]) + (f'、受注{won}件' if won else '') + '。')
if A.get('blank_past'): fb.append(f'商談日が過ぎて結果が未記入のものが{A["blank_past"]}件あります。記入が進むと、アポの質を正しく評価できます。')
if A.get('y90') is not None and A.get('y90'): fb.append(f'直近90日の見込み（ヨミ）は{A["y90"]}件です。')
fill('field', fb)
gp = []
if best_q and qs:
    low = min((q for q in qs if q[1] >= 300), key=lambda q: q[3] / q[1], default=None)
    if low and low[0] != best_q[0]: gp.append(dict(t=f'{low[0]}のアポ率が{pct(low[3]/low[1], 2)}に下がった', why=f'いちばん良かった{best_q[0]}（{pct(best_q[3]/best_q[1], 2)}）と比べて低く、リストかトークが合っていなかった可能性があります'))
res = dict(L['results']); rt = sum(res.values()) or 0
if rt and res.get('受付NG', 0) / rt >= .25: gp.append(dict(t=f'受付でのお断りが架電の{pct(res["受付NG"]/rt, 0)}', why='ご担当者に届く前に止まっている電話が多い'))
ng1 = next((k for k, _ in L['ng'] if k not in ('その他', '理由を伺えないまま／記録なし')), '')
if ng1: gp.append(dict(t=f'お断りの理由でいちばん多いのは「{ng1}」', why='冒頭のひと言と切り返しで減らせる余地があります'))
if meet_rate is not None and meet_rate < .27: gp.append(dict(t=f'アポから商談になる割合が{pct(meet_rate, 0)}', why='ご支援先全体の平均（27%）より低く、リスケ・キャンセルが多い'))
fill('gaps', gp[:3])
imp = F.get('improve') or []
fill('done', [dict(t=f'{x.get("what","")}：{x.get("detail","")}', effect=(f'{x.get("before","")} → {x.get("after","")}' if x.get('after') else '効果は確認中')) for x in imp][:6])
fill('history', [dict(d=str(x.get('d', ''))[:7], t=f'{x.get("what","")}：{x.get("detail","")}') for x in imp][:8])
pr = {}
tg = []
if best: tg.append(f'反応の良かった「{best["k"][:18]}」の残り{best["left"]:,}社から先に電話する')
cond = F.get('list_cond') or {}
if cond.get('ind1'): tg.append('新しい層：似た商材の会社で成果が出た業種（' + '・'.join(cond['ind1'][:3]) + '）、規模（' + '・'.join(cond.get('size', [])[:2]) + '）')
if R.get('失注') or R.get('見込み'): tg.append(f'見込み・失注になった先（{R.get("見込み", 0) + R.get("失注", 0)}件）に、時期を変えてもう一度ご案内する')
pr['target'] = tg
tk = [f'「{m["line"]}」を冒頭のひと言に使う' for m in (F.get('magic') or [])[:2]]
if ng1: tk.append(f'「{ng1}」と言われたときの切り返しを用意し、全員で統一する')
pr['talk'] = tk
cb = []
if lead >= 20: cb.append(f'資料送付先（今期{lead}件）へのメールフォローを組み合わせ、資料からの商談化を増やす')
if rt and res.get('受付NG', 0) / rt >= .25: cb.append('受付で止まる先には、フォーム営業で決裁者に直接届ける')
cb.append('アポ先の関心が高いテーマで共催ウェビナーを開き、電話で届かない層を集める')
pr['combo'] = cb
pr['team'] = [f'稼働量：月{cpm:,.0f}件の架電を続け、反応の良い層に寄せる' + ('（残りリストが多いため、増量も可能）' if L.get('left', 0) > cpm * 6 else ''), '報告：毎週の数字はポータルで自動更新、月1回の定例で着地と打ち手を確認']
for k, v in pr.items():
    if not (S.get('proposals') or {}).get(k) and v: S.setdefault('proposals', {})[k] = v; AUTO.add('proposals')
RU = F.get('rules') or {}
PI = {k: v for k, v in (F.get('plan_input') or {}).items() if str(v).strip()}  # 記録シート「継続条件」タブに担当が書いた内容
S['plan'] = dict(S.get('plan') or {}); S['plan'].update({k: PI[k] for k in ('name', 'price', 'discount', 'term', 'renew') if k in PI})
for k in ('discount', 'term', 'renew'):
    if RU.get(k): S['plan'].setdefault(k, RU[k])
if PI.get('unit_price'):
    try: price = int(float(str(PI['unit_price']).replace(',', '').replace('円', '')))
    except Exception: pass
SUG = dict(name='継続プラン（今期と同じ内容で継続）', price=(f'月額{fee:,}円（税抜・今期と同額）' if fee else ''), term='12か月', discount='（会社の継続割引・長期特典があれば）', renew='（更新の条件）')
P = S.get('proposals') or {}
plan = S.get('plan') or {}
PL = S.get('plan') or {}
MISSING = [k for k in ('name', 'price', 'discount', 'term', 'renew') if not PL.get(k)] + ([] if price else ['unit_price'])
draft = False
# ---------- 章 ----------
sl = []
sl.append(f'''<section class="slide cover" id="cover"><div class="inner">
<span class="eyebrow">CONTRACT RENEWAL PROPOSAL — {meet:%Y.%m.%d}</span><span class="client">{E(name)} 様　アウトバウンドコール支援</span>
<h1>これまでの成果と、<br><span>次の1年のご提案</span></h1>
<div class="meta"><span>今期<b>{ym(str(start))}〜{ym(str(end))}</b></span><span>実績<b>架電{calls:,}件・アポ{apo}件</b></span><span>作成<b>{datetime.date.today():%Y年%-m月%-d日}　株式会社ライトアップ</b></span></div>
<a class="start" href="#review">見る ↓</a><span class="hint">↓キー・スペースで次の章へ。右下のボタンで全画面にできます。</span></div></section>''')
hl = [stat('架電', f'{calls:,}'), stat('ご担当者と会話', f'{talk:,}', pct(talk / calls) if calls else ''), stat('アポ', f'{apo:,}', f'アポ率 {pct(apo / calls, 2)}' if calls else ''),
      stat('商談', f'{meet_n:,}' if apo_tbl else '—', f'商談化率 {pct(meet_rate, 0)}（管理表の{AL}）' if meet_rate is not None else '記録待ち'), stat('受注', f'{won:,}' if apo_tbl else '—', f'受注率 {pct(win_rate, 0)}（管理表の{AL}）' if win_rate is not None else '')]
sl.append(sec('review', '01', '振り返り', S.get('summary') or f'{ym(str(start))}からの{len(MA)}か月で、<em class="hl">アポ{apo}件</em>' + (f'。受注は累計{won}件' if won else ''),
    '<div class="stats">' + ''.join(hl) + '</div>' +
    card('契約期間と実施内容', '', f'<p><b>契約期間</b>{ym(str(start))}〜{end.year}年{end.month}月{end.day}日</p><p><b>実施内容</b>{E(F.get("measures") or "テレアポ")}・リスト作成・トーク作成・週次の報告・月1回の定例</p>' + (f'<p>{S["review_note"]}</p>' if S.get('review_note') else '')) +
    '<p class="tip">商談・受注は共有シートの商談アポ管理表の記録から数えています（記入のない商談は含みません）。</p>'))
mrows = [dict(m=f'{m[0][:4]}年{int(m[0][5:])}月', calls=m[1], talk=m[3], lead=m[4], apo=m[5]) for m in MA]
seg = [s for s in L['seg'] if s['called'] >= 20]; best = max(seg, key=lambda s: (s['apo_rate'], s['reach_rate'])) if seg else None
segcols = [('層', lambda r: E(r['k']), 0), ('架電した先', lambda r: f'{r["called"]:,}', 1), ('ご担当者まで', lambda r: pct(r['reach_rate'], 0), 1), ('アポ', lambda r: r['apo'], 1), ('アポ率', lambda r: pct(r['apo_rate'], 1), 1), ('残り', lambda r: f'{r["left"]:,}', 1)]
sl.append(sec('numbers', '02', '実績（数字）', S.get('numbers_title') or (f'アポがいちばん取れた層は<em class="hl">「{E(best["k"][:18])}」</em>' if best else 'アポ数の推移と、反応の良かった層'),
    '<div class="two"><div class="panel"><h3 class="h3s">アポ（月ごと）</h3>' + bars([(r['m'][-3:] if r['m'][:4] == str(meet.year) else r['m'][2:], r['apo']) for r in mrows], lambda v: f'{v}件') + '</div>' +
    '<div class="panel"><h3 class="h3s">アポ（3か月ごと）</h3>' + bars([(q[0], q[3]) for q in qs], lambda v: f'{v}件', hi=best_q[0] if best_q else None) + '</div></div>' +
    card('ファネル（架電 → 会話 → アポ → 商談 → 受注）', '', bars([('架電', calls), ('つながった', conn), ('ご担当者と会話', talk), ('資料送付など', lead), ('アポ', apo)] ) +
         f'<p>担当者接続率 {pct(talk / calls) if calls else "—"}／アポ化率（会話→アポ）{pct(apo / talk) if talk else "—"}</p><p>商談アポ管理表（{AL}）：アポ{apo_tbl}件 → 商談{meet_n}件（商談化率 {pct(meet_rate, 0)}）→ 受注{won}件（受注率 {pct(win_rate, 0)}）' + (f'／受注金額の目安 {yen(won * price)}（単価{yen(price)}×{won}件）' if price and won else '') + '</p>') +
    card('月ごとの表', f'{len(mrows)}か月', tbl(mrows, [('月', lambda r: r['m'], 0), ('架電', lambda r: f'{r["calls"]:,}', 1), ('会話', lambda r: r['talk'], 1), ('資料送付', lambda r: r['lead'], 1), ('アポ', lambda r: r['apo'], 1), ('アポ率', lambda r: pct(r['apo'] / r['calls'], 2) if r['calls'] else '—', 1)])) +
    card('反応の良かった層（リスト・規模・地域）', '', tbl(seg[:8], segcols) + tbl(L['size'][:6], [('規模', lambda r: E(r['k']), 0)] + segcols[1:]) + tbl(L['pref'][:6], [('地域', lambda r: E(r['k']), 0)] + segcols[1:]) + '<p class="tip">役職別は記録がないため出していません。</p>')))
V = S.get('voices') or {}
ngl = [(k, v) for k, v in L['ng'] if k != 'その他'][:6]
sl.append(sec('voices', '03', '実績（声）', S.get('voices_title') or 'お客様の声から分かったこと',
    '<div class="two"><div class="panel"><h3 class="h3s">関心を持たれたポイント</h3>' + ul([E(x) for x in V.get('interest', [])], '商談アポ管理表のヒアリング内容がまだ少ないため、定例で伺った内容をもとにお話しします。') + '</div>' +
    '<div class="panel"><h3 class="h3s">お断りの理由（多い順）</h3>' + (bars(ngl, lambda v: f'{v}件') if ngl else ul([E(x) for x in V.get('ng', [])], '架電メモにお断りの理由の記録が少ないため、集計していません。')) + '</div></div>' +
    (card('刺さったトーク・訴求', f'{len(S["talks"])}つ', ''.join(f'<p><b>「{E(t["line"])}」</b><br><small>{E(t.get("why", ""))}</small></p>' for t in S['talks'])) if S.get('talks') else '') +
    card('営業現場からのフィードバック（アポの質・商談の手応え）', '', ul([E(x) for x in S.get('field') or []], '商談の結果がまだ記録されていません。'))))
sl.append(sec('learn', '04', '課題と学び', S.get('learn_title') or '届かなかった点と、そこから変えたこと',
    '<div class="cards">' + ''.join(card(E(g['t']), '', f'<p><b>要因</b>{E(g.get("why", ""))}</p>') for g in S.get('gaps') or []) + '</div>' +
    card('実施した改善と、その効果', f'{len(S.get("done") or [])}件' if S.get('done') else '', tbl(S['done'], [('改善', lambda r: E(r['t']), 0), ('効果', lambda r: E(r.get('effect', '')), 0)]) if S.get('done') else '<p class="tip">記録シート「現場の改善」にまだ記録がありません。定例の議事録から自動で入ります。</p>') +
    card('リスト・トークの見直しの履歴', '', '<ul class="tl">' + ''.join(f'<li><b>{E(h["d"])}</b><span>{E(h["t"])}</span></li>' for h in S.get('history') or []) + '</ul>' if S.get('history') else '<p class="tip">見直しの記録がまだありません。記録シート「現場の改善」から自動で入ります。</p>')))
T5 = lambda r: f'<div class="panel"><h3 class="h3s">{r[0]}</h3><div class="ld3">' + stat('アポ', f'{round(r[1]["apo"])}件') + stat('商談', f'{round(r[1]["meet"])}件') + stat('受注', f'{r[1]["won"]:.1f}件') + '</div>' + (f'<p>売上の目安 <b>{yen(r[1]["won"] * price)}</b>' + (f'（費用{yen(cost_next)}の{r[1]["won"] * price / cost_next:.1f}倍）' if cost_next else '') + '</p>' if price else '') + '</div>'
sl.append(sec('target', '05', '次期の目標', S.get('target_title') or f'次の{NEXT_M}か月の目標は、<em class="hl">アポ{round(goal["apo"])}件・受注{goal["won"]:.0f}件</em>',
    '<div class="two">' + T5(('いまのペースのまま', keep)) + T5(('目標（今期のいちばん良い3か月の水準）', goal)) + '</div>' +
    card('目標の根拠', '', f'<ul><li>架電：直近3か月の平均 月{cpm:,.0f}件 × {NEXT_M}か月</li><li>アポ率：いまのペース {pct(rate_now, 2)} → 目標 {pct(max(rate_now, rate_best), 2)}（今期でいちばん良かった3か月：{E(best_q[0]) if best_q else "—"}）</li>'
         f'<li>商談化率 {pct(max(mr, .27), 0)}・受注率 {pct(max(wr, .13), 0)}（{"御社の実績" if meet_rate is not None and meet_n >= 20 else "御社の記録が少ないため、当社のご支援先全体の平均"}）</li></ul>' + (f'<p>{S["target_note"]}</p>' if S.get('target_note') else '')) +
    card('市場の余地', '', f'<p>いまのリスト {L["companies"]:,}社のうち、まだ電話していない会社が <b>{L["left"]:,}社</b>あります。' + (f'反応の良かった「{E(best["k"][:18])}」の残りは{best["left"]:,}社です。' if best else '') + '</p>' + (f'<p>{S["market_note"]}</p>' if S.get('market_note') else ''))))
PR = [('target', 'ターゲットの拡大・見直し', '新しい層・まだ電話していない層・失注先への再アプローチ'), ('talk', 'トーク・訴求のアップデート', '刺さった一言を軸に、冒頭と切り返しを直す'), ('combo', 'ほかの施策との組み合わせ', 'メール・ウェビナー・インサイドセールスの内製化支援など'), ('team', '体制のご提案', '稼働量・担当・報告の頻度')]
sl.append(sec('proposal', '06', '次期の施策', S.get('proposal_title') or '次の1年で、変えること',
    '<div class="cards">' + ''.join(card(E(t), '', ul([E(x) for x in P.get(k) or []]) + f'<p class="tip">{E(h)}</p>') for k, t, h in PR) + '</div>'))
# 受注率向上・営業強化オプション（セールスコンサルティング局の資料「【決定版】受注率向上・営業強化オプション」11/13版）
OPT = [('①', '交流会参加代行', '貴社商材と相性の良い交流会へプロが代行参加し、確度の高い名刺（リード）を獲得します。', '100,000円／1回', ['交流会への代行参加・名刺獲得', '可能な案件はその場で日程調整', '獲得名刺のデータリスト化', '獲得リストへのフォロー架電（アポ獲得込み・追加費用なし）']),
       ('②', '追いかけフォローテレアポ', '休眠顧客や過去の資料送付先・名刺・ハウスリストへアプローチし、埋もれていた商談を掘り起こします。', '5万円（100コール）', ['過去に獲得した名刺の無料データリスト化', '資料送付済み・過去のアポ先へのフォロー架電', '貴社のハウスリストへの掘り起こしテレアポ']),
       ('③', '提案資料作成', 'ヒアリング内容をもとに貴社の強みと顧客課題を結びつけ、アポ獲得後の商談化率・受注率を上げます。', '梅10万円／竹20万円／松50万円', ['梅：提案資料作成（10〜15ページ）', '竹：事例取材・競合比較調査・提案資料作成（15〜25ページ）', '松：顧客取材・実績データ分析・提案資料作成（30ページ以上）']),
       ('④', '自動フォローメール実装', '商談後の「ほったらかし」を防ぐ、お礼・追客メールの自動化。うっかり連絡を忘れて失注するリスクをなくします。', '初期15万円＋月額3万円', ['フォーム営業の補完（アプローチの拡大）', 'ナーチャリング（関心を育てる）', '継続アプローチによる商談創出']),
       ('⑤', '商談動画の分析・アドバイス', '実際の商談動画をプロが分析し、「どこを直せば売れるか」を具体的にお伝えします。', '担当よりご案内します', ['第三者のプロ目線での課題の発見', '売れるトークの可視化', 'ノウハウの共有でチーム全体のスキルを底上げ']),
       ('⑥', '商談台本作成', 'トップ営業の話し方をマニュアル化し、誰が話しても売れる「話し方の台本」を作ります。', '30万円', ['現状の商談トークのヒアリングと台本化', '「購買心理7大原則」に沿った構成作成', '顧客メリットの提示・懸念点の払拭を組み込み']),
       ('⑦', '商談代行', '人手が足りない時や確実に売りたい時に、営業のプロが貴社の一員として商談を行います。', '商談台本作成30万円＋1件3万円', ['同席して商材と顧客の反応を把握', '専用台本を作り、テスト商談', 'プロが初回商談を担当し、2回目（クロージング）を貴社へ'])]
COMBO = {'new': ('見込み顧客を一から集めて、すぐ商談にしたい', ['①', '⑦']), 'dormant': ('過去の名刺や資料送付先を眠らせている', ['②', '③']),
         'quality': ('商談の数も質も、両方底上げしたい', ['③', '⑦']), 'team': ('社内の営業組織を育てて、仕組みにしたい', ['⑥', '⑤', '④'])}
# 数字からおすすめを選ぶ（story の options_pick で上書きできる）
pick = S.get('options_pick')
if pick not in COMBO:
    months_left = L['left'] / cpm if cpm else 99
    if lead >= max(10, apo): pick = 'dormant'            # 資料送付などの見込み先がアポ以上に残っている
    elif win_rate is not None and meet_n >= 5 and win_rate < .13: pick = 'quality'   # 商談はあるが受注につながりにくい
    elif months_left < 4: pick = 'new'                   # リストの残りが少ない
    else: pick = 'team'
why_pick = S.get('options_why') or {'dormant': '一度資料をお送りした相手なので、ゼロから探すより早く商談になります。',
    'quality': 'アポを増やさなくても、資料と商談を整えれば受注が増えます。',
    'new': 'プロが名刺を集め、商談までお任せいただけます。',
    'team': '売れる話し方を、社内の仕組みとして残します。'}[pick]
OPTD = {o[0]: o for o in OPT}
ct, cks = COMBO[pick]
# 「もったいない」→ 解決策の対応（資料1ページ目）
MAPR = [('新しい人脈を広げる時間がない', ['①']), ('過去の名刺や資料送付先を放置している', ['②']), ('資料が分かりにくく、商談にならない', ['③']),
        ('商談後の追いかけがなく、失注している', ['④']), ('商談の「どこが悪かったか」が分からない', ['⑤']), ('話すのが苦手な人がいる・人手が足りない', ['⑥', '⑦'])]
omap = ''.join(f'<li class="{"on" if set(ks) & set(cks) else ""}"><span class="om-p">{E(pb)}</span><span class="om-a" aria-hidden="true"></span><span class="om-s">{"／".join(f"<b>{k}</b>{E(OPTD[k][1])}" for k in ks)}</span></li>' for pb, ks in MAPR)
pkg = '<i class="pk-plus" aria-hidden="true">＋</i>'.join(f'<div class="pk-t"><span class="pk-n">{k}</span><b>{E(OPTD[k][1])}</b><span class="pk-y">{E(OPTD[k][3])}</span></div>' for k in cks)
alltbl = '<div class="ol">' + ''.join(f'<details class="ol-r{" on" if o[0] in cks else ""}"><summary><span class="ol-n">{o[0]}</span><b>{E(o[1])}</b><span class="ol-y">{E(o[3])}</span></summary><div class="ol-b"><p>{E(o[2])}</p>{ul([E(x) for x in o[4]])}</div></details>' for o in OPT) + '</div>'
# 売る構成：①御社に残っている「もったいない」（数字）→ ②解決の組み合わせ → ③やった場合の試算 → ④始め方
a2t = apo / talk if talk else 0                         # 御社の「会話→アポ」の率
cpa_now = fee * len(MA) / apo if fee and apo else 0      # 今期の1アポあたりの費用
# 「いま → このオプション → こうなる」を1本の流れで見せる（数字があるときは御社の数字で）
names = '＋'.join(OPTD[k][1] for k in cks)
cmp_ = None; note = ''
if pick == 'dormant' and lead and a2t:
    n_call = -(-lead // 100) * 100; c_opt = n_call // 100 * 5 + 10; e_apo = lead * a2t
    flow = (('いま眠っている見込み先', f'{lead:,}', '件'), f'{c_opt}万円', ('見込めるアポ', f'{e_apo:.0f}', '件'))
    head = '眠っている見込み先を、<em class="hl">商談に。</em>'
    if cpa_now and e_apo >= 1: cmp_ = ('1アポあたりの費用', ('今期', cpa_now / 1e4), ('このプラン', c_opt / e_apo))
    note = f'追いかけ{n_call:,}コール＋提案資料（梅）。アポは御社の「会話→アポ」の率 {pct(a2t, 1)}で試算した目安です。'
elif pick == 'quality' and meet_n and win_rate is not None:
    tgt = max(.13, win_rate * 1.5); add = meet_n * (tgt - win_rate)
    flow = (('いまの受注率', f'{win_rate * 100:.0f}', '%'), '資料と商談を整える', ('目指す受注率', f'{tgt * 100:.0f}', '%'))
    head = 'いまのアポのまま、<em class="hl">受注を増やす。</em>'
    note = f'今期の商談{meet_n}件のまま受注率が上がると、受注は+{add:.1f}件の目安です。'
elif pick == 'new':
    flow = (('リストの残り', f'{L["left"] / cpm if cpm else 0:.0f}', 'か月分'), '10万円／1回〜', ('新しい見込み先', '交流会', 'から'))
    head = 'リストが尽きる前に、<em class="hl">新しい見込み先を。</em>'
else:
    flow = (('今期のアポ', f'{apo:,}', '件'), '台本30万円〜', ('受注までの流れ', '社内', 'に残る'))
    head = 'アポを受注に変える力を、<em class="hl">社内に。</em>'
(l1, v1, u1), mid, (l2, v2, u2) = flow
cmpbar = ''
if cmp_:
    mx = max(cmp_[1][1], cmp_[2][1])
    cmpbar = f'<div class="nx-cmp"><p>{cmp_[0]}</p>' + ''.join(f'<div class="nx-cr{" g" if k == 2 else ""}"><span>{n}</span><i><s style="width:{v / mx * 100:.0f}%"></s></i><b>約{v:.1f}万円</b></div>' for k, (n, v) in ((1, cmp_[1]), (2, cmp_[2]))) + '</div>'
sl.append(sec('options', '07', '受注率向上オプション', S.get('options_title') or head,
    f'<p class="nx-why">{E(why_pick)}</p>' +
    f'<div class="nx-flow"><div class="nx-nd"><span>{E(l1)}</span><b>{v1}<small>{u1}</small></b></div>' +
    f'<div class="nx-ar"><div class="nx-op">{"".join(f"<span><em>{k}</em>{E(OPTD[k][1])}</span>" for k in cks)}</div><i class="nx-ln" aria-hidden="true"></i><b>{E(mid)}</b></div>' +
    f'<div class="nx-nd g"><span>{E(l2)}</span><b>{v2}<small>{u2}</small></b></div></div>' +
    cmpbar + (f'<p class="nx-note">{E(note)}</p>' if note else '') +
    f'<div class="nx-cta"><b>1か月からお試しいただけます</b><span>定例で{E(a.director or "担当")}にお声がけください</span></div>' +
    f'<details class="nx-more"><summary>ほかのオプションも見る（全7つ）</summary><div class="om"><div class="om-h"><span>営業現場の「もったいない」</span><span>ライトアップの解決策</span></div><ol>{omap}</ol></div>' + alltbl + '</details>'))
# 続け方を選べるプラン（同資料 10〜11ページ）
FLEX = S.get('flex_note') or ''
STEPS = [('テレアポ500<br>＋フォーム1,000', 25), ('テレアポ500', 20), ('テレアポ250', 10), ('テレアポ100', 5), ('休止', 0)]
cols = ''.join(f'<li><b>{f"{v}<small>万円</small>" if v else "—"}</b><i style="height:{max(v / 25 * 100, 3):.0f}%"></i><span>{t}</span></li>' for t, v in STEPS)
sl.append(sec('flex', '08', '柔軟なプラン', S.get('flex_title') or '続け方は、<em class="hl">月ごとに選べます</em>',
    f'<div class="fx"><div class="fx-main"><p class="fx-k">費用を抑えて続ける（月額）</p><ol class="fc">{cols}</ol><p class="fx-s">休止中も、リストと営業ノウハウはそのまま残ります。</p></div>' +
    '<div class="fx-side"><div class="fx-c"><p class="fx-k">閑散期だけ（スポット）</p><dl class="fx-dl"><dt>テレアポ＋フォーム営業</dt><dd>25万円</dd><dt>テレアポ500コール</dt><dd>20万円</dd><dt>フォーム営業1,000件</dt><dd>5万円</dd><dt>FAX営業1,000件</dt><dd>5万円</dd></dl></div>' +
    '<div class="fx-c"><p class="fx-k">DM＋追撃</p><p class="fx-eq"><span>DM 100通</span><i>＋</i><span>追いかけ100コール</span></p><p class="fx-big">月額25万円</p></div></div></div>' +
    '<div class="fx-band"><b>最短翌月解約</b><span>すべて1か月ごとの更新。長期の縛りはありません。</span></div>' +
    (f'<p style="margin-top:12px">{E(FLEX)}</p>' if FLEX else '') + '<p class="tip">金額は税抜です。</p>'))
# 次期スケジュール（切れ目なく）
nxt = end + datetime.timedelta(days=1)
def add_m(d, n): y, m = divmod(d.month - 1 + n, 12); y += d.year; return datetime.date(y, m + 1, min(d.day, calendar.monthrange(y, m + 1)[1]))
sch = S.get('schedule') or [[f'{meet.month}月{meet.day}日', '本日：今期の振り返りと次期のご提案'], [f'{end.month}月上旬', '次期の内容（リスト・トーク・体制・料金）のご判断'], [f'{end.month}月中旬', 'ご契約の更新手続き'], [f'{end.month}月下旬', '次期のリストとトークを準備（架電を止めずに切り替え）'],
       [f'{nxt.month}月{nxt.day}日', '次期スタート'], [f'{add_m(nxt, 1).month}月', '最初の定例：新しいリストの反応を確認'], [f'{add_m(nxt, 3).month}月', '3か月目の振り返り：目標に対する進み具合']]
O = S.get('ops') or {}
sl.append(sec('schedule', '09', '運用とスケジュール', '切れ目なく、次期に入るための段取り',
    '<div class="two"><div class="panel"><h3 class="h3s">次期までの流れ</h3><ul class="tl">' + ''.join(f'<li><b>{E(d)}</b><span>{E(t)}</span></li>' for d, t in sch) + '</ul></div>' +
    f'<div class="panel"><h3 class="h3s">運用の進め方</h3><ul><li><b>定例</b>{E(O.get("meeting") or "月1回。このポータルの着地プランを一緒に開き、次の打ち手を決めます")}</li><li><b>報告</b>{E(O.get("report") or "毎週の数字はポータルで自動更新。定例資料は前日にポータルへ")}</li><li><b>担当</b>{E(O.get("team") or (a.director + "（担当ディレクター）" if a.director else ""))}</li></ul></div></div>'))
rows8 = ''.join(f'<li><b>{lb}</b>{E(PL[k])}</li>' for k, lb in [('name', 'プラン'), ('price', '料金'), ('discount', '継続割引・長期特典'), ('term', '契約期間'), ('renew', '更新の条件')] if PL.get(k))
sl.append(sec('price', '10', '料金・契約条件', '次期のプランと料金',
    '<div class="two"><div class="panel"><h3 class="h3s">今期のご契約</h3><ul>' + (f'<li><b>月額</b>{yen(fee)}（税抜）</li>' if fee else '') + f'<li><b>契約期間</b>{ym(str(start))}〜{end.year}年{end.month}月{end.day}日</li></ul></div>' +
    f'<div class="panel"><h3 class="h3s">次期のご提案</h3>' + (f'<ul>{rows8}</ul>' if rows8 else '<p>次期のプランと料金は、担当よりご案内します。</p>') + '</div></div>' +
    '<p style="margin-top:18px"><button type="button" class="more-all" id="openall">すべての詳細を開く</button> <a class="back" id="toPortal" href="#">戻る</a></p>' +
    f'<p class="src">出典：日次の架電報告（{C["first"]}〜{C["last"]}）・共有シートの架電記録と商談アポ管理表。他のお客様の社名は記載していません。</p>'))
HIDE = set(S.get('hide') or [])  # 変更指示で「この章を外す」と言われた章（data-title）
sl = [x for x in sl if not any(f'data-title="{h}"' in x for h in HIDE)]
NAVI = {'review': '今期の結果を1枚にまとめました。', 'numbers': '月ごとと3か月ごとで、どこで伸びたかが分かります。', 'voices': 'お断りの理由が分かると、次期に直すところが決まります。',
        'learn': 'うまくいかなかった点と、そこから変えたことです。', 'target': '目標は今期の実績から逆算しています。', 'proposal': '次の1年で変えることを4つに分けました。', 'options': '御社の数字で、いちばん効くところを選びました。試算もご覧ください。', 'flex': '休止や縮小、スポットなど、続け方は選べます。',
        'schedule': '架電を止めずに次期に入るための段取りです。', 'price': '次期のプランと料金です。'}
NAVI.update(S.get('navi') or {})
SAY = {k: [v, []] for k, v in NAVI.items()}

EDIT_URL = 'https://docs.google.com/spreadsheets/d/1sA96H5h0UoUAW7kHrqaCuPu9_s6THgP9b50olIOnMQI/edit#gid=1588267169'
SRC = html.escape(json.dumps(dict(data=D, facts=F, story=json.load(open(a.story)) if a.story != '-' else {}), ensure_ascii=False), quote=False)
EDIT = '' if a.no_edit else f"""<button type="button" class="edbtn" id="edbtn">✎ 変更を頼む</button>
<div class="edp" id="edp" hidden><div class="edin"><b>Claude に変更を頼む</b><p>直してほしいことを書いて「コピーしてシートを開く」を押し、開いたシート（変更指示タブ）の一番下の空いている行の A 列に貼り付けてください。数時間以内に Claude が資料を直し、Slack でお知らせします。</p>
<label for="edch">章</label><select id="edch"></select>
<label for="edtx">変更してほしいこと</label><textarea id="edtx" rows="4" placeholder="例：次期の施策はウェビナーを外して、メールフォローを1つ目に。目標の受注は5件に"></textarea>
<div class="edchips"><button type="button">もっと簡潔に</button><button type="button">この章を外す</button><button type="button">数字の言い方を控えめに</button><button type="button">提案を2つに絞る</button><button type="button">お客様の業界の言葉に合わせる</button></div>
<label for="edwho">書いた人</label><input id="edwho" value="{E(a.director)}">
<div class="edact"><button type="button" id="edgo">コピーしてシートを開く</button><button type="button" id="edx">閉じる</button></div>
<textarea id="edout" readonly rows="2" hidden></textarea></div></div>
<script>(()=>{{const S={json.dumps(dict(sis=a.sis or F.get('sis', ''), name=name, meet=str(meet)), ensure_ascii=False)};const p=document.getElementById("edp"),ch=document.getElementById("edch"),tx=document.getElementById("edtx"),out=document.getElementById("edout");
ch.innerHTML=[...document.querySelectorAll(".slide")].map(s=>`<option>${{s.dataset.title||"表紙"}}</option>`).join("")+"<option>全体</option>";
document.getElementById("edbtn").onclick=()=>{{const i=typeof cur==="number"?cur:0;ch.selectedIndex=Math.max(0,i);p.hidden=false;tx.focus()}};
document.getElementById("edx").onclick=()=>p.hidden=true;
p.querySelectorAll(".edchips button").forEach(b=>b.onclick=()=>{{tx.value=(tx.value?tx.value+"／":"")+b.textContent;tx.focus()}});
document.getElementById("edgo").onclick=async()=>{{if(!tx.value.trim()){{tx.focus();return}}const d=new Date(),z=n=>String(n).padStart(2,"0");
 const row=[`${{d.getFullYear()}}/${{z(d.getMonth()+1)}}/${{z(d.getDate())}} ${{z(d.getHours())}}:${{z(d.getMinutes())}}`,S.sis,S.name,S.meet,ch.value,tx.value.replace(/[\\t\\n]+/g," "),document.getElementById("edwho").value].join("\\t");
 let ok=false;try{{await navigator.clipboard.writeText(row);ok=true}}catch(_){{}}out.hidden=false;out.value=row;out.select();
 document.getElementById("edgo").textContent=ok?"コピーしました（シートに貼り付けてください）":"下の文字を選んでコピーしてください";window.open("{EDIT_URL}","_blank","noopener")}};
addEventListener("keydown",e=>{{if(e.key==="Escape")p.hidden=true}},true);
}})()</script>"""
CSS += """.ctl .lkb{width:auto;border-radius:999px;padding:0 14px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
.lkm{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(72px + env(safe-area-inset-bottom,0px));z-index:46;width:230px;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:16px;padding:12px;box-shadow:0 14px 34px rgba(0,0,0,.22);display:grid;gap:6px}
.lkm>b{font-size:13px;padding:2px 4px}.lkm button{font:inherit;text-align:left;border:1px solid var(--line);background:transparent;color:inherit;border-radius:10px;padding:8px 12px;font-weight:700;font-size:14px;cursor:pointer}
.lkm button small{display:block;font-weight:400;font-size:11.5px;color:var(--mute)}.lkm button[aria-pressed="true"]{border:2px solid var(--accent);background:var(--accent-soft)}
.lkm[hidden]{display:none}:fullscreen .lkm{display:none}@media print{.lkm,.lkb{display:none!important}}
/* 見た目B：提案書（紺×金・明朝） */
:root:root[data-look="b"]{--bg:#f6f3ea;--card:#fffdf7;--ink:#0e1a30;--mute:#5d6577;--line:#d9d2bd;--line2:#ebe5d3;--accent:#b08a3c;--accent-ink:#86651d;--accent-soft:#f2e8cb;--cover:#0e1a30;color-scheme:light}
[data-look="b"] .sh h2,[data-look="b"] .cover h1{font-family:"Shippori Mincho B1","Hiragino Mincho ProN",serif;font-weight:800;letter-spacing:.01em}
[data-look="b"] .sh h2{font-size:clamp(1.7rem,3.8vw,2.8rem);line-height:1.4}[data-look="b"] em.hl{background:none;border-bottom:3px solid var(--accent)}
[data-look="b"] .sh{border-left:4px solid var(--accent);padding-left:18px;margin-bottom:22px}[data-look="b"] .sh .no{letter-spacing:.2em}
[data-look="b"] .panel,[data-look="b"] .nx-nd,[data-look="b"] .fx-main,[data-look="b"] .fx-c,[data-look="b"] .om{border-radius:4px;border:0;border-top:3px solid var(--ink);box-shadow:0 1px 0 var(--line),0 10px 24px rgba(14,26,48,.06)}
[data-look="b"] .nx-nd.g{border-top-color:var(--accent)}[data-look="b"] .nx-cta,[data-look="b"] .cover .start{border-radius:4px;background:var(--ink);color:#f6f3ea}[data-look="b"] .nx-cta b{color:#e3c888}
[data-look="b"] .cover{background:linear-gradient(160deg,#0e1a30 60%,#1c2d50)}[data-look="b"] .cover .eyebrow{color:#e3c888}[data-look="b"] .cover .start{background:#b08a3c;color:#0e1a30}
[data-look="b"] .fx-band{border-radius:4px}[data-look="b"] .fx-band b{color:#e3c888}[data-look="b"] .num,[data-look="b"] .nx-nd b{font-family:"Shippori Mincho B1",serif}
/* 見た目C：数字が主役（白地・箱なし） */
:root:root[data-look="c"]{--bg:#fff;--card:#fff;--ink:#0a0a0a;--mute:#6a6a6a;--line:#0a0a0a;--line2:#e6e6e6;--accent:#1437ff;--accent-ink:#1437ff;--accent-soft:#e8ecff;--cover:#0a0a0a;color-scheme:light}
[data-look="c"] .sh h2{font-size:clamp(1.7rem,3.9vw,3rem);line-height:1.2;letter-spacing:-.03em}[data-look="c"] em.hl{background:none}
[data-look="c"] .panel,[data-look="c"] .nx-nd,[data-look="c"] .fx-main,[data-look="c"] .fx-c,[data-look="c"] .om{border:0;border-top:2px solid var(--ink);border-radius:0;background:transparent;padding-left:0;padding-right:0}
[data-look="c"] .nv.panel{border:1px solid var(--line2);border-radius:14px;background:#fff;padding:14px}
[data-look="c"] .num{font-family:var(--font);font-size:clamp(2rem,4vw,3rem);font-weight:900;letter-spacing:-.03em;line-height:1.1}
[data-look="c"] .nx-nd b{font-size:clamp(64px,9vw,128px);letter-spacing:-.05em}[data-look="c"] .nx-nd.g{background:transparent;border-top-color:var(--accent)}
[data-look="c"] .slide{border-bottom:2px solid var(--ink)}[data-look="c"] .nx-cta,[data-look="c"] .cover .start,[data-look="c"] .fx-band{border-radius:0}
[data-look="c"] .cover h1{font-size:clamp(2.6rem,8vw,5.6rem);letter-spacing:-.04em;line-height:1.1}[data-look="c"] .fc i{border-radius:0}[data-look="c"] .fc b{font-size:30px}
/* 見た目D：ナイト（全体を暗く） */
:root:root[data-look="d"]{--bg:#0f1218;--card:#181c24;--ink:#f1efe9;--mute:#9aa1ad;--line:#2c323d;--line2:#222730;--accent:#ff7a4d;--accent-ink:#ff9a76;--accent-soft:#3a2219;--cover:#07090c;color-scheme:dark}
[data-look="d"] .sh h2{font-size:clamp(1.7rem,4vw,3rem);line-height:1.3}[data-look="d"] .panel,[data-look="d"] .nx-nd,[data-look="d"] .fx-main,[data-look="d"] .fx-c{border-radius:20px;box-shadow:0 0 0 1px rgba(255,255,255,.04) inset}
[data-look="d"] .nx-nd.g{box-shadow:0 0 40px rgba(255,122,77,.25)}[data-look="d"] .nx-op span,[data-look="d"] .ctl,[data-look="d"] .fx-band{background:#f1efe9;color:#0f1218}[data-look="d"] .fc li:first-child i{background:#f1efe9}
[data-look="d"] .ctl button{color:#0f1218}[data-look="d"] .ctl .nx{color:#fff}
"""
CSS += """.edbtn{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:45;font:inherit;font-size:13px;font-weight:700;border:1px dashed var(--line);background:var(--card,#fff);color:var(--ink,#15171b);border-radius:999px;padding:8px 14px;cursor:pointer;opacity:.85}
.edp{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.35);display:grid;place-items:center;padding:16px}.edp[hidden]{display:none}
.edin{background:var(--card,#fff);color:var(--ink,#15171b);border-radius:14px;padding:18px;width:min(560px,100%);display:grid;gap:8px;max-height:90vh;overflow:auto}.edin p{margin:0;font-size:13px;opacity:.8}.edin label{font-size:12px;font-weight:700}
.edin select,.edin textarea,.edin input{font:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:transparent;color:inherit;width:100%}
.edchips{display:flex;flex-wrap:wrap;gap:6px}.edchips button{font:inherit;font-size:12px;border:1px solid var(--line);background:transparent;border-radius:999px;padding:3px 10px;cursor:pointer;color:inherit}
.edact{display:flex;gap:8px;flex-wrap:wrap}.edact button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:8px 16px;cursor:pointer;background:var(--accent,#d9481f);color:#fff}.edact #edx{background:transparent;border:1px solid var(--line);color:inherit}
:fullscreen .edbtn{display:none}@media print{.edbtn,.edp{display:none!important}}"""

av = open(a.avatar).read().strip() if a.avatar else ''
who = f'<img src="{av}" alt="" width="44" height="44">' if av else f'<span class="ini">{E((a.director or "担")[0])}</span>'
LKJS = r"""<script>(function(){var R=document.documentElement,m=document.getElementById("lkm"),b=document.getElementById("lk"),K="renew-look";
function set(v){if(v&&v!=="a")R.setAttribute("data-look",v);else R.removeAttribute("data-look");[].forEach.call(m.querySelectorAll("button"),function(x){x.setAttribute("aria-pressed",x.dataset.look===(v||"a"))})}
var v="a";try{v=localStorage.getItem(K)||"a"}catch(e){}set(v);
b.onclick=function(){m.hidden=!m.hidden;b.setAttribute("aria-expanded",!m.hidden)};
m.onclick=function(e){var t=e.target.closest("button");if(!t)return;set(t.dataset.look);try{localStorage.setItem(K,t.dataset.look)}catch(_){}m.hidden=true;b.setAttribute("aria-expanded","false")};
document.addEventListener("click",function(e){if(!m.hidden&&!e.target.closest("#lkm,#lk")){m.hidden=true;b.setAttribute("aria-expanded","false")}})})();</script>"""
page = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex">
<title>{E(short)}様 継続のご提案</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=IBM+Plex+Mono:wght@400;600&family=Shippori+Mincho+B1:wght@600;800&display=swap">
<style>{CSS}</style></head><body class="cover-on">
{"".join(sl)}
<nav class="dots" id="dots" aria-label="章"></nav>
<div class="ctl"><button id="prev" aria-label="前の章へ">↑</button><span class="pg" id="pg">1/{len(sl)}</span><button id="next" class="nx" aria-label="次の章へ">↓</button><button id="fs" aria-label="全画面で表示">⛶</button><button id="lk" class="lkb" aria-haspopup="true" aria-expanded="false">見た目</button></div>
<div class="lkm" id="lkm" hidden><b>見た目を変える</b><button data-look="a">標準<small>生成り×オレンジ</small></button><button data-look="b">提案書<small>紺×金・明朝の見出し</small></button><button data-look="c">数字が主役<small>白地・箱なし・大きな数字</small></button><button data-look="d">ナイト<small>全体を暗い色で</small></button></div>
<aside class="navi"><div class="nv panel" id="nv"><div class="who">{who}<div><b>担当ディレクター {E(a.director or "")}</b><small>章に合わせてご説明します</small></div><button class="tg" id="tg" aria-label="ナビを開く">…</button></div><p class="bubble" id="say" aria-live="polite"></p></div></aside>
<script>const SAY={json.dumps(SAY, ensure_ascii=False)};const say=document.getElementById("say");{JS}</script>
{LKJS}
{EDIT}
<textarea id="renew-src" hidden>{SRC}</textarea>
</body></html>'''
open(a.out, 'w').write(page)
todo = page.count('class="todo"')
print(json.dumps(dict(missing=MISSING, suggest={k: SUG[k] for k in MISSING if k in SUG}, auto=sorted(AUTO), out=a.out, slides=len(sl), todo=todo, draft=draft, goal=dict(apo=round(goal['apo']), won=round(goal['won'], 1)), keep=dict(apo=round(keep['apo']), won=round(keep['won'], 1))), ensure_ascii=False))
