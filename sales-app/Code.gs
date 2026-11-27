/**
 * セルコン 見込みボード（Googleアカウントで開く版）
 * - 画面：GitHub kitahara-cyber/portal の sales-app ブランチの sales-app/app.js を読み込んで表示（10分キャッシュ。すぐ反映は refreshApp）
 * - データ：スプレッドシート【AIOマスター】を、表示のたびに読む（リポジトリにはデータを置かない）
 *     商談議事録          … 見込みボード・案件の詳細（ヨミ・次回アクション日・次回アクション内容を書き戻す）
 *     セミナー申込フォーム … セミナー集計・マエカク・フォロー架電（マエカク・追いかけ対応・フォロー架電結果・アポ獲得日などを書き戻す）
 *     活動入力            … 定量（今日の架電数などを書き戻す）
 *     月次集計            … 管理ボード
 *     _sales_log（自動で作る非表示シート）… 経緯・AIの提案・アドレスエラーの記録
 * - 列は「1行目の見出しの名前」で探す。列の位置が変わっても動く。
 *
 * スクリプトプロパティ（値はここに書かない。プロジェクトの設定 → スクリプト プロパティ）
 *   SHEET_ID           【AIOマスター】のスプレッドシートID（必須）
 *   MEMBERS            [{"name":"金﨑","email":"…@writeup.co.jp"}, …]（ボードの担当名とメールの対応）
 *   ADMINS             管理ボードを見られる人のメール（カンマ区切り）
 *   SLACK_WEBHOOK_URL  アドレスエラーの通知先（または SLACK_BOT_TOKEN ＋ SLACK_CHANNEL）
 *   ANTHROPIC_API_KEY  AIの提案・メール下書き（なければ GEMINI_API_KEY。どちらもなければ定型文）
 *
 * 公開設定：デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *   次のユーザーとして実行：ウェブアプリケーションにアクセスしているユーザー
 *   アクセスできるユーザー：株式会社ライトアップ（writeup.co.jp）内の全員
 *   （各メンバーが自分のGoogleアカウントで動かす。メールは本人のGmailから送る。初回に出る承認が「Google連携」）
 */

const APP_JS = 'https://raw.githubusercontent.com/kitahara-cyber/portal/sales-app/sales-app/app.js';
const TITLE  = 'セルコン 見込みボード';
const TZ     = 'Asia/Tokyo';
const SH     = { deals: '商談議事録', seminar: 'セミナー申込フォーム', act: '活動入力', monthly: '月次集計', log: '_sales_log' };
const YOMI   = { 'Aヨミ': 'A', 'A': 'A', 'Bヨミ': 'B', 'B': 'B', 'Cヨミ': 'C', 'C': 'C', 'Ｃ': 'C', '長期ヨミ': '長期', 'ネタ': 'ネタ', '受注': '受注', '失注': '失注', '失注・対象顧客なし': '失注', '予算厳しい': '失注', '': '未設定' };
const YOMI_WRITE = ['Aヨミ', 'Bヨミ', 'Cヨミ', '長期ヨミ', 'ネタ', '受注', '失注'];
const RANK_DAYS = { A: 3, B: 7, C: 14, 長期: 30, ネタ: 30, 未設定: 7 };
// CS タスクボード（管理ボードに数字を出す。読むだけ）。値はスクリプト プロパティ CS_SHEET_ID・CS_BOARD_URL で上書きできる
const CS_SHEET_DEFAULT = '1GKcj5qfLoaUlhqxEMEicIxhPbCPCyLkUCJkELnK6wkg';   // タスク管理表（_board_db）
const CS_URL_DEFAULT = 'https://script.google.com/a/macros/writeup.co.jp/s/AKfycbzZpVgr8E8UaEIqSPqhRcq4Z0fZAKDgvzmQwnvI4UHF0oV2eRukxqsBp-6pIt3BFRgr/exec';

