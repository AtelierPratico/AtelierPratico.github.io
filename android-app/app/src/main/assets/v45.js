(() => {
  const hero=document.querySelector('#tikoHero');
  const messages=document.querySelector('#messages');

  function pulse(el,cls,ms=820){
    if(!el)return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(()=>el.classList.remove(cls),ms);
  }

  function cleanFrames(root=document){
    root.querySelectorAll?.('.welcome-card,.mascot-stage,.assistant-avatar,.assistant-avatar img,.tiko-hero').forEach(el=>{
      el.style.background='transparent';
      el.style.backgroundColor='transparent';
      el.style.border='0';
      el.style.outline='0';
      el.style.boxShadow='none';
    });
  }

  function syncRow(row){
    if(!row?.classList?.contains('assistant'))return;
    const bubble=row.querySelector('.bubble');
    if(!bubble)return;
    const text=(bubble.textContent||'').trim();
    const thinking=!!bubble.querySelector('.typing-dots')||bubble.classList.contains('thinking-bubble');
    const streaming=bubble.classList.contains('streaming-live')||bubble.classList.contains('typing-cursor');
    row.classList.toggle('p45-thinking',thinking||(!text&&streaming));
    row.classList.toggle('p45-speaking',!!text&&streaming);
  }

  function activate(row){
    if(!row?.classList?.contains('assistant'))return;
    cleanFrames(row);
    syncRow(row);
    pulse(row,'p45-celebrate',840);
  }

  if(hero){
    hero.addEventListener('click',()=>pulse(hero,'p44-wave',850));
    setInterval(()=>{
      if(document.hidden)return;
      if(Math.random()>.56)pulse(hero,'p44-wave',850);
    },6900);
  }

  cleanFrames();
  document.querySelectorAll('.message.assistant').forEach(syncRow);

  if(messages){
    new MutationObserver(ms=>{
      for(const m of ms){
        if(m.type==='childList'){
          m.addedNodes.forEach(n=>{
            if(n.nodeType!==1)return;
            if(n.matches?.('.message.assistant'))activate(n);
            n.querySelectorAll?.('.message.assistant').forEach(activate);
          });
        }
        const row=m.target?.closest?.('.message.assistant');
        if(row)syncRow(row);
      }
      cleanFrames(messages);
    }).observe(messages,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});

    setInterval(()=>{
      if(document.hidden)return;
      const rows=[...messages.querySelectorAll('.message.assistant')];
      const row=rows.at(-1);
      if(!row||row.classList.contains('p45-thinking')||row.classList.contains('p45-speaking'))return;
      if(Math.random()>.50)pulse(row,'p45-peek',960);
    },5700);
  }

  /* Enter is always a line break. Sending stays on the gold arrow. */
  const input=document.querySelector('#input');
  const form=document.querySelector('#composer');
  if(input&&form){
    input.setAttribute('enterkeyhint','enter');
    input.addEventListener('keydown',e=>{
      if(e.key!=='Enter'||e.isComposing)return;
      if(e.ctrlKey||e.metaKey){e.preventDefault();e.stopImmediatePropagation();form.requestSubmit();}
      else e.stopImmediatePropagation();
    },true);
  }

  window.PratikoV45={
    celebrate(){const rows=[...document.querySelectorAll('.message.assistant')];pulse(rows.at(-1),'p45-celebrate',840);},
    cleanFrames
  };
})();
