/**
 * キントーン「JDネットパートナー案件管理」(アプリ 497) → 設定シートの「キントーン」タブへ、1時間ごとに写す。
 * ・キントーンのAPIトークン（レコード閲覧のみ）はスクリプトプロパティ KINTONE_TOKEN に入れる。コードやシートには書かない。
 * ・AI（自動の仕組み）はこのタブを読むだけ。キントーンのログイン情報やトークンには触れない。
 * 使い方：設定シートで［拡張機能］→［Apps Script］に貼り付け → setup() を1回実行（権限を許可）。
 */
const KT_DOMAIN = 'writeup.cybozu.com';
const KT_APP = 497;
const TAB = 'キントーン';
const FIELDS = ['SIS','代理店名','ステータス_1','案件区分','メインディレクター','サブディレクター','スタートアップ担当',
  '稼働開始予定','テレアポ開始日','架電終了月','_1年目の契約満了月','更新ステータス','継続確度','更新後月額費用',
  '必要架電数','月間テレアポ架電件数','次回MTG日時','共有シート','CS最新タスク','CS最新期限','戦術検討','解約理由','継続理由','更新日時'];

function setup() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'syncKintone').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncKintone').timeBased().everyHours(1).create();
  syncKintone();
}

function syncKintone() {
  const token = PropertiesService.getScriptProperties().getProperty('KINTONE_TOKEN');
  if (!token) throw new Error('スクリプトプロパティ KINTONE_TOKEN がありません');
  const rows = [];
  let lastId = 0;
  while (true) {
    const q = `$id > ${lastId} order by $id asc limit 500`;
    const url = `https://${KT_DOMAIN}/k/v1/records.json?app=${KT_APP}&query=${encodeURIComponent(q)}` + FIELDS.concat(['$id']).map(f => '&fields[]=' + encodeURIComponent(f)).join('');
    const res = UrlFetchApp.fetch(url, { headers: { 'X-Cybozu-API-Token': token }, muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error('キントーンの読み込みに失敗：' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 200));
    const recs = JSON.parse(res.getContentText()).records;
    recs.forEach(r => rows.push(FIELDS.map(f => {
      const v = r[f] ? r[f].value : '';
      if (Array.isArray(v)) return v.map(x => (x && x.name) || x).join('/');
      if (v && typeof v === 'object') return v.name || v.code || '';
      return v == null ? '' : String(v);
    })));
    if (recs.length < 500) break;
    lastId = Number(recs[recs.length - 1]['$id'].value);
  }
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(TAB) || ss.insertSheet(TAB);
  sh.clearContents();
  const stamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
  sh.getRange(1, 1, 1, FIELDS.length + 1).setValues([FIELDS.concat(['写した日時'])]);
  if (rows.length) sh.getRange(2, 1, rows.length, FIELDS.length + 1).setNumberFormat('@').setValues(rows.map(r => r.concat([stamp])));
  sh.setFrozenRows(1);
}
