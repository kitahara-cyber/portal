/**
 * CSチーム タスクボード（Googleアカウントで開く版）
 * - 画面：Vercel の https://cs-team-portal.vercel.app/app/board.js を読み込んで表示（画面の更新はVercel側だけで済む）
 * - データ：このスクリプトに設定したスプレッドシート（タスク管理表）の「_board_db」シート
 * - 通知：スクリプトプロパティ SLACK_BOT_TOKEN（各人にDM）または SLACK_WEBHOOK_URL（チャンネルにメンション付きで投稿）
 *
 * 公開設定：デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *   次のユーザーとして実行：ウェブアプリケーションにアクセスしているユーザー ／ アクセスできるユーザー：株式会社ライトアップ（writeup.co.jp）内の全員
 *   （各メンバーが自分のGoogleアカウントで動かす。未返信メールは本人のGmailだけを読む。タスク管理表は社内全員が編集できる前提）
 */

const SHEET_ID = '1GKcj5qfLoaUlhqxEMEicIxhPbCPCyLkUCJkELnK6wkg';   // タスク管理表
const DB_SHEET = '_board_db';
// 画面のプログラム（GitHub の kitahara-cyber/portal の board-app ブランチ。更新はこのブランチに入れるだけで反映される）
const APP_JS   = 'https://raw.githubusercontent.com/kitahara-cyber/portal/board-app/board-app/board.js';
const LEADS    = ['takahashi', 'sato', 'koguchi', 'kitahara'];      // プロジェクト・名簿・設定を変更できる人（名簿の key）
// 読み取りを許すスプレッドシート（フォーム依頼・交流会の参加台帳）
const READABLE_SHEETS = ['1GKcj5qfLoaUlhqxEMEicIxhPbCPCyLkUCJkELnK6wkg', '1S4GDhuB8DGv5I0_LKL_Aqhsqd3ak6jvNSux78zEa4yE', '1pHtiFMjTCCjH1L_-rYczw6FMfm-kPDirnCJotv0gKTo'];  // 100件リスト申込フォーム（回答）を追加

/* ---------- 画面 ---------- */
function appCode_() {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('app_n') || 0);
  if (n) {
    const parts = cache.getAll(Array.from({length: n}, (_, i) => 'app_' + i));
    const joined = Array.from({length: n}, (_, i) => parts['app_' + i] || '').join('');
    if (Object.keys(parts).length === n) return joined;
  }
  const res = UrlFetchApp.fetch(APP_JS, {muteHttpExceptions: true});
  if (res.getResponseCode() !== 200) throw new Error('画面のプログラムを読み込めませんでした（' + res.getResponseCode() + '）');
  const code = res.getContentText('UTF-8');
  const size = 30000, chunks = {};
  let k = 0;
  for (let i = 0; i < code.length; i += size) chunks['app_' + (k++)] = code.slice(i, i + size);
  chunks['app_n'] = String(k);
  cache.putAll(chunks, 600);   // 10分ごとに最新を取りに行く
  return code;
}
function doGet(e) {
  const p = (e && e.parameter) || {};
  const boot = {
    url: ScriptApp.getService().getUrl(),
    email: Session.getActiveUser().getEmail() || '',
    task: String(p.t || '').replace(/[^A-Za-z0-9_\-]/g, ''),
    view: String(p.v || '').replace(/[^a-z]/g, '')
  };
  let code;
  try { code = appCode_(); }
  catch (err) { return HtmlService.createHtmlOutput('<p style="font:14px sans-serif;padding:24px">' + String(err.message) + '</p>').setTitle('CSチーム タスクボード'); }
  const html = '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8">'
    + '<script>window.__GAS=' + JSON.stringify(boot).replace(/</g, '\\u003c') + ';</script>'
    + '</head><body><div id="gas-loading" style="font:14px sans-serif;padding:24px;color:#555">読み込み中…</div>'
    + '<script>' + code.replace(/<\/script/gi, '<\\/script') + '</script>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html)
    .setTitle('CSチーム タスクボード')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* 画面を今すぐ最新にしたいとき（エディタで実行） */
function refreshApp() { CacheService.getScriptCache().remove('app_n'); appCode_(); Logger.log('最新の画面を読み込みました'); }

/* ---------- 窓口（画面から google.script.run.api(req) で呼ぶ） ---------- */
function api(req) {
  req = req || {};
  const email = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!email) throw new Error('signin_required');
  switch (req.op) {
    case 'all':     return {docs: readAll_(), email: email};
    case 'set':     return write_(email, req.path, req.data, 'set');
    case 'update':  return write_(email, req.path, req.data, 'update');
    case 'add':     return write_(email, req.coll + '/' + newId_(), req.data, 'set');
    case 'delete':  return write_(email, req.path, null, 'delete');
    case 'slack':   return slack_(req.user, req.text);
    case 'values':  return values_(req.spreadsheetId, req.range);
    case 'calList': return calList_(req.calendarId, req.start, req.end);
    case 'calCreate': return calCreate_(req);
    case 'request': return request_(email, req);
    case 'mail': return mail_(email);
    case 'explain': return explain_(email, String(req.id || ''), !!req.force);
    case 'listReport': return listReport_(email, req);
    case 'findThread': return findThread_(String(req.client || ''));
    case 'clients': return clients_(!!req.refresh);
    case 'attach': return attach_(email, req);
    case 'attachInit': return attachTicket_(email);
    case 'shareDomain': return shareDomain_(String(req.fileId || ''));
    default: throw new Error('unknown_op');
  }
}

