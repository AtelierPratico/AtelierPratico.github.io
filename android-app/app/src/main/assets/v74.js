(() => {
  'use strict';

  let voiceReplyPending = false;
  let speakingKey = '';

  function $(s){ return document.querySelector(s); }

  function setPanel(state, title, transcript){
    const panel = $('#voicePanel');
    const voiceState = $('#voiceState');
    const voiceTitle = $('#voiceTitle');
    const voiceTranscript = $('#voiceTranscript');
    if(panel) panel.classList.add('show');
    if(voiceState && state) voiceState.textContent = state;
    if(voiceTitle && title) voiceTitle.textContent = title;
    if(voiceTranscript && transcript != null) voiceTranscript.textContent = transcript;
  }

  function submitVoiceText(text){
    const input = $('#input');
    const send = $('#sendBtn');
    if(!input || !send || !text?.trim()) return;
    voiceReplyPending = true;
    setPanel('COMMANDE VOCALE', 'Tiko réfléchit…', text.trim());
    input.value = text.trim();
    input.dispatchEvent(new Event('input', {bubbles:true}));
    requestAnimationFrame(() => send.click());
  }

  function latestAssistantText(){
    const rows = [...document.querySelectorAll('.message.assistant')];
    for(let i = rows.length - 1; i >= 0; i--){
      const bubble = rows[i].querySelector('.bubble');
      if(!bubble) continue;
      if(bubble.classList.contains('typing-cursor')) return '';
      const text = (bubble.textContent || '').trim();
      if(text) return text;
    }
    return '';
  }

  function maybeSpeak(){
    if(!voiceReplyPending) return;
    const text = latestAssistantText();
    if(!text) return;
    const key = text.slice(0, 180);
    if(key === speakingKey) return;
    speakingKey = key;
    voiceReplyPending = false;
    setPanel('TIKO RÉPOND', 'Conversation vocale', text);
    try { window.PraticoNative?.speakText?.(text); } catch {}
  }

  function install(){
    const mic = $('#micBtn');
    if(mic){
      mic.onclick = () => {
        try {
          if(window.PraticoNative?.toggleNativeVoice){
            window.PraticoNative.toggleNativeVoice();
          } else {
            window.PraticoNative?.toggleVoice?.();
          }
        } catch {
          setPanel('MODE VOCAL', 'Micro indisponible', 'Impossible de démarrer la reconnaissance vocale.');
        }
      };
    }

    const close = $('#voiceClose');
    if(close){
      close.onclick = () => {
        voiceReplyPending = false;
        try { window.PraticoNative?.stopNativeVoice?.(); } catch {}
        try { window.PraticoNative?.stopSpeaking?.(); } catch {}
        $('#voicePanel')?.classList.remove('show','listening');
      };
    }

    window.PratikoVoice = window.PratikoVoice || {};
    window.PratikoVoice.onNativeReady = () => {
      setPanel('MODE VOCAL', 'Tiko t’écoute…', 'Parle naturellement.');
      $('#voicePanel')?.classList.add('listening');
      $('#micBtn')?.classList.add('live');
    };
    window.PratikoVoice.onNativePartial = text => {
      setPanel('TU PARLES', 'Tiko t’écoute', text || '…');
    };
    window.PratikoVoice.onNativeCommand = text => {
      $('#voicePanel')?.classList.remove('listening');
      $('#micBtn')?.classList.remove('live');
      submitVoiceText(text);
    };
    window.PratikoVoice.onNativeStopped = () => {
      $('#voicePanel')?.classList.remove('listening');
      $('#micBtn')?.classList.remove('live','connecting');
    };
    window.PratikoVoice.onNativeError = message => {
      voiceReplyPending = false;
      setPanel('MODE VOCAL', 'Je n’ai pas bien entendu', message || 'Réessaie en parlant un peu plus près du téléphone.');
      $('#voicePanel')?.classList.remove('listening');
      $('#micBtn')?.classList.remove('live','connecting');
    };

    const root = $('#app') || document.body;
    new MutationObserver(() => requestAnimationFrame(maybeSpeak)).observe(root, {
      subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['class']
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