/* ---------- 画面 ---------- */
function appCode_() {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('app_n') || 0);
  if (n) {
    const parts = cache.getAll(Array.from({length: n}, (_, i) => 'app_' + i));
    if (Object.keys(parts).length === n) return Array.from({length: n}, (_, i) => parts['app_' + i]).join('');
  }
  const res = UrlFetchApp.fetch(APP_JS, {muteHttpExceptions: true});
  if (res.getResponseCode() !== 200) throw new Error('画面のプログラムを読み込めませんでした（' + res.getResponseCode() + '）');
  const code = res.getContentText('UTF-8'), size = 30000, chunks = {};
  let k = 0;
  for (let i = 0; i < code.length; i += size) chunks['app_' + (k++)] = code.slice(i, i + size);
  chunks['app_n'] = String(k);
  cache.putAll(chunks, 600);
  return code;
}
function doGet(e) {
  const p = (e && e.parameter) || {};
  const boot = { url: ScriptApp.getService().getUrl(), email: Session.getActiveUser().getEmail() || '', view: String(p.v || '').replace(/[^a-z]/g, '') };
  let code;
  try { code = appCode_(); }
  catch (err) { return HtmlService.createHtmlOutput('<p style="font:14px sans-serif;padding:24px">' + String(err.message) + '</p>').setTitle(TITLE); }
  const html = '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8">'
    + '<script>window.__GAS=' + JSON.stringify(boot).replace(/</g, '\\u003c') + ';</script>'
    + '</head><body><div id="gas-loading" style="font:14px sans-serif;padding:24px;color:#555">読み込み中…</div>'
    + '<script>' + code.replace(/<\/script/gi, '<\\/script') + '</script></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle(TITLE).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
function refreshApp() { CacheService.getScriptCache().remove('app_n'); appCode_(); Logger.log('最新の画面を読み込みました'); }

/* ---------- 窓口（画面から google.script.run.api(req)） ---------- */
function api(req) {
  req = req || {};
  const email = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!email) throw new Error('signin_required');
  switch (req.op) {
    case 'all':      return load_(email);
    case 'setName':  return setName_(email, req.name);
    case 'deal':     return updateDeal_(email, req);
    case 'complete': return completeDeal_(email, req);
    case 'maekaku':  return maekaku_(email, req);
    case 'follow':   return follow_(email, req);
    case 'activity': return activity_(email, req);
    case 'draft':    return draft_(email, req);
    case 'mail':     return sendMail_(email, req);
    case 'propose':  return propose_(email, req, false);
    case 'proposal': return proposal_(email, req);
    case 'notice':   return logSet_(req.id, 'status', 'done');
    case 'auto':     PropertiesService.getUserProperties().setProperty('autoAdopt', req.on ? '1' : ''); return {ok: true};
    case 'learnStyle': return learnStyle_(email);
    default: throw new Error('unknown_op');
  }
}

/* ---------- 小道具 ---------- */
function props_() { return PropertiesService.getScriptProperties(); }
function ss_() {
  const id = props_().getProperty('SHEET_ID');
  if (!id) throw new Error('スクリプトプロパティ SHEET_ID が未設定です');
  return SpreadsheetApp.openById(id);
}
function sheet_(name) { const sh = ss_().getSheetByName(name); if (!sh) throw new Error('シート「' + name + '」が見つかりません'); return sh; }
function today_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function addBiz_(d, n) { const t = new Date(d + 'T00:00:00+09:00'); let k = 0; while (k < n) { t.setDate(t.getDate() + 1); const w = Number(Utilities.formatDate(t, TZ, 'u')) % 7; if (w !== 0 && w !== 6) k++; } return Utilities.formatDate(t, TZ, 'yyyy-MM-dd'); }
function addDays_(d, n) { const t = new Date(d + 'T00:00:00+09:00'); t.setDate(t.getDate() + n); return Utilities.formatDate(t, TZ, 'yyyy-MM-dd'); }
function slash_(iso) { return iso ? iso.replace(/-/g, '/') : ''; }
function isoOf_(t, year) {
  t = String(t || '').trim();
  const m = t.match(/(?:(\d{4})\/)?(\d{1,2})[\/月](\d{1,2})/);
  if (!m) return '';
  const y = Number(m[1] || year || today_().slice(0, 4));
  return y + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
}
function semKey_(t) {
  const m = String(t || '').match(/(\d{4})\/(\d{1,2})\/(\d{1,2}).*?(\d{1,2}):(\d{2})/);
  return m ? m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2) + ' ' + ('0' + m[4]).slice(-2) + ':' + m[5] : '';
}
function staff_(x) { return String(x || '').trim().replace('金崎', '金﨑'); }
function normCo_(x) { return String(x || '').replace(/(株式会社|合同会社|有限会社|医療法人社団|\s|　)/g, '').toLowerCase(); }
function clip_(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; }
/** 見出しの行を探して、見出し名 → 列番号（0始まり）の表を返す */
function table_(name, headName) {
  const sh = sheet_(name), v = sh.getDataRange().getDisplayValues();
  let h = 0;
  if (headName) { for (let i = 0; i < Math.min(10, v.length); i++) if (v[i].indexOf(headName) >= 0) { h = i; break; } }
  const col = {};
  v[h].forEach((c, i) => { const k = String(c).trim(); if (k && !(k in col)) col[k] = i; });
  return { sh: sh, v: v, head: h, col: col, get: (r, k) => (k in col ? String(r[col[k]] || '') : '') };
}
function setCell_(t, row, key, value) {
  if (!(key in t.col)) throw new Error('列「' + key + '」がシート「' + t.sh.getName() + '」にありません（README の「スプシに足す列」を参照）');
  t.sh.getRange(row, t.col[key] + 1).setValue(value);
}
function checkRow_(t, row, company, key) {
  const r = t.v[row - 1];
  if (!r || String(r[t.col[key]] || '').trim() !== String(company || '').trim()) throw new Error('row_mismatch：スプシの行が動いています。画面を読み込み直してください');
}
function lock_(fn) { const l = LockService.getScriptLock(); l.waitLock(20000); try { return fn(); } finally { l.releaseLock(); } }