/* ---------- データ（_board_db：A=path, B=json, C=updatedAt, D=updatedBy） ---------- */
function sheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(DB_SHEET);
  if (!sh) { sh = ss.insertSheet(DB_SHEET); sh.getRange(1, 1, 1, 4).setValues([['path', 'json', 'updatedAt', 'updatedBy']]); sh.hideSheet(); }
  return sh;
}
function rows_() {
  const sh = sheet_(), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 3).getValues();
}
function readAll_() {
  const out = {};
  rows_().forEach(r => { if (r[0]) { try { out[r[0]] = JSON.parse(r[1]); } catch (e) {} } });
  return out;
}
function newId_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 20); }
function memberKey_(email) {
  const all = readAll_(), roster = all['config/roster'];
  const m = roster && (roster.members || []).find(x => String(x.email || '').toLowerCase() === email);
  return m ? m.key : '';
}
function canWrite_(email, path) {
  if (/^(config|projects)\//.test(path)) return !!memberKey_(email);   // メンバー設定に入っている人なら誰でも
  if (/^data\/users\//.test(path)) return path.indexOf('data/users/' + email + '/') === 0;
  return /^(tasks|minutes)\//.test(path);
}
function write_(email, path, data, mode) {
  path = String(path || '');
  if (!/^[A-Za-z0-9_\-@.]+(\/[A-Za-z0-9_\-@.]+)+$/.test(path)) throw new Error('invalid_path');
  if (!canWrite_(email, path)) throw new Error('permission_denied');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_(), rows = rows_();
    let idx = -1;
    for (let i = 0; i < rows.length; i++) { if (rows[i][0] === path) { idx = i; break; } }
    const now = new Date().toISOString();
    if (mode === 'delete') {
      // 消したタスクは「削除済み」の印を残し、フォームの取り込みや自動登録で同じものが入り直さないようにする
      if (idx >= 0 && /^tasks\/[^\/]+$/.test(path)) {
        let cur = {}; try { cur = JSON.parse(rows[idx][1] || '{}'); } catch (e) {}
        sh.appendRow(['deleted/' + path.split('/')[1], JSON.stringify({id: path.split('/')[1], sourceKey: cur.sourceKey || '', title: String(cur.title || '').slice(0, 80), meetingFileId: cur.meetingFileId || '', by: email, at: now}), now, email]);
      }
      if (idx >= 0) sh.deleteRow(idx + 2);
      // サブコレクション（コメントなど）も消す
      const pre = path + '/';
      for (let i = rows.length - 1; i >= 0; i--) { if (String(rows[i][0]).indexOf(pre) === 0) sh.deleteRow(i + 2); }
      return {path: path, deleted: true};
    }
    let obj = data || {};
    if (mode === 'update') {
      if (idx < 0) throw new Error('not_found');
      const cur = JSON.parse(rows[idx][1] || '{}');
      Object.keys(obj).forEach(k => { cur[k] = obj[k]; });
      obj = cur;
    }
    const json = JSON.stringify(obj);
    if (json.length > 45000) throw new Error('too_large');
    if (idx >= 0) sh.getRange(idx + 2, 2, 1, 3).setValues([[json, now, email]]);
    else sh.appendRow([path, json, now, email]);
    return {path: path, data: obj};
  } finally { lock.releaseLock(); }
}

/* ---------- Slack ---------- */
function slackText_(t) {
  return String(t || '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<$2|$1>')
    .replace(/\*\*([^*\n]+)\*\*/g, '*$1*');
}
function slack_(user, text) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('SLACK_BOT_TOKEN'), hook = props.getProperty('SLACK_WEBHOOK_URL');
  const msg = slackText_(text);
  let res;
  if (token) {
    res = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
      method: 'post', contentType: 'application/json; charset=utf-8', muteHttpExceptions: true,
      headers: {Authorization: 'Bearer ' + token},
      payload: JSON.stringify({channel: user, text: msg})
    });
    const j = JSON.parse(res.getContentText() || '{}');
    if (!j.ok) throw new Error('slack_error: ' + (j.error || res.getResponseCode()));
    return {ok: true};
  }
  if (hook) {
    res = UrlFetchApp.fetch(hook, {method: 'post', contentType: 'application/json; charset=utf-8', muteHttpExceptions: true, payload: JSON.stringify({text: msg})});
    if (res.getResponseCode() >= 300) throw new Error('slack_error: ' + res.getResponseCode());
    return {ok: true};
  }
  throw new Error('slack_not_configured');
}

