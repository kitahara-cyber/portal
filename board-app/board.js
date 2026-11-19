/* CSチーム タスクボード（Apps Script版）— このファイルは build.py で作る。元：cs-board/index.html */
(function(){
  var f=document.createElement('link'); f.rel='stylesheet'; f.href='https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap'; document.head.appendChild(f);
  var st=document.createElement('style'); st.textContent="\n/* 左にナビ、右に「要約 → 絞り込み → ボード」の順。状態は色付きチップで一目で分かるようにする */\n:root{\n  --bg:#f3f4f1; --surface:#ffffff; --sunken:#eceee9; --ink:#1b2220; --mute:#5c6863; --line:#dbe0db;\n  --accent:#1e5aa6; --accent-ink:#ffffff; --accent-bg:#e5edf9;\n  --danger:#b8332a; --danger-bg:#fbe8e5; --warn:#8f5c00; --warn-bg:#fcefd4; --ok:#1d7448; --ok-bg:#e1f2e8;\n  --info:#5546ad; --info-bg:#ece9fa; --muted-bg:#eef0ed;\n  --display:\"IBM Plex Sans JP\",\"Hiragino Sans\",\"Noto Sans JP\",system-ui,sans-serif;\n  --body:\"Zen Kaku Gothic New\",\"Hiragino Sans\",\"Noto Sans JP\",system-ui,sans-serif;\n  --r:10px; color-scheme:light;\n}\n@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){\n  --bg:#141917; --surface:#1c2320; --sunken:#171d1a; --ink:#e6ece9; --mute:#9aa8a2; --line:#2e3833;\n  --accent:#7fb0ff; --accent-ink:#0d1a2e; --accent-bg:#1c2b44;\n  --danger:#ff8a7d; --danger-bg:#3d1f1b; --warn:#f2bd5c; --warn-bg:#3a2d12; --ok:#6fd39c; --ok-bg:#16301f;\n  --info:#b3a8ff; --info-bg:#27234a; --muted-bg:#232b27; color-scheme:dark}}\n:root[data-theme=\"dark\"]{\n  --bg:#141917; --surface:#1c2320; --sunken:#171d1a; --ink:#e6ece9; --mute:#9aa8a2; --line:#2e3833;\n  --accent:#7fb0ff; --accent-ink:#0d1a2e; --accent-bg:#1c2b44;\n  --danger:#ff8a7d; --danger-bg:#3d1f1b; --warn:#f2bd5c; --warn-bg:#3a2d12; --ok:#6fd39c; --ok-bg:#16301f;\n  --info:#b3a8ff; --info-bg:#27234a; --muted-bg:#232b27; color-scheme:dark}\n*{box-sizing:border-box}\nhtml,body{height:100%;margin:0}\nbody{background:var(--bg);color:var(--ink);font-family:var(--body);font-size:14px;line-height:1.6}\nbutton,input,select,textarea{font:inherit;color:inherit}\na{color:var(--accent)}\n:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n.app{display:grid;grid-template-columns:232px 1fr;height:100%}\n/* sidebar */\n.side{background:var(--surface);border-right:1px solid var(--line);display:flex;flex-direction:column;min-height:0;overflow:auto}\n.brand{display:flex;align-items:center;gap:10px;padding:16px 16px 12px}\n.brand .logo{width:32px;height:32px;border-radius:8px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:13px}\n.brand b{font-family:var(--display);font-size:15px;display:block;line-height:1.2}\n.brand small{color:var(--mute);font-size:11px}\n.nav{display:flex;flex-direction:column;gap:2px;padding:4px 8px}\n.nav button{display:flex;flex-direction:column;align-items:flex-start;gap:0;text-align:left;border:0;background:transparent;border-radius:8px;padding:8px 10px;cursor:pointer}\n.nav button b{font-weight:700;font-size:14px}\n.nav button span{font-size:11px;color:var(--mute)}\n.nav button:hover{background:var(--sunken)}\n.nav button[aria-current=\"page\"]{background:var(--accent-bg)}\n.nav button[aria-current=\"page\"] b{color:var(--accent)}\n.side h4{font-size:11px;color:var(--mute);font-weight:700;letter-spacing:.06em;margin:16px 18px 4px}\n.links{display:flex;flex-direction:column;gap:2px;padding:0 8px}\n.links a{display:flex;align-items:center;justify-content:space-between;gap:8px;text-decoration:none;color:var(--ink);padding:7px 10px;border-radius:8px;font-size:13px}\n.links a:hover{background:var(--sunken)}\n.links a::after{content:\"↗\";color:var(--mute);font-size:12px}\n.me{margin-top:auto;border-top:1px solid var(--line);padding:12px 14px;display:flex;align-items:center;gap:10px}\n.avatar{width:30px;height:30px;border-radius:50%;background:var(--accent-bg);color:var(--accent);display:grid;place-items:center;font-weight:700;font-size:12px;flex:none}\n.me b{display:block;font-size:13px}\n.me small{color:var(--mute);font-size:11px}\n.me button{margin-left:auto;border:1px solid var(--line);background:transparent;border-radius:6px;font-size:11px;padding:3px 8px;cursor:pointer}\n/* main */\n.main{min-width:0;overflow:auto;display:flex;flex-direction:column}\n.top{display:flex;align-items:center;gap:12px;padding:16px 24px 0;flex-wrap:wrap}\n.top h1{font-family:var(--display);font-size:22px;margin:0;text-wrap:balance}\n.top p{margin:0;color:var(--mute);font-size:13px;flex-basis:100%}\n.top .grow{flex:1}\n.btn{border:1px solid var(--line);background:var(--surface);border-radius:8px;padding:7px 12px;cursor:pointer;font-weight:500;white-space:nowrap}\n.btn:hover{background:var(--sunken)}\n.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);font-weight:700}\n.btn.primary:hover{filter:brightness(1.07)}\n.btn.danger{color:var(--danger);border-color:color-mix(in srgb,var(--danger) 40%,var(--line))}\n.btn.small{padding:4px 9px;font-size:12px}\n.btn:disabled{opacity:.5;cursor:not-allowed}\n.content{padding:16px 24px 32px;display:flex;flex-direction:column;gap:16px;min-width:0}\n.banner{border:1px solid var(--line);background:var(--surface);border-radius:var(--r);padding:10px 14px;font-size:13px}\n.banner.warn{border-color:color-mix(in srgb,var(--warn) 45%,var(--line));background:var(--warn-bg)}\n.banner.err{border-color:color-mix(in srgb,var(--danger) 45%,var(--line));background:var(--danger-bg)}\n/* tiles */\n.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}\n.tile{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:12px 14px;text-align:left;cursor:pointer}\n.tile:hover{border-color:var(--accent)}\n.tile span{font-size:12px;color:var(--mute);display:block}\n.tile b{font-family:var(--display);font-size:26px;font-variant-numeric:tabular-nums;line-height:1.3}\n.tile.alert b{color:var(--danger)}\n.tile.waiting b{color:var(--warn)}\n/* filters */\n.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.seg{display:inline-flex;background:var(--sunken);border-radius:999px;padding:3px;gap:2px}\n.seg button{border:0;background:transparent;border-radius:999px;padding:5px 12px;cursor:pointer;font-size:13px;white-space:nowrap}\n.seg button[aria-pressed=\"true\"]{background:var(--surface);box-shadow:0 1px 2px rgba(0,0,0,.12);font-weight:700;color:var(--accent)}\n.seg button i{font-style:normal;color:var(--mute);font-size:11px;margin-left:4px;font-variant-numeric:tabular-nums}\nselect,input[type=text],input[type=search],input[type=date],textarea{border:1px solid var(--line);background:var(--surface);border-radius:8px;padding:6px 10px;min-width:0}\ntextarea{width:100%;resize:vertical}\n.bar .spacer{flex:1}\nlabel.check{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--mute);cursor:pointer}\n/* board */\n.coltabs{flex-wrap:wrap;margin:4px 0 12px}\n.coltabs button{display:inline-flex;align-items:center;gap:6px}\n.coltabs .dot{width:8px;height:8px;border-radius:50%;display:inline-block}\n.cardgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;align-items:start}\n.board{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(250px,1fr);gap:12px;overflow-x:auto;padding-bottom:6px;align-items:start}\n.col{background:var(--sunken);border-radius:var(--r);padding:10px;display:flex;flex-direction:column;gap:8px;min-width:0}\n.col h3{margin:0 2px 2px;font-size:13px;display:flex;align-items:center;gap:6px}\n.col h3 i{font-style:normal;color:var(--mute);font-weight:500;font-variant-numeric:tabular-nums}\n.col h3 .dot{width:8px;height:8px;border-radius:50%;background:var(--mute)}\n.col .empty{color:var(--mute);font-size:12px;padding:8px 4px}\n.card{background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:10px 12px;cursor:pointer;display:flex;flex-direction:column;gap:5px;min-width:0}\n.card:hover{border-color:var(--accent)}\n.card h4{margin:0;font-size:14px;line-height:1.45;overflow-wrap:anywhere}\n.card .meta{font-size:12px;color:var(--mute);overflow-wrap:anywhere}\n.card .meta.donel{color:var(--ok);font-weight:600}\n.originbox{display:grid;gap:4px;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r);background:var(--sunken);font-size:13px}\n.originbox .lab{display:inline-block;min-width:4em;color:var(--mute);font-size:12px}\n.originbox .dn b{color:var(--ok)}\ntd.nowrap{white-space:nowrap}\n.attach .attlist{list-style:none;margin:4px 0 6px;padding:0;display:grid;gap:4px;font-size:13px}\n.attach .attlist a{color:var(--accent);word-break:break-all}\n.attach .dropzone{display:flex;align-items:center;gap:10px;padding:10px;border:1px dashed var(--line);border-radius:var(--r);color:var(--mute);font-size:12px}\n.attach.over .dropzone{border-color:var(--accent);background:var(--sunken)}\n.linkbtn{background:none;border:0;color:var(--mute);text-decoration:underline;cursor:pointer;font-size:12px;padding:0}\n.card.is-overdue{box-shadow:inset 3px 0 0 var(--danger)}\n.chips{display:flex;flex-wrap:wrap;gap:4px}\n.chip{display:inline-flex;align-items:center;border-radius:5px;padding:0 7px;font-size:11px;font-weight:700;line-height:20px;background:var(--muted-bg);color:var(--mute);white-space:nowrap}\n.chip.danger{background:var(--danger-bg);color:var(--danger)}\n.chip.warn{background:var(--warn-bg);color:var(--warn)}\n.chip.ok{background:var(--ok-bg);color:var(--ok)}\n.chip.info{background:var(--info-bg);color:var(--info)}\n.chip.accent{background:var(--accent-bg);color:var(--accent)}\n.chip.draft{background:transparent;border:1px dashed var(--mute);color:var(--mute);line-height:18px}\n/* list */\n.tablewrap{overflow-x:auto;background:var(--surface);border:1px solid var(--line);border-radius:var(--r)}\ntable{border-collapse:collapse;width:100%;font-size:13px}\nth,td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--line);vertical-align:top}\nth{font-size:12px;color:var(--mute);font-weight:700;background:var(--sunken);white-space:nowrap}\ntbody tr:last-child td{border-bottom:0}\ntbody tr.click{cursor:pointer}\ntbody tr.click:hover td{background:var(--sunken)}\ntd.num{font-variant-numeric:tabular-nums;text-align:right}\ntd .sub{color:var(--mute);font-size:12px}\n/* team */\n.stack{display:flex;height:8px;border-radius:4px;overflow:hidden;background:var(--muted-bg);min-width:120px}\n.stack span{display:block;height:100%}\n.legend{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--mute)}\n.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px}\n/* projects */\n.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}\n.pcard{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:14px;display:flex;flex-direction:column;gap:8px;cursor:pointer;text-align:left}\n.pcard:hover{border-color:var(--accent)}\n.pcard h3{margin:0;font-size:15px;display:flex;align-items:center;gap:8px}\n.pcard h3 .sw{width:10px;height:10px;border-radius:3px;flex:none}\n.pcard p{margin:0;color:var(--mute);font-size:13px}\n.pcard .nums{display:flex;gap:14px;font-size:12px;color:var(--mute)}\n.pcard .nums b{font-size:16px;color:var(--ink);font-variant-numeric:tabular-nums;margin-right:2px}\n/* drawer & modal */\n.scrim{position:fixed;inset:0;background:rgba(10,14,12,.35);z-index:20;display:flex;justify-content:flex-end}\n.drawer{width:min(560px,100%);height:100%;background:var(--surface);display:flex;flex-direction:column;box-shadow:-8px 0 24px rgba(0,0,0,.15)}\n.drawer header{display:flex;align-items:flex-start;gap:10px;padding:16px 20px 12px;border-bottom:1px solid var(--line)}\n.drawer header h2{margin:0;font-family:var(--display);font-size:18px;flex:1;overflow-wrap:anywhere;text-wrap:balance}\n.drawer header small{display:block;color:var(--mute);font-size:12px;font-family:var(--body);font-weight:400}\n.x{border:0;background:transparent;font-size:20px;line-height:1;cursor:pointer;color:var(--mute);padding:4px}\n.drawer .body{flex:1;overflow:auto;padding:16px 20px;display:flex;flex-direction:column;gap:14px}\n.drawer footer{border-top:1px solid var(--line);padding:12px 20px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}\n.kv{display:grid;grid-template-columns:88px 1fr;gap:6px 12px;font-size:13px}\n.kv dt{color:var(--mute)}\n.kv dd{margin:0;overflow-wrap:anywhere}\n.memo{background:var(--sunken);border-radius:8px;padding:10px 12px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px}\n.state{border-radius:8px;padding:10px 12px;font-size:13px;background:var(--accent-bg)}\n.state.warn{background:var(--warn-bg)}\n.state.ok{background:var(--ok-bg)}\n.actions{display:flex;flex-wrap:wrap;gap:8px}\n.decide{display:flex;flex-direction:column;gap:6px}\n.decide button{text-align:left}\n.field{display:flex;flex-direction:column;gap:5px}\n.field > label,.field > .lab{font-size:12px;font-weight:700;color:var(--mute)}\n.field .req{color:var(--danger);font-weight:700;margin-left:4px}\n.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n.pick{display:flex;flex-wrap:wrap;gap:6px}\n.pick button{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:4px 11px;cursor:pointer;font-size:13px}\n.pick button[aria-pressed=\"true\"]{background:var(--accent-bg);border-color:var(--accent);color:var(--accent);font-weight:700}\n.hint{font-size:12px;color:var(--mute)}\n.comments{display:flex;flex-direction:column;gap:8px}\n.cm{border:1px solid var(--line);border-radius:8px;padding:8px 10px}\n.cm .who{font-size:12px;color:var(--mute)}\n.cm .who b{color:var(--ink);margin-right:6px}\n.cm p{margin:2px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}\n.mention{color:var(--accent)}\n.mention-sug{position:absolute;left:0;top:100%;z-index:5;background:var(--surface);border:1px solid var(--line);border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,.12);display:flex;flex-direction:column;min-width:180px;padding:4px}\n.mention-sug[hidden]{display:none}\n.mention-sug button{border:0;background:transparent;text-align:left;padding:6px 10px;border-radius:6px;cursor:pointer}\n.mention-sug button:hover{background:var(--accent-bg)}\n.hist{font-size:12px;color:var(--mute);display:flex;flex-direction:column;gap:2px}\ndetails summary{cursor:pointer;font-size:12px;color:var(--mute)}\n.modal{margin:auto;background:var(--surface);border-radius:12px;padding:20px;width:min(420px,calc(100% - 32px));display:flex;flex-direction:column;gap:12px}\n.modal h2{margin:0;font-family:var(--display);font-size:17px}\n.modal .who{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}\n.modal .who button{border:1px solid var(--line);background:var(--surface);border-radius:8px;padding:10px;cursor:pointer;text-align:left}\n.modal .who button:hover{border-color:var(--accent)}\n.modal .who small{display:block;color:var(--mute);font-size:11px}\n.toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:10px 16px;border-radius:8px;font-size:13px;z-index:40;max-width:calc(100% - 32px);box-shadow:0 6px 18px rgba(0,0,0,.2)}\n.mobilebar{display:none}\n@media (max-width:820px){\n  .app{grid-template-columns:1fr;grid-template-rows:auto 1fr}\n  .side{display:none}\n  .side.open{display:flex;position:fixed;inset:0 25% 0 0;z-index:30;box-shadow:8px 0 24px rgba(0,0,0,.2)}\n  .mobilebar{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--surface);border-bottom:1px solid var(--line)}\n  .top{padding:14px 16px 0}.content{padding:12px 16px 24px}\n  .row2{grid-template-columns:1fr}\n  .board{grid-auto-columns:minmax(240px,86%)}\n}\n@media (prefers-reduced-motion:no-preference){.card,.tile,.pcard{transition:border-color .15s}}\n.calday{display:grid;overflow:auto;border:1px solid var(--line);border-radius:10px;background:var(--surface);max-height:calc(100vh - 230px)}\n.cd-row{display:grid;grid-template-columns:56px repeat(var(--cols),var(--colw))}\n.cd-headrow{position:sticky;top:0;z-index:3;background:var(--surface);border-bottom:1px solid var(--line)}\n.cd-head{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;font-size:12px;text-align:center;border-left:1px solid var(--line)}\n.cd-head .av{width:30px;height:30px;border-radius:50%;background:var(--accent-bg);color:var(--accent);display:grid;place-items:center;font-weight:700;font-size:12px}\n.cd-gut{font-size:11px;color:var(--mute);text-align:right;padding:4px 6px;position:sticky;left:0;background:var(--surface);z-index:2}\n.cd-allday{border-bottom:1px solid var(--line)}\n.cd-cell{border-left:1px solid var(--line);padding:4px;display:flex;flex-direction:column;gap:3px;min-height:28px}\n.cd-chip{font-size:11.5px;padding:2px 6px;border-radius:4px;background:var(--muted-bg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.cd-chip.due{background:var(--warn-bg,#fdf1dc);color:var(--warn);cursor:pointer;font-weight:600}\n.cd-chip.due.over{outline:1px solid var(--danger)}\n.cd-hours{position:relative;padding:0}\n.cd-hours div{position:absolute;right:6px;transform:translateY(-50%);font-variant-numeric:tabular-nums}\n.cd-hours div:first-child{transform:none}\n.cd-col{position:relative;border-left:1px solid var(--line);background-image:repeating-linear-gradient(to bottom,var(--line) 0 1px,transparent 1px 56px)}\n.cd-ev{position:absolute;box-sizing:border-box;border-radius:5px;padding:2px 6px;font-size:11.5px;line-height:1.3;overflow:hidden;background:var(--accent-bg);color:var(--ink);border-left:3px solid var(--accent);text-decoration:none;display:flex;flex-direction:column}\n.cd-ev b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0}\n.cd-ev.short{flex-direction:row;align-items:center;gap:4px;padding:0 5px}\n.cd-ev.short span{flex-shrink:0}\n.cd-ev span{color:var(--mute);font-variant-numeric:tabular-nums;font-size:11px}\n.cd-ev.hot{background:var(--info-bg);border-left-color:var(--info)}\n.cd-ev.busy{background:var(--muted-bg);border-left-color:var(--mute)}\n.cd-ev:hover{z-index:2;box-shadow:0 2px 8px rgba(0,0,0,.18)}\n.cd-now{position:absolute;left:0;right:0;height:2px;background:var(--danger);z-index:2}\n.cd-now::before{content:\"\";position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:var(--danger)}\n.linkbtn{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer;text-decoration:underline dotted}\n.dz{display:flex;flex-direction:column;gap:22px;padding:4px 2px 20px}\n.dz h3{margin:0 0 8px;font-size:14px}\n.dz .hint{margin:-4px 0 8px}\n.dz .seg{flex-wrap:wrap}\n.dz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}\n.dz-sw,.dz-tone{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;border:1px solid var(--line);border-radius:10px;background:var(--surface);cursor:pointer;font-size:12px}\n.dz-sw i{width:28px;height:28px;border-radius:50%;display:block}\n.dz-sw[aria-pressed=\"true\"],.dz-tone[aria-pressed=\"true\"]{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-bg);font-weight:700;color:var(--accent)}\n.dz-prev{width:56px;height:36px;border-radius:6px;border:1px solid;display:flex;align-items:flex-end;justify-content:flex-end;padding:4px}\n.dz-prev i{width:30px;height:18px;border-radius:4px;border:1px solid;display:block}\n.ai-box{border:1px solid color-mix(in srgb,var(--info) 35%,var(--line));background:var(--info-bg);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:6px}\n.ai-box.ai-empty{flex-direction:row;align-items:center;justify-content:space-between;gap:8px;font-size:13px;color:var(--mute)}\n.ai-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.ai-head .btn{margin-left:auto}\n.ai-text{white-space:pre-wrap;font-size:13px;line-height:1.7}\n.ai-h{color:var(--info)}\n.lr-box{border:1px solid var(--line);border-radius:10px;padding:10px 12px;gap:6px;display:flex;flex-direction:column}\n.lr-row{display:grid;grid-template-columns:1fr 1fr auto;gap:6px;align-items:center}\n.lr-row input,.lr-box>input{width:100%}\n@media (max-width:640px){.lr-row{grid-template-columns:1fr}}\n"; document.head.appendChild(st);
  var l=document.getElementById('gas-loading'); if(l) l.remove();
  var wrap=document.createElement('div'); wrap.innerHTML="\n<div class=\"app\" id=\"app\">\n  <div class=\"mobilebar\"><button class=\"btn small\" id=\"menuBtn\" type=\"button\">メニュー</button><b style=\"font-family:var(--display)\">CSチーム タスクボード</b></div>\n  <aside class=\"side\" id=\"side\"></aside>\n  <main class=\"main\" id=\"main\"><div class=\"content\"><div class=\"banner\">読み込み中です…</div></div></main>\n</div>\n<div id=\"layer\"></div>\n"; while(wrap.firstChild) document.body.appendChild(wrap.firstChild);
})();
/* CSタスクボード：claude.ai の db / user / mcp と同じ形の窓口を、Apps Script（google.script.run）で用意する */
(function(){
  'use strict';
  var G = window.__GAS || {};
  var docs = {};          // path -> data
  var loaded = false, email = (G.email || '').toLowerCase();
  var listeners = [];     // {kind:'coll'|'doc', path, order, cb}

  function call(req){
    return new Promise(function(res, rej){
      if(!window.google || !google.script || !google.script.run){ rej({code:'server_unavailable', message:'google.script.run がありません'}); return; }
      google.script.run.withSuccessHandler(res).withFailureHandler(function(e){
        var m = String((e && e.message) || e || '');
        var code = /permission_denied/.test(m) ? 'invalid_argument' : /not_found/.test(m) ? 'not_found' : 'tool_error';
        rej({code: code, message: m});
      }).api(req);
    });
  }
  function clone(o){ return o == null ? o : JSON.parse(JSON.stringify(o)); }
  function idOf(path){ var i = path.lastIndexOf('/'); return path.slice(i + 1); }
  function inColl(path, coll){ return path.indexOf(coll + '/') === 0 && path.slice(coll.length + 1).indexOf('/') < 0; }
  function collSnap(coll, order){
    var list = Object.keys(docs).filter(function(p){ return inColl(p, coll); }).map(function(p){ var d = docs[p]; return {id: idOf(p), data: function(){ return clone(d); }, _d: d}; });
    if(order) list.sort(function(a, b){ return String(a._d[order] || '').localeCompare(String(b._d[order] || '')); });
    return {docs: list, size: list.length, empty: !list.length, metadata: {fromCache: false}};
  }
  function docSnap(path){ var d = docs[path]; return {id: idOf(path), exists: d !== undefined, data: function(){ return clone(d); }}; }
  function fire(){
    if(!loaded) return;
    listeners.slice().forEach(function(l){ try{ l.cb(l.kind === 'coll' ? collSnap(l.path, l.order) : docSnap(l.path)); }catch(e){ console.error(e); } });
  }
  var syncing = null, lastSig = '';
  function sync(){
    if(syncing) return syncing;
    syncing = call({op: 'all'}).then(function(r){ var nx = r.docs || {}; var sig = JSON.stringify(nx); if(r.email) email = String(r.email).toLowerCase(); var first = !loaded; if(sig === lastSig && !first) return; lastSig = sig; docs = nx; loaded = true; fire(); })
      .catch(function(e){ listeners.forEach(function(l){ if(l.err) try{ l.err(e); }catch(x){} }); })
      .then(function(){ syncing = null; });
    return syncing;
  }
  setInterval(function(){ if(!document.hidden) sync(); }, 20000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) sync(); });

  function listen(kind, path, order, cb, err){
    var l = {kind: kind, path: path, order: order, cb: cb, err: err};
    listeners.push(l);
    if(loaded) setTimeout(function(){ cb(kind === 'coll' ? collSnap(path, order) : docSnap(path)); }, 0); else sync();
    return function(){ listeners = listeners.filter(function(x){ return x !== l; }); };
  }
  function docRef(path){
    return {
      id: idOf(path), path: path,
      onSnapshot: function(cb, err){ return listen('doc', path, null, cb, err); },
      get: function(){ return (loaded ? Promise.resolve() : sync()).then(function(){ return docSnap(path); }); },
      set: function(data){ var prev = docs[path]; docs[path] = clone(data); fire(); return call({op: 'set', path: path, data: data}).catch(function(e){ if(prev === undefined) delete docs[path]; else docs[path] = prev; fire(); throw e; }); },
      update: function(patch){ var prev = docs[path]; if(prev === undefined) return Promise.reject({code: 'not_found'}); var nx = clone(prev); Object.keys(patch).forEach(function(k){ nx[k] = patch[k]; }); docs[path] = nx; fire();
        return call({op: 'update', path: path, data: patch}).catch(function(e){ docs[path] = prev; fire(); throw e; }); },
      delete: function(){ var keep = {}; Object.keys(docs).forEach(function(p){ if(p === path || p.indexOf(path + '/') === 0){ keep[p] = docs[p]; delete docs[p]; } }); fire();
        return call({op: 'delete', path: path}).catch(function(e){ Object.keys(keep).forEach(function(p){ docs[p] = keep[p]; }); fire(); throw e; }); }
    };
  }
  function collRef(coll, order){
    return {
      orderBy: function(f){ return collRef(coll, f); },
      limit: function(){ return collRef(coll, order); },
      onSnapshot: function(cb, err){ return listen('coll', coll, order, cb, err); },
      get: function(){ return (loaded ? Promise.resolve() : sync()).then(function(){ return collSnap(coll, order); }); },
      doc: function(id){ return docRef(coll + '/' + id); },
      add: function(data){ return call({op: 'add', coll: coll, data: data}).then(function(r){ docs[r.path] = r.data; fire(); return docRef(r.path); }); }
    };
  }
  var db = { collection: function(p){ return collRef(p, null); }, doc: function(p){ return docRef(p); } };

  function rosterMember(){
    var r = docs['config/roster'];
    return r && (r.members || []).find(function(m){ return String(m.email || '').toLowerCase() === email; });
  }
  var user = {
    can: function(){ return Promise.resolve(true); },
    id: function(){ return Promise.resolve(email || null); },
    me: function(){ return (loaded ? Promise.resolve() : sync()).then(function(){ var m = rosterMember(); return {name: m ? (m.full || m.name) : '', email: email}; }); }
  };

  var mcp = {
    callTool: function(server, tool, args){
      args = args || {};
      if(server === 'Slack' && tool === 'slack_send_message') return call({op: 'slack', user: args.channel_id, text: args.message}).then(function(r){ return {payload: r}; });
      if(server === 'Google Sheets' && tool === 'get_values') return call({op: 'values', spreadsheetId: args.spreadsheetId, range: args.range}).then(function(r){ return {payload: r}; });
      if(server === 'Google Calendar' && tool === 'list_events') return call({op: 'calList', calendarId: args.calendarId, start: args.startTime, end: args.endTime}).then(function(r){ return {payload: r}; });
      if(server === 'Google Calendar' && tool === 'create_event') return call({op: 'calCreate', summary: args.summary, start: args.startTime, end: args.endTime, description: args.description, guests: (args.attendees || []).map(function(a){ return a.email; })}).then(function(r){ return {payload: r}; });
      if(server === 'Board' && tool === 'unreplied') return call({op: 'mail'}).then(function(r){ return {payload: r}; });
      if(server === 'Board' && tool === 'clients') return call({op: 'clients', refresh: !!args.refresh}).then(function(r){ return {payload: r}; });
      if(server === 'Board' && tool === 'find_thread') return call({op: 'findThread', client: args.client}).then(function(r){ return {payload: r}; });
      if(server === 'Board' && tool === 'list_report') return call(Object.assign({op: 'listReport'}, args)).then(function(r){ return {payload: r}; });
      if(server === 'Board' && tool === 'attach') return call(Object.assign({op: 'attach'}, args)).then(function(r){ return {payload: r}; });
      if(server === 'Board' && tool === 'share_domain') return call({op: 'shareDomain', fileId: args.fileId}).then(function(r){ return {payload: r}; });
      if(server === 'Board' && tool === 'explain') return call({op: 'explain', id: args.id, force: !!args.force}).then(function(r){ return {payload: r}; });
      if(server === 'Board' && tool === 'record_request') return call(Object.assign({op: 'request'}, args)).then(function(r){ return {payload: r}; });
      return Promise.reject({code: 'not_in_manifest', message: server + ' ' + tool});
    }
  };

  window.claude = { use: function(name){ return Promise.resolve(name === 'db' ? db : name === 'user' ? user : name === 'mcp' ? mcp : null); } };
  if(G.task) { try{ location.hash = '#t-' + G.task; }catch(e){} }
  else if(G.view) { try{ location.hash = '#' + G.view; }catch(e){} }
})();


