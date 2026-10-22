"""定例資料（1章＝1画面のスクロール型）を作る。
使い方: python3 deck.py data.json story.json out.html [--director 林] [--avatar avatar.txt(data URI)]
story.json は省略可（"-"）。省略時は数字からルールで文章を作る。
story.json の形（すべて任意）:
{"summary":"結論の1文（<em>強調</em>可）","trend":"…","result":"…","ng":"…","list":"…",
 "issues":[{"t":"題名","body":"中身"}],"proposals":[{"t":"題名","why":"理由","kpi":"目標"}],
 "plan":["来月やること"],"asks":["お願いしたいこと"],"navi":{"summary":"…", "result":"…"}}
"""
import json, sys, html, datetime, argparse
ap = argparse.ArgumentParser(); ap.add_argument('data'); ap.add_argument('story'); ap.add_argument('out')
ap.add_argument('--director', default=''); ap.add_argument('--avatar', default='')
a = ap.parse_args()
D = json.load(open(a.data)); S = json.load(open(a.story)) if a.story != '-' else {}
E = lambda s: html.escape(str(s))
def pct(x, d=1): return f'{x*100:.{d}f}%'
def jd(s):
    try: d = datetime.date.fromisoformat(s); return f'{d.month}/{d.day}'
    except: return s
name = D['name']; short = name.replace('株式会社', '').replace('有限会社', '').replace('合同会社', '').strip()
meet = datetime.date.fromisoformat(D['meeting']); C = D['crm']; L = D['list']
calls, conn, talk, lead, apo = C['since']; T = C['total']
res = dict(L['results']); rtot = sum(res.values()) or 1
ng = [(k, v) for k, v in L['ng']]; ngtot = sum(v for _, v in ng) or 1
order = ['アポ', '資料送付', '担当者NG', '受付NG', '不在', '再度架電', '不通・番号不備', 'その他']
RES_NOTE = {'アポ': '商談のお約束', '資料送付': '資料をお送りするお約束', '担当者NG': 'ご担当者と話したうえでお断り', '受付NG': '受付の段階でお断り',
            '不在': 'ご担当者が不在', '再度架電': '日を改めてお電話', '不通・番号不備': 'つながらない・番号違い', 'その他': 'その他'}
reach = res.get('担当者NG', 0) + res.get('資料送付', 0) + res.get('アポ', 0)
gate = res.get('受付NG', 0); absent = res.get('不在', 0); nocon = res.get('不通・番号不備', 0)
seg = [s for s in L['seg'] if s['called'] >= 20]
best = max(seg, key=lambda s: (s['reach_rate'], s['apo'])) if seg else None
worst = min(seg, key=lambda s: s['reach_rate']) if len(seg) > 1 else None
topng = next((k for k, _ in ng if k != 'その他'), '')
since_lbl = f"{jd(C['since_from'])}〜{jd(str(meet - datetime.timedelta(days=1)))}"

# ---------- 文章（story がなければルールで） ----------
def dflt_summary():
    if apo: return f'前回からの{C["work_days_since"]}日の稼働で{calls:,}件に架電し、<em class="hl">アポ{apo}件</em>。ご担当者との会話は{talk}件でした'
    return f'前回からの{C["work_days_since"]}日の稼働で{calls:,}件に架電。ご担当者との会話{talk}件を、<em class="hl">アポにつなげる</em>のが次の課題です'
issues = S.get('issues') or []
if not issues:
    if gate / rtot >= .25: issues.append(dict(t='受付での壁', body=f'架電結果の{pct(gate/rtot,0)}が受付でのお断りです。ご担当者に届く前に止まっています。'))
    if nocon / rtot >= .15: issues.append(dict(t='つながらない番号', body=f'{pct(nocon/rtot,0)}が不通・番号違いでした。リストの電話番号の質を上げる余地があります。'))
    if absent / rtot >= .15: issues.append(dict(t='ご担当者の不在', body=f'{pct(absent/rtot,0)}がご担当者不在でした。お電話する時間帯を見直します。'))
    if topng: issues.append(dict(t=f'お断りの理由で多いのは「{topng}」', body='断られ方に合わせて、冒頭のひと言と切り返しを用意します。'))
    if best and worst and best['reach_rate'] > worst['reach_rate'] * 1.5: issues.append(dict(t='リストによる差', body=f'「{best["k"]}」はご担当者まで届く率が{pct(best["reach_rate"],0)}、「{worst["k"]}」は{pct(worst["reach_rate"],0)}と差があります。'))
    issues = issues[:3] or [dict(t='大きな崩れはありません', body='今の進め方を続けながら、反応の良いリストに寄せていきます。')]
