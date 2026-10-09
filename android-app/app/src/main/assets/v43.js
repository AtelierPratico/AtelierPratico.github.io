(() => {
  const hero=document.querySelector('#tikoHero');
  const messages=document.querySelector('#messages');

  function react(el,cls='p43-react',ms=720){
    if(!el)return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(()=>el.classList.remove(cls),ms);
  }
  if(hero){
    hero.addEventListener('click',()=>react(hero));
    setInterval(()=>{
      if(document.hidden)return;
      if(!hero.classList.contains('thinking') && Math.random()>.45) react(hero,'p43-react',680);
    },6200);
  }

  function updateRow(row){
    if(!row?.classList?.contains('assistant'))return;
    const bubble=row.querySelector('.bubble');
    if(!bubble)return;
    const text=(bubble.textContent||'').trim();
    const hasDots=!!bubble.querySelector('.typing-dots') || bubble.classList.contains('thinking-bubble');
    const isStreaming=bubble.classList.contains('typing-cursor') || bubble.classList.contains('streaming-live');
    row.classList.toggle('p43-thinking',hasDots || (!text && isStreaming));
    row.classList.toggle('p43-speaking',!!text && isStreaming);
  }

  function inspect(root){
    if(root?.matches?.('.message.assistant'))updateRow(root);
    root?.querySelectorAll?.('.message.assistant').forEach(updateRow);
  }
  inspect(document);
  if(messages){
    new MutationObserver(ms=>{
      ms.forEach(m=>{
        if(m.type==='childList')m.addedNodes.forEach(n=>{if(n.nodeType===1)inspect(n)});
        const row=m.target?.closest?.('.message.assistant'); if(row)updateRow(row);
      });
    }).observe(messages,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
  }

  /* Make every current/future Tiko avatar visually frameless even if an older layer adds decoration. */
  function stripFrame(root=document){
    root.querySelectorAll?.('.assistant-avatar').forEach(av=>{
      av.style.background='transparent';av.style.border='0';av.style.boxShadow='none';av.style.borderRadius='0';
      const img=av.querySelector('img'); if(img){img.style.background='transparent';img.style.border='0';img.style.boxShadow='none';img.style.borderRadius='0';}
    });
  }
  stripFrame();
  if(messages)new MutationObserver(()=>stripFrame(messages)).observe(messages,{childList:true,subtree:true});

  /* Tiny, unboxed quota everywhere. */
  function tidyQuota(el){
    if(!el)return; const t=el.textContent||''; const m=t.match(/(\d+)\s*\/\s*(\d+)/);
    if(m)el.textContent=`${m[1]} images restantes`;
  }
  const q=document.querySelector('#imageQuota'); if(q){tidyQuota(q);new MutationObserver(()=>tidyQuota(q)).observe(q,{subtree:true,childList:true,characterData:true});}
  document.querySelectorAll('.image-quota').forEach(el=>{
    const n=(el.textContent||'').match(/(\d+)/)?.[1]; if(n)el.textContent=`${n} images restantes`;
  });

  window.PratikoV43={react:()=>react(hero)};
})();
