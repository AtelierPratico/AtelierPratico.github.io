(() => {
  const MARKDOWN_PATTERNS = [
    [/\*\*([^*]+)\*\*/g, '$1'],
    [/__([^_]+)__/g, '$1'],
    [/`([^`]+)`/g, '$1'],
    [/^#{1,6}\s+/gm, ''],
    [/^\s*[-*]\s+/gm, '• '],
    [/\[([^\]]+)\]\(([^)]+)\)/g, '$1']
  ];

  function cleanMarkdown(text){
    let out = String(text || '');
    for(const [rx,repl] of MARKDOWN_PATTERNS) out = out.replace(rx,repl);
    out = out.replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,!?;:])/g,'$1$2');
    out = out.replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,!?;:])/g,'$1$2');
    out = out.replace(/\n{3,}/g,'\n\n');
    return out;
  }

  function tidyBubble(bubble){
    if(!bubble || bubble.classList.contains('image-loading')) return;
    if(bubble.dataset.p75Busy === '1') return;
    const original = bubble.textContent || '';
    const cleaned = cleanMarkdown(original);
    if(cleaned !== original){
      bubble.dataset.p75Busy = '1';
      bubble.textContent = cleaned;
      bubble.dataset.p75Busy = '0';
    }
  }

  function tidyAll(root=document){
    root.querySelectorAll?.('.message.assistant .bubble').forEach(tidyBubble);
  }

  function init(){
    const messages = document.querySelector('#messages');
    if(!messages) return;
    tidyAll(messages);
    const observer = new MutationObserver(mutations => {
      const touched = new Set();
      for(const m of mutations){
        const node = m.target.nodeType === 3 ? m.target.parentElement : m.target;
        const bubble = node?.closest?.('.message.assistant .bubble');
        if(bubble) touched.add(bubble);
        m.addedNodes?.forEach(n => {
          if(n.nodeType !== 1) return;
          if(n.matches?.('.message.assistant .bubble')) touched.add(n);
          n.querySelectorAll?.('.message.assistant .bubble').forEach(x => touched.add(x));
        });
      }
      touched.forEach(tidyBubble);
    });
    observer.observe(messages,{subtree:true,childList:true,characterData:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