props = S.get('proposals') or []
if not props:
    if gate / rtot >= .25: props.append(dict(t='最初の20秒を組み替える', why='受付で用件が伝わる前に切られているため', kpi=f'受付NGの割合を{pct(gate/rtot,0)}から5ポイント下げる'))
    if best: props.append(dict(t=f'「{best["k"][:16]}」に寄せる', why=f'ご担当者まで届く率が{pct(best["reach_rate"],0)}と最も高いため', kpi='次の期間の架電の半分以上をこのリストに'))
    if absent / rtot >= .1: props.append(dict(t='時間帯を変えて不在を減らす', why=f'不在が{absent}件あるため', kpi='不在の割合を下げ、ご担当者との会話を増やす'))
    props.append(dict(t='資料送付先への追いかけ', why='資料をお送りした先は次の商談の候補のため', kpi='送付から5営業日後に再度お電話'))
    props = props[:3]
plan = S.get('plan') or ['冒頭トークの見直しを来週から全員で統一', '反応の良いリストから順に架電', '資料送付先には5営業日後に再度お電話']
asks = S.get('asks') or ['商談の結果（受注に近いか・見送りか）を共有シートの商談アポ管理表にご記入ください', '営業NGの企業があれば、営業NGリストに追記をお願いします']
NAVI = {'summary': '数字はすべて日次の架電報告と共有シートの記録から出しています。', 'trend': '月ごとに見ると、量と結果のどちらが動いたかが分かります。',
        'result': 'いちばん長い棒が、いま一番の壁です。', 'ng': '断られ方が分かると、直すべきなのがリストかトークかが分かります。',
        'list': 'ご担当者まで届く率が高いリストに寄せるのが近道です。', 'issue': '数字から見えた課題を3つに絞りました。',
        'proposal': 'それぞれに、次回の定例で確かめる目標を付けています。', 'next': 'お願い事項にご協力いただけると、改善が早く回ります。'}
NAVI.update(S.get('navi') or {})

# ---------- 部品 ----------
def bars(items, total, hi=None, fmt=lambda v, t: f'{v:,}件<small>{pct(v/t,0) if t else ""}</small>', note=None):
    mx = max([v for _, v in items] + [1])
    return '<div class="bars">' + ''.join(
        f'<div class="br{" hi" if k == hi else ""}"><span class="bl">{E(k)}{f"<small>{E(note.get(k,""))}</small>" if note else ""}</span><span class="bt"><i style="width:{v/mx*100:.1f}%"></i></span><span class="bv">{fmt(v, total)}</span></div>'
        for k, v in items) + '</div>'
def stat(lbl, v, sub=''): return f'<div class="st"><span class="sl">{E(lbl)}</span><b>{v}</b>{f"<small>{sub}</small>" if sub else ""}</div>'
def card(t, num, body): return f'<details class="panel card"><summary><h3>{t}</h3>{f"<span class=num>{num}</span>" if num else ""}</summary><div class="body">{body}</div></details>'
def tbl(rows, cols):
    return '<div class="tw"><table><thead><tr>' + ''.join(f'<th{" class=r" if r else ""}>{E(h)}</th>' for h, _, r in cols) + '</tr></thead><tbody>' + ''.join(
        '<tr>' + ''.join(f'<td{" class=r" if r else ""}>{f(x)}</td>' for _, f, r in cols) + '</tr>' for x in rows) + '</tbody></table></div>'
