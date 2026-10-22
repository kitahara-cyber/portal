#!/usr/bin/env python3
"""lock.py: HTML本文をパスワードで暗号化し、入力画面つきの1ファイルにする。
使い方: python3 lock.py <本文.html> <出力.html> --password PW --title "画面の見出し" [--eyebrow TEXT] [--head-file 先頭に置くtitle/link等] [--standalone]
本文には <style> と本文要素と <script> を含めてよい（復号後に実行される）。"""
import argparse, base64, hashlib, json, os, html
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ap=argparse.ArgumentParser()
ap.add_argument("src");ap.add_argument("out");ap.add_argument("--password",required=True)
ap.add_argument("--title",required=True);ap.add_argument("--eyebrow",default="CLIENT PORTAL")
ap.add_argument("--head-file");ap.add_argument("--standalone",action="store_true")
ap.add_argument("--storage-key",default="portal-pw")
a=ap.parse_args()
body=open(a.src,encoding="utf8").read()
salt,iv,n=os.urandom(16),os.urandom(12),300000
key=hashlib.pbkdf2_hmac("sha256",a.password.encode(),salt,n,32)
ct=AESGCM(key).encrypt(iv,body.encode("utf8"),None)
b=lambda x:base64.b64encode(x).decode()
P=json.dumps({"s":b(salt),"i":b(iv),"n":n,"c":b(ct)})
head=open(a.head_file,encoding="utf8").read() if a.head_file else ""
gate=f'''<style>
:root{{--g-bg:#16181c;--g-tx:#f4f2ec;--g-mute:#a7a59f;--g-acc:#d9481f;--g-font:"Noto Sans JP","Hiragino Sans","Yu Gothic",system-ui,sans-serif;--g-mono:"IBM Plex Mono",ui-monospace,Menlo,monospace}}
body{{margin:0;background:var(--g-bg)}}
.gate{{min-height:100vh;min-height:100dvh;background:var(--g-bg);color:var(--g-tx);font-family:var(--g-font);display:grid;place-items:center;padding-block:40px;padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))}}
.gate form{{width:100%;max-width:400px;display:grid;gap:14px}}
.gate .eb{{font-family:var(--g-mono);font-size:12px;color:var(--g-acc);letter-spacing:.06em}}
.gate h1{{margin:0;color:var(--g-tx);font-size:clamp(1.5rem,5vw,2rem);font-weight:900;line-height:1.35}}
.gate p{{margin:0;color:var(--g-mute);font-size:13.5px}}
.gate label{{font-size:12px;font-weight:700;color:var(--g-mute)}}
.gate .f{{display:flex;gap:8px}}
.gate input[type=password]{{flex:1;min-width:0;font:inherit;font-size:15px;padding:11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:var(--g-tx)}}
.gate button{{font:inherit;font-weight:700;font-size:14px;border:0;border-radius:10px;padding:0 18px;background:var(--g-acc);color:#fff;cursor:pointer}}
.gate button:disabled{{opacity:.6}}
.gate .err{{color:#ff9b7a;font-size:13px;min-height:1.5em}}
.gate .rm{{display:flex;gap:8px;align-items:center;font-weight:500}}
</style>
<div class="gate" id="gate"><form id="gf" autocomplete="off">
  <span class="eb">{html.escape(a.eyebrow)}</span>
  <h1>{a.title}</h1>
  <p>ご案内したパスワードを入力してください。</p>
  <label for="pw">パスワード</label>
  <div class="f"><input id="pw" type="password" autocomplete="current-password" required><button id="go" type="submit">開く</button></div>
  <label class="rm"><input id="rm" type="checkbox" checked> このタブを閉じるまでパスワードを省略する</label>
  <p class="err" id="err" aria-live="polite"></p>
</form></div>
<div id="app"></div>
<script>
const P={P}, SK={json.dumps(a.storage_key)};
const u8=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function unlock(pw){{const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(pw),"PBKDF2",false,["deriveKey"]);
 const key=await crypto.subtle.deriveKey({{name:"PBKDF2",salt:u8(P.s),iterations:P.n,hash:"SHA-256"}},base,{{name:"AES-GCM",length:256}},false,["decrypt"]);
 return new TextDecoder().decode(await crypto.subtle.decrypt({{name:"AES-GCM",iv:u8(P.i)}},key,u8(P.c)));}}
function mount(h){{const app=document.getElementById("app");app.innerHTML=h;
 app.querySelectorAll("script").forEach(o=>{{const s=document.createElement("script");s.textContent=o.textContent;o.replaceWith(s)}});
 document.getElementById("gate").remove();if(location.hash){{const t=document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView()}}}}
async function tryPw(pw,quiet){{const btn=document.getElementById("go"),err=document.getElementById("err");btn.disabled=true;err.textContent=quiet?"":"確認しています…";
 try{{const h=await unlock(pw);try{{if(document.getElementById("rm").checked)sessionStorage.setItem(SK,pw)}}catch(_){{}}mount(h)}}
 catch(_){{err.textContent=quiet?"":"パスワードが違います。もう一度入力してください。";btn.disabled=false;try{{sessionStorage.removeItem(SK)}}catch(_){{}}}}}}
document.getElementById("gf").addEventListener("submit",e=>{{e.preventDefault();tryPw(document.getElementById("pw").value,false)}});
try{{const v=sessionStorage.getItem(SK);if(v)tryPw(v,true)}}catch(_){{}}
</script>
'''
out=head+gate
if a.standalone:
    out='<!doctype html>\n<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow">\n'+head+'</head><body>'+gate+'</body></html>'
open(a.out,"w",encoding="utf8").write(out)
print("wrote",a.out,len(out))
