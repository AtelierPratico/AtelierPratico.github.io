(() => {
  const style = document.createElement('style');
  style.textContent = `
    #accountBtn{font-size:0!important;position:relative!important;overflow:visible!important}
    #accountBtn::before{content:"";width:20px;height:20px;display:block;background:currentColor;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8' r='4' fill='none' stroke='black' stroke-width='1.8'/%3E%3Cpath d='M5 21c.7-5 3-7 7-7s6.3 2 7 7' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8' r='4' fill='none' stroke='black' stroke-width='1.8'/%3E%3Cpath d='M5 21c.7-5 3-7 7-7s6.3 2 7 7' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat}
    .portal-wrap.thinking .ring.r1{animation-duration:4s!important}.portal-wrap.thinking .ring.r2{animation-duration:3s!important}.portal-wrap.thinking .portal-glow{animation-duration:1s!important;opacity:1}.portal-wrap.listening .portal-glow{background:radial-gradient(circle,rgba(91,242,255,.34) 0 38%,rgba(31,115,255,.16) 50%,transparent 72%)!important}
  `;
  document.head.appendChild(style);

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
    e.currentTarget.src = './assets/clicia-mascot.webp?v=final-fallback-2';
  }, {once:true});
})();
