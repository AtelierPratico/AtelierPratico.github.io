(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const els = {
    drawer: $('#drawer'), scrim: $('#scrim'), messages: $('#messages'), empty: $('#emptyState'),
    input: $('#input'), composer: $('#composer'), send: $('#sendBtn'), history: $('#historyList'),
    sheet: $('#modelSheet'), toast: $('#toast'), notice: $('#cloudNotice'), tiko: $('#tikoHero')
  };
  const state = { chats: [], activeId: null, generating: false, activeBubble: null, engine: 'setup' };
  const STORAGE = 'pratiko_chats_v3', ACTIVE = 'pratiko_active_v3';

  function id(){ return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function load(){
    try {
      const newer = localStorage.getItem(STORAGE);
      const legacy = localStorage.getItem('pratico_chats_v2');
      state.chats = JSON.parse(newer || legacy || '[]');
    } catch { state.chats=[]; }
    if(!state.chats.length) newChat(false); else state.activeId = localStorage.getItem(ACTIVE) || localStorage.getItem('pratico_active_v2') || state.chats[0].id;
    render();
  }
  function save(){ localStorage.setItem(STORAGE, JSON.stringify(state.chats.slice(0,50))); if(state.activeId) localStorage.setItem(ACTIVE,state.activeId); }
  function active(){ return state.chats.find(c=>c.id===state.activeId); }
  function newChat(doRender=true){ const c={id:id(),remoteId:null,title:'Nouvelle discussion',created:Date.now(),messages:[]}; state.chats.unshift(c); state.activeId=c.id; save(); if(doRender) render(); closeDrawer(); setTiko('wave'); }
  function titleFrom(text){ return text.replace(/\s+/g,' ').trim().slice(0,46) || 'Nouvelle discussion'; }
  function renderHistory(){ els.history.innerHTML=''; state.chats.forEach(c=>{ const b=document.createElement('button'); b.className='history-item'+(c.id===state.activeId?' active':''); b.textContent=c.title; b.onclick=()=>{state.activeId=c.id; save(); render(); closeDrawer();}; els.history.appendChild(b); }); }
  function render(){ renderHistory(); const c=active(); els.messages.innerHTML=''; const has=!!c?.messages.length; els.empty.style.display=has?'none':'flex'; els.messages.style.display=has?'flex':'none'; if(has) c.messages.forEach(m=>appendMessage(m.role,m.content,false)); scrollBottom(false); }
  function appendMessage(role,text,animate=true){
    const row=document.createElement('div'); row.className='message '+role;
    if(role==='assistant'){
      const av=document.createElement('div'); av.className='assistant-avatar';
      const img=document.createElement('img'); img.src='tiko-avatar.svg'; img.alt='Tiko'; av.appendChild(img); row.appendChild(av);
    }
    const b=document.createElement('div'); b.className='bubble'; b.textContent=text||''; row.appendChild(b); els.messages.appendChild(row); if(animate) scrollBottom(); return b;
  }
  function scrollBottom(smooth=true){ requestAnimationFrame(()=>{ const area=$('.chat-area'); if(area) area.scrollTo({top:area.scrollHeight,behavior:smooth?'smooth':'auto'}); }); }
  function showToast(t){ els.toast.textContent=t; els.toast.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>els.toast.classList.remove('show'),2300); }
  function openDrawer(){els.drawer.classList.add('open');els.scrim.classList.add('show');}
  function closeDrawer(){els.drawer.classList.remove('open');els.scrim.classList.remove('show');}
  function openSheet(){els.sheet.classList.add('open');els.scrim.classList.add('show');}
  function closeSheet(){els.sheet.classList.remove('open'); if(!els.drawer.classList.contains('open')) els.scrim.classList.remove('show');}
  function resize(){els.input.style.height='auto'; els.input.style.height=Math.min(120,els.input.scrollHeight)+'px';}
  function setTiko(pose){ if(!els.tiko)return; const src = pose==='think'?'tiko-think.svg':pose==='point'?'tiko-point.svg':'tiko-wave.svg'; els.tiko.src=src; els.tiko.className='tiko-hero '+(pose==='think'?'thinking':pose==='point'?'celebrate':''); }
  function setGenerating(v){ state.generating=v; els.send.disabled=false; els.send.textContent=v?'■':'➤'; setTiko(v?'think':'wave'); }

  function nativeStatus(){ try { return window.PraticoNative?.getEngineStatus?.() || 'preview'; } catch { return 'preview'; } }
  function refreshStatus(){ const s=nativeStatus(); state.engine=s; els.notice.classList.toggle('show',s!=='ready'); }

  function instantReply(text){
    const t=text.toLowerCase().trim().replace(/[!?.,]/g,'');
    if(/^(allo|salut|bonjour|bonsoir|hey|yo|coucou|hello)$/.test(t)) return 'Salut 👋 Moi c’est Tiko. Qu’est-ce que je peux faire pour toi?';
    if(/^(ca va|ça va|comment ca va|comment ça va|tu vas bien)$/.test(t)) return 'Oui 😄 Prêt à t’aider. Et toi?';
    if(/^(merci|merci beaucoup|thanks)$/.test(t)) return 'Avec plaisir 😊';
    return null;
  }

  function send(raw){
    const text=(raw??els.input.value).trim(); if(!text) return;
    if(state.generating){ try{window.PraticoNative?.cancelGeneration?.();}catch{} setGenerating(false); return; }
    let c=active(); if(!c){newChat(false);c=active();}
    c.messages.push({role:'user',content:text}); if(c.messages.length===1)c.title=titleFrom(text); save();
    els.empty.style.display='none'; els.messages.style.display='flex'; appendMessage('user',text); els.input.value=''; resize(); renderHistory();
    const quick=instantReply(text);
    if(quick){ setTiko('point'); setTimeout(()=>{c.messages.push({role:'assistant',content:quick});save();appendMessage('assistant',quick);setTimeout(()=>setTiko('wave'),900);},110); return; }
    const bubble=appendMessage('assistant',''); bubble.classList.add('typing-cursor'); state.activeBubble=bubble; setGenerating(true);
    const payload={conversation_id:c.remoteId||null,plan:'free',messages:c.messages.slice(-20),client:{platform:'android',app:'pratiko-ai',version:'3.0'}};
    try{ if(window.PraticoNative?.sendMessage) window.PraticoNative.sendMessage(JSON.stringify(payload)); else window.PraticoCloud.onError('preview','Le moteur IA n’est pas encore connecté.'); }
    catch(e){ window.PraticoCloud.onError('bridge',e.message||'Erreur de connexion'); }
  }

  window.PraticoCloud={
    onStart(){ setTiko('think'); },
    onConversationId(remoteId){ const c=active(); if(c && remoteId){ c.remoteId=remoteId; save(); } },
    onToken(token){ if(!state.generating||!state.activeBubble)return; state.activeBubble.textContent += token; scrollBottom(false); },
    onDone(){
      const c=active();
      if(state.activeBubble){ state.activeBubble.classList.remove('typing-cursor'); const text=state.activeBubble.textContent.trim(); if(text && c){c.messages.push({role:'assistant',content:text});save();} }
      state.activeBubble=null; setGenerating(false); setTiko('point'); setTimeout(()=>setTiko('wave'),1100);
    },
    onError(code,message){
      if(state.activeBubble){ state.activeBubble.classList.remove('typing-cursor'); state.activeBubble.textContent=message||'Je n’ai pas pu répondre pour le moment.'; const c=active(); if(c){c.messages.push({role:'assistant',content:state.activeBubble.textContent});save();} }
      state.activeBubble=null; setGenerating(false); setTiko('wave');
      if(code==='cloud_not_connected'||code==='provider_not_configured') els.notice.classList.add('show');
    },
    onEngineStatus(status){ state.engine=status; els.notice.classList.toggle('show',status!=='ready'); }
  };

  $('#menuBtn').onclick=openDrawer; $('#closeDrawer').onclick=closeDrawer; els.scrim.onclick=()=>{closeDrawer();closeSheet();};
  $('#newChatTop').onclick=()=>newChat(); $('#newChatDrawer').onclick=()=>newChat(); $('#modelBtn').onclick=openSheet;
  $('#plusPreview').onclick=$('#plusOption').onclick=()=>{closeSheet();showToast('Pratiko AI Plus arrive bientôt ✦');};
  $('#settingsBtn').onclick=()=>showToast('Réglages avancés bientôt disponibles');
  $('#attachBtn').onclick=()=>showToast('Photos et fichiers seront activés avec Plus');
  $('#micBtn').onclick=()=>showToast('Le mode vocal de Tiko est en préparation');
  els.composer.addEventListener('submit',e=>{e.preventDefault();send();});
  els.input.addEventListener('input',resize);
  els.input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
  $$('.suggestions button,.chips button').forEach(b=>b.onclick=()=>send(b.dataset.prompt));
  load(); refreshStatus(); setTimeout(refreshStatus,500);
})();