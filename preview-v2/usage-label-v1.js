(()=>{
  let syncing=false;
  const sync=()=>{
    const state=document.getElementById('usageState');
    const plus=document.getElementById('chatPremiumPlus');
    if(!state||!plus||syncing)return;
    const active=state.textContent.trim()==='ClicIA+ actif';
    plus.hidden=!active;
    plus.setAttribute('aria-hidden',active?'false':'true');
    if(state.textContent!==''){
      syncing=true;
      state.textContent='';
      queueMicrotask(()=>{syncing=false});
    }
  };
  const init=()=>{
    const state=document.getElementById('usageState');
    if(!state)return;
    sync();
    new MutationObserver(sync).observe(state,{childList:true,characterData:true,subtree:true});
    window.addEventListener('clicia-premium-change',()=>setTimeout(sync,0));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
