const API_URL='https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/chat';
const SUPABASE_KEY='sb_publishable_r5V4Ho47PYYK02Pw-MQotg_ySxoBS3p';
const DEVICE_KEY='clicia_device_id';
const BULB_AVATAR_SVG=`<svg viewBox="0 0 60 78" aria-hidden="true"><path class="clic-shell" d="M30 4C13 4 4 16 4 31c0 11 5 18 11 25 4 4 5 8 6 13h18c1-5 2-9 6-13 6-7 11-14 11-25C56 16 47 4 30 4Z" fill="#17181a"/><ellipse class="clic-eye clic-eye-l" cx="23" cy="30" rx="6" ry="11" fill="#fff"/><ellipse class="clic-eye clic-eye-r" cx="37" cy="30" rx="6" ry="11" fill="#fff"/><circle class="clic-pupil clic-pupil-l" cx="25" cy="32" r="3" fill="#17181a"/><circle class="clic-pupil clic-pupil-r" cx="39" cy="32" r="3" fill="#17181a"/><rect class="clic-base" x="19" y="64" width="22" height="7" rx="3.5" fill="#17181a"/><rect class="clic-base" x="22" y="72" width="16" height="4" rx="2" fill="#17181a"/></svg>`;
const state={messages:[],generating:false,controller:null,conversationId:null};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

function deviceId(){
  let id=localStorage.getItem(DEVICE_KEY);
  if(!id){id=(crypto.randomUUID?.()||('clicia-'+Date.now()+'-'+Math.random().toString(36).slice(2)));localStorage.setItem(DEVICE_KEY,id)}
  return id
}
function hydrateAvatars(){
  $$('.bubbleav,.chat-avatar').forEach(a=>{a.innerHTML=BULB_AVATAR_SVG;a.classList.add('is-idle')});
}
function mascotState(el,next){
  if(!el)return;
  el.classList.remove('is-idle','is-thinking','is-speaking','is-success','is-error');
  el.classList.add('is-'+next)
}
function bigMascotState(next){
  const el=$('#tikoCharacter');if(!el)return;
  el.classList.remove('speaking','success','error');
  if(next==='thinking'){window.TikoV3?.thinking?.(true);return}
  window.TikoV3?.thinking?.(false);
  if(next==='speaking')el.classList.add('speaking');
  if(next==='success'){el.classList.add('success');setTimeout(()=>el.classList.remove('success'),900)}
  if(next==='error'){el.classList.add('error');setTimeout(()=>el.classList.remove('error'),650)}
}
function avatarForContent(content){return content?.parentElement?.querySelector('.bubbleav')||null}
function conversationState(next,avatar=null){
  mascotState($('.chat-avatar'),next);
  if(avatar)mascotState(avatar,next);
  bigMascotState(next)
}
function settleMascot(avatar=null,delay=900){
  setTimeout(()=>{mascotState($('.chat-avatar'),'idle');if(avatar)mascotState(avatar,'idle');bigMascotState('idle')},delay)
}
function add(role,text=''){
  const r=document.createElement('div');r.className='msg '+role;
  if(role==='assistant'){const a=document.createElement('div');a.className='bubbleav is-idle';a.innerHTML=BULB_AVATAR_SVG;r.appendChild(a)}
  const c=document.createElement('div');c.className='content';c.textContent=text;r.appendChild(c);
  $('#messages').appendChild(r);r.scrollIntoView({behavior:'smooth',block:'nearest'});return c
}
function setPlan(plan='free'){
  const isPlus=plan==='plus';
  const plus=$('#chatPremiumPlus');if(plus){plus.hidden=!isPlus;plus.setAttribute('aria-hidden',isPlus?'false':'true')}
  if($('#accountBtn'))$('#accountBtn').textContent=isPlus?'ClicIA+ actif':'Activer ClicIA+'
}
function status(v){
  state.generating=v;window.__clicThinking=v;
  if($('#sendBtn'))$('#sendBtn').textContent=v?'■':'↑';
  if($('#engineState'))$('#engineState').textContent=v?'Clic réfléchit…':'';
}
function quick(t){
  t=t.toLowerCase().trim().replace(/[!?.,]/g,'');
  if(/^(allo+|salut|bonjour|bonsoir|hey+|yo+|coucou|hello)$/.test(t))return 'Salut 👋 Moi c’est Clic. Qu’est-ce qu’on arrange aujourd’hui?';
  if(/^(ca va|ça va|comment ca va|comment ça va|tu vas bien)$/.test(t))return 'Oui 😄 Toujours prêt. Et toi?';
  if(/^(merci|merci beaucoup|thanks)$/.test(t))return 'Avec plaisir 😊';
  return null
}
function clearDemo(){document.querySelector('.demo-user')?.remove();document.querySelector('.demo-answer')?.remove()}

