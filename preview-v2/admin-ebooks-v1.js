import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL='https://ibrtukocutdaxyltrmhk.supabase.co';
const SUPABASE_KEY='sb_publishable_r5V4Ho47PYYK02Pw-MQotg_ySxoBS3p';
const ADMIN_URL=`${SUPABASE_URL}/functions/v1/ebook-admin`;
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const $=s=>document.querySelector(s);
let adminCode='';
let products=[];

const normalize=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,96);
const money=(cents,currency='CAD')=>new Intl.NumberFormat('fr-CA',{style:'currency',currency}).format((Number(cents)||0)/100);
const mb=bytes=>(Number(bytes||0)/1048576);
const esc=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

function status(text,type=''){
  const el=$('#adminStatus');if(!el)return;el.textContent=text;el.className=`status ${type}`.trim();
}
function progress(text){const el=$('#uploadProgress');if(el)el.textContent=text;}

async function api(method='GET',body=null){
  const headers={'apikey':SUPABASE_KEY,'x-clicia-code':adminCode};
  if(body!==null)headers['Content-Type']='application/json';
  const r=await fetch(ADMIN_URL,{method,headers,body:body===null?undefined:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.message||d.detail||d.error||'Une erreur est survenue.');
  return d;
}

function storageMeter(){
  const used=products.reduce((n,p)=>n+Number(p.ebook_size_bytes||0)+Number(p.cover_size_bytes||0),0);
  const quota=1024*1024*1024;
  const pct=Math.min(100,(used/quota)*100);
  $('#storageText').textContent=`${mb(used).toFixed(1).replace('.',',')} Mo / 1 Go gratuit`;
  $('#storageFill').style.width=`${pct}%`;
}

function renderProducts(){
  const list=$('#productList');if(!list)return;
  if(!products.length){list.innerHTML='<div class="empty">Aucun produit pour le moment.</div>';storageMeter();return;}
  list.innerHTML='';
  products.forEach(p=>{
    const row=document.createElement('div');row.className='admin-product';
    row.innerHTML=`
      <div class="admin-cover">${p.cover_url?`<img src="${esc(p.cover_url)}" alt="">`:'CLICIA'}</div>
      <div><b>${esc(p.title)}</b><small>${esc(p.status)} · ${esc(p.category)} · ${money(p.price_cents,p.currency)}</small></div>
      <div class="admin-actions">
        <button class="mini" type="button" data-preview>Prévisualiser</button>
        <button class="mini" type="button" data-toggle>${p.status==='published'?'Masquer':'Publier'}</button>
      </div>`;
    row.querySelector('[data-preview]')?.addEventListener('click',async e=>{
      const btn=e.currentTarget,old=btn.textContent;btn.disabled=true;btn.textContent='Ouverture…';
      try{const d=await api('POST',{action:'preview-download',product_id:p.id});window.open(d.url,'_blank','noopener');}
      catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=old;}
    });
    row.querySelector('[data-toggle]')?.addEventListener('click',async e=>{
      const btn=e.currentTarget,old=btn.textContent;btn.disabled=true;
      try{
        const next=p.status==='published'?'draft':'published';
        await api('POST',{action:'update-product',product_id:p.id,status:next});
        await loadProducts();
      }catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=old;}
    });
    list.appendChild(row);
  });
  storageMeter();
}

async function loadProducts(){
  const d=await api('GET');products=Array.isArray(d.products)?d.products:[];renderProducts();
}

async function openAdmin(raw){
  const code=normalize(raw);if(code.length<10){status('Entre ton code propriétaire.','error');return false;}
  adminCode=code;status('Vérification…');
  try{
    await loadProducts();
    localStorage.setItem('clicia_plus_code',code);
    $('#adminArea').classList.remove('locked');
    status('Accès propriétaire confirmé.','ok');
    return true;
  }catch(err){
    adminCode='';$('#adminArea').classList.add('locked');status(err.message||'Accès refusé.','error');return false;
  }
}

$('#adminLogin')?.addEventListener('click',()=>openAdmin($('#adminCode')?.value));
$('#adminCode')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();openAdmin(e.currentTarget.value)}});

$('#ebookForm')?.addEventListener('submit',async e=>{
  e.preventDefault();if(!adminCode)return;
  const ebook=$('#bookFile').files?.[0];const cover=$('#coverFile').files?.[0]||null;
  if(!ebook){progress('Choisis un fichier PDF ou EPUB.');return;}
  if(ebook.size>30*1024*1024){progress('Le fichier dépasse 30 Mo.');return;}
  if(cover&&cover.size>5*1024*1024){progress('La couverture dépasse 5 Mo.');return;}
  const title=$('#bookTitle').value.trim();if(!title){progress('Ajoute un titre.');return;}
  const btn=$('#uploadBtn');btn.disabled=true;
  try{
    progress('1/4 · Préparation du stockage privé…');
    const prep=await api('POST',{
      action:'prepare-upload',title,
      subtitle:$('#bookSubtitle').value.trim(),description:$('#bookDescription').value.trim(),
      category:$('#bookCategory').value,price_cents:Math.round(Math.max(0,Number($('#bookPrice').value||0))*100),currency:'CAD',featured:$('#bookFeatured').checked,
      ebook_filename:ebook.name,ebook_type:ebook.type||(/\.epub$/i.test(ebook.name)?'application/epub+zip':'application/pdf'),ebook_size:ebook.size,
      cover_filename:cover?.name||'',cover_type:cover?.type||'',cover_size:cover?.size||0
    });

    progress('2/4 · Téléversement de l’eBook…');
    const eu=prep.uploads.ebook;
    const ebookUp=await supabase.storage.from(eu.bucket).uploadToSignedUrl(eu.path,eu.token,ebook,{contentType:ebook.type||undefined});
    if(ebookUp.error)throw ebookUp.error;

    if(cover&&prep.uploads.cover){
      progress('3/4 · Téléversement de la couverture…');
      const cu=prep.uploads.cover;
      const coverUp=await supabase.storage.from(cu.bucket).uploadToSignedUrl(cu.path,cu.token,cover,{contentType:cover.type||undefined});
      if(coverUp.error)throw coverUp.error;
    }else progress('3/4 · Aucune couverture à téléverser.');

    progress('4/4 · Publication dans la boutique…');
    await api('POST',{action:'finalize-upload',product_id:prep.product.id,publish:true});
    progress('Publié ✅ Le produit est maintenant relié à la boutique ClicIA.');
    e.currentTarget.reset();$('#bookPrice').value='14.95';$('#bookFeatured').checked=true;
    await loadProducts();
  }catch(err){progress(`Erreur : ${err?.message||'échec du téléversement'}`);}
  finally{btn.disabled=false;}
});

const stored=localStorage.getItem('clicia_plus_code');
if(stored){$('#adminCode').value=stored;openAdmin(stored);}