def sec(id, no, lab, title, body, sub=''):
    return f'<section class="slide" id="{id}" data-title="{E(lab)}"><div class="inner"><div class="sh"><span class="no">{no} ／ {id.upper()}</span><h2>{title}</h2>{f"<p>{sub}</p>" if sub else ""}</div>{body}</div></section>'

# ---------- 章 ----------
months = C['months']
mrows = [dict(m=f'{int(m[0][5:])}月', calls=m[1], talk=m[3], lead=m[4], apo=m[5]) for m in months]
slides = []
slides.append(f'''<section class="slide cover" id="cover"><div class="inner">
<span class="eyebrow">OUTBOUND CALL REPORT — {meet:%Y.%m.%d}</span><span class="client">{E(name)} 様　アウトバウンドコール支援</span>
<h1>{meet.month}月{meet.day}日 定例資料<br><span>架電の結果と、次の打ち手</span></h1>
<div class="meta"><span>対象期間<b>{since_lbl}（稼働{C["work_days_since"]}日）</b></span><span>累計<b>{jd(C["first"])}〜 架電{T[0]:,}件・アポ{T[4]}件</b></span><span>作成<b>{datetime.date.today():%Y年%-m月%-d日}　株式会社ライトアップ</b></span></div>
<a class="start" href="#summary">見る ↓</a><span class="hint">↓キー・スペースで次の章へ。右下のボタンで全画面にできます。</span></div></section>''')
slides.append(sec('summary', '01', 'サマリー', S.get('summary') or dflt_summary(),
    '<div class="stats">' + stat('架電', f'{calls:,}', f'累計 {T[0]:,}') + stat('ご担当者と会話', f'{talk:,}', f'架電の{pct(talk/calls) if calls else "—"}') +
    stat('資料送付など', f'{lead:,}', f'累計 {T[3]:,}') + stat('アポ', f'{apo:,}', f'累計 {T[4]:,}') + '</div>' +
    f'<p class="tip">期間：{since_lbl}。カードをクリックすると詳しい内容が開きます。</p>' +
    card('日ごとの記録', f'{C["work_days_since"]}日', tbl(C['recent_days'][::-1], [('日付', lambda r: jd(r[0]), 0), ('架電', lambda r: f'{r[1]:,}', 1), ('つながった', lambda r: f'{r[2]:,}', 1), ('ご担当者と会話', lambda r: r[3], 1), ('資料送付など', lambda r: r[4], 1), ('アポ', lambda r: r[5], 1)])) +
    card('数字の見方', '', '<p>「つながった」は受付を含めて電話がつながった件数、「ご担当者と会話」は採用・決裁のご担当者クラスと直接お話しできた件数です。出典：日次の架電報告。</p>')))
slides.append(sec('trend', '02', '推移', S.get('trend') or f'月ごとの推移。直近の月は架電{mrows[-1]["calls"]:,}件・<em class="hl">アポ{mrows[-1]["apo"]}件</em>' if mrows else '月ごとの推移',
    '<div class="two">' + '<div class="panel"><h3 class="h3s">架電数</h3>' + bars([(r['m'], r['calls']) for r in mrows], 0, hi=mrows[-1]['m'] if mrows else None, fmt=lambda v, t: f'{v:,}') + '</div>' +
    '<div class="panel"><h3 class="h3s">アポ</h3>' + bars([(r['m'], r['apo']) for r in mrows], 0, hi=mrows[-1]['m'] if mrows else None, fmt=lambda v, t: f'{v}件') + '</div></div>' +
    card('月ごとの表', '', tbl(mrows, [('月', lambda r: r['m'], 0), ('架電', lambda r: f'{r["calls"]:,}', 1), ('ご担当者と会話', lambda r: r['talk'], 1), ('会話率', lambda r: pct(r['talk']/r['calls']) if r['calls'] else '—', 1), ('資料送付など', lambda r: r['lead'], 1), ('アポ', lambda r: r['apo'], 1), ('アポ率', lambda r: pct(r['apo']/r['calls'], 2) if r['calls'] else '—', 1)]))))