"use strict";
/* ============ 固定設定 ============ */
const PAGE_URL = (window.__GAS && window.__GAS.url) || "https://claude.ai/artifact/JNvCVQjjvQus16Za658V8P";
function taskUrl(id){ return window.__GAS ? PAGE_URL+"?t="+id : PAGE_URL+"#t-"+id; }
const SHEET_ID = "1GKcj5qfLoaUlhqxEMEicIxhPbCPCyLkUCJkELnK6wkg"; // タスク管理表
const FORM_LIST_URL = "https://script.google.com/a/macros/writeup.co.jp/s/AKfycbwOV22wzMab-Tb-QyvYIKhq8A9x9iaVazZtg9iktTviseeilf7JnoLz2Ue42N3fqDhE/exec";
const FORM_TASK_URL = FORM_LIST_URL + "?page=task";
const LINKS = [
  {label:"顧客ポータル", url:"https://kitahara-cyber.github.io/portal/"},
  {label:"CRM（kintone）", url:"https://kintone-crm.onrender.com/login"},
  {label:"営業戦略ルーム（戦略AI）", url:"https://claude.ai/artifact/N7xPCiS9NTh9ozjQ9PbB6i"},
  {label:"アポ獲得トーク作成・採点", url:"https://claude.ai/artifact/DqNDRpTVq1vGhxhzqD15te"},
  {label:"リスト作成依頼フォーム", url:FORM_LIST_URL},
  {label:"タスク依頼フォーム", url:FORM_TASK_URL},
  {label:"タスク管理表（シート）", url:"https://docs.google.com/spreadsheets/d/"+SHEET_ID+"/edit"}
];
const DEFAULT_ROSTER = [
  {key:"takahashi", name:"高橋", full:"高橋 遼馬", role:"管理職", slack:"U02F92HQS6B", email:"ryouma_takahashi@writeup.co.jp"},
  {key:"sato",      name:"佐藤", full:"佐藤 太一", role:"管理職", slack:"U01CK4L66RH", email:"t_sato@writeup.co.jp"},
  {key:"koguchi",   name:"小口", full:"小口 裕也", role:"管理職", slack:"U01750HA10U", email:"koguchi@writeup.co.jp"},
  {key:"kitahara",  name:"北原", full:"北原 奈々", role:"開発者", slack:"U09T80ZAMT3", email:"kitahara@writeup.co.jp"},
  {key:"hayashi",   name:"林",   full:"林 敬太郎", role:"メンバー", slack:"U02GX5DJ56U", email:"hayashi@writeup.co.jp"},
  {key:"koyama",    name:"小山", full:"小山 雄介", role:"メンバー", slack:"U082VB407L5", email:"koyama@writeup.co.jp"},
  {key:"kitami",    name:"北見", full:"北見 志織", role:"メンバー", slack:"U0C4PKWSK5Z", email:"kitami@writeup.co.jp"},
  {key:"oishi",     name:"大石", full:"大石 翔太", role:"メンバー", slack:"U07N07C7Z6Y", email:""},
  {key:"fukata",    name:"深田", full:"深田 怜佑", role:"メンバー", slack:"U0AGRRPL97Z", email:"ryosuke_fukata@writeup.co.jp"}
];
const KINDS = ["通常タスク","リスト作成","タスク依頼","定例資料","継続提案資料","判断を仰ぐ","修正依頼","質問"];
const LIST_SOURCES = ["SR","類似分析","ラクリス","スクレイピング","スコアリング","ハウス","黄金リスト","その他"];
const TASK_REQ_KINDS = ["業務効率化/整理","フォーム","事例","開発","その他"];
const BOARD_MARK = "CSタスクボードから";
const STATUS = {
  draft:{label:"振り分け待ち", cls:"draft", color:"#8a918d"},
  todo:{label:"未着手", cls:"", color:"var(--mute)"},
  reopen:{label:"再依頼", cls:"danger", color:"var(--danger)"},
  doing:{label:"対応中", cls:"accent", color:"var(--accent)"},
  blocked:{label:"ブロック", cls:"info", color:"var(--info)"},
  review:{label:"確認待ち", cls:"warn", color:"var(--warn)"},
  done:{label:"完了", cls:"ok", color:"var(--ok)"},
  cancel:{label:"中止", cls:"", color:"var(--mute)"}
};
const OPEN = ["todo","reopen","doing","blocked","review"];
const PRIO = {high:"高", normal:"通常", low:"低"};
const PCOLORS = ["#1e5aa6","#1d7448","#b8332a","#8f5c00","#5546ad","#0f7b85","#a2457a"];

/* ============ 状態 ============ */
const S = {
  db:null, user:null, mcp:null, uid:null, me:null, roster:DEFAULT_ROSTER,
  tasks:[], projects:[], loaded:{tasks:false, projects:false}, loadErr:"", slow:false,
  view:"tasks", scope:"mine", person:"", group:"status", layout:"tabs", colTab:"", q:"", showDone:false, project:"",
  canWrite:null, readOnly:false,
  forms:{state:"idle", list:[], task:[], err:"", at:0},
  openId:null, unsubComments:null, comments:[], minutesCfg:{keywords:["CSMTG"]}, mail:{state:"idle", items:[], err:"", at:0}
};
let LS = null; try { LS = window.localStorage; } catch(e) { LS = null; }
function lsGet(k){ try { return LS ? LS.getItem(k) : null; } catch(e){ return null; } }
function lsSet(k,v){ try { if (LS) LS.setItem(k,v); } catch(e){} }

