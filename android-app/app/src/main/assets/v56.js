(() => {
  'use strict';

  const MACHINE = 'Tiko Machine';
  const MODE = { idle:0, thinking:1, talking:2, happy:3 };
  const instances = new Map();
  let scheduled = false;
  let lastDetectedState = 'idle';
  let happyTimer = null;

  function decodeRiv(){
    const b64 = window.TIKO_RIV_BASE64 || '';
    if(!b64) return null;
    try{
      const raw = atob(b64);
      const bytes = new Uint8Array(raw.length);
      for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
      return bytes;
    }catch(e){ console.warn('Tiko Rive decode failed', e); return null; }
  }

  const sourceBytes = decodeRiv();

  function stateFromUi(){
    const cursor = document.querySelector('.message.assistant .typing-cursor');
    if(cursor) return (cursor.textContent || '').trim() ? 'talking' : 'thinking';
    const voiceState = (document.querySelector('#voiceState')?.textContent || '').toUpperCase();
    if(voiceState.includes('TIKO RÉPOND')) return 'talking';
    const voiceTitle = (document.querySelector('#voiceTitle')?.textContent || '').toLowerCase();
    if(voiceTitle.includes('prépare') || voiceTitle.includes('reflech') || voiceTitle.includes('réfléch')) return 'thinking';
    return 'idle';
  }

  function rectInsideHost(img, host){
    const hr = host.getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    return { left:ir.left-hr.left, top:ir.top-hr.top, width:ir.width, height:ir.height };
  }

  function sizeCanvas(record){
    if(!record?.img?.isConnected || !record?.canvas?.isConnected) return;
    const {img,host,canvas,riveInstance}=record;
    const r=rectInsideHost(img,host);
    if(r.width < 2 || r.height < 2) return;
    const left=r.left+'px', top=r.top+'px', width=r.width+'px', height=r.height+'px';
    if(canvas.style.left!==left) canvas.style.left=left;
    if(canvas.style.top!==top) canvas.style.top=top;
    if(canvas.style.width!==width) canvas.style.width=width;
    if(canvas.style.height!==height) canvas.style.height=height;
    const dpr=Math.min(window.devicePixelRatio || 1, 2.5);
    const w=Math.max(2,Math.round(r.width*dpr));
    const h=Math.max(2,Math.round(r.height*dpr));
    if(canvas.width!==w) canvas.width=w;
    if(canvas.height!==h) canvas.height=h;
    try{ riveInstance?.resizeDrawingSurfaceToCanvas?.(); }catch(_){ }
  }

  function setMode(record,state){
    if(!record || !record.ready || !record.modeInput) return;
    const value = MODE[state] ?? MODE.idle;
    if(record.lastMode===value) return;
    record.lastMode=value;
    try{ record.modeInput.value=value; }catch(e){ console.warn('Tiko mode change failed',e); }
  }

  function cleanupRecord(record, showFallback=true){
    if(!record) return;
    try{ record.ro?.disconnect?.(); }catch(_){ }
    try{ record.riveInstance?.cleanup?.(); }catch(_){ }
    try{ record.canvas?.remove?.(); }catch(_){ }
    if(showFallback && record.img){
      record.img.style.removeProperty('opacity');
      record.img.style.removeProperty('animation');
    }
    instances.delete(record.img);
  }

  function mount(img){
    if(!img || instances.has(img) || !sourceBytes || !window.rive?.Rive) return null;
    const host=img.parentElement;
    if(!host) return null;
    host.classList.add('tiko-rive-host');

    const canvas=document.createElement('canvas');
    canvas.className='tiko-rive-canvas';
    canvas.setAttribute('aria-hidden','true');
    host.appendChild(canvas);

    const record={img,host,canvas,riveInstance:null,modeInput:null,ready:false,lastMode:null,ro:null};
    instances.set(img,record);
    sizeCanvas(record);

    try{
      const buffer = sourceBytes.buffer.slice(sourceBytes.byteOffset, sourceBytes.byteOffset + sourceBytes.byteLength);
      const r = new window.rive.Rive({
        buffer,
        canvas,
        autoplay:true,
        stateMachines:MACHINE,
        layout:new window.rive.Layout({fit:window.rive.Fit.Contain,alignment:window.rive.Alignment.Center}),
        onLoad:()=>{
          record.ready=true;
          try{
            const inputs=r.stateMachineInputs(MACHINE) || [];
            record.modeInput=inputs.find(i=>i.name==='mode') || null;
          }catch(_){ record.modeInput=null; }
          canvas.classList.add('ready');
          img.style.setProperty('animation','none','important');
          img.style.setProperty('opacity','0','important');
          requestAnimationFrame(()=>sizeCanvas(record));
          setMode(record,stateFromUi());
        },
        onLoadError:(err)=>{
          console.warn('Tiko Rive load error',err);
          cleanupRecord(record,true);
        }
      });
      record.riveInstance=r;
      if('ResizeObserver' in window){
        record.ro=new ResizeObserver(()=>sizeCanvas(record));
        record.ro.observe(img);
        record.ro.observe(host);
      }
      return record;
    }catch(e){
      console.warn('Tiko Rive init failed',e);
      cleanupRecord(record,true);
      return null;
    }
  }

  function desiredImages(){
    const out=[];
    const empty=document.querySelector('#emptyState');
    const hero=document.querySelector('#tikoHero.tiko-original-hero');
    if(hero && empty && getComputedStyle(empty).display!=='none') out.push(hero);
    const rows=[...document.querySelectorAll('.message.assistant')];
    const latest=rows[rows.length-1];
    const chatImg=latest?.querySelector('.assistant-avatar img.tiko-original-chat, .assistant-avatar img[src="tiko-original.svg"]');
    if(chatImg) out.push(chatImg);
    return out;
  }

  function syncMounts(){
    if(!sourceBytes || !window.rive?.Rive) return;
    const wanted=new Set(desiredImages());
    wanted.forEach(img=>mount(img));
    [...instances.entries()].forEach(([img,record])=>{
      if(!img.isConnected || !wanted.has(img)) cleanupRecord(record,true);
    });
  }

  function applyState(state, allowHappy=true){
    if(allowHappy && lastDetectedState==='talking' && state==='idle'){
      clearTimeout(happyTimer);
      instances.forEach(r=>setMode(r,'happy'));
      happyTimer=setTimeout(()=>instances.forEach(r=>setMode(r,stateFromUi())),720);
    }else{
      instances.forEach(r=>setMode(r,state));
    }
    lastDetectedState=state;
  }

  function sync(){
    scheduled=false;
    syncMounts();
    applyState(stateFromUi(),true);
    instances.forEach(sizeCanvas);
  }

  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(sync);
  }

  function init(){
    if(!sourceBytes || !window.rive?.Rive){
      console.warn('Tiko Rive runtime unavailable; keeping static Tiko fallback.');
      return;
    }
    sync();
    const root=document.querySelector('#app')||document.body;
    // Deliberately ignore style/src mutations: the Rive canvas updates its own dimensions,
    // and observing those styles would create a self-triggering animation loop in WebView.
    new MutationObserver(schedule).observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',schedule,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden) schedule();});
  }

  window.TikoRive={
    setState(state){
      const normalized=MODE[state]===undefined?'idle':state;
      clearTimeout(happyTimer);
      instances.forEach(r=>setMode(r,normalized));
      lastDetectedState=normalized;
    },
    happy(ms=720){
      clearTimeout(happyTimer);
      instances.forEach(r=>setMode(r,'happy'));
      happyTimer=setTimeout(()=>instances.forEach(r=>setMode(r,stateFromUi())),ms);
    },
    refresh:schedule
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
