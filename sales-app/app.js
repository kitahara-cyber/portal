/* セルコン 見込みボード（Apps Script版）— このファイルは build.py で作る。元：sales-app/src/index.html */
(function(){
  var f=document.createElement('link'); f.rel='stylesheet'; f.href='https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap'; document.head.appendChild(f);
  var st=document.createElement('style'); st.textContent="\n:root{--bg:#F4F5F7;--ink:#1A1D21;--sub:#5B616B;--line:#E3E6EB;--blue:#1F4FC4;--red:#B42318;--amber:#A15C00;--green:#11613A}\n*{box-sizing:border-box}\nbody{margin:0;background:var(--bg);color:var(--ink);font-family:'Noto Sans JP',system-ui,sans-serif}\n.layout{display:flex;flex-wrap:wrap;min-height:100vh}\nnav.side{flex:1 1 210px;max-width:250px;background:#fff;border-right:1px solid var(--line);padding:20px 14px;display:flex;flex-direction:column;gap:3px}\n@media(max-width:820px){nav.side{max-width:none;border-right:0;border-bottom:1px solid var(--line)}}\n.brand{font-weight:700;font-size:16px;padding:4px 12px 2px}\n.src{font-size:11.5px;color:var(--sub);padding:0 12px 12px;line-height:1.5}\n.navgroup{font-size:11.5px;color:var(--sub);padding:12px 12px 4px}\n.navbtn{display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;padding:9px 12px;border-radius:8px;border:0;background:none;font:inherit;font-size:14px;color:#3A3F47;cursor:pointer;min-height:38px}\n.navbtn:hover{background:#E9ECF1;color:var(--ink)}\n.navbtn.on{background:#E8EEFB;color:var(--blue);font-weight:700}\n.badge{background:var(--red);color:#fff;border-radius:999px;font-size:11px;padding:1px 7px;font-weight:700}\n.badge.gray{background:#E1E4EA;color:#3A3F47}\nmain{flex:999 1 560px;min-width:0;padding:28px 32px}\n@media(max-width:600px){main{padding:20px 16px}}\n.wrap{max-width:1100px;display:flex;flex-direction:column;gap:18px}\nh1{margin:4px 0 0;font-size:24px}\n.eyebrow{font-size:13px;color:var(--sub)}\n.head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap}\n.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}\n.btn{font:inherit;font-size:13px;padding:8px 14px;min-height:36px;border-radius:8px;border:1px solid #CBD1DA;background:#fff;color:var(--ink);cursor:pointer}\n.btn:hover{border-color:#8E97A4}\n.btn.p{background:var(--blue);border-color:var(--blue);color:#fff}\n.btn.p:hover{background:#163A94}\n.btn.on{background:#E8EEFB;border-color:var(--blue);color:var(--blue);font-weight:700}\n.btn.sm{font-size:12px;padding:5px 10px;min-height:32px}\n.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}\n.kpis.k6{grid-template-columns:repeat(6,minmax(0,1fr))}\n@media(max-width:900px){.kpis.k6{grid-template-columns:repeat(3,minmax(0,1fr))}}\n@media(max-width:700px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.kpi{background:#fff;border:1px solid var(--line);border-radius:10px;padding:14px 16px}\n.k{font-size:12px;color:var(--sub)}\n.v{font-size:26px;font-weight:700}\n.sec{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}\n.sec.warn{background:#FFF8EC;border-color:#F1D9A8}\n.sec.alert{background:#FEF3F2;border-color:#F4C7C2}\n.sec-h{padding:14px 18px}\n.sec-h h2{margin:0;font-size:15px}\n.sec-h p{margin:4px 0 0;font-size:13px;color:var(--sub);line-height:1.6}\n.row{display:flex;align-items:center;gap:12px;padding:13px 18px;border-top:1px solid #ECEEF2;flex-wrap:wrap}\n.warn .row{border-top-color:#F1D9A8}.alert .row{border-top-color:#F4C7C2}\n.rk{display:inline-flex;min-width:28px;height:28px;padding:0 7px;border-radius:6px;align-items:center;justify-content:center;font-weight:700;font-size:12.5px;flex:none;white-space:nowrap}\n.rA{background:#FDE7D2;color:#8A3B00}.rB{background:#DCE6FB;color:#163A94}.rC{background:#ECEEF2;color:#3A3F47}\n.r長期,.rネタ,.r未設定{background:#F1ECF9;color:#4B2C86}.r受注{background:#D9F2E3;color:var(--green)}.r失注{background:#ECEEF2;color:#5B616B}\n.link{background:none;border:0;padding:0;font:inherit;color:var(--blue);font-weight:700;cursor:pointer;text-align:left}\n.link:hover{text-decoration:underline}\n.grow{flex:1 1 260px;min-width:0}\n.na{font-size:13px;color:#3A3F47;margin-top:2px;line-height:1.5}\n.small{font-size:12px;color:var(--sub)}\n.red{color:var(--red);font-weight:700}.amber{color:var(--amber);font-weight:700}.green{color:var(--green);font-weight:700}\n.field{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--sub)}\ninput[type=text],input[type=date],input[type=number],select{font:inherit;font-size:14px;color:var(--ink);padding:8px 10px;border:1px solid #CBD1DA;border-radius:8px;background:#fff;min-height:38px}\ninput[type=number]{width:96px}\ninput:focus,select:focus,button:focus-visible,textarea:focus{outline:2px solid var(--blue);outline-offset:1px}\n.empty{padding:18px;font-size:13px;color:var(--sub);border-top:1px solid #ECEEF2}\n.scroll{overflow-x:auto}\n.cols{display:grid;grid-template-columns:repeat(4,minmax(240px,1fr));gap:14px;min-width:1000px}\n.col{border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:10px;min-height:240px}\n.col.over{outline:2px dashed var(--blue);outline-offset:-2px}\n.colA{background:#FBF3EA}.colB{background:#EEF2FB}.colC{background:#F0F1F4}.colother{background:#F6F2FB}\n.col-h{display:flex;align-items:center;gap:8px;padding:2px 4px}\n.col-h h2{margin:0;font-size:14px}\n.card{display:block;width:100%;text-align:left;font:inherit;background:#fff;border:1px solid var(--line);border-radius:10px;padding:11px 13px;cursor:grab;color:var(--ink)}\n.card:hover{border-color:var(--blue)}\n.card.blank{border:1.5px dashed #D99A2B;background:#FFF8EC}\n.meta{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--sub);margin-top:8px}\n.box{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px}\n.box h2{margin:0 0 12px;font-size:15px}\n.box.main{border:2px solid var(--blue)}\n.ev{display:flex;gap:12px;padding:10px 0;border-top:1px solid #ECEEF2;font-size:13px;line-height:1.6}\n.ev .d{flex:none;width:48px;color:var(--sub)}\ntable{border-collapse:collapse;width:100%}\nth,td{text-align:left;padding:9px 12px;border-top:1px solid #ECEEF2;font-size:13px;white-space:nowrap}\nth{font-weight:500;color:var(--sub);border-top:0}\ntd.n,th.n{text-align:right;font-variant-numeric:tabular-nums}\ntr.today td{background:#F4F7FE;font-weight:700}\ndl.facts{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:0;font-size:13px}\ndl.facts dt{color:var(--sub)}dl.facts dd{margin:0}\n.bar{display:flex;height:10px;border-radius:999px;overflow:hidden;background:#ECEEF2;min-width:120px}\n.bar span{display:block;height:100%}\n.b-att{background:#2E8B57}.b-abs{background:#B8BEC8}.b-unk{background:#E5A43A}\n.legend{display:flex;gap:14px;font-size:12px;color:var(--sub);flex-wrap:wrap}\n.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}\n#toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);background:#1A1D21;color:#fff;padding:12px 18px;border-radius:10px;font-size:14px;opacity:0;pointer-events:none;transition:.2s;max-width:90vw;z-index:20;line-height:1.5}\n#toast.show{opacity:1;transform:translate(-50%,0)}\n.modal-bg{position:fixed;inset:0;background:rgba(20,22,26,.45);display:flex;align-items:center;justify-content:center;padding:16px;z-index:10}\n.modal{background:#fff;border-radius:14px;padding:22px;width:min(560px,100%);display:flex;flex-direction:column;gap:14px;max-height:92vh;overflow:auto}\n.modal h2{margin:0;font-size:18px}\n.demo{font-size:12px;color:var(--sub);background:#F7F8FA;border:1px dashed #CBD1DA;border-radius:8px;padding:8px 10px;margin:8px 4px 0;line-height:1.5}\n.split{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start}\n.two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}\n.three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}\n@media(max-width:900px){.three{grid-template-columns:1fr}}\n@media(max-width:700px){.two{grid-template-columns:1fr}}\n.mini{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}\n.mini .v{font-size:22px}\n.tag{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:#ECEEF2;color:#3A3F47;white-space:nowrap}\n.tag.mail{background:#DCE6FB;color:#163A94}.tag.sheet{background:#D9F2E3;color:var(--green)}\ntextarea{font:inherit;font-size:14px;color:var(--ink);padding:10px;border:1px solid #CBD1DA;border-radius:8px;width:100%;min-height:200px;line-height:1.7;resize:vertical}\n.ck{display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer}\n.ck input{width:18px;height:18px;accent-color:var(--blue)}\n"; document.head.appendChild(st);
  var l=document.getElementById('gas-loading'); if(l) l.remove();
  var wrap=document.createElement('div'); wrap.innerHTML="\n<div id=\"app\"></div>\n<div id=\"toast\" role=\"status\" aria-live=\"polite\"></div>\n"; while(wrap.firstChild) document.body.appendChild(wrap.firstChild);
})();

