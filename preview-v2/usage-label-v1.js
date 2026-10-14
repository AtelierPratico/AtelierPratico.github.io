(()=>{
  const clean=()=>{
    const el=document.getElementById('usageState');
    if(!el)return;
    if(el.textContent.trim()==='Texte illimité · Sans compte')el.textContent='';
  };
  const init=()=>{
    const el=document.getElementById('usageState');
    if(!el)return;
    clean();
    new MutationObserver(clean).observe(el,{childList:true,characterData:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
