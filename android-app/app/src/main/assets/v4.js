(() => {
  const input=document.querySelector('#input');
  const form=document.querySelector('#composer');
  const hero=document.querySelector('#tikoHero');
  const stage=document.querySelector('.mascot-stage');
  const messages=document.querySelector('#messages');
  const empty=document.querySelector('#emptyState');
  if(!input||!form||!hero)return;

  input.setAttribute('enterkeyhint','enter');
  input.setAttribute('aria-label','Message à Tiko. Entrée crée une nouvelle ligne.');
  input.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||e.isComposing)return;
    if(e.ctrlKey||e.metaKey){e.preventDefault();e.stopImmediatePropagation();form.requestSubmit();return;}
    e.stopImmediatePropagation();
  },true);

  const personas={
    default:{emoji:'✦',label:'Tiko',vest:'#176b70',vest2:'#0e4d52',accent:'#f1bd58',hat:'#e1a735',scarf:'#b95336',tool:'spark'},
    artist:{emoji:'🎨',label:'Tiko artiste',vest:'#6e4f86',vest2:'#4c365f',accent:'#f1bd58',hat:'#a76575',scarf:'#c45b42',tool:'palette'},
    plumber:{emoji:'🔧',label:'Tiko plombier',vest:'#27767b',vest2:'#15545a',accent:'#f1bd58',hat:'#d99f35',scarf:'#bb5638',tool:'wrench'},
    chef:{emoji:'🍳',label:'Tiko chef',vest:'#ebe4d5',vest2:'#d6cbb8',accent:'#c98e34',hat:'#fff6e5',scarf:'#b95136',tool:'spoon'},
    tech:{emoji:'💻',label:'Tiko techno',vest:'#24495f',vest2:'#173347',accent:'#52d8ce',hat:'#29465e',scarf:'#a94b3b',tool:'tablet'},
    teacher:{emoji:'📚',label:'Tiko prof',vest:'#65503d',vest2:'#48382b',accent:'#e7b75f',hat:'#b98439',scarf:'#a64e36',tool:'book'},
    builder:{emoji:'🛠️',label:'Tiko bricoleur',vest:'#93622e',vest2:'#66431f',accent:'#f4c66d',hat:'#e0a536',scarf:'#b65236',tool:'hammer'},
    coach:{emoji:'🧭',label:'Tiko coach',vest:'#385a47',vest2:'#274032',accent:'#e7b75f',hat:'#b98539',scarf:'#a84d38',tool:'note'}
  };

  function classify(text=''){
    const t=text.toLowerCase();
    if(/(plomb|toilette|lavabo|robinet|tuyau|drain|fuite d['’ ]?eau|évier|evier)/.test(t))return'plumber';
    if(/(peint|dessin|illustr|logo|affiche|visuel|image|photo|art|couleur|design|créatif|creatif)/.test(t))return'artist';
    if(/(recette|cuisine|souper|dîner|diner|repas|poulet|gâteau|gateau|cuire|chef)/.test(t))return'chef';
    if(/(ordinateur|téléphone|telephone|android|iphone|code|programm|wifi|réseau|reseau|application|logiciel|tech|api)/.test(t))return'tech';
    if(/(école|ecole|devoir|math|français|francais|anglais|apprendre|exercice|cours|étude|etude|élève|eleve)/.test(t))return'teacher';
    if(/(bricol|répar|repar|porte|mur|vis|clou|meuble|bois|outil|construction|installer|montage)/.test(t))return'builder';
    if(/(décision|decision|relation|stress|motivation|organis|planifie|conseil|réfléch|reflech|objectif|travail|gestion)/.test(t))return'coach';
    return'default';
  }

  function headwear(name,p){
    if(name==='artist')return `<ellipse cx="111" cy="52" rx="50" ry="17" fill="${p.hat}"/><ellipse cx="129" cy="43" rx="24" ry="8" fill="#b96f82"/><circle cx="131" cy="35" r="4" fill="#e3b861"/>`;
    if(name==='chef')return `<path d="M65 62 Q59 45 75 35 Q77 19 97 26 Q111 12 127 27 Q146 20 151 39 Q164 48 151 64Z" fill="#fff8e9" stroke="#d8d0c1" stroke-width="4"/><rect x="72" y="58" width="79" height="17" rx="8" fill="#f1e8d8"/>`;
    if(name==='tech')return `<path d="M67 66 Q72 31 111 30 Q151 32 155 67" fill="none" stroke="#55d8d0" stroke-width="8"/><rect x="61" y="61" width="16" height="30" rx="8" fill="#1a3242"/><rect x="147" y="61" width="16" height="30" rx="8" fill="#1a3242"/><path d="M155 84 Q169 89 160 105" fill="none" stroke="#55d8d0" stroke-width="4"/>`;
    if(name==='builder')return `<path d="M65 66 Q69 34 111 31 Q152 34 156 66Z" fill="#e1aa3c"/><rect x="58" y="62" width="105" height="13" rx="6" fill="#f4ca72"/><path d="M111 33v29" stroke="#b87a29" stroke-width="5"/>`;
    return `<path d="M64 66 Q69 38 107 34 Q140 35 154 54 L143 66 Q115 52 75 69Z" fill="${p.hat}"/><path d="M106 35 Q129 31 146 44" fill="none" stroke="#ffd67e" stroke-width="5" stroke-linecap="round"/><circle cx="79" cy="57" r="12" fill="#6f461e"/><path d="M73 57h12M79 51v12" stroke="#efc568" stroke-width="3"/>`;
  }

  function tool(name,p){
    if(name==='artist')return `<g transform="translate(163 164) rotate(-15)"><path d="M0 2 Q30 -12 40 13 Q43 34 20 37 Q11 37 13 27 Q14 19 5 20 Q-5 18 0 2Z" fill="#d5a95b"/><circle cx="10" cy="7" r="4" fill="#d95e58"/><circle cx="22" cy="4" r="4" fill="#55b8b0"/><circle cx="31" cy="13" r="4" fill="#8c66a7"/></g>`;
    if(name==='plumber')return `<g transform="translate(167 153) rotate(25)" fill="none" stroke="${p.accent}" stroke-width="8" stroke-linecap="round"><path d="M0 1v58"/><path d="M-11 -7 Q0 10 11 -7"/></g>`;
    if(name==='chef')return `<g transform="translate(166 154) rotate(17)" fill="${p.accent}"><ellipse cx="0" cy="0" rx="10" ry="15"/><rect x="-3" y="10" width="6" height="49" rx="3"/></g>`;
    if(name==='tech')return `<g transform="translate(145 154)"><rect width="46" height="60" rx="8" fill="#101a23" stroke="${p.accent}" stroke-width="4"/><path d="M9 16h27M9 26h20M9 36h25" stroke="#91eee8" stroke-width="3"/><circle cx="23" cy="51" r="3" fill="${p.accent}"/></g>`;
    if(name==='teacher')return `<g transform="translate(140 162)"><path d="M0 0 Q20 -8 40 1v43Q20 35 0 43Z" fill="#8c6b3e"/><path d="M40 1 Q59 -8 75 0v42Q59 35 40 43Z" fill="#a67d42"/><path d="M40 3v38" stroke="#e4c57c" stroke-width="3"/></g>`;
    if(name==='builder')return `<g transform="translate(167 154) rotate(24)"><rect x="-4" y="13" width="8" height="48" rx="4" fill="#86572f"/><rect x="-20" y="0" width="40" height="17" rx="4" fill="${p.accent}"/></g>`;
    if(name==='coach')return `<g transform="translate(146 158)"><rect width="45" height="57" rx="8" fill="#eee3cc"/><path d="M9 14h26M9 25h20M9 36h24" stroke="#697260" stroke-width="3"/><path d="M32 45c-8-10-16 1 0 9 16-8 8-19 0-9z" fill="${p.accent}"/></g>`;
    return `<g transform="translate(167 171)" fill="${p.accent}"><path d="M0-15 4-4 15 0 4 4 0 15-4 4-15 0-4-4Z"/><circle cx="0" cy="0" r="3" fill="#fff2bd"/></g>`;
  }

  function tikoSvg(name){
    const p=personas[name]||personas.default;
    const chef=name==='chef'?'<path d="M85 145h52l10 83H75Z" fill="#fff7e7" opacity=".98"/><path d="M91 179h40" stroke="#d4b77a" stroke-width="4"/>':'';
    const belt=(name==='plumber'||name==='builder')?'<rect x="70" y="187" width="82" height="14" rx="6" fill="#3b2b20"/><rect x="104" y="185" width="14" height="18" rx="3" fill="#dcae56"/><circle cx="78" cy="193" r="5" fill="#dcae56"/>':'';
    const glasses=name==='teacher'?'<g fill="none" stroke="#d8b269" stroke-width="4"><rect x="73" y="82" width="34" height="23" rx="10"/><rect x="115" y="82" width="34" height="23" rx="10"/><path d="M107 92h8"/></g>':'';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 270">
      <ellipse cx="114" cy="251" rx="65" ry="10" fill="#000" opacity=".2"/>
      <g stroke="#11161c" stroke-width="5" stroke-linejoin="round">
        <path d="M79 211 74 243h35l6-32" fill="#253038"/><path d="M149 211 156 243h-36l-5-32" fill="#253038"/>
        <path d="M71 238h42v13H66q-7-8 5-13Z" fill="#5a3925"/><path d="M158 238h-42v13h47q7-8-5-13Z" fill="#5a3925"/>
        <path d="M68 135 Q114 113 160 135 L153 216 Q114 231 73 216Z" fill="${p.vest}"/><path d="M82 138 Q114 128 147 138" fill="none" stroke="${p.vest2}" stroke-width="11"/>
        <path d="M73 152 Q48 161 46 191 Q45 204 58 202 L81 174" fill="#f4e2c9"/><path d="M155 152 Q179 160 181 188 Q182 202 169 202 L146 174" fill="#f4e2c9"/>
        <circle cx="55" cy="201" r="12" fill="#6d452c"/><circle cx="172" cy="201" r="12" fill="#6d452c"/>
        ${chef}${belt}
        <path d="M84 143 Q92 158 95 176" fill="none" stroke="#815332" stroke-width="5"/><path d="M145 143 Q136 158 133 176" fill="none" stroke="#815332" stroke-width="5"/>
        <path d="M93 137 Q114 151 136 137 L132 159 Q114 170 96 159Z" fill="${p.scarf}"/>
        <circle cx="114" cy="96" r="57" fill="#f1d5b8"/>
        <path d="M63 91 Q65 51 112 43 Q158 50 164 93 Q148 71 131 72 Q104 50 63 91Z" fill="#3b251c"/>
        ${headwear(name,p)}
        <ellipse cx="90" cy="96" rx="12" ry="14" fill="#fff"><animate attributeName="ry" values="14;14;2;14;14" keyTimes="0;0.46;0.49;0.52;1" dur="4.6s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="139" cy="96" rx="12" ry="14" fill="#fff"><animate attributeName="ry" values="14;14;2;14;14" keyTimes="0;0.46;0.49;0.52;1" dur="4.6s" repeatCount="indefinite"/></ellipse>
        <circle cx="92" cy="99" r="6" fill="#5a381d" stroke="none"/><circle cx="137" cy="99" r="6" fill="#5a381d" stroke="none"/><circle cx="94" cy="96" r="2" fill="#fff" stroke="none"/><circle cx="139" cy="96" r="2" fill="#fff" stroke="none"/>
        <path d="M78 82 Q90 72 104 81" fill="none" stroke="#2b1d17" stroke-width="6" stroke-linecap="round"/><path d="M125 81 Q140 71 151 82" fill="none" stroke="#2b1d17" stroke-width="6" stroke-linecap="round"/>
        ${glasses}
        <path d="M103 116 Q114 121 125 116" fill="none" stroke="#c58c73" stroke-width="4" stroke-linecap="round"/>
        <path d="M93 122 Q114 139 136 121 Q130 144 114 146 Q98 144 93 122Z" fill="#642e28" stroke="#573027" stroke-width="4"/>
        <path d="M99 126 Q114 133 130 126" fill="none" stroke="#fff1df" stroke-width="5" stroke-linecap="round"/>
        <path d="M91 119 Q99 113 107 118" fill="none" stroke="#4a2b21" stroke-width="3" stroke-linecap="round"/><path d="M121 118 Q129 112 137 119" fill="none" stroke="#4a2b21" stroke-width="3" stroke-linecap="round"/>
        <path d="M106 147 Q114 152 123 147" fill="none" stroke="#3e261f" stroke-width="4" stroke-linecap="round"/>
        <circle cx="78" cy="116" r="7" fill="#df9784" opacity=".42" stroke="none"/><circle cx="151" cy="116" r="7" fill="#df9784" opacity=".42" stroke="none"/>
        <path d="M99 159h30v23H99z" fill="#152027" rx="6"/><path d="m104 169 10-8 10 8-10 8Z" fill="${p.accent}" stroke="none"/>
        ${tool(name,p)}
      </g>
      <g fill="${p.accent}" opacity=".9"><circle cx="37" cy="118" r="3"><animate attributeName="opacity" values=".2;1;.2" dur="2.1s" repeatCount="indefinite"/></circle><path d="M190 110l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"><animateTransform attributeName="transform" type="rotate" from="0 190 121" to="360 190 121" dur="5s" repeatCount="indefinite"/></path></g>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }

  const uris={};Object.keys(personas).forEach(k=>uris[k]=tikoSvg(k));
  let current='default',replacing=false;
  const badge=document.createElement('div');badge.className='v4-mode-badge';stage?.appendChild(badge);

  function updateBadge(){const p=personas[current];badge.innerHTML=`<span>${p.emoji}</span>${p.label}`;badge.classList.remove('flash');void badge.offsetWidth;badge.classList.add('flash');}
  function setHero(){replacing=true;hero.src=uris[current];hero.classList.add('v4-switch');setTimeout(()=>hero.classList.remove('v4-switch'),520);setTimeout(()=>replacing=false,0);}
  function applyPersona(name){name=personas[name]?name:'default';if(name===current&&hero.src.startsWith('data:image/svg+xml'))return;current=name;document.documentElement.dataset.tikoMode=name;setHero();updateBadge();skinGlobal();updateCompanion();}
  applyPersona('default');

  new MutationObserver(()=>{if(replacing)return;if(!hero.src.startsWith('data:image/svg+xml'))setHero();}).observe(hero,{attributes:true,attributeFilter:['src']});

  function inspectPrompt(text){if(text?.trim())applyPersona(classify(text));}
  form.addEventListener('submit',()=>inspectPrompt(input.value),true);
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-prompt]');if(b)inspectPrompt(b.dataset.prompt||'');},true);

  function skinAvatars(root=document){
    const imgs=[];
    if(root?.matches?.('.assistant-avatar img'))imgs.push(root);
    root?.querySelectorAll?.('.assistant-avatar img').forEach(i=>imgs.push(i));
    imgs.forEach(img=>{img.src=uris[current];img.dataset.v41Skinned='1';});
  }
  function skinGlobal(){document.querySelectorAll('.brand-avatar,.voice-orb img').forEach(img=>img.src=uris.default);skinAvatars(messages||document);}
  skinGlobal();

  function compactQuota(root=document){
    root.querySelectorAll?.('.image-quota').forEach(el=>{
      const s=el.querySelector('strong')?.textContent||el.textContent||'';
      const m=s.match(/(\d+)\s*\//)||s.match(/(\d+)/);
      if(m)el.innerHTML=`<strong>${m[1]}</strong> images restantes`;
    });
  }
  compactQuota();

  const companion=document.createElement('button');
  companion.type='button';companion.className='v41-companion';companion.setAttribute('aria-label','Tiko');
  companion.innerHTML=`<img alt="Tiko"><span class="v41-companion-bubble">Je suis là ✦</span>`;
  document.body.appendChild(companion);
  function updateCompanion(){companion.querySelector('img').src=uris[current];const has=messages&&messages.children.length>0;companion.classList.toggle('show',!!has);}
  companion.addEventListener('click',()=>{companion.classList.remove('hop','say');void companion.offsetWidth;companion.classList.add('hop','say');setTimeout(()=>companion.classList.remove('say'),1800);});
  updateCompanion();

  if(messages){new MutationObserver(ms=>{ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){skinAvatars(n);compactQuota(n);}}));updateCompanion();}).observe(messages,{childList:true,subtree:true});}
  if(empty){new MutationObserver(updateCompanion).observe(empty,{attributes:true,attributeFilter:['style','class']});}

  const originalCloud=window.PraticoCloud;
  if(originalCloud){
    const s=originalCloud.onStart?.bind(originalCloud),d=originalCloud.onDone?.bind(originalCloud),er=originalCloud.onError?.bind(originalCloud);
    originalCloud.onStart=function(...a){companion.classList.add('hop');setTimeout(()=>companion.classList.remove('hop'),600);return s?.(...a);};
    originalCloud.onDone=function(...a){companion.classList.add('hop');setTimeout(()=>companion.classList.remove('hop'),600);return d?.(...a);};
    originalCloud.onError=function(...a){companion.classList.add('say');companion.querySelector('.v41-companion-bubble').textContent='Oups… réessaie-moi ✦';setTimeout(()=>{companion.classList.remove('say');companion.querySelector('.v41-companion-bubble').textContent='Je suis là ✦';},1900);return er?.(...a);};
  }

  window.PratikoV41={classify,applyPersona,get mode(){return current;}};
})();
