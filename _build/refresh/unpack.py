"""kit.enc（または devkit.enc）を復号して /home/claude/ 以下に広げる。使い方: python3 _build/refresh/unpack.py <鍵> [kit.enc|devkit.enc]"""
import tarfile, io, os, base64, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
raw = base64.b64decode(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), sys.argv[2] if len(sys.argv) > 2 else 'kit.enc')).read())
data = AESGCM(base64.urlsafe_b64decode(sys.argv[1])).decrypt(raw[:12], raw[12:], None)
with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as t:
    for m in t.getmembers():
        if m.name.startswith('/') or '..' in m.name: raise SystemExit('不正なパス')
    t.extractall('/home/claude/')
print('unpacked to /home/claude/')
