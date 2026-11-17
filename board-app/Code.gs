/**
 * CSチーム タスクボード（Googleアカウントで開く版）
 * - 画面：Vercel の https://cs-team-portal.vercel.app/app/board.js を読み込んで表示（画面の更新はVercel側だけで済む）
 * - データ：このスクリプトに設定したスプレッドシート（タスク管理表）の「_board_db」シート
 * - 通知：スクリプトプロパティ SLACK_BOT_TOKEN（各人にDM）または SLACK_WEBHOOK_URL（チャンネルにメンション付きで投稿）
 *
 * 公開設定：デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *   次のユーザーとして実行：自分 ／ アクセスできるユーザー：株式会社ライトアップ（writeup.co.jp）内の全員
 */

const SHEET_ID = '1GKcj5qfLoaUlhqxEMEicIxhPbCPCyLkUCJkELnK6wkg';   // タスク管理表
const DB_SHEET = '_board_db';
// 画面のプログラム（GitHub の kitahara-cyber/portal の board-app ブランチ。更新はこのブランチに入れるだけで反映される）
const APP_JS   = 'https://raw.githubusercontent.com/kitahara-cyber/portal/board-app/board-app/board.js';
const LEADS    = ['takahashi', 'sato', 'koguchi', 'kitahara'];      // プロジェクト・名簿・設定を変更できる人（名簿の key）
// 読み取りを許すスプレッドシート（フォーム依頼・交流会の参加台帳）
const READABLE_SHEETS = ['1GKcj5qfLoaUlhqxEMEicIxhPbCPCyLkUCJkELnK6wkg', '1S4GDhuB8DGv5I0_LKL_Aqhsqd3ak6jvNSux78zEa4yE'];

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
  if (/^(config|projects)\//.test(path)) return LEADS.indexOf(memberKey_(email)) >= 0;
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

/* ---------- カレンダー ---------- */
function calList_(calendarId, start, end) {
  const cal = CalendarApp.getCalendarById(calendarId);
  if (!cal) throw new Error('calendar_not_shared');
  const evs = cal.getEvents(new Date(start + '+09:00'), new Date(end + '+09:00'));
  return {items: evs.map(e => ({
    summary: e.getTitle(),
    start: e.isAllDayEvent() ? {date: Utilities.formatDate(e.getAllDayStartDate(), 'Asia/Tokyo', 'yyyy-MM-dd')} : {dateTime: Utilities.formatDate(e.getStartTime(), 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm:ssXXX")},
    end: e.isAllDayEvent() ? {date: Utilities.formatDate(e.getAllDayEndDate(), 'Asia/Tokyo', 'yyyy-MM-dd')} : {dateTime: Utilities.formatDate(e.getEndTime(), 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm:ssXXX")},
    status: 'confirmed'
  }))};
}
function calCreate_(req) {
  const ev = CalendarApp.getDefaultCalendar().createEvent(String(req.summary || '').slice(0, 200), new Date(req.start + '+09:00'), new Date(req.end + '+09:00'), {
    description: String(req.description || '').slice(0, 4000),
    guests: (req.guests || []).join(','),
    sendInvites: true
  });
  return {id: ev.getId()};
}

/* ---------- 初回だけ：権限の確認（エディタで一度実行する） ---------- */
function setup() {
  sheet_();
  CalendarApp.getDefaultCalendar();
  UrlFetchApp.getRequest('https://slack.com/api/api.test');
  Logger.log('準備できました：' + DB_SHEET + ' シートを確認してください');
}