/* ============ ユーティリティ ============ */
const $ = (s, r=document) => r.querySelector(s);
function esc(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function pad(n){ return String(n).padStart(2,"0"); }
function todayStr(){ const d=new Date(); return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function dayDiff(due){ if(!due) return null; return Math.round((Date.parse(due+"T00:00:00")-Date.parse(todayStr()+"T00:00:00"))/86400000); }
const WD = ["日","月","火","水","木","金","土"];
function fmtDate(s){ if(!s) return ""; const d=new Date(s+"T00:00:00"); if(isNaN(d)) return s; return (d.getMonth()+1)+"/"+d.getDate()+"("+WD[d.getDay()]+")"; }
function fmtTime(iso){ if(!iso) return ""; const d=new Date(iso); if(isNaN(d)) return ""; return (d.getMonth()+1)+"/"+d.getDate()+" "+pad(d.getHours())+":"+pad(d.getMinutes()); }
function addDays(n){ const d=new Date(); d.setDate(d.getDate()+n); return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function endOfWeek(){ const d=new Date(); const add = (7 - d.getDay()) % 7; return addDays(add); } // 日曜まで
function nowIso(){ return new Date().toISOString(); }
function member(key){ return S.roster.find(m=>m.key===key) || {key, name:key||"未設定", full:key||"未設定", role:"", slack:""}; }
function nm(key){ return member(key).name; }
function names(keys){ return (keys||[]).map(nm).join("・") || "未設定"; }
function isLead(key){ const r=member(key).role; return r==="管理職"||r==="開発者"; }
function proj(id){ return S.projects.find(p=>p.id===id); }
function isOpen(t){ return OPEN.includes(t.status); }
function isOverdue(t){ const d=dayDiff(t.due); return isOpen(t) && d!==null && d<0; }
function toast(msg, ms=3800){ const el=document.createElement("div"); el.className="toast"; el.setAttribute("role","status"); el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(), ms); }
function normName(s){ return String(s||"").replace(/[\s　]/g,""); }
function matchMember(raw){ const n=normName(raw); if(!n) return null; const hit=S.roster.find(m=>n.startsWith(normName(m.name))); return hit?hit.key:null; }
function dueChip(t){
  if(!t.due) return '<span class="chip">期限なし</span>';
  const d=dayDiff(t.due);
  if(t.status==="done"||t.status==="cancel") return '<span class="chip">'+esc(fmtDate(t.due))+'</span>';
  if(d<0) return '<span class="chip danger">'+(-d)+'日超過</span>';
  if(d===0) return '<span class="chip danger">今日</span>';
  if(d===1) return '<span class="chip warn">明日</span>';
  return '<span class="chip">'+esc(fmtDate(t.due))+'</span>';
}
function statusChip(t){ const s=STATUS[t.status]||STATUS.todo; return '<span class="chip '+s.cls+'">'+s.label+'</span>'; }

/* ============ 起動 ============ */
async function boot(){
  renderSide(); routeFromHash(); render();
  if(!window.claude || typeof window.claude.use!=="function"){
    S.loadErr="このページはclaude.aiで開いたときにデータを保存・共有できます。"; render(); return;
  }
  const [db,user,mcp] = await Promise.all([window.claude.use("db"), window.claude.use("user"), window.claude.use("mcp")]);
  S.db=db; S.user=user; S.mcp=mcp;
  if(!db){ S.loadErr="データに接続できませんでした。claude.aiにサインインした状態で開き直してください。"; render(); return; }
  try { const c = user && user.can ? await user.can("data.write") : null; S.canWrite = c; if(c===false) S.readOnly=true; } catch(e){}
  try { S.uid = user ? await user.id() : null; } catch(e){ S.uid=null; }
  // 名簿（管理画面で変更されていれば上書き）
  db.doc("config/roster").onSnapshot(snap=>{
    const d=snap.exists?snap.data():null;
    if(d && Array.isArray(d.members) && d.members.length){ S.roster=d.members.map(m=>({...m})); }
    renderSide(); render();
  }, ()=>{});
  db.doc("config/minutes").onSnapshot(snap=>{ const d=snap.exists?snap.data():null; S.minutesCfg=(d&&Array.isArray(d.keywords))?d:{keywords:["CSMTG"]}; }, ()=>{});
  await resolveMe();
  const timer=setTimeout(()=>{ if(!S.loaded.tasks){ S.slow=true; render(); } },10000);
  db.collection("tasks").onSnapshot(snap=>{
    S.tasks=snap.docs.map(d=>({id:d.id, ...d.data()}));
    if(!snap.metadata.fromCache){ S.loaded.tasks=true; S.slow=false; clearTimeout(timer); if(!S.autoStarted){ S.autoStarted=true; setTimeout(()=>loadForms(false,true),1500); setTimeout(loadClients,800); setTimeout(applySlackClaims,2500); setTimeout(autoProject,4000); setInterval(()=>{ if(!document.hidden) autoProject(); },3*60*1000); setInterval(()=>{ if(!document.hidden) loadForms(true,true); },5*60*1000); } }
    else if(!S.loaded.tasks && S.tasks.length) S.loaded.tasks=true;
    render(); refreshDrawer();
    if(S.pendingOpen && S.tasks.some(t=>t.id===S.pendingOpen)){ const id=S.pendingOpen; S.pendingOpen=null; openTask(id); }
  }, e=>{ clearTimeout(timer); S.loadErr=dbErrText(e); render(); });
  db.collection("slackclaim").onSnapshot(snap=>{ S.slackClaims=snap.docs.map(d=>({id:d.id, ...(d.data()||{})})); applySlackClaims(); }, ()=>{});
  db.collection("deleted").onSnapshot(snap=>{ const ids=new Set(), keys=new Set(); snap.docs.forEach(d=>{ const x=d.data()||{}; ids.add(d.id); if(x.sourceKey) keys.add(x.sourceKey); }); S.deleted={ids,keys}; }, ()=>{});
  db.collection("threads").onSnapshot(snap=>{ const m={}; snap.docs.forEach(d=>{ const x=d.data(); if(x&&x.key) m[x.key]=x.url; }); S.threads=m; }, ()=>{});
  db.collection("projects").onSnapshot(snap=>{
    S.projects=snap.docs.map(d=>({id:d.id, ...d.data()})).filter(p=>!p.archived).sort((a,b)=>String(a.createdAt||"").localeCompare(String(b.createdAt||"")));
    S.loaded.projects=true; render();
  }, ()=>{});
  window.addEventListener("hashchange", ()=>{ routeFromHash(); render(); });
}
function dbErrText(e){
  const c=e&&e.code;
  if(c==="revoked") return "このページへのアクセス権が変わりました。";
  if(c==="resource_exhausted") return "一時的にアクセスが集中しています。少し待ってから開き直してください。";
  return "データを読み込めませんでした（"+(c||"不明")+"）。";
}
async function resolveMe(){
  // Googleアカウント版：ログインしているGoogleアカウント（名簿のメール）で本人を決める
  if(window.__GAS && S.user && S.user.me){
    try { const p=await S.user.me(); const k=matchMember(p && p.name); if(k){ S.me=k; S.lockedMe=true; if(isLead(S.me) && !location.hash) S.view="team"; renderSide(); render(); setTimeout(()=>loadMail(false,true),2500); return; } } catch(e){}
  }
  // 1) 自分で選んだ名前  2) claude.aiのプロフィール名から推定
  if(S.uid){
    try { const s=await S.db.doc("data/users/"+S.uid+"/profile").get(); if(s.exists && s.data().member){ S.me=s.data().member; } } catch(e){}
  }
  if(!S.me){ const k=lsGet("csboard.me"); if(k && S.roster.some(m=>m.key===k)) S.me=k; }
  if(!S.me && S.user && S.user.me){
    try { const p=await S.user.me(); const k=matchMember(p && p.name); if(k) S.me=k; } catch(e){}
  }
  if(S.me){ if(isLead(S.me) && !location.hash) S.view="team"; renderSide(); render(); }
  else openWhoModal();
}
async function setMe(key){
  S.me=key; lsSet("csboard.me", key);
  if(S.uid && S.db){ try { await S.db.doc("data/users/"+S.uid+"/profile").set({member:key}); } catch(e){} }
  closeLayer(); renderSide(); render();
}

/* ============ ルーティング ============ */
function routeFromHash(){
  const h=(location.hash||"").slice(1);
  if(["tasks","team","projects","forms","kouryu","calendar","mail"].includes(h)) S.view=h;
  else if(h.startsWith("t-")){ S.view="tasks"; const id=h.slice(2); setTimeout(()=>openTask(id),0); }
}
function go(view){ S.view=view; try{ history.replaceState(null,"","#"+view); }catch(e){} closeSideMobile(); render(); renderSide(); if(view==="forms" && S.forms.state==="idle") loadForms(false); if(view==="kouryu" && S.kr.state==="idle") loadKouryu(false); if(view==="mail" && S.mail.state==="idle") loadMail(false); }

/* ============ サイドバー ============ */
function renderSide(){
  const me=S.me?member(S.me):null;
  const nav=[["tasks","タスク","依頼・対応・確認"],["team","メンバー状況","全員の状況を一覧で"],["projects","プロジェクト","案件・施策ごとのまとまり"],["forms","フォームからの依頼","リスト・タスク依頼フォーム"],["kouryu","交流会","参加状況とフォロー"],["calendar","カレンダー","1日ごと・週ごとの予定"]].concat(window.__GAS?[["mail","未返信メール","自分のGmailから"+(S.mail.items.length?"（"+S.mail.items.length+"件）":"")]]:[]);
  $("#side").innerHTML =
    '<div class="brand"><div class="logo">CS</div><div><b>CSタスクボード</b><small>ライトアップ CSチーム</small></div></div>'+
    '<nav class="nav" aria-label="メイン">'+nav.map(n=>'<button type="button" data-go="'+n[0]+'"'+(S.view===n[0]?' aria-current="page"':'')+'><b>'+n[1]+'</b><span>'+n[2]+'</span></button>').join("")+'</nav>'+
    '<h4>ツール</h4><div class="links">'+LINKS.map(l=>'<a href="'+esc(l.url)+'" target="_blank" rel="noopener">'+esc(l.label)+'</a>').join("")+'</div>'+
    '<h4>表示</h4><div class="nav"><button type="button" data-act="design"><b>デザイン</b><span>色・明るさ・文字の大きさ</span></button></div>'+
    (S.me?'<h4>管理</h4><div class="nav"><button type="button" data-act="roster"><b>メンバー設定</b><span>役割・SlackのID</span></button></div>':'')+
    '<div class="me">'+(me?'<div class="avatar">'+esc(me.name.slice(0,2))+'</div><div><b>'+esc(me.full)+'</b></div>':'<div><b>未選択</b></div>')+(S.lockedMe?'':'<button type="button" data-act="who">切替</button>')+'</div>';
}
function closeSideMobile(){ $("#side").classList.remove("open"); }

/* ============ 絞り込み ============ */
function scopedTasks(){
  let list=S.tasks.slice();
  if(S.scope==="mine") list=list.filter(t=>(t.assignees||[]).includes(S.me));
  else if(S.scope==="asked") list=list.filter(t=>t.requester===S.me && !((t.assignees||[]).length===1 && t.assignees[0]===S.me));
  if(S.person) list=list.filter(t=>(t.assignees||[]).includes(S.person) || t.requester===S.person);
  if(S.project) list=list.filter(t=>t.projectId===S.project);
  if(S.q){ const q=S.q.toLowerCase(); list=list.filter(t=>[t.title,t.memo,t.client,t.kind].some(v=>String(v||"").toLowerCase().includes(q))); }
  if(!S.showDone) list=list.filter(t=>t.status!=="cancel" && !(t.status==="done" && daysSince(t.doneAt)>7));
  return list;
}
function daysSince(iso){ if(!iso) return 999; return (Date.now()-Date.parse(iso))/86400000; }
/* ---- いつ・どこで・誰が依頼したか ---- */
const AUTO_BY=["auto","slack-import","minutes-bot","import"];
function reqWhen(t){
  const k=String(t.sourceKey||"");
  let m=k.match(/^slack\|[^|]+\|(\d{9,11})(?:\.\d+)?/); if(m) return {iso:new Date(+m[1]*1000).toISOString(), dateOnly:false};
  m=k.match(/^(?:task|list|h100)\|(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if(m) return {iso:new Date(+m[1],m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)).toISOString(), dateOnly:!m[4]};
  return {iso:t.createdAt||"", dateOnly:false};
}
function slackLink(t){ const m=String(t.memo||"").match(/https:\/\/[\w.-]*slack\.com\/archives\/[^\s）)>|]+/); return m?m[0]:""; }
function reqWhere(t){
  const first=String(((t.history||[])[0]||{}).text||"");
  const k=String(t.sourceKey||"");
  if(t.sourceLabel) return {text:t.sourceLabel+(/フォーム/.test(t.sourceLabel)?"（スプレッドシート）":""), url:""};
  if(t.meetingTitle) return {text:"議事録「"+t.meetingTitle+"」", url:t.meetingUrl||""};
  if(/^slack\|/.test(k)){ const mm=String(t.memo||"").match(/（([^（）]+?)で\s*(@channel|@here|2人以上)/)||[]; const ch=mm[1]||""; const how=mm[2]==="2人以上"||/^【複数あて】/.test(t.title||"")?"2人以上へのメンション":"@channel／@here"; return {text:"Slack"+(ch?" "+ch:"")+"（"+how+"）", url:slackLink(t)}; }
  if(/^task\|/.test(k)||/^タスク管理表/.test(first)) return {text:"タスク管理表（タスク依頼フォーム）", url:""};
  if(/^list\|/.test(k)) return {text:"リスト作成依頼フォーム（スプレッドシート）", url:""};
  if(/^Slack/.test(first)) return {text:"Slack（定例資料の自動作成のお知らせから取り込み）", url:slackLink(t)};
  let m=first.match(/^自動登録（(.+)）/); if(m) return {text:"自動登録："+m[1], url:slackLink(t)};
  const by=(!AUTO_BY.includes(t.createdBy)&&t.createdBy)?member(t.createdBy).name+"さんが":"";
  m=first.match(/^作成（(.+)）/); if(m) return {text:"CSタスクボードで"+by+"直接作成（"+m[1]+"）", url:""};
  if(/^作成/.test(first)||/^board-/.test(k)) return {text:"CSタスクボードで"+by+"直接作成", url:""};
  if(/各自に分けて作成/.test(first)) return {text:"CSタスクボード（「各自に分ける」で作成）", url:""};
  return {text:first||"不明", url:slackLink(t)};
}
function reqWho(t){
  const formKey=/^(task|list|h100)\|/.test(String(t.sourceKey||""));
  const auto=AUTO_BY.includes(t.createdBy) && !formKey && !t.fromName;
  if(t.fromName){ const h1=/^h100\|/.test(String(t.sourceKey||"")); const rq=t.requester?member(t.requester).full:""; return t.fromName+(rq&&!t.fromName.includes(member(t.requester).name)?(h1?"／営業担当："+rq:"（ボード上の依頼者："+rq+"）"):""); }
  if(/^h100\|/.test(String(t.sourceKey||""))){ const m=String(t.memo||"").match(/【申込企業】\n?([^\n]+)/); if(m) return m[1].trim()+"（申込）"+(t.requester?"／営業担当："+member(t.requester).full:""); }
  const r=t.requester?member(t.requester).full:"";
  const reg=(!AUTO_BY.includes(t.createdBy) && t.createdBy && t.createdBy!==t.requester && member(t.createdBy).full) ? "（登録："+member(t.createdBy).full+"）" : "";
  if(!r) return auto||t.createdBy==="minutes-bot" ? "依頼者不明（自動取り込み）" : "未設定";
  return r+(auto?"（自動登録）":"")+reg;
}
function fmtWhen(w){ if(!w.iso) return "不明"; const d=new Date(w.iso); return w.dateOnly ? fmtDate(d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())) : (d.getMonth()+1)+"/"+d.getDate()+"("+WD[d.getDay()]+") "+pad(d.getHours())+":"+pad(d.getMinutes()); }
function doneHist(t){ return (t.history||[]).slice().reverse().find(x=>/完了/.test(x.text||"") && !/未着手|戻す/.test(x.text||"")); }
function doneViaSheet(t){ const h=doneHist(t); return !!h && /スプシ|申込シート/.test(h.text||""); }
function doneByKey(t){ const h=doneHist(t); return h&&h.by&&!AUTO_BY.includes(h.by)&&!doneViaSheet(t) ? h.by : ""; }
function doneBy(t){ if(doneViaSheet(t)) return "スプシで完了"; const k=doneByKey(t); return k?member(k).name:""; }
function closedWhen(t){ if(t.status==="done") return t.doneAt; const h=(t.history||[]).slice().reverse().find(x=>/中止/.test(x.text||"")); return h?h.at:t.updatedAt; }
function sortTasks(list){
  const pr={high:0,normal:1,low:2};
  return list.sort((a,b)=>{
    const da=a.due||"9999", dbb=b.due||"9999";
    if(da!==dbb) return da<dbb?-1:1;
    if((pr[a.priority]??1)!==(pr[b.priority]??1)) return (pr[a.priority]??1)-(pr[b.priority]??1);
    return String(b.createdAt||"").localeCompare(String(a.createdAt||""));
  });
}
function columns(list){
  if(S.group==="due"){
    const today=todayStr(), eow=endOfWeek();
    const open=list.filter(isOpen), closed=list.filter(t=>!isOpen(t));
    return [
      {title:"期限切れ", dot:"var(--danger)", items:open.filter(t=>t.due && t.due<today)},
      {title:"今日", dot:"var(--warn)", items:open.filter(t=>t.due===today)},
      {title:"今週中", dot:"var(--accent)", items:open.filter(t=>t.due>today && t.due<=eow)},
      {title:"来週以降", dot:"var(--mute)", items:open.filter(t=>t.due>eow)},
      {title:"期限なし", dot:"var(--mute)", items:open.filter(t=>!t.due)},
      {title:"完了・中止", dot:"var(--ok)", items:closed.sort((a,b)=>String(closedWhen(b)||"").localeCompare(String(closedWhen(a)||"")))}
    ];
  }
  if(S.group==="project"){
    const cols=S.projects.map(p=>({title:p.name, dot:p.color||"var(--accent)", items:list.filter(t=>t.projectId===p.id)}));
    cols.push({title:"プロジェクトなし", dot:"var(--mute)", items:list.filter(t=>!t.projectId||!proj(t.projectId))});
    return cols;
  }
  const order=(list.some(t=>t.status==="draft")?["draft"]:[]).concat(["todo","reopen","doing","blocked","review","done"]).concat(S.showDone?["cancel"]:[]);
  return order.map(k=>{ let items=list.filter(t=>t.status===k); if(k==="done"||k==="cancel") items=items.sort((a,b)=>String(closedWhen(b)||"").localeCompare(String(closedWhen(a)||""))); return {title:STATUS[k].label, dot:STATUS[k].color, items}; });
}

/* ============ 描画 ============ */
function render(){
  const main=$("#main");
  const sx=main.querySelector(".board")?.scrollLeft||0;
  let html="";
  if(S.view==="team") html=viewTeam();
  else if(S.view==="projects") html=viewProjects();
  else if(S.view==="forms") html=viewForms();
  else if(S.view==="kouryu") html=viewKouryu();
  else if(S.view==="calendar") html=viewCalendar();
  else if(S.view==="mail") html=viewMail();
  else html=viewTasks();
  const keepFocus=document.activeElement && document.activeElement.id==="q";
  const caret=keepFocus?document.activeElement.selectionStart:null;
  main.innerHTML=html;
  const b=main.querySelector(".board"); if(b) b.scrollLeft=sx;
  if(keepFocus){ const q=$("#q"); if(q){ q.focus(); try{ q.setSelectionRange(caret,caret); }catch(e){} } }
}
function topBar(title, desc, right=""){
  return '<div class="top"><h1>'+esc(title)+'</h1><div class="grow"></div>'+right+'<p>'+desc+'</p></div>';
}
function banners(){
  let h="";
  if(S.loadErr) h+='<div class="banner err">'+esc(S.loadErr)+'</div>';
  else if(S.slow) h+='<div class="banner warn">データにまだつながっていません。表示が古い可能性があります。</div>';
  if(S.readOnly) h+='<div class="banner warn">閲覧のみの権限で開いています。タスクの作成・更新には、共有で「コントリビューター」以上が必要です。</div>';
  return h;
}
function newBtn(){ return '<button class="btn primary" type="button" data-act="new"'+(S.readOnly?' disabled':'')+'>＋ 新しいタスク</button>'; }

function viewTasks(){
  const me=S.me;
  const mine=S.tasks.filter(t=>(t.assignees||[]).includes(me) && ["todo","reopen","doing","blocked"].includes(t.status));
  const toCheck=S.tasks.filter(t=>t.requester===me && t.status==="review");
  const decide=S.tasks.filter(t=>t.kind==="判断を仰ぐ" && (t.assignees||[]).includes(me) && isOpen(t) && t.status!=="review");
  const overdue=S.tasks.filter(t=>isOverdue(t) && ((t.assignees||[]).includes(me)||t.requester===me));
  const cnt={mine:S.tasks.filter(t=>(t.assignees||[]).includes(me)&&isOpen(t)).length, asked:S.tasks.filter(t=>t.requester===me&&isOpen(t)&&!((t.assignees||[]).length===1&&t.assignees[0]===me)).length, all:S.tasks.filter(isOpen).length};
  const list=sortTasks(scopedTasks());
  const desc = S.scope==="mine"?"あなたが担当しているタスクです。":S.scope==="asked"?"あなたが人にお願いして、相手が対応しているタスクです。":"チーム全員のタスクです。";
  let h=topBar("タスク", desc, newBtn());
  h+='<div class="content">'+banners();
  h+='<div class="tiles">'+
    tile("あなたがやること", mine.length, "", "mine")+
    tile("あなたの確認待ち", toCheck.length, "waiting", "check")+
    tile("判断をお願いされている", decide.length, "waiting", "decide")+
    tile("期限切れ（自分が関わる）", overdue.length, "alert", "overdue")+
    (isLead(me)?tile("振り分け待ち", S.tasks.filter(t=>t.status==="draft").length, "waiting", "drafts"):"")+
  '</div>';
  h+='<div class="bar">'+
    '<div class="seg" role="group" aria-label="範囲">'+
      segBtn("scope","mine","自分がやる",cnt.mine)+segBtn("scope","asked","人に頼んだ",cnt.asked)+segBtn("scope","all","全員",cnt.all)+
    '</div>'+
    '<select id="person" aria-label="人で見る"><option value="">人で見る：全員</option>'+S.roster.map(m=>'<option value="'+m.key+'"'+(S.person===m.key?' selected':'')+'>'+esc(m.full)+'</option>').join("")+'</select>'+
    '<select id="projectSel" aria-label="プロジェクト"><option value="">プロジェクト：すべて</option>'+S.projects.map(p=>'<option value="'+p.id+'"'+(S.project===p.id?' selected':'')+'>'+esc(p.name)+'</option>').join("")+'</select>'+
    '<input type="search" id="q" placeholder="タイトル・案件名で検索" value="'+esc(S.q)+'" aria-label="検索">'+
    '<span class="spacer"></span>'+
    '<select id="group" aria-label="分け方"><option value="status"'+(S.group==="status"?" selected":"")+'>ステータスで分ける</option><option value="due"'+(S.group==="due"?" selected":"")+'>期限で分ける</option><option value="project"'+(S.group==="project"?" selected":"")+'>プロジェクトで分ける</option></select>'+
    '<div class="seg" role="group" aria-label="表示">'+segBtn("layout","tabs","タブ")+segBtn("layout","board","ボード")+segBtn("layout","list","リスト")+'</div>'+
    '<label class="check"><input type="checkbox" id="showDone"'+(S.showDone?" checked":"")+'>古い完了・中止も表示</label>'+
  '</div>';
  if(!S.loaded.tasks && !S.loadErr){ h+='<div class="banner">タスクを読み込み中です…</div></div>'; return h; }
  if(S.layout==="list") h+=listTable(list);
  else if(S.layout==="tabs"){
    const cols=columns(list);
    let cur=cols.find(c=>c.title===S.colTab); if(!cur) cur=cols.find(c=>c.items.length)||cols[0];
    h+='<div class="seg coltabs" role="tablist" aria-label="'+(S.group==="status"?"ステータス":"分け方")+'">'+cols.map(c=>'<button type="button" role="tab" data-seg="colTab" data-val="'+esc(c.title)+'" aria-pressed="'+(cur&&c.title===cur.title)+'"><span class="dot" style="background:'+c.dot+'"></span>'+esc(c.title)+'<i>'+c.items.length+'</i></button>').join("")+'</div>';
    h+=cur&&cur.items.length?'<div class="cardgrid">'+cur.items.map(card).join("")+'</div>':'<div class="empty" style="padding:24px">なし</div>';
  }
  else h+='<div class="board">'+columns(list).map(c=>'<section class="col" aria-label="'+esc(c.title)+'"><h3><span class="dot" style="background:'+c.dot+'"></span>'+esc(c.title)+'<i>'+c.items.length+'</i></h3>'+(c.items.length?c.items.map(card).join(""):'<div class="empty">なし</div>')+'</section>').join("")+'</div>';
  if(S.tasks.length===0) h+='<div class="banner">まだタスクがありません。「＋ 新しいタスク」から最初の依頼を作れます。</div>';
  h+='</div>';
  return h;
}
function tile(label, n, cls, act){ return '<button type="button" class="tile '+cls+'" data-tile="'+act+'"><span>'+label+'</span><b>'+n+'</b></button>'; }
function segBtn(kind,val,label,n){ const on=S[kind]===val; return '<button type="button" data-seg="'+kind+'" data-val="'+val+'" aria-pressed="'+on+'">'+label+(n!==undefined?'<i>'+n+'</i>':'')+'</button>'; }
function card(t){
  const p=proj(t.projectId);
  return '<article class="card'+(isOverdue(t)?' is-overdue':'')+'" tabindex="0" data-open="'+t.id+'">'+
    '<div class="chips">'+dueChip(t)+statusChip(t)+(t.priority==="high"?'<span class="chip danger">優先度：高</span>':'')+(t.kind&&t.kind!=="通常タスク"?'<span class="chip info">'+esc(t.kind)+'</span>':'')+(isClaimOpen(t)&&isOpen(t)?'<span class="chip warn">引き受け待ち</span>':'')+((t.attachments||[]).length?'<span class="chip">📎 '+t.attachments.length+'</span>':'')+'</div>'+
    '<h4>'+esc(t.title)+'</h4>'+
    (t.status==="done"?'<div class="meta donel">✓ 完了 '+esc(t.doneAt?fmtWhen({iso:t.doneAt}):"日時不明")+(doneBy(t)?'（'+esc(doneBy(t))+'）':'')+'</div>':t.status==="cancel"?'<div class="meta">中止 '+esc(fmtWhen({iso:closedWhen(t)||""}))+'</div>':'')+
    '<div class="meta origin">依頼 '+esc(fmtWhen(reqWhen(t)))+'｜'+esc(reqWhere(t).text)+'</div>'+
    (t.status==="draft"?'<div class="meta">'+esc(t.sourceLabel||"議事録")+'から｜担当未定'+((t.suggest||[]).length?'（候補：'+esc(names(t.suggest))+'）':'')+'</div>':'<div class="meta">'+esc(nm(t.requester))+' → '+(isClaimOpen(t)?'誰か1人（'+esc(names(candidatesOf(t)))+'）':esc(names(t.assignees)))+'</div>')+
    ((t.client||p)?'<div class="meta">'+esc([t.client,p&&p.name].filter(Boolean).join("｜"))+'</div>':'')+
    (t.kind==="判断を仰ぐ" && t.answer?'<div class="meta">回答：<b>'+esc(t.answer)+'</b></div>':'')+
  '</article>';
}
function listTable(list){
  if(!list.length) return '<div class="banner">該当するタスクはありません。</div>';
  return '<div class="tablewrap"><table><thead><tr><th>期限</th><th>ステータス</th><th>タイトル</th><th>依頼日時</th><th>依頼元</th><th>依頼者</th><th>担当</th><th>完了日時</th><th>案件・プロジェクト</th><th>種別</th></tr></thead><tbody>'+
    list.map(t=>{ const p=proj(t.projectId); return '<tr class="click" data-open="'+t.id+'" tabindex="0"><td>'+dueChip(t)+'</td><td>'+statusChip(t)+'</td><td><b>'+esc(t.title)+'</b></td><td class="nowrap">'+esc(fmtWhen(reqWhen(t)))+'</td><td>'+esc(reqWhere(t).text)+'</td><td>'+esc(nm(t.requester))+'</td><td>'+esc(names(t.assignees))+'</td><td class="nowrap">'+(t.status==="done"&&t.doneAt?esc(fmtWhen({iso:t.doneAt}))+(doneBy(t)?'<br><span class="sub">'+esc(doneBy(t))+'</span>':''):'')+'</td><td>'+esc([t.client,p&&p.name].filter(Boolean).join("｜"))+'</td><td>'+esc(t.kind||"")+'</td></tr>'; }).join("")+
  '</tbody></table></div>';
}

function viewTeam(){
  let h=topBar("メンバー状況","全員の担当タスクを一度に見られます。名前を押すと、その人のタスクを開きます。", newBtn());
  h+='<div class="content">'+banners();
  const drafts=S.tasks.filter(t=>t.status==="draft").length;
  if(drafts) h+='<div class="banner warn">議事録や依頼フォームから入った「振り分け待ち」が '+drafts+' 件あります。担当と期限を決めて登録してください。 <button class="btn small" type="button" data-tile="drafts">振り分ける</button></div>';
  const all=S.tasks;
  const totals={open:all.filter(isOpen).length, overdue:all.filter(isOverdue).length, review:all.filter(t=>t.status==="review").length, blocked:all.filter(t=>t.status==="blocked").length};
  h+='<div class="tiles">'+
    '<div class="tile" style="cursor:default"><span>進行中のタスク（全員）</span><b>'+totals.open+'</b></div>'+
    '<div class="tile alert" style="cursor:default"><span>期限切れ</span><b>'+totals.overdue+'</b></div>'+
    '<div class="tile waiting" style="cursor:default"><span>確認待ち</span><b>'+totals.review+'</b></div>'+
    '<div class="tile" style="cursor:default"><span>ブロック中</span><b>'+totals.blocked+'</b></div>'+
  '</div>';
  const keys=["todo","reopen","doing","blocked","review"];
  h+='<div class="legend">'+keys.map(k=>'<span><i style="background:'+STATUS[k].color+'"></i>'+STATUS[k].label+'</span>').join("")+'</div>';
  h+='<div class="tablewrap"><table><thead><tr><th>メンバー</th><th class="num">担当企業</th><th>担当中の内訳</th><th class="num">担当中</th><th class="num">期限切れ</th><th class="num">確認待ち<br><span style="font-weight:400">（自分が確認する）</span></th><th class="num">頼んでいる</th><th class="num">直近7日の完了</th><th>いちばん近い期限</th></tr></thead><tbody>';
  for(const m of S.roster){
    const mine=all.filter(t=>(t.assignees||[]).includes(m.key));
    const open=mine.filter(isOpen);
    const counts=Object.fromEntries(keys.map(k=>[k,open.filter(t=>t.status===k).length]));
    const od=open.filter(isOverdue).length;
    const toCheck=all.filter(t=>t.requester===m.key && t.status==="review").length;
    const asked=all.filter(t=>t.requester===m.key && isOpen(t) && !((t.assignees||[]).length===1&&t.assignees[0]===m.key)).length;
    const done7=mine.filter(t=>t.status==="done" && daysSince(t.doneAt)<=7).length;
    const next=sortTasks(open.filter(t=>t.due && t.status!=="review"))[0];
    const total=open.length||1;
    const cl=clientsOfMember(m);
    h+='<tr class="click" data-person="'+m.key+'" tabindex="0"><td><b>'+esc(m.full)+'</b></td><td class="num" title="'+esc(cl.map(c=>c.label).join("\n"))+'">'+(S.clients.length?cl.length:"—")+'</td>'+
      '<td><div class="stack" title="'+keys.map(k=>STATUS[k].label+' '+counts[k]).join(' / ')+'">'+keys.map(k=>counts[k]?'<span style="width:'+(counts[k]/total*100)+'%;background:'+STATUS[k].color+'"></span>':'').join("")+'</div></td>'+
      '<td class="num"><b>'+open.length+'</b></td><td class="num" style="'+(od?'color:var(--danger);font-weight:700':'')+'">'+od+'</td><td class="num">'+toCheck+'</td><td class="num">'+asked+'</td><td class="num">'+done7+'</td>'+
      '<td>'+(next?dueChip(next)+' <span class="sub">'+esc(next.title)+'</span>':'<span class="sub">なし</span>')+'</td></tr>';
  }
  h+='</tbody></table></div>';
  // 期限切れ一覧
  const od=sortTasks(all.filter(isOverdue));
  h+='<h2 style="font-family:var(--display);font-size:16px;margin:8px 0 0">期限切れのタスク</h2>';
  h+= od.length?listTable(od):'<div class="banner">期限切れのタスクはありません。</div>';
  h+='</div>';
  return h;
}

function viewProjects(){
  const canMake=!!S.me && !S.readOnly;
  let h=topBar("プロジェクト","案件や施策ごとにタスクをまとめます。メンバーなら誰でも作成・編集できます。", canMake?'<button class="btn primary" type="button" data-act="newProject">＋ 新しいプロジェクト</button>':'');
  h+='<div class="content">'+banners();
  if(!S.projects.length) h+='<div class="banner">まだプロジェクトがありません。'+(canMake?'「＋ 新しいプロジェクト」から作れます。':'作成すると、ここに表示されます。')+'</div>';
  h+='<div class="pgrid">'+S.projects.map(p=>{
    const ts=S.tasks.filter(t=>t.projectId===p.id);
    const open=ts.filter(isOpen).length, od=ts.filter(isOverdue).length, done=ts.filter(t=>t.status==="done").length;
    return '<div class="pcard" role="button" tabindex="0" data-proj="'+p.id+'"><h3><span class="sw" style="background:'+esc(p.color||"#1e5aa6")+'"></span>'+esc(p.name)+'</h3>'+
      (p.desc?'<p>'+esc(p.desc)+'</p>':'')+
      '<div class="nums"><span><b>'+open+'</b>進行中</span><span'+(od?' style="color:var(--danger)"':'')+'><b'+(od?' style="color:var(--danger)"':'')+'>'+od+'</b>期限切れ</span><span><b>'+done+'</b>完了</span></div>'+
      '<div class="hint">責任者：'+esc(nm(p.owner))+'</div>'+
      (canMake?'<div><button class="btn small" type="button" data-editproj="'+p.id+'">編集</button></div>':'')+
    '</div>'; }).join("")+'</div>';
  h+='</div>';
  return h;
}

function viewForms(){
  const f=S.forms;
  let h=topBar("フォームからの依頼","リスト作成依頼フォーム・タスク依頼フォームから届いた、まだ終わっていない依頼です（タスク管理表から読み込み）。",
    '<a class="btn" href="'+esc(FORM_LIST_URL)+'" target="_blank" rel="noopener">リスト作成依頼フォーム ↗</a><a class="btn" href="'+esc(FORM_TASK_URL)+'" target="_blank" rel="noopener">タスク依頼フォーム ↗</a><button class="btn" type="button" data-act="reloadForms">再読み込み</button>');
  h+='<div class="content">'+banners();
  if(f.state==="loading") h+='<div class="banner">タスク管理表を読み込み中です…（初回はGoogle Sheetsの利用許可を確認する画面が出ます）</div>';
  if(f.state==="error") h+='<div class="banner err">'+esc(f.err)+' <button class="btn small" type="button" data-act="reloadForms">もう一度読み込む</button></div>';
  if(f.state==="idle") h+='<div class="banner">まだ読み込んでいません。<button class="btn small" type="button" data-act="reloadForms">タスク管理表から読み込む</button></div>';
  if(f.state==="ok"){
    h+='<div class="hint">最終読み込み：'+esc(fmtTime(new Date(f.at).toISOString()))+'　／　「ボードに載せる」を押すと、このボードのタスクになり担当者にSlackで知らせます（シート側のステータスは変わりません）。</div>';
    h+=formTable("リスト作成依頼（リスト依頼一覧）", f.list, "list");
    h+=formTable("タスク依頼（タスク依頼一覧）", f.task, "task");
  }
  h+='</div>';
  return h;
}
function formTable(title, rows, type){
  let h='<h2 style="font-family:var(--display);font-size:16px;margin:8px 0 0">'+esc(title)+'　<span class="hint">'+rows.length+'件</span></h2>';
  if(!rows.length) return h+'<div class="banner">未完了の依頼はありません。</div>';
  h+='<div class="tablewrap"><table><thead><tr><th>納品希望日</th><th>ステータス</th><th>依頼者</th><th>'+(type==="list"?"企業名／抽出先":"依頼種類")+'</th><th>内容</th><th>担当</th><th></th></tr></thead><tbody>';
  for(const r of rows){
    const imported=S.tasks.find(t=>t.sourceKey===r.key) || (boardRowTask(r)&&boardRowTask(r).id?boardRowTask(r):null);
    const d=dayDiff(r.due);
    const dueTxt=r.due?(d<0?'<span class="chip danger">'+(-d)+'日超過</span> ':'')+esc(fmtDate(r.due)):'<span class="sub">なし</span>';
    h+='<tr><td>'+dueTxt+'</td><td><span class="chip'+(r.status==="対応中"?" accent":r.status==="保留"?" info":"")+'">'+esc(r.status||"未着手")+'</span></td><td>'+esc(r.requester)+'<div class="sub">'+esc(r.tsLabel)+'</div></td>'+
      '<td>'+(type==="list"?'<b>'+esc(r.company||"（企業名なし）")+'</b><div class="sub">'+esc(r.source)+'</div>':esc(r.kind))+'</td>'+
      '<td style="max-width:360px"><div style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:6.5em;overflow:hidden">'+esc(r.detail)+'</div>'+(r.url?'<a href="'+esc(r.url)+'" target="_blank" rel="noopener" class="sub">共有シートを開く ↗</a>':'')+'</td>'+
      '<td>'+esc(r.assignee||"")+'</td>'+
      '<td>'+(imported?'<button class="btn small" type="button" data-open="'+imported.id+'">ボードで開く</button>':'<button class="btn small" type="button" data-import="'+esc(r.key)+'"'+(S.readOnly?' disabled':'')+'>ボードに載せる</button>')+'</td></tr>';
  }
  return h+'</tbody></table></div>';
}

/* ============ フォーム依頼の読み込み（Google Sheets） ============ */
function normDue(s){ const m=String(s||"").match(/(\d{2,4})[\/\-.年](\d{1,2})[\/\-.月](\d{1,2})/); if(!m) return ""; let y=+m[1]; if(y<100) y+=2000; return y+"-"+pad(+m[2])+"-"+pad(+m[3]); }
function tsLabel(s){ const m=String(s||"").match(/\d{4}\/(\d{1,2})\/(\d{1,2})/); return m?(+m[1])+"/"+(+m[2])+" 依頼":""; }
function valuesOf(res){ const p=res && res.payload; if(p && Array.isArray(p.values)) return p.values; if(p && p.content && Array.isArray(p.content.values)) return p.content.values; if(typeof p==="string"){ try{ const j=JSON.parse(p); return j.values||[]; }catch(e){} } return []; }
async function loadForms(refresh, auto){
  if(!S.mcp){ if(auto) return; S.forms={...S.forms,state:"error",err:"このページからGoogle Sheetsにつなげられません（claude.aiで開いてください）。"}; render(); return; }
  if(S.forms.state==="loading") return;
  S.forms={...S.forms,state:"loading"}; render();
  const opt={cache:{staleTime:60000,gcTime:600000, refresh:!!refresh}};
  try{
    S.mcp.callTool("Google Sheets","get_values",{spreadsheetId:H100_SHEET, range:"'フォームの回答 1'!A:AH"},opt).then(r=>{ S.h100=parseH100(r); h100Sync(); }).catch(()=>{});
    const [a,b]=await Promise.all([
      S.mcp.callTool("Google Sheets","get_values",{spreadsheetId:SHEET_ID, range:"'リスト依頼一覧'!A1:P1500"},opt),
      S.mcp.callTool("Google Sheets","get_values",{spreadsheetId:SHEET_ID, range:"'タスク依頼一覧'!A1:L1500"},opt)
    ]);
    const done=["完了","不可","中止"];
    // 同じ時刻・同じ依頼者の行が複数あるときは、2行目以降に #2, #3… を付けて別の依頼として扱う
    const uniq=xs=>{ const c={}; xs.forEach(x=>{ c[x.key]=(c[x.key]||0)+1; if(c[x.key]>1) x.key+="#"+c[x.key]; }); return xs; };
    const listAll=uniq(valuesOf(a).slice(1).map((r,i)=>({type:"list", key:"list|"+(r[0]||i)+"|"+(r[1]||""), ts:r[0], tsLabel:tsLabel(r[0]), requester:r[1]||"", due:normDue(r[2]), source:r[3]||"", url:r[4]||"", detail:[r[5],r[6]].filter(Boolean).join("\n"), target:r[5]||"", product:r[6]||"", xsite:r[7]||"", note:r[8]||"", company:r[9]||"", site:r[8]||"", status:(r[13]||"").trim(), assignee:r[14]||"", prio:r[15]||""})));
    const list=listAll.filter(r=>r.ts && !done.includes(r.status));
    const taskAll=uniq(valuesOf(b).slice(1).map((r,i)=>({type:"task", key:"task|"+(r[0]||i)+"|"+(r[1]||""), ts:r[0], tsLabel:tsLabel(r[0]), requester:r[1]||"", due:normDue(r[2]), kind:r[3]||"", detail:r[4]||"", mark:r[7]||"", url:"", status:(r[9]||"").trim(), assignee:r[10]||"", prio:r[8]||""})));
    const task=taskAll.filter(r=>r.ts && !done.includes(r.status));
    S.formsAll=[...listAll,...taskAll];
    const byDue=(x,y)=>(x.due||"9999").localeCompare(y.due||"9999");
    S.forms={state:"ok", list:list.sort(byDue), task:task.sort(byDue), err:"", at:Date.now()};
    autoIntake();
  }catch(e){
    S.forms={...S.forms,state:"error",err:mcpErrText(e,"Google Sheets")};
  }
  render();
}
function mcpErrText(e, server){
  const c=e&&e.code;
  if(c==="server_not_connected") return server+"のコネクタが未接続です。claude.aiの設定 → コネクタで"+server+"を追加してください。";
  if(c==="needs_reauth") return server+"の接続が切れています。claude.aiの設定 → コネクタで再接続してください。";
  if(c==="approval_required"||c==="not_in_manifest") return server+"の利用が許可されていません。ページの許可画面で「許可」を選ぶと使えます。";
  if(c==="selection_required") return server+"のコネクタが複数あります。claude.aiで使うものを選んでください。";
  if(c==="blocked_by_policy") return "組織の設定で"+server+"の利用が止められています。";
  if(c==="tool_error") return server+"がエラーを返しました："+(e.message||"");
  if(c==="server_unavailable") return server+"に一時的につながりません。少し待ってから再度お試しください。";
  return server+"との連携に失敗しました（"+(c||"不明")+"）。";
}
function boardRowTask(r){ const m=String((r.site||"")+" "+(r.mark||"")); if(m.indexOf(BOARD_MARK)<0) return null; const id=(m.match(/CSタスクボードから（([A-Za-z0-9_\-]+)）/)||[])[1]; return S.tasks.find(t=>t.id===id) || {id:id||""}; }
/* 依頼フォーム・営業戦略ルームから入った新しい行は、ボードに自動で載せる（AUTO_FROM 以降の依頼だけ） */
const AUTO_FROM="2026-11-17";
const LIST_OWNER="kitami";   // リスト作成はすべて北見さん担当
function tsDay(s){ const m=String(s||"").match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/); return m?m[1]+"-"+pad(+m[2])+"-"+pad(+m[3]):""; }
function srcLabel(r){ return r.type==="list" ? (/営業戦略ルーム/.test(r.site||"")?"営業戦略ルーム":"リスト作成依頼フォーム") : "タスク依頼フォーム"; }
function hashKey(k){ let h=5381; for(let i=0;i<k.length;i++){ h=((h<<5)+h+k.charCodeAt(i))|0; } return (h>>>0).toString(36); }
async function autoIntake(){
  if(S.readOnly || !S.db || !S.loaded.tasks || S.intakeBusy) return;
  // 以前の取り込みで期限が空になったタスクに、シートの納品希望日を入れ直す
  for(const r of (S.formsAll||[])){
    if(!r.due) continue;
    const t=S.tasks.find(x=>x.sourceKey===r.key && !x.due);
    if(t){ try{ await S.db.doc("tasks/"+t.id).update({due:r.due, updatedAt:nowIso()}); }catch(e){} }
  }
  // 以前の「ターゲット詳細・商材」がひとまとまりのメモを、項目ごとに分けたメモに置き換える
  for(const r of (S.formsAll||[])){
    if(r.type!=="list") continue;
    const t=S.tasks.find(x=>x.sourceKey===r.key && /^【ターゲット詳細・商材】/.test(x.memo||""));
    if(t){ try{ await S.db.doc("tasks/"+t.id).update({memo:listMemo(r), updatedAt:nowIso()}); }catch(e){} }
  }
  // 担当が決まっていないリスト作成タスクは北見さんへ
  for(const t of S.tasks.filter(x=>isListTask(x) && isOpen(x) && (x.status==="draft" || !(x.assignees||[]).length))){
    try{ await S.db.doc("tasks/"+t.id).update({assignees:[LIST_OWNER], status:t.status==="draft"?"todo":t.status, suggest:[], updatedAt:nowIso(), history:hist(t, "リスト作成のため担当を北見さんに設定")}); }catch(e){}
  }
  // シート側のステータス（完了・不可・中止・対応中）をボードのタスクに反映する
  const SHEET_ST={"完了":"done","不可":"cancel","中止":"cancel","対応中":"doing"};
  for(const r of (S.formsAll||[])){
    const st=SHEET_ST[r.status]; if(!st) continue;
    const bt=boardRowTask(r);
    const t=S.tasks.find(x=>x.sourceKey===r.key) || (bt&&bt.id&&S.tasks.find(x=>x.id===bt.id));
    if(!t || t.status===st || !isOpen(t)) continue;
    if(st==="doing" && t.status!=="todo") continue;
    const patch={status:st, updatedAt:nowIso(), history:hist(t, "スプシのステータスが「"+r.status+"」になったため、"+(STATUS[st]?STATUS[st].label:st)+"に変更")};
    if(st==="done") patch.doneAt=nowIso();
    try{ await S.db.doc("tasks/"+t.id).update(patch); }catch(e){}
  }
  const del=S.deleted||{ids:new Set(),keys:new Set()};
  const rows=[...S.forms.list,...S.forms.task].filter(r=>tsDay(r.ts)>=AUTO_FROM && !boardRowTask(r) && !S.tasks.some(t=>t.sourceKey===r.key) && !del.keys.has(r.key) && !del.ids.has("form-"+hashKey(r.key)));
  if(!rows.length){ h100Sync(); return; }
  S.intakeBusy=true;
  let n=0;
  for(const r of rows){
    const id="form-"+hashKey(r.key);
    if(S.tasks.some(t=>t.id===id)) continue;
    const t=formToTask(r);
    const asg=t.assignees.length;
    const doc={...t, status: asg?t.status:"draft", suggest: asg?[]:["kitahara"], sourceLabel:srcLabel(r), options:[], answer:"", createdAt:nowIso(), updatedAt:nowIso(), createdBy:"auto", doneAt:"", history:[{at:nowIso(), by:S.me, text:"自動で取り込み（"+srcLabel(r)+"）"}]};
    try{
      await S.db.doc("tasks/"+id).set(doc);
      n++;
      const head="【CSタスク】"+nm(doc.requester)+"さんから"+srcLabel(r)+"で依頼が届きました";
      const body="\n**"+doc.title+"**\n期限："+(doc.due?fmtDate(doc.due):"なし")+linkLine(id);
      // 営業戦略ルームからの依頼は、送った時点でルーム側がSlackで知らせているので二重に送らない
      if(srcLabel(r)!=="営業戦略ルーム"){
        if(asg) notify([...doc.assignees, doc.requester], head+body);
        else notify(["kitahara"], head+"（担当がまだ決まっていません。振り分けてください）"+body);
      }
    }catch(e){ break; }
  }
  S.intakeBusy=false;
  if(n) toast("新しい依頼を "+n+" 件ボードに載せました");
  h100Sync();
}


