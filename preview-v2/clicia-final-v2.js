(() => {
  const stage = document.querySelector('.portal-wrap');
  const mascot = document.querySelector('.mascot');
  const nav = document.querySelector('.main-nav');
  const menuBtn = document.getElementById('menuBtnOfficial');
  const input = document.getElementById('chatInput');
  const form = document.getElementById('chatForm');
  const panel = document.getElementById('hero-chat');
  const messages = document.getElementById('messages');

  menuBtn?.addEventListener('click', () => nav?.classList.toggle('open'));
  document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => nav?.classList.remove('open')));

  document.getElementById('headerSearchBtn')?.addEventListener('click', () => {
    panel?.scrollIntoView({behavior:'smooth', block:'center'});
    setTimeout(() => input?.focus(), 350);
  });

  let tx=0,ty=0,cx=0,cy=0;
  addEventListener('pointermove', e => {
    tx = (e.clientX/innerWidth - .5)*2;
    ty = (e.clientY/innerHeight - .5)*2;
  }, {passive:true});
  addEventListener('pointerleave', () => {tx=0;ty=0});
  function animate(){
    cx += (tx-cx)*.055;
    cy += (ty-cy)*.055;
    if(mascot){
      mascot.style.transform = `translate3d(${cx*8}px,${cy*5}px,0) rotateX(${-cy*2.5}deg) rotateY(${cx*4}deg)`;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  input?.addEventListener('focus', () => stage?.classList.add('listening'));
  input?.addEventListener('blur', () => stage?.classList.remove('listening'));

  form?.addEventListener('submit', () => {
    stage?.classList.add('thinking');
    setTimeout(() => stage?.classList.remove('thinking'), 1500);
    setTimeout(() => panel?.classList.add('chat-open'), 80);
  });
  if(messages && panel){
    new MutationObserver(() => {
      if(messages.children.length > 2) panel.classList.add('chat-open');
    }).observe(messages,{childList:true,subtree:true});
  }

  window.TikoV2 = window.TikoV3 = {
    thinking(v){stage?.classList.toggle('thinking',!!v)},
    listen(v){stage?.classList.toggle('listening',!!v)},
    look(x=0,y=0){tx=Math.max(-1,Math.min(1,x/20));ty=Math.max(-1,Math.min(1,y/20))}
  };

  document.querySelector('.mascot img')?.addEventListener('error', e => {
    e.currentTarget.src = './assets/clicia-mascot.webp?v=final-fallback-1';
  }, {once:true});
})();
