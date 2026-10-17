(() => {
  const hero = document.getElementById('accueil');
  const stage = document.getElementById('stage');
  if (!hero || !stage) return;

  document.title = 'ClicIA — Un Clic intelligent';
  document.body.classList.add('clicia-official');

  const addCss = (href) => {
    if (document.querySelector(`link[href*="${href.split('?')[0]}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };
  addCss('./clicia-official-v1.css?v=2');
  addCss('./clicia-original-match-v1.css?v=1');

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

  let canvas = document.getElementById('cliciaSpace');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'cliciaSpace';
    hero.prepend(canvas);
  }
  if (!hero.querySelector('.cosmic-trail')) {
    const trail = document.createElement('div');
    trail.className = 'cosmic-trail';
    hero.appendChild(trail);
  }

  stage.innerHTML = `
    <div class="portal-glow" aria-hidden="true"></div>
    <div class="portal-layer p3" aria-hidden="true"></div>
    <div class="portal-layer p1" aria-hidden="true"></div>
    <div class="portal-layer p2" aria-hidden="true"></div>
    <div class="character" id="tikoCharacter" aria-label="Clic, mascotte officielle de ClicIA">
      <img class="clicia-official-mascot" src="./assets/clicia-mascot-exact.webp?v=1" alt="Clic, mascotte officielle de ClicIA" draggable="false">
    </div>`;

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
    setTimeout(() => panel.classList.add('chat-open'), 60);
    stage.classList.add('thinking');
    setTimeout(() => stage.classList.remove('thinking'), 1500);
  });

  const messages = document.getElementById('messages');
  if (messages && panel) {
    new MutationObserver(() => {
      if (messages.children.length > 2) panel.classList.add('chat-open');
    }).observe(messages, {childList:true, subtree:true});
  }

  document.getElementById('headerSearchBtn')?.addEventListener('click', () => {
    panel?.scrollIntoView({behavior:'smooth', block:'center'});
    setTimeout(() => input?.focus(), 350);
  });
  document.getElementById('menuBtnOfficial')?.addEventListener('click', () => nav?.classList.toggle('mobile-open'));

  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - .5) * 2;
    ty = (e.clientY / innerHeight - .5) * 2;
  }, {passive:true});
  window.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

  function parallax(){
    cx += (tx - cx) * .065;
    cy += (ty - cy) * .065;
    if (char) {
      char.style.setProperty('--tx', `${cx * 7}px`);
      char.style.setProperty('--ty', `${cy * 4}px`);
      char.style.setProperty('--ry', `${cx * 4.5}deg`);
      char.style.setProperty('--rx', `${-cy * 2.5}deg`);
    }
    requestAnimationFrame(parallax);
  }
  parallax();

  input?.addEventListener('focus', () => stage.classList.add('listening'));
  input?.addEventListener('blur', () => stage.classList.remove('listening'));

  const ctx = canvas.getContext('2d');
  let stars = [], w = 0, h = 0, dpr = 1, tick = 0;
  function resize(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.max(120, Math.min(250, Math.round(w * h / 6200)));
    stars = Array.from({length:count}, () => ({
      x:Math.random()*w,
      y:Math.random()*h,
      r:.25+Math.random()*1.35,
      a:.15+Math.random()*.78,
      s:.003+Math.random()*.01,
      p:Math.random()*Math.PI*2
    }));
  }
  resize();
  addEventListener('resize', resize, {passive:true});

  function draw(){
    tick++;
    ctx.clearRect(0,0,w,h);
    for (const s of stars){
      const a = s.a * (.68 + .32 * Math.sin(tick*s.s + s.p));
      ctx.beginPath();
      ctx.arc(s.x + cx*s.r*2.4, s.y + cy*s.r*1.6, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(167,226,255,${Math.max(.04,a)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();

  document.querySelectorAll('.content-section,.community-section,.journal-section,.guides-section').forEach(el => el.classList.add('reveal-official'));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('is-visible');
  }), {threshold:.08});
  document.querySelectorAll('.reveal-official').forEach(el => io.observe(el));

  window.TikoV2 = window.TikoV3 = {
    thinking(v){ stage.classList.toggle('thinking', !!v); },
    listen(v){ stage.classList.toggle('listening', !!v); },
    look(x=0,y=0){ tx = Math.max(-1,Math.min(1,x/20)); ty = Math.max(-1,Math.min(1,y/20)); }
  };
})();
