"""担当ディレクターの顔写真（暗号化済み avatars.enc）から1人分を取り出す。
使い方: python3 avatar.py <鍵> <担当名> <出力.txt>   ※該当がなければ空ファイル（イニシャル表示になる）"""
import sys,json,base64,os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
key,name,out=sys.argv[1:4]
raw=base64.b64decode(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'avatars.enc')).read())
A=json.loads(AESGCM(base64.urlsafe_b64decode(key)).decrypt(raw[:12],raw[12:],None))
open(out,'w').write(A.get(name,''));print('ok' if name in A else 'なし（イニシャルで表示）')
