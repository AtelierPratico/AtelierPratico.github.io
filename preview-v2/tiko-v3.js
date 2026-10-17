(() => {
  const hero = document.getElementById('accueil');
  const stage = document.getElementById('stage');
  if (!hero || !stage) return;

  document.title = 'ClicIA — Un Clic intelligent';
  document.body.classList.add('clicia-official');

  if (!document.querySelector('link[href*="clicia-official-v1.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './clicia-official-v1.css?v=2';
    document.head.appendChild(link);
  }

  const nav = document.querySelector('.main-nav');
  if (nav) nav.innerHTML = `
    <a class="active" href="#accueil">Accueil</a>
    <a href="#hero-chat">Fonctionnalités</a>
    <a href="#boutique">Boutique</a>
    <a href="#communaute">Communauté</a>
    <a href="#journal">À propos</a>`;

  const actions = document.querySelector('.header-actions');
  if (actions) actions.innerHTML = `
    <button id="headerSearchBtn" type="button" aria-label="Rechercher"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg></button>
    <button id="accountBtn" type="button" aria-label="Compte ClicIA"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 21c.7-5 3-7 7-7s6.3 2 7 7"/></svg></button>
    <button id="menuBtnOfficial" type="button" aria-label="Menu"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>`;

  const heroCopy = document.querySelector('.hero-copy-v9');
  if (heroCopy) heroCopy.innerHTML = `
    <h1 class="official-wordmark" aria-label="CLICIA">CLICIA</h1>
    <p class="official-slogan">Un Clic intelligent</p>`;

  const canvas = document.createElement('canvas');
  canvas.id = 'cliciaSpace';
  hero.prepend(canvas);
  const trail = document.createElement('div');
  trail.className = 'cosmic-trail';
  hero.appendChild(trail);

  stage.innerHTML = `
    <div class="portal-glow" aria-hidden="true"></div>
    <div class="portal-layer p3" aria-hidden="true"></div>
    <div class="portal-layer p1" aria-hidden="true"></div>
    <div class="portal-layer p2" aria-hidden="true"></div>
    <div class="character" id="tikoCharacter" aria-label="Clic, mascotte officielle de ClicIA">
      <img class="clicia-official-mascot" src="./assets/clicia-mascot.webp?v=2" alt="Clic, mascotte officielle de ClicIA" draggable="false">
    </div>`;

  const char = stage.querySelector('#tikoCharacter');
  const mascotStyle = document.createElement('style');
  mascotStyle.textContent = `
    #tikoCharacter{width:320px!important;height:320px!important;display:grid!important;place-items:center!important;}
    #tikoCharacter .clicia-official-mascot{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;user-select:none!important;-webkit-user-drag:none!important;filter:drop-shadow(0 0 12px rgba(67,225,255,.56)) drop-shadow(0 0 34px rgba(25,105,255,.34))!important;transform-origin:center!important;animation:clicMascotPulse 3.8s ease-in-out infinite!important;}
    @keyframes clicMascotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
    #stage.thinking .clicia-official-mascot{animation:clicMascotThink .72s ease-in-out infinite alternate!important;}
    @keyframes clicMascotThink{from{transform:translateY(0) rotate(-1deg) scale(1.01)}to{transform:translateY(-8px) rotate(1.5deg) scale(1.045)}}
    #stage.listening .clicia-official-mascot{filter:drop-shadow(0 0 18px rgba(100,245,255,.85)) drop-shadow(0 0 46px rgba(25,115,255,.48))!important;}
    @media(max-width:700px){#tikoCharacter{width:270px!important;height:270px!important;}}
  `;
  document.head.appendChild(mascotStyle);

  const featureStrip = document.querySelector('.feature-strip');
  if (featureStrip) featureStrip.innerHTML = `
    <a class="feature-card" href="#hero-chat"><span class="official-feature-icon"><svg viewBox="0 0 48 48"><path d="M10 11h28a6 6 0 0 1 6 6v13a6 6 0 0 1-6 6H24l-9 6 2-6h-7a6 6 0 0 1-6-6V17a6 6 0 0 1 6-6Z"/><circle cx="17" cy="24" r="2"/><circle cx="24" cy="24" r="2"/><circle cx="31" cy="24" r="2"/></svg></span><span class="official-feature-copy"><b>Assistant</b><small>Obtenez des réponses claires<br>et des idées puissantes.</small></span><strong>›</strong></a>
    <a class="feature-card" href="#boutique"><span class="official-feature-icon"><svg viewBox="0 0 48 48"><path d="M13 17h22l3 25H10l3-25Z"/><path d="M18 18v-3a6 6 0 0 1 12 0v3"/></svg></span><span class="official-feature-copy"><b>Boutique</b><small>Découvrez nos collections<br>et outils exclusifs.</small></span><strong>›</strong></a>
    <a class="feature-card" href="#communaute"><span class="official-feature-icon cyan"><svg viewBox="0 0 48 48"><circle cx="18" cy="18" r="6"/><circle cx="31" cy="19" r="5"/><path d="M7 39c1-8 5-12 12-12s11 4 12 12"/><path d="M27 29c8-1 13 3 14 10"/></svg></span><span class="official-feature-copy"><b>Communauté</b><small>Rejoignez la discussion<br>et partagez vos idées.</small></span><strong>›</strong></a>`;

  const paperclip = document.querySelector('.hero-composer .paperclip');
  if (paperclip) paperclip.innerHTML = `<svg viewBox="0 0 48 48"><path d="M10 12h28a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H24l-8 6 2-6h-8a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z"/><circle cx="17" cy="24" r="1.8"/><circle cx="24" cy="24" r="1.8"/><circle cx="31" cy="24" r="1.8"/></svg>`;

  const input = document.getElementById('chatInput');
  if (input) input.placeholder = 'Posez votre question ou recherchez...';
  const send = document.getElementById('sendBtn');
  if (send) send.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>`;

  const panel = document.getElementById('hero-chat');
  const form = document.getElementById('chatForm');
  if (form && panel) form.addEventListener('submit', () => {
    setTimeout(() => panel.classList.add('chat-open'), 80);
    stage.classList.add('thinking');
    setTimeout(() => stage.classList.remove('thinking'), 1500);
  });

  const messages = document.getElementById('messages');
  if (messages && panel) new MutationObserver(() => {
    if (messages.children.length > 2) panel.classList.add('chat-open');
  }).observe(messages,{childList:true,subtree:true});

  document.getElementById('headerSearchBtn')?.addEventListener('click', () => {
    panel?.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(() => input?.focus(), 400);
  });
  document.getElementById('menuBtnOfficial')?.addEventListener('click', () => nav?.classList.toggle('mobile-open'));

  let tx=0,ty=0,cx=0,cy=0;
  window.addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2},{passive:true});
  window.addEventListener('pointerleave',()=>{tx=0;ty=0});
  function parallax(){
    cx+=(tx-cx)*.07; cy+=(ty-cy)*.07;
    if(char){
      char.style.setProperty('--tx',`${cx*7}px`);
      char.style.setProperty('--ty',`${cy*5}px`);
      char.style.setProperty('--ry',`${cx*4}deg`);
      char.style.setProperty('--rx',`${-cy*2.5}deg`);
    }
    requestAnimationFrame(parallax);
  }
  parallax();
  input?.addEventListener('focus',()=>stage.classList.add('listening'));
  input?.addEventListener('blur',()=>stage.classList.remove('listening'));

  const ctx = canvas.getContext('2d');
  let stars=[],w=0,h=0,dpr=1,t=0;
  function resize(){
    dpr=Math.min(devicePixelRatio||1,2); w=hero.clientWidth; h=hero.clientHeight;
    canvas.width=w*dpr; canvas.height=h*dpr; canvas.style.width=w+'px'; canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count=Math.max(90,Math.min(210,Math.round(w*h/7200)));
    stars=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,r:.3+Math.random()*1.35,a:.18+Math.random()*.75,s:.002+Math.random()*.008,p:Math.random()*Math.PI*2}));
  }
  resize(); addEventListener('resize',resize,{passive:true});
  function draw(){
    t++; ctx.clearRect(0,0,w,h);
    for(const s of stars){
      const a=s.a*(.68+.32*Math.sin(t*s.s+s.p));
      ctx.beginPath(); ctx.arc(s.x+cx*s.r*3,s.y+cy*s.r*2,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(162,225,255,${Math.max(.05,a)})`; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();

  document.querySelectorAll('.content-section,.community-section,.journal-section,.guides-section').forEach(el=>el.classList.add('reveal-official'));
  const io = new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting&&e.target.classList.add('is-visible')),{threshold:.08});
  document.querySelectorAll('.reveal-official').forEach(el=>io.observe(el));

  window.TikoV2 = window.TikoV3 = {
    thinking(v){stage.classList.toggle('thinking',!!v)},
    listen(v){stage.classList.toggle('listening',!!v)},
    look(x=0,y=0){tx=Math.max(-1,Math.min(1,x/20));ty=Math.max(-1,Math.min(1,y/20))}
  };
})();
