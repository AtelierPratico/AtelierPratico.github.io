(() => {
  const stage = document.querySelector('.portal-wrap');
  const mascot = document.querySelector('.mascot');
  const nav = document.querySelector('.main-nav');
  const menuBtn = document.getElementById('menuBtnOfficial');
  const input = document.getElementById('chatInput');
  const form = document.getElementById('chatForm');
  const panel = document.getElementById('hero-chat');
  const messages = document.getElementById('messages');

  const style = document.createElement('style');
  style.textContent = `
    .clicia-hero{background:#02091d!important}
    .clicia-hero::before{content:"";position:absolute;inset:70px -4% 70px;z-index:0;pointer-events:none;background:
      radial-gradient(ellipse at 15% 48%,rgba(113,248,255,.62) 0 3%,rgba(0,176,255,.34) 10%,rgba(31,92,255,.22) 22%,transparent 38%),
      radial-gradient(ellipse at 85% 48%,rgba(113,248,255,.62) 0 3%,rgba(0,176,255,.34) 10%,rgba(31,92,255,.22) 22%,transparent 38%),
      radial-gradient(ellipse at 24% 38%,rgba(14,108,255,.44),transparent 34%),
      radial-gradient(ellipse at 76% 38%,rgba(14,108,255,.44),transparent 34%),
      radial-gradient(circle at 50% 47%,rgba(18,94,255,.30),rgba(4,24,73,.12) 32%,transparent 55%),
      linear-gradient(180deg,#020b28 0%,#061942 54%,#02091d 100%);
      filter:saturate(145%);opacity:1}
    .clicia-hero::after{content:"";position:absolute;inset:90px 0 80px;z-index:1;pointer-events:none;background-image:
      radial-gradient(circle at 8% 18%,rgba(255,255,255,.95) 0 1px,transparent 1.8px),radial-gradient(circle at 18% 36%,rgba(99,226,255,.95) 0 1.3px,transparent 2px),radial-gradient(circle at 28% 21%,rgba(255,255,255,.9) 0 1px,transparent 1.7px),radial-gradient(circle at 38% 42%,rgba(98,223,255,.9) 0 1px,transparent 1.8px),radial-gradient(circle at 47% 17%,rgba(255,255,255,.95) 0 1px,transparent 1.8px),radial-gradient(circle at 57% 31%,rgba(91,229,255,.95) 0 1.2px,transparent 2px),radial-gradient(circle at 69% 15%,rgba(255,255,255,.92) 0 1px,transparent 1.7px),radial-gradient(circle at 79% 38%,rgba(84,215,255,.92) 0 1.2px,transparent 2px),radial-gradient(circle at 91% 19%,rgba(255,255,255,.95) 0 1px,transparent 1.8px);background-size:260px 220px,330px 280px,390px 260px,420px 330px,470px 290px,360px 310px,500px 340px,320px 360px,460px 300px;opacity:.78;animation:clicStars 16s ease-in-out infinite alternate}
    @keyframes clicStars{to{transform:translate3d(8px,-5px,0);opacity:1}}
    .nebula.left,.nebula.right{opacity:1!important;filter:blur(9px) saturate(180%)!important;mix-blend-mode:screen!important}
    .nebula.left{left:-205px!important;background:radial-gradient(ellipse at 63% 50%,rgba(111,249,255,.95) 0 2%,rgba(0,190,255,.62) 11%,rgba(37,87,255,.33) 23%,transparent 48%),radial-gradient(ellipse at 54% 34%,rgba(35,146,255,.52),transparent 38%)!important}
    .nebula.right{right:-205px!important;background:radial-gradient(ellipse at 37% 50%,rgba(111,249,255,.95) 0 2%,rgba(0,190,255,.62) 11%,rgba(37,87,255,.33) 23%,transparent 48%),radial-gradient(ellipse at 46% 34%,rgba(35,146,255,.52),transparent 38%)!important}
    .light-arc{border-top-color:rgba(96,238,255,.95)!important;filter:drop-shadow(0 0 12px rgba(63,221,255,.95))!important}
    .portal-wrap{top:222px!important;width:480px!important;height:402px!important}
    .portal-glow{width:372px!important;height:372px!important;background:radial-gradient(circle,rgba(91,242,255,.27) 0 34%,rgba(35,119,255,.18) 49%,transparent 73%)!important;filter:blur(10px)!important}
    .ring.r1{width:402px!important;height:402px!important;border-color:rgba(120,244,255,.86)!important;box-shadow:0 0 24px rgba(74,226,255,.70),0 0 65px rgba(43,124,255,.30),inset 0 0 55px rgba(49,189,255,.14)!important}
    .ring.r2{width:442px!important;height:442px!important;opacity:1!important}
    .ring.r3{width:465px!important;top:225px!important;border-color:rgba(109,230,255,.55)!important}
    .mascot{width:300px!important;height:300px!important;filter:drop-shadow(0 0 18px rgba(95,245,255,.85)) drop-shadow(0 0 48px rgba(34,109,255,.45))!important;animation:clicFloat 4.6s ease-in-out infinite!important}
    .mascot img{display:none!important}
    .clicia-mascot-svg{width:100%;height:100%;display:block;overflow:visible}
    @keyframes clicFloat{0%,100%{transform:translateY(4px) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg) scale(1.025)}}
    .chat-shell{top:615px!important}
    .feature-strip{top:708px!important}
    .hero-title{top:102px!important}
    #accountBtn{font-size:0!important;position:relative!important;overflow:visible!important}
    #accountBtn::before{content:"";width:20px;height:20px;display:block;background:currentColor;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8' r='4' fill='none' stroke='black' stroke-width='1.8'/%3E%3Cpath d='M5 21c.7-5 3-7 7-7s6.3 2 7 7' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8' r='4' fill='none' stroke='black' stroke-width='1.8'/%3E%3Cpath d='M5 21c.7-5 3-7 7-7s6.3 2 7 7' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat}
    .portal-wrap.thinking .ring.r1{animation-duration:4s!important}.portal-wrap.thinking .ring.r2{animation-duration:3s!important}.portal-wrap.thinking .portal-glow{animation-duration:1s!important;opacity:1}.portal-wrap.listening .portal-glow{background:radial-gradient(circle,rgba(91,242,255,.42) 0 38%,rgba(31,115,255,.18) 50%,transparent 72%)!important}
    @media(max-width:700px){.mascot{width:245px!important;height:245px!important}.portal-wrap{width:350px!important;height:340px!important}.ring.r1{width:300px!important;height:300px!important}.ring.r2{width:330px!important;height:330px!important}.ring.r3{width:350px!important;top:185px!important}.portal-glow{width:290px!important;height:290px!important}}
  `;
  document.head.appendChild(style);

  if (mascot) {
    mascot.innerHTML = `
      <svg class="clicia-mascot-svg" viewBox="0 0 560 560" role="img" aria-label="Clic, mascotte de ClicIA">
        <defs>
          <linearGradient id="clicBody" x1=".12" y1=".05" x2=".82" y2=".92"><stop offset="0" stop-color="#c8ffff"/><stop offset=".18" stop-color="#52f1ff"/><stop offset=".52" stop-color="#0782ff"/><stop offset=".82" stop-color="#1549f0"/><stop offset="1" stop-color="#64eaff"/></linearGradient>
          <linearGradient id="clicRay" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#87ffff"/><stop offset=".55" stop-color="#15c8ff"/><stop offset="1" stop-color="#1d55ff"/></linearGradient>
          <radialGradient id="clicFace" cx="52%" cy="48%" r="70%"><stop offset="0" stop-color="#0a4be7"/><stop offset=".75" stop-color="#082aa2"/><stop offset="1" stop-color="#071b73"/></radialGradient>
          <filter id="clicGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="eyeGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <g filter="url(#clicGlow)">
          <path d="M112 78C91 69 68 87 73 111L157 435C162 458 188 465 204 446L282 349C293 335 310 329 329 332L443 348C465 351 481 333 477 314C475 304 469 296 460 290L137 88C129 83 120 79 112 78Z" fill="url(#clicBody)" stroke="#a9ffff" stroke-width="5" stroke-linejoin="round"/>
          <path d="M178 302C218 262 286 245 344 263C369 271 397 289 432 313C444 322 439 336 424 336L335 326C307 323 286 332 269 353L211 420C199 434 181 428 177 410L155 329C151 315 162 305 178 302Z" fill="url(#clicFace)" opacity=".98"/>
          <ellipse cx="149" cy="120" rx="34" ry="17" fill="rgba(255,255,255,.72)" transform="rotate(31 149 120)"/>
          <rect x="239" y="305" width="31" height="61" rx="15.5" fill="#aaffff" filter="url(#eyeGlow)"/>
          <rect x="329" y="289" width="31" height="61" rx="15.5" fill="#aaffff" filter="url(#eyeGlow)"/>
          <g fill="url(#clicRay)" stroke="#87ffff" stroke-width="2">
            <rect x="366" y="82" width="34" height="112" rx="17" transform="rotate(9 383 138)"/>
            <rect x="429" y="145" width="34" height="116" rx="17" transform="rotate(46 446 203)"/>
            <rect x="456" y="236" width="34" height="111" rx="17" transform="rotate(87 473 292)"/>
          </g>
        </g>
      </svg>`;
  }

  menuBtn?.addEventListener('click', () => nav?.classList.toggle('open'));
  document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => nav?.classList.remove('open')));
  document.getElementById('headerSearchBtn')?.addEventListener('click', () => { panel?.scrollIntoView({behavior:'smooth', block:'center'}); setTimeout(() => input?.focus(), 350); });

  let tx=0,ty=0,cx=0,cy=0;
  addEventListener('pointermove', e => { tx=(e.clientX/innerWidth-.5)*2; ty=(e.clientY/innerHeight-.5)*2; }, {passive:true});
  addEventListener('pointerleave',()=>{tx=0;ty=0});
  function animate(){ cx+=(tx-cx)*.055; cy+=(ty-cy)*.055; if(mascot){ mascot.style.setProperty('--mx',`${cx*8}px`); mascot.style.setProperty('--my',`${cy*5}px`); } requestAnimationFrame(animate); }
  requestAnimationFrame(animate);

  input?.addEventListener('focus',()=>stage?.classList.add('listening'));
  input?.addEventListener('blur',()=>stage?.classList.remove('listening'));
  form?.addEventListener('submit',()=>{ stage?.classList.add('thinking'); setTimeout(()=>stage?.classList.remove('thinking'),1500); setTimeout(()=>panel?.classList.add('chat-open'),80); });
  if(messages&&panel){ new MutationObserver(()=>{ if(messages.children.length>2) panel.classList.add('chat-open'); }).observe(messages,{childList:true,subtree:true}); }

  const restorePlaceholder=()=>{ if(input && !input.value) input.placeholder='Posez votre question ou recherchez...'; };
  restorePlaceholder(); setTimeout(restorePlaceholder,300); setTimeout(restorePlaceholder,1200);

  window.TikoV2=window.TikoV3={thinking(v){stage?.classList.toggle('thinking',!!v)},listen(v){stage?.classList.toggle('listening',!!v)},look(x=0,y=0){tx=Math.max(-1,Math.min(1,x/20));ty=Math.max(-1,Math.min(1,y/20))}};
})();
