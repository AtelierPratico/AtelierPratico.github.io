(() => {
  const PREMIUM = 'tiko-premium-general.svg';

  function swap(img) {
    if (!img) return;
    const current = img.getAttribute('src') || '';
    if (current !== PREMIUM) img.setAttribute('src', PREMIUM);
    img.style.background = 'transparent';
    img.style.border = '0';
    img.style.outline = '0';
    img.style.boxShadow = 'none';
  }

  function apply(root = document) {
    swap(root.querySelector?.('#tikoHero'));
    root.querySelectorAll?.('.message.assistant .assistant-avatar img').forEach(swap);
  }

  function watchHero() {
    const hero = document.querySelector('#tikoHero');
    if (!hero) return;
    swap(hero);
    new MutationObserver(() => swap(hero)).observe(hero, {
      attributes: true,
      attributeFilter: ['src']
    });
  }

  function watchMessages() {
    const messages = document.querySelector('#messages');
    if (!messages) return;
    apply(messages);
    new MutationObserver(() => apply(messages)).observe(messages, {
      subtree: true,
      childList: true
    });
  }

  function init() {
    apply();
    watchHero();
    watchMessages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
