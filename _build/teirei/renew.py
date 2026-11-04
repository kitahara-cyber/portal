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
# 次期スケジュール（切れ目なく）
nxt = end + datetime.timedelta(days=1)
def add_m(d, n): y, m = divmod(d.month - 1 + n, 12); y += d.year; return datetime.date(y, m + 1, min(d.day, calendar.monthrange(y, m + 1)[1]))
sch = S.get('schedule') or [[f'{meet.month}月{meet.day}日', '本日：今期の振り返りと次期のご提案'], [f'{end.month}月上旬', '次期の内容（リスト・トーク・体制・料金）のご判断'], [f'{end.month}月中旬', 'ご契約の更新手続き'], [f'{end.month}月下旬', '次期のリストとトークを準備（架電を止めずに切り替え）'],
       [f'{nxt.month}月{nxt.day}日', '次期スタート'], [f'{add_m(nxt, 1).month}月', '最初の定例：新しいリストの反応を確認'], [f'{add_m(nxt, 3).month}月', '3か月目の振り返り：目標に対する進み具合']]
O = S.get('ops') or {}
sl.append(sec('schedule', '07', '運用とスケジュール', '切れ目なく、次期に入るための段取り',
    '<div class="two"><div class="panel"><h3 class="h3s">次期までの流れ</h3><ul class="tl">' + ''.join(f'<li><b>{E(d)}</b><span>{E(t)}</span></li>' for d, t in sch) + '</ul></div>' +
    f'<div class="panel"><h3 class="h3s">運用の進め方</h3><ul><li><b>定例</b>{E(O.get("meeting") or "月1回。このポータルの着地プランを一緒に開き、次の打ち手を決めます")}</li><li><b>報告</b>{E(O.get("report") or "毎週の数字はポータルで自動更新。定例資料は前日にポータルへ")}</li><li><b>担当</b>{E(O.get("team") or (a.director + "（担当ディレクター）" if a.director else ""))}</li></ul></div></div>'))
rows8 = ''.join(f'<li><b>{lb}</b>{E(PL[k])}</li>' for k, lb in [('name', 'プラン'), ('price', '料金'), ('discount', '継続割引・長期特典'), ('term', '契約期間'), ('renew', '更新の条件')] if PL.get(k))
sl.append(sec('price', '08', '料金・契約条件', '次期のプランと料金',
    '<div class="two"><div class="panel"><h3 class="h3s">今期のご契約</h3><ul>' + (f'<li><b>月額</b>{yen(fee)}（税抜）</li>' if fee else '') + f'<li><b>契約期間</b>{ym(str(start))}〜{end.year}年{end.month}月{end.day}日</li></ul></div>' +
    f'<div class="panel"><h3 class="h3s">次期のご提案</h3>' + (f'<ul>{rows8}</ul>' if rows8 else '<p>次期のプランと料金は、担当よりご案内します。</p>') + '</div></div>' +
    '<p style="margin-top:18px"><button type="button" class="more-all" id="openall">すべての詳細を開く</button> <a class="back" id="toPortal" href="#">戻る</a></p>' +
    f'<p class="src">出典：日次の架電報告（{C["first"]}〜{C["last"]}）・共有シートの架電記録と商談アポ管理表。他のお客様の社名は記載していません。</p>'))
HIDE = set(S.get('hide') or [])  # 変更指示で「この章を外す」と言われた章（data-title）
sl = [x for x in sl if not any(f'data-title="{h}"' in x for h in HIDE)]
NAVI = {'review': '今期の結果を1枚にまとめました。', 'numbers': '月ごとと3か月ごとで、どこで伸びたかが分かります。', 'voices': 'お断りの理由が分かると、次期に直すところが決まります。',
        'learn': 'うまくいかなかった点と、そこから変えたことです。', 'target': '目標は今期の実績から逆算しています。', 'proposal': '次の1年で変えることを4つに分けました。',
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
CSS += """.edbtn{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:45;font:inherit;font-size:13px;font-weight:700;border:1px dashed var(--line);background:var(--card,#fff);color:var(--ink,#15171b);border-radius:999px;padding:8px 14px;cursor:pointer;opacity:.85}
.edp{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.35);display:grid;place-items:center;padding:16px}.edp[hidden]{display:none}
.edin{background:var(--card,#fff);color:var(--ink,#15171b);border-radius:14px;padding:18px;width:min(560px,100%);display:grid;gap:8px;max-height:90vh;overflow:auto}.edin p{margin:0;font-size:13px;opacity:.8}.edin label{font-size:12px;font-weight:700}
.edin select,.edin textarea,.edin input{font:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:transparent;color:inherit;width:100%}
.edchips{display:flex;flex-wrap:wrap;gap:6px}.edchips button{font:inherit;font-size:12px;border:1px solid var(--line);background:transparent;border-radius:999px;padding:3px 10px;cursor:pointer;color:inherit}
.edact{display:flex;gap:8px;flex-wrap:wrap}.edact button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:8px 16px;cursor:pointer;background:var(--accent,#d9481f);color:#fff}.edact #edx{background:transparent;border:1px solid var(--line);color:inherit}
:fullscreen .edbtn{display:none}@media print{.edbtn,.edp{display:none!important}}"""

av = open(a.avatar).read().strip() if a.avatar else ''
who = f'<img src="{av}" alt="" width="44" height="44">' if av else f'<span class="ini">{E((a.director or "担")[0])}</span>'
page = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex">
<title>{E(short)}様 継続のご提案</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>{CSS}</style></head><body class="cover-on">
{"".join(sl)}
<nav class="dots" id="dots" aria-label="章"></nav>
<div class="ctl"><button id="prev" aria-label="前の章へ">↑</button><span class="pg" id="pg">1/{len(sl)}</span><button id="next" class="nx" aria-label="次の章へ">↓</button><button id="fs" aria-label="全画面で表示">⛶</button></div>
<aside class="navi"><div class="nv panel" id="nv"><div class="who">{who}<div><b>担当ディレクター {E(a.director or "")}</b><small>章に合わせてご説明します</small></div><button class="tg" id="tg" aria-label="ナビを開く">…</button></div><p class="bubble" id="say" aria-live="polite"></p></div></aside>
<script>const SAY={json.dumps(SAY, ensure_ascii=False)};const say=document.getElementById("say");{JS}</script>
{EDIT}
<textarea id="renew-src" hidden>{SRC}</textarea>
</body></html>'''
open(a.out, 'w').write(page)
todo = page.count('class="todo"')
print(json.dumps(dict(missing=MISSING, suggest={k: SUG[k] for k in MISSING if k in SUG}, auto=sorted(AUTO), out=a.out, slides=len(sl), todo=todo, draft=draft, goal=dict(apo=round(goal['apo']), won=round(goal['won'], 1)), keep=dict(apo=round(keep['apo']), won=round(keep['won'], 1))), ensure_ascii=False))
