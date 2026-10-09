import {
  AutoProcessor,
  AutoModelForImageTextToText,
  TextStreamer,
  pipeline,
} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1';

const messagesEl = document.getElementById('messages');
const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');
const status = document.getElementById('status');
const statusText = document.getElementById('statusText');
const quick = document.getElementById('quick');
const loadbar = document.getElementById('loadbar');

const PRIMARY_MODEL = 'onnx-community/gemma-3n-E2B-it-ONNX';
const FALLBACK_MODEL = 'onnx-community/gemma-3-1b-it-ONNX';

const SYSTEM = `Tu es Assistant Pratico, l'assistant généraliste de la marque Pratico - L'atelier du quotidien.
Pratico est une collection de guides qui peut couvrir la maison, la cuisine et les recettes, les relations, l'organisation, l'apprentissage, la technologie, les loisirs et d'autres thèmes du quotidien.
Tu n'es pas limité au bricolage ni au Tome 1. Réponds naturellement aux questions générales et à la conversation courante.
Tu peux expliquer, rédiger, proposer des recettes et des idées, aider à réfléchir à une situation relationnelle, organiser un projet, enseigner un concept et répondre aux questions pratiques.
N'invente pas de faits. Si tu n'es pas certain, dis-le clairement. Pour les sujets dangereux ou à enjeu élevé, privilégie la sécurité et les limites utiles.
Réponds en français par défaut sauf si l'utilisateur écrit dans une autre langue. Sois clair, naturel, chaleureux, concret et assez concis. Ne ramène jamais inutilement une réponse au bricolage.`;

let history = [];
let busy = false;
let mode = null;
let processor = null;
let primaryModel = null;
let fallbackGenerator = null;
let loadingPromise = null;

function setStatus(text, state = 'ready') {
  if (!statusText || !status) return;
  statusText.textContent = text;
  status.classList.remove('ready', 'error');
  if (state === 'ready') status.classList.add('ready');
  if (state === 'error') status.classList.add('error');
}

function setProgress(value) {
  if (!loadbar) return;
  const pct = Math.max(2, Math.min(100, value));
  loadbar.style.opacity = '1';
  loadbar.style.width = pct + '%';
}

function progressCallback(info) {
  if (!info) return;
  if (typeof info.progress === 'number') {
    const p = Math.round(info.progress);
    setProgress(p);
    setStatus(`Chargement de Gemma… ${p}%`);
  } else if (info.status === 'ready') {
    setProgress(100);
  }
}

function addMessage(role, text, streaming = false) {
  const row = document.createElement('div');
  row.className = 'message ' + role;
  if (role === 'assistant') {
    const av = document.createElement('span');
    av.className = 'avatar';
    av.textContent = 'P';
    row.appendChild(av);
  }
  const bubble = document.createElement('div');
  bubble.className = 'bubble' + (streaming ? ' typing' : '');
  bubble.textContent = text;
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[!?.,;:'\"()]/g, ' ').replace(/\s+/g, ' ').trim();
}

function instantReply(raw) {
  const t = normalize(raw);
  if (/^(salut|allo|bonjour|bonsoir|hey|yo|coucou|hello|hi)$/.test(t)) return 'Salut 👋 Qu’est-ce que je peux faire pour toi?';
  if (/^(ca va|sa va|comment ca va|tu vas bien|comment vas tu|comment allez vous)$/.test(t)) return 'Oui, ça va bien 😄 Merci! Et toi?';
  if (/^(merci|merci beaucoup|thx|thanks)$/.test(t)) return 'Avec plaisir 😊';
  return null;
}

function recentTranscript(q) {
  const recent = history.slice(-10).map(m => `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.content}`).join('\n');
  return `${SYSTEM}\n\n${recent ? `Conversation récente:\n${recent}\n\n` : ''}Nouvelle question de l'utilisateur: ${q}`;
}

async function loadPrimary() {
  if (!navigator.gpu) throw new Error('WebGPU indisponible');

  setStatus('Préparation de Gemma 3n…');
  setProgress(4);

  processor = await AutoProcessor.from_pretrained(PRIMARY_MODEL, {
    progress_callback: progressCallback,
  });

  primaryModel = await AutoModelForImageTextToText.from_pretrained(PRIMARY_MODEL, {
    dtype: {
      audio_encoder: 'q4',
      vision_encoder: 'q4',
      embed_tokens: 'q4',
      decoder_model_merged: 'q4',
    },
    device: 'webgpu',
    progress_callback: progressCallback,
  });

  mode = 'gemma3n';
  setProgress(100);
  setStatus('Gemma 3n E2B · Google · local', 'ready');
}

async function loadFallback() {
  const device = navigator.gpu ? 'webgpu' : 'wasm';
  setStatus('Mode léger Google en préparation…');
  setProgress(5);

  fallbackGenerator = await pipeline(
    'text-generation',
    FALLBACK_MODEL,
    {
      dtype: 'q4',
      device,
      progress_callback: progressCallback,
    }
  );

  mode = 'gemma3';
  setProgress(100);
  setStatus(`Gemma 3 1B · Google · ${device === 'webgpu' ? 'local' : 'compatibilité'}`, 'ready');
}

async function ensureModel() {
  if (mode && (primaryModel || fallbackGenerator)) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const memory = Number(navigator.deviceMemory || 0);
    const tryPrimary = !!navigator.gpu && (!memory || memory >= 6);

    if (tryPrimary) {
      try {
        await loadPrimary();
        return;
      } catch (err) {
        console.warn('Gemma 3n indisponible, passage au modèle léger:', err);
        processor = null;
        primaryModel = null;
      }
    }

    await loadFallback();
  })().catch(err => {
    loadingPromise = null;
    throw err;
  });

  return loadingPromise;
}