/* ---------- シートの読み取り（フォーム依頼・交流会） ---------- */
function values_(id, range) {
  if (READABLE_SHEETS.indexOf(id) < 0) throw new Error('permission_denied');
  const v = SpreadsheetApp.openById(id).getRange(range).getDisplayValues();
  let last = v.length; while (last > 0 && v[last - 1].join('') === '') last--;
  return {values: v.slice(0, last)};
}

/* ---------- ボードから出したリスト・タスク依頼を一覧に記録（フォームと同じ扱い） ---------- */
function request_(email, r) {
  const clip = (v, n) => String(v == null ? '' : v).slice(0, n || 2000);
  const id = String(r.taskId || '').replace(/[^A-Za-z0-9_\-]/g, '');
  const mark = 'CSタスクボードから（' + id + '）';
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh, row;
  if (r.type === 'list') {
    sh = ss.getSheetByName('リスト依頼一覧');
    row = [now, clip(r.requester, 40), clip(r.due, 10), clip(r.source, 40), clip(r.url, 500), clip(r.target), clip(r.product), clip(r.site, 300), mark, clip(r.company, 200), '', '', '', '未着手', clip(r.assignee, 60), clip(r.priority, 4)];
  } else if (r.type === 'task') {
    sh = ss.getSheetByName('タスク依頼一覧');
    row = [now, clip(r.requester, 40), clip(r.due, 10), clip(r.kind, 40), clip(r.detail), clip(r.customer, 200), '', mark, clip(r.priority, 4), '未着手', clip(r.assignee, 60), ''];
  } else throw new Error('invalid_type');
  if (!sh) throw new Error('sheet_not_found');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const last = sh.getRange('A:A').getValues().filter(v => v[0] !== '').length;
    const rng = sh.getRange(last + 1, 1, 1, row.length);
    rng.setNumberFormat('@').setValues([row]);
  } finally { lock.releaseLock(); }
  return {ok: true};
}

