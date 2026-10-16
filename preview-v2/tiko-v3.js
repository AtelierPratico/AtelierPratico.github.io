(() => {
  const hero = document.getElementById('accueil');
  const stage = document.getElementById('stage');
  if (!hero || !stage) return;

  document.title = 'ClicIA — Un Clic intelligent';
  document.body.classList.add('clicia-official');

  if (!document.querySelector('link[href*="clicia-official-v1.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './clicia-official-v1.css?v=1';
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

  const mascotSVG = `
    <svg viewBox="0 0 520 520" role="img" aria-label="Clic, mascotte de ClicIA">
      <defs>
        <linearGradient id="cb" x1=".08" y1=".04" x2=".92" y2=".96">
          <stop offset="0" stop-color="#f4feff"/>
          <stop offset=".12" stop-color="#6ef6ff"/>
          <stop offset=".46" stop-color="#08b7ff"/>
          <stop offset=".76" stop-color="#1567ff"/>
          <stop offset="1" stop-color="#1431a5"/>
        </linearGradient>
        <linearGradient id="ce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#72f4ff"/><stop offset="1" stop-color="#2f76ff"/></linearGradient>
        <radialGradient id="cs" cx=".26" cy=".16" r=".72"><stop offset="0" stop-color="#fff" stop-opacity=".96"/><stop offset=".22" stop-color="#fff" stop-opacity=".26"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <filter id="cg" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 .05 0 0 0 0 .72 0 0 0 0 1 0 0 0 1 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="sg" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10"/></filter>
      </defs>
      <ellipse cx="255" cy="438" rx="125" ry="17" fill="#28ccff" opacity=".40" filter="url(#sg)"/>
      <g class="cursor-body" filter="url(#cg)">
        <path d="M112 78C94 66 73 82 78 103l73 309c5 22 34 29 48 11l61-81 101 96c12 11 31 11 42-1l30-31c11-12 10-31-2-42l-102-96 85-61c18-13 11-42-10-48L112 78Z" fill="url(#cb)" stroke="url(#ce)" stroke-width="7" stroke-linejoin="round"/>
        <path d="M112 78C94 66 73 82 78 103l73 309c5 22 34 29 48 11l61-81 101 96c12 11 31 11 42-1" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".46"/>
        <path d="M119 92c68 36 144 94 228 177-90-39-149-68-201-93-15-7-27-30-27-84Z" fill="url(#cs)" opacity=".82"/>
      </g>
      <g class="cursor-eyes" fill="#c9fbff" stroke="#fff" stroke-width="2">
        <rect x="186" y="276" width="31" height="58" rx="16"/>
        <rect x="265" y="276" width="31" height="58" rx="16"/>
      </g>
      <g class="cursor-rays" filter="url(#cg)" fill="url(#cb)" stroke="url(#ce)" stroke-width="4">
        <rect x="329" y="80" width="31" height="88" rx="16" transform="rotate(8 344 124)"/>
        <rect x="374" y="123" width="31" height="87" rx="16" transform="rotate(46 389 166)"/>
        <rect x="394" y="192" width="31" height="84" rx="16" transform="rotate(78 410 234)"/>
      </g>
    </svg>`;

  stage.innerHTML = `
    <div class="portal-glow" aria-hidden="true"></div>
    <div class="portal-layer p3" aria-hidden="true"></div>
    <div class="portal-layer p1" aria-hidden="true"></div>
    <div class="portal-layer p2" aria-hidden="true"></div>
    <div class="character" id="tikoCharacter" aria-label="Clic, mascotte de ClicIA">${mascotSVG}</div>`;
  const char = stage.querySelector('#tikoCharacter');

  const featureStrip = document.querySelector('.feature-strip');
  if (featureStrip) featureStrip.innerHTML = `
    <a class="feature-card" href="#hero-chat">
      <span class="official-feature-icon"><svg viewBox="0 0 48 48"><path d="M10 11h28a6 6 0 0 1 6 6v13a6 6 0 0 1-6 6H24l-9 6 2-6h-7a6 6 0 0 1-6-6V17a6 6 0 0 1 6-6Z"/><circle cx="17" cy="24" r="2"/><circle cx="24" cy="24" r="2"/><circle cx="31" cy="24" r="2"/></svg></span>
      <span class="official-feature-copy"><b>Assistant</b><small>Obtenez des réponses claires<br>et des idées puissantes.</small></span><strong>›</strong>
    </a>
    <a class="feature-card" href="#boutique">
      <span class="official-feature-icon"><svg viewBox="0 0 48 48"><path d="M13 17h22l3 25H10l3-25Z"/><path d="M18 18v-3a6 6 0 0 1 12 0v3"/></svg></span>
      <span class="official-feature-copy"><b>Boutique</b><small>Découvrez nos collections<br>et outils exclusifs.</small></span><strong>›</strong>
    </a>
    <a class="feature-card" href="#communaute">
      <span class="official-feature-icon cyan"><svg viewBox="0 0 48 48"><circle cx="18" cy="18" r="6"/><circle cx="31" cy="19" r="5"/><path d="M7 39c1-8 5-12 12-12s11 4 12 12"/><path d="M27 29c8-1 13 3 14 10"/></svg></span>
      <span class="official-feature-copy"><b>Communauté</b><small>Rejoignez la discussion<br>et partagez vos idées.</small></span><strong>›</strong>
    </a>`;

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
    cx+=(tx-cx)*.07;cy+=(ty-cy)*.07;
    if(char){char.style.setProperty('--tx',`${cx*8}px`);char.style.setProperty('--ty',`${cy*5}px`);char.style.setProperty('--ry',`${cx*5}deg`);char.style.setProperty('--rx',`${-cy*3}deg`)}
    requestAnimationFrame(parallax);
  }
  parallax();
  input?.addEventListener('focus',()=>stage.classList.add('listening'));
  input?.addEventListener('blur',()=>stage.classList.remove('listening'));

  const ctx = canvas.getContext('2d');
  let stars=[],w=0,h=0,dpr=1,t=0;
  function resize(){
    dpr=Math.min(devicePixelRatio||1,2);w=hero.clientWidth;h=hero.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
    const count=Math.max(90,Math.min(210,Math.round(w*h/7200)));
    stars=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,r:.3+Math.random()*1.35,a:.18+Math.random()*.75,s:.002+Math.random()*.008,p:Math.random()*Math.PI*2}));
  }
  resize();addEventListener('resize',resize,{passive:true});
  function draw(){
    t++;ctx.clearRect(0,0,w,h);
    for(const s of stars){const a=s.a*(.68+.32*Math.sin(t*s.s+s.p));ctx.beginPath();ctx.arc(s.x+cx*s.r*3,s.y+cy*s.r*2,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(162,225,255,${Math.max(.05,a)})`;ctx.fill()}
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
