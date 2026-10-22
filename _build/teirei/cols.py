"""共有シートの営業リストの見出し行（get_values で A1:BZ1 を取った保存ファイル or JSON）から、
定例資料に必要な列だけを、まとめて取れる範囲（A1形式）に直して出す。
使い方: python3 cols.py <見出し.json> <タブ名> <行数>
出力: 取るべき範囲（1行に1つ）。例: 営業リスト!S1:Y11451"""
import sys,json,re,unicodedata
N=lambda s:unicodedata.normalize('NFKC',str(s or '')).strip()
d=json.load(open(sys.argv[1]));h=[N(x) for x in (d['values'][0] if isinstance(d,dict) else d[0])];tab=sys.argv[2];n=sys.argv[3]
want=set()
for i,c in enumerate(h):
    if c.startswith('架電履歴'): want|={i,i+1}
    if c.startswith('架電メモ') or c=='架電担当': want.add(i)
    if any(k in c for k in ('セグメント','リスト種別','企業名','会社名','法人名','組織名','住所','所在地','被保険者数','従業員数','東証業種')) and 'メモ' not in c: want.add(i)
def L(i):
    s='';i+=1
    while i: i,r=divmod(i-1,26);s=chr(65+r)+s
    return s
w=sorted(x for x in want if x<len(h)+1)
blocks=[];
for i in w:
    if blocks and i-blocks[-1][1]<=3: blocks[-1][1]=i
    else: blocks.append([i,i])
for a,b in blocks: print(f"{tab}!{L(a)}1:{L(b)}{n}")