/* ---------- 名前・権限 ---------- */
function members_() { try { return JSON.parse(props_().getProperty('MEMBERS') || '[]'); } catch (e) { return []; } }
function me_(email) {
  const m = members_().find(x => String(x.email || '').toLowerCase() === email);
  const up = PropertiesService.getUserProperties();
  const admins = String(props_().getProperty('ADMINS') || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
  return { email: email, name: m ? m.name : (up.getProperty('name') || ''), admin: admins.indexOf(email) >= 0, auto: !!up.getProperty('autoAdopt'), styled: !!up.getProperty('mailStyle') };
}
function setName_(email, name) {
  name = String(name || '').trim().slice(0, 20);
  if (!name) throw new Error('名前を選んでください');
  PropertiesService.getUserProperties().setProperty('name', name);
  return {ok: true};
}

/* ---------- 記録（_sales_log：id, at, type, row, company, text, due, by, status, extra） ---------- */
function logSheet_() {
  const ss = ss_();
  let sh = ss.getSheetByName(SH.log);
  if (!sh) { sh = ss.insertSheet(SH.log); sh.getRange(1, 1, 1, 10).setValues([['id', 'at', 'type', 'row', 'company', 'text', 'due', 'by', 'status', 'extra']]); sh.hideSheet(); }
  return sh;
}
function logAdd_(type, row, company, text, due, by, status, extra) {
  const id = Utilities.getUuid().slice(0, 13);
  logSheet_().appendRow([id, new Date().toISOString(), type, row || '', company || '', String(text || '').slice(0, 1000), due || '', by || '', status || '', extra ? JSON.stringify(extra) : '']);
  return id;
}
function logs_() {
  const sh = logSheet_(), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 10).getDisplayValues().map((r, i) => ({ line: i + 2, id: r[0], at: r[1], type: r[2], row: Number(r[3]) || 0, company: r[4], text: r[5], due: r[6], by: r[7], status: r[8], extra: (() => { try { return JSON.parse(r[9] || '{}'); } catch (e) { return {}; } })() }));
}
function logSet_(id, field, value) {
  const cols = { status: 9, text: 6, due: 7 };
  const hit = logs_().find(l => l.id === id);
  if (!hit) throw new Error('not_found');
  logSheet_().getRange(hit.line, cols[field]).setValue(value);
  return {ok: true};
}