/* ---------- 未返信メール（開いた本人のGmailだけを読む。保存はしない） ---------- */
function mail_(email) {
  const threads = GmailApp.search('in:inbox newer_than:14d -from:me -category:promotions -category:social -category:forums -category:updates', 0, 80);
  const out = [];
  threads.forEach(th => {
    const msgs = th.getMessages(), last = msgs[msgs.length - 1];
    const from = String(last.getFrom() || '');
    if (from.toLowerCase().indexOf(email) >= 0) return;                                  // 最後が自分＝返信済み
    if (/no-?reply|notification|mailer-daemon|calendar-notification|noreply|gemini|postmaster|bounce/i.test(from)) return;  // 自動送信は除く
    const subj = th.getFirstMessageSubject() || '';
    if (/自動返信|自動配信|自動送信|自動化|一斉送信|Auto[- ]?Reply|Out of Office|不在|^メモ[:：]|配信停止|メールマガジン|メルマガ|Undeliverable|Delivery Status/i.test(subj + ' ' + from)) return;
    const to = String(last.getTo() || '').toLowerCase(), cc = String(last.getCc() || '').toLowerCase();
    if (to.indexOf(email) < 0 && cc.indexOf(email) >= 0) return;                         // CCで入っているだけのものは除く
    try { if (last.getHeader('List-Unsubscribe') || /bulk|list|auto_reply/i.test(last.getHeader('Precedence') || '') || /^auto/i.test(last.getHeader('Auto-Submitted') || '')) return; } catch (e) {}
    out.push({
      id: th.getId(),
      subject: th.getFirstMessageSubject() || '（件名なし）',
      from: from.replace(/<[^>]*>/, '').replace(/"/g, '').trim() || from,
      date: Utilities.formatDate(last.getDate(), 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm:ssXXX"),
      snippet: String(last.getPlainBody() || '').replace(/\s+/g, ' ').slice(0, 140),
      url: 'https://mail.google.com/mail/u/0/#all/' + th.getId()
    });
  });
  // 同じ件名・同じ差出人がまとめて届いたもの（一斉送信など）は1行にまとめる
  const seen = {}, items = [];
  out.forEach(x => { const k = x.subject + '|' + x.from; if (seen[k]) { seen[k].more = (seen[k].more || 0) + 1; return; } seen[k] = x; items.push(x); });
  return {items: items.slice(0, 50)};
}

/* ---------- カレンダー ---------- */
function calList_(calendarId, start, end) {
  // 開いた人の権限で読む。購読していない同僚のカレンダーも読めるよう Calendar API（拡張サービス）を使う
  const tMin = new Date(start + '+09:00').toISOString(), tMax = new Date(end + '+09:00').toISOString();
  try {
    const j = Calendar.Events.list(calendarId, {singleEvents: true, orderBy: 'startTime', maxResults: 250, timeZone: 'Asia/Tokyo', timeMin: tMin, timeMax: tMax});
    return {items: (j.items || []).filter(e => e.status !== 'cancelled').map(e => ({
      summary: e.summary || (e.visibility === 'private' ? '予定あり' : '（タイトルなし）'),
      start: e.start, end: e.end, status: e.status, htmlLink: e.htmlLink || '', location: e.location || ''
    }))};
  } catch (err) {
    // 詳細が見られないときは、空き時間情報だけ（予定あり）
    const fb = Calendar.Freebusy.query({timeMin: tMin, timeMax: tMax, timeZone: 'Asia/Tokyo', items: [{id: calendarId}]});
    const c = (fb.calendars || {})[calendarId] || {};
    if (c.errors && c.errors.length) throw new Error('calendar_not_shared');
    const f = d => Utilities.formatDate(new Date(d), 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm:ssXXX");
    return {items: (c.busy || []).map(x => ({summary: '予定あり', start: {dateTime: f(x.start)}, end: {dateTime: f(x.end)}, status: 'confirmed', busyOnly: true}))};
  }
}
function calCreate_(req) {
  const ev = CalendarApp.getDefaultCalendar().createEvent(String(req.summary || '').slice(0, 200), new Date(req.start + '+09:00'), new Date(req.end + '+09:00'), {
    description: String(req.description || '').slice(0, 4000),
    guests: (req.guests || []).join(','),
    sendInvites: true
  });
  return {id: ev.getId()};
}



/* ---------- リスト作成タスク：セグメント名をシートへ・企業スレッドで完了報告 ---------- */
function clientKey_(c) {
  return String(c || '').replace(/^\d+_/, '').replace(/株式会社|合同会社|有限会社|一般社団法人|（株）|\(株\)|様|\s|　/g, '').toLowerCase();
}
function threadPath_(key) {  // 企業名（日本語）から衝突しないパスを作る
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, key, Utilities.Charset.UTF_8).map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('').slice(0, 16);
}
function parseThread_(url) {
  const m = String(url || '').match(/archives\/([A-Z0-9]+)\/p(\d{10})(\d{6})/);
  if (!m) return null;
  const t = String(url).match(/thread_ts=(\d+\.\d+)/);
  return {channel: m[1], ts: t ? t[1] : m[2] + '.' + m[3]};
}
function findListRow_(sh, task) {
  const n = sh.getLastRow(); if (n < 2) return -1;
  const vals = sh.getRange(2, 1, n - 1, 9).getDisplayValues();
  const sk = String(task.sourceKey || '');
  const m = sk.match(/^list\|(.*?)\|(.*?)(?:#(\d+))?$/);
  if (m) {
    let want = m[3] ? +m[3] : 1, seen = 0;
    for (let i = 0; i < vals.length; i++) {
      if (vals[i][0] === m[1] && vals[i][1] === m[2]) { seen++; if (seen === want) return i + 2; }
    }
  }
  const mark = 'CSタスクボードから（' + task.id + '）';
  for (let i = vals.length - 1; i >= 0; i--) { if (String(vals[i][8]).indexOf(mark) >= 0 || String(vals[i][7]).indexOf(mark) >= 0) return i + 2; }
  return -1;
}
function listReport_(email, r) {
  const id = String(r.id || '');
  if (!/^[A-Za-z0-9_\-]+$/.test(id)) throw new Error('invalid_id');
  const all = readAll_();
  const t = all['tasks/' + id]; if (!t) throw new Error('not_found');
  t.id = id;
  const segs = (r.segments || []).map(x => ({name: String(x.name || '').slice(0, 200).trim(), url: String(x.url || '').slice(0, 500).trim()})).filter(x => x.name || x.url);
  const thread = String(r.thread || '').trim();
  const out = {sheet: '', slack: '', segments: segs};
  // 1) シート：セグメント名（K列）、報告するときはステータス（N列）も完了に
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('リスト依頼一覧');
  const row = sh ? findListRow_(sh, t) : -1;
  if (row > 0) {
    const names = segs.map(x => x.name).filter(Boolean).join('\n');
    if (names) sh.getRange(row, 11).setValue(names);
    if (r.post) sh.getRange(row, 14).setValue('完了');
    out.sheet = 'row' + row;
  } else out.sheet = 'not_found';
  // 2) Slack：企業のスレッドで依頼者をメンションして報告
  if (r.post) {
    const th = parseThread_(thread);
    if (!th) throw new Error('thread_url_invalid');
    const roster = ((all['config/roster'] || {}).members) || [];
    const mem = k => roster.find(x => x.key === k) || {};
    const me = roster.find(x => String(x.email || '').toLowerCase() === email) || {};
    const req = mem(t.requester);
    const lines = [(req.slack ? '<@' + req.slack + '>' : (req.full || req.name || '') + 'さん'), 'リスト追加完了いたしました。', 'ご確認よろしくお願いいたします。', ''];
    segs.forEach(x => { if (x.name) lines.push('【' + x.name + '】'); if (x.url) lines.push(x.url); lines.push(''); });
    lines.push('（' + (me.full || me.name || email) + '／CSタスクボードから送信）');
    const token = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
    if (!token) throw new Error('slack_not_configured');
    const res = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {method: 'post', contentType: 'application/json; charset=utf-8', muteHttpExceptions: true,
      headers: {Authorization: 'Bearer ' + token}, payload: JSON.stringify({channel: th.channel, thread_ts: th.ts, text: lines.join('\n'), unfurl_links: false})});
    const j = JSON.parse(res.getContentText() || '{}');
    if (!j.ok) throw new Error('slack_error: ' + (j.error || res.getResponseCode()));
    out.slack = 'ok';
  }
  // 3) タスクと、企業→スレッドの対応を保存
  const patch = {listSegs: segs, reportThread: thread};
  write_(email, 'tasks/' + id, patch, 'update');
  if (thread && parseThread_(thread) && t.client) {
    const key = clientKey_(t.client);
    if (key) writeSys_('threads/' + threadPath_(key), {client: t.client, key: key, url: thread, by: email});
  }
  return out;
}
function writeSys_(path, data) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_(), rows = rows_(), now = new Date().toISOString();
    let idx = -1;
    for (let i = 0; i < rows.length; i++) { if (rows[i][0] === path) { idx = i; break; } }
    const json = JSON.stringify(data);
    if (idx >= 0) sh.getRange(idx + 2, 2, 1, 3).setValues([[json, now, 'system']]);
    else sh.appendRow([path, json, now, 'system']);
  } finally { lock.releaseLock(); }
}


/* 企業スレッドを探す：案件管理チャンネルの「■名前：〇〇」で始まる親メッセージ（Zapierが作るもの）から探す。
 * 通知用Slackアプリがそのチャンネルに入っている必要がある。見つからなければ空を返す（画面で手入力） */
function findThread_(client) {
  const key = clientKey_(client); if (!key) return {url: ''};
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('SLACK_BOT_TOKEN'); if (!token) return {url: '', err: 'slack_not_configured'};
  const ch = props.getProperty('SLACK_CLIENT_CHANNEL') || 'C07LFRA6P36';
  const cache = CacheService.getScriptCache();
  let idx = null;
  try { idx = JSON.parse(cache.get('thread_idx') || 'null'); } catch (e) {}
  if (!idx) {
    idx = {}; let cursor = '', err = '';
    for (let page = 0; page < 10; page++) {
      const res = UrlFetchApp.fetch('https://slack.com/api/conversations.history?limit=200&channel=' + ch + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''), {headers: {Authorization: 'Bearer ' + token}, muteHttpExceptions: true});
      const j = JSON.parse(res.getContentText() || '{}');
      if (!j.ok) { err = j.error || 'error'; break; }
      (j.messages || []).forEach(m => {
        const mm = String(m.text || '').match(/■名前：([^\n]+)/);
        if (!mm) return;
        const company = mm[1].split(/　|\s{2,}/)[0];
        const k = clientKey_(company);
        if (k && !idx[k]) idx[k] = m.ts;
      });
      cursor = (j.response_metadata || {}).next_cursor || '';
      if (!cursor) break;
    }
    if (err && !Object.keys(idx).length) return {url: '', err: err};
    try { cache.put('thread_idx', JSON.stringify(idx), 21600); } catch (e) {}
  }
  let ts = idx[key];
  if (!ts) { const k2 = Object.keys(idx).find(k => k.indexOf(key) >= 0 || key.indexOf(k) >= 0); if (k2) ts = idx[k2]; }
  if (!ts) return {url: ''};
  const url = 'https://writeuphq.slack.com/archives/' + ch + '/p' + String(ts).replace('.', '');
  writeSys_('threads/' + threadPath_(key), {client: client, key: key, url: url, by: 'auto'});
  return {url: url};
}


