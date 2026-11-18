"""継続提案資料を、お客様の顧客ポータルの「資料」タブにも入れる（11/18 北原さん「定例資料に加え、継続提案資料も出てくるように」「作ったらすぐ出す」）。
使い方: python3 _build/teirei/renew_to_portal.py <SIS> <定例日YYYYMMDD> <社内パスワード> <お客様のポータルのパスワード>
・renew/<SIS>/<定例日>/index.html を社内パスワードで開き、元データ（renew-src）から「変更を頼む」ボタンなしの版を作り直して、
  c/<SIS>/index.html の「資料」タブに「M月D日 継続のご提案」として入れる（同じ日の分は差し替え）。
・料金・割引・特典は「継続条件」タブに担当が書いた値だけ（無ければ「担当よりご案内します」）。社内向けの案は入らない。"""
import sys, os, re, json, html, subprocess, tempfile
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(os.path.dirname(H))
sys.path.insert(0, H); import pcrypt
sis, day, ipw, cpw = sys.argv[1:5]
src = os.path.join(R, 'renew', sis, day, 'index.html'); page = os.path.join(R, 'c', sis, 'index.html')
if not os.path.exists(src): raise SystemExit(f'継続提案資料がありません: {src}')
if not os.path.exists(page): raise SystemExit(f'顧客ポータルがありません: {page}')
b = pcrypt.open_page(open(src).read(), ipw)[0]
j = json.loads(html.unescape(re.search(r'<textarea id="renew-src" hidden>(.*?)</textarea>', b, re.S).group(1)))
d = tempfile.mkdtemp()
for k in ('data', 'facts', 'story'): json.dump(j[k], open(f'{d}/{k}.json', 'w'), ensure_ascii=False)
args = ['python3', f'{H}/renew.py', f'{d}/data.json', f'{d}/facts.json', f'{d}/story.json', f'{d}/out.html', '--sis', sis, '--no-edit']
m = re.search(r'担当ディレクター ([^<]*)</b>', b)
if m and m.group(1).strip(): args += ['--director', m.group(1).strip()]
m = re.search(r'<div class="who"><img src="([^"]+)"', b)
if m: open(f'{d}/av.txt', 'w').write(m.group(1)); args += ['--avatar', f'{d}/av.txt']
subprocess.run(args, check=True, capture_output=True)
t = open(f'{d}/out.html').read().replace('id="renew-src"', 'id="renew-src-x"')
t = re.sub(r'<textarea id="renew-src-x" hidden>.*?</textarea>', '', t, flags=re.S)  # 元データはお客様向けには入れない
open(f'{d}/out.html', 'w').write(t)
date = f'{day[:4]}-{day[4:6]}-{day[6:8]}'
r = subprocess.run(['python3', f'{H}/embed.py', page, cpw, f'{d}/out.html', date, '--kind', 'renew'], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip())