/* ---------- 読み込み（画面に渡す形はここで作る） ---------- */
function load_(email) {
  const me = me_(email), today = today_();
  const sem = table_(SH.seminar), deals = table_(SH.deals), logs = logs_();
  const semRows = sem.v.slice(sem.head + 1).map((r, i) => ({ r: r, row: sem.head + 2 + i })).filter(x => sem.get(x.r, 'タイムスタンプ').trim());
  // 会社 → アポ獲得担当・メール（担当の推定と宛先の初期値）
  const ownerBy = {}, mailBy = {};
  semRows.forEach(x => {
    const k = normCo_(sem.get(x.r, '会社名'));
    const st = staff_(sem.get(x.r, 'アポ獲得担当')); if (st) ownerBy[k] = st;
    const em = sem.get(x.r, 'メールアドレス').trim(); if (em) mailBy[k] = em;
  });
  const byRow = {};
  logs.forEach(l => { if (l.row) (byRow[l.row] = byRow[l.row] || []).push(l); });
  const out = { today: today, me: me, members: members_().map(m => m.name), deals: [] };
  deals.v.slice(deals.head + 1).forEach((r, i) => {
    const row = deals.head + 2 + i, co = deals.get(r, '社名').trim();
    if (!co) return;
    const yomi = deals.get(r, 'ヨミ').trim(), nextRaw = deals.get(r, '次回アクション日').replace(/\n/g, ' ').trim(), due = isoOf_(nextRaw, today.slice(0, 4));
    const txt = deals.get(r, '次回アクション内容') + deals.get(r, '理由');
    const owner = staff_(deals.get(r, '担当')) || ownerBy[normCo_(co)] || (/金[崎﨑]/.test(txt) ? '金﨑' : (/小口/.test(txt) ? '小口' : '未設定'));
    const lg = (byRow[row] || []).filter(l => l.company === co);
    const date = isoOf_(deals.get(r, '商談日'), today.slice(0, 4));
    const sentThanks = lg.some(l => l.type === 'mail' && l.extra.kind === 'thanks');
    out.deals.push({
      id: row, date: date, company: co, yomi: yomi || '未設定', rank: YOMI[yomi] || '未設定',
      product: deals.get(r, '提案商材').trim() || '—', amount: deals.get(r, '受注金額').trim(),
      due: due, dueRaw: nextRaw.replace(/(?:\d{4}\/)?\d{1,2}[\/月]\d{1,2}日?/, '').trim() ? nextRaw : '',
      na: clip_(deals.get(r, '次回アクション内容'), 200), memo: clip_(deals.get(r, '理由'), 200), job: clip_(deals.get(r, '仕事内容'), 40),
      size: deals.get(r, '社員数').trim(), pref: deals.get(r, '都道府県').trim(),
      minutes: !!deals.get(r, '商談議事録').trim(), kickoff: !!deals.get(r, 'キックオフ議事録').trim(), owner: owner,
      email: mailBy[normCo_(co)] || '',
      thanks: sentThanks ? 'sent' : (date && date >= addDays_(today, -2) && deals.get(r, '商談議事録').trim() ? 'draft' : 'none'),
      events: lg.filter(l => ['mail', 'event', 'bounce'].indexOf(l.type) >= 0).reverse().map(l => ({ d: l.at.slice(0, 10), t: l.extra.title || l.type, s: l.text, src: l.extra.src || 'ボード' })),
      done: lg.filter(l => l.type === 'done').reverse().map(l => ({ date: l.at.slice(0, 10), text: l.text }))
    });
  });
  // セミナー（開催日別）・申込日別の集客・商談日・アポを取った日
  const agg = {}, daily = {}, mdays = {}, apo = {}, fails = {}, follow = [], maekaku = [];
  semRows.forEach(x => {
    const r = x.r, k = semKey_(sem.get(r, 'セミナー参加希望日')), part = sem.get(r, '参加有無').trim(), chase = sem.get(r, '追いかけ対応').trim();
    if (k) {
      const a = agg[k] = agg[k] || { at: k, apps: 0, attend: 0, absent: 0, unknown: 0, meet: 0 };
      a.apps++; if (part === '参加') a.attend++; else if (part === '不参加') a.absent++; else a.unknown++;
      if (chase.indexOf('商談設定済') >= 0) a.meet++;
    }
    const d = isoOf_(sem.get(r, 'タイムスタンプ')), intro = staff_(sem.get(r, '紹介元（名前）')) || '不明';
    (daily[d] = daily[d] || {})[intro] = ((daily[d] || {})[intro] || 0) + 1;
    const md = isoOf_(sem.get(r, '商談獲得日')); if (md) mdays[md] = (mdays[md] || 0) + 1;
    const ad = isoOf_(sem.get(r, 'アポ獲得日'));
    if (ad) { const who = staff_(sem.get(r, 'アポ獲得担当')) || '不明'; (apo[ad] = apo[ad] || {})[who] = ((apo[ad] || {})[who] || 0) + 1; }
    Object.keys(sem.col).forEach(h => { if (String(r[sem.col[h]]).indexOf('送信失敗') === 0) fails[h] = (fails[h] || 0) + 1; });
    const base = { row: x.row, company: sem.get(r, '会社名').trim() || '（会社名なし）', industry: clip_(sem.get(r, '業種'), 20), person: sem.get(r, 'ご担当者名').trim(), role: clip_(sem.get(r, '部署 / 役職'), 20), phone: sem.get(r, '電話番号').trim(), email: sem.get(r, 'メールアドレス').trim(), sem: k, intro: staff_(sem.get(r, '紹介元（名前）')) };
    if (k && k.slice(0, 10) <= today && part === '参加' && ['追いかけ済', '商談設定済'].indexOf(chase) < 0) follow.push(Object.assign({ status: chase || '未着手', last: clip_(sem.get(r, 'フォロー架電結果'), 120) }, base));
    const mk = sem.get(r, 'マエカク').trim();
    if (k && k.slice(0, 10) >= today && ['参加', 'キャンセル', '不参加'].indexOf(mk) < 0) maekaku.push(Object.assign({ status: mk || '未確認' }, base));
  });
  out.seminars = Object.keys(agg).sort().map(k => agg[k]);
  out.daily = daily; out.mdays = mdays; out.apo = apo; out.fails = fails; out.follow = follow; out.maekaku = maekaku;
  // 活動入力
  const act = table_(SH.act, '日付'), am = {};
  act.v.slice(act.head + 1).forEach(r => {
    const d = isoOf_(act.get(r, '日付')), who = staff_(act.get(r, '担当者'));
    if (!d || !who) return;
    const n = k => Number(String(act.get(r, k)).replace(/[^\d]/g, '')) || 0;
    const v = [n('架電数'), n('通電数'), n('セミナー集客数'), n('AIバード資料送付数')];
    if (v.some(Boolean)) (am[d] = am[d] || {})[who] = v;
  });
  out.act = am;
  // 月次集計
  try {
    const all = sheet_(SH.monthly).getDataRange().getDisplayValues();
    const h = Math.max(0, all.findIndex(r => String(r[0]).trim() === '期間開始'));   // 見出しの行を探す（上に余白の行があっても動く）
    const mo = all.slice(h);
    out.monthlyHead = mo[0].slice(1); out.monthly = {};
    mo.slice(1).forEach(r => { const m = String(r[0] || '').match(/(\d{4})\D+(\d{1,2})/); if (m) out.monthly[m[1] + '-' + ('0' + m[2]).slice(-2)] = r.slice(1); });   // 「2026/11/01」「2026年11月」どちらでも
  } catch (e) { out.monthlyHead = []; out.monthly = {}; }
  // CS タスクボード（管理者・開発者だけ）
  if (me.admin) { try { out.cs = csSummary_(today); } catch (e) { out.cs = { error: String(e.message || e), url: props_().getProperty('CS_BOARD_URL') || CS_URL_DEFAULT }; } }
  // 記録：AIの提案・アドレスエラー
  try { checkBounces_(email, logs); } catch (e) { console.warn('bounce ' + e); }
  const fresh = logs_();
  out.proposals = fresh.filter(l => l.type === 'proposal' && l.status === 'open').map(l => ({ id: l.id, dealId: l.row, company: l.company, text: l.text, due: l.due }));
  out.notices = fresh.filter(l => l.type === 'bounce' && l.status !== 'done' && l.by === email).map(l => ({ id: l.id, dealId: l.row, company: l.company, to: l.extra.to || '', subject: l.extra.subject || '' }));
  return out;
}

