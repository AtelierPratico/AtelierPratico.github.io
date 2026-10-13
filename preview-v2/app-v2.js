const API_URL='https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/chat';
const SUPABASE_KEY='sb_publishable_r5V4Ho47PYYK02Pw-MQotg_ySxoBS3p';
const DEVICE_KEY='clicia_device_id';
const state={messages:[],generating:false,controller:null,conversationId:null};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

function deviceId(){
  let id=localStorage.getItem(DEVICE_KEY);
  if(!id){id=(crypto.randomUUID?.()||('clicia-'+Date.now()+'-'+Math.random().toString(36).slice(2)));localStorage.setItem(DEVICE_KEY,id)}
  return id
}
function add(role,text=''){
  const r=document.createElement('div');r.className='msg '+role;
  if(role==='assistant'){const a=document.createElement('div');a.className='bubbleav';r.appendChild(a)}
  const c=document.createElement('div');c.className='content';c.textContent=text;r.appendChild(c);
  $('#messages').appendChild(r);r.scrollIntoView({behavior:'smooth',block:'nearest'});return c
}
function setPlan(plan='free'){
  const u=$('#usageState');if(u)u.textContent=plan==='plus'?'Clicia+ actif':'Texte illimité · Sans compte';
  if($('#accountBtn'))$('#accountBtn').textContent=plan==='plus'?'Clicia+ actif':'Activer Clicia+'
}
function status(v){
  state.generating=v;window.__clicThinking=v;
  if($('#sendBtn'))$('#sendBtn').textContent=v?'■':'↑';
  if($('#engineState'))$('#engineState').textContent=v?'Clic réfléchit…':'Clic IA prêt';
  window.TikoV2?.thinking(v)
}
function quick(t){
  t=t.toLowerCase().trim().replace(/[!?.,]/g,'');
  if(/^(allo+|salut|bonjour|bonsoir|hey+|yo+|coucou|hello)$/.test(t))return 'Salut 👋 Moi c’est Clic. Qu’est-ce qu’on arrange aujourd’hui?';
  if(/^(ca va|ça va|comment ca va|comment ça va|tu vas bien)$/.test(t))return 'Oui 😄 Toujours prêt. Et toi?';
  if(/^(merci|merci beaucoup|thanks)$/.test(t))return 'Avec plaisir 😊';
  return null
}
function clearDemo(){document.querySelector('.demo-user')?.remove();document.querySelector('.demo-answer')?.remove()}

async function send(raw){
  const inp=$('#chatInput'),text=(raw??inp?.value??'').trim();if(!text)return;
  if(state.generating){state.controller?.abort();return}
  clearDemo();
  add('user',text);state.messages.push({role:'user',content:text});if(inp)inp.value='';
  $('#hero-chat')?.scrollIntoView({behavior:'smooth',block:'center'});
  const q=quick(text);if(q){setTimeout(()=>{add('assistant',q);state.messages.push({role:'assistant',content:q})},120);return}
  const b=add('assistant','');b.classList.add('typing');status(true);state.controller=new AbortController();
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
          try{const o=JSON.parse(data);if(o.plan)setPlan(o.plan);const d=o.delta??o.text??'';if(d){full+=d;b.textContent=full}}catch{}
        }
      }
    }else{
      const d=await r.json().catch(async()=>({text:await r.text()}));full=d.text||d.output_text||'Réponse reçue.';b.textContent=full
    }
    b.classList.remove('typing');if(full)state.messages.push({role:'assistant',content:full})
  }catch(e){
    b.classList.remove('typing');
    b.textContent=e.name==='AbortError'?'Réponse interrompue.':(e.message||'Clic n’a pas réussi à se connecter pour le moment.')
  }finally{status(false);state.controller=null}
}

$('#heroAsk')?.addEventListener('submit',e=>{e.preventDefault();const i=$('#heroInput'),v=i?.value.trim();if(v){i.value='';send(v)}});
$('#chatForm')?.addEventListener('submit',e=>{e.preventDefault();send()});
$('#chatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
$$('[data-prompt]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.prompt)));
window.addEventListener('clicia-premium-change',e=>setPlan(e.detail?.active?'plus':'free'));
setPlan(window.CliciaPremium?.isActive?.()?'plus':'free');status(false);
