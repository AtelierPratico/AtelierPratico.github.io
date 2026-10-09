(() => {
  const hero=document.querySelector('#tikoHero');
  const messages=document.querySelector('#messages');

  function pulse(el,cls,ms=760){
    if(!el)return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(()=>el.classList.remove(cls),ms);
  }

  if(hero){
    hero.addEventListener('click',()=>pulse(hero,'p44-wave',820));
    setInterval(()=>{
      if(document.hidden||hero.classList.contains('thinking'))return;
      if(Math.random()>.52)pulse(hero,'p44-wave',820);
    },7600);
  }

  function stateRow(row){
    if(!row?.classList?.contains('assistant'))return;
    const bubble=row.querySelector('.bubble');
    if(!bubble)return;
    const text=(bubble.textContent||'').trim();
    const typing=!!bubble.querySelector('.typing-dots')||bubble.classList.contains('thinking-bubble');
    const streaming=bubble.classList.contains('streaming-live')||bubble.classList.contains('typing-cursor');
    row.classList.toggle('p44-thinking',typing||(!text&&streaming));
    row.classList.toggle('p44-speaking',!!text&&streaming);
  }

  function activateRow(row){
    if(!row?.classList?.contains('assistant'))return;
    strip(row);
    stateRow(row);
    pulse(row,'p44-pop',780);
  }

  function strip(root=document){
    root.querySelectorAll?.('.assistant-avatar').forEach(av=>{
      Object.assign(av.style,{background:'transparent',border:'0',boxShadow:'none',borderRadius:'0',outline:'0'});
      const img=av.querySelector('img');
      if(img)Object.assign(img.style,{background:'transparent',border:'0',boxShadow:'none',borderRadius:'0',outline:'0'});
    });
  }

  strip();
  document.querySelectorAll('.message.assistant').forEach(stateRow);

  if(messages){
    new MutationObserver(ms=>{
      for(const m of ms){
        if(m.type==='childList'){
          m.addedNodes.forEach(n=>{
            if(n.nodeType!==1)return;
            if(n.matches?.('.message.assistant'))activateRow(n);
            n.querySelectorAll?.('.message.assistant').forEach(activateRow);
          });
        }
        const row=m.target?.closest?.('.message.assistant');
        if(row)stateRow(row);
      }
      strip(messages);
    }).observe(messages,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});

    setInterval(()=>{
      if(document.hidden)return;
      const rows=[...messages.querySelectorAll('.message.assistant')];
      const row=rows.at(-1);
      if(!row||row.classList.contains('p44-thinking')||row.classList.contains('p44-speaking'))return;
      if(Math.random()>.58)pulse(row,'p44-look',920);
    },6800);
  }

  window.PratikoV44={wave:()=>pulse(hero,'p44-wave',820)};
})();