/* ============ 100件リスト（無料営業キャンペーン申込フォーム）→ 北見さんのタスク ============ */
const H100_SHEET="1pHtiFMjTCCjH1L_-rYczw6FMfm-kPDirnCJotv0gKTo", H100_GID="908157083", H100_FROM="2026-11-10";
function parseH100(res){
  const rows=valuesOf(res).slice(1); const out=[];
  rows.forEach((r,i)=>{
    if(!r[0]||!r[1]) return;
    out.push({row:i+2, ts:r[0], company:String(r[1]).trim(), name:r[4]||"", url:r[7]||"", strength:r[8]||"", note:r[21]||"", sales:r[22]||"",
      flag:r[25]||"", owner:r[26]||"", list:r[27]||"", cond:r[28]||"", sendOk:String(r[29]||"").toUpperCase()==="TRUE", sent:r[30]||"", targetList:r[31]||"", persona:r[32]||"",
      key:"h100|"+r[0]+"|"+String(r[1]).trim()});
  });
  return out;
}
function h100Memo(x){
  const sec=(h,v)=>String(v||"").trim()?"【"+h+"】\n"+String(v).trim():"";
  return [sec("申込企業",x.company+(x.name?"（"+x.name+"様）":"")), sec("サービスURL",x.url), sec("サービスの特徴・強み",x.strength), sec("リスト作成条件",x.cond), sec("ターゲット・ペルソナ",[x.targetList,x.persona].filter(Boolean).join("\n")), sec("備考",x.note),
    "【やること】\n100件リストを作成し、申込行の「リスト」欄にURL、「リストメール送信OK？」にチェック（毎日20時に自動送信）。\n申込行：https://docs.google.com/spreadsheets/d/"+H100_SHEET+"/edit#gid="+H100_GID+"&range="+x.row+":"+x.row]
    .filter(Boolean).join("\n\n")+"\n\n（100件リスト申込フォームから取り込み）";
}
async function h100Sync(){
  if(S.readOnly || !S.db || !S.loaded.tasks || !(S.h100||[]).length) return;
  const del=S.deleted||{ids:new Set(),keys:new Set()};
  for(const x of S.h100){
    const t=S.tasks.find(y=>y.sourceKey===x.key);
    const done=x.sendOk || /送信済/.test(x.sent);
    if(t){
      if(done && isOpen(t)){ try{ await S.db.doc("tasks/"+t.id).update({status:"done", doneAt:nowIso(), updatedAt:nowIso(), history:hist(t,"申込シートで送信済みになったため完了に変更")}); }catch(e){} }
      continue;
    }
    if(done || tsDay(x.ts)<H100_FROM || del.keys.has(x.key) || del.ids.has("h100-"+hashKey(x.key))) continue;
    const id="h100-"+hashKey(x.key);
    if(S.tasks.some(y=>y.id===id) || S.h100Busy) continue;
    const asg=matchMember(x.owner)||LIST_OWNER;
    const doc={title:"100件リスト作成："+x.company+"様", memo:h100Memo(x), kind:"リスト作成", projectId:"", client:x.company,
      requester:matchMember(x.sales)||"kitahara", assignees:[asg], due:nextBizDay(tsDay(x.ts)), priority:"normal", status:"todo", sourceKey:x.key,
      sourceLabel:"100件リスト申込フォーム", fromName:x.company+(x.name?"（"+x.name+"様）":"")+"の申込", options:[], answer:"", createdAt:nowIso(), updatedAt:nowIso(), createdBy:"auto", doneAt:"", history:[{at:nowIso(), by:S.me, text:"自動で取り込み（100件リスト申込フォーム）"}]};
    S.h100Busy=true;
    try{ await S.db.doc("tasks/"+id).set(doc); notify([asg], "【CSタスク】100件リストの申込が届きました\n**"+doc.title+"**\n期限："+fmtDate(doc.due)+"\n依頼元：100件リスト申込フォーム（"+doc.fromName+"）"+linkLine(id)); toast("100件リストの依頼をボードに載せました：" + x.company); }catch(e){}
    S.h100Busy=false;
  }
}

/* リスト依頼一覧の1行を、項目ごとに分けたメモにする（ターゲット詳細と商材が混ざらないように） */
function listMemo(r){
  const sec=(h,v)=>String(v||"").trim()?"【"+h+"】\n"+String(v).trim():"";
  return [sec("ターゲット詳細",r.target), sec("商材・目的",r.product), sec("抽出先",r.source), sec("抽出希望サイト",r.xsite), sec("類似分析データ／メモ",r.note), sec("共有シート",r.url)]
    .filter(Boolean).join("\n\n")+"\n\n（"+srcLabel(r)+"から取り込み／依頼者："+r.requester+"）";
}
function formToTask(r){
  const req=matchMember(r.requester)||S.me;
  const asg=r.type==="list" ? LIST_OWNER : matchMember(r.assignee);
  const fromRoom=r.type==="list" && /営業戦略ルーム/.test(r.site||"");
  return {
    title: r.type==="list" ? "リスト作成："+(r.company||"企業名なし")+(r.source?"（"+r.source+"）":"") : (r.kind||"タスク")+"："+String(r.detail).split("\n")[0].slice(0,40),
    memo: r.type==="list" ? listMemo(r) : r.detail+(r.url?"\n\n共有シート："+r.url:"")+"\n\n（"+srcLabel(r)+"から取り込み／依頼者："+r.requester+"）",
    kind: r.type==="list"?"リスト作成":"通常タスク",
    requester:req, assignees: asg?[asg]:[], due:r.due, priority: /高/.test(r.prio)?"high":"normal",
    status: r.status==="対応中"?"doing":"todo", client: r.company||"", projectId:"", sourceKey:r.key
  };
}
async function importForm(key){
  const r=[...S.forms.list,...S.forms.task].find(x=>x.key===key); if(!r) return;
  const t=formToTask(r); if(!t.assignees.length) t.assignees=["kitahara"];
  const id=await createTask(t, true);
  if(id) toast("ボードに載せました："+t.title);
}

