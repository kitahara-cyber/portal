# CSチーム タスクボード（Apps Script版）

- `board.js`：画面のプログラム。Apps Script の `Code.gs` がこのファイルを読み込んで表示する（10分キャッシュ。すぐ反映したいときはエディタで `refreshApp` を実行）。
- `Code.gs`：Apps Script に貼るサーバー側のコード（控え）。
- データは「タスク管理表」スプレッドシートの `_board_db` シートに保存される。
- このブランチは main（お客様ポータル）とは別。GitHub Pages には載らない。
- `src/index.html`・`src/shim.js`：画面の元のソース。直すのはこちら。`python3 board-app/src/build.py` で `board.js` を作り直してから push する。
- 引継ぎ書・設計図：Claude Docs「CSタスクボード 引継ぎ書・設計図」。
