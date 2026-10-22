"""顧客ポータル（暗号化済み index.html）に定例資料を入れる／更新する。
使い方: python3 embed.py <portal/c/SIS/index.html> <パスワード> <deck.html> <YYYY-MM-DD> [--label "10月23日 定例資料"] [--keep 6]
・本文を復号し、「定例資料」タブ（初回のみ追加）と資料データ（<script id="teirei-data">）を更新して、同じパスワードで暗号化し直す。
・同じ日付の資料があれば差し替え、新しい順に最大 keep 件を残す。
"""
import argparse, base64, hashlib, json, os, re, html
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ap = argparse.ArgumentParser(); ap.add_argument('page'); ap.add_argument('pw'); ap.add_argument('deck'); ap.add_argument('date')
ap.add_argument('--label', default=''); ap.add_argument('--keep', type=int, default=6)
a = ap.parse_args()
page = open(a.page, encoding='utf8').read()
m = re.search(r'const P=(\{"s": "[^"]+", "i": "[^"]+", "n": \d+, "c": "[^"]+"\})', page)
if not m: raise SystemExit('暗号データが見つかりません')
P = json.loads(m.group(1)); d = lambda s: base64.b64decode(s)
key = hashlib.pbkdf2_hmac('sha256', a.pw.encode(), d(P['s']), P['n'], 32)
body = AESGCM(key).decrypt(d(P['i']), d(P['c']), None).decode('utf8')

UI_MARK = '<!--TEIREI-UI-->'
UI = UI_MARK + r'''
<div id="v-teirei" hidden style="background:var(--bg,#f4f2ec);color:var(--tx,#15171b)"><div class="wrap tvbar" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding-top:12px;padding-bottom:10px">
 <label for="tsel" style="font-weight:700;font-size:13px">定例</label><select id="tsel" style="font:inherit;padding:7px 10px;border-radius:8px;border:1px solid var(--line,#ccc);background:var(--card,#fff);color:inherit;max-width:100%"></select>
 <button type="button" id="tfs2" style="font:inherit;font-weight:700;font-size:13px;padding:7px 14px;border-radius:999px;border:0;background:var(--accent,#d9481f);color:#fff;cursor:pointer">全画面で表示</button>
 <button type="button" id="tback" style="font:inherit;font-size:13px;padding:7px 14px;border-radius:999px;border:1px solid var(--line,#ccc);background:none;color:inherit;cursor:pointer">ポータルに戻る</button>
 <small style="flex-basis:100%;opacity:.7">資料は ↓キー・スペースで次の章へ進めます。</small></div>
 <iframe id="tframe" title="定例資料" allow="fullscreen" allowfullscreen style="display:block;width:100%;border:0;height:calc(100dvh - 150px);background:#f4f2ec"></iframe></div>
<script>
(()=>{const TD=JSON.parse((document.getElementById("teirei-data")||{}).value||"[]");if(!TD.length)return;
const tabs=document.querySelector(".bar .tabs");if(tabs&&!tabs.querySelector('[data-tab="teirei"]')){const b=document.createElement("button");b.type="button";b.setAttribute("role","tab");b.dataset.tab="teirei";b.setAttribute("aria-selected","false");b.textContent="定例資料";tabs.appendChild(b)}
const vp=document.getElementById("v-portal"),vt=document.getElementById("v-teirei"),sel=document.getElementById("tsel"),fr=document.getElementById("tframe");
sel.innerHTML=TD.map((t,i)=>`<option value="${i}">${t.label}</option>`).join("");
const load=i=>{fr.srcdoc=TD[i].html};let loaded=false;
function show(t){const on=t==="teirei";vt.hidden=!on;if(vp)vp.hidden=on;document.querySelectorAll('.bar [data-tab]').forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===(on?"teirei":"portal"))));if(on&&!loaded){load(0);loaded=true}scrollTo(0,0)}
document.addEventListener("click",e=>{const b=e.target.closest('.bar [data-tab]');if(b){e.preventDefault();e.stopImmediatePropagation();show(b.dataset.tab)}
 const l=e.target.closest('a[href="#teirei"]');if(l){e.preventDefault();show("teirei")}},true);
sel.onchange=()=>load(+sel.value);document.getElementById("tback").onclick=()=>show("portal");
document.getElementById("tfs2").onclick=()=>{try{fr.requestFullscreen()}catch(_){}};
addEventListener("message",e=>{if(e.data&&e.data.type==="show-portal")show("portal")});
if(vp&&!document.getElementById("tnew")){const w=document.createElement("div");w.className="wrap";w.style.cssText="padding-top:12px";w.innerHTML='<a id="tnew" href="#teirei" style="display:inline-flex;gap:8px;align-items:center;padding:9px 16px;border-radius:999px;background:var(--accent,#d9481f);color:#fff;font-weight:800;text-decoration:none;font-size:14px"><span style="background:#fff;color:var(--accent,#d9481f);border-radius:999px;padding:0 7px;font-size:11px">NEW</span>'+TD[0].label+'を見る</a>';vp.prepend(w)}
if(location.hash==="#teirei")show("teirei")})();
</script>'''
dm = re.search(r'<textarea id="teirei-data" hidden>(.*?)</textarea>', body, re.S)
decks = json.loads(html.unescape(dm.group(1))) if dm else []
deck_html = open(a.deck, encoding='utf8').read()
label = a.label or f'{int(a.date[5:7])}月{int(a.date[8:10])}日 定例資料'
decks = [x for x in decks if x.get('date') != a.date] + [dict(date=a.date, label=label, html=deck_html)]
decks = sorted(decks, key=lambda x: x['date'], reverse=True)[:a.keep]
blob = '<textarea id="teirei-data" hidden>' + html.escape(json.dumps(decks, ensure_ascii=False), quote=False) + '</textarea>'
if dm: body = body[:dm.start()] + blob + body[dm.end():]
else: body = body + '\n' + blob
if UI_MARK not in body: body = body + '\n' + UI
else:
    i = body.index(UI_MARK); j = body.index('</script>', i) + 9; body = body[:i] + UI + body[j:]
salt, iv = os.urandom(16), os.urandom(12)
key = hashlib.pbkdf2_hmac('sha256', a.pw.encode(), salt, P['n'], 32)
b = lambda x: base64.b64encode(x).decode()
NP = json.dumps({"s": b(salt), "i": b(iv), "n": P['n'], "c": b(AESGCM(key).encrypt(iv, body.encode('utf8'), None))})
page = page[:m.start(1)] + NP + page[m.end(1):]
open(a.page, 'w', encoding='utf8').write(page)
print('updated', a.page, 'decks', [x['date'] for x in decks], 'size', len(page))
