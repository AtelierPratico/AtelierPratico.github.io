(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const IMAGE_API = 'https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/generate-image';
  const els = {
    drawer: $('#drawer'), scrim: $('#scrim'), messages: $('#messages'), empty: $('#emptyState'),
    input: $('#input'), composer: $('#composer'), send: $('#sendBtn'), history: $('#historyList'),
    sheet: $('#modelSheet'), toast: $('#toast'), notice: $('#cloudNotice'), tiko: $('#tikoHero'),
    mic: $('#micBtn'), voicePanel: $('#voicePanel'), voiceState: $('#voiceState'), voiceTitle: $('#voiceTitle'), voiceTranscript: $('#voiceTranscript'),
    imageQuota: $('#imageQuota')
  };
  const state = { chats: [], activeId: null, generating: false, activeBubble: null, engine: 'setup', voice: 'idle', imageQuota: {used:0,remaining:15,limit:15,plan:'free'} };
  const STORAGE = 'pratiko_chats_v4', ACTIVE = 'pratiko_active_v4';

  function id(){ return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function deviceId(){ try{return window.PraticoNative?.getDeviceId?.()||'';}catch{return '';} }
  function load(){
    try {
      const current = localStorage.getItem(STORAGE);
      const legacy = localStorage.getItem('pratiko_chats_v3') || localStorage.getItem('pratico_chats_v2');
      state.chats = JSON.parse(current || legacy || '[]');
    } catch { state.chats=[]; }
    if(!state.chats.length) newChat(false); else state.activeId = localStorage.getItem(ACTIVE) || localStorage.getItem('pratiko_active_v3') || state.chats[0].id;
    render();
  }
  function save(){ localStorage.setItem(STORAGE, JSON.stringify(state.chats.slice(0,50))); if(state.activeId) localStorage.setItem(ACTIVE,state.activeId); }
  function active(){ return state.chats.find(c=>c.id===state.activeId); }
  function newChat(doRender=true){ const c={id:id(),remoteId:null,title:'Nouvelle discussion',created:Date.now(),messages:[]}; state.chats.unshift(c); state.activeId=c.id; save(); if(doRender) render(); closeDrawer(); setTiko('wave'); }
  function titleFrom(text){ return text.replace(/\s+/g,' ').trim().slice(0,46) || 'Nouvelle discussion'; }
  function renderHistory(){ els.history.innerHTML=''; state.chats.forEach(c=>{ const b=document.createElement('button'); b.className='history-item'+(c.id===state.activeId?' active':''); b.textContent=c.title; b.onclick=()=>{state.activeId=c.id; save(); render(); closeDrawer();}; els.history.appendChild(b); }); }
  function render(){ renderHistory(); const c=active(); els.messages.innerHTML=''; const has=!!c?.messages.length; els.empty.style.display=has?'none':'flex'; els.messages.style.display=has?'flex':'none'; if(has) c.messages.forEach(m=>m.kind==='image'?appendImageMessage(m,false):appendMessage(m.role,m.content,false)); scrollBottom(false); }
  function makeAssistantRow(){ const row=document.createElement('div'); row.className='message assistant'; const av=document.createElement('div'); av.className='assistant-avatar'; const img=document.createElement('img'); img.src='tiko-avatar.svg'; img.alt='Tiko'; av.appendChild(img); row.appendChild(av); els.messages.appendChild(row); return row; }
  function appendMessage(role,text,animate=true){
    const row=document.createElement('div'); row.className='message '+role;
    if(role==='assistant'){ const av=document.createElement('div'); av.className='assistant-avatar'; const img=document.createElement('img'); img.src='tiko-avatar.svg'; img.alt='Tiko'; av.appendChild(img); row.appendChild(av); }
    const b=document.createElement('div'); b.className='bubble'; b.textContent=text||''; row.appendChild(b); els.messages.appendChild(row); if(animate) scrollBottom(); return b;
  }
  function appendImageMessage(m,animate=true){
    const row=makeAssistantRow();
    const card=document.createElement('div'); card.className='image-card';
    const img=document.createElement('img'); img.src=m.url; img.alt=m.prompt||'Image créée par Tiko'; card.appendChild(img);
    const body=document.createElement('div'); body.className='image-card-body';
    const title=document.createElement('div'); title.className='image-card-title'; title.textContent='✨ Création de Tiko'; body.appendChild(title);
    const actions=document.createElement('div'); actions.className='image-card-actions';
    const dl=document.createElement('button'); dl.className='primary'; dl.textContent='Télécharger'; dl.onclick=()=>downloadImage(m.url); actions.appendChild(dl);
    const redo=document.createElement('button'); redo.textContent='Refaire'; redo.onclick=()=>repeatImage(m.prompt,false); actions.appendChild(redo);
    const variant=document.createElement('button'); variant.textContent='Variante'; variant.onclick=()=>repeatImage(m.prompt,true); actions.appendChild(variant);
    body.appendChild(actions);
    const q=document.createElement('div'); q.className='image-quota'; q.innerHTML=`<strong>${Math.max(0,m.remaining??state.imageQuota.remaining)}/${m.limit??state.imageQuota.limit}</strong> créations gratuites restantes ce mois-ci`;
    body.appendChild(q); card.appendChild(body); row.appendChild(card); if(animate) scrollBottom(); return row;
  }
  function appendImageLoading(){ const row=makeAssistantRow(); row.classList.add('image-loading-row'); const b=document.createElement('div'); b.className='bubble image-loading'; b.innerHTML='<div class="image-loading-orb"></div><div class="image-loading-copy"><b>Tiko crée ton image…</b><span>Ça peut prendre quelques secondes.</span></div>'; row.appendChild(b); scrollBottom(); return row; }
  function scrollBottom(smooth=true){ requestAnimationFrame(()=>{ const area=$('.chat-area'); if(area) area.scrollTo({top:area.scrollHeight,behavior:smooth?'smooth':'auto'}); }); }
  function showToast(t){ els.toast.textContent=t; els.toast.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>els.toast.classList.remove('show'),2600); }
  function openDrawer(){els.drawer.classList.add('open');els.scrim.classList.add('show');}
  function closeDrawer(){els.drawer.classList.remove('open');els.scrim.classList.remove('show');}
  function openSheet(){els.sheet.classList.add('open');els.scrim.classList.add('show');}
  function closeSheet(){els.sheet.classList.remove('open'); if(!els.drawer.classList.contains('open')) els.scrim.classList.remove('show');}
  function resize(){els.input.style.height='auto'; els.input.style.height=Math.min(120,els.input.scrollHeight)+'px';}
  function setTiko(pose){ if(!els.tiko)return; const src = pose==='think'?'tiko-think.svg':pose==='point'?'tiko-point.svg':'tiko-wave.svg'; els.tiko.src=src; els.tiko.className='tiko-hero '+(pose==='think'?'thinking':pose==='point'?'celebrate':''); }
  function setGenerating(v){ state.generating=v; els.send.disabled=false; els.send.textContent=v?'■':'➤'; setTiko(v?'think':'wave'); }
  function updateQuota(q){ if(!q)return; state.imageQuota={...state.imageQuota,...q}; if(els.imageQuota) els.imageQuota.textContent=`${state.imageQuota.remaining}/${state.imageQuota.limit} images restantes ce mois-ci`; }

  function nativeStatus(){ try { return window.PraticoNative?.getEngineStatus?.() || 'preview'; } catch { return 'preview'; } }
  function refreshStatus(){ const s=nativeStatus(); state.engine=s; els.notice.classList.toggle('show',s!=='ready'); }
  async function refreshImageQuota(){ const d=deviceId(); if(!d)return; try{ const r=await fetch(IMAGE_API,{headers:{'X-Pratiko-Device':d}}); if(!r.ok)return; const data=await r.json(); if(data?.quota)updateQuota(data.quota); }catch{} }

  function instantReply(text){
    const t=text.toLowerCase().trim().replace(/[!?.,]/g,'');
    if(/^(allo+|salut|bonjour|bonsoir|hey+|yo+|coucou|hello)$/.test(t)) return 'Salut 👋 Moi c’est Tiko. Qu’est-ce que je peux faire pour toi?';
    if(/^(ca va|ça va|comment ca va|comment ça va|tu vas bien)$/.test(t)) return 'Oui 😄 Prêt à t’aider. Et toi?';
    if(/^(merci|merci beaucoup|thanks)$/.test(t)) return 'Avec plaisir 😊';
    return null;
  }
  function isImageRequest(text){
    const t=text.toLowerCase();
    const action=/(g[eé]n[eè]r|cr[eé][ée]|dessin|illustr|fais[- ]?moi|fabrique|con[cç]ois|generate|create|make)/i.test(t);
    const visual=/(image|photo|logo|affiche|poster|wallpaper|fond d['’ ]?[ée]cran|visuel|illustration|portrait|maquette)/i.test(t);
    return action && visual;
  }
  function aspectFor(text){ const t=text.toLowerCase(); if(/wallpaper|fond d['’ ]?[ée]cran|t[eé]l[eé]phone|vertical/.test(t))return'9:16'; if(/banni[eè]re|paysage|horizontal|youtube/.test(t))return'16:9'; if(/portrait/.test(t))return'3:4'; return'1:1'; }

  function send(raw){
    const text=(raw??els.input.value).trim(); if(!text) return;
    if(state.generating){ try{window.PraticoNative?.cancelGeneration?.();}catch{} setGenerating(false); return; }
    let c=active(); if(!c){newChat(false);c=active();}
    c.messages.push({role:'user',content:text}); if(c.messages.length===1)c.title=titleFrom(text); save();
    els.empty.style.display='none'; els.messages.style.display='flex'; appendMessage('user',text); els.input.value=''; resize(); renderHistory();
    if(isImageRequest(text)){ requestImage(text); return; }
    const quick=instantReply(text);
    if(quick){ setTiko('point'); setTimeout(()=>{c.messages.push({role:'assistant',content:quick});save();appendMessage('assistant',quick);setTimeout(()=>setTiko('wave'),900);},110); return; }
    const bubble=appendMessage('assistant',''); bubble.classList.add('typing-cursor'); state.activeBubble=bubble; setGenerating(true);
    const payload={conversation_id:c.remoteId||null,plan:'free',messages:c.messages.filter(m=>m.kind!=='image').slice(-20),client:{platform:'android',app:'pratiko-ai',version:'3.4'}};
    try{ if(window.PraticoNative?.sendMessage) window.PraticoNative.sendMessage(JSON.stringify(payload)); else window.PraticoCloud.onError('preview','Le moteur Pratiko AI n’est pas encore connecté.'); }
    catch(e){ window.PraticoCloud.onError('bridge',e.message||'Erreur de connexion'); }
  }

  async function requestImage(prompt){
    const d=deviceId(); if(!d){ appendMessage('assistant','La création d’images nécessite l’application Pratiko AI à jour.'); return; }
    if(state.imageQuota.plan==='free' && state.imageQuota.remaining<=0){ showImageLimit(); return; }
    const loading=appendImageLoading(); setGenerating(true);
    try{
      const r=await fetch(IMAGE_API,{method:'POST',headers:{'Content-Type':'application/json','X-Pratiko-Device':d},body:JSON.stringify({prompt,aspect_ratio:aspectFor(prompt)})});
      const data=await r.json().catch(()=>({})); loading.remove();
      if(r.status===429 || data?.error==='image_quota_reached'){ if(data?.quota)updateQuota(data.quota); showImageLimit(data?.message); return; }
      if(!r.ok || !data?.image?.url){ appendMessage('assistant',data?.message||'Tiko n’a pas réussi à créer l’image pour le moment. Réessaie dans quelques instants.'); if(data?.quota)updateQuota(data.quota); return; }
      updateQuota(data.quota);
      const c=active(); const m={role:'assistant',kind:'image',url:data.image.url,prompt:data.image.prompt||prompt,remaining:data.quota?.remaining,limit:data.quota?.limit}; c.messages.push(m); save(); appendImageMessage(m); setTiko('point'); setTimeout(()=>setTiko('wave'),1200);
    }catch(e){ loading.remove(); appendMessage('assistant','La création d’images est temporairement indisponible. Réessaie dans un instant.'); }
    finally{ setGenerating(false); }
  }
  function repeatImage(prompt,variant){
    let c=active(); if(!c){newChat(false);c=active();}
    const label=variant?'Fais-moi une variante de cette image':'Refais cette image'; c.messages.push({role:'user',content:label}); save(); appendMessage('user',label);
    requestImage(variant?`${prompt}\nCrée une nouvelle variante visuelle clairement différente tout en gardant le même sujet principal.`:prompt);
  }
  function showImageLimit(custom){
    const row=makeAssistantRow(); const box=document.createElement('div'); box.className='image-limit-card'; box.innerHTML=`<b>Limite d’images atteinte</b><p>${custom||'Tu as utilisé tes 15 créations d’images gratuites ce mois-ci. Elles se renouvellent automatiquement le mois prochain.'}</p><div class="quota-pill"><strong>0/15</strong> restantes</div>`; row.appendChild(box); scrollBottom();
  }
  function downloadImage(url){
    try{ if(window.PraticoNative?.downloadImage){ window.PraticoNative.downloadImage(url); showToast('Téléchargement démarré'); return; } }catch{}
    try{ window.location.href=url; }catch{ showToast('Impossible d’ouvrir l’image.'); }
  }

  function setVoiceUi(status){
    state.voice=status; els.mic.classList.remove('live','connecting'); els.voicePanel.classList.remove('show','listening');
    if(status==='connecting'){ els.mic.classList.add('connecting'); els.voicePanel.classList.add('show'); els.voiceState.textContent='CONNEXION VOCALE'; els.voiceTitle.textContent='Tiko se prépare…'; els.voiceTranscript.textContent='Connexion au mode vocal sécurisé.'; setTiko('think'); }
    else if(status==='listening'){ els.mic.classList.add('live'); els.voicePanel.classList.add('show','listening'); els.voiceState.textContent='MODE VOCAL'; els.voiceTitle.textContent='Tiko écoute…'; setTiko('wave'); }
    else { els.voiceState.textContent='MODE VOCAL'; els.voiceTitle.textContent='Tiko écoute…'; els.voiceTranscript.textContent='Parle naturellement. Tiko te répondra à voix haute.'; setTiko('wave'); }
  }

  window.PraticoCloud={
    onStart(){ setTiko('think'); },
    onConversationId(remoteId){ const c=active(); if(c && remoteId){ c.remoteId=remoteId; save(); } },
    onToken(token){ if(!state.generating||!state.activeBubble)return; state.activeBubble.textContent += token; scrollBottom(false); },
    onDone(){ const c=active(); if(state.activeBubble){ state.activeBubble.classList.remove('typing-cursor'); const text=state.activeBubble.textContent.trim(); if(text && c){c.messages.push({role:'assistant',content:text});save();} } state.activeBubble=null; setGenerating(false); setTiko('point'); setTimeout(()=>setTiko('wave'),1100); },
    onError(code,message){ if(state.activeBubble){ state.activeBubble.classList.remove('typing-cursor'); state.activeBubble.textContent=message||'Je n’ai pas pu répondre pour le moment.'; const c=active(); if(c){c.messages.push({role:'assistant',content:state.activeBubble.textContent});save();} } state.activeBubble=null; setGenerating(false); setTiko('wave'); if(code==='cloud_not_connected'||code==='provider_not_configured') els.notice.classList.add('show'); },
    onEngineStatus(status){ state.engine=status; els.notice.classList.toggle('show',status!=='ready'); }
  };

  window.PratikoVoice={
    onAvailability(ok){ els.mic.style.opacity=ok?'1':'.45'; }, onState(status){ setVoiceUi(status); },
    onTranscript(role,text){ if(!text)return; els.voicePanel.classList.add('show'); if(role==='user'){ els.voiceState.textContent='TU PARLES'; els.voiceTitle.textContent='Tiko t’écoute'; els.voiceTranscript.textContent=text; } else { els.voiceState.textContent='TIKO RÉPOND'; els.voiceTitle.textContent='Conversation en direct'; els.voiceTranscript.textContent=text; setTiko('point'); } },
    onError(message){ setVoiceUi('idle'); showToast(message||'Le mode vocal est indisponible.'); }
  };

  $('#menuBtn').onclick=openDrawer; $('#closeDrawer').onclick=closeDrawer; els.scrim.onclick=()=>{closeDrawer();closeSheet();};
  $('#newChatTop').onclick=()=>newChat(); $('#newChatDrawer').onclick=()=>newChat(); $('#modelBtn').onclick=openSheet;
  $('#plusPreview').onclick=$('#plusOption').onclick=()=>{closeSheet();showToast('Pratiko AI Plus arrive bientôt ✦');};
  $('#settingsBtn').onclick=()=>showToast('Réglages avancés bientôt disponibles');
  $('#attachBtn').onclick=()=>showToast('Photos et fichiers arrivent bientôt');
  $('#micBtn').onclick=()=>{ try{ window.PraticoNative?.toggleVoice?.(); }catch{ showToast('Le mode vocal nécessite l’application Android.'); } };
  $('#voiceClose').onclick=()=>{ try{ window.PraticoNative?.stopVoice?.(); }catch{} setVoiceUi('idle'); };
  els.composer.addEventListener('submit',e=>{e.preventDefault();send();}); els.input.addEventListener('input',resize); els.input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}); $$('.suggestions button,.chips button').forEach(b=>b.onclick=()=>send(b.dataset.prompt));
  load(); refreshStatus(); setVoiceUi('idle'); setTimeout(refreshStatus,500); setTimeout(refreshImageQuota,850);
})();