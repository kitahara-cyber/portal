# 事例ポータル 自動更新

スプシ「新規開拓 事例ポータル 事例マスター」を読み込み、パスワードで暗号化して `cases/index.html` を作ります。
GitHub Actions(`.github/workflows/cases.yml`)が毎時実行し、スプシに変更があるときだけ公開を更新します。

- `template.html` … 画面のデザインとプログラム(データは入っていません)
- `schema.js` … スプシの列の定義と、行→データの変換
- `build.js` … スプシ取得 → 差し込み → 暗号化
- `gate.html` … パスワード入力画面

## 必要な設定(GitHub の Settings → Secrets and variables → Actions)
| 名前 | 中身 |
|---|---|
| `SHEET_ID` | スプシのURLの `/d/` と `/edit` の間の文字列 |
| `GOOGLE_SA_JSON` | Googleのサービスアカウントの鍵(JSONを丸ごと)。スプシを「閲覧者」で共有しておく |
| `PORTAL_PASSWORD` | ポータルのパスワード |

データ本体(事例の文章・数値)はこのリポジトリに入れません。公開リポジトリに平文で置くと、パスワードの意味がなくなるためです。
