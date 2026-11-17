# CSチーム タスクボード（Apps Script版）

- `board.js`：画面のプログラム。Apps Script の `Code.gs` がこのファイルを読み込んで表示する（10分キャッシュ。すぐ反映したいときはエディタで `refreshApp` を実行）。
- `Code.gs`：Apps Script に貼るサーバー側のコード（控え）。
- データは「タスク管理表」スプレッドシートの `_board_db` シートに保存される。
- このブランチは main（お客様ポータル）とは別。GitHub Pages には載らない。