// セルコン 見込みボード（本番）— データは毎回 google.script.run.api({op:'all'}) でスプシから読む
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/';
const COLS = [
  { key: 'A', label: 'Aヨミ', ranks: ['A'] }, { key: 'B', label: 'Bヨミ', ranks: ['B'] }, { key: 'C', label: 'Cヨミ', ranks: ['C'] },
  { key: 'other', label: '長期・ネタ・未設定', ranks: ['長期', 'ネタ', '未設定'] },
];
const YOMI = [['Aヨミ', 'A'], ['Bヨミ', 'B'], ['Cヨミ', 'C'], ['長期ヨミ', '長期'], ['ネタ', 'ネタ'], ['受注', '受注'], ['失注', '失注']];
let DATA = null, TODAY = '';
const S = { view: (window.__GAS && window.__GAS.view) || 'today', prev: 'today', detail: null, ownerFilter: 'me', onlyOverdue: false, onlyBlank: false,
  editDue: null, mail: null, copy: null, apoFor: null, semFilter: 'recent', busy: false, loading: true, error: '', viewAs: null };

// ───── サーバーとのやりとり ─────
function api(req) {
  return new Promise((ok, ng) => {
    if (!(window.google && google.script && google.script.run)) return ng(new Error('このページは Google のボード（Apps Script）から開いてください'));
    google.script.run.withSuccessHandler(ok).withFailureHandler(ng).api(req);
  });
}
async function reload(quiet) {
  if (!quiet) { S.loading = true; render(); }
  try { DATA = await api({ op: 'all' }); TODAY = DATA.today; S.error = ''; }
  catch (e) { S.error = String(e && e.message || e); }
  S.loading = false; render();
}
async function act(req, okMsg, after) {
  if (S.busy) return;
  S.busy = true; toast('保存しています…', true);
  try { const r = await api(req); if (after) after(r); await reload(true); toast(typeof okMsg === 'function' ? okMsg(r) : okMsg); }
  catch (e) { toast('保存できませんでした：' + String(e && e.message || e).replace(/^Error: /, '')); }
  S.busy = false;
}