/* ---------- CS タスクボードの集計（_board_db を読むだけ。書き込まない） ---------- */
function csSummary_(today) {
  const p = props_(), url = p.getProperty('CS_BOARD_URL') || CS_URL_DEFAULT;
  const sh = SpreadsheetApp.openById(p.getProperty('CS_SHEET_ID') || CS_SHEET_DEFAULT).getSheetByName('_board_db');
  if (!sh) throw new Error('タスク管理表に _board_db がありません');
  const n = sh.getLastRow(), docs = {};
  if (n >= 2) sh.getRange(2, 1, n - 1, 2).getValues().forEach(r => { if (r[0] && !(r[0] in docs)) { try { docs[r[0]] = JSON.parse(r[1]); } catch (e) {} } });
  const roster = ((docs['config/roster'] || {}).members) || [];
  const nameOf = k => { const m = roster.find(x => x.key === k); return m ? (m.name || m.full || k) : k; };
  const OPEN = ['todo', 'reopen', 'doing', 'blocked', 'review'];
  const isRemind = (id, t) => t.remind === true || (t.remind !== false && (/^auto-(mtg|tr|sum|yor)-/.test(id) || /^dc-(fb|yor)-/.test(id) || /^【全体連絡】/.test(String(t.title || ''))));
  const weekAgo = addDays_(today, -7);
  const out = { url: url, open: 0, overdue: 0, today: 0, review: 0, blocked: 0, remind: 0, doneWeek: 0, byMember: {}, latestReport: '', overdueList: [] };
  Object.keys(docs).forEach(path => {
    const m = path.match(/^tasks\/([^\/]+)$/); if (!m) return;
    const id = m[1], t = docs[path] || {};
    if (t.status === 'done' && String(t.doneAt || '').slice(0, 10) >= weekAgo) out.doneWeek++;
    if (OPEN.indexOf(t.status) < 0) return;
    if (isRemind(id, t)) { out.remind++; return; }
    out.open++;
    const due = String(t.due || '').slice(0, 10), over = !!due && due < today;
    if (over) { out.overdue++; if (out.overdueList.length < 8) out.overdueList.push({ title: clip_(t.title, 50), due: due, who: (t.assignees || []).map(nameOf).join('・') }); }
    if (due === today) out.today++;
    if (t.status === 'review') out.review++;
    if (t.status === 'blocked') out.blocked++;
    (t.assignees && t.assignees.length ? t.assignees : ['（担当なし）']).forEach(k => { const nm = nameOf(k), b = out.byMember[nm] = out.byMember[nm] || { open: 0, overdue: 0 }; b.open++; if (over) b.overdue++; });
  });
  out.overdueList.sort((a, b) => a.due < b.due ? -1 : 1);
  out.latestReport = Object.keys(docs).filter(k => /^reports\/\d{4}-\d{2}-\d{2}$/.test(k)).sort().pop() || '';
  out.latestReport = out.latestReport.slice(8);
  return out;
}

/* ---------- 書き込み：商談議事録 ---------- */
function updateDeal_(email, req) {
  const me = me_(email);
  return lock_(() => {
    const t = table_(SH.deals), row = Number(req.row);
    checkRow_(t, row, req.company, '社名');
    if (req.yomi != null) {
      if (YOMI_WRITE.indexOf(req.yomi) < 0) throw new Error('ヨミの値が正しくありません');
      const old = t.get(t.v[row - 1], 'ヨミ');
      setCell_(t, row, 'ヨミ', req.yomi);
      logAdd_('event', row, req.company, (old || '未設定') + ' → ' + req.yomi, '', email, '', { title: 'ヨミを変更', src: 'ボード' });
    }
    if (req.na != null) {
      const na = String(req.na).trim();
      if (!na) throw new Error('次回アクション内容を入力してください');
      let due = String(req.due || '');
      if (!due) { const rank = YOMI[t.get(t.v[row - 1], 'ヨミ').trim()] || '未設定', n = RANK_DAYS[rank] || 7; due = (rank === '長期' || rank === 'ネタ') ? addDays_(today_(), n) : addBiz_(today_(), n); }
      setCell_(t, row, '次回アクション内容', na);
      setCell_(t, row, '次回アクション日', slash_(due));
      logAdd_('event', row, req.company, na, due, email, '', { title: '次回アクションを設定', src: 'ボード' });
      return { ok: true, due: due, auto: !req.due };
    }
    if (req.due != null && req.na == null) setCell_(t, row, '次回アクション日', slash_(req.due));
    if (req.owner != null && '担当' in t.col) setCell_(t, row, '担当', String(req.owner));
    return { ok: true, by: me.name };
  });
}
function completeDeal_(email, req) {
  return lock_(() => {
    const t = table_(SH.deals), row = Number(req.row);
    checkRow_(t, row, req.company, '社名');
    const cur = t.get(t.v[row - 1], '次回アクション内容').trim();
    if (!cur) throw new Error('完了にする次回アクションがありません');
    logAdd_('done', row, req.company, cur, '', email, '', {});
    setCell_(t, row, '次回アクション内容', '');
    setCell_(t, row, '次回アクション日', '');
    return { ok: true };
  });
}

