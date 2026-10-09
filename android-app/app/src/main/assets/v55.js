(() => {
  let scheduled = false;

  function addLayer(img){
    if(!img || img.dataset.v55 === '1') return;
    const host = img.parentElement;
    if(!host) return;
    img.dataset.v55 = '1';
    host.classList.add('tiko-safe-host','tiko-idle');

    const layer = document.createElement('div');
    layer.className = 'tiko-safe-layer';
    layer.innerHTML = '<span class="tiko-lid left"></span><span class="tiko-lid right"></span><span class="tiko-talk-mouth"></span><span class="tiko-think-brow left"></span><span class="tiko-think-brow right"></span>';
    host.appendChild(layer);
  }

  function state(){
    const cursor = document.querySelector('.message.assistant .typing-cursor');
    if(cursor) return (cursor.textContent || '').trim() ? 'speaking' : 'thinking';
    const voiceState = (document.querySelector('#voiceState')?.textContent || '').toUpperCase();
    const voiceTitle = (document.querySelector('#voiceTitle')?.textContent || '').toLowerCase();
    if(voiceState.includes('TIKO RÉPOND')) return 'speaking';
    if(voiceTitle.includes('prépare')) return 'thinking';
    return 'idle';
  }

  function setState(host, s){
    if(!host) return;
    host.classList.remove('tiko-idle','tiko-speaking','tiko-thinking');
    host.classList.add('tiko-' + s);
  }

  function sync(){
    scheduled = false;
    document.querySelectorAll('#tikoHero.tiko-original-hero, .assistant-avatar img.tiko-original-chat').forEach(addLayer);
    const s = state();
    document.querySelectorAll('.tiko-safe-host').forEach(h => setState(h,'idle'));

    const rows = [...document.querySelectorAll('.message.assistant')];
    if(rows.length){
      const active = rows[rows.length-1].querySelector('.tiko-safe-host');
      if(active) setState(active,s);
    } else {
      const hero = document.querySelector('#tikoHero.tiko-original-hero')?.parentElement;
      if(hero?.classList.contains('tiko-safe-host')) setState(hero,s);
    }
  }

  function schedule(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  function init(){
    sync();
    const root = document.querySelector('#app') || document.body;
    new MutationObserver(schedule).observe(root,{subtree:true,childList:true,characterData:true});
    window.addEventListener('resize',schedule,{passive:true});
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) schedule(); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
