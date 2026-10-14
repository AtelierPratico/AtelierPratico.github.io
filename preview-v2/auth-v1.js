(()=>{
  const SUPABASE_KEY='sb_publishable_r5V4Ho47PYYK02Pw-MQotg_ySxoBS3p';
  const ACCESS_URL='https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/premium-access';
  const STORAGE_KEY='clicia_plus_code';
  const state={active:false,code:'',accountId:'',imageDeviceId:'',expiresAt:null};
  const $=s=>document.querySelector(s);
  const modal=$('#authModal');
  const accountBtn=$('#accountBtn');

  function normalized(v=''){return String(v).toUpperCase().trim().replace(/\s+/g,'')}
  function currentCode(){return state.active?state.code:''}
  function isActive(){return state.active}
  function imageDeviceId(){return state.active?state.imageDeviceId:''}
  function dispatch(){window.dispatchEvent(new CustomEvent('clicia-premium-change',{detail:{active:state.active,plan:state.active?'plus':'free'}}))}

  function unlockFreeChat(){
    $('#authGate')?.classList.add('hidden');
    const composer=$('.hero-composer');composer?.classList.remove('locked');
    const input=$('#chatInput');if(input){input.disabled=false;input.placeholder='Écris ta question ici…';}
    const send=$('#sendBtn');if(send)send.disabled=false;
    document.querySelectorAll('[data-prompt]').forEach(b=>b.disabled=false);
  }

  function render(){
    unlockFreeChat();
    if(accountBtn){
      accountBtn.textContent=state.active?'ClicIA+ actif':'Activer ClicIA+';
      accountBtn.classList.toggle('logged-in',state.active);
    }
    const usage=$('#usageState');if(usage)usage.textContent=state.active?'ClicIA+ actif':'Texte illimité · Sans compte';
    const engine=$('#engineState');if(engine&&!window.__clicThinking)engine.textContent='Clic IA prêt';
    dispatch();
  }

  function buildModal(){
    const card=modal?.querySelector('.auth-card');if(!card)return;
    card.innerHTML=`
      <button class="auth-close" id="authClose" type="button" aria-label="Fermer">×</button>
      <div class="auth-brand">
        <span class="auth-brand-bulb"><svg viewBox="0 0 60 78"><path d="M30 4C13 4 4 16 4 31c0 11 5 18 11 25 4 4 5 8 6 13h18c1-5 2-9 6-13 6-7 11-14 11-25C56 16 47 4 30 4Z" fill="#17181a"/><ellipse cx="23" cy="30" rx="6" ry="11" fill="#fff"/><ellipse cx="37" cy="30" rx="6" ry="11" fill="#fff"/><circle cx="25" cy="32" r="3" fill="#17181a"/><circle cx="39" cy="32" r="3" fill="#17181a"/></svg></span>
        <strong>CLIC IA</strong><em>par Clicia</em>
      </div>
      <div id="premiumInactive">
        <h2 class="auth-title">Activer ClicIA+</h2>
        <p class="auth-subtitle">Le chat texte est gratuit et sans compte. Avec ClicIA+, ton code d’abonnement devient ton compte et débloque les fonctions premium, dont les images.</p>
        <form id="premiumForm">
          <label class="auth-field"><span>Code ClicIA+</span><input id="premiumCode" type="text" autocomplete="off" placeholder="CLICIA-XXXX-XXXX" spellcheck="false" required></label>
          <button class="auth-submit" id="premiumSubmit" type="submit">Activer mon abonnement</button>
          <div class="auth-message" id="premiumMessage"></div>
          <p class="auth-note">Aucun courriel ni mot de passe requis. Garde ton code : c’est ta clé de compte ClicIA+.</p>
        </form>
      </div>
      <div class="account-view" id="premiumActive">
        <h2 class="auth-title">ClicIA+ est actif</h2>
        <p class="auth-subtitle">Ton code est reconnu sur cet appareil. Tu peux le réutiliser sur un autre appareil pour retrouver ton accès ClicIA+.</p>
        <div class="account-meta"><div><strong>ClicIA+</strong><span>Forfait actuel</span></div><div><strong>✓</strong><span>Images débloquées</span></div></div>
        <button class="signout-btn" id="premiumForget" type="button">Retirer le code de cet appareil</button>
      </div>`;

    $('#authClose')?.addEventListener('click',close);
    $('#premiumForm')?.addEventListener('submit',async e=>{
      e.preventDefault();
      const input=$('#premiumCode');const code=normalized(input?.value||'');
      const msg=$('#premiumMessage'),btn=$('#premiumSubmit');
      if(code.length<10){if(msg){msg.textContent='Entre ton code ClicIA+.';msg.className='auth-message error';}return;}
      if(btn)btn.disabled=true;if(msg){msg.textContent='Vérification…';msg.className='auth-message';}
      const ok=await validate(code,true);
      if(btn)btn.disabled=false;
      if(ok){if(msg){msg.textContent='ClicIA+ activé.';msg.className='auth-message success';}setTimeout(close,500)}
    });
    $('#premiumForget')?.addEventListener('click',()=>{
      localStorage.removeItem(STORAGE_KEY);state.active=false;state.code='';state.accountId='';state.imageDeviceId='';state.expiresAt=null;render();showMode();
    });
    showMode();
  }

  function showMode(){
    const a=$('#premiumInactive'),b=$('#premiumActive');
    if(a)a.style.display=state.active?'none':'block';
    b?.classList.toggle('visible',state.active);
  }
  function open(){buildModal();showMode();modal?.classList.add('open');modal?.setAttribute('aria-hidden','false')}
  function close(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true')}

  async function validate(raw,surfaceError=false){
    const code=normalized(raw);if(!code)return false;
    try{
      const r=await fetch(ACCESS_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},body:JSON.stringify({code})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.valid)throw new Error(d.message||'Code invalide.');
      state.active=true;state.code=code;state.accountId=d.account_id||'';state.imageDeviceId=d.image_device_id||'';state.expiresAt=d.expires_at||null;
      localStorage.setItem(STORAGE_KEY,code);render();showMode();return true;
    }catch(err){
      state.active=false;state.code='';state.accountId='';state.imageDeviceId='';state.expiresAt=null;localStorage.removeItem(STORAGE_KEY);render();showMode();
      if(surfaceError){const msg=$('#premiumMessage');if(msg){msg.textContent=err?.message||'Ce code ClicIA+ n’est pas valide.';msg.className='auth-message error';}}
      return false;
    }
  }

  accountBtn?.addEventListener('click',open);
  modal?.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

  const welcome=$('#messages .welcome .content');if(welcome)welcome.innerHTML='Bonjour ! 👋<br>Je suis Clic, votre assistant IA.<br>Posez-moi vos questions gratuitement, sans compte.';
  unlockFreeChat();render();
  const stored=localStorage.getItem(STORAGE_KEY);if(stored)validate(stored,false);

  window.CliciaPremium={isActive,currentCode,imageDeviceId,open,close,validate,SUPABASE_KEY};
})();