async function quickReply(text){
  const c=add('assistant','');const a=avatarForContent(c);conversationState('thinking',a);
  await new Promise(r=>setTimeout(r,260));conversationState('speaking',a);
  c.textContent=text;state.messages.push({role:'assistant',content:text});
  await new Promise(r=>setTimeout(r,420));conversationState('success',a);settleMascot(a)
}

async function send(raw){
  const inp=$('#chatInput'),text=(raw??inp?.value??'').trim();if(!text)return;
  if(state.generating){state.controller?.abort();return}
  clearDemo();
  add('user',text);state.messages.push({role:'user',content:text});if(inp)inp.value='';
  $('#hero-chat')?.scrollIntoView({behavior:'smooth',block:'center'});
  const q=quick(text);if(q){quickReply(q);return}
  const b=add('assistant','');const avatar=avatarForContent(b);b.classList.add('typing');status(true);conversationState('thinking',avatar);state.controller=new AbortController();
  let startedSpeaking=false;
  try{
    const headers={
      'Content-Type':'application/json',
      'Accept':'text/event-stream, application/json',
      'apikey':SUPABASE_KEY,
      'X-Clicia-Device':deviceId()
    };
    const code=window.CliciaPremium?.currentCode?.();if(code)headers['X-Clicia-Code']=code;
    const r=await fetch(API_URL,{method:'POST',headers,body:JSON.stringify({messages:state.messages.slice(-20),conversation_id:state.conversationId}),signal:state.controller.signal});
    const conversation=r.headers.get('X-Clic-Conversation-ID');if(conversation)state.conversationId=conversation;
    const plan=(r.headers.get('X-Clicia-Plan')||'free').toLowerCase();setPlan(plan);
    if(!r.ok){const err=await r.json().catch(()=>({message:`Erreur ${r.status}`}));throw new Error(err.message||'Clic n’a pas pu répondre pour le moment.')}
    const type=(r.headers.get('content-type')||'').toLowerCase();let full='';
    if(type.includes('text/event-stream')&&r.body){
      const rd=r.body.getReader(),dec=new TextDecoder();let buf='';
      while(true){
        const {value,done}=await rd.read();if(done)break;
        buf+=dec.decode(value,{stream:true});const lines=buf.split('\n');buf=lines.pop()||'';
        for(const line of lines){
          if(!line.startsWith('data:'))continue;const data=line.slice(5).trim();if(!data||data==='[DONE]')continue;
          try{const o=JSON.parse(data);if(o.plan)setPlan(o.plan);const d=o.delta??o.text??'';if(d){if(!startedSpeaking){startedSpeaking=true;conversationState('speaking',avatar)}full+=d;b.textContent=full}}catch{}
        }
      }
    }else{
      const d=await r.json().catch(async()=>({text:await r.text()}));full=d.text||d.output_text||'Réponse reçue.';if(!startedSpeaking){startedSpeaking=true;conversationState('speaking',avatar)}b.textContent=full
    }
    b.classList.remove('typing');if(full)state.messages.push({role:'assistant',content:full});conversationState('success',avatar);settleMascot(avatar)
  }catch(e){
    b.classList.remove('typing');
    b.textContent=e.name==='AbortError'?'Réponse interrompue.':(e.message||'Clic n’a pas réussi à se connecter pour le moment.');conversationState(e.name==='AbortError'?'idle':'error',avatar);settleMascot(avatar,800)
  }finally{status(false);state.controller=null}
}

$('#heroAsk')?.addEventListener('submit',e=>{e.preventDefault();const i=$('#heroInput'),v=i?.value.trim();if(v){i.value='';send(v)}});
$('#chatForm')?.addEventListener('submit',e=>{e.preventDefault();send()});
$('#chatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
$$('[data-prompt]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.prompt)));
window.addEventListener('clicia-premium-change',e=>setPlan(e.detail?.active?'plus':'free'));
hydrateAvatars();
setPlan(window.CliciaPremium?.isActive?.()?'plus':'free');conversationState('idle');status(false);