ritems = [(k, res[k]) for k in order if res.get(k)]
hik = max(['受付NG', '不在', '不通・番号不備'], key=lambda k: res.get(k, 0))
slides.append(sec('result', '03', '架電結果', S.get('result') or f'架電結果のうち<em class="hl">「{hik}」が{pct(res.get(hik,0)/rtot,0)}</em>。ここが一番の壁です',
    bars(ritems, rtot, hi=hik, note=RES_NOTE) + f'<p class="tip">共有シートの架電記録 {rtot:,}件（{L["period_basis"]}）。</p>' +
    card('ご担当者まで届いた割合', pct(reach/rtot, 1), f'<p>ご担当者と話せた（担当者NG・資料送付・アポ）のは{reach:,}件、架電記録の{pct(reach/rtot,1)}です。届いた先のうちアポは{res.get("アポ",0)}件（{pct(res.get("アポ",0)/reach,1) if reach else "—"}）。</p>')))
slides.append(sec('ng', '04', 'お断りの理由', S.get('ng') or (f'お断りでいちばん多いのは<em class="hl">「{topng}」</em>' if topng else 'お断りの理由'),
    bars([(k if k != 'その他' else 'その他（個別の理由）', v) for k, v in ng[:8]], ngtot, hi=topng) +
    f'<p class="tip">受付NG・担当者NG {ngtot:,}件のメモを分類しました。</p>' +
    card('受付と、ご担当者で分けて見る', '', '<div class="two"><div><h4>受付で</h4>' + bars(L['ng_gate'][:6], sum(v for _, v in L['ng_gate']) or 1) + '</div><div><h4>ご担当者と話して</h4>' + bars(L['ng_talk'][:6], sum(v for _, v in L['ng_talk']) or 1) + '</div></div>')))
segcols = [('リスト', lambda r: E(r['k']), 0), ('架電した先', lambda r: f'{r["called"]:,}', 1), ('ご担当者まで', lambda r: pct(r['reach_rate'], 0), 1), ('アポ', lambda r: r['apo'], 1), ('残り', lambda r: f'{r["left"]:,}', 1)]
slides.append(sec('list', '05', 'リスト別', S.get('list') or (f'ご担当者まで届く率が高いのは<em class="hl">「{E(best["k"][:20])}」{pct(best["reach_rate"],0)}</em>' if best else 'リスト別の反応'),
    (bars([(s['k'][:22], round(s['reach_rate'] * 1000)) for s in seg[:7]], 0, hi=best['k'][:22] if best else None, fmt=lambda v, t: f'{v/10:.0f}%') if seg else '') +
    f'<p class="tip">棒＝架電した先のうち、ご担当者まで届いた割合。リスト全体 {L["companies"]:,}社のうち架電済み {L["called"]:,}社・残り {L["left"]:,}社。</p>' +
    card('リストごとの表（残りの件数つき）', f'{len(L["seg"])}本', tbl(L['seg'], segcols)) +
    card('会社の規模別', '', tbl(L['size'], [('規模', lambda r: E(r['k']), 0)] + segcols[1:])) +
    card('地域別（上位）', '', tbl(L['pref'][:8], [('地域', lambda r: E(r['k']), 0)] + segcols[1:]))))
slides.append(sec('issue', '06', '課題', S.get('issue_title') or '数字から見えた課題',
    '<div class="cards">' + ''.join(card(E(x['t']), '', f'<p>{x["body"]}</p>') for x in issues) + '</div><p class="tip">カードをクリックすると中身が開きます。</p>'))
slides.append(sec('proposal', '07', 'ご提案', S.get('proposal_title') or f'次回までに<em class="hl">{len(props)}つ</em>を変えます',
    '<div class="cards">' + ''.join(card(f'{i+1}. {E(p["t"])}', '', f'<p><b>なぜ</b>{p.get("why","")}</p><p><b>目標</b>{p.get("kpi","")}</p>') for i, p in enumerate(props)) + '</div>'))
