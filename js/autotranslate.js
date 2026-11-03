/* ============================================================
   Dalal Desk — site-wide auto-translate (Google engine, client-side)
   - Floating premium language widget, works on every page
   - Curated translations (window.DD_CURATED handlers) take priority
   - Auto languages: on-the-fly Google translation with localStorage cache
   - Text nodes only: preserves inline formatting; skips SVG/charts/inputs
   ============================================================ */
(function(){
  if (window.ddAT) return;

  const AUTO_LANGS = [
    ['ta','தமிழ்'],['te','తెలుగు'],['bn','বাংলা'],['mr','मराठी'],['gu','ગુજરાતી'],
    ['kn','ಕನ್ನಡ'],['ml','മലയാളം'],['pa','ਪੰਜਾਬੀ'],['ur','اردو'],['or','ଓଡ଼ିଆ'],
    ['as','অসমীয়া'],['ne','नेपाली'],['si','සිංහල'],['ar','العربية'],['es','Español']
  ];
  const SKIP_TAGS = new Set(['SCRIPT','STYLE','NOSCRIPT','SVG','CODE','PRE','TEXTAREA','INPUT','SELECT','IFRAME','META','LINK']);
  const WIDGET_XMLNS_OK = true;

  let NODES = [];           // [{node, orig}]
  let current = localStorage.getItem('dd_at_lang') || 'en';
  let busy = false;

  /* ---------- target collection ---------- */
  function collect(){
    NODES = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n){
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest('.dd-at-ui, .no-at, [contenteditable="true"]')) return NodeFilter.FILTER_REJECT;
        const t = n.nodeValue;
        if (!t || t.trim().length < 2) return NodeFilter.FILTER_REJECT;
        if (!/[A-Za-z]/.test(t)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()){
      const n = walker.currentNode;
      NODES.push({node:n, orig:n.nodeValue});
    }
  }

  /* ---------- Google engine ---------- */
  function jsonp(url){
    return new Promise((resolve,reject)=>{
      const cb='ddATcb'+Date.now();
      window[cb]=data=>{resolve(data);};
      const s=document.createElement('script');
      s.src=url+'&callback='+cb;
      s.onerror=()=>{delete window[cb];reject(new Error('network'));};
      document.head.appendChild(s);
      setTimeout(()=>{ if(window[cb]){delete window[cb]; s.remove();} },15000);
    });
  }
  async function gtBatch(texts, tl){
    const qs = texts.map(t=>encodeURIComponent(t)).join('&q=');
    const base = `https://translate.googleapis.com/translate_a/t?client=gtx&sl=en&tl=${tl}&q=${qs}`;
    let data=null;
    try{
      const r = await fetch(base, {signal:AbortSignal.timeout?AbortSignal.timeout(12000):undefined});
      if (r.ok){ data = await r.json(); }
    }catch(e){ /* fall through to JSONP */ }
    if (data===null){
      try{ data = await jsonp(base); }catch(e){ throw new Error('offline'); }
    }
    // translate_a/t returns: ["t1","t2",...] or [[t1],[t2]...] or nested segments
    let out;
    if (Array.isArray(data) && typeof data[0]==='string') out=data;
    else if (Array.isArray(data) && Array.isArray(data[0]) && typeof data[0][0]==='string') out=data.map(d=>d[0]);
    else if (Array.isArray(data) && Array.isArray(data[0]) && Array.isArray(data[0][0])) out=data[0].map(d=>d[0]);
    else throw new Error('shape');
    if (out.length !== texts.length) throw new Error('align');
    return out;
  }
  const cacheKey = l => 'dd_at_cache_'+l;
  function cacheGet(l){ try{ return JSON.parse(localStorage.getItem(cacheKey(l))||'{}'); }catch(e){ return {}; } }
  function cacheSave(l,o){ try{ localStorage.setItem(cacheKey(l), JSON.stringify(o)); }catch(e){} }

  /* ---------- widget UI ---------- */
  const ui = document.createElement('div');
  ui.className='dd-at-ui';
  ui.innerHTML = `
    <style>
      .dd-at-ui *{box-sizing:border-box;margin:0;padding:0}
      .dd-at-fab{position:fixed;right:20px;bottom:20px;z-index:9998;width:52px;height:52px;border-radius:50%;
        background:#101b16;color:#fff;border:none;cursor:pointer;font-size:21px;
        box-shadow:0 8px 28px rgba(16,27,22,.35);transition:transform .15s, background .15s;
        font-family:Manrope,'Segoe UI',sans-serif}
      .dd-at-fab:hover{transform:translateY(-2px);background:#0a7c42}
      .dd-at-fab.busy{background:#8a5a00}
      .dd-at-panel{position:fixed;right:20px;bottom:82px;z-index:9999;width:250px;max-height:60vh;overflow:auto;
        background:#fff;border:1px solid #e7eae4;border-radius:16px;padding:10px;display:none;
        box-shadow:0 18px 50px rgba(16,27,22,.22);font-family:Manrope,'Segoe UI',sans-serif}
      .dd-at-panel.open{display:block}
      .dd-at-panel h5{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a958e;padding:6px 10px 8px}
      .dd-at-item{display:flex;align-items:center;gap:9px;width:100%;text-align:left;border:none;background:none;
        padding:9px 10px;border-radius:10px;font-size:14.5px;font-weight:600;color:#101b16;cursor:pointer;font-family:inherit}
      .dd-at-item:hover{background:#f6f7f4}
      .dd-at-item.on{background:#e8f4ec;color:#0a7c42}
      .dd-at-item small{margin-left:auto;font-size:10px;font-weight:700;color:#0a7c42;letter-spacing:.5px}
      .dd-at-note{font-size:10.5px;color:#8a958e;padding:8px 10px 4px;line-height:1.5}
      .dd-at-status{font-size:11px;color:#8a5a00;padding:6px 10px;display:none}
    </style>
    <button class="dd-at-fab" title="Translate this page" aria-label="Translate this page">🌐</button>
    <div class="dd-at-panel">
      <h5>Choose language</h5>
      <div class="dd-at-list"></div>
      <div class="dd-at-note">Auto languages translate instantly via Google — quality is good but not perfect. ✦ = human-checked translation.</div>
      <div class="dd-at-status"></div>
    </div>`;
  document.body.appendChild(ui);
  const fab = ui.querySelector('.dd-at-fab');
  const panel = ui.querySelector('.dd-at-panel');
  const list = ui.querySelector('.dd-at-list');
  const status = ui.querySelector('.dd-at-status');
  fab.addEventListener('click',()=>panel.classList.toggle('open'));

  function curated(){ return window.DD_CURATED || {}; }

  function renderList(){
    list.innerHTML='';
    const mk=(code,label,tag)=>{
      const b=document.createElement('button');
      b.className='dd-at-item'+(current===code?' on':'');
      b.innerHTML=`<span>${label}</span>${tag?'<small>'+tag+'</small>':''}`;
      b.addEventListener('click',()=>{ panel.classList.remove('open'); ddAT.setLang(code); });
      list.appendChild(b);
    };
    mk('en','English','original');
    const cur=curated();
    Object.keys(cur).forEach(code=>mk(code, cur[code].label, '✦'));
    AUTO_LANGS.forEach(([code,label])=>{ if(!cur[code]) mk(code,label,''); });
  }

  /* ---------- apply engine ---------- */
  async function autoApply(l){
    const cache = cacheGet(l);
    const pending = NODES.filter(n=>!cache[n.orig.trim()]);
    if (pending.length){
      busy=true; fab.classList.add('busy'); panel.classList.add('open');
      // batch
      const batches=[]; let cur=[];
      for (const n of pending){ cur.push(n); if(cur.length>=10){batches.push(cur);cur=[];} }
      if (cur.length) batches.push(cur);
      let done=0, failed=0;
      for (const b of batches){
        status.style.display='block';
        status.textContent = `Translating… ${Math.round(done/ (batches.length) *100)}%`;
        try{
          const texts = b.map(x=>x.orig.trim());
          const out = await gtBatch(texts, l);
          b.forEach((x,i)=>{ cache[x.orig.trim()] = out[i]; x.node.nodeValue = x.orig.replace(x.orig.trim(), out[i]); });
          cacheSave(l,cache);
        }catch(e){ failed += b.length; }
        done++;
        await new Promise(r=>setTimeout(r,60));
      }
      busy=false; fab.classList.remove('busy');
      if (failed) status.textContent = `Some parts could not be translated (network). Showing English there.`;
      setTimeout(()=>{status.style.display='none';},4000);
    }
    // apply cached to ALL nodes
    NODES.forEach(x=>{
      const t = cache[x.orig.trim()];
      if (t) x.node.nodeValue = x.orig.replace(x.orig.trim(), t);
    });
  }
  function restoreEn(){
    NODES.forEach(x=>{ x.node.nodeValue = x.orig; });
  }

  const ddAT = {
    async setLang(l){
      if (busy) return;
      current = l; localStorage.setItem('dd_at_lang', l);
      const cur = curated();
      if (cur[l] && typeof cur[l].apply==='function'){ cur[l].apply(); renderList(); return; }
      if (l==='en'){ restoreEn(); renderList(); return; }
      collect();          // recollect in case DOM changed
      await autoApply(l); // auto for everything else
      renderList();
    },
    refresh(){ collect(); }
  };
  window.ddAT = ddAT;

  /* ---------- boot ---------- */
  function boot(){
    // curated hook for pages with a human translation dictionary
    if (typeof window.setArticleLang === 'function'){
      window.DD_CURATED = window.DD_CURATED || {};
      window.DD_CURATED['hi'] = {label:'हिन्दी', apply:()=>window.setArticleLang('hi')};
    }
    collect();
    renderList();
    if (current!=='en'){
      const cur=curated();
      if (cur[current] && cur[current].apply){ cur[current].apply(); renderList(); }
      else { ddAT.setLang(current); }
    }
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
