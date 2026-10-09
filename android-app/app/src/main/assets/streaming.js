(() => {
  const cloud = window.PraticoCloud;
  if (!cloud) return;

  let bubble = null;
  let streamStarted = false;

  function findActiveBubble(){
    const all = [...document.querySelectorAll('.message.assistant .bubble.typing-cursor, .message.assistant .bubble.thinking-bubble, .message.assistant .bubble.streaming-live')];
    return all.length ? all[all.length - 1] : null;
  }

  function showThinking(){
    bubble = findActiveBubble();
    streamStarted = false;
    if (!bubble) return;
    bubble.classList.remove('typing-cursor','streaming-live');
    bubble.classList.add('thinking-bubble');
    bubble.innerHTML = '<span class="typing-dots" aria-label="Tiko compose"><i></i><i></i><i></i></span>';
  }

  const originalStart = cloud.onStart?.bind(cloud);
  const originalToken = cloud.onToken?.bind(cloud);
  const originalDone = cloud.onDone?.bind(cloud);
  const originalError = cloud.onError?.bind(cloud);

  cloud.onStart = function(){
    originalStart?.();
    showThinking();
  };

  cloud.onToken = function(token){
    if (!bubble) bubble = findActiveBubble();
    if (token && bubble && !streamStarted){
      bubble.textContent = '';
      bubble.classList.remove('thinking-bubble','typing-cursor');
      bubble.classList.add('streaming-live');
      streamStarted = true;
    }
    originalToken?.(token);
  };

  cloud.onDone = function(){
    if (bubble) bubble.classList.remove('thinking-bubble','streaming-live','typing-cursor');
    originalDone?.();
    bubble = null;
    streamStarted = false;
  };

  cloud.onError = function(code,message){
    if (bubble){
      bubble.classList.remove('thinking-bubble','streaming-live','typing-cursor');
      bubble.textContent = '';
    }
    originalError?.(code,message);
    bubble = null;
    streamStarted = false;
  };
})();