/* ---------- 担当企業（案件管理マスターシート › 01_案件マスタ のメイン／サブディレクター） ---------- */
const CLIENT_MASTER = '1LsPYSkdZXluqe5HP_T-exVYVu_jUfh88ADS96Qx0bvM';
function clients_(refresh) {
  const cache = CacheService.getScriptCache();
  if (!refresh) { const c = cache.get('clients_v1'); if (c) return JSON.parse(c); }
  const sh = SpreadsheetApp.openById(CLIENT_MASTER).getSheetByName('01_案件マスタ');
  const n = sh.getLastRow();
  const a = sh.getRange(2, 2, n - 1, 4).getDisplayValues();    // B:E 案件名・SIS・ステータス・案件区分
  const b = sh.getRange(2, 25, n - 1, 2).getDisplayValues();   // Y:Z メイン・サブディレクター
  const seen = {}, items = [];
  a.forEach((r, i) => {
    const name = String(r[0] || '').trim(), sis = String(r[1] || '').trim(), status = String(r[2] || '').trim();
    if (!name && !sis) return;
    if (/解約|完了/.test(status)) return;
    const key = sis || name; if (seen[key]) return; seen[key] = 1;
    items.push({sis: sis, name: name.replace(/^\d+_/, ''), label: (sis && name.indexOf(sis + '_') !== 0 ? sis + '_' : '') + name, status: status, kind: String(r[3] || ''), main: String(b[i][0] || '').trim(), sub: String(b[i][1] || '').trim()});
  });
  const out = {items: items, at: new Date().toISOString()};
  try { cache.put('clients_v1', JSON.stringify(out), 1800); } catch (e) {}
  return out;
}