/* ============ タスク書き込み ============ */
function hist(t, text){ const h=(t.history||[]).slice(-39); h.push({at:nowIso(), by:S.me, text}); return h; }
const MODES=[
  ["together","全員で1つ","1件のタスクを選んだ人全員で持ちます（今までどおり）。"],
  ["each","各自それぞれ","選んだ人ごとに1件ずつ作ります。アンケート回答・提出物など、一人ひとりにやってほしいとき。"],
  ["claim","誰か1人でOK","選んだ人全員に届き、最初に「担当します」を押した人が担当になります。ほかの人の一覧からは消えます。"]
];
/* ---- プロジェクトの自動振り分け（プロジェクト未設定のタスクだけ。人が外したものは戻さない） ---- */
const PROJECT_RULES=[
  ["zentai",   t=>/^【全体連絡】/.test(t.title||"")],
  ["list",     t=>t.kind==="リスト作成" || /リスト(作成|生成|追加)|ハウスリスト|架電禁止|100件リスト|スクレイピング|情報付与/.test(t.title||"")],
  ["apo",      t=>/アポ通知|商談(実施|管理|結果)|アポ管理|アポ設定|日程設定/.test(t.title||"")],
  ["dashboard",t=>/ダッシュボード/.test(t.title||"")],
  ["koryukai", t=>/交流会/.test(t.title||"")],
  ["yorisoi",  t=>/よりそい/.test(t.title||"")],
  ["teirei",   t=>["定例資料","継続提案資料"].includes(t.kind) || /定例|継続提案|満了|まとめを記入/.test(t.title||"")],
  ["tsubame",  t=>/つばめ|チェッカー/.test(t.title||"")],
  ["cs-dx",    t=>/タスクボード|自動化|Claude|案件管理|受注成立フォーム|仕組み化/.test(t.title||"")],
  ["seisaku",  t=>/記事|チラシ|ビフォーアフター|バナー|LP|導入事例|動画|資料(作成|修正)/.test(t.title||"")],
  ["client",   t=>!!(t.client) || /様|フォーム営業|連絡先|Chatwork|広告|診断|サンプル配布|講座/.test(t.title||"")]
];
function guessProject(t){ for(const [id,f] of PROJECT_RULES){ try{ if(f(t) && proj(id)) return id; }catch(e){} } return ""; }
async function autoProject(){
  if(S.readOnly || !S.db || !S.loaded || !S.loaded.tasks || S.projBusy) return;
  S.projBusy=true;
  try{
    for(const t of S.tasks){
      if(t.projectId || t.projAuto) continue;
      const g=guessProject(t); if(!g) continue;
      try{ await S.db.doc("tasks/"+t.id).update({projectId:g, projAuto:true}); t.projectId=g; t.projAuto=true; }catch(e){}
    }
  } finally { S.projBusy=false; }
}
function isClaimOpen(t){ return t.claim==="open"; }
function candidatesOf(t){ return (t.candidates&&t.candidates.length?t.candidates:t.assignees)||[]; }
async function claimTask(t, by, via){
  if(!isClaimOpen(t)) return false;
  const others=candidatesOf(t).filter(k=>k!==by);
  const ok=await updateTask(t, {assignees:[by], claim:"taken", claimedBy:by, claimedAt:nowIso()}, (via?via+"で":"")+nm(by)+"さんが担当することになりました", [], "");
  if(ok){
    const tell=others.filter(k=>k!==S.me);
    if(tell.length) notify(tell, "【CSタスク】"+nm(by)+"さんが担当することになりました（あなたの対応は不要です）\n**"+t.title+"**"+linkLine(t.id));
    if(t.requester && t.requester!==by && t.requester!==S.me && !tell.includes(t.requester)) notify([t.requester], "【CSタスク】あなたの依頼を "+nm(by)+" さんが担当します\n**"+t.title+"**"+linkLine(t.id));
  }
  return ok;
}
async function splitEach(t){
  const cs=candidatesOf(t); if(cs.length<2) return;
  const base={...t}; ["id","history","comments","claim","claimedBy","claimedAt","candidates","ai"].forEach(k=>delete base[k]);
  for(const k of cs.slice(1)){
    try{ await S.db.collection("tasks").add({...base, assignees:[k], createdAt:nowIso(), updatedAt:nowIso(), createdBy:S.me, history:[{at:nowIso(), by:S.me, text:"「"+t.title+"」を各自に分けて作成"}]}); }catch(e){ writeFail(e); return; }
  }
  await updateTask(t, {assignees:[cs[0]], claim:"", candidates:[]}, "各自それぞれのタスクに分けました（"+names(cs)+"）", cs.filter(k=>k!==S.me), "【CSタスク】この依頼は各自でやることになりました。あなたの分のタスクがあります");
  toast("各自のタスクに分けました（"+cs.length+"件）");
}
async function applySlackClaims(){
  if(S.readOnly || !S.db || !S.loaded || !S.loaded.tasks || S.claimBusy) return;
  S.claimBusy=true;
  try{
    for(const c of (S.slackClaims||[])){
      const t=S.tasks.find(x=>x.id===c.task); if(!t || !c.key) continue;
      if(c.kind==="claim" && isClaimOpen(t)) await claimTask(t, c.key, "Slackのスレッド（「"+String(c.text||"").slice(0,30)+"」）");
      else if(c.kind==="done" && isOpen(t) && !(t.history||[]).some(h=>/Slackのスレッドで完了/.test(h.text||""))){
        const pt={status:"done", doneAt:c.at||nowIso(), updatedAt:nowIso(), history:hist(t, "Slackのスレッドで完了の返信があったため完了（"+nm(c.key)+"）")};
        if(isClaimOpen(t)){ pt.assignees=[c.key]; pt.claim="taken"; pt.claimedBy=c.key; }
        try{ await S.db.doc("tasks/"+t.id).update(pt); }catch(e){}
      }
    }
  } finally { S.claimBusy=false; }
}
async function createTask(t, notifyOn){
  if(!S.db) return null;
  const doc={...t, options:t.options||[], answer:"", createdAt:nowIso(), updatedAt:nowIso(), createdBy:S.me, doneAt:"", history:[{at:nowIso(), by:S.me, text:"作成"}]};
  try{
    const ref=await S.db.collection("tasks").add(doc);
    if(notifyOn){
      const w=reqWhere(doc), src="\n依頼元："+w.text+(w.url?" "+w.url:"");
      const msg0=isClaimOpen(doc)?"【CSタスク】"+nm(doc.requester)+"さんから、誰か1人の対応でOKな依頼が届きました（候補："+names(doc.assignees)+"）\n対応できる方はボードで「担当します」を押してください\n**"+doc.title+"**\n期限："+(doc.due?fmtDate(doc.due):"なし")+linkLine(ref.id):(doc.kind==="判断を仰ぐ"?"【CSタスク】"+nm(doc.requester)+"さんから判断のお願いが届きました":"【CSタスク】"+nm(doc.requester)+"さんから依頼が届きました")+
        "\n**"+doc.title+"**\n期限："+(doc.due?fmtDate(doc.due):"なし")+"｜優先度："+PRIO[doc.priority||"normal"]+(doc.client?"｜"+doc.client:"")+linkLine(ref.id);
      const msg=msg0.replace(/(\n\[ボードで開く\]\(|$)/, src+"$1");
      notify(doc.assignees.filter(k=>k!==S.me), msg);
    }
    return ref.id;
  }catch(e){ writeFail(e); return null; }
}
async function updateTask(t, patch, logText, notifyKeys, notifyMsg){
  try{
    await S.db.doc("tasks/"+t.id).update({...patch, updatedAt:nowIso(), history:hist(t, logText)});
    if(notifyKeys && notifyKeys.length) notify(notifyKeys, notifyMsg+"\n**"+t.title+"**"+linkLine(t.id));
    return true;
  }catch(e){ writeFail(e); return false; }
}
function writeFail(e){
  const c=e&&e.code;
  if(c==="invalid_argument"){ toast("保存できませんでした。このページへの書き込み権限がない可能性があります。"); }
  else if(c==="quota_exceeded") toast("保存容量の上限に達しました。古いタスクを整理してください。");
  else toast("保存できませんでした（"+(c||"不明")+"）。もう一度お試しください。");
}
function linkLine(id){ return PAGE_URL.startsWith("http")?"\n["+"ボードで開く"+"]("+taskUrl(id)+")":""; }

/* ============ Slack通知 ============ */
async function notify(keys, message){
  const targets=[...new Set((keys||[]).filter(k=>k && k!==S.me))].map(member).filter(m=>m.slack);
  if(!targets.length) return;
  if(!S.mcp){ toast("Slack通知は送れませんでした（claude.aiで開くと送れます）。"); return; }
  const failed=[];
  for(const m of targets){
    try{ await S.mcp.callTool("Slack","slack_send_message",{channel_id:m.slack, message:"<@"+m.slack+"> "+message}); }
    catch(e){ failed.push({m,e}); }
  }
  if(!failed.length) toast("Slackで "+targets.map(m=>m.name).join("・")+" さんに知らせました");
  else toast("Slack通知を送れなかった相手がいます（"+failed.map(f=>f.m.name).join("・")+"）："+mcpErrText(failed[0].e,"Slack"), 6000);
}

/* ============ ドロワー：タスク詳細 ============ */
function openTask(id){
  const t=S.tasks.find(x=>x.id===id);
  if(!t){ if(S.loaded.tasks) toast("タスクが見つかりませんでした"); else S.pendingOpen=id; return; }
  S.openId=id;
  if(S.unsubComments) S.unsubComments();
  S.comments=[]; S.cmEdit=null;
  try{
    S.unsubComments=S.db.collection("tasks/"+id+"/comments").orderBy("at").onSnapshot(snap=>{ S.comments=snap.docs.map(d=>({id:d.id,...d.data()})); refreshDrawer(); }, ()=>{});
  }catch(e){}
  try{ history.replaceState(null,"","#t-"+id); }catch(e){}
  refreshDrawer(true);
}
function refreshDrawer(force){
  if(!S.openId) return;
  const t=S.tasks.find(x=>x.id===S.openId); if(!t) return;
  const layer=$("#layer");
  if(!force && !layer.querySelector("[data-drawer='task']")) return;
  const draft=$("#cmText")?.value||"";
  const keep={}; layer.querySelectorAll("[data-drawer='task'] input[id], [data-drawer='task'] select[id], [data-drawer='task'] textarea[id]").forEach(el=>{ keep[el.id]=el.type==="checkbox"?el.checked:el.value; });
  const sameTask=layer.querySelector("[data-drawer='task']")?.dataset.id===S.openId;
  const prev=layer.querySelector("[data-drawer='task'] .body"), sc=(prev && layer.querySelector("[data-drawer='task']").dataset.id===S.openId)?prev.scrollTop:0;
  const focused=document.activeElement && document.activeElement.id==="cmText";
  layer.innerHTML='<div class="scrim" data-scrim="1"><div class="drawer" role="dialog" aria-modal="true" aria-label="タスクの詳細" data-drawer="task" data-id="'+esc(S.openId)+'">'+drawerTask(t)+'</div></div>';
  const body=layer.querySelector("[data-drawer='task'] .body"); if(body && sc) body.scrollTop=sc;
  if(sameTask && !force) Object.keys(keep).forEach(id=>{ const el=document.getElementById(id); if(!el) return; if(el.type==="checkbox") el.checked=keep[id]; else el.value=keep[id]; });
  else if(sameTask && keep.cmNotify!==undefined && $("#cmNotify")) $("#cmNotify").checked=keep.cmNotify;
  if(draft && $("#cmText")) $("#cmText").value=draft;
  if(focused && $("#cmText")) $("#cmText").focus();
}
function originBox(t){
  const w=reqWhere(t), dn=t.status==="done";
  return '<div class="originbox"><div><span class="lab">いつ</span><b>'+esc(fmtWhen(reqWhen(t)))+'</b></div>'+
    '<div><span class="lab">どこで</span><b>'+esc(w.text)+'</b>'+(w.url?' <a href="'+esc(w.url)+'" target="_blank" rel="noopener">元の投稿 ↗</a>':'')+'</div>'+
    '<div><span class="lab">誰が</span><b>'+esc(reqWho(t))+'</b></div>'+
    (dn?'<div class="dn"><span class="lab">完了</span><b>'+esc(t.doneAt?fmtWhen({iso:t.doneAt}):"日時不明")+'</b>'+(doneViaSheet(t)?'（スプレッドシートで完了。時刻はボードに反映した時刻）':doneByKey(t)?'（'+esc(member(doneByKey(t)).full)+'さんが完了）':'')+'</div>':'')+
  '</div>';
}
function drawerTask(t){
  const me=S.me, isReq=t.requester===me, isAsg=(t.assignees||[]).includes(me), lead=isLead(me);
  const p=proj(t.projectId);
  const st=STATUS[t.status]||STATUS.todo;
  let stateMsg="", cls="";
  if(t.status==="draft"){ stateMsg="議事録から自動で入ったタスクです。誰でも「担当を決めて登録」を押せます。押すと、担当者にSlackで通知されます。"; cls="warn"; }
  else if(t.status==="review"){ stateMsg="担当者の対応が終わりました。依頼した人が内容を確かめて「完了にする」を押すと終わります。"; cls="warn"; }
  else if(t.status==="done"){ stateMsg="完了しています（"+fmtTime(t.doneAt)+"）。"; cls="ok"; }
  else if(t.status==="blocked") stateMsg="ほかの人の返事待ちなどで止まっています。";
  else if(t.status==="reopen") stateMsg="依頼した人から再依頼されています。コメントを確かめて対応してください。";
  else if(t.status==="cancel") stateMsg="中止になりました。";
  else if(t.status==="doing") stateMsg="担当者が対応中です。";
  else stateMsg="まだ着手されていません。";
  let acts=[];
  const canAsg=isAsg||lead, canReq=isReq||lead;
  if(isClaimOpen(t) && isOpen(t)){
    stateMsg="誰か1人が対応すればよい依頼です。対応する人が「担当します」を押すと、その人の担当になり、ほかの候補の一覧からは消えます。候補："+names(candidatesOf(t)); cls="warn";
  }
  if(!S.readOnly && isClaimOpen(t) && isOpen(t)){
    if(candidatesOf(t).includes(me)) acts.push('<button class="btn primary" type="button" data-act="claim">担当します</button>');
    else acts.push('<button class="btn" type="button" data-act="claim">自分が担当します（候補外）</button>');
    acts.push('<button class="btn" type="button" data-act="splitEach">各自に分ける（全員にやってもらう）</button>');
    if(canReq) acts.push('<button class="btn danger" type="button" data-st="cancel">中止</button>');
  }
  else if(!S.readOnly && t.status==="draft"){ acts.push('<button class="btn primary" type="button" data-act="edit">担当を決めて登録</button>'); if(lead) acts.push('<button class="btn danger" type="button" data-act="delete">不要なので削除</button>'); }
  else if(!S.readOnly){
    if(t.kind!=="判断を仰ぐ"){
      if(canAsg && ["todo","reopen","blocked"].includes(t.status)) acts.push('<button class="btn primary" type="button" data-st="doing">着手する</button>');
      if(canAsg && !isListTask(t) && ["todo","reopen","doing","blocked"].includes(t.status)) acts.push('<button class="btn'+(t.status==="doing"?" primary":"")+'" type="button" data-st="review">対応が終わった（確認へ）</button>');
    }
    if(canAsg && ["todo","reopen","doing"].includes(t.status)) acts.push('<button class="btn" type="button" data-st="blocked">ブロック（ほかの人待ち）</button>');
    if(canAsg && t.status!=="done" && t.status!=="cancel") acts.push('<button class="btn" type="button" data-act="later">あとで（期限を翌営業日へ）</button>');
    if(canReq && t.status==="review") acts.push('<button class="btn primary" type="button" data-st="done">完了にする</button>','<button class="btn" type="button" data-st="reopen">再依頼する</button>');
    if((canReq || (canAsg && isListTask(t))) && ["todo","doing","blocked","reopen","review"].includes(t.status) && !(canReq && t.status==="review")) acts.push('<button class="btn" type="button" data-st="done">完了にする</button>');
    if(canReq && isOpen(t)) acts.push('<button class="btn danger" type="button" data-st="cancel">中止</button>');
    if((canReq||canAsg) && (t.status==="done"||t.status==="cancel")) acts.push('<button class="btn" type="button" data-st="todo">未着手に戻す</button>');
  }
  let decide="";
  if(t.kind==="判断を仰ぐ"){
    const opts=(t.options||[]);
    decide='<div class="field"><span class="lab">判断のお願い'+(t.answer?'　回答：<b style="color:var(--ink)">'+esc(t.answer)+'</b>':'')+'</span>';
    if(canAsg && !S.readOnly && isOpen(t) && t.status!=="review"){
      decide+='<div class="decide">'+(opts.length?opts:["OK","NG"]).map(o=>'<button class="btn" type="button" data-answer="'+esc(o)+'">'+esc(o)+'</button>').join("")+'</div><div class="hint">選ぶと依頼した人に回答が届き、「確認待ち」になります。補足はコメントへ。</div>';
    } else if(!t.answer){ decide+='<div class="hint">'+esc(names(t.assignees))+'さんの回答待ちです。選択肢：'+esc((opts.length?opts:["OK","NG"]).join(" ／ "))+'</div>'; }
    decide+='</div>';
  }
  return '<header><h2>'+esc(t.title)+'<small>'+esc(t.kind||"通常タスク")+'</small></h2><button class="x" type="button" data-act="close" aria-label="閉じる">×</button></header>'+
  '<div class="body">'+
    '<div class="chips">'+dueChip(t)+statusChip(t)+'<span class="chip'+(t.priority==="high"?" danger":"")+'">優先度：'+PRIO[t.priority||"normal"]+'</span></div>'+
    '<dl class="kv"><dt>依頼者</dt><dd>'+esc(t.requester?reqWho(t):"（登録した人になります）")+'</dd><dt>担当</dt><dd>'+(isClaimOpen(t)?'<span class="chip warn">引き受け待ち</span> 候補：'+esc(candidatesOf(t).map(k=>member(k).full).join("、")):esc((t.assignees||[]).map(k=>member(k).full).join("、")||"未設定")+(t.claimedBy?' <span class="sub">（'+esc(fmtTime(t.claimedAt))+'に引き受け）</span>':''))+'</dd>'+
      '<dt>期限</dt><dd>'+(t.due?esc(fmtDate(t.due)):"なし")+'</dd><dt>案件</dt><dd>'+esc(t.client||"—")+(clientOf(t.client)?' <span class="sub">'+esc(clientDcText(clientOf(t.client)))+'</span>':'')+'</dd><dt>プロジェクト</dt><dd>'+esc(p?p.name:"—")+'</dd><dt>ボード登録</dt><dd>'+esc(fmtTime(t.createdAt))+'</dd>'+(t.status==="draft"&&(t.suggest||[]).length?'<dt>担当の候補</dt><dd>'+esc(names(t.suggest))+'（'+esc(t.meetingTitle?"議事録から推定":"初期の候補")+'）</dd>':'')+(t.meetingUrl?'<dt>議事録</dt><dd><a href="'+esc(t.meetingUrl)+'" target="_blank" rel="noopener">'+esc(t.meetingTitle||"議事録を開く")+' ↗</a></dd>':'')+'</dl>'+
    originBox(t)+
    (t.memo?'<div class="memo">'+esc(t.memo)+'</div>':'')+
    aiBox(t)+
    listBox(t)+
    attachBox(t)+
    decide+
    '<div class="state '+cls+'">'+stateMsg+'</div>'+
    (acts.length?'<div class="actions">'+acts.join("")+'</div>':'')+
    '<div class="field"><span class="lab">コメント（'+S.comments.length+'）</span>'+
      '<div class="comments">'+S.comments.map(c=>{
        const mine=c.by===S.me && !S.readOnly, editing=S.cmEdit===c.id && mine;
        return '<div class="cm"><div class="who"><b>'+esc(nm(c.by))+'</b>'+esc(fmtTime(c.at))+(c.editedAt?' <span class="sub">（編集済み '+esc(fmtTime(c.editedAt))+'）</span>':'')+((c.mentions||[]).length?'　→ '+esc(names(c.mentions)):'')+(mine&&!editing?' <button type="button" class="linkbtn" data-act="cmEdit" data-cid="'+esc(c.id)+'">編集</button>':'')+'</div>'+
          (editing?'<textarea id="cmEdit-'+esc(c.id)+'" rows="3">'+esc(c.text)+'</textarea><div class="bar"><span class="spacer"></span><button class="btn small" type="button" data-act="cmCancel">キャンセル</button><button class="btn primary small" type="button" data-act="cmSave" data-cid="'+esc(c.id)+'">保存する</button></div><div class="hint">新しく「@」を足した人にだけSlackで通知します。</div>'
                  :'<p>'+mentionHi(c.text)+'</p>')+'</div>';
      }).join("")+'</div>'+
      (S.readOnly?'':'<div style="position:relative"><textarea id="cmText" rows="3" placeholder="コメントを書く。「@」で人を呼べます（例：@小山 先方確認お願いします）"></textarea><div id="cmSug" class="mention-sug" hidden></div></div><div class="pick" aria-label="メンションする人">'+S.roster.filter(m=>m.key!==S.me).map(m=>'<button type="button" data-mention="'+esc(m.name)+'">@'+esc(m.name)+'</button>').join("")+'</div><div class="bar"><label class="check"><input type="checkbox" id="cmNotify" checked>依頼者・担当者にもSlackで知らせる</label><span class="spacer"></span><button class="btn primary small" type="button" data-act="comment">投稿する</button></div><div class="hint">メンションした人には、チェックに関係なくSlackで通知が届きます。</div>')+
    '</div>'+
    '<details><summary>更新履歴（'+(t.history||[]).length+'件）</summary><div class="hist">'+(t.history||[]).slice().reverse().map(h=>'<span>'+esc(fmtTime(h.at))+'　'+esc(nm(h.by))+'：'+esc(h.text)+'</span>').join("")+'</div></details>'+
  '</div>'+
  '<footer>'+(!S.readOnly?'<button class="btn" type="button" data-act="edit">編集する</button>':'')+(lead&&!S.readOnly?'<button class="btn danger" type="button" data-act="delete">削除</button>':'')+'<span style="flex:1"></span><button class="btn" type="button" data-act="copyLink">リンクをコピー</button></footer>';
}
async function setStatus(t, st){
  const label=STATUS[st].label;
  const patch={status:st};
  if(st==="done") patch.doneAt=nowIso();
  if(st==="todo") patch.doneAt="";
  // Slack通知は「相手が動く必要があるとき」だけ：確認へ（依頼者へ）・差し戻し（担当者へ）。着手・完了・中止などは通知しない
  const NOTIFY={
    review:{to:[t.requester], text:"さんが対応を終えました。確認をお願いします"},
    reopen:{to:(t.assignees||[]), text:"さんが差し戻しました。もう一度対応をお願いします"}
  };
  const n=NOTIFY[st];
  const keys=n?n.to.filter(k=>k && k!==S.me):[], msg=n?"【CSタスク】"+nm(S.me)+n.text+"（"+label+"）":"";
  await updateTask(t, patch, "ステータスを「"+label+"」に変更", keys, msg);
}
function nextBizDay(from){
  const d=from?new Date(from+"T00:00:00"):new Date(); if(isNaN(d)) return addDays(1);
  const base=new Date(Math.max(d.getTime(), new Date(todayStr()+"T00:00:00").getTime()));
  do{ base.setDate(base.getDate()+1); }while(base.getDay()===0||base.getDay()===6);
  return base.getFullYear()+"-"+pad(base.getMonth()+1)+"-"+pad(base.getDate());
}

/* ボードから出したリスト・タスク依頼を、タスク管理表の一覧にも1行記録する（フォームと同じ扱い） */
async function recordRequest(id, req, data){
  if(!S.mcp) return;
  const yy=d=>{ const m=String(d||"").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m?m[1].slice(2)+"/"+m[2]+"/"+m[3]:""; };
  const payload={type:req.type, taskId:id, requester:member(S.me).name||"", due:yy(data.due), assignee:(data.assignees||[]).map(k=>member(k).name).join("、"), priority:data.priority==="high"?"高":data.priority==="low"?"低":"中",
    company:data.client||"", source:req.source, url:req.url, site:req.site, target:data.memo||"", product:req.product, kind:req.rkind, detail:data.title+(data.memo?"\n"+data.memo:""), customer:data.client||""};
  try{ await S.mcp.callTool("Board","record_request",payload); toast(req.type==="list"?"リスト依頼一覧にも記録しました":"タスク依頼一覧にも記録しました"); }
  catch(e){ toast("一覧への記録はできませんでした（タスクは作成済み）："+(e&&e.message||""),7000); }
}

/* ============ ドロワー：新規・編集 ============ */
let F=null; // 編集中の下書き
function openForm(t){
  F = t ? {id:t.id, title:t.title, memo:t.memo||"", kind:t.kind||"通常タスク", projectId:t.projectId||"", client:t.client||"", assignees:((t.assignees||[]).length?t.assignees:(t.status==="draft"?(t.suggest||[]):[])).slice(), due:t.due||"", priority:t.priority||"normal", options:(t.options||[]).join("\n"), requester:t.requester, notify:false, fromDraft:t.status==="draft"}
        : {id:null, title:"", memo:"", kind:"通常タスク", projectId:S.project||"", client:"", assignees:[], due:"", priority:"normal", options:"", requester:S.me, notify:true};
  drawForm();
}
function drawForm(){
  const today=todayStr();
  const quick=[["今日",today],["明日",addDays(1)],["今週中",endOfWeek()],["なし",""]];
  $("#layer").innerHTML='<div class="scrim" data-scrim="1"><div class="drawer" role="dialog" aria-modal="true" aria-label="タスクの作成" data-drawer="form">'+
  '<header><h2>'+(F.id?(F.fromDraft?"振り分け待ちのタスクを登録":"タスクを編集"):"新しいタスク")+'<small>頼みたい相手を選ぶと、作成したときにSlackで知らせます。</small></h2><button class="x" type="button" data-act="close" aria-label="閉じる">×</button></header>'+
  '<div class="body">'+
    '<div class="field"><label for="fTitle">タイトル<span class="req">必須</span></label><input type="text" id="fTitle" value="'+esc(F.title)+'" placeholder="例：川金産業様 SRリスト作成（半導体装置ほか6キーワード）"></div>'+
    '<div class="field"><span class="lab">種別</span><div class="pick" data-pick="kind">'+KINDS.map(k=>'<button type="button" data-v="'+k+'" aria-pressed="'+(F.kind===k)+'">'+k+'</button>').join("")+'</div></div>'+
    (!F.id && F.kind==="リスト作成"?'<div class="field" style="border:1px solid var(--line);border-radius:10px;padding:10px 12px"><span class="lab">リスト作成依頼（リスト作成依頼フォームと同じ内容）</span>'+
      '<div class="pick" data-pick="rsrc" style="margin:6px 0">'+LIST_SOURCES.map(x=>'<button type="button" data-v="'+x+'" aria-pressed="'+(F.rsrc===x)+'">'+x+'</button>').join("")+'</div>'+
      '<div class="row2"><div class="field"><label for="fRurl">共有シートURL</label><input type="text" id="fRurl" value="'+esc(F.rurl||"")+'" placeholder="https://docs.google.com/spreadsheets/..."></div><div class="field"><label for="fRsite">抽出希望サイト（スクレイピングのとき）</label><input type="text" id="fRsite" value="'+esc(F.rsite||"")+'"></div></div>'+
      '<div class="field"><label for="fRprod">商材・目的</label><textarea id="fRprod" rows="2">'+esc(F.rprod||"")+'</textarea></div>'+
      '<div class="hint">ターゲット詳細は下の「ターゲット詳細」欄に、商材・目的は上の欄に分けて書いてください。企業名は「案件（企業）」に。期限＝納品希望日です。</div>'+
      '<label class="check"><input type="checkbox" id="fToSheet"'+(F.toSheet!==false?' checked':'')+'>タスク管理表の「リスト依頼一覧」にも記録する</label></div>':'')+
    (!F.id && F.kind==="タスク依頼"?'<div class="field" style="border:1px solid var(--line);border-radius:10px;padding:10px 12px"><span class="lab">タスク依頼（タスク依頼フォームと同じ内容）</span>'+
      '<div class="pick" data-pick="rkind" style="margin:6px 0">'+TASK_REQ_KINDS.map(x=>'<button type="button" data-v="'+x+'" aria-pressed="'+(F.rkind===x)+'">'+x+'</button>').join("")+'</div>'+
      '<div class="hint">詳細は「タイトル」と「メモ」に、関連する顧客は「案件名・SIS番号」に書いてください。期限＝納品希望日です。</div>'+
      '<label class="check"><input type="checkbox" id="fToSheet"'+(F.toSheet!==false?' checked':'')+'>タスク管理表の「タスク依頼一覧」にも記録する</label></div>':'')+
    (F.kind==="判断を仰ぐ"?'<div class="field"><label for="fOptions">選択肢（1行に1つ）</label><textarea id="fOptions" rows="3" placeholder="例：\nAで進める\nBで進める\n今週は見送る">'+esc(F.options)+'</textarea><div class="hint">相手はボタンを押すだけで回答できます。空欄なら「OK／NG」になります。</div></div>':'')+
    '<div class="field"><label for="fClient">案件（企業）</label><input type="text" id="fClient" list="clientList" value="'+esc(F.client)+'" placeholder="企業名かSIS番号を入れると候補が出ます（例：5084）" autocomplete="off"><datalist id="clientList">'+S.clients.map(c=>'<option value="'+esc(c.label)+'">'+esc(clientDcText(c))+'</option>').join("")+'</datalist>'+
      (clientOf(F.client)?'<div class="hint">'+esc(clientDcText(clientOf(F.client)))+'　'+esc(clientOf(F.client).status||"")+'</div>':'')+'</div>'+
    '<div class="field"><span class="lab">プロジェクト</span><input type="hidden" id="fProject" value="'+esc(F.projectId)+'"><div class="pick" data-pick="projectId"><button type="button" data-v="" aria-pressed="'+(!F.projectId)+'">なし</button>'+S.projects.map(p=>'<button type="button" data-v="'+p.id+'" aria-pressed="'+(F.projectId===p.id)+'"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+(p.color||"var(--accent)")+';margin-right:5px"></i>'+esc(p.name)+'</button>').join("")+'</div></div>'+
    '<div class="field"><span class="lab">誰に頼む<span class="req">必須</span></span><div class="pick" data-pick="assignees">'+S.roster.map(m=>'<button type="button" data-v="'+m.key+'" aria-pressed="'+F.assignees.includes(m.key)+'">'+esc(m.full)+(m.key===S.me?'（自分）':'')+'</button>').join("")+'</div></div>'+
    (!F.id && F.assignees.length>=2?'<div class="field"><span class="lab">頼み方（2人以上を選んだとき）</span><div class="pick" data-pick="mode">'+MODES.map(m=>'<button type="button" data-v="'+m[0]+'" aria-pressed="'+((F.mode||"together")===m[0])+'">'+m[1]+'</button>').join("")+'</div><div class="hint">'+esc((MODES.find(m=>m[0]===(F.mode||"together"))||MODES[0])[2])+'</div></div>':'')+
    '<div class="field"><label for="fDue">期限</label><div class="bar"><input type="date" id="fDue" value="'+esc(F.due)+'"><div class="pick" data-pick="due">'+quick.map(q=>'<button type="button" data-v="'+q[1]+'" aria-pressed="'+(F.due===q[1])+'">'+q[0]+'</button>').join("")+'</div></div></div>'+
    '<div class="field"><span class="lab">優先度</span><div class="pick" data-pick="priority">'+Object.entries(PRIO).map(([k,v])=>'<button type="button" data-v="'+k+'" aria-pressed="'+(F.priority===k)+'">'+v+'</button>').join("")+'</div></div>'+
    '<div class="field"><label for="fMemo">'+(F.kind==="リスト作成"&&!F.id?"ターゲット詳細（業種・地域・規模など）":"メモ")+'</label><textarea id="fMemo" rows="6" placeholder="'+(F.kind==="リスト作成"&&!F.id?"例：一都三県／介護・人材募集／従業員10〜50名／YouTubeかインスタのアカウントあり":"背景・やってほしいこと・参考URLなど")+'">'+esc(F.memo)+'</textarea></div>'+
    (F.id?'':'<label class="check"><input type="checkbox" id="fNotify"'+(F.notify?' checked':'')+'>担当者にSlackで知らせる</label>')+
    '<div class="bar"><label class="check"><input type="checkbox" id="fCal"'+(F.cal?' checked':'')+'>Googleカレンダーにも予定を入れる（期限日に、担当者を招待）</label><input type="time" id="fCalTime" value="'+esc(F.calTime||"10:00")+'" aria-label="開始時刻"><select id="fCalMin" aria-label="長さ">'+[15,30,60,90].map(n=>'<option value="'+n+'"'+(String(F.calMin||30)===String(n)?' selected':'')+'>'+n+'分</option>').join("")+'</select></div>'+
  '</div>'+
  '<footer><button class="btn" type="button" data-act="close">キャンセル</button><button class="btn primary" type="button" data-act="saveTask">'+(F.id?(F.fromDraft?"登録して通知する":"保存する"):"作成する")+'</button></footer>'+
  '</div></div>';
  $("#fTitle").focus();
}
function readForm(){
  F.title=$("#fTitle").value.trim(); F.memo=$("#fMemo").value; F.client=$("#fClient").value.trim(); F.projectId=$("#fProject").value; F.due=$("#fDue").value;
  if($("#fOptions")) F.options=$("#fOptions").value;
  if($("#fRurl")) F.rurl=$("#fRurl").value.trim();
  if($("#fRsite")) F.rsite=$("#fRsite").value.trim();
  if($("#fRprod")) F.rprod=$("#fRprod").value;
  if($("#fToSheet")) F.toSheet=$("#fToSheet").checked;
  if($("#fNotify")) F.notify=$("#fNotify").checked;
  if($("#fCal")){ F.cal=$("#fCal").checked; F.calTime=$("#fCalTime").value; F.calMin=$("#fCalMin").value; }
}
async function saveTask(){
  readForm();
  if(!F.title){ toast("タイトルを入れてください"); $("#fTitle").focus(); return; }
  if(!F.assignees.length){ toast("誰に頼むかを選んでください"); return; }
  const options=F.kind==="判断を仰ぐ"?F.options.split("\n").map(s=>s.trim()).filter(Boolean):[];
  const data={title:F.title, memo:F.memo, kind:F.kind, projectId:F.projectId, client:F.client, assignees:F.assignees, due:F.due, priority:F.priority, options}; if(F.id || F.projectId) data.projAuto=true;
  if(F.cal && !F.due){ toast("カレンダーに入れるには期限を入れてください"); return; }
  const btn=$('[data-act="saveTask"]'); if(btn) btn.disabled=true;
  if(F.id){
    const t=S.tasks.find(x=>x.id===F.id);
    const draft=t.status==="draft";
    const added=draft?F.assignees.slice():F.assignees.filter(k=>!(t.assignees||[]).includes(k));
    const patch=draft?{...data, status:"todo", requester:t.requester||S.me}:data;
    const msg=draft?"【CSタスク】"+nm(t.requester||S.me)+"さんから依頼が届きました（"+(t.meetingTitle||t.sourceLabel||"議事録")+"より）\n期限："+(data.due?fmtDate(data.due):"なし"):"【CSタスク】"+nm(S.me)+"さんから依頼が届きました";
    const ok=await updateTask({...t, title:data.title}, patch, draft?((t.sourceLabel||"議事録")+"から登録"):"内容を編集", added, msg);
    if(ok && draft && patch.requester && patch.requester!==S.me && !added.includes(patch.requester)) notify([patch.requester], "【CSタスク】"+nm(S.me)+"さんが、あなたの依頼の担当を "+names(added)+" さんに決めました\n**"+data.title+"**"+linkLine(F.id));
    if(ok){ const id=F.id; const c=F.cal?{time:F.calTime,min:F.calMin}:null; F=null; if(c) addToCalendar({...t,...data,id}, c.time, c.min); openTask(id); }
    else if(btn) btn.disabled=false;
  } else {
    const req=(F.kind==="リスト作成"||F.kind==="タスク依頼") && F.toSheet!==false ? {type:F.kind==="リスト作成"?"list":"task", source:F.rsrc||"SR", url:F.rurl||"", site:F.rsite||"", product:F.rprod||"", rkind:F.rkind||"その他"} : null;
    if(req && F.kind==="リスト作成" && !F.rsrc){ toast("抽出先を選んでください"); if(btn) btn.disabled=false; return; }
    if(req && F.kind==="タスク依頼" && !F.rkind){ toast("依頼種類を選んでください"); if(btn) btn.disabled=false; return; }
    const extra=req&&F.kind!=="リスト作成"?"\n\n【タスク依頼】依頼種類："+req.rkind:"";
    const listBody=F.kind==="リスト作成"?listMemo({target:data.memo, product:F.rprod||"", source:F.rsrc||"", xsite:F.rsite||"", url:F.rurl||"", requester:nm(S.me), type:"list", fromBoard:true}).replace(/\n\n（[^）]*から取り込み／依頼者：[^）]*）$/,""):"";
    const mode=F.assignees.length>=2?(F.mode||"together"):"together";
    const baseDoc={...data, memo:listBody||(data.memo+extra), requester:S.me, status:"todo", sourceKey:req?("board-"+req.type):""};
    let id=null;
    if(mode==="each"){ for(const k of F.assignees){ const x=await createTask({...baseDoc, assignees:[k]}, F.notify); if(!id) id=x; } }
    else if(mode==="claim") id=await createTask({...baseDoc, claim:"open", candidates:F.assignees.slice()}, F.notify);
    else id=await createTask(baseDoc, F.notify);
    if(id && req) recordRequest(id, req, data);
    if(id){ const c=F.cal?{time:F.calTime,min:F.calMin}:null; F=null; closeLayer(); toast("タスクを作成しました"); if(c) addToCalendar({...data,id}, c.time, c.min); }
    else if(btn) btn.disabled=false;
  }
}

/* ============ プロジェクト ============ */
let P=null;
function openProject(p){
  P = p?{id:p.id,name:p.name,desc:p.desc||"",owner:p.owner||S.me,color:p.color||PCOLORS[0]}:{id:null,name:"",desc:"",owner:S.me,color:PCOLORS[S.projects.length%PCOLORS.length]};
  $("#layer").innerHTML='<div class="scrim" data-scrim="1"><div class="drawer" role="dialog" aria-modal="true" aria-label="プロジェクト" data-drawer="project">'+
  '<header><h2>'+(P.id?"プロジェクトを編集":"新しいプロジェクト")+'<small>メンバーなら誰でも作成・編集できます。</small></h2><button class="x" type="button" data-act="close" aria-label="閉じる">×</button></header>'+
  '<div class="body">'+
    '<div class="field"><label for="pName">名前<span class="req">必須</span></label><input type="text" id="pName" value="'+esc(P.name)+'" placeholder="例：つばめリード導入"></div>'+
    '<div class="field"><label for="pDesc">説明</label><textarea id="pDesc" rows="3" placeholder="目的やゴール">'+esc(P.desc)+'</textarea></div>'+
    '<div class="field"><label for="pOwner">責任者</label><select id="pOwner">'+S.roster.map(m=>'<option value="'+m.key+'"'+(P.owner===m.key?' selected':'')+'>'+esc(m.full)+'</option>').join("")+'</select></div>'+
    '<div class="field"><span class="lab">色</span><div class="pick" data-pick="pcolor">'+PCOLORS.map(c=>'<button type="button" data-v="'+c+'" aria-pressed="'+(P.color===c)+'" aria-label="色 '+c+'" style="width:30px;height:26px;background:'+c+';border-color:'+(P.color===c?'var(--ink)':'transparent')+'"></button>').join("")+'</div></div>'+
  '</div>'+
  '<footer>'+(P.id?'<button class="btn danger" type="button" data-act="archiveProject">アーカイブ</button><span style="flex:1"></span>':'')+'<button class="btn" type="button" data-act="close">キャンセル</button><button class="btn primary" type="button" data-act="saveProject">'+(P.id?"保存する":"作成する")+'</button></footer>'+
  '</div></div>';
}
async function saveProject(archive){
  P.name=$("#pName").value.trim(); P.desc=$("#pDesc").value; P.owner=$("#pOwner").value;
  if(!P.name){ toast("名前を入れてください"); return; }
  const data={name:P.name, desc:P.desc, owner:P.owner, color:P.color, archived:!!archive, updatedAt:nowIso()};
  try{
    if(P.id){ await S.db.doc("projects/"+P.id).update(data); }
    else { await S.db.collection("projects").add({...data, createdAt:nowIso(), createdBy:S.me}); }
    closeLayer(); toast(archive?"アーカイブしました":"保存しました");
  }catch(e){
    if(e&&e.code==="invalid_argument") toast("保存できませんでした。プロジェクトの作成には、このページの共有で「編集者」になっている必要があります。",6000);
    else writeFail(e);
  }
}

/* ============ メンバー設定 ============ */
let R=null, RK="";
function openRoster(){
  R=S.roster.map(m=>({...m})); RK=(S.minutesCfg.keywords||[]).join("、");
  drawRoster();
}
function drawRoster(){
  $("#layer").innerHTML='<div class="scrim" data-scrim="1"><div class="drawer" role="dialog" aria-modal="true" aria-label="メンバー設定" data-drawer="roster">'+
  '<header><h2>メンバー設定<small>役割と、Slack通知の送り先（SlackのメンバーID）を管理します。メンバーなら誰でも保存できます。</small></h2><button class="x" type="button" data-act="close" aria-label="閉じる">×</button></header>'+
  '<div class="body"><div class="tablewrap"><table><thead><tr><th>表示名</th><th>フルネーム</th><th>役割</th><th>Slack ID</th><th>メール（カレンダー用）</th><th></th></tr></thead><tbody>'+
  R.map((m,i)=>'<tr><td><input type="text" id="rn'+i+'" value="'+esc(m.name)+'" style="width:70px"></td><td><input type="text" id="rf'+i+'" value="'+esc(m.full)+'" style="width:110px"></td><td><select id="rr'+i+'">'+["管理職","開発者","メンバー"].map(r=>'<option'+(m.role===r?' selected':'')+'>'+r+'</option>').join("")+'</select></td><td><input type="text" id="rs'+i+'" value="'+esc(m.slack)+'" style="width:120px"></td><td><input type="text" id="re'+i+'" value="'+esc(m.email||"")+'" style="width:200px"></td><td><button class="btn small danger" type="button" data-rdel="'+i+'">削除</button></td></tr>').join("")+
  '</tbody></table></div><div><button class="btn small" type="button" data-act="rosterAdd">＋ メンバーを追加</button></div><div class="hint">表示名は苗字だけにしてください（claude.aiのプロフィール名の先頭と照らし合わせて、開いた人を自動で判別します）。</div>'+
  '<div class="field"><label for="mk">議事録の自動取り込み：タイトルに含まれる言葉（「、」区切り）</label><input type="text" id="mk" value="'+esc(RK)+'"><div class="hint">この言葉がタイトルに入ったGeminiのメモから「次のステップ」を取り込み、振り分け待ちに入れます。例：CSMTG、週次MTG</div></div>'+
  (window.__GAS?'':'<div class="field"><span class="lab">Googleアカウント版のボードへ移す</span><div class="hint">タスク・コメント・プロジェクト・名簿・設定を、タスク管理表の「_board_db」シートに書き出します（上書き）。移したあとは、Googleアカウント版のボードを使ってください。</div><div><button class="btn small" type="button" data-act="migrateGas">Googleボードへデータを移す</button> <span id="migMsg" class="hint"></span></div></div>')+
  '</div>'+
  '<footer><button class="btn" type="button" data-act="close">キャンセル</button><button class="btn primary" type="button" data-act="rosterSave">保存する</button></footer></div></div>';
}
function readRoster(){ if($("#mk")) RK=$("#mk").value; R=R.map((m,i)=>({...m, name:$("#rn"+i).value.trim(), full:$("#rf"+i).value.trim(), role:$("#rr"+i).value, slack:$("#rs"+i).value.trim(), email:($("#re"+i)?$("#re"+i).value.trim():(m.email||""))})); }
function onceSnap(ref){ return new Promise((res,rej)=>{ let u=null, done=false; u=ref.onSnapshot(s=>{ if(done) return; done=true; setTimeout(()=>{ try{ u&&u(); }catch(e){} },0); res(s); }, e=>{ if(!done){ done=true; rej(e); } }); }); }
async function migrateToGas(){
  const msg=t=>{ const el=$("#migMsg"); if(el) el.textContent=t; };
  if(!S.mcp){ toast("Google Sheetsにつなげられません"); return; }
  try{
    msg("読み込み中…");
    const rows=[], now=nowIso(), push=(path,data)=>rows.push([path, JSON.stringify(data), now, "migrate"]);
    for(const c of ["tasks","projects","minutes"]){ const snap=await onceSnap(S.db.collection(c)); snap.docs.forEach(d=>push(c+"/"+d.id, d.data())); }
    for(const p of ["config/roster","config/minutes"]){ const snap=await onceSnap(S.db.doc(p)); if(snap.exists) push(p, snap.data()); }
    let nc=0;
    for(const t of S.tasks){ const snap=await onceSnap(S.db.collection("tasks/"+t.id+"/comments")); snap.docs.forEach(d=>{ push("tasks/"+t.id+"/comments/"+d.id, d.data()); nc++; }); }
    msg("書き出し中…（"+rows.length+"件）");
    await S.mcp.callTool("Google Sheets","update_values",{spreadsheetId:SHEET_ID, range:"'_board_db'!A1:D"+(rows.length+1), values:[["path","json","updatedAt","updatedBy"]].concat(rows)});
    msg("移しました："+rows.length+"件（うちコメント"+nc+"件）");
    toast("Googleボードへ移しました（"+rows.length+"件）");
  }catch(e){ msg(""); toast("移せませんでした："+mcpErrText(e,"Google Sheets"),8000); }
}
async function saveRoster(){
  readRoster();
  const members=R.filter(m=>m.name).map(m=>({...m, key:m.key||("m"+Date.now().toString(36)+Math.random().toString(36).slice(2,5)), full:m.full||m.name}));
  const keywords=RK.split(/[、,，\s]+/).map(x=>x.trim()).filter(Boolean);
  try{ await S.db.doc("config/roster").set({members, updatedAt:nowIso(), updatedBy:S.me}); await S.db.doc("config/minutes").set({keywords, updatedAt:nowIso(), updatedBy:S.me}); closeLayer(); toast("設定を保存しました"); }
  catch(e){ if(e&&e.code==="invalid_argument") toast("保存できませんでした。メンバー設定に自分のメールアドレスが入っているか確認してください。",6000); else writeFail(e); }
}

/* ============ 自分の選択 ============ */
function openWhoModal(){
  $("#layer").innerHTML='<div class="scrim" style="justify-content:center;align-items:center" data-scrim="who"><div class="modal" role="dialog" aria-modal="true" aria-label="あなたはどなたですか"><h2>あなたはどなたですか？</h2><p class="hint" style="margin:0">選んだ名前で「自分がやる」「人に頼んだ」が切り替わります。あとから左下の「切替」で変えられます。</p><div class="who">'+
    S.roster.map(m=>'<button type="button" data-who="'+m.key+'"><b>'+esc(m.full)+'</b></button>').join("")+'</div></div></div>';
}
function closeLayer(){
  $("#layer").innerHTML="";
  if(S.openId){ S.openId=null; if(S.unsubComments){ S.unsubComments(); S.unsubComments=null; } try{ history.replaceState(null,"","#"+S.view); }catch(e){} }
}
function confirmBox(text, okLabel, onOk){
  const wrap=document.createElement("div");
  wrap.className="scrim"; wrap.style.cssText="justify-content:center;align-items:center;z-index:35";
  wrap.innerHTML='<div class="modal" role="alertdialog" aria-modal="true"><h2>'+esc(text)+'</h2><div class="actions" style="justify-content:flex-end"><button class="btn" type="button" data-c="no">やめる</button><button class="btn danger" type="button" data-c="ok">'+esc(okLabel)+'</button></div></div>';
  document.body.appendChild(wrap);
  wrap.addEventListener("click",e=>{ const c=e.target.closest("[data-c]"); if(!c && e.target!==wrap) return; wrap.remove(); if(c&&c.dataset.c==="ok") onOk(); });
}

/* ============ メンション ============ */
function mentionsIn(text){ const ks=[]; S.roster.forEach(m=>{ if(m.name && String(text).includes("@"+m.name) && !ks.includes(m.key)) ks.push(m.key); }); return ks; }
function mentionHi(text){ let h=esc(text); S.roster.slice().sort((a,b)=>b.name.length-a.name.length).forEach(m=>{ if(!m.name) return; h=h.split("@"+esc(m.name)).join('<b class="mention">@'+esc(m.name)+'</b>'); }); return h; }
function mentionToken(){ const ta=$("#cmText"); if(!ta) return null; const pos=ta.selectionStart; const before=ta.value.slice(0,pos); const m=before.match(/@([^\s@]*)$/); return m?{q:m[1], start:pos-m[0].length, end:pos}:null; }
function showMentionSug(){
  const box=$("#cmSug"); if(!box) return; const tk=mentionToken();
  if(!tk){ box.hidden=true; return; }
  const list=S.roster.filter(m=>m.key!==S.me && (m.name.startsWith(tk.q)||m.full.replace(/\s/g,"").includes(tk.q)));
  if(!list.length){ box.hidden=true; return; }
  box.innerHTML=list.map(m=>'<button type="button" data-mention="'+esc(m.name)+'" data-replace="1">@'+esc(m.full)+'</button>').join(""); box.hidden=false;
}
function insertMention(name, replace){
  const ta=$("#cmText"); if(!ta) return; const tk=replace?mentionToken():null;
  const v=ta.value, ins="@"+name+" ";
  if(tk){ ta.value=v.slice(0,tk.start)+ins+v.slice(tk.end); const p=tk.start+ins.length; ta.focus(); ta.setSelectionRange(p,p); }
  else { const p=ta.selectionStart??v.length; const pre=v.slice(0,p); const sep=pre && !/\s$/.test(pre)?" ":""; ta.value=pre+sep+ins+v.slice(p); const np=(pre+sep+ins).length; ta.focus(); ta.setSelectionRange(np,np); }
  const box=$("#cmSug"); if(box) box.hidden=true;
}

/* ============ 交流会 ============ */
const KR_SHEET = "1S4GDhuB8DGv5I0_LKL_Aqhsqd3ak6jvNSux78zEa4yE";
const KR_URL = "https://docs.google.com/spreadsheets/d/"+KR_SHEET+"/edit?gid=705332788#gid=705332788";
S.kr = {state:"idle", rows:[], events:[], at:0, err:"", sel:"", seg:"yes", q:""};
function krStatus(v){ v=String(v||"").trim(); if(!v) return ""; if(/不参加|欠席|×/.test(v)) return "no"; if(/検討|△/.test(v)) return "maybe"; if(/参加|◎|○/.test(v)) return "yes"; return "other"; }
function krTruthy(v){ v=String(v||"").trim(); return !!v && !/^(なし|無|×|FALSE|false|未|-|ー)$/.test(v); }
function krEvents(header){
  const evs=[]; let year=2025, prevM=0;
  header.forEach((h,i)=>{ const m=String(h||"").match(/^(\d{1,2})\/(\d{1,2})/); if(!m) return; const mo=+m[1], d=+m[2]; if(prevM && mo<prevM) year++; prevM=mo; evs.push({label:String(h).trim(), col:i, date:year+"-"+pad(mo)+"-"+pad(d)}); });
  return evs;
}
async function loadKouryu(refresh){
  if(!S.mcp){ S.kr={...S.kr,state:"error",err:"このページからGoogle Sheetsにつなげられません（claude.aiで開いてください）。"}; render(); return; }
  S.kr={...S.kr,state:"loading"}; render();
  try{
    const res=await S.mcp.callTool("Google Sheets","get_values",{spreadsheetId:KR_SHEET, range:"'参加台帳'!A2:AN2500"},{cache:{staleTime:120000,gcTime:900000,refresh:!!refresh}});
    const v=valuesOf(res); const head=v[0]||[]; const idx=n=>head.findIndex(h=>String(h||"").trim()===n);
    const C={company:idx("企業名"), sei:idx("姓"), mei:idx("名"), ind:idx("業種"), area:idx("エリア"), role:idx("役職"), route:idx("集客経路"), heat:idx("熱"), newT:idx("新規対象"), demo:idx("デモ実施"), deal:idx("商談化"), won:idx("受注"), note:idx("備考・ヒアリング"), follow:idx("進捗・フォローメモ"), rank:idx("判定ランク")};
    const g=(r,i)=>i>=0?String(r[i]||"").trim():"";
    const events=krEvents(head);
    const rows=v.slice(1).filter(r=>r.some(c=>String(c||"").trim())).map((r,n)=>({n, company:g(r,C.company), name:[g(r,C.sei),g(r,C.mei)].filter(Boolean).join(" "), ind:g(r,C.ind), area:g(r,C.area), role:g(r,C.role), route:g(r,C.route)||"経路未入力", heat:g(r,C.heat), newT:g(r,C.newT), demo:g(r,C.demo), deal:g(r,C.deal), won:g(r,C.won), note:g(r,C.note), follow:g(r,C.follow), rank:g(r,C.rank), st:Object.fromEntries(events.map(e=>[e.label, krStatus(r[e.col])])), raw:Object.fromEntries(events.map(e=>[e.label, String(r[e.col]||"").trim()]))}));
    const today=todayStr(); const up=events.find(e=>e.date>=today);
    S.kr={...S.kr, state:"ok", rows, events, at:Date.now(), err:"", sel:S.kr.sel||(up?up.label:(events[events.length-1]||{}).label||"")};
  }catch(e){ S.kr={...S.kr,state:"error",err:mcpErrText(e,"Google Sheets")}; }
  render();
}
function viewKouryu(){
  const k=S.kr;
  let h=topBar("交流会","交流会の参加台帳から、開催回ごとの参加状況・集客経路・フォローの進み具合を表示します。",
    '<a class="btn" href="'+esc(KR_URL)+'" target="_blank" rel="noopener">参加台帳を開く ↗</a><button class="btn" type="button" data-act="reloadKr">再読み込み</button>');
  h+='<div class="content">'+banners();
  if(k.state==="idle"||k.state==="loading"){ h+='<div class="banner">参加台帳を読み込み中です…（初回はGoogle Sheetsの利用許可を確認する画面が出ます）</div></div>'; return h; }
  if(k.state==="error"){ h+='<div class="banner err">'+esc(k.err)+' <button class="btn small" type="button" data-act="reloadKr">もう一度読み込む</button></div></div>'; return h; }
  const ev=k.events.find(e=>e.label===k.sel)||k.events[k.events.length-1];
  if(!ev){ h+='<div class="banner">参加台帳に開催回の列が見つかりませんでした。</div></div>'; return h; }
  const inEv=k.rows.filter(r=>r.st[ev.label]);
  const yes=inEv.filter(r=>r.st[ev.label]==="yes"), maybe=inEv.filter(r=>r.st[ev.label]==="maybe"), no=inEv.filter(r=>r.st[ev.label]==="no");
  const d=dayDiff(ev.date);
  h+='<div class="bar"><label class="check" for="krSel" style="color:var(--ink);font-weight:700">開催回</label><select id="krSel">'+k.events.slice().reverse().map(e=>'<option value="'+esc(e.label)+'"'+(e.label===ev.label?' selected':'')+'>'+esc(e.label)+(e.date>=todayStr()?'（これから）':'')+'</option>').join("")+'</select>'+
    '<span class="chip '+(d<0?'':'accent')+'">'+(d===0?'今日開催':d>0?'あと'+d+'日':'開催済み')+'</span><span class="spacer"></span><span class="hint">最終読み込み：'+esc(fmtTime(new Date(k.at).toISOString()))+'</span></div>';
  h+='<div class="tiles">'+
    '<div class="tile" style="cursor:default"><span>参加（確定を含む）</span><b>'+yes.length+'</b></div>'+
    '<div class="tile waiting" style="cursor:default"><span>検討中</span><b>'+maybe.length+'</b></div>'+
    '<div class="tile" style="cursor:default"><span>不参加・欠席</span><b>'+no.length+'</b></div>'+
    '<div class="tile" style="cursor:default"><span>参加のうち新規対象</span><b>'+yes.filter(r=>/新規/.test(r.newT)).length+'</b></div>'+
    '<div class="tile" style="cursor:default"><span>参加のうち「熱」</span><b>'+yes.filter(r=>/熱/.test(r.heat)).length+'</b></div>'+
  '</div>';
  // 経路内訳
  const routes={}; yes.concat(maybe).forEach(r=>{ const k2=r.route; routes[k2]=routes[k2]||{yes:0,maybe:0}; routes[k2][r.st[ev.label]]++; });
  const rl=Object.entries(routes).sort((a,b)=>(b[1].yes+b[1].maybe)-(a[1].yes+a[1].maybe));
  const max=Math.max(1,...rl.map(([,c])=>c.yes+c.maybe));
  h+='<h2 style="font-family:var(--display);font-size:16px;margin:4px 0 0">集客経路の内訳（参加・検討中）</h2>';
  h+=rl.length?'<div class="tablewrap" style="padding:10px 14px"><div class="legend" style="margin-bottom:8px"><span><i style="background:var(--accent)"></i>参加</span><span><i style="background:var(--warn)"></i>検討中</span></div>'+rl.map(([name,c])=>'<div style="display:grid;grid-template-columns:150px 1fr 70px;gap:10px;align-items:center;padding:3px 0;font-size:13px"><span style="overflow-wrap:anywhere">'+esc(name)+'</span><div class="stack" style="height:10px"><span style="width:'+(c.yes/max*100)+'%;background:var(--accent)"></span><span style="width:'+(c.maybe/max*100)+'%;background:var(--warn)"></span></div><span class="sub" style="font-variant-numeric:tabular-nums">'+c.yes+'／'+c.maybe+'</span></div>').join("")+'</div>':'<div class="banner">この回の参加・検討中はまだいません。</div>';
  // 参加者一覧
  const segs=[["yes","参加",yes.length],["maybe","検討中",maybe.length],["no","不参加",no.length],["all","すべて",inEv.length]];
  let list=k.seg==="all"?inEv:inEv.filter(r=>r.st[ev.label]===k.seg);
  if(k.q){ const q=k.q.toLowerCase(); list=list.filter(r=>[r.company,r.name,r.ind,r.route,r.note,r.follow].some(x=>String(x).toLowerCase().includes(q))); }
  h+='<div class="bar" style="margin-top:6px"><h2 style="font-family:var(--display);font-size:16px;margin:0">参加者</h2><div class="seg" role="group" aria-label="参加状況">'+segs.map(s=>'<button type="button" data-krseg="'+s[0]+'" aria-pressed="'+(k.seg===s[0])+'">'+s[1]+'<i>'+s[2]+'</i></button>').join("")+'</div><input type="search" id="krq" placeholder="企業名・業種・メモで検索" value="'+esc(k.q)+'" aria-label="参加者を検索"></div>';
  h+=list.length?'<div class="tablewrap"><table><thead><tr><th>状況</th><th>企業名・氏名</th><th>業種・役職</th><th>集客経路</th><th>温度感</th><th>その後</th><th>備考・フォローメモ</th><th></th></tr></thead><tbody>'+
    list.map(r=>{ const s=r.st[ev.label]; const tk=S.tasks.find(t=>t.sourceKey==="kr|"+ev.label+"|"+r.company+"|"+r.name);
      return '<tr><td><span class="chip '+(s==="yes"?"accent":s==="maybe"?"warn":"")+'">'+esc(r.raw[ev.label]||"")+'</span></td><td><b>'+esc(r.company||"（企業名なし）")+'</b><div class="sub">'+esc(r.name)+'</div></td><td>'+esc(r.ind)+'<div class="sub">'+esc(r.role)+'</div></td><td>'+esc(r.route)+'</td><td>'+(r.heat?'<span class="chip danger">'+esc(r.heat)+'</span> ':'')+(r.newT?'<span class="chip info">'+esc(r.newT)+'</span>':'')+(r.rank?' <span class="chip">'+esc(r.rank)+'</span>':'')+'</td>'+
      '<td class="sub">'+[krTruthy(r.demo)?"デモ済":"",krTruthy(r.deal)?"商談化":"",krTruthy(r.won)?"受注":""].filter(Boolean).join("・")+'</td>'+
      '<td style="max-width:320px"><div style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:5em;overflow:hidden;font-size:12px">'+esc([r.note,r.follow].filter(Boolean).join("\n"))+'</div></td>'+
      '<td>'+(tk?'<button class="btn small" type="button" data-open="'+tk.id+'">タスクを開く</button>':'<button class="btn small" type="button" data-krtask="'+r.n+'"'+(S.readOnly?' disabled':'')+'>フォローをタスク化</button>')+'</td></tr>'; }).join("")+'</tbody></table></div>':'<div class="banner">該当する参加者はいません。</div>';
  // 開催回の推移
  const recent=k.events.slice(-8);
  h+='<h2 style="font-family:var(--display);font-size:16px;margin:8px 0 0">開催回の推移（直近8回）</h2><div class="tablewrap"><table><thead><tr><th>開催回</th><th class="num">参加</th><th class="num">検討中</th><th class="num">不参加</th><th class="num">デモ実施</th><th class="num">商談化</th><th class="num">受注</th></tr></thead><tbody>'+
    recent.slice().reverse().map(e=>{ const ys=k.rows.filter(r=>r.st[e.label]==="yes"); return '<tr class="click" data-krev="'+esc(e.label)+'"><td><b>'+esc(e.label)+'</b>'+(e.date>=todayStr()?' <span class="chip accent">これから</span>':'')+'</td><td class="num">'+ys.length+'</td><td class="num">'+k.rows.filter(r=>r.st[e.label]==="maybe").length+'</td><td class="num">'+k.rows.filter(r=>r.st[e.label]==="no").length+'</td><td class="num">'+ys.filter(r=>krTruthy(r.demo)).length+'</td><td class="num">'+ys.filter(r=>krTruthy(r.deal)).length+'</td><td class="num">'+ys.filter(r=>krTruthy(r.won)).length+'</td></tr>'; }).join("")+'</tbody></table></div>';
  h+='<div class="hint">デモ実施・商談化・受注は、参加台帳の各列に入力がある人の数です（その回に参加した人のうち）。</div>';
  h+='</div>';
  return h;
}
async function krToTask(n){
  const r=S.kr.rows.find(x=>x.n===+n); const ev=S.kr.events.find(e=>e.label===S.kr.sel); if(!r||!ev) return;
  const id=await createTask({title:"交流会フォロー："+(r.company||r.name)+"（"+ev.label+"）", memo:[r.name&&("担当者："+r.name+(r.role?"（"+r.role+"）":"")), r.ind&&("業種："+r.ind), "集客経路："+r.route, r.note&&("備考："+r.note), r.follow&&("フォローメモ："+r.follow), "参加台帳："+KR_URL].filter(Boolean).join("\n"), kind:"通常タスク", projectId:"", client:r.company, assignees:[S.me], due:nextBizDay(ev.date<todayStr()?todayStr():ev.date), priority:/熱/.test(r.heat)?"high":"normal", requester:S.me, status:"todo", sourceKey:"kr|"+ev.label+"|"+r.company+"|"+r.name}, false);
  if(id){ toast("フォローのタスクを作りました（担当：あなた。担当は編集で変えられます）"); render(); }
}

/* ============ カレンダー ============ */
function mondayOf(d){ const x=new Date(d+"T00:00:00"); const wd=(x.getDay()+6)%7; x.setDate(x.getDate()-wd); return x.getFullYear()+"-"+pad(x.getMonth()+1)+"-"+pad(x.getDate()); }
function addDaysTo(s,n){ const x=new Date(s+"T00:00:00"); x.setDate(x.getDate()+n); return x.getFullYear()+"-"+pad(x.getMonth()+1)+"-"+pad(x.getDate()); }
S.cal = {start:mondayOf(todayStr()), day:todayStr(), mode:(LS&&LS.getItem("cs.calMode"))||"day", who:(LS&&LS.getItem("cs.calWho"))||"team", sel:null, data:{}, loadedKey:""};
function calMembers(){ if(S.cal.who==="me" && S.me) return [S.me]; if(S.cal.sel) return S.cal.sel; let ks=S.roster.filter(m=>m.email && !m.inactive).map(m=>m.key); if(S.me){ ks=ks.filter(k=>k!==S.me); ks.unshift(S.me); } return ks; }
/* ============ 未返信メール（各自のGmail。本人にしか見えない） ============ */
async function loadMail(refresh, quiet){
  if(!window.__GAS || !S.mcp){ return; }
  if(S.mail.state==="loading") return;
  S.mail={...S.mail, state:"loading", err:""}; if(!quiet) render();
  try{ const r=await S.mcp.callTool("Board","unreplied",{}); const p=(r&&r.payload)||{}; S.mail={state:"ok", items:p.items||[], err:"", at:Date.now()}; }
  catch(e){ S.mail={...S.mail, state:"error", err:(e&&e.message)||"読み込めませんでした"}; }
  renderSide(); if(S.view==="mail") render();
}
function mailAge(iso){ const d=new Date(iso); if(isNaN(d)) return ""; const h=Math.floor((Date.now()-d.getTime())/3600000); return h<24?h+"時間":Math.floor(h/24)+"日"; }
function viewMail(){
  const m=S.mail;
  let h=topBar("未返信メール","あなたのGmailの受信トレイ（直近14日）で、最後のメッセージが相手からのままのスレッドです。ここに出る内容は、あなたにしか見えません。「タスクにする」を押した分だけ、件名と差出人がボードに載ります。",'<button class="btn" type="button" data-act="reloadMail">再読み込み</button>');
  if(m.state==="loading" && !m.items.length) return h+'<div class="banner">Gmailを確認しています…（初回はGoogleの許可画面が出ることがあります）</div>';
  if(m.state==="error") h+='<div class="banner err">'+esc(m.err)+'</div>';
  if(m.state==="ok" && !m.items.length) return h+'<div class="banner">未返信のメールはありません。</div>';
  h+='<div class="tablewrap"><table><thead><tr><th>受信</th><th>差出人</th><th>件名・本文の冒頭</th><th>経過</th><th></th></tr></thead><tbody>';
  m.items.forEach(x=>{
    const t=S.tasks.find(tt=>tt.sourceKey==="mail|"+x.id);
    h+='<tr><td>'+esc(fmtTime(x.date))+'</td><td>'+esc(x.from)+'</td><td><b>'+esc(x.subject)+'</b>'+(x.more?' <span class="chip">ほか同じ件名'+x.more+'件</span>':'')+'<div class="hint">'+esc(x.snippet)+'</div></td><td>'+esc(mailAge(x.date))+'</td>'+
      '<td style="white-space:nowrap"><a class="btn small" href="'+esc(x.url)+'" target="_blank" rel="noopener">Gmailで開く ↗</a> '+(t?'<button class="btn small" type="button" data-open="'+t.id+'">ボードで開く</button>':'<button class="btn small primary" type="button" data-act="mailTask" data-mid="'+esc(x.id)+'">タスクにする</button>')+'</td></tr>';
  });
  return h+'</tbody></table></div>';
}
async function mailToTask(id){
  const x=S.mail.items.find(i=>i.id===id); if(!x) return;
  const nid=await createTask({title:"メール返信："+String(x.subject).slice(0,60), memo:"差出人："+x.from+"\n受信："+fmtTime(x.date)+"\nGmail："+x.url, kind:"通常タスク", projectId:"", client:"", assignees:[S.me], requester:S.me, due:nextBizDay(todayStr()), priority:"normal", status:"todo", sourceKey:"mail|"+x.id}, false);
  if(nid){ toast("タスクにしました：「"+x.subject+"」"); render(); }
}
function evStart(e){ return (e.start&&(e.start.dateTime||e.start.date))||e.startTime||e.start_time||""; }
function evEnd(e){ return (e.end&&(e.end.dateTime||e.end.date))||e.endTime||""; }
function eventsOf(res){ const p=res&&res.payload; if(Array.isArray(p)) return p; if(p&&Array.isArray(p.events)) return p.events; if(p&&Array.isArray(p.items)) return p.items; if(typeof p==="string"){ try{ const j=JSON.parse(p); return j.events||j.items||[]; }catch(e){} } return []; }
async function loadCalendar(refresh){
  if(!S.mcp){ toast("このページからGoogleカレンダーにつなげられません（claude.aiで開いてください）。"); return; }
  const start=calRange()[0], end=calRange()[1], keys=calMembers();
  S.cal.loadedKey=calKey();
  keys.forEach(k=>{ S.cal.data[k]={state:"loading", events:[], err:""}; }); render();
  await Promise.all(keys.map(async k=>{
    const m=member(k);
    if(!m.email){ S.cal.data[k]={state:"error", events:[], err:"メンバー設定にメールアドレスがありません"}; return; }
    try{
      const res=await S.mcp.callTool("Google Calendar","list_events",{calendarId:m.email, startTime:start+"T00:00:00", endTime:end+"T00:00:00", orderBy:"startTime", pageSize:250},{cache:{staleTime:120000,gcTime:900000,refresh:!!refresh}});
      const evs=eventsOf(res).filter(e=>String(e.status||"")!=="cancelled").map(e=>({title:e.summary||e.title||"（タイトルなし）", start:evStart(e), end:evEnd(e), allDay:!!(e.start&&e.start.date&&!e.start.dateTime), busy:!!e.busyOnly, link:e.htmlLink||"", place:e.location||""}));
      S.cal.data[k]={state:"ok", events:evs, err:""};
    }catch(e){ S.cal.data[k]={state:"error", events:[], err:mcpErrText(e,"Googleカレンダー")}; }
  }));
  render();
}
function calRange(){ return S.cal.mode==="day" ? [S.cal.day, addDaysTo(S.cal.day,1)] : [S.cal.start, addDaysTo(S.cal.start,7)]; }
function calKey(){ return S.cal.mode+"|"+calRange()[0]+"|"+calMembers().join(","); }
function calHead(){
  const day=S.cal.mode==="day", today=todayStr();
  const label=day ? (()=>{ const x=new Date(S.cal.day+"T00:00:00"); return x.getFullYear()+"年"+(x.getMonth()+1)+"月"+x.getDate()+"日（"+WD[x.getDay()]+"）"; })() : fmtDate(S.cal.start)+" 〜 "+fmtDate(addDaysTo(S.cal.start,6));
  const right='<button class="btn" type="button" data-act="calToday">今日</button><button class="btn" type="button" data-act="calPrev" aria-label="前へ">‹</button><button class="btn" type="button" data-act="calNext" aria-label="次へ">›</button>'+
    '<input type="date" id="calDate" value="'+esc(day?S.cal.day:S.cal.start)+'" aria-label="日付を選ぶ">'+
    '<div class="seg" role="group" aria-label="表示の単位"><button type="button" data-act="calMode" data-v="day" aria-pressed="'+day+'">日</button><button type="button" data-act="calMode" data-v="week" aria-pressed="'+(!day)+'">週</button></div>'+
    '<button class="btn" type="button" data-act="calReload">再読み込み</button>';
  let h=topBar("カレンダー　"+label, "Googleカレンダーの予定と、その日が期限のタスクを並べて表示します。", right);
  h+='<div class="content">'+banners();
  const keys=calMembers();
  h+='<div class="bar"><div class="seg" role="group" aria-label="表示する人"><button type="button" data-act="calWho" data-v="me" aria-pressed="'+(S.cal.who==="me")+'">自分だけ</button><button type="button" data-act="calWho" data-v="team" aria-pressed="'+(S.cal.who!=="me")+'">メンバー</button></div>'+
    (S.cal.who==="me" ? '' : '<div class="pick">'+S.roster.map(m=>'<button type="button" data-calm="'+m.key+'" aria-pressed="'+keys.includes(m.key)+'">'+esc(m.name)+'</button>').join("")+'</div>')+'</div>';
  return h;
}
function viewCalendar(){
  if(S.cal.loadedKey!==calKey() && S.mcp) setTimeout(()=>loadCalendar(false),0);
  return S.cal.mode==="day" ? viewCalDay() : viewCalWeek();
}
const CAL_H0=8, CAL_H1=22, CAL_PX=56;
function hm(iso){ const t=String(iso).slice(11,16); if(!t) return null; const [a,b]=t.split(":").map(Number); return a+b/60; }
function lanes(evs){ // 重なる予定を横に並べる
  const xs=evs.map(e=>({...e, s:hm(e.start), e2:hm(e.end)})).map(e=>({...e, e2:(e.e2==null||e.e2<=e.s)?e.s+0.5:e.e2})).sort((a,b)=>a.s-b.s||b.e2-a.e2);
  const out=[]; let group=[], gEnd=-1;
  const flush=()=>{ const cols=[]; group.forEach(e=>{ let i=cols.findIndex(end=>end<=e.s); if(i<0){ i=cols.length; cols.push(0); } cols[i]=e.e2; e.lane=i; }); group.forEach(e=>{ e.lanes=cols.length; out.push(e); }); group=[]; };
  xs.forEach(e=>{ if(e.s>=gEnd && group.length) flush(); group.push(e); gEnd=Math.max(gEnd,e.e2); });
  if(group.length) flush();
  return out;
}
function viewCalDay(){
  const d=S.cal.day, keys=calMembers(), today=todayStr();
  let h=calHead();
  const hours=[]; for(let i=CAL_H0;i<=CAL_H1;i++) hours.push(i);
  const H=(CAL_H1-CAL_H0)*CAL_PX;
  const now=new Date(); const nowH=now.getHours()+now.getMinutes()/60;
  const colW=keys.length<=2?"minmax(260px,1fr)":"minmax(150px,1fr)";
  h+='<div class="calday" style="--cols:'+keys.length+';--colw:'+colW+'">';
  // ヘッダー
  h+='<div class="cd-row cd-headrow"><div class="cd-gut"></div>'+keys.map(k=>{ const m=member(k), cd=S.cal.data[k]||{}; return '<div class="cd-head"><span class="av">'+esc((m.name||"?").slice(0,2))+'</span><b>'+esc(m.full)+'</b>'+(cd.state==="loading"?'<span class="sub">読み込み中…</span>':cd.state==="error"?'<span class="sub" style="color:var(--danger)" title="'+esc(cd.err)+'">読み込めません</span>':'')+'</div>'; }).join("")+'</div>';
  // 終日・期限
  h+='<div class="cd-row cd-allday"><div class="cd-gut">終日<br>期限</div>'+keys.map(k=>{ const cd=S.cal.data[k]||{events:[]}; const ad=(cd.events||[]).filter(e=>e.allDay && String(e.start).slice(0,10)<=d && String(e.end||e.start).slice(0,10)>d); const due=S.tasks.filter(t=>t.due===d && isOpen(t) && (t.assignees||[]).includes(k));
    return '<div class="cd-cell">'+ad.map(e=>'<div class="cd-chip">'+esc(e.title)+'</div>').join("")+due.map(t=>'<div class="cd-chip due'+(isOverdue(t)?' over':'')+'" tabindex="0" data-open="'+t.id+'">期限：'+esc(t.title)+'</div>').join("")+'</div>'; }).join("")+'</div>';
  // 時間グリッド
  h+='<div class="cd-row cd-body"><div class="cd-gut cd-hours" style="height:'+H+'px">'+hours.slice(0,-1).map(i=>'<div style="top:'+((i-CAL_H0)*CAL_PX)+'px">'+i+':00</div>').join("")+'</div>';
  keys.forEach(k=>{
    const cd=S.cal.data[k]||{events:[]};
    const evs=lanes((cd.events||[]).filter(e=>!e.allDay && String(e.start).slice(0,10)===d));
    h+='<div class="cd-col" style="height:'+H+'px">';
    evs.forEach(e=>{
      const s=Math.max(e.s,CAL_H0), en=Math.min(e.e2,CAL_H1); if(en<=CAL_H0||s>=CAL_H1) return;
      const top=(s-CAL_H0)*CAL_PX, ht=Math.max((en-s)*CAL_PX-2,18), w=100/e.lanes;
      const hot=/定例|MTG|商談|報告会|交流会|打ち合わせ|打合せ/.test(e.title);
      const tag=e.link?'a':'div';
      h+='<'+tag+(e.link?' href="'+esc(e.link)+'" target="_blank" rel="noopener"':'')+' class="cd-ev'+(hot?' hot':'')+(e.busy?' busy':'')+(ht<40?' short':'')+'" style="top:'+top+'px;height:'+ht+'px;left:calc('+(w*e.lane)+'% + 2px);width:calc('+w+'% - 4px)" title="'+esc(e.title+"　"+String(e.start).slice(11,16)+"〜"+String(e.end).slice(11,16)+(e.place?"　"+e.place:""))+'"><b>'+esc(e.title)+'</b><span>'+esc(ht<40?String(e.start).slice(11,16):String(e.start).slice(11,16)+"〜"+String(e.end).slice(11,16))+'</span></'+tag+'>';
    });
    if(d===today && nowH>=CAL_H0 && nowH<=CAL_H1) h+='<div class="cd-now" style="top:'+((nowH-CAL_H0)*CAL_PX)+'px"></div>';
    h+='</div>';
  });
  h+='</div></div>';
  h+='<div class="hint">予定は、開いた人のGoogleカレンダーの権限で読み込みます。詳細が見られない人の予定は「予定あり」と出ます。予定を押すとGoogleカレンダーで開きます。</div></div>';
  return h;
}
function viewCalWeek(){
  const start=S.cal.start, days=[0,1,2,3,4,5,6].map(i=>addDaysTo(start,i)), keys=calMembers(), today=todayStr();
  let h=calHead();
  h+='<div class="tablewrap"><table style="table-layout:fixed;min-width:980px"><thead><tr><th style="width:110px">メンバー</th>'+days.map(d=>{ const x=new Date(d+"T00:00:00"); const we=x.getDay()===0||x.getDay()===6; return '<th style="'+(d===today?'background:var(--accent-bg);color:var(--accent)':we?'opacity:.6':'')+'"><button class="linkbtn" type="button" data-act="calDay" data-v="'+d+'">'+esc(fmtDate(d))+'</button></th>'; }).join("")+'</tr></thead><tbody>';
  for(const k of keys){
    const m=member(k), cd=S.cal.data[k]||{state:"idle",events:[]};
    h+='<tr><td><b>'+esc(m.full)+'</b>'+(cd.state==="loading"?'<div class="sub">読み込み中…</div>':cd.state==="error"?'<div class="sub" style="color:var(--danger)">'+esc(cd.err)+'</div>':'')+'</td>';
    for(const d of days){
      const evs=cd.events.filter(e=>String(e.start).slice(0,10)===d);
      const due=S.tasks.filter(t=>t.due===d && isOpen(t) && (t.assignees||[]).includes(k));
      h+='<td style="vertical-align:top;'+(d===today?'background:color-mix(in srgb,var(--accent-bg) 45%,transparent)':'')+'"><div style="display:flex;flex-direction:column;gap:4px">'+
        evs.map(e=>{ const t=e.allDay?"終日":String(e.start).slice(11,16); const hot=/定例|MTG|商談|報告会|交流会/.test(e.title); return '<div style="font-size:12px;line-height:1.4;padding:3px 6px;border-radius:5px;background:'+(hot?'var(--accent-bg)':'var(--muted-bg)')+';overflow-wrap:anywhere"><span style="font-variant-numeric:tabular-nums;color:var(--mute)">'+esc(t)+'</span> '+esc(e.title)+'</div>'; }).join("")+
        due.map(t=>'<div class="card'+(isOverdue(t)?' is-overdue':'')+'" style="padding:4px 6px;gap:0" tabindex="0" data-open="'+t.id+'"><span style="font-size:11px;color:var(--warn);font-weight:700">期限</span><span style="font-size:12px;overflow-wrap:anywhere">'+esc(t.title)+'</span></div>').join("")+
      '</div></td>';
    }
    h+='</tr>';
  }
  h+='</tbody></table></div><div class="hint">予定は開いた人のGoogleカレンダーの権限で読み込みます。見られない人がいる場合は、その人のカレンダーが共有されていないか、メンバー設定のメールアドレスが違います。</div></div>';
  return h;
}
async function addToCalendar(task, time, minutes){
  if(!S.mcp || !task.due) return;
  const att=(task.assignees||[]).filter(k=>k!==S.me).map(k=>member(k).email).filter(Boolean).map(email=>({email}));
  const st=task.due+"T"+(time||"10:00")+":00";
  const endD=new Date(task.due+"T"+(time||"10:00")+":00"); endD.setMinutes(endD.getMinutes()+(+minutes||30));
  const et=endD.getFullYear()+"-"+pad(endD.getMonth()+1)+"-"+pad(endD.getDate())+"T"+pad(endD.getHours())+":"+pad(endD.getMinutes())+":00";
  try{
    await S.mcp.callTool("Google Calendar","create_event",{summary:"【CSタスク】"+task.title, startTime:st, endTime:et, description:(task.memo||"")+(PAGE_URL.startsWith("http")?"\n\nボード："+taskUrl(task.id):""), attendees:att});
    toast("Googleカレンダーに予定を入れました"+(att.length?"（担当者を招待）":""));
    return true;
  }catch(e){ toast("カレンダーに入れられませんでした："+mcpErrText(e,"Googleカレンダー"),6000); return false; }
}


/* ============ デザイン（色・明るさ・文字の大きさ）。この端末に保存 ============ */
const DZ_ACCENT={
  blue:  {name:"ブルー",   l:["#1e5aa6","#ffffff","#e5edf9"], d:["#7fb0ff","#0d1a2e","#1c2b44"]},
  teal:  {name:"ティール", l:["#0f6f7a","#ffffff","#dcf0f2"], d:["#5fd0dc","#06222a","#123840"]},
  green: {name:"グリーン", l:["#1d7448","#ffffff","#e1f2e8"], d:["#6fd39c","#0b2016","#163626"]},
  purple:{name:"パープル", l:["#5b45b8","#ffffff","#ece9fa"], d:["#b3a8ff","#1a1533","#2a2550"]},
  pink:  {name:"ピンク",   l:["#b02f6b","#ffffff","#fbe5ef"], d:["#ff8fc0","#2c0f1d","#40192c"]},
  orange:{name:"オレンジ", l:["#a84d0c","#ffffff","#fcebdc"], d:["#ffad6b","#2a1606","#3d2614"]},
  gray:  {name:"グレー",   l:["#3d4a45","#ffffff","#e6eae8"], d:["#c5cfca","#151a18","#2a322e"]}
};
// bg, surface, sunken, line, muted-bg
const DZ_TONE={
  neutral:{name:"ナチュラル", l:["#f3f4f1","#ffffff","#eceee9","#dbe0db","#eef0ed"], d:["#141917","#1c2320","#171d1a","#2e3833","#232b27"]},
  white:  {name:"ホワイト", dname:"ブラック",   l:["#ffffff","#ffffff","#f3f4f4","#e2e5e4","#f1f2f2"], d:["#0f1110","#171a19","#131615","#2a2e2c","#1f2321"]},
  warm:   {name:"あたたかい", l:["#f5f1ea","#fffdf9","#ece6dc","#ddd5c7","#f0eae0"], d:["#1a1714","#23201b","#1d1a16","#3a342c","#2b2721"]},
  cool:   {name:"すっきり",   l:["#eef2f7","#ffffff","#e3e9f1","#d3dbe6","#e8edf4"], d:["#12161c","#1a2029","#151a21","#2b3442","#222a35"]}
};
const DZ_SIZE={s:{name:"小さめ",z:0.92}, m:{name:"標準",z:1}, l:{name:"大きめ",z:1.1}};
function dzGet(){ let v={}; try{ v=JSON.parse((LS&&LS.getItem("cs.design.v2"))||"{}")||{}; }catch(e){} return {mode:v.mode||"light", accent:DZ_ACCENT[v.accent]?v.accent:"blue", tone:DZ_TONE[v.tone]?v.tone:"neutral", size:DZ_SIZE[v.size]?v.size:"m"}; }
function dzDark(d){ return d.mode==="dark" || (d.mode==="auto" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); }
function applyDesign(){
  const d=dzGet(), dark=dzDark(d), r=document.documentElement;
  if(d.mode==="auto") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", d.mode);
  const a=DZ_ACCENT[d.accent][dark?"d":"l"], t=DZ_TONE[d.tone][dark?"d":"l"];
  [["--accent",a[0]],["--accent-ink",a[1]],["--accent-bg",a[2]],["--bg",t[0]],["--surface",t[1]],["--sunken",t[2]],["--line",t[3]],["--muted-bg",t[4]]].forEach(([k,v])=>r.style.setProperty(k,v));
  document.body.style.zoom = DZ_SIZE[d.size].z===1 ? "" : String(DZ_SIZE[d.size].z);
}
function setDesign(k,v){ const d=dzGet(); d[k]=v; try{ LS&&LS.setItem("cs.design.v2", JSON.stringify(d)); }catch(e){} applyDesign(); openDesign(); }
try{ window.matchMedia && matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ()=>{ if(dzGet().mode==="auto") applyDesign(); }); }catch(e){}
function openDesign(){
  const d=dzGet(), dark=dzDark(d);
  const seg=(k,opts)=>'<div class="seg" role="group">'+opts.map(([v,label])=>'<button type="button" data-act="dz" data-k="'+k+'" data-v="'+v+'" aria-pressed="'+(d[k]===v)+'">'+label+'</button>').join("")+'</div>';
  const sw=Object.entries(DZ_ACCENT).map(([k,a])=>'<button type="button" class="dz-sw" data-act="dz" data-k="accent" data-v="'+k+'" aria-pressed="'+(d.accent===k)+'" title="'+a.name+'"><i style="background:'+a[dark?"d":"l"][0]+'"></i><span>'+a.name+'</span></button>').join("");
  const tn=Object.entries(DZ_TONE).map(([k,t])=>{ const c=t[dark?"d":"l"]; return '<button type="button" class="dz-tone" data-act="dz" data-k="tone" data-v="'+k+'" aria-pressed="'+(d.tone===k)+'"><span class="dz-prev" style="background:'+c[0]+';border-color:'+c[3]+'"><i style="background:'+c[1]+';border-color:'+c[3]+'"></i></span><span>'+((dark&&t.dname)||t.name)+'</span></button>'; }).join("");
  $("#layer").innerHTML='<div class="scrim" data-scrim="1"><div class="drawer" role="dialog" aria-modal="true" aria-label="デザイン" data-drawer="design">'+
    '<header><h2>デザイン<small>この端末（このブラウザ）にだけ保存されます。ほかの人の画面は変わりません。</small></h2><button class="x" type="button" data-act="close" aria-label="閉じる">×</button></header>'+
    '<div class="body"><div class="dz">'+
      '<section><h3>明るさ</h3>'+seg("mode",[["light","ライト（標準）"],["dark","ダーク"],["auto","端末に合わせる"]])+'</section>'+
      '<section><h3>アクセントの色</h3><p class="hint">ボタン・選択中の項目・リンクの色です。</p><div class="dz-grid">'+sw+'</div></section>'+
      '<section><h3>背景</h3>'+(dark?'<p class="hint">いまはダーク表示なので、背景は暗い色の組み合わせになります。白い背景にしたいときは、明るさを「ライト」にしてください。</p>':'')+'<div class="dz-grid">'+tn+'</div></section>'+
      '<section><h3>文字の大きさ</h3>'+seg("size",Object.entries(DZ_SIZE).map(([k,x])=>[k,x.name]))+'</section>'+
      '<section><button class="btn" type="button" data-act="dzReset">元に戻す</button></section>'+
    '</div></div></div></div>';
}
applyDesign();


/* ============ AIに背景を聞く ============ */
function aiText(x){ return esc(x).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/^#+\s*/gm,"").replace(/【([^】]+)】/g,'<b class="ai-h">【$1】</b>'); }
/* ---- 添付ファイル・データ ---- */
function fmtSize(n){ n=+n||0; return n>=1048576?(n/1048576).toFixed(1)+"MB":n>=1024?Math.round(n/1024)+"KB":n?n+"B":""; }
function fileIcon(a){ const m=String(a.mime||"")+" "+String(a.name||"")+" "+String(a.url||""); return /pdf/i.test(m)?"📕":/sheet|xlsx?|csv/i.test(m)?"📗":/document|docx?/i.test(m)?"📘":/presentation|pptx?/i.test(m)?"📙":/image|png|jpe?g|gif/i.test(m)?"🖼":a.link?"🔗":"📄"; }
function attachBox(t){
  const list=t.attachments||[], busy=S.attachBusy===t.id;
  let h='<div class="field attach" data-drop="'+esc(t.id)+'"><span class="lab">添付ファイル・データ（'+list.length+'）</span>';
  if(list.length) h+='<ul class="attlist">'+list.map((a,i)=>'<li>'+fileIcon(a)+' <a href="'+esc(a.url)+'" target="_blank" rel="noopener">'+esc(a.name||a.url)+'</a> <span class="sub">'+esc([fmtSize(a.size), nm(a.by), fmtTime(a.at), a.shared==="private"?"⚠ ライトアップ共有にできませんでした":""].filter(Boolean).join("・"))+'</span>'+(!S.readOnly&&(a.by===S.me||isLead(S.me))?' <button type="button" class="linkbtn" data-attdel="'+i+'" aria-label="外す">外す</button>':'')+'</li>').join("")+'</ul>';
  if(!S.readOnly){
    if(busy) h+='<div class="hint">アップロードしています…</div>';
    else if(window.__GAS) h+='<div class="dropzone"><label class="btn small">ファイルを選ぶ<input type="file" id="attFile" multiple hidden></label><span>または、ここにPDFなどをドラッグ</span></div>';
    h+='<div class="bar" style="margin-top:6px"><input type="text" id="attUrl" placeholder="GoogleドキュメントやスプレッドシートなどのURLを貼る" style="flex:1"><button class="btn small" type="button" data-act="attLink">リンクを追加</button></div>'+
      '<div class="hint">アップロードしたファイルはあなたのGoogleドライブ「CSタスクボード_添付ファイル」に入り、ライトアップの人ならリンクで見られる設定になります。リンクを追加したときも、あなたが編集できるファイルなら同じ設定にします。</div>';
  }
  return h+'</div>';
}
function readB64(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result).split(",")[1]||""); r.onerror=rej; r.readAsDataURL(file); }); }
async function attachFiles(t, files){
  files=[...(files||[])]; if(!files.length) return;
  const big=files.find(f=>f.size>25*1024*1024); if(big){ toast("25MBを超えるファイルは添付できません："+big.name,6000); return; }
  S.attachBusy=t.id; refreshDrawer(true);
  const added=[];
  for(const f of files){
    try{
      const b64=await readB64(f);
      const r=await S.mcp.callTool("Board","attach",{taskId:t.id, name:f.name, mime:f.type||"application/octet-stream", b64});
      const p=r&&r.payload; if(p&&p.url) added.push({name:p.name||f.name, url:p.url, fileId:p.id, mime:p.mime||f.type, size:p.size||f.size, shared:p.shared, by:S.me, at:nowIso()});
    }catch(e){ toast("アップロードできませんでした："+f.name+"（"+(e&&e.message||e)+"）",7000); }
  }
  S.attachBusy=null;
  if(added.length){ const cur=S.tasks.find(x=>x.id===t.id)||t; await updateTask(cur, {attachments:[...(cur.attachments||[]), ...added]}, "添付："+added.map(a=>a.name).join("、")); toast(added.length+"件を添付しました"+(added.some(a=>a.shared==="private")?"（ライトアップ共有にできなかったものがあります）":"")); }
  refreshDrawer(true);
}
async function attachLink(t, url){
  url=String(url||"").trim(); if(!/^https?:\/\//.test(url)){ toast("URLを貼ってください"); return; }
  const m=url.match(/\/d\/([A-Za-z0-9_-]{10,})/)||url.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  let shared="", name="";
  if(m && window.__GAS){ try{ const r=await S.mcp.callTool("Board","share_domain",{fileId:m[1]}); shared=(r&&r.payload&&r.payload.shared)||""; name=(r&&r.payload&&r.payload.name)||""; }catch(e){} }
  const a={name:name||url.replace(/^https?:\/\//,"").slice(0,60), url, link:true, fileId:m?m[1]:"", shared:shared==="unknown"?"":shared, by:S.me, at:nowIso()};
  await updateTask(t, {attachments:[...(t.attachments||[]), a]}, "リンクを添付："+a.name);
  toast("リンクを追加しました");
}
function aiBox(t){
  if(!window.__GAS) return "";
  const busy=S.aiBusy===t.id, a=t.ai;
  if(busy) return '<div class="ai-box"><div class="ai-head">AIが背景を調べています…（10〜20秒ほど）</div></div>';
  if(!a||!a.text) return '<div class="ai-box ai-empty"><span>なにこのタスク？と思ったら</span><button class="btn small" type="button" data-act="aiAsk">AIに背景を聞く</button></div>';
  return '<div class="ai-box"><div class="ai-head"><b>このタスクの背景</b><span class="hint">'+(a.by==="record"?"記録から":"AIが")+'まとめました・'+esc(fmtTime(a.at))+'</span><button class="btn small" type="button" data-act="aiAsk" data-force="1">聞き直す</button></div><div class="ai-text">'+aiText(a.text)+'</div><div class="hint">AIの説明は記録をもとにした推測を含みます。違っていたら、コメントで依頼者に確かめてください。</div></div>';
}
async function aiAsk(id, force){
  if(!S.mcp) return;
  S.aiBusy=id; refreshDrawer(true);
  try{
    const r=await S.mcp.callTool("Board","explain",{id, force:!!force});
    const a=r&&r.payload; const t=S.tasks.find(x=>x.id===id); if(t && a) t.ai=a;
  }catch(e){ toast("背景を聞けませんでした："+((e&&e.message)||"エラー"),6000); }
  S.aiBusy=null; if(S.openId===id) refreshDrawer(true);
}


/* ============ リスト作成タスク：セグメント名・行リンク・企業スレッドで完了報告 ============ */
function clientKey(c){ return String(c||"").replace(/^\d+_/,"").replace(/株式会社|合同会社|有限会社|一般社団法人|（株）|\(株\)|様|\s|　/g,"").toLowerCase(); }
function isListTask(t){ return !/^h100\|/.test(t.sourceKey||"") && (t.kind==="リスト作成" || /^list\|/.test(t.sourceKey||"")); }
function listBox(t){
  if(!window.__GAS || !isListTask(t)) return "";
  const segs=(S.listEdit&&S.listEdit.id===t.id)?S.listEdit.segs:((t.listSegs&&t.listSegs.length)?t.listSegs:[{name:"",url:""}]);
  const ed=(S.listEdit&&S.listEdit.id===t.id)?S.listEdit:null;
  const th=(ed&&ed.thread!=null?ed.thread:"") || t.reportThread || (S.threads||{})[clientKey(t.client)] || "";
  const req=member(t.requester);
  const busy=S.listBusy===t.id;
  S.threadLook=S.threadLook||{};
  const ck=clientKey(t.client);
  if(!th && ck && !S.threadLook[ck]){ S.threadLook[ck]="loading"; S.mcp.callTool("Board","find_thread",{client:t.client}).then(r=>{ const u=r&&r.payload&&r.payload.url; S.threadLook[ck]=u?"found":"none"; if(u){ S.threads=S.threads||{}; S.threads[ck]=u; if(S.openId===t.id && !(($("#lrThread")||{}).value)) { const el=$("#lrThread"); if(el) el.value=u; } } if(S.openId===t.id) refreshDrawer(); }).catch(()=>{ S.threadLook[ck]="none"; if(S.openId===t.id) refreshDrawer(); }); }
  return '<div class="field lr-box"><span class="lab">リスト追加の報告'+(t.client?'（'+esc(t.client)+'）':'')+'</span>'+
    segs.map((x,i)=>'<div class="lr-row"><input type="text" id="lrName'+i+'" placeholder="セグメント名（例：S-0024-1 ドラEVER（ドライバー求人））" value="'+esc(x.name||"")+'"><input type="url" id="lrUrl'+i+'" placeholder="追加した行のリンク（スプシの行を右クリック →「この範囲へのリンクを取得」）" value="'+esc(x.url||"")+'">'+(segs.length>1?'<button class="x" type="button" data-act="lrDel" data-i="'+i+'" aria-label="この行を消す">×</button>':'')+'</div>').join("")+
    '<button class="btn small" type="button" data-act="lrAdd">＋ セグメントを追加</button>'+
    '<label class="lab" for="lrThread" style="margin-top:6px">報告先のSlackスレッド（企業のスレッドのリンク）</label><input type="url" id="lrThread" placeholder="スレッドの親メッセージで「リンクをコピー」したURL" value="'+esc(th)+'">'+
    (th&&!t.reportThread?'<div class="hint">この企業のスレッドを自動で入れています。違っていたら貼り替えてください。</div>':(S.threadLook&&S.threadLook[ck]==="loading"?'<div class="hint">この企業のスレッドを探しています…</div>':''))+
    '<div class="actions"><button class="btn" type="button" data-act="lrSave"'+(busy?' disabled':'')+'>セグメント名をシートに保存</button><button class="btn primary" type="button" data-act="lrPost"'+(busy?' disabled':'')+'>'+(busy?'送信中…':'スレッドで完了報告して完了にする')+'</button></div>'+
    '<div class="hint">「完了報告」を押すと、企業のスレッドで'+esc(req.full||"依頼者")+'さんにメンションして報告し、リスト依頼一覧のセグメント名とステータス（完了）を更新して、このタスクを完了にします。</div></div>';
}
function lrRead(){
  const segs=[]; for(let i=0;document.getElementById("lrName"+i);i++){ segs.push({name:$("#lrName"+i).value.trim(), url:$("#lrUrl"+i).value.trim()}); }
  return {segs, thread:($("#lrThread")?.value||"").trim()};
}
async function lrSubmit(post){
  const t=S.tasks.find(x=>x.id===S.openId); if(!t) return;
  const v=lrRead(); const segs=v.segs.filter(x=>x.name||x.url);
  if(post){
    if(!segs.length){ toast("セグメント名か行のリンクを入れてください"); return; }
    if(!/slack\.com\/archives\//.test(v.thread)){ toast("報告先のSlackスレッドのリンクを入れてください"); return; }
  }
  S.listEdit={id:t.id, segs:v.segs, thread:v.thread}; S.listBusy=t.id; refreshDrawer(true);
  try{
    const r=await S.mcp.callTool("Board","list_report",{id:t.id, segments:segs, thread:v.thread, post:!!post});
    const p=(r&&r.payload)||{};
    t.listSegs=segs; t.reportThread=v.thread;
    if(post){
      await S.db.doc("tasks/"+t.id).update({status:"done", doneAt:nowIso(), updatedAt:nowIso(), history:hist(t, "スレッドでリスト追加の完了を報告して完了")});
      toast(p.sheet==="not_found"?"報告して完了にしました（リスト依頼一覧の行は見つからず、シートは更新していません）":"スレッドで報告して完了にしました（シートも更新済み）",6000);
    } else toast(p.sheet==="not_found"?"リスト依頼一覧の行が見つかりませんでした":"セグメント名をシートに保存しました");
    S.listEdit=null;
  }catch(e){
    const m=String((e&&e.message)||"");
    toast(/not_in_channel|channel_not_found/.test(m)?"Slackに送れませんでした：通知用のSlackアプリがそのチャンネルに入っていません。チャンネルにアプリを追加してください。":/thread_url_invalid/.test(m)?"スレッドのリンクの形が違います":"うまくいきませんでした："+m,8000);
  }
  S.listBusy=null; refreshDrawer(true);
}


/* ============ 担当企業（案件管理マスターシートのメイン／サブディレクター） ============ */
S.clients=[];
async function loadClients(){
  if(!window.__GAS || !S.mcp) return;
  try{ const r=await S.mcp.callTool("Board","clients",{}); S.clients=((r&&r.payload)||{}).items||[]; if(S.view==="team") render(); }catch(e){}
}
function clientOf(raw){
  const v=String(raw||"").trim(); if(!v || !S.clients.length) return null;
  const sis=(v.match(/^(\d{4})/)||[])[1];
  if(sis){ const c=S.clients.find(x=>x.sis===sis); if(c) return c; }
  const k=clientKey(v); if(!k) return null;
  return S.clients.find(x=>clientKey(x.name)===k) || S.clients.find(x=>{ const ck=clientKey(x.name); return ck && ck.length>1 && (ck.includes(k)||k.includes(ck)); }) || null;
}
function clientDcText(c){ return c ? "担当："+(c.main||"未設定")+(c.sub?"（サブ："+c.sub+"）":"") : ""; }
function clientsOfMember(m){ const n=normName(m.name); return S.clients.filter(c=>c.main && normName(c.main)===n); }

/* ============ イベント ============ */
document.addEventListener("change", e=>{
  if(e.target && e.target.id==="fClient" && F){ readForm(); const c=clientOf(F.client); if(c){ if(/^\d{4}$/.test(F.client.trim())) F.client=c.label; const k=matchMember(c.main); if(k && !F.assignees.length && F.kind!=="リスト作成") F.assignees=[k]; } drawForm(); return; }
  if(e.target && e.target.id==="calDate" && e.target.value){ const v=e.target.value; if(S.cal.mode==="day") S.cal.day=v; else S.cal.start=mondayOf(v); render(); }
});
document.addEventListener("click", async e=>{
  const el=e.target.closest("[data-go],[data-act],[data-seg],[data-tile],[data-open],[data-person],[data-proj],[data-editproj],[data-st],[data-answer],[data-pick] button,[data-who],[data-import],[data-rdel],[data-scrim],[data-krseg],[data-krtask],[data-krev],[data-calm],[data-mention],[data-attdel]");
  if(!el) return;
  if(el.dataset.scrim && e.target===el){ if(el.dataset.scrim!=="who" || S.me) closeLayer(); return; }
  if(el.dataset.scrim) return;
  if(el.dataset.go){ go(el.dataset.go); return; }
  if(el.dataset.who){ setMe(el.dataset.who); return; }
  if(el.dataset.seg){ S[el.dataset.seg]=el.dataset.val; render(); return; }
  if(el.dataset.tile){
    const k=el.dataset.tile; S.view="tasks"; S.person=""; S.project=""; S.q="";
    if(k==="mine"){ S.scope="mine"; S.group="status"; }
    if(k==="check"){ S.scope="asked"; S.group="status"; }
    if(k==="decide"){ S.scope="mine"; S.q="判断を仰ぐ"; }
    if(k==="drafts"){ S.scope="all"; S.group="status"; }
    if(k==="overdue"){ S.scope="all"; S.person=S.me; S.group="due"; }
    render(); return;
  }
  if(el.dataset.person){ S.view="tasks"; S.scope="all"; S.person=el.dataset.person; S.project=""; S.group="status"; renderSide(); render(); return; }
  if(el.dataset.editproj){ e.stopPropagation(); openProject(proj(el.dataset.editproj)); return; }
  if(el.dataset.proj){ S.view="tasks"; S.scope="all"; S.project=el.dataset.proj; S.person=""; renderSide(); render(); return; }
  if(el.dataset.open){ openTask(el.dataset.open); return; }
  if(el.dataset.import){ el.disabled=true; await importForm(el.dataset.import); render(); return; }
  if(el.dataset.mention){ insertMention(el.dataset.mention, el.dataset.replace==="1"); return; }
  if(el.dataset.krseg){ S.kr.seg=el.dataset.krseg; render(); return; }
  if(el.dataset.krev){ S.kr.sel=el.dataset.krev; render(); window.scrollTo(0,0); return; }
  if(el.dataset.krtask){ el.disabled=true; await krToTask(el.dataset.krtask); return; }
  if(el.dataset.calm){ const ks=calMembers().slice(); const k=el.dataset.calm; S.cal.sel=ks.includes(k)?ks.filter(x=>x!==k):[...ks,k]; render(); return; }
  if(el.dataset.rdel){ readRoster(); R.splice(+el.dataset.rdel,1); drawRoster(); return; }
  if(el.parentElement && el.parentElement.dataset && el.parentElement.dataset.pick){
    const kind=el.parentElement.dataset.pick, v=el.dataset.v;
    if(kind==="pcolor"){ P.name=$("#pName").value; P.desc=$("#pDesc").value; P.owner=$("#pOwner").value; P.color=v; openProject({...P, id:P.id}); $("#pName").value=P.name; return; }
    readForm();
    if(kind==="assignees"){ F.assignees=F.assignees.includes(v)?F.assignees.filter(x=>x!==v):[...F.assignees,v]; }
    else if(kind==="due"){ F.due=v; }
    else F[kind]=v;
    if(kind==="kind" && v==="リスト作成" && !F.id) F.assignees=[LIST_OWNER];
    drawForm(); return;
  }
  const t=S.openId?S.tasks.find(x=>x.id===S.openId):null;
  if(el.dataset.attdel!==undefined && t){ const i=+el.dataset.attdel, a=(t.attachments||[])[i]; if(!a) return; const next=(t.attachments||[]).filter((_,j)=>j!==i); await updateTask(t,{attachments:next},"添付を外す："+(a.name||a.url)); toast("外しました（ドライブのファイルは残っています）"); return; }
  if(el.dataset.st && t){ el.disabled=true; await setStatus(t, el.dataset.st); return; }
  if(el.dataset.answer && t){
    el.disabled=true;
    await updateTask(t, {answer:el.dataset.answer, status:"review"}, "回答：「"+el.dataset.answer+"」", [t.requester], "【CSタスク】"+nm(S.me)+"さんから回答が届きました：「"+el.dataset.answer+"」");
    return;
  }
  switch(el.dataset.act){
    case "new": if(!S.me){ openWhoModal(); return; } openForm(null); break;
    case "close": closeLayer(); break;
    case "who": openWhoModal(); break;
    case "roster": openRoster(); break;
    case "rosterAdd": readRoster(); R.push({key:"", name:"", full:"", role:"メンバー", slack:""}); drawRoster(); break;
    case "migrateGas": migrateToGas(); break;
    case "reloadMail": loadMail(true); break;
    case "mailTask": el.disabled=true; await mailToTask(el.dataset.mid); break;
    case "rosterSave": saveRoster(); break;
    case "saveTask": saveTask(); break;
    case "attLink": if(t){ el.disabled=true; await attachLink(t, ($("#attUrl")||{}).value); } break;
    case "claim": if(t){ el.disabled=true; if(await claimTask(t, S.me, "")) toast("担当になりました"); } break;
    case "splitEach": if(t){ el.disabled=true; await splitEach(t); } break;
    case "edit": if(t){ const tt=t; closeLayer(); openForm(tt); } break;
    case "delete": if(t){ const tt=t; confirmBox("「"+tt.title+"」を削除しますか？元に戻せません。","削除する", async()=>{ try{ S.deleted=S.deleted||{ids:new Set(),keys:new Set()}; S.deleted.ids.add(tt.id); if(tt.sourceKey) S.deleted.keys.add(tt.sourceKey); await S.db.doc("tasks/"+tt.id).delete(); closeLayer(); toast("削除しました（自動で入り直すことはありません）"); }catch(err){ writeFail(err); } }); } break;
    case "later": if(t){ const nd=nextBizDay(t.due); await updateTask(t,{due:nd},"期限を"+fmtDate(nd)+"に変更"); } break;
    case "cmEdit": S.cmEdit=el.dataset.cid; refreshDrawer(true); { const ta=$("#cmEdit-"+el.dataset.cid); if(ta){ ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } } break;
    case "cmCancel": S.cmEdit=null; refreshDrawer(true); break;
    case "cmSave": if(t){
      const cid=el.dataset.cid, c=S.comments.find(x=>x.id===cid); if(!c || c.by!==S.me) return;
      const text=(($("#cmEdit-"+cid)||{}).value||"").trim(); if(!text){ toast("空にはできません"); return; }
      if(text===c.text){ S.cmEdit=null; refreshDrawer(true); return; }
      el.disabled=true;
      const mentions=mentionsIn(text), added=mentions.filter(k=>!(c.mentions||[]).includes(k));
      try{
        await S.db.doc("tasks/"+t.id+"/comments/"+cid).update({text, mentions, editedAt:nowIso()});
        c.text=text; c.mentions=mentions; c.editedAt=nowIso();
        S.cmEdit=null; refreshDrawer(true); toast("コメントを直しました");
        if(added.length) notify(added, "【CSタスク】"+nm(S.me)+"さんがあなたをメンションしました\n>"+text.slice(0,300).replace(/\n/g,"\n>")+"\n**"+t.title+"**"+linkLine(t.id));
      }catch(err){ writeFail(err); el.disabled=false; }
    } break;
    case "comment": if(t){
      const text=($("#cmText").value||"").trim(); if(!text) return;
      el.disabled=true;
      const mentions=mentionsIn(text);
      const quote=">"+text.slice(0,300).replace(/\n/g,"\n>");
      const others=$("#cmNotify")?.checked?[t.requester,...(t.assignees||[])].filter(k=>!mentions.includes(k)):[];
      try{
        await S.db.collection("tasks/"+t.id+"/comments").add({by:S.me, text, at:nowIso(), mentions});
        $("#cmText").value="";
        if(mentions.length) await notify(mentions, "【CSタスク】"+nm(S.me)+"さんがあなたをメンションしました\n"+quote+"\n**"+t.title+"**"+linkLine(t.id));
        if(others.length) notify(others, "【CSタスク】"+nm(S.me)+"さんがコメントしました\n"+quote+"\n**"+t.title+"**"+linkLine(t.id));
      }catch(err){ writeFail(err); }
      el.disabled=false;
    } break;
    case "copyLink": if(t){ const url=PAGE_URL.startsWith("http")?PAGE_URL+"#t-"+t.id:"#t-"+t.id; try{ await navigator.clipboard.writeText(url); toast("リンクをコピーしました"); }catch(err){ toast(url,6000); } } break;
    case "newProject": openProject(null); break;
    case "saveProject": saveProject(false); break;
    case "archiveProject": confirmBox("このプロジェクトをアーカイブしますか？（タスクは残ります）","アーカイブ", ()=>saveProject(true)); break;
    case "reloadForms": loadForms(true); break;
    case "reloadKr": loadKouryu(true); break;
    case "design": openDesign(); break;
    case "lrAdd": { const v=lrRead(); v.segs.push({name:"",url:""}); S.listEdit={id:S.openId, segs:v.segs, thread:v.thread}; refreshDrawer(true); break; }
    case "lrDel": { const v=lrRead(); v.segs.splice(+el.dataset.i,1); S.listEdit={id:S.openId, segs:v.segs, thread:v.thread}; refreshDrawer(true); break; }
    case "lrSave": lrSubmit(false); break;
    case "lrPost": lrSubmit(true); break;
    case "aiAsk": if(S.openId) aiAsk(S.openId, el.dataset.force==="1"); break;
    case "dz": setDesign(el.dataset.k, el.dataset.v); break;
    case "dzReset": try{ LS&&LS.removeItem("cs.design.v2"); }catch(_){} applyDesign(); openDesign(); break;
    case "calPrev": if(S.cal.mode==="day") S.cal.day=addDaysTo(S.cal.day,-1); else S.cal.start=addDaysTo(S.cal.start,-7); render(); break;
    case "calNext": if(S.cal.mode==="day") S.cal.day=addDaysTo(S.cal.day,1); else S.cal.start=addDaysTo(S.cal.start,7); render(); break;
    case "calToday": S.cal.day=todayStr(); S.cal.start=mondayOf(todayStr()); render(); break;
    case "calMode": S.cal.mode=el.dataset.v; if(S.cal.mode==="week") S.cal.start=mondayOf(S.cal.day); else if(S.cal.day<S.cal.start||S.cal.day>addDaysTo(S.cal.start,6)) S.cal.day=S.cal.start; try{LS&&LS.setItem("cs.calMode",S.cal.mode);}catch(_){} render(); break;
    case "calWho": S.cal.who=el.dataset.v; try{LS&&LS.setItem("cs.calWho",S.cal.who);}catch(_){} render(); break;
    case "calDay": S.cal.day=el.dataset.v; S.cal.mode="day"; try{LS&&LS.setItem("cs.calMode","day");}catch(_){} render(); break;
    case "calReload": S.cal.loadedKey=""; loadCalendar(true); break;
  }
});
document.addEventListener("keydown", e=>{
  if(e.key==="Escape" && $("#layer").innerHTML && (S.me)) closeLayer();
  if(e.key==="Enter"){ const el=e.target.closest("[data-open],[data-person],[data-proj]"); if(el && el===e.target){ el.click(); } }
});
document.addEventListener("change", e=>{
  if(e.target && e.target.id==="attFile"){ const t=S.openId&&S.tasks.find(x=>x.id===S.openId); if(t) attachFiles(t, e.target.files); }
});
document.addEventListener("dragover", e=>{ const z=e.target.closest&&e.target.closest("[data-drop]"); if(z){ e.preventDefault(); z.classList.add("over"); } });
document.addEventListener("dragleave", e=>{ const z=e.target.closest&&e.target.closest("[data-drop]"); if(z) z.classList.remove("over"); });
document.addEventListener("drop", e=>{ const z=e.target.closest&&e.target.closest("[data-drop]"); if(!z) return; e.preventDefault(); z.classList.remove("over"); if(!window.__GAS){ toast("この画面ではアップロードできません"); return; } const t=S.tasks.find(x=>x.id===z.dataset.drop); if(t && e.dataTransfer && e.dataTransfer.files.length) attachFiles(t, e.dataTransfer.files); });
document.addEventListener("input", e=>{
  if(e.target.id==="q"){ S.q=e.target.value; render(); }
  if(e.target.id==="cmText"){ showMentionSug(); }
  if(e.target.id==="krq"){ S.kr.q=e.target.value; render(); const q=$("#krq"); if(q){ q.focus(); q.setSelectionRange(q.value.length,q.value.length); } }
});
document.addEventListener("change", e=>{
  const id=e.target.id;
  if(id==="person"){ S.person=e.target.value; if(S.person) S.scope="all"; render(); }
  if(id==="projectSel"){ S.project=e.target.value; render(); }
  if(id==="group"){ S.group=e.target.value; render(); }
  if(id==="showDone"){ S.showDone=e.target.checked; render(); }
  if(id==="fDue" && F){ F.due=e.target.value; }
  if(id==="krSel"){ S.kr.sel=e.target.value; S.kr.q=""; render(); }
});
$("#menuBtn").addEventListener("click", ()=>$("#side").classList.toggle("open"));
boot();
