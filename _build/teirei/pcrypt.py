"""ポータルの暗号化ページを開く／閉じる共通の部品（gzip 圧縮つきにも対応）。"""
import re, json, base64, hashlib, gzip, os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
RX = re.compile(r'const P=(\{"s": "[^"]+", "i": "[^"]+", "n": \d+, "c": "[^"]+"\})')
def open_page(page, pw):
    m = RX.search(page); P = json.loads(m.group(1)); B = base64.b64decode
    raw = AESGCM(hashlib.pbkdf2_hmac('sha256', pw.encode(), B(P['s']), P['n'], 32)).decrypt(B(P['i']), B(P['c']), None)
    z = 'const PZ=1;' in page[:m.start() + 20] or 'const PZ=1;' in page
    return (gzip.decompress(raw) if z else raw).decode('utf8'), m, P, z
def close_page(page, m, P, body, pw, z):
    salt, iv = os.urandom(16), os.urandom(12)
    key = hashlib.pbkdf2_hmac('sha256', pw.encode(), salt, P['n'], 32)
    raw = body.encode('utf8'); raw = gzip.compress(raw, 9, mtime=0) if z else raw
    b = lambda x: base64.b64encode(x).decode()
    NP = json.dumps({"s": b(salt), "i": b(iv), "n": P['n'], "c": b(AESGCM(key).encrypt(iv, raw, None))})
    return page[:m.start(1)] + NP + page[m.end(1):]
