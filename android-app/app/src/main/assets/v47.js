(() => {
  const SVG = `
  <svg class="tiko-live-svg" viewBox="0 0 260 390" aria-hidden="true">
    <defs>
      <linearGradient id="p47Cap" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffd77c"/><stop offset="1" stop-color="#d7952e"/></linearGradient>
      <linearGradient id="p47Over" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#66503a"/><stop offset="1" stop-color="#30251b"/></linearGradient>
      <linearGradient id="p47Shirt" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#252c33"/><stop offset="1" stop-color="#12161b"/></linearGradient>
      <filter id="p47Shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#000" flood-opacity=".34"/></filter>
    </defs>
    <g class="tiko-body" filter="url(#p47Shadow)">
      <g class="tiko-legs">
        <rect x="89" y="286" width="29" height="61" rx="13" fill="#27323b"/>
        <rect x="142" y="286" width="29" height="61" rx="13" fill="#27323b"/>
        <path d="M80 341h48q12 0 13 16v8H69q-7-18 11-24Z" fill="#171c21"/>
        <path d="M132 341h51q13 0 13 16v8h-76q-6-18 12-24Z" fill="#171c21"/>
      </g>
      <g class="tiko-torso">
        <rect x="72" y="154" width="116" height="139" rx="39" fill="url(#p47Shirt)"/>
        <rect x="86" y="173" width="88" height="121" rx="26" fill="url(#p47Over)"/>
        <path d="M96 170 89 243" stroke="#c99745" stroke-width="8" stroke-linecap="round"/>
        <path d="M164 170 171 243" stroke="#c99745" stroke-width="8" stroke-linecap="round"/>
        <circle cx="96" cy="170" r="8" fill="#f3c66b"/>
        <circle cx="164" cy="170" r="8" fill="#f3c66b"/>
        <rect x="105" y="211" width="50" height="40" rx="10" fill="#1a1f24" stroke="#b9863c" stroke-width="4"/>
        <text x="130" y="237" text-anchor="middle" font-size="23" font-weight="800" fill="#f1c568" font-family="Arial,sans-serif">P</text>
      </g>
      <g class="tiko-arm tiko-arm-left" transform-origin="78px 188px">
        <rect x="55" y="176" width="20" height="78" rx="10" fill="#efc5a7" transform="rotate(13 65 176)"/>
        <circle cx="52" cy="253" r="12" fill="#efc5a7"/>
      </g>
      <g class="tiko-arm tiko-arm-right" transform-origin="181px 183px">
        <rect x="180" y="174" width="20" height="81" rx="10" fill="#efc5a7" transform="rotate(-10 190 174)"/>
        <circle cx="200" cy="253" r="12" fill="#efc5a7"/>
        <path class="tiko-point-finger" d="M205 249 230 241" stroke="#efc5a7" stroke-width="9" stroke-linecap="round"/>
      </g>
      <g class="tiko-head">
        <ellipse cx="130" cy="104" rx="48" ry="55" fill="#efc5a7"/>
        <circle cx="84" cy="111" r="10" fill="#efc5a7"/>
        <circle cx="176" cy="111" r="10" fill="#efc5a7"/>
        <path d="M83 98q3-55 46-62 43-5 55 26 6 15 5 35-19-19-42-17-25 1-40-17-11 17-24 35Z" fill="#38261e"/>
        <path d="M74 83q10-31 41-43 36-14 73 2 17 8 26 25l-12 15q-13-13-36-15-31-3-49-16-14 16-32 34Z" fill="url(#p47Cap)"/>
        <path d="M72 82h118q-7 16-14 20H86q-9-4-14-20Z" fill="#e4ad43"/>
        <circle cx="130" cy="66" r="16" fill="#d8912b"/>
        <text x="130" y="73" text-anchor="middle" font-size="18" font-weight="800" fill="#201a14" font-family="Arial,sans-serif">P</text>
        <path class="tiko-brow-left" d="M95 99q12-9 25 0" stroke="#33211a" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path class="tiko-brow-right" d="M141 99q12-9 25 0" stroke="#33211a" stroke-width="5" fill="none" stroke-linecap="round"/>
        <g class="tiko-eye tiko-eye-left"><ellipse cx="108" cy="117" rx="11" ry="12" fill="#fff"/><circle class="tiko-pupil" cx="108" cy="119" r="4.8" fill="#37261d"/></g>
        <g class="tiko-eye tiko-eye-right"><ellipse cx="151" cy="117" rx="11" ry="12" fill="#fff"/><circle class="tiko-pupil" cx="151" cy="119" r="4.8" fill="#37261d"/></g>
        <path d="M128 124q4 9 0 17" stroke="#d29c86" stroke-width="3" fill="none" stroke-linecap="round"/>
        <g class="tiko-mouth"><ellipse cx="130" cy="149" rx="17" ry="7" fill="#78342d"/><path d="M116 147q14 8 28 0" stroke="#f7ded6" stroke-width="4" fill="none" stroke-linecap="round"/></g>
        <path d="M102 162q28 15 56 0" stroke="#3a281f" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".55"/>
      </g>
    </g>
  </svg>`;

  function makeHost(kind='chat') {
    const host = document.createElement('div');
    host.className = `tiko-live-host tiko-live-${kind}`;
    host.innerHTML = SVG;
    host.setAttribute('role','img');
    host.setAttribute('aria-label','Tiko');
    return host;
  }

  function installHero() {
    const old = document.querySelector('#tikoHero');
    if (!old || document.querySelector('#tikoLiveHero')) return;
    old.style.opacity='0'; old.style.pointerEvents='none';
    const host = makeHost('hero'); host.id='tikoLiveHero';
    old.parentElement?.insertBefore(host, old.nextSibling);
    const sync = () => {
      const s=(old.getAttribute('src')||'').toLowerCase();
      host.classList.toggle('is-thinking',s.includes('think'));
      host.classList.toggle('is-pointing',s.includes('point'));
    };
    sync();
    new MutationObserver(sync).observe(old,{attributes:true,attributeFilter:['src','class']});
    host.addEventListener('click',()=>wave(host));
  }

  function enhanceRow(row) {
    if (!row?.classList?.contains('assistant')) return;
    const av=row.querySelector('.assistant-avatar'); if(!av) return;
    const old=av.querySelector('img'); if(old) old.style.display='none';
    if(!av.querySelector('.tiko-live-host')) {
      const host=makeHost('chat'); av.appendChild(host);
      host.addEventListener('click',e=>{e.stopPropagation();wave(host);});
    }
  }

  function wave(el){
    el.classList.remove('manual-wave'); void el.offsetWidth; el.classList.add('manual-wave');
    setTimeout(()=>el.classList.remove('manual-wave'),1100);
  }

  function installRows(){
    const box=document.querySelector('#messages'); if(!box)return;
    box.querySelectorAll('.message.assistant').forEach(enhanceRow);
    new MutationObserver(ms=>{
      for(const m of ms) m.addedNodes.forEach(n=>{
        if(n.nodeType!==1)return;
        if(n.matches?.('.message.assistant')) enhanceRow(n);
        n.querySelectorAll?.('.message.assistant').forEach(enhanceRow);
      });
    }).observe(box,{childList:true,subtree:true});
  }

  function installEyeTracking(){
    let x=0,y=0,raf=0;
    const apply=()=>{
      raf=0;
      document.documentElement.style.setProperty('--tiko-look-x',`${x}px`);
      document.documentElement.style.setProperty('--tiko-look-y',`${y}px`);
    };
    const track=(cx,cy)=>{
      x=Math.max(-2.7,Math.min(2.7,(cx/window.innerWidth-.5)*5.4));
      y=Math.max(-2.0,Math.min(2.0,(cy/window.innerHeight-.35)*4));
      if(!raf)raf=requestAnimationFrame(apply);
    };
    addEventListener('pointermove',e=>track(e.clientX,e.clientY),{passive:true});
    addEventListener('touchmove',e=>{const t=e.touches?.[0];if(t)track(t.clientX,t.clientY);},{passive:true});
    addEventListener('touchstart',e=>{const t=e.touches?.[0];if(t)track(t.clientX,t.clientY);},{passive:true});
  }

  function init(){ installHero(); installRows(); installEyeTracking(); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