/* ---------- 書き込み：セミナー申込フォーム（A〜R列はGASが位置で使うので、見出しで探した列だけを書く） ---------- */
function maekaku_(email, req) {
  if (['参加', '不通', 'リスケ', 'キャンセル'].indexOf(req.value) < 0) throw new Error('マエカクの値が正しくありません');
  return lock_(() => { const t = table_(SH.seminar), row = Number(req.row); checkRow_(t, row, req.company, '会社名'); setCell_(t, row, 'マエカク', req.value); return { ok: true }; });
}
function follow_(email, req) {
  const me = me_(email), today = today_(), md = Number(today.slice(5, 7)) + '/' + Number(today.slice(8));
  return lock_(() => {
    const t = table_(SH.seminar), row = Number(req.row);
    checkRow_(t, row, req.company, '会社名');
    const prev = t.get(t.v[row - 1], 'フォロー架電結果');
    if (req.result === '不通') {
      setCell_(t, row, 'フォロー架電結果', (md + ' ' + me.name + '不通' + (prev ? '　' + prev : '')).slice(0, 2000));
      setCell_(t, row, '追いかけ対応', '追いかけ中');
    } else if (req.result === '終了') {
      setCell_(t, row, '追いかけ対応', '追いかけ済');
    } else if (req.result === 'アポ') {
      const date = String(req.date || ''); if (!date) throw new Error('商談日を入れてください');
      setCell_(t, row, '追いかけ対応', '商談設定済');
      setCell_(t, row, '商談獲得日', slash_(date));        // 今の運用どおり、この欄は「商談する日」
      setCell_(t, row, 'アポ獲得担当', me.name);
      setCell_(t, row, 'アポ獲得日', slash_(today));       // 足した列：アポを取った日
      setCell_(t, row, 'フォロー架電結果', (md + ' ' + me.name + ' ' + Number(date.slice(5, 7)) + '/' + Number(date.slice(8)) + 'に商談アポ獲得' + (prev ? '　' + prev : '')).slice(0, 2000));
    } else throw new Error('結果の値が正しくありません');
    return { ok: true };
  });
}

/* ---------- 書き込み：活動入力（今日・自分の行。数式の列には触らない） ---------- */
function activity_(email, req) {
  const me = me_(email);
  if (me.admin && req.as) me.name = staff_(req.as);   // 管理者・開発者は、選んだメンバーの行に入れられる
  if (!me.name) throw new Error('誰の数字かが決まっていません');
  const today = today_();
  return lock_(() => {
    const t = table_(SH.act, '日付');
    let row = 0;
    t.v.forEach((r, i) => { if (i > t.head && isoOf_(t.get(r, '日付')) === today && staff_(t.get(r, '担当者')) === me.name) row = i + 1; });
    if (!row) throw new Error('活動入力に今日（' + today + '）の ' + me.name + ' さんの行がありません');
    const v = k => Math.max(0, Math.floor(Number(req[k]) || 0));
    setCell_(t, row, '架電数', v('calls')); setCell_(t, row, '通電数', v('conn')); setCell_(t, row, 'セミナー集客数', v('shu'));
    if ('AIバード資料送付数' in t.col) setCell_(t, row, 'AIバード資料送付数', v('docs'));
    return { ok: true };
  });
}

