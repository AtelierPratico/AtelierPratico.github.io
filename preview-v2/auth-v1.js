(()=>{
  const SUPABASE_URL='https://ibrtukocutdaxyltrmhk.supabase.co';
  const SUPABASE_KEY='sb_publishable_r5V4Ho47PYYK02Pw-MQotg_ySxoBS3p';
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  let session=null;
  const $=s=>document.querySelector(s);
  const modal=$('#authModal'),accountBtn=$('#accountBtn'),gate=$('#authGate'),form=$('#authForm'),message=$('#authMessage');
  const loginTab=$('#authLoginTab'),signupTab=$('#authSignupTab'),nameWrap=$('#authNameWrap'),submit=$('#authSubmit');
  const authFormView=$('#authFormView'),accountView=$('#accountView'),accountEmail=$('#accountEmail'),accountUsage=$('#accountUsage');
  const chatInput=$('#chatInput'),sendBtn=$('#sendBtn'),composer=$('.hero-composer');
  let mode='login';

  function setMessage(text='',type=''){
    if(!message)return;
    message.textContent=text;message.className='auth-message'+(type?' '+type:'');
  }
  function setMode(next){
    mode=next;
    loginTab?.classList.toggle('active',mode==='login');
    signupTab?.classList.toggle('active',mode==='signup');
    nameWrap?.classList.toggle('hidden',mode!=='signup');
    if(submit)submit.textContent=mode==='signup'?'Créer mon compte':'Se connecter';
    setMessage('');
  }
  function open(next){
    if(next)setMode(next);
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden','false');
  }
  function close(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true')}
  function currentSession(){return session}
  async function getSession(){
    const {data}=await client.auth.getSession();session=data.session||null;return session;
  }
  function dispatch(){window.dispatchEvent(new CustomEvent('clicia-auth-change',{detail:{session}}))}
  function render(){
    const logged=!!session;
    if(accountBtn){
      accountBtn.textContent=logged?(session.user.email?.split('@')[0]||'Mon compte'):'Mon compte';
      accountBtn.classList.toggle('logged-in',logged);
    }
    gate?.classList.toggle('hidden',logged);
    composer?.classList.toggle('locked',!logged);
    if(chatInput){chatInput.disabled=!logged;chatInput.placeholder=logged?'Écris ta question ici…':'Connecte-toi pour utiliser Clic IA';}
    if(sendBtn)sendBtn.disabled=!logged;
    document.querySelectorAll('[data-prompt]').forEach(b=>b.disabled=!logged);
    if(authFormView)authFormView.style.display=logged?'none':'block';
    accountView?.classList.toggle('visible',logged);
    if(accountEmail)accountEmail.textContent=session?.user?.email||'';
    if(accountUsage)accountUsage.textContent=logged?'30':'—';
    const engine=$('#engineState');if(engine&&!window.__clicThinking)engine.textContent=logged?'Clic IA prêt':'Connexion requise';
    dispatch();
  }

  loginTab?.addEventListener('click',()=>setMode('login'));
  signupTab?.addEventListener('click',()=>setMode('signup'));
  $('#authClose')?.addEventListener('click',close);
  modal?.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  accountBtn?.addEventListener('click',()=>open(session?'account':'login'));
  $('#authGateBtn')?.addEventListener('click',()=>open('signup'));

  form?.addEventListener('submit',async e=>{
    e.preventDefault();setMessage('');
    const email=$('#authEmail')?.value.trim()||'';
    const password=$('#authPassword')?.value||'';
    const displayName=$('#authName')?.value.trim()||'';
    if(!email||password.length<6){setMessage('Entre un courriel valide et un mot de passe d’au moins 6 caractères.','error');return}
    submit.disabled=true;
    try{
      if(mode==='signup'){
        const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:displayName||email.split('@')[0]},emailRedirectTo:location.origin+location.pathname}});
        if(error)throw error;
        session=data.session||null;
        if(session){setMessage('Compte créé. Tu es maintenant connecté.','success');render();setTimeout(close,500)}
        else setMessage('Compte créé. Vérifie ton courriel pour confirmer ton adresse, puis reviens te connecter.','success');
      }else{
        const {data,error}=await client.auth.signInWithPassword({email,password});
        if(error)throw error;
        session=data.session||null;render();setMessage('Connexion réussie.','success');setTimeout(close,400);
      }
    }catch(err){setMessage(err?.message||'Impossible de terminer la connexion.','error')}
    finally{submit.disabled=false}
  });

  $('#signOutBtn')?.addEventListener('click',async()=>{await client.auth.signOut();session=null;render();close()});

  client.auth.onAuthStateChange((_event,newSession)=>{session=newSession;render()});
  getSession().then(render);

  window.CliciaAuth={client,getSession,currentSession,open,close,SUPABASE_KEY};
})();
