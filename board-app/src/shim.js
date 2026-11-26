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
      if(server === 'Board' && tool === 'cs_pl') return call({op: 'csPL'}).then(function(r){ return {payload: r}; });
      if(server === 'Board' && tool === 'attach_init') return call({op: 'attachInit'}).then(function(r){ return {payload: r}; });
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