// ───── 小道具 ─────
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const md = d => { if (!d) return ''; const p = d.slice(0, 10).split('-'); return `${+p[1]}/${+p[2]}`; };
const pad = n => String(n).padStart(2, '0');
const ymd = t => `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
function addDays(d, n) { const t = new Date(d + 'T00:00:00'); t.setDate(t.getDate() + n); return ymd(t); }
function addBiz(d, n) { const t = new Date(d + 'T00:00:00'); let k = 0; while (k < n) { t.setDate(t.getDate() + 1); const w = t.getDay(); if (w !== 0 && w !== 6) k++; } return ymd(t); }
const wd = d => '日月火水木金土'[new Date(d.slice(0, 10) + 'T00:00:00').getDay()];
const daysSince = d => Math.round((new Date(TODAY + 'T00:00:00') - new Date(d + 'T00:00:00')) / 864e5);
const isOpen = d => !['受注', '失注'].includes(d.rank);
const dueState = d => !d.na ? 'blank' : !d.due ? 'none' : d.due < TODAY ? 'over' : d.due === TODAY ? 'today' : 'later';
const find = id => DATA.deals.find(x => x.id === id);
const me = () => DATA.me;
// 誰の画面として見るか。メンバーは自分。管理者・開発者は切り替えられ、空なら全員分
const who = () => (me().admin && S.viewAs !== null) ? S.viewAs : me().name;
const mineOf = d => who() ? d.owner === who() : true;
const rk = (r, label) => `<span class="rk r${esc(r)}">${esc(label || r)}</span>`;
const pct = (a, b) => b ? (a / b * 100).toFixed(1) + '%' : '—';
const sum = a => a.reduce((x, y) => x + y, 0);
function dueHtml(d) { const s = dueState(d); if (s === 'over') return `<span class="red">${md(d.due)} 期限切れ</span>`; if (s === 'today') return '<span class="amber">今日</span>'; if (s === 'none') return '<span class="small">期限なし</span>'; return `<span>${md(d.due)}</span>`; }
let toastTimer;
function toast(msg, stay) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); if (!stay) toastTimer = setTimeout(() => t.classList.remove('show'), 3600); }
function actOn(d) { const a = DATA.act[d] || {}; const t = [0, 0, 0, 0]; Object.values(a).forEach(v => v.forEach((x, i) => t[i] += x)); return t; }
const appsOn = d => sum(Object.values(DATA.daily[d] || {}));
const attendOn = d => sum(DATA.seminars.filter(s => s.at.slice(0, 10) === d).map(s => s.attend));
const apoOn = d => sum(Object.values(DATA.apo[d] || {}));

// ───── 画面 ─────
function nav() {
  const fN = DATA.follow.length + DATA.maekaku.length;
  const item = (v, label, extra = '') => `<button type="button" class="navbtn ${S.view === v || (v === 'board' && S.view === 'detail') ? 'on' : ''}" data-act="nav" data-v="${v}">${label}${extra}</button>`;
  return `<nav class="side" aria-label="メニュー">
    <div class="brand">セルコン 見込みボード</div>
    <div class="src">スプシ【AIOマスター】と同期</div>
    ${me().admin ? `<div class="navgroup">管理者</div>${item('admin', '管理ボード（全チーム）')}` : ''}
    <div class="navgroup">毎日</div>
    ${item('today', '今日やること', DATA.notices.length ? `<span class="badge">${DATA.notices.length}</span>` : '')}
    ${item('board', '見込みボード')}
    ${item('follow', '架電（マエカク・フォロー）', fN ? `<span class="badge gray">${fN}</span>` : '')}
    <div class="navgroup">数字</div>
    ${item('teiryo', '定量（日別・チーム）')}
    ${item('seminar', 'セミナー（開催日別）')}
    <div class="navgroup">設定</div>
    ${item('connect', 'Google・AI連携')}
    ${me().admin ? `<label class="field" style="margin-top:auto;padding:16px 12px 0">表示する人（管理者・開発者）
      <select data-chg="viewas"><option value="" ${who() === '' ? 'selected' : ''}>全員</option>${DATA.members.concat(DATA.deals.map(d => d.owner)).filter((x, i, a) => x && x !== '未設定' && a.indexOf(x) === i).map(n => `<option ${who() === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>` : ''}
    <div style="${me().admin ? '' : 'margin-top:auto;'}padding:12px 12px 0" class="small">${esc(me().name || (me().admin ? '管理者・開発者' : '名前未設定'))}<br>${esc(me().email)}</div>
    <div style="padding:8px 12px 0"><button type="button" class="btn sm" data-act="reload">最新にする</button></div>
  </nav>`;
}

function noticeSection() {
  if (!DATA.notices.length) return '';
  return `<section class="sec alert"><div class="sec-h"><h2>アドレスエラー</h2><p>送ったメールが届きませんでした。Slack にも同じ通知が届いています。</p></div>
    ${DATA.notices.map(n => `<div class="row"><div class="grow"><button type="button" class="link" data-act="open" data-id="${n.dealId}">${esc(n.company)}</button><div class="na">宛先「${esc(n.to)}」（${esc(n.subject)}）</div></div>
      <button type="button" class="btn" data-act="notice-done" data-n="${esc(n.id)}">確認した</button></div>`).join('')}</section>`;
}
function proposalSection(ids, inDetail) {
  const ps = DATA.proposals.filter(p => ids.includes(p.dealId));
  if (!ps.length) return '';
  const rows = ps.map(p => { const d = find(p.dealId); if (!d) return ''; return `<div class="row">${inDetail ? '' : rk(d.rank, d.yomi)}
      <div class="grow">${inDetail ? '' : `<button type="button" class="link" data-act="open" data-id="${d.id}">${esc(d.company)}</button>`}<div class="na">${esc(p.text)}（${md(p.due)}まで）</div><div class="small">商談議事録から AI が提案${d.na ? ' ・ 今の次回アクション：' + esc(d.na) : ''}</div></div>
      <button type="button" class="btn p" data-act="p-adopt" data-p="${esc(p.id)}">採用</button><button type="button" class="btn" data-act="p-edit" data-p="${esc(p.id)}">直して採用</button><button type="button" class="btn" data-act="p-reject" data-p="${esc(p.id)}">不採用</button></div>`; }).join('');
  return `<section class="sec" style="border-color:#C9D6F5"><div class="sec-h"><h2>AI の提案（議事録から）</h2><p>採用すると次回アクションとスプシに入ります。要らないものは「不採用」。設定で自動採用にもできます。</p></div>${rows}</section>`;
}

function viewToday() {
  const mine = DATA.deals.filter(d => mineOf(d) && isOpen(d));
  const due = mine.filter(d => d.na && d.due && d.due <= TODAY).sort((a, b) => a.due < b.due ? -1 : 1);
  const blank = mine.filter(d => !d.na);
  const thanks = DATA.deals.filter(d => mineOf(d) && d.thanks === 'draft');
  const over = due.filter(d => d.due < TODAY).length;
  const dueRows = due.map(d => `<div class="row">${rk(d.rank, d.yomi)}
      <div class="grow"><button type="button" class="link" data-act="open" data-id="${d.id}">${esc(d.company)}</button><div class="na">${esc(d.na)}</div>${d.dueRaw ? `<div class="small">スプシの次回アクション日：${esc(d.dueRaw)}</div>` : ''}</div>
      ${S.editDue === d.id ? `<input type="date" value="${d.due}" data-chg="due" data-id="${d.id}" aria-label="新しい期限">` : dueHtml(d)}
      <button type="button" class="btn" data-act="mail-new" data-kind="follow" data-id="${d.id}">メールを作る</button>
      <button type="button" class="btn" data-act="done" data-id="${d.id}">完了</button>
      <button type="button" class="btn" data-act="editdue" data-id="${d.id}">${S.editDue === d.id ? 'やめる' : '期限を変える'}</button></div>`).join('') || '<div class="empty">今日やる次回アクションはありません。</div>';
  const blankRows = blank.map(d => `<div class="row">${rk(d.rank, d.yomi)}
      <div style="flex:0 1 220px"><button type="button" class="link" data-act="open" data-id="${d.id}">${esc(d.company)}</button><div class="small">商談日 ${md(d.date) || '不明'}${d.dueRaw ? ' ・ ' + esc(d.dueRaw) : ''}</div></div>
      <label class="field" style="flex:1 1 240px">次回アクション内容<input type="text" id="na-${d.id}" placeholder="例：再商談の日程を決める"></label>
      <label class="field">次回アクション日（空なら自動）<input type="date" id="due-${d.id}"></label>
      <button type="button" class="btn p" style="align-self:flex-end" data-act="savena" data-id="${d.id}">保存</button></div>`).join('') || '<div class="empty">未記入の案件はありません。</div>';
  const thanksRows = thanks.map(d => `<div class="row"><div class="grow"><button type="button" class="link" data-act="open" data-id="${d.id}">${esc(d.company)}</button>
      <div class="small">${md(d.date)} の商談 ・ 議事録あり ・ 送信前</div></div>
      <button type="button" class="btn p" data-act="mail-new" data-kind="thanks" data-id="${d.id}">下書きを作って確認</button></div>`).join('') || '<div class="empty">送信前のお礼メールはありません。</div>';
  return `<div class="wrap">
    <div class="head"><div><div class="eyebrow">${md(TODAY)}（${wd(TODAY)}） ・ ${esc(who() || '全員')}</div><h1>今日やること</h1></div>
      <div class="tools"><button type="button" class="btn" data-act="nav" data-v="follow">架電 ${DATA.follow.length + DATA.maekaku.length}件</button><button type="button" class="btn p" data-act="nav" data-v="teiryo">今日の数字を入れる</button></div></div>
    ${noticeSection()}
    ${proposalSection(mine.map(d => d.id))}
    <div class="kpis">
      <div class="kpi"><div class="k">期限切れ</div><div class="v" style="color:var(--red)">${over}</div></div>
      <div class="kpi"><div class="k">今日が期限</div><div class="v">${due.length - over}</div></div>
      <div class="kpi"><div class="k">次回アクション未記入</div><div class="v" style="color:var(--amber)">${blank.length}</div></div>
      <div class="kpi"><div class="k">担当の進行中案件</div><div class="v">${mine.length}</div></div>
    </div>
    <section class="sec"><div class="sec-h"><h2>期限切れ・今日が期限</h2><p>スプシ「商談議事録」の次回アクション日と内容から出しています。</p></div>${dueRows}</section>
    <section class="sec warn"><div class="sec-h"><h2>次回アクション未記入</h2><p>書くとスプシにも入ります。日付が空なら確度ごとの日数で入ります（A 3営業日・B 7・C 14・長期とネタ 30日）。</p></div>${blankRows}</section>
    <section class="sec"><div class="sec-h"><h2>お礼メール</h2></div>${thanksRows}</section>
  </div>`;
}

function viewBoard() {
  let ds = DATA.deals.filter(isOpen);
  if (S.ownerFilter === 'me') ds = ds.filter(mineOf);
  if (S.onlyOverdue) ds = ds.filter(d => dueState(d) === 'over');
  if (S.onlyBlank) ds = ds.filter(d => dueState(d) === 'blank');
  const scope = S.ownerFilter === 'me' ? DATA.deals.filter(mineOf) : DATA.deals;
  const card = d => {
    const b = dueState(d) === 'blank';
    return `<button type="button" class="card ${b ? 'blank' : ''}" draggable="true" data-drag="${d.id}" data-act="open" data-id="${d.id}">
      <div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(d.company)}</b>${COLS[3].ranks.includes(d.rank) ? `<span class="tag">${esc(d.yomi)}</span>` : ''}</div>
      <div class="na ${b ? 'amber' : ''}">${b ? '次回アクション未記入' : esc(d.na)}</div>
      <div class="meta"><span>${b ? `商談日 ${md(d.date) || '不明'}` : dueHtml(d)}</span><span>${esc(d.product)}${d.amount ? ' ・ ' + esc(d.amount) : ''}${S.ownerFilter === 'all' ? ' ・ ' + esc(d.owner) : ''}</span></div></button>`;
  };
  const col = c => { const list = ds.filter(d => c.ranks.includes(d.rank)); return `<section class="col col${c.key}" data-drop="${c.key}" aria-label="${c.label}">
      <div class="col-h">${rk(c.ranks[0], c.key === 'other' ? '他' : c.key)}<h2>${c.label}</h2><span class="small" style="margin-left:auto">${list.length}件</span></div>
      ${list.map(card).join('') || '<div class="small" style="padding:8px 4px">該当なし</div>'}</section>`; };
  return `<div class="wrap" style="max-width:none">
    <div class="head"><div><div class="eyebrow">スプシ「商談議事録」と同期</div><h1>見込みボード</h1></div>
      <div class="tools">
        <label class="small" style="display:flex;align-items:center;gap:6px">担当<select data-chg="owner"><option value="me" ${S.ownerFilter === 'me' ? 'selected' : ''}>自分</option><option value="all" ${S.ownerFilter === 'all' ? 'selected' : ''}>全員</option></select></label>
        <button type="button" class="btn ${S.onlyOverdue ? 'on' : ''}" data-act="f-over" aria-pressed="${S.onlyOverdue}">期限切れだけ</button>
        <button type="button" class="btn ${S.onlyBlank ? 'on' : ''}" data-act="f-blank" aria-pressed="${S.onlyBlank}">未記入だけ</button>
      </div></div>
    <div class="scroll"><div class="cols">${COLS.map(col).join('')}</div></div>
    <p class="small" style="margin:0">カードをドラッグすると確度が変わり、スプシの「ヨミ」も書き換わります。受注 ${scope.filter(d => d.rank === '受注').length}件・失注 ${scope.filter(d => d.rank === '失注').length}件はボードに出ません。担当はスプシの「担当」列、なければセミナー申込の「アポ獲得担当」から推定（未設定 ${DATA.deals.filter(d => d.owner === '未設定').length}件）。</p>
  </div>`;
}

function viewDetail() {
  const d = find(S.detail);
  if (!d) { S.view = 'board'; return viewBoard(); }
  const st = dueState(d);
  const thanksBox = d.thanks === 'sent' ? '<p class="small" style="margin:0">送信済み</p>'
    : `<div class="na">${d.minutes ? '議事録からお礼メールの下書きを作れます。' : '議事録が入ると、議事録からお礼メールを作れます。'}</div><div class="tools" style="margin-top:10px"><button type="button" class="btn ${d.thanks === 'draft' ? 'p' : ''}" data-act="mail-new" data-kind="thanks" data-id="${d.id}">お礼メールを作る</button></div>`;
  return `<div class="wrap">
    <button type="button" class="link" style="font-weight:400;font-size:13px" data-act="back">← 戻る</button>
    <div class="head" style="align-items:center;justify-content:flex-start">
      <h1 style="margin:0">${esc(d.company)}</h1>
      <label class="small" style="display:flex;align-items:center;gap:6px">ヨミ<select data-chg="rank" data-id="${d.id}">${YOMI.map(([y, r]) => `<option value="${y}" ${d.rank === r ? 'selected' : ''}>${y}</option>`).join('')}${YOMI.some(([, r]) => r === d.rank) ? '' : `<option value="" selected>${esc(d.yomi)}</option>`}</select></label>
      <span class="small">担当：${esc(d.owner)} ・ 商談日：${md(d.date) || '不明'} ・ スプシ ${d.id} 行目</span>
    </div>
    <div class="split">
      <div style="flex:999 1 420px;min-width:0;display:flex;flex-direction:column;gap:18px">
        ${proposalSection([d.id], true)}
        <section class="box main"><h2>次回アクション</h2>
          <div class="tools" style="align-items:flex-end">
            <label class="field" style="flex:1 1 280px">次回アクション内容<input type="text" id="dna" value="${esc(d.na)}" placeholder="例：再商談の日程を決める"></label>
            <label class="field">次回アクション日（空なら自動）<input type="date" id="ddue" value="${d.due}"></label>
            <button type="button" class="btn" data-act="dsave" data-id="${d.id}">保存</button>
            <button type="button" class="btn p" data-act="ddone" data-id="${d.id}">完了にする</button>
          </div>
          ${d.dueRaw ? `<div class="small" style="margin-top:8px">スプシの次回アクション日の欄：${esc(d.dueRaw)}</div>` : ''}
          ${st === 'over' ? `<div class="red small" style="margin-top:8px">期限を${daysSince(d.due)}日過ぎています</div>` : ''}
          ${st === 'blank' ? '<div class="amber small" style="margin-top:8px">次回アクションが未記入です。</div>' : ''}
          <div class="tools" style="margin-top:12px"><button type="button" class="btn" data-act="mail-new" data-kind="follow" data-id="${d.id}">追いかけメールを作る</button>${d.minutes ? `<button type="button" class="btn" data-act="propose" data-id="${d.id}">AI に次回アクションを提案してもらう</button>` : ''}</div>
          ${d.done.length ? `<div class="small" style="margin-top:14px">これまで</div><div style="font-size:13px;color:#3A3F47;margin-top:4px;line-height:1.8">${d.done.map(x => `${md(x.date)} 完了　${esc(x.text)}`).join('<br>')}</div>` : ''}
        </section>
        <section class="box"><h2>経緯（ボードでの操作）</h2>
          ${d.events.map(e => `<div class="ev"><span class="d">${md(e.d)}</span><div><b>${esc(e.t)}</b>　${esc(e.s)} <span class="tag ${e.src === 'Gmail' ? 'mail' : ''}">${esc(e.src)}</span></div></div>`).join('') || '<div class="small">まだありません</div>'}
        </section>
      </div>
      <div style="flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:18px">
        <section class="box"><h2>スプシの情報</h2>
          <dl class="facts">
            <dt>提案商材</dt><dd>${esc(d.product)}</dd><dt>受注金額</dt><dd>${esc(d.amount || '—')}</dd>
            <dt>仕事内容</dt><dd>${esc(d.job || '—')}</dd><dt>社員数</dt><dd>${esc(d.size || '—')}</dd><dt>都道府県</dt><dd>${esc(d.pref || '—')}</dd>
            <dt>議事録</dt><dd>${d.minutes ? '商談議事録あり' : 'なし'}${d.kickoff ? '・キックオフ議事録あり' : ''}</dd>
            <dt>メモ（理由）</dt><dd style="white-space:normal;line-height:1.6">${esc(d.memo || '—')}</dd>
          </dl></section>
        <section class="box"><h2>お礼メール</h2>${thanksBox}</section>
      </div>
    </div></div>`;
}

function viewFollow() {
  const person = f => [f.person && esc(f.person) + ' 様', f.role && esc(f.role)].filter(Boolean).join('・');
  const phone = f => f.phone ? `<a href="tel:${esc(f.phone.replace(/[^\d+]/g, ''))}" class="link">${esc(f.phone)}</a>` : '<span class="small">電話番号なし</span>';
  const mkRows = DATA.maekaku.slice().sort((a, b) => a.sem < b.sem ? -1 : 1).map(m => `<div class="row">
      <div class="grow"><b>${esc(m.company)}</b> <span class="small">${esc(m.industry)}</span>
        <div class="na">${person(m)} ・ セミナー ${md(m.sem)}（${wd(m.sem)}）${m.sem.slice(11)} ・ マエカク：<span class="${m.status === '未確認' ? 'amber' : ''}">${esc(m.status)}</span>${m.intro ? ' ・ 集客：' + esc(m.intro) : ''}</div></div>
      ${phone(m)}
      <button type="button" class="btn p" data-act="m-set" data-r="${m.row}" data-v="参加">参加確認OK</button><button type="button" class="btn" data-act="m-set" data-r="${m.row}" data-v="不通">不通</button><button type="button" class="btn" data-act="m-set" data-r="${m.row}" data-v="リスケ">リスケ</button><button type="button" class="btn" data-act="m-set" data-r="${m.row}" data-v="キャンセル">キャンセル</button>
    </div>`).join('') || '<div class="empty">確認が必要な申込者はいません。</div>';
  const rows = DATA.follow.slice().sort((a, b) => a.sem < b.sem ? 1 : -1).map(f => `<div class="row">
      <div class="grow"><b>${esc(f.company)}</b> <span class="small">${esc(f.industry)}</span>
        <div class="na">${person(f)} ・ セミナー ${md(f.sem)}（${wd(f.sem)}）参加 ・ 状況：<span class="${f.status === '未着手' ? 'amber' : ''}">${esc(f.status)}</span>${f.intro ? ' ・ 集客：' + esc(f.intro) : ''}</div>
        ${f.last ? `<div class="small">前回まで：${esc(f.last)}</div>` : ''}</div>
      ${phone(f)}
      ${S.apoFor === f.row ? `<label class="field">商談日<input type="date" id="apo-date" value="${addBiz(TODAY, 3)}"></label><button type="button" class="btn p" style="align-self:flex-end" data-act="apo-save" data-r="${f.row}">アポを記録</button><button type="button" class="btn" style="align-self:flex-end" data-act="apo-cancel">やめる</button>`
        : `<button type="button" class="btn" data-act="f-res" data-r="${f.row}" data-v="不通">不通</button><button type="button" class="btn p" data-act="apo-open" data-r="${f.row}">商談アポ獲得</button><button type="button" class="btn" data-act="f-res" data-r="${f.row}" data-v="終了">追いかけ終了</button>`}
    </div>`).join('') || '<div class="empty">フォローが必要な参加者はいません。</div>';
  return `<div class="wrap">
    <div class="head"><div><div class="eyebrow">マエカク → セミナー → フォロー架電 → 商談アポ</div><h1>架電（マエカク・フォロー）</h1></div>
      <div class="kpi" style="min-width:160px"><div class="k">今日の商談アポ</div><div class="v" style="color:var(--green)">${apoOn(TODAY)}</div></div></div>
    <section class="sec"><div class="sec-h"><h2>マエカク（参加前の確認電話）</h2><p>これからのセミナーの申込者で、マエカクが「参加」になっていない人。押した結果はスプシの「マエカク」に入ります。</p></div>${mkRows}</section>
    <section class="sec"><div class="sec-h"><h2>フォロー架電（参加して、まだ商談になっていない人）</h2><p>結果はスプシの「追いかけ対応」「フォロー架電結果」に入ります。「商談アポ獲得」を押すと、アポを取った日（アポ獲得日）・アポ獲得担当・商談日（商談獲得日）も入ります。</p></div>${rows}</section>
  </div>`;
}

function viewTeiryo() {
  const days = []; for (let i = 0; i < 14; i++) days.push(addDays(TODAY, -i));
  const rows = days.map(d => { const a = actOn(d);
    return `<tr class="${d === TODAY ? 'today' : ''}"><td>${md(d)}（${wd(d)}）</td><td class="n">${a[0] || '—'}</td><td class="n">${a[1] || '—'}</td><td class="n">${a[0] ? pct(a[1], a[0]) : '—'}</td><td class="n">${appsOn(d)}</td><td class="n">${attendOn(d)}</td><td class="n">${apoOn(d)}</td><td class="n">${DATA.mdays[d] || 0}</td></tr>`; }).join('');
  const week = days.slice(0, 7), wsum = i => sum(week.map(d => actOn(d)[i]));
  const people = Array.from(new Set([].concat(DATA.members, ...week.map(d => Object.keys(DATA.act[d] || {}))))).filter(Boolean);
  const prow = people.map(p => { const t = [0, 0, 0, 0]; week.forEach(d => ((DATA.act[d] || {})[p] || [0, 0, 0, 0]).forEach((x, i) => t[i] += x));
    return `<tr><td>${esc(p)}</td><td class="n">${t[0]}</td><td class="n">${t[1]}</td><td class="n">${pct(t[1], t[0])}</td><td class="n">${t[2]}</td><td class="n">${sum(week.map(d => (DATA.daily[d] || {})[p] || 0))}</td><td class="n">${sum(week.map(d => (DATA.apo[d] || {})[p] || 0))}</td></tr>`; }).join('');
  const mine = (DATA.act[TODAY] || {})[who()] || [0, 0, 0, 0];
  return `<div class="wrap">
    <div class="head"><div><div class="eyebrow">チームで記入 ・ その日に何件取れたか</div><h1>定量（日別・チーム）</h1></div>
      <button type="button" class="btn p" data-act="report">日報用にコピー</button></div>
    <div class="kpis k6">
      <div class="kpi"><div class="k">直近7日 架電</div><div class="v">${wsum(0)}</div></div><div class="kpi"><div class="k">通電</div><div class="v">${wsum(1)}</div></div>
      <div class="kpi"><div class="k">通電率</div><div class="v">${pct(wsum(1), wsum(0))}</div></div><div class="kpi"><div class="k">セミナー集客</div><div class="v">${sum(week.map(appsOn))}</div></div>
      <div class="kpi"><div class="k">セミナー参加</div><div class="v">${sum(week.map(attendOn))}</div></div><div class="kpi"><div class="k">商談アポ獲得</div><div class="v" style="color:var(--green)">${sum(week.map(apoOn))}</div></div>
    </div>
    ${who() ? `<section class="box"><h2>今日の数字（${esc(who())}）</h2>
      <div class="tools" style="align-items:flex-end">
        <label class="field">架電数<input type="number" min="0" id="t-call" value="${mine[0]}"></label><label class="field">通電数<input type="number" min="0" id="t-conn" value="${mine[1]}"></label>
        <label class="field">セミナー集客数<input type="number" min="0" id="t-shu" value="${mine[2]}"></label><label class="field">資料送付数<input type="number" min="0" id="t-doc" value="${mine[3]}"></label>
        <button type="button" class="btn p" data-act="t-save">保存</button>
      </div><div class="small" style="margin-top:8px">スプシ「活動入力」の今日の${esc(who())}さんの行に入ります。商談アポは架電の画面で「商談アポ獲得」を押すと自動で数えます。</div></section>` : '<p class="small" style="margin:0">今日の数字を入れるときは、左の「表示する人」でメンバーを選んでください。</p>'}
    <section class="sec" style="padding-bottom:6px"><div class="sec-h"><h2>日別（チーム合計）</h2><p>架電・通電は「活動入力」、セミナー集客は申込フォームの申込日、参加は開催日、商談アポ獲得は「アポ獲得日」、商談日は「商談獲得日」から数えています。</p></div>
      <div class="scroll"><table><thead><tr><th>日付</th><th class="n">架電</th><th class="n">通電</th><th class="n">通電率</th><th class="n">セミナー集客</th><th class="n">セミナー参加</th><th class="n">商談アポ獲得</th><th class="n">商談日</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="sec" style="padding-bottom:6px"><div class="sec-h"><h2>担当者別（直近7日）</h2></div>
      <div class="scroll"><table><thead><tr><th>担当</th><th class="n">架電</th><th class="n">通電</th><th class="n">通電率</th><th class="n">集客（活動入力）</th><th class="n">申込（紹介元）</th><th class="n">商談アポ獲得</th></tr></thead><tbody>${prow}</tbody></table></div></section>
  </div>`;
}

function viewSeminar() {
  const all = DATA.seminars, ym = TODAY.slice(0, 7);
  const list = S.semFilter === 'future' ? all.filter(s => s.at.slice(0, 10) >= TODAY) : S.semFilter === 'recent' ? all.filter(s => s.at.slice(0, 10) <= TODAY && s.at.slice(0, 10) >= addDays(TODAY, -30)) : all;
  const mon = all.filter(s => s.at.slice(0, 7) === ym), past = mon.filter(s => s.at.slice(0, 10) < TODAY);
  const t = k => sum(mon.map(s => s[k])), tp = k => sum(past.map(s => s[k]));
  const rows = list.slice().sort((a, b) => S.semFilter === 'future' ? (a.at < b.at ? -1 : 1) : (a.at < b.at ? 1 : -1)).map(s => {
    const w = x => s.apps ? (x / s.apps * 100) + '%' : '0';
    return `<tr class="${s.at.slice(0, 10) === TODAY ? 'today' : ''}"><td>${md(s.at)}（${wd(s.at)}）${s.at.slice(11)}</td><td class="n">${s.apps}</td><td class="n">${s.attend}</td><td class="n">${s.absent}</td><td class="n">${s.unknown}</td><td class="n">${s.at.slice(0, 10) < TODAY ? pct(s.attend, s.apps) : '—'}</td><td class="n">${s.meet}</td>
      <td><div class="bar" aria-hidden="true"><span class="b-att" style="width:${w(s.attend)}"></span><span class="b-abs" style="width:${w(s.absent)}"></span><span class="b-unk" style="width:${w(s.unknown)}"></span></div></td></tr>`; }).join('') || '<tr><td colspan="8" class="small">該当する回はありません</td></tr>';
  return `<div class="wrap">
    <div class="head"><div><div class="eyebrow">スプシ「セミナー申込フォーム」の参加希望日ごと</div><h1>セミナー（開催日別）</h1></div>
      <div class="tools">${[['future', 'これから'], ['recent', '直近30日'], ['all', 'すべて']].map(([k, l]) => `<button type="button" class="btn ${S.semFilter === k ? 'on' : ''}" data-act="sem" data-k="${k}">${l}</button>`).join('')}</div></div>
    <div class="kpis k6">
      <div class="kpi"><div class="k">${+ym.slice(5)}月 申込</div><div class="v">${t('apps')}</div></div><div class="kpi"><div class="k">参加</div><div class="v" style="color:var(--green)">${t('attend')}</div></div>
      <div class="kpi"><div class="k">不参加</div><div class="v">${t('absent')}</div></div><div class="kpi"><div class="k">未確認</div><div class="v" style="color:var(--amber)">${t('unknown')}</div></div>
      <div class="kpi"><div class="k">参加率（開催済み）</div><div class="v">${pct(tp('attend'), tp('apps'))}</div></div><div class="kpi"><div class="k">商談設定済</div><div class="v">${t('meet')}</div></div>
    </div>
    <section class="sec" style="padding-bottom:6px"><div class="sec-h"><h2>開催日ごとの参加者数・不参加数</h2>
      <div class="legend" style="margin-top:8px"><span><i class="b-att"></i>参加</span><span><i class="b-abs"></i>不参加</span><span><i class="b-unk"></i>未確認（参加有無が空欄）</span></div></div>
      <div class="scroll"><table><thead><tr><th>開催日時</th><th class="n">申込</th><th class="n">参加</th><th class="n">不参加</th><th class="n">未確認</th><th class="n">参加率</th><th class="n">商談設定済</th><th>内訳</th></tr></thead><tbody>${rows}</tbody></table></div></section>
  </div>`;
}

function viewAdmin() {
  const head = DATA.monthlyHead, cur = DATA.monthly[TODAY.slice(0, 7)] || [];
  const mv = k => cur[head.indexOf(k)] || '—';
  const open = DATA.deals.filter(isOpen), c = r => open.filter(d => r.includes(d.rank)).length;
  const stalled = open.filter(d => d.date && daysSince(d.date) >= 14 && ['A', 'B'].includes(d.rank));
  return `<div class="wrap">
    <div class="head"><div><div class="eyebrow">管理者だけ ・ A・B・CS のボードをまとめて表示</div><h1>管理ボード（全チーム）</h1></div></div>
    <div class="three">
      <section class="box main"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2>セルコン（AIOマスター）</h2><button type="button" class="btn sm" data-act="nav" data-v="board">開く</button></div>
        <div class="small" style="margin-bottom:10px">今月（スプシ「月次集計」より）</div>
        <div class="mini">
          <div><div class="k">架電</div><div class="v">${esc(mv('架電数'))}</div></div><div><div class="k">通電</div><div class="v">${esc(mv('通電数'))}</div></div><div><div class="k">セミナー集客</div><div class="v">${esc(mv('セミナー集客'))}</div></div>
          <div><div class="k">セミナー参加</div><div class="v">${esc(mv('セミナー参加'))}</div></div><div><div class="k">商談</div><div class="v">${esc(mv('商談数'))}</div></div><div><div class="k">受注</div><div class="v" style="color:var(--green)">${esc(mv('受注数'))}</div></div>
        </div><div class="small" style="margin-top:10px">受注金額 ${esc(mv('受注金額'))}</div>
        <div style="border-top:1px solid #ECEEF2;margin-top:12px;padding-top:12px" class="mini">
          <div><div class="k">Aヨミ</div><div class="v" style="color:#8A3B00">${c(['A'])}</div></div><div><div class="k">Bヨミ</div><div class="v" style="color:#163A94">${c(['B'])}</div></div><div><div class="k">Cヨミ</div><div class="v">${c(['C'])}</div></div>
          <div><div class="k">長期・ネタ</div><div class="v">${c(['長期', 'ネタ', '未設定'])}</div></div><div><div class="k">期限切れ</div><div class="v" style="color:var(--red)">${open.filter(d => dueState(d) === 'over').length}</div></div><div><div class="k">未記入</div><div class="v" style="color:var(--amber)">${open.filter(d => dueState(d) === 'blank').length}</div></div>
        </div></section>
      <section class="box"><h2>もう一方のチーム</h2><p class="na">別のボードとして独立。大元のスプシをもらったら、ここに同じ形で出します。</p><span class="tag">未接続</span></section>
      <section class="box"><h2>CS</h2><p class="na">CS タスクボードの数字をここにまとめて出します。</p><span class="tag">接続予定</span></section>
    </div>
    <section class="sec"><div class="sec-h"><h2>止まっている案件（A・Bヨミで商談から14日以上）</h2></div>
      ${stalled.map(d => `<div class="row">${rk(d.rank, d.yomi)}<div class="grow"><button type="button" class="link" data-act="open" data-id="${d.id}">${esc(d.company)}</button><div class="na">${esc(d.na || '次回アクション未記入')}</div></div><span class="small">担当 ${esc(d.owner)} ・ 商談 ${md(d.date)}（${daysSince(d.date)}日前）</span></div>`).join('') || '<div class="empty">ありません</div>'}</section>
    ${Object.keys(DATA.fails).length ? `<section class="sec alert"><div class="sec-h"><h2>スプシのメール自動送信で失敗が出ています</h2><p>申込フォームの自動メールの欄に「送信失敗」が入っている件数です。</p></div>
      ${Object.entries(DATA.fails).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<div class="row"><div class="grow"><b>${esc(k)}</b></div><span class="red">${n}件</span></div>`).join('')}</section>` : ''}
  </div>`;
}

function viewConnect() {
  return `<div class="wrap">
    <div class="head"><div><div class="eyebrow">設定</div><h1>Google・AI連携</h1></div></div>
    <section class="box main"><h2>Google（Gmail・スプシ）</h2><p class="na" style="margin:0"><b class="green">連携済み</b>　このボードを開いたときの承認で、${esc(me().email)} の Gmail とスプシを使えるようになっています。メールはこのアカウントから送られます。</p></section>
    <section class="box"><h2>メールの書き方を覚える</h2>
      <p class="na">送信済みメール（社外あて・最近90日の数件）から書き方の特徴をまとめて覚え、下書きをその書き方で作ります。メールの本文は保存しません。</p>
      <div class="tools"><button type="button" class="btn p" data-act="style">${me().styled ? '覚え直す' : '書き方を覚える'}</button><span class="small">${me().styled ? '覚えた書き方で下書きを作っています' : 'まだ覚えていません'}</span></div></section>
    <section class="box"><h2>AI の提案の扱い</h2>
      <label class="ck"><input type="checkbox" data-chg="auto" ${me().auto ? 'checked' : ''}>議事録からの提案を自動で採用する（自分の案件だけ）</label>
      <p class="small" style="margin:8px 0 0">オフのときは「今日やること」に提案が出て、採用・不採用を自分で選びます。</p></section>
    <section class="box"><h2>使っている AI とつなぐ（MCP）</h2><p class="na" style="margin:0">Claude・ChatGPT（Codex）から、このボードの案件や数字を聞いたり、次回アクションを登録したりできるようにします。<span class="tag">準備中</span></p></section>
    <section class="box"><h2>通知</h2><p class="na" style="margin:0">Slack への通知は<b>アドレスエラーだけ</b>です。期限や未記入はこのボードの「今日やること」に出ます。</p></section>
  </div>`;
}

function mailModal() {
  const m = S.mail; if (!m) return '';
  return `<div class="modal-bg" data-act="mail-bg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mm">
    <h2 id="mm">${m.kind === 'thanks' ? 'お礼メールを確認して送信' : '追いかけメール'}</h2>
    ${m.loading ? '<p class="na">下書きを作っています…</p>' : `<div class="small">${m.by === 'template' ? '定型文の下書きです（AI の設定があると、議事録とあなたの書き方で作ります）。' : '議事録とあなたの書き方から作った下書きです。'}自由に直してから送ってください。</div>
    <label class="field">宛先<input type="text" id="mail-to" value="${esc(m.to)}" placeholder="name@example.co.jp"></label>
    <label class="field">件名<input type="text" id="mail-sub" value="${esc(m.subject)}"></label>
    <label class="field">本文<textarea id="mail-body">${esc(m.body)}</textarea></label>
    <label class="ck"><input type="checkbox" id="mail-next" checked>送ったあと「返信の確認」を次回アクションにする（${md(addBiz(TODAY, 3))}）</label>
    <div class="small">送信元：${esc(me().email)}。届かなかったときだけ Slack とボードに通知します。</div>`}
    <div class="tools" style="justify-content:flex-end"><button type="button" class="btn" data-act="mail-cancel">やめる</button>${m.loading ? '' : '<button type="button" class="btn p" data-act="mail-send">送信する</button>'}</div>
  </div></div>`;
}
function copyModal() {
  if (!S.copy) return '';
  return `<div class="modal-bg" data-act="copy-bg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="cm">
    <h2 id="cm">日報用の数字</h2><textarea id="copy-text" style="min-height:220px">${esc(S.copy)}</textarea>
    <div class="tools" style="justify-content:flex-end"><button type="button" class="btn" data-act="copy-close">閉じる</button><button type="button" class="btn p" data-act="copy-do">コピー</button></div></div></div>`;
}
function namePicker() {
  const opts = (DATA.members.length ? DATA.members : ['金﨑', '小池', '相原', 'アルバイト']).map(n => `<button type="button" class="btn" data-act="pick" data-n="${esc(n)}">${esc(n)}</button>`).join('');
  return `<main style="padding:40px"><div class="wrap" style="max-width:560px"><h1>はじめに</h1><p class="na">${esc(me().email)} はまだ名簿にありません。スプシでの担当名を選んでください（あとから管理者が名簿に登録できます）。</p><div class="tools">${opts}</div></div></main>`;
}

function render() {
  const app = $('app');
  if (S.loading && !DATA) { app.innerHTML = '<main style="padding:40px" class="na">スプシを読み込んでいます…</main>'; return; }
  if (S.error && !DATA) { app.innerHTML = `<main style="padding:40px"><h1>読み込めませんでした</h1><p class="na">${esc(S.error)}</p><button type="button" class="btn p" data-act="reload">もう一度</button></main>`; return; }
  if (!me().name && !me().admin) { app.innerHTML = namePicker(); return; }
  if (me().admin && S.viewAs === null && !me().name) { S.viewAs = ''; if (S.view === 'today' && !(window.__GAS && window.__GAS.view)) S.view = 'admin'; }
  if (S.view === 'admin' && !me().admin) S.view = 'today';
  const v = { today: viewToday, board: viewBoard, detail: viewDetail, follow: viewFollow, teiryo: viewTeiryo, seminar: viewSeminar, admin: viewAdmin, connect: viewConnect }[S.view] || viewToday;
  app.innerHTML = `<div class="layout">${nav()}<main>${v()}${S.error ? `<p class="red small">${esc(S.error)}</p>` : ''}</main></div>${mailModal()}${copyModal()}`;
}

// ───── 操作 ─────
function openDeal(id) { if (S.view !== 'detail') S.prev = S.view; S.view = 'detail'; S.detail = id; window.scrollTo(0, 0); }
const dealReq = (d, extra) => Object.assign({ op: 'deal', row: d.id, company: d.company }, extra);
const savedMsg = r => r && r.auto ? `日付が空なので ${md(r.due)} にしました。スプシにも入りました` : '保存しました。スプシにも入りました';

document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const a = t.dataset.act;
  if ((a === 'mail-bg' || a === 'copy-bg') && e.target !== t) return;
  const d = t.dataset.id ? find(+t.dataset.id) : null;
  const row = +t.dataset.r;
  const fRow = DATA && (DATA.follow.find(x => x.row === row) || DATA.maekaku.find(x => x.row === row));
  switch (a) {
    case 'reload': reload(); return;
    case 'pick': act({ op: 'setName', name: t.dataset.n }, 'よろしくお願いします'); return;
    case 'nav': S.view = t.dataset.v; S.editDue = null; S.apoFor = null; window.scrollTo(0, 0); break;
    case 'open': openDeal(+t.dataset.id); break;
    case 'back': S.view = S.prev || 'board'; break;
    case 'editdue': S.editDue = S.editDue === d.id ? null : d.id; break;
    case 'done': act({ op: 'complete', row: d.id, company: d.company }, '完了にしました。次にやることを書いてください'); return;
    case 'savena': act(dealReq(d, { na: $('na-' + d.id).value, due: $('due-' + d.id).value }), savedMsg); return;
    case 'dsave': act(dealReq(d, { na: $('dna').value, due: $('ddue').value }), savedMsg); return;
    case 'ddone': act({ op: 'complete', row: d.id, company: d.company }, '完了にしました。次にやることを書いてください'); return;
    case 'propose': act({ op: 'propose', row: d.id, company: d.company }, 'AI の提案を作りました'); return;
    case 'f-over': S.onlyOverdue = !S.onlyOverdue; break;
    case 'f-blank': S.onlyBlank = !S.onlyBlank; break;
    case 'notice-done': act({ op: 'notice', id: t.dataset.n }, '確認済みにしました'); return;
    case 'p-adopt': act({ op: 'proposal', id: t.dataset.p, action: 'adopt' }, '採用しました。スプシにも入りました'); return;
    case 'p-reject': act({ op: 'proposal', id: t.dataset.p, action: 'reject' }, '不採用にしました'); return;
    case 'p-edit': { const p = DATA.proposals.find(x => x.id === t.dataset.p); DATA.proposals = DATA.proposals.filter(x => x !== p);
      api({ op: 'proposal', id: p.id, action: 'reject' }).catch(() => {});   // 直して使うので、提案そのものは閉じる
      openDeal(p.dealId); render(); $('dna').value = p.text; $('ddue').value = p.due; $('dna').focus(); toast('内容を直して「保存」を押してください'); return; }
    case 'mail-new': {
      const kind = t.dataset.kind;
      S.mail = { dealId: d.id, kind, to: d.email || '', subject: '', body: '', loading: true }; render();
      api({ op: 'draft', row: d.id, company: d.company, kind }).then(r => { if (S.mail && S.mail.dealId === d.id) { Object.assign(S.mail, { subject: r.subject, body: r.body, by: r.by, loading: false }); render(); } })
        .catch(err => { if (S.mail) { Object.assign(S.mail, { loading: false, by: 'template' }); render(); } toast('下書きを作れませんでした：' + err.message); });
      return;
    }
    case 'mail-bg': case 'mail-cancel': S.mail = null; break;
    case 'mail-send': {
      const m = S.mail, dd = find(m.dealId);
      const req = { op: 'mail', row: dd.id, company: dd.company, kind: m.kind, to: $('mail-to').value.trim(), subject: $('mail-sub').value.trim(), body: $('mail-body').value, next: $('mail-next').checked };
      if (!req.to || !req.subject || !req.body.trim()) { toast('宛先・件名・本文を入れてください'); return; }
      S.mail = null; render();
      act(req, r => r && r.bounce ? 'アドレスエラー：宛先の形が正しくないため送れませんでした。Slack に通知しました' : `${dd.company} にメールを送りました`); return;
    }
    case 'm-set': act({ op: 'maekaku', row, company: fRow.company, value: t.dataset.v }, `マエカクを「${t.dataset.v}」にしました`); return;
    case 'f-res': act({ op: 'follow', row, company: fRow.company, result: t.dataset.v }, t.dataset.v === '不通' ? '不通を記録しました' : '追いかけ終了にしました'); return;
    case 'apo-open': S.apoFor = row; break;
    case 'apo-cancel': S.apoFor = null; break;
    case 'apo-save': { const date = $('apo-date').value; if (!date) { toast('商談日を入れてください'); return; } S.apoFor = null;
      act({ op: 'follow', row, company: fRow.company, result: 'アポ', date }, `商談アポを記録しました（取った日 ${md(TODAY)}・商談日 ${md(date)}）`); return; }
    case 't-save': act({ op: 'activity', as: who(), calls: $('t-call').value, conn: $('t-conn').value, shu: $('t-shu').value, docs: $('t-doc').value }, '保存しました。スプシ「活動入力」にも入りました'); return;
    case 'report': { const x = actOn(TODAY);
      S.copy = `【${md(TODAY)}（${wd(TODAY)}） セルコン 日報の数字】\n架電：${x[0]}件\n通電：${x[1]}件（通電率 ${x[0] ? pct(x[1], x[0]) : '—'}）\nセミナー集客：${appsOn(TODAY)}件\nセミナー参加：${attendOn(TODAY)}名\n商談アポ獲得：${apoOn(TODAY)}件\n資料送付：${x[3]}件`; break; }
    case 'copy-bg': case 'copy-close': S.copy = null; break;
    case 'copy-do': { const ta = $('copy-text'); ta.select(); const done = () => toast('コピーしました');
      try { navigator.clipboard.writeText(ta.value).then(done, () => { document.execCommand('copy'); done(); }); } catch (_) { document.execCommand('copy'); done(); } return; }
    case 'sem': S.semFilter = t.dataset.k; break;
    case 'style': act({ op: 'learnStyle' }, '書き方を覚えました。次の下書きから使います'); return;
  }
  render();
});
document.addEventListener('change', e => {
  const t = e.target, k = t.dataset.chg;
  if (!k) return;
  const d = t.dataset.id ? find(+t.dataset.id) : null;
  if (k === 'owner') { S.ownerFilter = t.value; render(); }
  if (k === 'viewas') { S.viewAs = t.value; S.ownerFilter = 'me'; render(); }
  if (k === 'due') { S.editDue = null; act(dealReq(d, { due: t.value }), `期限を ${md(t.value)} にしました`); }
  if (k === 'rank' && t.value) act(dealReq(d, { yomi: t.value }), `ヨミを「${t.value}」にしました。スプシにも入りました`);
  if (k === 'auto') act({ op: 'auto', on: t.checked }, t.checked ? '自動採用をオンにしました' : '自動採用をオフにしました');
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && (S.mail || S.copy)) { S.mail = null; S.copy = null; render(); } });
let dragId = null;
document.addEventListener('dragstart', e => { const c = e.target.closest('[data-drag]'); if (c) { dragId = +c.dataset.drag; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(dragId)); } });
document.addEventListener('dragover', e => { const col = e.target.closest('[data-drop]'); if (col && dragId) { e.preventDefault(); document.querySelectorAll('.col.over').forEach(x => x !== col && x.classList.remove('over')); col.classList.add('over'); } });
document.addEventListener('dragleave', e => { const col = e.target.closest('[data-drop]'); if (col && !col.contains(e.relatedTarget)) col.classList.remove('over'); });
document.addEventListener('drop', e => { const col = e.target.closest('[data-drop]'); if (col && dragId) { e.preventDefault(); const map = { A: 'Aヨミ', B: 'Bヨミ', C: 'Cヨミ', other: '長期ヨミ' }; const dd = find(dragId); dragId = null; document.querySelectorAll('.col.over').forEach(x => x.classList.remove('over'));
  if (!(col.dataset.drop === 'other' && COLS[3].ranks.includes(dd.rank)) && !COLS.find(c => c.key === col.dataset.drop).ranks.includes(dd.rank)) act(dealReq(dd, { yomi: map[col.dataset.drop] }), `ヨミを「${map[col.dataset.drop]}」にしました。スプシにも入りました`); } });
document.addEventListener('dragend', () => { dragId = null; document.querySelectorAll('.col.over').forEach(x => x.classList.remove('over')); });

reload();

