// スプシ → 暗号化したポータル(index.html)を作る
//   環境変数: PORTAL_PASSWORD(必須) / SHEET_ID + GOOGLE_SA_JSON(本番) / SHEET_FIXTURE(テスト用のJSON)
const fs=require('fs'),path=require('path'),crypto=require('crypto'),https=require('https');
const {CASE_SHEET,CAT_SHEET,fromRows}=require('./schema');
const OUT=process.argv[2]||path.join(__dirname,'../../cases/index.html');
const PLAIN=process.env.PLAIN_OUT; // テスト用: 暗号化前のHTMLも書き出す

function post(host,p,body,headers){return new Promise((res,rej)=>{const r=https.request({host,path:p,method:'POST',headers},x=>{let b='';x.on('data',d=>b+=d);x.on('end',()=>x.statusCode<300?res(JSON.parse(b)):rej(new Error(host+' '+x.statusCode+' '+b.slice(0,300))))});r.on('error',rej);r.end(body)})}
function get(host,p,headers){return new Promise((res,rej)=>{https.get({host,path:p,headers},x=>{let b='';x.on('data',d=>b+=d);x.on('end',()=>x.statusCode<300?res(JSON.parse(b)):rej(new Error(host+' '+x.statusCode+' '+b.slice(0,300))))}).on('error',rej)})}
const b64u=b=>Buffer.from(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function token(sa){
  const now=Math.floor(Date.now()/1000);
  const h=b64u(JSON.stringify({alg:'RS256',typ:'JWT'})),c=b64u(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/spreadsheets.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3000}));
  const sig=b64u(crypto.createSign('RSA-SHA256').update(h+'.'+c).sign(sa.private_key));
  const body='grant_type='+encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')+'&assertion='+h+'.'+c+'.'+sig;
  return (await post('oauth2.googleapis.com','/token',body,{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body)})).access_token;
}
async function load(){
  if(process.env.SHEET_FIXTURE){const f=JSON.parse(fs.readFileSync(process.env.SHEET_FIXTURE,'utf8'));return [f.cases,f.cats]}
  const id=process.env.SHEET_ID,sa=JSON.parse(process.env.GOOGLE_SA_JSON||'null');
  if(!id||!sa)throw new Error('SHEET_ID と GOOGLE_SA_JSON が設定されていません');
  const t=await token(sa),H={Authorization:'Bearer '+t};
  const rng=n=>get('sheets.googleapis.com','/v4/spreadsheets/'+id+'/values/'+encodeURIComponent(n)+'?valueRenderOption=UNFORMATTED_VALUE',H).then(r=>r.values||[]);
  return [await rng(CASE_SHEET),await rng(CAT_SHEET)];
}
function encrypt(src,pw){
  const s=crypto.randomBytes(16),iv=crypto.randomBytes(12),n=250000;
  const key=crypto.pbkdf2Sync(pw,s,n,32,'sha256');
  const ci=crypto.createCipheriv('aes-256-gcm',key,iv);
  const enc=Buffer.concat([ci.update(src,'utf8'),ci.final(),ci.getAuthTag()]);
  const P={s:s.toString('base64'),i:iv.toString('base64'),n,c:enc.toString('base64')};
  return fs.readFileSync(path.join(__dirname,'gate.html'),'utf8').replace('__PAYLOAD__',JSON.stringify(P));
}
(async()=>{
  const pw=process.env.PORTAL_PASSWORD;if(!pw)throw new Error('PORTAL_PASSWORD がありません');
  const [cr,kr]=await load();
  const d=fromRows(cr,kr);
  if(d.CS.length<1)throw new Error('公開する事例が0件です。シートを確認してください(公開列がTRUEの行が必要です)');
  const usedCats=new Set(d.CS.map(c=>c.cat));
  Object.keys(d.CATS).forEach(k=>{if(!usedCats.has(k))delete d.CATS[k]}); // 事例のない業種は出さない
  const tpl=fs.readFileSync(path.join(__dirname,'template.html'),'utf8');
  const data='var CATS='+JSON.stringify(d.CATS)+';\nvar CS='+JSON.stringify(d.CS)+';\nvar STORY='+JSON.stringify(d.STORY)+';';
  const html=tpl.replace('/*__DATA__*/',()=>data);
  if(html.includes('__DATA__'))throw new Error('テンプレートの差し込みに失敗');
  if(PLAIN)fs.writeFileSync(PLAIN,html);
  // 中身が前回と同じなら書き換えない(暗号化のたびに値が変わり、毎回コミットが増えるのを防ぐ)
  const tag=crypto.createHmac('sha256',pw).update(html).digest('hex');
  const tagFile=OUT+'.tag';
  const prev=fs.existsSync(tagFile)?fs.readFileSync(tagFile,'utf8').trim():'';
  const summary='事例 '+d.CS.length+' 件 / 業種 '+Object.keys(d.CATS).length+' / 非公開 '+d.skipped.length+' 件';
  if(prev===tag&&fs.existsSync(OUT)){console.log('変更なし ('+summary+')');return}
  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  fs.writeFileSync(OUT,encrypt(html,pw));
  fs.writeFileSync(tagFile,tag+'\n');
  console.log('更新しました ('+summary+') → '+OUT);
})().catch(e=>{console.error('ERROR '+e.message);process.exit(1)});