slides.append(sec('next', '08', '進め方', '次の定例までの進め方と、お願いしたいこと',
    '<div class="two"><div class="panel"><h3 class="h3s">ライトアップが進めること</h3><ol>' + ''.join(f'<li>{x}</li>' for x in plan) + '</ol></div>' +
    '<div class="panel"><h3 class="h3s">お願いしたいこと</h3><ol>' + ''.join(f'<li>{x}</li>' for x in asks) + '</ol></div></div>' +
    '<p style="margin-top:18px"><button type="button" class="more-all" id="openall">すべての詳細を開く</button> <a class="back" id="toPortal" href="#">ポータルに戻る</a></p>' +
    f'<p class="src">出典：日次の架電報告（{jd(C["first"])}〜{jd(C["last"])}）・共有シートの架電記録（{jd(L["first"])}〜{jd(L["last"])}）。他のお客様の社名は記載していません。</p>'))

av = open(a.avatar).read().strip() if a.avatar else ''
who = f'<img src="{av}" alt="" width="44" height="44">' if av else f'<span class="ini">{E((a.director or "担")[0])}</span>'
SAY = {k: [v, []] for k, v in NAVI.items()}
CSS = r'''
:root{--bg:#f4f2ec;--card:#fbfaf6;--ink:#15171b;--mute:#6b6a65;--line:#dcd8cc;--line2:#ebe8df;--accent:#d9481f;--accent-ink:#b23a17;--accent-soft:#fbe7de;--good:#1f7a55;--cover:#16181c;--navi-w:250px;--font:"Noto Sans JP","Hiragino Sans","Yu Gothic",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#17191d;--card:#202328;--ink:#eceae4;--mute:#a19f98;--line:#3a3d44;--line2:#2b2e34;--accent-ink:#ff8a63;--accent-soft:#3a2219}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font);line-height:1.7}
html{scroll-snap-type:y proximity;scroll-behavior:smooth}
.slide{min-height:100vh;min-height:100dvh;scroll-snap-align:start;display:flex;align-items:center;border-bottom:1px solid var(--line)}
.inner{width:100%;max-width:1180px;margin:0 auto;padding-block:56px 72px;padding-left:max(24px,env(safe-area-inset-left,0px));padding-right:calc(var(--navi-w) + 56px)}
@media (max-width:1020px){.inner{padding-right:max(20px,env(safe-area-inset-right,0px));padding-left:max(20px,env(safe-area-inset-left,0px));padding-block:40px 200px}}
.cover{background:var(--cover);color:#f4f2ec}.cover .inner{padding-right:56px}.cover .eyebrow{font-family:var(--mono);color:var(--accent);font-size:13px;letter-spacing:.06em}
.cover .client{display:block;margin-top:10px;color:#cfccc4}.cover h1{font-size:clamp(2rem,6vw,3.6rem);line-height:1.25;margin:16px 0 22px;font-weight:900}.cover h1 span{font-size:.5em;color:#cfccc4;font-weight:700}
.cover .meta{display:grid;gap:6px;color:#a7a59f;font-size:14px}.cover .meta b{color:#f4f2ec;margin-left:10px}
.cover .start{display:inline-block;margin-top:26px;background:var(--accent);color:#fff;text-decoration:none;font-weight:800;padding:12px 24px;border-radius:999px}.cover .hint{display:block;margin-top:12px;font-size:12px;color:#8c8a84}
.sh .no{font-family:var(--mono);color:var(--accent-ink);font-size:13px;letter-spacing:.06em}.sh h2{font-size:clamp(1.4rem,3.2vw,2.2rem);line-height:1.45;margin:6px 0 10px;font-weight:900}.sh p{color:var(--mute);margin:0 0 14px}
em.hl{font-style:normal;color:var(--accent-ink);background:linear-gradient(transparent 62%,var(--accent-soft) 0)}
.panel{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;min-width:0}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:10px 0 16px}.st{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.st .sl{font-size:12px;color:var(--mute);font-weight:700}.st b{display:block;font-family:var(--mono);font-size:clamp(1.8rem,4vw,2.6rem);line-height:1.2}.st small{color:var(--mute);font-size:12px}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:14px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:12px}
.h3s{font-size:14px;margin:0 0 10px}h4{font-size:13px;margin:4px 0 8px}
.bars{display:grid;gap:8px;margin:8px 0}.br{display:grid;grid-template-columns:minmax(110px,190px) 1fr 92px;gap:10px;align-items:center;font-size:13.5px}
.bl small{display:block;color:var(--mute);font-size:11px}.bt{height:14px;background:var(--line2);border-radius:7px;overflow:hidden}.bt i{display:block;height:100%;background:#9a978e;border-radius:7px}
.br.hi .bt i{background:var(--accent)}.br.hi .bl{font-weight:800}.bv{font-family:var(--mono);font-size:13px;text-align:right}.bv small{display:block;color:var(--mute);font-size:11px}
@media (max-width:600px){.br{grid-template-columns:92px 1fr 70px}}
.tip{font-size:12.5px;color:var(--mute);margin:8px 0 12px}.src{font-size:12px;color:var(--mute)}
.tw{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:7px 8px;border-bottom:1px solid var(--line2);text-align:left;white-space:nowrap}th{color:var(--mute);font-weight:700;font-size:12px}.r{text-align:right;font-family:var(--mono)}
details>summary{list-style:none;cursor:pointer}details>summary::-webkit-details-marker{display:none}
details.card{display:block;margin-top:10px}details.card>summary{display:grid;gap:4px;position:relative;padding-right:34px}details.card>summary h3{margin:0;font-size:15px}
details.card>summary .num{font-family:var(--mono);font-size:1.4rem;color:var(--accent-ink)}
details.card>summary::after{content:"＋";position:absolute;right:0;top:0;width:26px;height:26px;border-radius:50%;background:var(--accent-soft);color:var(--accent-ink);display:grid;place-items:center}
details.card[open]>summary::after{content:"−"}details.card .body{margin-top:10px;font-size:14px}details.card .body p b{display:block;font-size:12px;color:var(--mute)}
ol{margin:0;padding-left:20px}li{margin:4px 0}
.more-all,.back{font:inherit;font-weight:700;font-size:13px;padding:8px 16px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;text-decoration:none;display:inline-block}
.ctl{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:40;display:flex;gap:6px;align-items:center;background:var(--ink);color:var(--bg);border-radius:999px;padding:5px}
.ctl button{border:0;background:transparent;color:var(--bg);width:38px;height:38px;border-radius:50%;font-size:16px;cursor:pointer}.ctl .nx{background:var(--accent);color:#fff}.ctl button:disabled{opacity:.3}.ctl .pg{font-family:var(--mono);font-size:12px;padding:0 4px}
.dots{position:fixed;left:max(10px,env(safe-area-inset-left,0px));top:50%;transform:translateY(-50%);display:grid;gap:8px;z-index:30}.dots a{width:8px;height:8px;border-radius:50%;background:var(--line);display:block}.dots a.on{background:var(--accent);height:22px;border-radius:4px}
@media (max-width:1020px){.dots{display:none}}
aside.navi{position:fixed;right:max(24px,env(safe-area-inset-right,0px));top:50%;transform:translateY(-50%);width:var(--navi-w);z-index:30;transition:opacity .2s}
.cover-on aside.navi{opacity:0;pointer-events:none}.nv{padding:12px 14px}.who{display:flex;gap:10px;align-items:center}.who img,.who .ini{width:44px;height:44px;border-radius:50%;object-fit:cover;flex:none}.who .ini{display:grid;place-items:center;background:var(--line2);font-weight:900}
.who b{font-size:13px;display:block}.who small{font-size:11px;color:var(--mute)}.tg{margin-left:auto;font:inherit;font-size:11px;border:1px solid var(--line);background:none;border-radius:999px;padding:2px 8px;color:var(--ink);cursor:pointer;display:none}
.bubble{margin:10px 0 0;font-size:13px;line-height:1.65;background:var(--accent-soft);border-radius:10px;padding:8px 10px}
@media (max-width:1020px){aside.navi{top:auto;transform:none;left:12px;right:12px;bottom:calc(68px + env(safe-area-inset-bottom,0px));width:auto}.tg{display:inline-block}
 .bubble{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.nv.open .bubble{display:block}}
@media print{html{scroll-snap-type:none}.ctl,.dots,aside.navi,.tip,.cover .start,.cover .hint,.more-all,.back{display:none!important}.slide{min-height:auto;break-after:page;border:0}.inner{padding:24px 12px!important}.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
'''
JS = r'''
const slides=[...document.querySelectorAll(".slide")],dots=document.getElementById("dots"),pg=document.getElementById("pg"),prev=document.getElementById("prev"),next=document.getElementById("next");
dots.innerHTML=slides.map(s=>`<a href="#${s.id}" title="${s.dataset.title||"表紙"}" aria-label="${s.dataset.title||"表紙"}"></a>`).join("");
let cur=-1;
function setCur(i){if(i===cur)return;cur=i;const id=slides[i].id;pg.textContent=`${i+1}/${slides.length}`;prev.disabled=i===0;next.disabled=i===slides.length-1;
 [...dots.children].forEach((d,j)=>d.classList.toggle("on",j===i));document.body.classList.toggle("cover-on",id==="cover");if(SAY[id])say.textContent=SAY[id][0]}
function onScroll(){let b=0;slides.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.45)b=i});setCur(b)}
addEventListener("scroll",onScroll,{passive:true});onScroll();
const go=i=>{const s=slides[Math.max(0,Math.min(slides.length-1,i))];window.scrollTo({top:s.offsetTop,behavior:"smooth"})};document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{const t=document.getElementById(a.getAttribute("href").slice(1));if(t&&t.classList.contains("slide")){e.preventDefault();window.scrollTo({top:t.offsetTop,behavior:"smooth"})}}));dots.addEventListener("click",e=>{const a=e.target.closest("a");if(!a)return;e.preventDefault();const t=document.getElementById(a.getAttribute("href").slice(1));window.scrollTo({top:t.offsetTop,behavior:"smooth"})});
next.onclick=()=>go(cur+1);prev.onclick=()=>go(cur-1);
addEventListener("keydown",e=>{if(e.target.closest("input,textarea,select"))return;
 if(["ArrowDown","PageDown"].includes(e.key)||(e.key===" "&&!e.shiftKey)){e.preventDefault();go(cur+1)}
 else if(["ArrowUp","PageUp"].includes(e.key)||(e.key===" "&&e.shiftKey)){e.preventDefault();go(cur-1)}
 else if(e.key==="Home")go(0);else if(e.key==="End")go(slides.length-1);else if(e.key.toLowerCase()==="f")toggleFs()});
async function toggleFs(){try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch(_){}}
document.getElementById("fs").onclick=toggleFs;
const openAll=(v=true)=>document.querySelectorAll("details").forEach(d=>d.open=v);
document.getElementById("openall").onclick=()=>openAll(true);addEventListener("beforeprint",()=>openAll(true));
document.getElementById("tg").onclick=()=>document.getElementById("nv").classList.toggle("open");
document.getElementById("toPortal").onclick=e=>{e.preventDefault();if(parent!==window)parent.postMessage({type:"show-portal"},"*");else history.back()};
'''
page = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex">
<title>{E(short)}様 {meet.month}月{meet.day}日 定例資料</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>{CSS}</style></head><body class="cover-on">
{"".join(slides)}
<nav class="dots" id="dots" aria-label="章"></nav>
<div class="ctl"><button id="prev" aria-label="前の章へ">↑</button><span class="pg" id="pg">1/{len(slides)}</span><button id="next" class="nx" aria-label="次の章へ">↓</button><button id="fs" aria-label="全画面で表示">⛶</button></div>
<aside class="navi"><div class="nv panel" id="nv"><div class="who">{who}<div><b>担当ディレクター {E(a.director or "")}</b><small>章に合わせてご説明します</small></div><button class="tg" id="tg" type="button">全文</button></div><p class="bubble" id="say" aria-live="polite"></p></div></aside>
<script>const SAY={json.dumps(SAY, ensure_ascii=False)};const say=document.getElementById("say");{JS}</script>
</body></html>'''
open(a.out, 'w').write(page)
print('wrote', a.out, len(page), 'slides', len(slides))
