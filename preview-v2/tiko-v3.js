(() => {
  const stage = document.getElementById('stage');
  const character = document.getElementById('tikoCharacter');
  const hero = document.getElementById('accueil');
  if (!stage || !character || !hero) return;

  document.title = 'ClicIA — Un Clic intelligent';
  document.body.classList.add('clicia-premium-2026');

  const heroCopy = document.querySelector('.hero-copy-v9');
  if (heroCopy) {
    heroCopy.innerHTML = `
      <h1 class="premium-wordmark" aria-label="CLICIA"><span>CLIC</span><em>IA</em></h1>
      <p class="premium-slogan">Un Clic intelligent</p>
    `;
  }

  const nav = document.querySelector('.main-nav');
  if (nav) {
    nav.innerHTML = `
      <a class="active" href="#accueil">Accueil</a>
      <a href="#hero-chat">Fonctionnalités</a>
      <a href="#boutique">Boutique</a>
      <a href="#communaute">Communauté</a>
      <a href="#journal">À propos</a>
    `;
  }

  const featureStrip = document.querySelector('.feature-strip');
  if (featureStrip) {
    featureStrip.innerHTML = `
      <a class="feature-card premium-feature assistant-feature" href="#hero-chat">
        <span class="feature-icon premium-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M10 11h28a6 6 0 0 1 6 6v13a6 6 0 0 1-6 6H24l-9 6 2-6h-7a6 6 0 0 1-6-6V17a6 6 0 0 1 6-6Z"/><circle cx="17" cy="24" r="2.3"/><circle cx="24" cy="24" r="2.3"/><circle cx="31" cy="24" r="2.3"/></svg></span>
        <span class="feature-copy"><b>Assistant</b><small>Obtenez des réponses claires<br>et des idées utiles.</small></span><strong>›</strong>
      </a>
      <a class="feature-card premium-feature shop-feature" href="#boutique">
        <span class="feature-icon premium-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M13 17h22l3 25H10l3-25Z"/><path d="M18 18v-3a6 6 0 0 1 12 0v3"/></svg></span>
        <span class="feature-copy"><b>Boutique</b><small>Découvrez nos collections,<br>outils et eBooks exclusifs.</small></span><strong>›</strong>
      </a>
      <a class="feature-card premium-feature community-feature" href="#communaute">
        <span class="feature-icon premium-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="18" cy="18" r="6"/><circle cx="31" cy="19" r="5"/><path d="M7 39c1-8 5-12 12-12s11 4 12 12"/><path d="M27 29c8-1 13 3 14 10"/></svg></span>
        <span class="feature-copy"><b>Communauté</b><small>Rejoignez la discussion<br>et partagez vos idées.</small></span><strong>›</strong>
      </a>
    `;
  }

  const mascotSVG = `
    <svg class="clic-mascot-svg" viewBox="0 0 520 520" role="img" aria-label="Clic, mascotte de ClicIA">
      <defs>
        <linearGradient id="cursorBody" x1=".18" y1=".08" x2=".82" y2=".94">
          <stop offset="0" stop-color="#d8fbff"/><stop offset=".13" stop-color="#57efff"/><stop offset=".48" stop-color="#079dff"/><stop offset=".78" stop-color="#1857ff"/><stop offset="1" stop-color="#1733a8"/>
        </linearGradient>
        <linearGradient id="cursorEdge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".38" stop-color="#76f4ff"/><stop offset="1" stop-color="#2d77ff"/></linearGradient>
        <radialGradient id="cursorShine" cx=".28" cy=".16" r=".72"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".24" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <filter id="cursorGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.68 0 0 0 0 1 0 0 0 1 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>
      <g class="mascot-shadow" opacity=".9"><ellipse cx="258" cy="430" rx="130" ry="18" fill="#18c9ff" filter="url(#softGlow)"/></g>
      <g class="cursor-character" filter="url(#cursorGlow)">
        <path class="cursor-body" d="M128 82c-12-7-27 4-24 18l67 304c4 18 28 23 39 8l58-83 97 96c10 10 26 10 36 0l30-30c10-10 10-26 0-36l-96-96 83-58c15-11 10-35-8-39L128 82Z" fill="url(#cursorBody)" stroke="url(#cursorEdge)" stroke-width="8" stroke-linejoin="round"/>
        <path class="cursor-highlight" d="M127 104l56 254 54-77 17-24 25-17 75-52-227-84Z" fill="url(#cursorShine)" opacity=".72"/>
        <g class="mascot-eyes">
          <ellipse class="eye eye-l" cx="211" cy="229" rx="17" ry="30" fill="#dffcff"/>
          <ellipse class="eye eye-r" cx="272" cy="241" rx="17" ry="30" fill="#dffcff"/>
          <ellipse class="pupil" id="pupilL" cx="213" cy="235" rx="7" ry="13" fill="#063381"/>
          <ellipse class="pupil" id="pupilR" cx="274" cy="247" rx="7" ry="13" fill="#063381"/>
          <ellipse class="eye-glint" id="glintL" cx="210" cy="230" rx="2.8" ry="4" fill="#fff"/>
          <ellipse class="eye-glint" id="glintR" cx="271" cy="242" rx="2.8" ry="4" fill="#fff"/>
        </g>
        <g class="click-rays">
          <rect x="326" y="61" width="27" height="73" rx="14" transform="rotate(8 326 61)" fill="url(#cursorBody)" stroke="#77f5ff" stroke-width="5"/>
          <rect x="377" y="97" width="27" height="66" rx="14" transform="rotate(43 377 97)" fill="url(#cursorBody)" stroke="#77f5ff" stroke-width="5"/>
          <rect x="402" y="157" width="27" height="62" rx="14" transform="rotate(76 402 157)" fill="url(#cursorBody)" stroke="#77f5ff" stroke-width="5"/>
        </g>
      </g>
    </svg>`;
  character.innerHTML = mascotSVG;

  const oldRing = stage.querySelector('.character-ring');
  if (oldRing) oldRing.innerHTML = '<span class="orbit orbit-a"></span><span class="orbit orbit-b"></span><span class="orbit orbit-c"></span><i class="orbit-dot dot-a"></i><i class="orbit-dot dot-b"></i><i class="orbit-dot dot-c"></i>';

  const canvas = document.createElement('canvas');
  canvas.id = 'cliciaCosmos';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  let stars = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), pointerX = .5, pointerY = .5;

  function resizeCosmos() {
    const r = hero.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.min(210, Math.max(90, Math.round(w * h / 9000)));
    stars = Array.from({length: count}, (_, i) => ({
      x: Math.random()*w, y: Math.random()*h, z: .25+Math.random()*.95,
      r: .35+Math.random()*1.45, a: .18+Math.random()*.72,
      s: .08+Math.random()*.28, p: Math.random()*Math.PI*2
    }));
  }

  let start = performance.now();
  function drawCosmos(now) {
    const t = (now-start)/1000;
    ctx.clearRect(0,0,w,h);
    const cx = w*.5 + (pointerX-.5)*42, cy = h*.47 + (pointerY-.5)*28;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w,h)*.48);
    glow.addColorStop(0,'rgba(22,164,255,.16)'); glow.addColorStop(.35,'rgba(30,81,255,.07)'); glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0,0,w,h);
    for (const st of stars) {
      const twinkle = .45+.55*Math.sin(t*(.7+st.s)+st.p);
      const px = st.x + (pointerX-.5)*(st.z*16), py = st.y + (pointerY-.5)*(st.z*10);
      ctx.beginPath(); ctx.arc(px, py, st.r*(.75+twinkle*.35), 0, Math.PI*2);
      ctx.fillStyle = `rgba(${st.z>.72?125:78},${st.z>.72?226:167},255,${st.a*(.45+twinkle*.55)})`; ctx.fill();
    }
    requestAnimationFrame(drawCosmos);
  }
  resizeCosmos(); requestAnimationFrame(drawCosmos);
  addEventListener('resize', resizeCosmos, {passive:true});

  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    pointerX = Math.max(0, Math.min(1, (e.clientX-r.left)/r.width));
    pointerY = Math.max(0, Math.min(1, (e.clientY-r.top)/r.height));
    hero.style.setProperty('--px', ((pointerX-.5)*2).toFixed(3));
    hero.style.setProperty('--py', ((pointerY-.5)*2).toFixed(3));
  }, {passive:true});

  const pL = document.getElementById('pupilL'), pR = document.getElementById('pupilR');
  const gL = document.getElementById('glintL'), gR = document.getElementById('glintR');
  let tx = 0, ty = 0, cxEye = 0, cyEye = 0, pointerActive = false;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const look = (x,y) => { tx = clamp(x,-8,8); ty = clamp(y,-10,10); };
  function renderEyes(){
    cxEye += (tx-cxEye)*.16; cyEye += (ty-cyEye)*.16;
    const tr = `translate(${cxEye}px,${cyEye}px)`;
    [pL,pR].forEach(el => el && (el.style.transform = tr));
    [gL,gR].forEach(el => el && (el.style.transform = `translate(${cxEye*.55}px,${cyEye*.55}px)`));
    requestAnimationFrame(renderEyes);
  }
  renderEyes();

  function blink(){
    character.classList.add('blink');
    setTimeout(()=>character.classList.remove('blink'),180);
    setTimeout(blink, 2200 + Math.random()*3600);
  }
  setTimeout(blink, 1600);

  stage.addEventListener('pointerenter',()=>pointerActive=true);
  stage.addEventListener('pointermove', e => {
    const r=stage.getBoundingClientRect(), nx=(e.clientX-r.left)/r.width-.5, ny=(e.clientY-r.top)/r.height-.5;
    character.style.setProperty('--ry', nx*9+'deg');
    character.style.setProperty('--rx', -ny*7+'deg');
    character.style.setProperty('--mx', nx*10+'px');
    character.style.setProperty('--my', ny*8+'px');
    look(nx*16, ny*18);
  });
  stage.addEventListener('pointerleave',()=>{
    pointerActive=false; ['--ry','--rx','--mx','--my'].forEach(p=>character.style.removeProperty(p)); look(0,0);
  });
  document.addEventListener('pointermove', e => {
    if(pointerActive) return;
    const r=stage.getBoundingClientRect(), sx=r.left+r.width/2, sy=r.top+r.height*.48;
    look((e.clientX-sx)/innerWidth*14,(e.clientY-sy)/innerHeight*16);
  }, {passive:true});

  const chat = document.getElementById('hero-chat');
  const messages = document.getElementById('messages');
  const chatInput = document.getElementById('chatInput');
  if (chat) {
    const close = document.createElement('button');
    close.type='button'; close.className='premium-chat-close'; close.setAttribute('aria-label','Fermer la conversation'); close.textContent='×';
    chat.appendChild(close);
    close.addEventListener('click',()=>chat.classList.remove('chat-expanded'));
  }
  if (chatInput && chat) {
    chatInput.placeholder='Posez votre question ou recherchez...';
    chatInput.addEventListener('focus',()=>character.classList.add('listening'));
    chatInput.addEventListener('blur',()=>character.classList.remove('listening'));
  }
  if (messages && chat) {
    let initial = messages.children.length;
    new MutationObserver(()=>{
      if(messages.children.length>initial){ chat.classList.add('chat-expanded'); }
    }).observe(messages,{childList:true,subtree:false});
  }
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && chat) chat.classList.remove('chat-expanded'); });

  document.querySelectorAll('.premium-feature').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r=card.getBoundingClientRect();
      card.style.setProperty('--hx', ((e.clientX-r.left)/r.width*100)+'%');
      card.style.setProperty('--hy', ((e.clientY-r.top)/r.height*100)+'%');
    });
  });

  const revealTargets = document.querySelectorAll('.content-section,.community-section,.info-grid,.site-footer');
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){ entry.target.classList.add('premium-visible'); io.unobserve(entry.target); }
  }),{threshold:.08});
  revealTargets.forEach(el=>{el.classList.add('premium-reveal');io.observe(el)});

  function setThinking(v){
    character.classList.toggle('thinking',!!v);
    stage.classList.toggle('thinking',!!v);
    if(v) look(0,-7); else look(0,0);
  }
  function setListening(v){ character.classList.toggle('listening',!!v); if(v) look(0,5); }
  window.TikoV2 = { thinking:setThinking, look, listen:setListening };
  window.TikoV3 = window.TikoV2;
})();