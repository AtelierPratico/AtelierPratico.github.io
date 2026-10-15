(()=>{
  const $=s=>document.querySelector(s);
  const input=$('#storeSearch');
  const filterBtn=$('#storeFilterBtn');
  const panel=$('#storeFilterPanel');
  const empty=$('#storeSearchEmpty');
  const headerSearch=$('#headerSearchBtn');
  let category='all';

  function cards(){return [...document.querySelectorAll('#productGrid .product-card')]}
  function norm(v=''){
    return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  }

  function apply(){
    const q=norm(input?.value||'');
    let visible=0;
    cards().forEach(card=>{
      const hay=norm(card.textContent||'');
      const cat=card.dataset.category||'';
      const okText=!q||hay.includes(q);
      const okCat=category==='all'||cat===category;
      const show=okText&&okCat;
      card.classList.toggle('store-hidden',!show);
      if(show)visible++;
    });
    if(empty)empty.hidden=visible!==0;
  }

  function setOpen(open){
    if(!panel||!filterBtn)return;
    panel.hidden=!open;
    filterBtn.setAttribute('aria-expanded',open?'true':'false');
  }

  input?.addEventListener('input',apply);
  filterBtn?.addEventListener('click',()=>setOpen(filterBtn.getAttribute('aria-expanded')!=='true'));

  panel?.querySelectorAll('[data-store-category]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      category=btn.dataset.storeCategory||'all';
      panel.querySelectorAll('[data-store-category]').forEach(b=>b.classList.toggle('active',b===btn));
      apply();
      setOpen(false);
    });
  });

  document.addEventListener('click',e=>{
    if(!panel||panel.hidden||!filterBtn)return;
    if(panel.contains(e.target)||filterBtn.contains(e.target))return;
    setOpen(false);
  });

  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
  window.addEventListener('clicia-catalog-rendered',apply);

  headerSearch?.addEventListener('click',()=>{
    $('#boutique')?.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>input?.focus({preventScroll:true}),450);
  });
})();