/* ---------- メール：下書き（各自の書き方で）・送信（本人のGmailから）・アドレスエラー ---------- */
function dealCtx_(row, company) {
  const t = table_(SH.deals); checkRow_(t, row, company, '社名');
  const r = t.v[row - 1], g = k => t.get(r, k);
  return { company: company, yomi: g('ヨミ'), product: g('提案商材'), next: g('次回アクション内容'), nextDate: g('次回アクション日'), memo: g('理由'), job: g('仕事内容'),
    minutes: String(g('商談議事録')).slice(0, 6000), kickoff: String(g('キックオフ議事録')).slice(0, 2000), date: g('商談日') };
}
function draft_(email, req) {
  const me = me_(email), c = dealCtx_(Number(req.row), req.company), style = PropertiesService.getUserProperties().getProperty('mailStyle') || '';
  const thanks = req.kind === 'thanks';
  const sys = 'あなたは株式会社ライトアップのセールス担当「' + me.name + '」のメールを代筆します。日本語のビジネスメールを、件名と本文に分けて JSON {"subject":"…","body":"…"} だけで返してください。' +
    '宛名は「' + c.company + '\\n[ご担当者名] 様」で始め、署名は書かない。記録にないことは作らない。400字以内。' + (style ? '\n本人の書き方の特徴：' + style : '');
  const user = (thanks ? '商談のお礼メールを書いてください。商談の要点と次回までの宿題を短く入れる。' : '追いかけのメールを書いてください。次回アクションの件で、相手の検討状況をうかがう。') +
    '\n\n社名：' + c.company + '\nヨミ：' + c.yomi + '\n提案商材：' + c.product + '\n次回アクション：' + c.next + '（' + c.nextDate + '）\nメモ：' + c.memo + '\n商談議事録：\n' + (c.minutes || '（なし）');
  const r = llmJson_(sys, user);
  if (r && r.subject && r.body) return { subject: String(r.subject), body: String(r.body), by: r.__by };
  const head = c.company + '\n[ご担当者名] 様\n\nお世話になっております。株式会社ライトアップの' + me.name + 'です。\n';
  return thanks
    ? { subject: '本日のお打ち合わせのお礼', body: head + '本日はお時間をいただき、ありがとうございました。\n\n・[決定事項]\n・[次回までの宿題]\n\n引き続きよろしくお願いいたします。', by: 'template' }
    : { subject: 'その後のご検討状況について', body: head + '先日はありがとうございました。\n' + (c.next ? '「' + c.next + '」の件でご連絡しました。\n' : '') + 'その後のご検討状況はいかがでしょうか。\n\n引き続きよろしくお願いいたします。', by: 'template' };
}
function sendMail_(email, req) {
  const to = String(req.to || '').trim(), subject = String(req.subject || '').trim(), body = String(req.body || '');
  if (!to || !subject || !body.trim()) throw new Error('宛先・件名・本文を入れてください');
  const row = Number(req.row);
  dealCtx_(row, req.company);   // 行の確認
  if (!/^[^@\s,;]+@[^@\s,;]+\.[^@\s,;]+$/.test(to)) {
    const id = logAdd_('bounce', row, req.company, '宛先の形が正しくありません：' + to, '', email, 'open', { to: to, subject: subject, title: 'アドレスエラー', src: 'Gmail' });
    notifySlack_('【アドレスエラー】' + req.company + ' 宛て「' + subject + '」：宛先「' + to + '」の形が正しくないため送れませんでした（' + me_(email).name + '）');
    return { ok: false, bounce: id };
  }
  GmailApp.sendEmail(to, subject, body);
  logAdd_('mail', row, req.company, subject, '', email, '', { to: to, subject: subject, kind: req.kind || 'follow', title: req.kind === 'thanks' ? 'お礼メールを送信' : '追いかけメールを送信', src: 'Gmail' });
  if (req.next) updateDeal_(email, { row: row, company: req.company, na: '返信の確認', due: addBiz_(today_(), 3) });
  return { ok: true };
}
/** 送ったメールが戻ってきていないか（本人のGmailを見る）。見つけたら記録して Slack に通知 */
function checkBounces_(email, logs) {
  const up = PropertiesService.getUserProperties();
  const last = Number(up.getProperty('bounceCheckedAt') || 0);
  if (Date.now() - last < 10 * 60 * 1000) return;   // 10分に1回
  up.setProperty('bounceCheckedAt', String(Date.now()));
  const sent = logs.filter(l => l.type === 'mail' && l.by === email && l.extra.to);
  if (!sent.length) return;
  const seen = JSON.parse(up.getProperty('bounceSeen') || '[]');
  GmailApp.search('from:(mailer-daemon OR postmaster) newer_than:7d', 0, 20).forEach(th => th.getMessages().forEach(m => {
    const id = m.getId(); if (seen.indexOf(id) >= 0) return;
    seen.push(id);
    const text = m.getPlainBody();
    const hit = sent.find(l => text.indexOf(l.extra.to) >= 0);
    if (!hit) return;
    logAdd_('bounce', hit.row, hit.company, '「' + hit.extra.to + '」に届きませんでした', '', email, 'open', { to: hit.extra.to, subject: hit.extra.subject, title: 'アドレスエラー', src: 'Gmail' });
    notifySlack_('【アドレスエラー】' + hit.company + ' 宛て「' + hit.extra.subject + '」が届きませんでした（宛先：' + hit.extra.to + '・送信：' + me_(email).name + '）');
  }));
  up.setProperty('bounceSeen', JSON.stringify(seen.slice(-200)));
}
function notifySlack_(text) {
  const p = props_(), hook = p.getProperty('SLACK_WEBHOOK_URL'), token = p.getProperty('SLACK_BOT_TOKEN'), ch = p.getProperty('SLACK_CHANNEL');
  try {
    if (hook) UrlFetchApp.fetch(hook, { method: 'post', contentType: 'application/json; charset=utf-8', muteHttpExceptions: true, payload: JSON.stringify({ text: text }) });
    else if (token && ch) UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', { method: 'post', contentType: 'application/json; charset=utf-8', muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + token }, payload: JSON.stringify({ channel: ch, text: text }) });
  } catch (e) { console.warn('slack ' + e); }
}
/** 本人の送信済みメールから書き方の特徴をまとめて覚える（下書きに使う） */
function learnStyle_(email) {
  const bodies = GmailApp.search('in:sent -to:writeup.co.jp newer_than:90d', 0, 8).map(th => { const ms = th.getMessages(); const m = ms.filter(x => String(x.getFrom()).toLowerCase().indexOf(email) >= 0).pop(); return m ? m.getPlainBody().split(/\n-- ?\n|\n>/)[0].slice(0, 800) : ''; }).filter(Boolean).slice(0, 5);
  if (!bodies.length) throw new Error('送信済みメールが見つかりませんでした');
  const r = llmJson_('メールの書き方の特徴を、代筆に使えるように日本語でまとめます。JSON {"style":"…"} だけを返す。200字以内。宛名・挨拶・結び・文の長さ・敬語の強さ・よく使う言い回しを書く。個人名や会社名は書かない。', bodies.join('\n\n----\n\n'));
  if (!r || !r.style) throw new Error('AIの設定がないため、書き方を覚えられませんでした');
  PropertiesService.getUserProperties().setProperty('mailStyle', String(r.style).slice(0, 400));
  return { ok: true, style: r.style };
}

