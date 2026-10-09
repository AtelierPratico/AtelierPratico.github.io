import { CreateMLCEngine } from 'https://esm.run/@mlc-ai/web-llm';

const messagesEl = document.getElementById('messages');
const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');
const status = document.getElementById('status');
const statusText = document.getElementById('statusText');
const loadbar = document.getElementById('loadbar');
const quick = document.getElementById('quick');

// Aucun modèle Qwen : Assistant Pratico choisit parmi plusieurs familles selon l'appareil.
const TIERS = [
  { id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC', label: 'Mistral 7B', rank: 4 },
  { id: 'Phi-4-mini-instruct-q4f16_1-MLC', label: 'Phi-4 Mini', rank: 3 },
  { id: 'gemma-2-2b-it-q4f16_1-MLC', label: 'Gemma 2 · 2B', rank: 2 },
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 · 1B', rank: 1 }
];

const SYSTEM = `Tu es Assistant Pratico, l'assistant généraliste de la marque Pratico - L'atelier du quotidien.
Pratico est une collection appelée à couvrir plusieurs thèmes : maison, cuisine, recettes, relations, organisation, apprentissage, technologie, loisirs, idées pratiques et vie quotidienne. Tu ne dois jamais supposer que Pratico concerne uniquement le bricolage.
Réponds à pratiquement toute question générale dans la mesure de tes connaissances : conversation, explications, recettes, idées, rédaction, conseils relationnels, organisation, culture générale, apprentissage, technologie et questions pratiques.
Si l'utilisateur parle de bricolage ou de la maison, tu peux utiliser la méthode Pratico : Observer, Identifier, Préparer, Agir, Vérifier.
Pour une situation à risque élevé — urgence, incendie, gaz, électricité dangereuse, problème médical grave ou autre danger immédiat — privilégie la sécurité et recommande l'aide appropriée. Pour les sujets médicaux, juridiques ou financiers importants, donne de l'information générale sans prétendre remplacer un professionnel.
Tu n'as pas accès au Web en temps réel : si une question exige une information actuelle que tu ne peux pas vérifier, dis-le simplement au lieu d'inventer.
Réponds en français par défaut, sauf si l'utilisateur emploie une autre langue. Sois naturel, chaleureux, utile, direct et conversationnel. Ne ramène pas inutilement la discussion au bricolage.`;

let engine = null;
let enginePromise = null;
let activeTierIndex = null;
let history = [];
let compatGenerator = null;
let compatPromise = null;

function setStatus(text, state = 'loading') {
  if (!statusText || !status) return;
  statusText.textContent = text;
  status.classList.remove('ready', 'error');
  if (state === 'ready') status.classList.add('ready');
  if (state === 'error') status.classList.add('error');
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
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[!?.,;:'"()]/g, ' ').replace(/\s+/g, ' ').trim();
}

function instantReply(raw) {
  const t = normalize(raw);
  if (/^(salut|allo|bonjour|bonsoir|hey|yo|coucou|hello|hi)$/.test(t)) return 'Salut 👋 Content de te voir. Qu’est-ce que je peux faire pour toi?';
  if (/^(ca va|sa va|comment ca va|tu vas bien|comment vas tu|comment allez vous)$/.test(t)) return 'Oui, ça va bien 😄 Merci! Et toi, comment ça va?';
  if (/^(oui ca va|ca va bien|super|tres bien|pas pire|correct)$/.test(t)) return 'Tant mieux 😄 De quoi as-tu envie de parler?';
  if (/^(merci|merci beaucoup|thx|thanks)$/.test(t)) return 'Avec plaisir 😊';
  if (/^(bye|salut bye|a plus|a bientot|bonne nuit)$/.test(t)) return 'À bientôt 👋 Reviens quand tu veux.';
  if (t.includes('qui es tu') || t.includes('tu es qui')) return 'Je suis Assistant Pratico, l’assistant généraliste de L’atelier du quotidien. Tu peux me parler de cuisine, relations, maison, organisation, idées, apprentissage, technologie ou simplement discuter.';
  if (t.includes('comment tu t appelles') || t === 'ton nom') return 'Je m’appelle Assistant Pratico.';
  if (t === 'quoi de neuf') return 'Toujours prêt 😄 Tu peux me demander à peu près n’importe quoi.';
  return null;
}

function emergencyReply(raw) {
  const t = normalize(raw);
  if (/(odeur de gaz|fuite de gaz|incendie|maison en feu|fumee epaisse|fil electrique dans l eau|electrocution)/.test(t)) {
    return 'Ça peut être dangereux. Ne tente pas une réparation pendant que le danger est présent. Éloigne-toi si nécessaire et contacte les services d’urgence ou un professionnel qualifié selon la situation.';
  }
  return null;
}

function chooseTier() {
  const dm = Number(navigator.deviceMemory || 0);
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent || '');

  // Mobile : Llama 1B par défaut pour garder une réponse utilisable et un téléchargement raisonnable.
  if (mobile) return dm >= 12 ? 2 : 3;
  // Ordinateurs puissants : privilégier Mistral/Phi pour la qualité générale.
  if (dm >= 16) return 0;
  if (dm >= 8) return 1;
  if (dm >= 4) return 2;
  return 3;
}

const preferredIndex = chooseTier();
setStatus(`IA locale · ${TIERS[preferredIndex].label}`);

async function disposeEngine() {
  if (!engine) return;
  try {
    if (typeof engine.unload === 'function') await engine.unload();
  } catch (_) {}
  engine = null;
  enginePromise = null;
}

async function loadFrom(index) {
  if (index >= TIERS.length) throw new Error('Aucun modèle WebLLM compatible');
  const tier = TIERS[index];
  setStatus(`Chargement ${tier.label}…`);
  if (loadbar) {
    loadbar.style.width = '0%';
    loadbar.style.opacity = '1';
  }

  try {
    const e = await CreateMLCEngine(
      tier.id,
      {
        initProgressCallback: p => {
          const pct = Math.max(0, Math.min(100, Math.round((p.progress || 0) * 100)));
          if (loadbar) loadbar.style.width = pct + '%';
          setStatus(`${tier.label} · ${pct}%`);
        }
      },
      { context_window_size: 2048 }
    );
    activeTierIndex = index;
    setStatus(`IA prête · ${tier.label}`, 'ready');
    if (loadbar) {
      loadbar.style.width = '100%';
      setTimeout(() => loadbar.style.opacity = '.22', 800);
    }
    return e;
  } catch (err) {
    console.warn(`Échec ${tier.label}`, err);
    if (index + 1 < TIERS.length) return loadFrom(index + 1);
    throw err;
  }
}

async function ensureEngine(startIndex = preferredIndex) {
  if (engine) return engine;
  if (enginePromise) return enginePromise;
  if (!('gpu' in navigator)) throw new Error('WebGPU unavailable');

  enginePromise = loadFrom(startIndex)
    .then(e => {
      engine = e;
      return e;
    })
    .catch(err => {
      enginePromise = null;
      throw err;
    });
  return enginePromise;
}

async function ensureCompatGenerator() {
  if (compatGenerator) return compatGenerator;
  if (compatPromise) return compatPromise;

  setStatus('Mode compatibilité · Llama 3.2…');
  if (loadbar) {
    loadbar.style.opacity = '1';
    loadbar.style.width = '30%';
  }

  compatPromise = import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm')
    .then(async ({ pipeline }) => {
      const gen = await pipeline(
        'text-generation',
        'onnx-community/Llama-3.2-1B-Instruct-ONNX',
        { dtype: 'q4' }
      );
      compatGenerator = gen;
      setStatus('IA prête · Llama 3.2 compatibilité', 'ready');
      if (loadbar) loadbar.style.width = '100%';
      return gen;
    })
    .catch(err => {
      compatPromise = null;
      setStatus('Mode local limité sur ce navigateur', 'error');
      throw err;
    });

  return compatPromise;
}

function buildMessages(q) {
  return [
    { role: 'system', content: SYSTEM },
    ...history.slice(-12),
    { role: 'user', content: q }
  ];
}

async function generateWithWebLLM(q, bubble) {
  const e = await ensureEngine();
  const req = buildMessages(q);

  try {
    const stream = await e.chat.completions.create({
      messages: req,
      temperature: 0.55,
      max_tokens: 600,
      stream: true
    });

    let answer = '';
    bubble.textContent = '';
    bubble.classList.remove('typing');

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content || '';
      answer += token;
      bubble.textContent = answer;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    if (!answer.trim()) throw new Error('Réponse vide');
    return answer.trim();
  } catch (firstErr) {
    if (activeTierIndex !== null && activeTierIndex + 1 < TIERS.length) {
      const next = activeTierIndex + 1;
      await disposeEngine();
      setStatus(`Nouvel essai · ${TIERS[next].label}…`);
      const lighter = await ensureEngine(next);
      const out = await lighter.chat.completions.create({
        messages: req,
        temperature: 0.5,
        max_tokens: 500,
        stream: false
      });
      const answer = out.choices?.[0]?.message?.content?.trim();
      if (answer) return answer;
    }
    throw firstErr;
  }
}

async function generateWithCompat(q) {
  const gen = await ensureCompatGenerator();
  const req = buildMessages(q);
  const output = await gen(req, {
    max_new_tokens: 420,
    do_sample: true,
    temperature: 0.55,
    top_p: 0.9
  });

  const generated = output?.[0]?.generated_text;
  if (Array.isArray(generated)) {
    const last = generated.at(-1);
    if (last?.content) return String(last.content).trim();
  }
  if (typeof generated === 'string' && generated.trim()) return generated.trim();
  throw new Error('Réponse locale vide');
}

async function answerQuestion(q, bubble) {
  if ('gpu' in navigator) {
    try {
      return await generateWithWebLLM(q, bubble);
    } catch (err) {
      console.warn('WebLLM indisponible, passage au moteur Llama de compatibilité', err);
    }
  }

  bubble.textContent = 'Je charge la version locale compatible avec ton appareil…';
  bubble.classList.add('typing');
  return await generateWithCompat(q);
}

async function send(raw) {
  const q = raw.trim();
  if (!q) return;
  addMessage('user', q);
  input.value = '';
  input.style.height = 'auto';

  const quickAnswer = instantReply(q);
  if (quickAnswer) {
    addMessage('assistant', quickAnswer);
    history.push({ role: 'user', content: q }, { role: 'assistant', content: quickAnswer });
    return;
  }

  const urgent = emergencyReply(q);
  if (urgent) {
    addMessage('assistant', urgent);
    history.push({ role: 'user', content: q }, { role: 'assistant', content: urgent });
    return;
  }

  const bubble = addMessage('assistant', 'Je réfléchis…', true);

  try {
    const answer = await answerQuestion(q, bubble);
    bubble.classList.remove('typing');
    bubble.textContent = answer;
    history.push({ role: 'user', content: q }, { role: 'assistant', content: answer });
  } catch (err) {
    console.error('Tous les moteurs locaux ont échoué', err);
    bubble.classList.remove('typing');
    bubble.textContent = 'Mon moteur local n’a pas pu démarrer sur cet appareil. Ta question n’est pas le problème. Essaie Pratico dans une version récente de Chrome, Edge ou Safari pour utiliser l’assistant complet.';
    setStatus('Moteur local non disponible sur ce navigateur', 'error');
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

const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const canPreload = !connection?.saveData && !['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
const chosen = TIERS[preferredIndex];
if (canPreload && 'gpu' in navigator && chosen.rank <= 2) {
  const start = () => ensureEngine().catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 3000 });
  else setTimeout(start, 1800);
} else if (!('gpu' in navigator)) {
  setStatus('IA locale · Llama 3.2 compatibilité');
}
