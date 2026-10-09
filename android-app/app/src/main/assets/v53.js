(() => {
  const ORIGINAL = 'tiko-original.svg';
  let quickSpeakTimer = null;

  const FEATURES = {
    eyeLeft:  {cx:.435, cy:.355, w:.115, h:.075, cls:'eye-patch eye-left'},
    eyeRight: {cx:.600, cy:.350, w:.115, h:.075, cls:'eye-patch eye-right'},
    browLeft: {cx:.430, cy:.305, w:.145, h:.055, cls:'brow-patch brow-left'},
    browRight:{cx:.600, cy:.300, w:.145, h:.055, cls:'brow-patch brow-right'},
    mouth:    {cx:.515, cy:.490, w:.250, h:.105, cls:'mouth-patch'}
  };

  function contentBox(img){
    const ew = img.clientWidth || img.offsetWidth || 1;
    const eh = img.clientHeight || img.offsetHeight || 1;
    const nw = img.naturalWidth || 166;
    const nh = img.naturalHeight || 270;
    const scale = Math.min(ew / nw, eh / nh);
    const w = nw * scale, h = nh * scale;
    return {ew,eh,w,h,x:(ew-w)/2,y:(eh-h)/2};
  }

  function patchFor(img, layer, f){
    const b = contentBox(img);
    const pw = Math.max(4, f.w * b.w);
    const ph = Math.max(3, f.h * b.h);
    const x = b.x + f.cx*b.w - pw/2;
    const y = b.y + f.cy*b.h - ph/2;

    const patch = document.createElement('div');
    patch.className = 'tiko-expression-patch ' + f.cls;
    Object.assign(patch.style,{left:x+'px',top:y+'px',width:pw+'px',height:ph+'px'});

    const clone = document.createElement('img');
    clone.src = ORIGINAL;
    clone.alt = '';
    clone.setAttribute('aria-hidden','true');
    Object.assign(clone.style,{left:(-x)+'px',top:(-y)+'px',width:b.ew+'px',height:b.eh+'px'});
    patch.appendChild(clone);
    layer.appendChild(patch);
  }

  function attach(img){
    if(!img || img.dataset.v53Face === '1') return;
    const host = img.parentElement;
    if(!host) return;
    host.classList.add('tiko-expression-host');
    img.dataset.v53Face = '1';

    const layer = document.createElement('div');
    layer.className = 'tiko-expression-layer';
    layer.setAttribute('aria-hidden','true');
    host.appendChild(layer);

    const place = () => {
      if(!img.isConnected || !layer.isConnected) return;
      const hr = host.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      Object.assign(layer.style,{
        left:(ir.left-hr.left)+'px',
        top:(ir.top-hr.top)+'px',
        width:ir.width+'px',
        height:ir.height+'px'
      });
      layer.innerHTML='';
      Object.values(FEATURES).forEach(f=>patchFor(img,layer,f));
    };

    if(img.complete) place(); else img.addEventListener('load',place,{once:true});
    requestAnimationFrame(place);
    setTimeout(place,120);
    if('ResizeObserver' in window){ const ro=new ResizeObserver(place); ro.observe(img); }
  }

  function allHosts(){
    return [...document.querySelectorAll('.tiko-expression-host')];
  }

  function setHostState(host,state){
    if(!host) return;
    host.classList.remove('tiko-idle','tiko-speaking','tiko-thinking');
    host.classList.add('tiko-'+state);
  }

  function latestAssistantHost(){
    const rows=[...document.querySelectorAll('.message.assistant')];
    const row=rows[rows.length-1];
    return row?.querySelector('.assistant-avatar.tiko-expression-host') || row?.querySelector('.assistant-avatar');
  }

  function currentState(){
    const cursor=document.querySelector('.message.assistant .typing-cursor');
    if(cursor){ return (cursor.textContent||'').trim() ? 'speaking' : 'thinking'; }
    const vs=(document.querySelector('#voiceState')?.textContent||'').toUpperCase();
    if(vs.includes('TIKO RÉPOND')) return 'speaking';
    const vt=(document.querySelector('#voiceTitle')?.textContent||'').toLowerCase();
    if(vt.includes('prépare')) return 'thinking';
    return 'idle';
  }

  function sync(){
    document.querySelectorAll('img.tiko-original-hero, .assistant-avatar img.tiko-original-chat').forEach(attach);
    const state=currentState();
    allHosts().forEach(h=>setHostState(h,'idle'));
    const active=latestAssistantHost();
    if(active) setHostState(active,state);
    const hero=document.querySelector('#tikoHero')?.parentElement;
    if(hero?.classList.contains('tiko-expression-host') && !document.querySelector('.message.assistant')) setHostState(hero,state);
  }

  function pulseQuickReply(){
    const cursor=document.querySelector('.typing-cursor');
    if(cursor) return;
    const host=latestAssistantHost();
    if(!host) return;
    setHostState(host,'speaking');
    clearTimeout(quickSpeakTimer);
    quickSpeakTimer=setTimeout(()=>setHostState(host,'idle'),900);
  }

  function init(){
    sync();
    const root=document.querySelector('#app')||document.body;
    let previousAssistantCount=document.querySelectorAll('.message.assistant').length;
    new MutationObserver((mutations)=>{
      const count=document.querySelectorAll('.message.assistant').length;
      const addedAssistant=count>previousAssistantCount;
      previousAssistantCount=count;
      sync();
      if(addedAssistant && !document.querySelector('.typing-cursor')) pulseQuickReply();
      if(mutations.some(m=>m.type==='characterData' || m.type==='childList')) requestAnimationFrame(sync);
    }).observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style','src']});

    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) setTimeout(sync,80); });
    window.addEventListener('resize',()=>setTimeout(sync,80));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