/* ---------- AIの提案（議事録から次回アクションの案）。採用・不採用は人が選ぶ ---------- */
function propose_(email, req, quiet) {
  const row = Number(req.row), c = dealCtx_(row, req.company);
  if (!c.minutes && !c.kickoff) { if (quiet) return null; throw new Error('この案件には議事録がありません'); }
  const r = llmJson_('あなたは株式会社ライトアップのセールスの補佐です。商談の議事録から、担当が次にやるべきことを1つだけ選び、JSON {"text":"…","due":"YYYY-MM-DD"} だけで返してください。text は40字以内で動詞で終える。期日は議事録に日付があればそれ、なければ空文字。記録にないことは作らない。今日は ' + today_() + '。',
    '社名：' + c.company + '\nヨミ：' + c.yomi + '\n今の次回アクション：' + (c.next || 'なし') + '\n商談日：' + c.date + '\n商談議事録：\n' + c.minutes + '\nキックオフ議事録：\n' + c.kickoff);
  if (!r || !r.text) { if (quiet) return null; throw new Error('AIの設定がないため提案できません'); }
  const due = /^\d{4}-\d{2}-\d{2}$/.test(r.due || '') ? r.due : addBiz_(today_(), 3);
  const id = logAdd_('proposal', row, c.company, String(r.text).slice(0, 120), due, email, 'open', { by: r.__by });
  if (PropertiesService.getUserProperties().getProperty('autoAdopt')) proposal_(email, { id: id, action: 'adopt' });
  return { ok: true, id: id };
}
function proposal_(email, req) {
  const p = logs_().find(l => l.id === req.id && l.type === 'proposal');
  if (!p) throw new Error('not_found');
  if (req.action === 'reject') return logSet_(p.id, 'status', 'rejected');
  const text = String(req.text || p.text), due = String(req.due || p.due);
  updateDeal_(email, { row: p.row, company: p.company, na: text, due: due });
  logAdd_('event', p.row, p.company, text, due, email, '', { title: 'AIの提案を採用', src: 'ボード' });
  return logSet_(p.id, 'status', 'adopted');
}
/** 時間主導のトリガーで毎時実行：議事録が入った直近3日の商談に、まだ提案がなければ提案を作る */
function proposeNew() {
  const t = table_(SH.deals), lg = logs_(), since = addDays_(today_(), -3);
  t.v.slice(t.head + 1).forEach((r, i) => {
    const row = t.head + 2 + i, co = t.get(r, '社名').trim();
    if (!co || !t.get(r, '商談議事録').trim() || isoOf_(t.get(r, '商談日')) < since) return;
    if (lg.some(l => l.type === 'proposal' && l.row === row && l.company === co)) return;
    try { propose_('auto', { row: row, company: co }, true); } catch (e) { console.warn(co + ' ' + e); }
  });
}
function llmJson_(sys, user) {
  const p = props_(), ak = p.getProperty('ANTHROPIC_API_KEY'), gk = p.getProperty('GEMINI_API_KEY');
  let text = '', by = '';
  if (ak) {
    const r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { 'x-api-key': ak, 'anthropic-version': '2023-06-01' },
      payload: JSON.stringify({ model: p.getProperty('ANTHROPIC_MODEL') || 'claude-sonnet-5-5', max_tokens: 900, system: sys, messages: [{ role: 'user', content: user }] }) });
    if (r.getResponseCode() === 200) { text = (JSON.parse(r.getContentText()).content || []).filter(c => c.type === 'text').map(c => c.text).join(''); by = 'claude'; }
    else console.warn('anthropic ' + r.getResponseCode());
  }
  if (!text && gk) {
    const model = p.getProperty('GEMINI_MODEL') || 'gemini-2.5-flash';
    const r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { 'x-goog-api-key': gk }, payload: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens: 900 } }) });
    if (r.getResponseCode() === 200) { text = ((((JSON.parse(r.getContentText()).candidates || [])[0] || {}).content || { parts: [] }).parts || []).map(x => x.text || '').join(''); by = 'gemini'; }
  }
  if (!text) return null;
  const m = text.match(/\{[\s\S]*\}/);
  try { const j = JSON.parse(m ? m[0] : text); j.__by = by; return j; } catch (e) { return null; }
}

/* ---------- 初回だけ（エディタで実行） ---------- */
/** 権限の確認と、スプシに足す列の用意。既存の列は動かさず、右端に足すだけ */
function setup() {
  const add = (name, head, key) => {
    const t = table_(name, head);
    if (key in t.col) return key + '：あり';
    const c = t.sh.getLastColumn() + 1;
    t.sh.getRange(t.head + 1, c).setValue(key);
    return key + '：右端（' + c + '列目）に足しました';
  };
  Logger.log(add(SH.deals, '社名', '担当'));
  Logger.log(add(SH.seminar, 'タイムスタンプ', 'アポ獲得日'));
  logSheet_();
  GmailApp.getAliases();
  Logger.log('準備できました');
}
