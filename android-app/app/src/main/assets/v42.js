(() => {
  const PREMIUM = 'tiko-premium-general.svg';
  const labels = {
    default:['✦','Tiko'], artist:['🎨','Tiko artiste'], plumber:['🔧','Tiko plombier'],
    chef:['🍳','Tiko chef'], tech:['💻','Tiko techno'], teacher:['📚','Tiko prof'],
    builder:['🛠️','Tiko bricoleur'], coach:['🧭','Tiko coach']
  };
  let mode='default';

  const oldHero=document.querySelector('#tikoHero');
  let hero=oldHero;
  if(oldHero){
    const clone=oldHero.cloneNode(true);
    oldHero.replaceWith(clone);
    hero=clone;
    hero.src=PREMIUM;
    hero.removeAttribute('data-v4-skinned');
  }

  const stage=document.querySelector('.mascot-stage');
  const context=document.createElement('div');
  context.className='p42-context';
  if(stage) stage.appendChild(context);

  function classify(text=''){
    try{return window.PratikoV4?.classify?.(text)||'default';}catch{return'default';}
  }
  function updateContext(){
    const [emoji,label]=labels[mode]||labels.default;
    context.innerHTML=`<span>${emoji}</span>${label}`;
    document.documentElement.dataset.tikoMode=mode;
  }
  function animateHero(cls='p42-switch'){
    if(!hero)return;
    hero.classList.remove(cls); void hero.offsetWidth; hero.classList.add(cls);
    setTimeout(()=>hero.classList.remove(cls),680);
  }
  function setMode(next='default'){
    mode=labels[next]?next:'default';
    if(hero){hero.src=PREMIUM;hero.dataset.premiumTiko='1';}
    updateContext(); animateHero(); skinAll();
  }
  function skin(img){
    if(!img)return;
    img.src=PREMIUM;
    img.dataset.premium42='1';
    img.removeAttribute('data-v4-skinned');
  }
  function skinAll(root=document){
    root.querySelectorAll?.('.assistant-avatar img,.brand-switch img,.brand-avatar,.voice-orb img').forEach(skin);
  }

  skinAll(); updateContext();

  const form=document.querySelector('#composer');
  const input=document.querySelector('#input');
  if(form&&input){
    input.setAttribute('enterkeyhint','enter');
    input.setAttribute('aria-label','Message à Tiko. Entrée crée une nouvelle ligne.');
    input.addEventListener('keydown',e=>{
      if(e.key!=='Enter'||e.isComposing)return;
      if(e.ctrlKey||e.metaKey){e.preventDefault();e.stopImmediatePropagation();form.requestSubmit();}
      else e.stopImmediatePropagation();
    },true);
    form.addEventListener('submit',()=>{if(input.value.trim())setMode(classify(input.value));},true);
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-prompt]');
    if(b)setMode(classify(b.dataset.prompt||''));
  },true);

  if(hero)hero.addEventListener('click',()=>animateHero('p42-tap'));

  const messages=document.querySelector('#messages');
  if(messages){
    new MutationObserver(ms=>{
      for(const m of ms)for(const n of m.addedNodes){
        if(n.nodeType===1){
          if(n.matches?.('.assistant-avatar img'))skin(n);
          n.querySelectorAll?.('.assistant-avatar img').forEach(skin);
        }
      }
    }).observe(messages,{childList:true,subtree:true});
  }

  document.querySelector('#planBadge')?.remove();
  document.querySelectorAll('.suggestions small').forEach(el=>{
    if(/Free/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/\s*en Free/i,'');
  });

  const q=document.querySelector('#imageQuota');
  if(q){
    const tidy=()=>{
      const m=(q.textContent||'').match(/(\d+)\/(\d+)/);
      if(m)q.textContent=`${m[1]} images restantes`;
    };
    tidy();
    new MutationObserver(tidy).observe(q,{childList:true,subtree:true,characterData:true});
  }

  window.PratikoV42={setMode,get mode(){return mode;}};
})();