async function answerWithPrimary(q, bubble) {
  const promptText = recentTranscript(q);
  const chat = [{ role: 'user', content: [{ type: 'text', text: promptText }] }];
  const prompt = processor.apply_chat_template(chat, { add_generation_prompt: true });
  const inputs = await processor(prompt, null, null, { add_special_tokens: false });

  let streamed = '';
  bubble.textContent = '';
  bubble.classList.remove('typing');

  const streamer = new TextStreamer(processor.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: text => {
      streamed += text;
      bubble.textContent = streamed.trimStart();
      messagesEl.scrollTop = messagesEl.scrollHeight;
    },
  });

  const outputs = await primaryModel.generate({
    ...inputs,
    max_new_tokens: 320,
    do_sample: true,
    temperature: 0.65,
    top_p: 0.9,
    repetition_penalty: 1.08,
    streamer,
  });

  let answer = streamed.trim();
  if (!answer) {
    const decoded = processor.batch_decode(
      outputs.slice(null, [inputs.input_ids.dims.at(-1), null]),
      { skip_special_tokens: true }
    );
    answer = String(decoded?.[0] || '').trim();
  }
  return answer;
}

async function answerWithFallback(q) {
  const messages = [
    { role: 'system', content: SYSTEM },
    ...history.slice(-10),
    { role: 'user', content: q },
  ];

  const output = await fallbackGenerator(messages, {
    max_new_tokens: 320,
    do_sample: true,
    temperature: 0.65,
    top_p: 0.9,
    repetition_penalty: 1.08,
  });

  return String(output?.[0]?.generated_text?.at?.(-1)?.content || '').trim();
}

async function send(raw) {
  const q = raw.trim();
  if (!q || busy) return;

  addMessage('user', q);
  input.value = '';
  input.style.height = 'auto';

  const instant = instantReply(q);
  if (instant) {
    addMessage('assistant', instant);
    history.push({ role: 'user', content: q }, { role: 'assistant', content: instant });
    return;
  }

  busy = true;
  const bubble = addMessage('assistant', 'Je prépare l’IA locale…', true);

  try {
    await ensureModel();
    setStatus(mode === 'gemma3n' ? 'Gemma réfléchit…' : 'Gemma réfléchit…');
    setProgress(65);

    let answer = mode === 'gemma3n'
      ? await answerWithPrimary(q, bubble)
      : await answerWithFallback(q);

    answer = answer.trim();
    if (!answer) throw new Error('Réponse vide');

    bubble.classList.remove('typing');
    bubble.textContent = answer;
    history.push({ role: 'user', content: q }, { role: 'assistant', content: answer });
    setProgress(100);
    setStatus(
      mode === 'gemma3n'
        ? 'Gemma 3n E2B · Google · local'
        : 'Gemma 3 1B · Google · local',
      'ready'
    );
  } catch (err) {
    console.error('Assistant Pratico / Gemma:', err);
    bubble.classList.remove('typing');
    bubble.textContent = navigator.gpu
      ? 'L’IA locale n’a pas pu se charger sur cet appareil. Recharge la page puis réessaie. Le premier chargement peut être assez volumineux.'
      : 'Ce navigateur ne prend pas bien en charge l’accélération locale nécessaire. Essaie avec une version récente de Chrome ou Edge.';
    setStatus('IA locale indisponible sur cet appareil', 'error');
  } finally {
    busy = false;
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  send(input.value);
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send(input.value);
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});

quick.querySelectorAll('button').forEach(b => b.addEventListener('click', () => send(b.dataset.q || b.textContent)));

setStatus('Gemma · Google · sans compte', 'ready');
setProgress(100);
