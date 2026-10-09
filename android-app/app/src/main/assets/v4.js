(() => {
  const input = document.querySelector('#input');
  const form = document.querySelector('#composer');
  const hero = document.querySelector('#tikoHero');
  const stage = document.querySelector('.mascot-stage');
  if (!input || !form || !hero) return;

  input.setAttribute('enterkeyhint','enter');
  input.setAttribute('aria-label','Message à Tiko. Entrée crée une nouvelle ligne.');

  /* Enter = new line. Ctrl/Cmd+Enter = optional send shortcut. */
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopImmediatePropagation();
      form.requestSubmit();
      return;
    }
    e.stopImmediatePropagation();
  }, true);

  const personas = {
    default:{emoji:'✦',label:'Tiko',jacket:'#d8a64d',accent:'#f0c878',hat:'cap',tool:'spark'},
    artist:{emoji:'🎨',label:'Tiko artiste',jacket:'#8b5d9f',accent:'#e8bb67',hat:'beret',tool:'palette'},
    plumber:{emoji:'🔧',label:'Tiko plombier',jacket:'#2f6e73',accent:'#e8bb67',hat:'beanie',tool:'wrench'},
    chef:{emoji:'🍳',label:'Tiko chef',jacket:'#e7e1d5',accent:'#c99743',hat:'chef',tool:'spoon'},
    tech:{emoji:'💻',label:'Tiko techno',jacket:'#31465d',accent:'#69c8c5',hat:'headset',tool:'tablet'},
    teacher:{emoji:'📚',label:'Tiko prof',jacket:'#675542',accent:'#e8bb67',hat:'glasses',tool:'book'},
    builder:{emoji:'🛠️',label:'Tiko bricoleur',jacket:'#9a662e',accent:'#f0c878',hat:'hardhat',tool:'hammer'},
    coach:{emoji:'🧭',label:'Tiko coach',jacket:'#405a46',accent:'#e8bb67',hat:'hood',tool:'note'}
  };

  function classify(text=''){
    const t = text.toLowerCase();
    if (/(plomb|toilette|lavabo|robinet|tuyau|drain|fuite d['’ ]?eau|évier|evier)/.test(t)) return 'plumber';
    if (/(peint|dessin|illustr|logo|affiche|visuel|image|photo|art|couleur|design)/.test(t)) return 'artist';
    if (/(recette|cuisine|souper|dîner|diner|repas|poulet|gâteau|gateau|cuire|chef)/.test(t)) return 'chef';
    if (/(ordinateur|téléphone|telephone|android|iphone|code|programm|wifi|réseau|reseau|application|logiciel|tech|api)/.test(t)) return 'tech';
    if (/(école|ecole|devoir|math|français|francais|anglais|apprendre|exercice|cours|étude|etude|élève|eleve)/.test(t)) return 'teacher';
    if (/(bricol|répar|repar|porte|mur|vis|clou|meuble|bois|outil|construction|installer|montage)/.test(t)) return 'builder';
    if (/(décision|decision|relation|stress|motivation|organis|planifie|conseil|réfléch|reflech|objectif|travail|gestion)/.test(t)) return 'coach';
    return 'default';
  }

  function hatMarkup(kind){
    if(kind==='beret') return '<ellipse cx="109" cy="53" rx="43" ry="14" fill="#5f3d6f"/><ellipse cx="122" cy="45" rx="22" ry="8" fill="#765088"/>';
    if(kind==='beanie') return '<path d="M68 64 Q74 35 110 32 Q146 35 151 64Z" fill="#22353a"/><rect x="66" y="59" width="87" height="14" rx="7" fill="#2f5558"/>';
    if(kind==='chef') return '<path d="M70 59 Q63 42 78 34 Q83 18 100 27 Q114 13 126 28 Q145 22 149 39 Q161 49 150 61Z" fill="#fff9eb" stroke="#d8d0bf" stroke-width="4"/><rect x="75" y="56" width="72" height="16" rx="7" fill="#f4ecdd"/>';
    if(kind==='headset') return '<path d="M68 68 Q72 31 110 29 Q147 31 153 68" fill="none" stroke="#69c8c5" stroke-width="8"/><rect x="61" y="63" width="15" height="30" rx="7" fill="#263b4d"/><rect x="146" y="63" width="15" height="30" rx="7" fill="#263b4d"/><path d="M151 84 Q166 90 158 105" fill="none" stroke="#69c8c5" stroke-width="4"/>';
    if(kind==='glasses') return '<g fill="none" stroke="#d7b067" stroke-width="5"><rect x="72" y="76" width="34" height="24" rx="10"/><rect x="114" y="76" width="34" height="24" rx="10"/><path d="M106 86h8"/></g>';
    if(kind==='hardhat') return '<path d="M66 65 Q69 34 109 31 Q150 34 154 65Z" fill="#e5ad46"/><rect x="59" y="61" width="101" height="13" rx="6" fill="#f3c66d"/><path d="M109 33v28" stroke="#ba7e2b" stroke-width="5"/>';
    if(kind==='hood') return '<path d="M62 83 Q63 35 110 27 Q157 36 158 84 L145 76 Q136 51 110 49 Q83 51 75 77Z" fill="#314a37"/>';
    return '<path d="M68 61 Q74 37 108 34 Q137 35 149 54 L137 62 Q112 50 78 67Z" fill="#181d24"/><path d="M107 35 Q126 32 143 43" fill="none" stroke="#e3b661" stroke-width="5" stroke-linecap="round"/>';
  }

  function toolMarkup(kind, accent){
    if(kind==='palette') return `<g transform="translate(150 160) rotate(-10)"><path d="M0 4 Q29 -10 38 13 Q42 31 22 35 Q13 37 13 27 Q14 19 5 19 Q-4 18 0 4Z" fill="#d5a95b"/><circle cx="10" cy="7" r="4" fill="#dd726e"/><circle cx="22" cy="4" r="4" fill="#67a8a1"/><circle cx="30" cy="13" r="4" fill="#8e70ae"/></g>`;
    if(kind==='wrench') return `<g transform="translate(159 151) rotate(25)" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"><path d="M0 0 L0 56"/><path d="M-10 -6 Q0 9 10 -6"/></g>`;
    if(kind==='spoon') return `<g transform="translate(162 151) rotate(17)" fill="${accent}"><ellipse cx="0" cy="0" rx="10" ry="15"/><rect x="-3" y="10" width="6" height="48" rx="3"/></g>`;
    if(kind==='tablet') return `<g transform="translate(143 151)"><rect width="43" height="58" rx="8" fill="#18232d" stroke="${accent}" stroke-width="4"/><circle cx="21.5" cy="49" r="3" fill="${accent}"/><path d="M9 14h25M9 23h17M9 32h22" stroke="#8fe1dc" stroke-width="3"/></g>`;
    if(kind==='book') return `<g transform="translate(142 159)"><path d="M0 0 Q21 -8 39 1 V43 Q20 35 0 43Z" fill="#8b6b3e"/><path d="M39 1 Q58 -8 73 0 V42 Q57 35 39 43Z" fill="#a67d42"/><path d="M39 3v38" stroke="#e5c47b" stroke-width="3"/></g>`;
    if(kind==='hammer') return `<g transform="translate(164 151) rotate(24)"><rect x="-4" y="12" width="8" height="48" rx="4" fill="#8a5c31"/><path d="M-18 0h36v17h-36z" rx="4" fill="${accent}"/></g>`;
    if(kind==='note') return `<g transform="translate(145 155)"><rect width="43" height="55" rx="8" fill="#e9dfc7"/><path d="M9 14h25M9 24h19M9 34h23" stroke="#6a715f" stroke-width="3"/><path d="M31 43c-7-9-15 1 0 9 15-8 7-18 0-9z" fill="${accent}"/></g>`;
    return `<g transform="translate(158 164)" fill="${accent}"><path d="M0-14 4-4 14 0 4 4 0 14-4 4-14 0-4-4Z"/></g>`;
  }

  function tikoSvg(name){
    const p=personas[name]||personas.default;
    const apron=name==='chef'?'<path d="M87 142h46l10 83H77Z" fill="#fff8e9" opacity=".96"/><path d="M91 178h37" stroke="#d3b77e" stroke-width="4"/>':'';
    const belt=(name==='plumber'||name==='builder')?'<rect x="72" y="184" width="76" height="14" rx="6" fill="#35291f"/><rect x="104" y="182" width="13" height="18" rx="3" fill="#d9ad59"/>':'';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 260"><ellipse cx="110" cy="241" rx="61" ry="10" fill="#000" opacity=".18"/><g stroke="#101419" stroke-width="5" stroke-linejoin="round"><path d="M77 206 72 237h33l5-31" fill="#222831"/><path d="M143 206 149 237h-34l-4-31" fill="#222831"/><path d="M69 232h39v12H65q-7-7 4-12Z" fill="#11151a"/><path d="M151 232h-39v12h43q7-7-4-12Z" fill="#11151a"/><path d="M67 131 Q110 111 153 131 L148 211 Q111 224 72 211Z" fill="${p.jacket}"/><path d="M71 148 Q48 157 47 187 Q47 199 58 197 L78 172" fill="${p.jacket}"/><path d="M149 148 Q173 157 174 184 Q174 197 163 197 L143 172" fill="${p.jacket}"/><circle cx="54" cy="196" r="11" fill="#f2ddc6"/><circle cx="166" cy="196" r="11" fill="#f2ddc6"/>${apron}${belt}<circle cx="110" cy="92" r="54" fill="#f2ddc6"/><path d="M63 87 Q65 48 110 42 Q153 48 158 88 Q144 68 127 70 Q100 49 63 87Z" fill="#2a211b"/>${hatMarkup(p.hat)}<path d="M82 94 q9-9 18 0" fill="none" stroke="#24211e" stroke-width="5" stroke-linecap="round"/><path d="M121 94 q9-9 18 0" fill="none" stroke="#24211e" stroke-width="5" stroke-linecap="round"/><path d="M96 117 Q110 130 125 116" fill="none" stroke="#7b4a3d" stroke-width="5" stroke-linecap="round"/><circle cx="76" cy="109" r="6" fill="#e9aa99" opacity=".55"/><circle cx="145" cy="109" r="6" fill="#e9aa99" opacity=".55"/><path d="M97 150h26v22H97z" fill="#11161c" rx="6"/><path d="m101 159 9-7 9 7-9 7Z" fill="${p.accent}" stroke="none"/>${toolMarkup(p.tool,p.accent)}</g></svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }

  const uris={}; Object.keys(personas).forEach(k=>uris[k]=tikoSvg(k));
  let current='default';
  let replacing=false;

  const badge=document.createElement('div'); badge.className='v4-mode-badge'; stage?.appendChild(badge);
  function updateBadge(){ const p=personas[current]; badge.innerHTML=`<span>${p.emoji}</span>${p.label}`; badge.classList.remove('flash'); void badge.offsetWidth; badge.classList.add('flash'); }

  function setHero(){ if(!hero)return; replacing=true; hero.src=uris[current]; hero.classList.add('v4-switch'); setTimeout(()=>hero.classList.remove('v4-switch'),460); setTimeout(()=>replacing=false,0); }
  function applyPersona(name){
    name=personas[name]?name:'default';
    if(name===current && hero.src.startsWith('data:image/svg+xml')) return;
    current=name; document.documentElement.dataset.tikoMode=name; setHero(); updateBadge();
  }

  applyPersona('default');

  /* app.js swaps old pose assets; v4 preserves costume and uses the CSS pose animation instead. */
  new MutationObserver(()=>{ if(replacing)return; if(!hero.src.startsWith('data:image/svg+xml')) setHero(); }).observe(hero,{attributes:true,attributeFilter:['src']});

  function inspectPrompt(text){ if(text?.trim()) applyPersona(classify(text)); }
  form.addEventListener('submit',()=>inspectPrompt(input.value),true);
  document.addEventListener('click',(e)=>{ const b=e.target.closest?.('[data-prompt]'); if(b) inspectPrompt(b.dataset.prompt||''); },true);

  const messages=document.querySelector('#messages');
  function skinAvatars(root){
    const imgs=[];
    if(root?.matches?.('.assistant-avatar img')) imgs.push(root);
    root?.querySelectorAll?.('.assistant-avatar img').forEach(i=>imgs.push(i));
    imgs.forEach(img=>{ if(!img.dataset.v4Skinned){ img.src=uris[current]; img.dataset.v4Skinned='1'; img.closest('.assistant-avatar')?.classList.add('v4-context-pulse'); } });
  }
  if(messages){
    new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.nodeType===1)skinAvatars(n); }))).observe(messages,{childList:true,subtree:true});
  }

  /* Stable small brand avatar: refreshed to the new original Tiko design. */
  document.querySelectorAll('.brand-switch img,.brand-avatar,.voice-orb img').forEach(img=>img.src=uris.default);

  window.PratikoV4={classify,applyPersona,get mode(){return current;}};
})();