/* ---------- AIに背景を聞く ----------
 * スクリプトプロパティ ANTHROPIC_API_KEY（または GEMINI_API_KEY）があればAIが説明を書く。
 * どちらも無いときは、記録から分かることだけを並べて返す。結果はタスクに保存して、全員が見られるようにする。 */
const SOURCE_GUIDE = {
  '議事録から取り込み': 'Googleの会議メモ（Geminiの議事録）を毎日夕方に自動で読み、決まったこと・宿題をタスクにしたもの。',
  '議事録から登録': '会議の議事録を読んで、決まったこと・宿題をタスクとして登録したもの。',
  '自動登録（定例資料の前日作成）': '顧客との定例MTGの前日に、定例資料（または継続提案資料の下書き）を自動で作成し、その確認を担当ディレクターに頼むもの。',
  '自動登録（定例フォロー昼）': '顧客との定例MTGの日の昼に、MTGでよりそいアンケート（顧客満足アンケート）への回答をお願いするよう担当ディレクターに頼むもの。',
  '自動登録（定例フォロー夕方）': '定例MTGの日の夕方に、議事録が見つからなかったため「今日の定例のまとめ」の空欄（決まったこと・次の一手）の記入を頼むもの。',
  'Slackの依頼から取り込み': 'Slackで送られていた依頼（定例資料の確認・定例のまとめ・アンケート依頼・感想のお願いなど）をボードに取り込んだもの。',
  '自動で取り込み': 'リスト作成依頼フォーム／タスク依頼フォーム（スプレッドシートの依頼一覧）に入った依頼を、ボードに自動で載せたもの。',
  'タスク管理表から取り込み': 'ボードを作ったときに、以前のタスク管理表（スプレッドシート）から移したもの。',
  '作成': 'ボードの「新規タスク」から人が登録したもの。'
};
function explain_(email, id, force) {
  if (!/^[A-Za-z0-9_\-]+$/.test(id)) throw new Error('invalid_id');
  const all = readAll_();
  const t = all['tasks/' + id];
  if (!t) throw new Error('not_found');
  if (t.ai && t.ai.text && !force) return t.ai;
  const roster = ((all['config/roster'] || {}).members) || [];
  const nm = k => { const m = roster.find(x => x.key === k); return m ? (m.full || m.name) : (k || ''); };
  const proj = t.projectId ? all['projects/' + t.projectId] : null;
  const comments = Object.keys(all).filter(k => k.indexOf('tasks/' + id + '/comments/') === 0).map(k => all[k]).sort((a, b) => String(a.at).localeCompare(String(b.at))).slice(-10);
  const first = ((t.history || [])[0] || {}).text || '';
  const guideKey = Object.keys(SOURCE_GUIDE).find(k => first.indexOf(k) === 0);
  const ctx = [
    'タイトル：' + t.title,
    '種類：' + (t.kind || '通常タスク'),
    '依頼者：' + nm(t.requester) + '／担当：' + (t.assignees || []).map(nm).join('、'),
    '期限：' + (t.due || 'なし') + '／状態：' + (t.status || ''),
    '案件（顧客）：' + (t.client || 'なし'),
    'プロジェクト：' + (proj ? proj.name + (proj.desc ? '（' + proj.desc + '）' : '') : 'なし'),
    '入った経路：' + first + (guideKey ? '　→ ' + SOURCE_GUIDE[guideKey] : ''),
    t.sourceLabel ? '取り込み元：' + t.sourceLabel : '',
    t.meetingTitle ? '元の会議：' + t.meetingTitle + (t.meetingUrl ? '（' + t.meetingUrl + '）' : '') : '',
    'メモ：\n' + (t.memo || '（なし）'),
    comments.length ? 'コメント：\n' + comments.map(c => '・' + nm(c.by) + '：' + String(c.text || '').slice(0, 300)).join('\n') : '',
    '更新履歴：\n' + (t.history || []).slice(-8).map(h => '・' + String(h.at).slice(0, 10) + ' ' + nm(h.by) + '：' + h.text).join('\n')
  ].filter(Boolean).join('\n');
  let text = '', by = 'record';
  try {
    const r = llm_(ctx);
    if (r) { text = r.text; by = r.by; }
  } catch (e) { text = ''; }
  if (!text) {
    text = '【どこから来たか】\n' + (guideKey ? SOURCE_GUIDE[guideKey] : (first || '記録がありません')) +
      (t.meetingTitle ? '\n元の会議：' + t.meetingTitle : '') +
      '\n\n【やること】\n' + (t.memo || t.title) +
      '\n\n【分からないとき】\n依頼者の' + nm(t.requester) + 'さんにコメントで聞いてください。' +
      (by === 'record' ? '\n\n（AIの設定がまだのため、記録から分かることだけを表示しています）' : '');
  }
  const ai = {text: text, at: new Date().toISOString(), by: by, askedBy: email};
  write_(email, 'tasks/' + id, {ai: ai}, 'update');
  return ai;
}
function llm_(ctx) {
  const props = PropertiesService.getScriptProperties();
  const sys = 'あなたは株式会社ライトアップのCSチームのタスクボードの案内役です。担当者が「なにこのタスク？」と思ったときに読む説明を、日本語で書きます。' +
    '次の4つの見出しで、それぞれ1〜3行の箇条書きにしてください：【どこから来たか】【なぜ必要か（背景）】【何をすれば終わりか】【分からないとき誰に聞くか】。' +
    '記録に書かれていないことは作らず、推測するときは「〜と思われます」と書いてください。全体で350字以内。挨拶や前置きは不要です。';
  const user = '次のタスクについて説明してください。\n\n' + ctx;
  const ak = props.getProperty('ANTHROPIC_API_KEY');
  if (ak) {
    const model = props.getProperty('ANTHROPIC_MODEL') || 'claude-sonnet-5-5';
    const r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: {'x-api-key': ak, 'anthropic-version': '2023-06-01'},
      payload: JSON.stringify({model: model, max_tokens: 900, system: sys, messages: [{role: 'user', content: user}]})});
    if (r.getResponseCode() === 200) {
      const j = JSON.parse(r.getContentText());
      return {text: (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim(), by: 'claude'};
    }
    console.warn('anthropic ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 300));
  }
  const gk = props.getProperty('GEMINI_API_KEY');
  if (gk) {
    const model = props.getProperty('GEMINI_MODEL') || 'gemini-2.5-flash';
    const r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: {'x-goog-api-key': gk},
      payload: JSON.stringify({systemInstruction: {parts: [{text: sys}]}, contents: [{role: 'user', parts: [{text: user}]}], generationConfig: {maxOutputTokens: 900}})});
    if (r.getResponseCode() === 200) {
      const j = JSON.parse(r.getContentText());
      return {text: (((j.candidates || [])[0] || {}).content || {parts: []}).parts.map(p => p.text || '').join('').trim(), by: 'gemini'};
    }
    console.warn('gemini ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 300));
  }
  return null;
}

