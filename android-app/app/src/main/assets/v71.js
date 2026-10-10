(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  let lastState = 'idle';
  let happyUntil = 0;

  function detectTikoState(){
    const cursor = document.querySelector('.message.assistant .typing-cursor');
    if(cursor) return (cursor.textContent || '').trim() ? 'talking' : 'thinking';
    const voiceState = ($('#voiceState')?.textContent || '').toUpperCase();
    if(voiceState.includes('TIKO RÉPOND')) return 'talking';
    const voiceTitle = ($('#voiceTitle')?.textContent || '').toLowerCase();
    if(voiceTitle.includes('prépare') || voiceTitle.includes('réfléch') || voiceTitle.includes('reflech')) return 'thinking';
    return 'idle';
  }

  function applyTikoState(){
    const now = Date.now();
    const state = detectTikoState();
    if(lastState === 'talking' && state === 'idle') happyUntil = now + 800;
    const visual = now < happyUntil ? 'happy' : state;
    document.querySelectorAll('.tiko-rive-host').forEach(host => {
      host.classList.remove('tiko71-idle','tiko71-thinking','tiko71-talking','tiko71-happy');
      host.classList.add('tiko71-' + visual);
    });
    lastState = state;
  }

  function polishComposer(){
    const input = $('#input');
    if(!input) return;
    input.placeholder = 'Demande quelque chose à Tiko…';
    const sync = () => document.body.classList.toggle('p71-input-has-text', !!input.value.trim());
    input.addEventListener('input', sync, {passive:true});
    input.addEventListener('focus', sync, {passive:true});
    sync();
  }

  function polishWelcome(){
    const h1 = $('.welcome-copy h1');
    if(h1) h1.innerHTML = 'Qu’est-ce qu’on fait <span>aujourd’hui?</span>';
    const p = $('.welcome-copy p');
    if(p) p.textContent = 'Je suis Tiko. Pose-moi une question, crée une image, organise une idée ou réfléchis avec moi.';
  }

  function scrollPolish(){
    const area = $('#chatArea') || $('.chat-area');
    if(!area) return;
    const sync = () => document.body.classList.toggle('p71-scrolled', area.scrollTop > 8);
    area.addEventListener('scroll', sync, {passive:true});
    sync();
  }

  function fixLegacyTikoSizing(){
    document.querySelectorAll('.message.assistant .assistant-avatar img').forEach(img => {
      img.style.removeProperty('width');
      img.style.removeProperty('height');
      img.style.removeProperty('margin-left');
      img.style.removeProperty('max-width');
      img.style.removeProperty('max-height');
    });
    window.TikoRive?.refresh?.();
  }

  function observe(){
    const root = $('#app') || document.body;
    let scheduled = false;
    const sync = () => {
      scheduled = false;
      applyTikoState();
      fixLegacyTikoSizing();
    };
    const schedule = () => {
      if(scheduled) return;
      scheduled = true;
      requestAnimationFrame(sync);
    };
    new MutationObserver(schedule).observe(root, {subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
    setInterval(applyTikoState, 120);
    schedule();
  }

  function init(){
    polishComposer();
    polishWelcome();
    scrollPolish();
    observe();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
