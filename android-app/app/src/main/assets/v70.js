(() => {
  const $ = s => document.querySelector(s);

  function updateConversationState(){
    const hasMessages = !!document.querySelector('#messages .message');
    document.body.classList.toggle('p7-has-messages', hasMessages);
  }

  function installScrollButton(){
    if(document.querySelector('#p7ScrollBottom')) return;
    const area = $('#chatArea') || $('.chat-area');
    const wrap = $('.composer-wrap');
    if(!area || !wrap) return;

    const btn = document.createElement('button');
    btn.id = 'p7ScrollBottom';
    btn.type = 'button';
    btn.setAttribute('aria-label','Aller au dernier message');
    btn.textContent = '↓';
    Object.assign(btn.style,{
      position:'fixed',
      right:'18px',
      bottom:'112px',
      width:'38px',
      height:'38px',
      borderRadius:'50%',
      border:'1px solid rgba(255,255,255,.10)',
      background:'#1a1f25',
      color:'#e8e9e7',
      fontSize:'18px',
      zIndex:'7',
      opacity:'0',
      pointerEvents:'none',
      transform:'translateY(8px) scale(.96)',
      transition:'opacity .16s ease, transform .16s ease',
      boxShadow:'0 8px 24px rgba(0,0,0,.28)'
    });
    document.body.appendChild(btn);

    const sync = () => {
      const remaining = area.scrollHeight - area.scrollTop - area.clientHeight;
      const show = remaining > 220;
      btn.style.opacity = show ? '1' : '0';
      btn.style.pointerEvents = show ? 'auto' : 'none';
      btn.style.transform = show ? 'translateY(0) scale(1)' : 'translateY(8px) scale(.96)';
    };
    btn.addEventListener('click',()=>area.scrollTo({top:area.scrollHeight,behavior:'smooth'}));
    area.addEventListener('scroll',sync,{passive:true});
    new MutationObserver(()=>requestAnimationFrame(sync)).observe(area,{childList:true,subtree:true,characterData:true});
    sync();
  }

  function keyboardPolish(){
    const input = $('#input');
    const area = $('#chatArea') || $('.chat-area');
    if(!input || !area) return;
    const settle = () => setTimeout(()=>area.scrollTo({top:area.scrollHeight,behavior:'smooth'}),120);
    input.addEventListener('focus',()=>{document.body.classList.add('p7-keyboard');settle();});
    input.addEventListener('blur',()=>document.body.classList.remove('p7-keyboard'));
    if(window.visualViewport){
      let last = window.visualViewport.height;
      window.visualViewport.addEventListener('resize',()=>{
        const now = window.visualViewport.height;
        document.body.classList.toggle('p7-keyboard',now < window.innerHeight * .82);
        if(Math.abs(now-last)>80 && document.activeElement===input) settle();
        last=now;
      });
    }
  }

  function polishCopy(){
    const input = $('#input');
    if(input) input.placeholder = 'Message Tiko…';
    const h1 = $('.welcome-copy h1');
    if(h1) h1.innerHTML = 'Bonjour, je suis <span>Tiko</span>.';
    const p = $('.welcome-copy p');
    if(p) p.textContent = 'Demande-moi ce que tu veux. Je peux réfléchir avec toi, créer, expliquer et t’aider à passer à l’action.';
  }

  function addThinkingState(){
    const root = $('#app') || document.body;
    new MutationObserver(()=>{
      document.body.classList.toggle('p7-thinking',!!document.querySelector('.typing-cursor'));
      updateConversationState();
    }).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  function init(){
    polishCopy();
    updateConversationState();
    installScrollButton();
    keyboardPolish();
    addThinkingState();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
