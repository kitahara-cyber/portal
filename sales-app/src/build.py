# sales-app/src/index.html から sales-app/app.js を作る。
# 使い方：リポジトリの一番上で  python3 sales-app/src/build.py
import re, json, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'index.html'), encoding='utf-8').read()
css = re.search(r'<style>([\s\S]*?)</style>', src).group(1)
body = re.search(r'<body[^>]*>([\s\S]*?)<script>', src).group(1)
app = re.search(r'<script>([\s\S]*?)</script>\s*</body>', src).group(1)
head = """/* セルコン 見込みボード（Apps Script版）— このファイルは build.py で作る。元：sales-app/src/index.html */
(function(){
  var f=document.createElement('link'); f.rel='stylesheet'; f.href='https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap'; document.head.appendChild(f);
  var st=document.createElement('style'); st.textContent=%s; document.head.appendChild(st);
  var l=document.getElementById('gas-loading'); if(l) l.remove();
  var wrap=document.createElement('div'); wrap.innerHTML=%s; while(wrap.firstChild) document.body.appendChild(wrap.firstChild);
})();
""" % (json.dumps(css, ensure_ascii=False), json.dumps(body, ensure_ascii=False))
out = head + app
open(os.path.join(here, '..', 'app.js'), 'w', encoding='utf-8').write(out)
print(len(out))