/* ---------- 初回だけ：権限の確認（エディタで一度実行する） ---------- */
function setup() {
  sheet_();
  CalendarApp.getDefaultCalendar();
  UrlFetchApp.getRequest('https://slack.com/api/api.test');
  Logger.log('準備できました：' + DB_SHEET + ' シートを確認してください');
}

/* Slack通知の確認（エディタで実行すると、北原さんにDMが1通届く） */
function testSlack() { Logger.log(JSON.stringify(slack_('U09T80ZAMT3', '【CSタスク】ボードからのテスト通知です。このメッセージが届いていれば、Slack通知はつながっています。\n[ボードを開く](https://cs-team-portal.vercel.app/board)'))); }


/* ---------- 添付ファイル（アップロードした人のドライブに置き、ライトアップの人が見られる設定にする） ---------- */
function attachFolder_() {
  const props = PropertiesService.getUserProperties();
  const id = props.getProperty('attach_folder');
  if (id) { try { const fo = DriveApp.getFolderById(id); if (!fo.isTrashed()) return fo; } catch (e) {} }
  const fo = DriveApp.createFolder('CSタスクボード_添付ファイル');
  try { fo.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  props.setProperty('attach_folder', fo.getId());
  return fo;
}
function domainView_(f) {
  try { f.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW); return 'domain'; }
  catch (e) { try { f.setSharing(DriveApp.Access.DOMAIN, DriveApp.Permission.VIEW); return 'domain'; } catch (e2) { return 'private'; } }
}
function driveAuth_() {
  try {
    const info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL, ['https://www.googleapis.com/auth/drive']);
    if (info.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) return {needAuth: true, authUrl: info.getAuthorizationUrl()};
  } catch (e) {}
  return null;
}
// ブラウザから直接ドライブへアップロードするための準備（本人のトークンと保存先フォルダ）
function attachInit_() {
  const na = driveAuth_(); if (na) return na;
  try { return {token: ScriptApp.getOAuthToken(), folderId: attachFolder_().getId(), email: Session.getActiveUser().getEmail()}; }
  catch (e) {
    if (/権限|permission|auth/i.test(String(e && e.message || e))) {
      let url = ''; try { url = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL).getAuthorizationUrl(); } catch (e2) {}
      return {needAuth: true, authUrl: url};
    }
    throw e;
  }
}
function attach_(email, req) {
  const na = driveAuth_(); if (na) return na;
  const name = String(req.name || 'file').replace(/[\\/:*?"<>|]/g, '_').slice(0, 200);
  const b64 = String(req.b64 || '');
  if (!b64) throw new Error('empty');
  if (b64.length > 34000000) throw new Error('too_large');
  const blob = Utilities.newBlob(Utilities.base64Decode(b64), String(req.mime || 'application/octet-stream'), name);
  let f;
  try { f = attachFolder_().createFile(blob); }
  catch (e) {
    if (/権限|permission|auth/i.test(String(e && e.message || e))) {
      let url = ''; try { url = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL).getAuthorizationUrl(); } catch (e2) {}
      return {needAuth: true, authUrl: url};
    }
    throw e;
  }
  try { f.setDescription('CSタスクボードの添付（タスク ' + String(req.taskId || '') + '／' + email + '）'); } catch (e) {}
  const shared = domainView_(f);
  return {id: f.getId(), name: name, url: f.getUrl(), mime: blob.getContentType(), size: f.getSize(), shared: shared};
}
function shareDomain_(fileId) {
  if (!/^[A-Za-z0-9_\-]{10,}$/.test(fileId)) return {shared: 'unknown'};
  try { const f = DriveApp.getFileById(fileId); return {shared: domainView_(f), name: f.getName()}; }
  catch (e) { return {shared: 'unknown'}; }
}


/* ---------- 共有の添付フォルダ（北原さんのドライブ）へのアップロード ----------
 * メンバーは自分のドライブの許可なしで添付できる。ボード（本人として実行）が短時間有効の受付票を発行し、
 * 「自分として実行」で別にデプロイしたアップロード用URL（doPost）が受付票を確かめて保存・削除する。 */
const UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbyVg-wS2J_tQ1tHCPEUPgX0EFGIh3MploY1GC2nqAvoOU-3OtA7ZiwD1xCnhWspwuln/exec';   // アップロード用デプロイ（実行：自分／アクセス：全員）の /exec URL
function attachSecret_() {
  const p = PropertiesService.getScriptProperties();
  let s = p.getProperty('ATTACH_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('ATTACH_SECRET', s); }
  return s;
}
function sign_(body) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body, attachSecret_())); }
function attachTicket_(email) {
  const url = UPLOAD_URL || PropertiesService.getScriptProperties().getProperty('UPLOAD_URL') || '';
  if (!url) return {noUpload: true};
  const body = String(email || '').toLowerCase() + '|' + (Date.now() + 3 * 3600 * 1000);
  return {uploadUrl: url, ticket: body + '|' + sign_(body)};
}
function checkTicket_(t) {
  const p = String(t || '').split('|');
  if (p.length !== 3) return '';
  const body = p[0] + '|' + p[1];
  if (sign_(body) !== p[2] || +p[1] < Date.now() || !/@writeup\.co\.jp$/i.test(p[0])) return '';
  return p[0];
}
function sharedFolder_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('ATTACH_FOLDER');
  if (id) { try { const f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) {} }
  const f = DriveApp.createFolder('CSタスクボード_添付ファイル（共有）');
  try { f.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  p.setProperty('ATTACH_FOLDER', f.getId());
  return f;
}
function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const who = checkTicket_(req.ticket);
    if (!who) throw new Error('受付票が無効です。ボードを開き直してください');
    const folder = sharedFolder_();
    if (req.op === 'upload') {
      const name = String(req.name || 'file').replace(/[\\/:*?"<>|]/g, '_').slice(0, 200);
      const b64 = String(req.b64 || '');
      if (!b64) throw new Error('ファイルが空です');
      const blob = Utilities.newBlob(Utilities.base64Decode(b64), String(req.mime || 'application/octet-stream'), name);
      const f = folder.createFile(blob);
      try { f.setDescription('CSタスクボードの添付（タスク ' + String(req.taskId || '') + '／' + who + '）'); } catch (e2) {}
      let shared = 'domain';
      try { f.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW); } catch (e3) { shared = 'private'; }
      out = {ok: true, id: f.getId(), name: name, url: f.getUrl(), mime: blob.getContentType(), size: f.getSize(), shared: shared, central: true};
    } else if (req.op === 'trash') {
      const f = DriveApp.getFileById(String(req.fileId || ''));
      let inFolder = false; const it = f.getParents();
      while (it.hasNext()) if (it.next().getId() === folder.getId()) inFolder = true;
      if (!inFolder) throw new Error('ボードの添付フォルダのファイルではありません');
      f.setTrashed(true);
      out = {ok: true};
    } else throw new Error('不明な操作です');
  } catch (err) { out = {ok: false, error: String(err && err.message || err)}; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
