(() => {
  'use strict';

  let last='';
  let happyUntil=0;

  function detect(){
    const cursor=document.querySelector('.message.assistant .typing-cursor');
    if(cursor) return (cursor.textContent||'').trim() ? 'talking' : 'thinking';
    const vs=(document.querySelector('#voiceState')?.textContent||'').toUpperCase();
    if(vs.includes('TIKO RÉPOND')) return 'talking';
    const vt=(document.querySelector('#voiceTitle')?.textContent||'').toLowerCase();
    if(vt.includes('prépare')||vt.includes('reflech')||vt.includes('réfléch')) return 'thinking';
    return 'idle';
  }

  function hosts(){ return [...document.querySelectorAll('.tiko-rive-host')]; }

  function apply(state){
    const now=Date.now();
    if(last==='talking' && state==='idle') happyUntil=now+760;
    const visual=now<happyUntil ? 'happy' : state;
    hosts().forEach(h=>{
      h.classList.remove('tiko57-idle','tiko57-thinking','tiko57-talking','tiko57-happy');
      h.classList.add('tiko57-'+visual);
    });
    last=state;
  }

  function tick(){ apply(detect()); }

  function init(){
    tick();
    setInterval(tick,140);
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) tick(); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
