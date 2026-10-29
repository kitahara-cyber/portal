// スプシ「事例マスター」の列定義。シートの1行目の見出し名と一致させる
exports.CASE_COLS=['No','業種コード','事業','ターゲット','課題1','課題2','課題3','戦略','インサイト','施策','成果','成功の理由','アポ率の表記','累計架電','累計アポ','月別の開始月','月別(架電/アポ,…)','公開','リストの作り方','訴求','切り返し','改善の経緯','受注の中身','使った資料'];
exports.CAT_COLS=['コード','名称','例','見出し','リード','要点1の見出し','要点1の本文','要点2の見出し','要点2の本文','要点3の見出し','要点3の本文'];
exports.CASE_SHEET='事例';
exports.CAT_SHEET='業種';
const nl=s=>String(s==null?'':s).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
exports.nl=nl;
// データ → シートの行
exports.toRows=function(d){
  const cases=d.CS.map(c=>{const s=d.STORY[c.no]||{list:[],appeal:[],rebut:[],imp:[],deal:[],asset:[]};
    return [c.no,c.cat,c.t,c.tg,c.b[0]||'',c.b[1]||'',c.b[2]||'',c.st,c.ins,c.ap,c.res,c.why,c.sr||'',
      c.tot?c.tot[0]:'',c.tot?c.tot[1]:'',c.m?c.m[0]:'',c.m?c.m[1]:'','TRUE',
      s.list.join('\n'),s.appeal.join('\n'),s.rebut.join('\n'),s.imp.map(x=>x[0]+'｜'+x[1]).join('\n'),s.deal.join('\n'),s.asset.join('\n')]});
  const cats=Object.keys(d.CATS).map(k=>{const c=d.CATS[k];const r=[k,c.n,c.ex,c.hl,c.lead];c.pts.forEach(p=>r.push(p[0],p[1]));return r});
  return {cases,cats};
};
// シートの行(見出し付き) → データ
exports.fromRows=function(caseRows,catRows){
  const idx=(hdr,cols,name)=>cols.map(c=>{const i=hdr.indexOf(c);if(i<0)throw new Error(name+'シートに見出し「'+c+'」がありません');return i});
  const ch=caseRows[0].map(x=>String(x).trim()), ci=idx(ch,exports.CASE_COLS,exports.CASE_SHEET);
  const kh=catRows[0].map(x=>String(x).trim()), ki=idx(kh,exports.CAT_COLS,exports.CAT_SHEET);
  const CATS={};
  catRows.slice(1).forEach(r=>{const g=i=>String(r[ki[i]]==null?'':r[ki[i]]);const k=g(0).trim();if(!k)return;
    CATS[k]={n:g(1),ex:g(2),hl:g(3),lead:g(4),pts:[[g(5),g(6)],[g(7),g(8)],[g(9),g(10)]].filter(p=>p[0]||p[1])}});
  const CS=[],STORY={},skipped=[];
  caseRows.slice(1).forEach((r,ri)=>{const g=i=>String(r[ci[i]]==null?'':r[ci[i]]);
    if(!g(0).trim())return;
    if(g(17).trim().toUpperCase()!=='TRUE'){skipped.push(g(0));return}
    const no=+g(0);if(!no)throw new Error((ri+2)+'行目のNoが数字ではありません');
    if(!CATS[g(1).trim()])throw new Error('No'+no+'の業種コード「'+g(1)+'」が業種シートにありません');
    const srv=v=>typeof v==='number'?(Math.round(v*10000)/100)+'%':String(v==null?'':v);
    const num=s=>+String(s).replace(/,/g,'');
    const hasTot=g(13).trim()!==''&&g(14).trim()!=='';
    const c={no,cat:g(1).trim(),t:g(2),tg:g(3),b:[g(4),g(5),g(6)].filter(Boolean),st:g(7),ins:g(8),ap:g(9),res:g(10),why:g(11),sr:srv(r[ci[12]]),
      tot:hasTot?[num(g(13)),num(g(14))]:null,m:g(15).trim()&&g(16).trim()?[g(15).trim(),g(16).trim()]:null};
    if(c.m&&!/^\d\d-\d\d$/.test(c.m[0]))throw new Error('No'+no+'の「月別の開始月」は 24-11 のような形で入れてください(いまは「'+c.m[0]+'」)。列の書式を「書式なしテキスト」にすると日付に変わりません');
    if(c.tot&&!(isFinite(c.tot[0])&&isFinite(c.tot[1])&&c.tot[0]>0))throw new Error('No'+no+'の累計架電・累計アポが数字ではありません');
    if(!c.t||!c.st||!c.res)throw new Error('No'+no+'の「事業」「戦略」「成果」は必須です');
    CS.push(c);
    const lst=g(18),imp=g(21);
    if(lst.trim()||g(19).trim()||g(22).trim()){
      STORY[no]={list:nl(lst),appeal:nl(g(19)),rebut:nl(g(20)),
        imp:nl(imp).map(l=>{const i=l.indexOf('｜');return i<0?['',l]:[l.slice(0,i).trim(),l.slice(i+1).trim()]}),
        deal:nl(g(22)),asset:nl(g(23))};
    }
  });
  CS.sort((a,b)=>a.no-b.no);
  return {CATS,CS,STORY,skipped};
};
