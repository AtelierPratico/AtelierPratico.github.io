(() => {
  const ORIGINAL = 'tiko-original.svg';

  function restoreHero() {
    const live = document.querySelector('#tikoLiveHero');
    if (live) live.remove();
    const old = document.querySelector('#tikoHero');
    if (!old) return;
    if (old.dataset.v50 === '1') return;
    const img = document.createElement('img');
    img.id = 'tikoHero';
    img.className = 'tiko-hero tiko-original-hero';
    img.src = ORIGINAL;
    img.alt = 'Tiko';
    img.dataset.v50 = '1';
    old.replaceWith(img);
    img.addEventListener('click', () => {
      img.classList.remove('tiko-tap');
      void img.offsetWidth;
      img.classList.add('tiko-tap');
      setTimeout(() => img.classList.remove('tiko-tap'), 900);
    });
  }

  function restoreAssistant(row) {
    if (!row || !row.classList?.contains('assistant')) return;
    row.querySelectorAll('.tiko-live-host').forEach(el => el.remove());
    const av = row.querySelector('.assistant-avatar');
    if (!av) return;
    let img = av.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = 'Tiko';
      av.appendChild(img);
    }
    img.style.display = '';
    img.src = ORIGINAL;
    img.classList.add('tiko-original-chat');
  }

  function cleanAll() {
    restoreHero();
    document.querySelectorAll('.message.assistant').forEach(restoreAssistant);
    document.querySelectorAll('.tiko-live-host').forEach(el => el.remove());
  }

  function init() {
    cleanAll();
    const app = document.querySelector('#app') || document.body;
    new MutationObserver(() => cleanAll()).observe(app, {subtree:true, childList:true});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else init();
})();
