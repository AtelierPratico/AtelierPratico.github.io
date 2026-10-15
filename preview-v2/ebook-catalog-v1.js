(()=>{
  const SUPABASE_KEY='sb_publishable_r5V4Ho47PYYK02Pw-MQotg_ySxoBS3p';
  const CATALOG_URL='https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/ebook-catalog';
  const DOWNLOAD_URL='https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/ebook-download';
  const grid=document.querySelector('#productGrid');
  if(!grid)return;

  const money=(cents,currency='CAD')=>new Intl.NumberFormat('fr-CA',{style:'currency',currency}).format((Number(cents)||0)/100);
  const esc=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const categoryLabel=v=>({maison:'Maison & bricolage',animaux:'Animaux',cuisine:'Cuisine & recettes',technologie:'Technologie',education:'Éducation & formation',business:'Business & finances',bienetre:'Santé & bien-être',creativite:'Créativité & design'}[v]||v||'eBook');

  async function downloadFree(product,btn){
    const old=btn.textContent;btn.disabled=true;btn.textContent='Préparation…';
    try{
      const headers={'Content-Type':'application/json','apikey':SUPABASE_KEY};
      const code=window.CliciaPremium?.currentCode?.();if(code)headers['x-clicia-code']=code;
      const r=await fetch(DOWNLOAD_URL,{method:'POST',headers,body:JSON.stringify({product_id:product.id})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.url)throw new Error(d.message||'Téléchargement indisponible.');
      window.open(d.url,'_blank','noopener');
    }catch(err){alert(err?.message||'Téléchargement indisponible.');}
    finally{btn.disabled=false;btn.textContent=old;}
  }

  function card(product){
    const article=document.createElement('article');
    article.className='product-card catalog-product';
    article.dataset.category=product.category||'';
    article.dataset.productId=product.id;
    const cover=product.cover_url
      ? `<img src="${esc(product.cover_url)}" alt="Couverture de ${esc(product.title)}" loading="lazy">`
      : `<div class="catalog-cover-fallback">CLICIA<br>${esc(categoryLabel(product.category).toUpperCase())}</div>`;
    const price=money(product.price_cents,product.currency||'CAD');
    const free=Number(product.price_cents||0)===0;
    article.innerHTML=`
      <div class="catalog-cover">${cover}<span class="catalog-badge">${esc(categoryLabel(product.category))}</span></div>
      <div class="catalog-body">
        <div class="catalog-title">${esc(product.title)}</div>
        <div class="catalog-subtitle">${esc(product.subtitle||'Guide numérique ClicIA')}</div>
        ${product.description?`<div class="catalog-description">${esc(product.description)}</div>`:''}
        <div class="catalog-footer">
          <span class="catalog-price">${free?'Gratuit':price}</span>
          <button class="catalog-action" type="button" ${free?'':'disabled'}>${free?'Télécharger':'Paiement bientôt'}</button>
        </div>
      </div>`;
    const btn=article.querySelector('.catalog-action');
    if(free&&btn)btn.addEventListener('click',()=>downloadFree(product,btn));
    return article;
  }

  async function load(){
    try{
      const r=await fetch(CATALOG_URL,{headers:{apikey:SUPABASE_KEY}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!Array.isArray(d.products))return;
      window.__cliciaCatalogProducts=d.products;
      if(!d.products.length)return;
      grid.querySelectorAll('.product-card').forEach(el=>el.remove());
      const empty=grid.querySelector('#storeSearchEmpty');
      d.products.forEach(p=>grid.insertBefore(card(p),empty||null));
      window.dispatchEvent(new CustomEvent('clicia-catalog-rendered',{detail:{count:d.products.length}}));
    }catch{}
  }
  load();
})();
