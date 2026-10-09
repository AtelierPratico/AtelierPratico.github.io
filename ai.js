import { CreateMLCEngine } from 'https://esm.run/@mlc-ai/web-llm';

const messagesEl = document.getElementById('messages');
const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');
const status = document.getElementById('status');
const statusText = document.getElementById('statusText');
const loadbar = document.getElementById('loadbar');
const quick = document.getElementById('quick');

const TIERS = [
  { id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 · 7B', rank: 4, vram: 5.1 },
  { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 · 3B', rank: 3, vram: 2.5 },
  { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 · 1.5B', rank: 2, vram: 1.65 },
  { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 · 0.5B', rank: 1, vram: 0.95 }
];

let engine = null;
let enginePromise = null;
let activeTier = null;
let history = [];
let loadFailed = false;

const SYSTEM = `Tu es Assistant Pratico, un assistant généraliste francophone intégré au site Pratico - L'atelier du quotidien.
Tu peux discuter naturellement, répondre à des salutations, parler de sujets généraux, expliquer des concepts, proposer des idées, aider à réfléchir et répondre aux questions du quotidien. Tu n'es pas limité au bricolage.
Quand la question concerne la maison, privilégie la méthode Pratico : Observer, Identifier, Préparer, Agir, Vérifier.
Pour le gaz, une intervention électrique risquée, la structure du bâtiment, un incendie, de la fumée, une fuite importante, un matériau potentiellement dangereux ou un danger immédiat, recommande d'arrêter et de faire appel à un professionnel qualifié ou aux services d'urgence selon le cas.
Ne prétends pas remplacer un professionnel. Réponds en français par défaut, sauf si l'utilisateur choisit une autre langue. Sois naturel, chaleureux, utile, direct et concis.`;

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
  if (/^(salut|allo|bonjour|bonsoir|hey|yo|coucou|hello|hi)$/.test(t)) return 'Salut 👋 Content de te voir. Comment je peux t’aider?';
  if (/^(ca va|sa va|comment ca va|tu vas bien|comment vas tu|comment allez vous)$/.test(t)) return 'Oui, ça va bien 😄 Merci! Et toi, comment ça va?';
  if (/^(oui ca va|ca va bien|super|tres bien|pas pire|correct)$/.test(t)) return 'Tant mieux 😄 Qu’est-ce que tu veux faire aujourd’hui?';
  if (/^(merci|merci beaucoup|thx|thanks)$/.test(t)) return 'Avec plaisir 😊';
  if (/^(bye|salut bye|a plus|a bientot|bonne nuit)$/.test(t)) return 'À bientôt 👋 Reviens quand tu veux.';
  if (t.includes('qui es tu') || t.includes('tu es qui')) return 'Je suis Assistant Pratico. Je peux discuter de sujets généraux et je suis particulièrement utile pour les questions pratiques de la maison.';
  if (t.includes('comment tu t appelles') || t === 'ton nom') return 'Je m’appelle Assistant Pratico.';
  if (t === 'quoi de neuf') return 'Toujours prêt à simplifier quelque chose 😄 Qu’est-ce qui t’amène?';
  return null;
}

function chooseTier() {
  const dm = Number(navigator.deviceMemory || 0);
  const ua = navigator.userAgent || '';
  const mobile = /Android|iPhone|iPad|Mobile/i.test(ua);

  if (mobile) {
    if (dm >= 12) return 1;   // 3B
    if (dm >= 6) return 2;    // 1.5B
    return 3;                 // 0.5B
  }

  if (dm >= 16) return 0;     // 7B
  if (dm >= 8) return 1;      // 3B
  if (dm >= 4) return 2;      // 1.5B
  return dm ? 3 : 2;          // unknown desktop -> 1.5B
}

const preferredIndex = chooseTier();
setStatus(`Mode adaptatif · ${TIERS[preferredIndex].label}`);

async function loadFrom(index) {
  if (index >= TIERS.length) throw new Error('Aucun modèle compatible');
  const tier = TIERS[index];
  setStatus(`Chargement ${tier.label}…`);
  loadbar.style.width = '0%';
  loadbar.style.opacity = '1';

  try {
    const e = await CreateMLCEngine(tier.id, {
      initProgressCallback: p => {
        const pct = Math.max(0, Math.min(100, Math.round((p.progress || 0) * 100)));
        loadbar.style.width = pct + '%';
        setStatus(`${tier.label} · ${pct}%`);
      }
    });
    activeTier = tier;
    setStatus(`IA prête · ${tier.label}`, 'ready');
    loadbar.style.width = '100%';
    setTimeout(() => loadbar.style.opacity = '.22', 800);
    return e;
  } catch (err) {
    console.warn(`Échec ${tier.label}, essai du modèle inférieur`, err);
    if (index + 1 < TIERS.length) {
      setStatus(`Appareil limité · essai ${TIERS[index + 1].label}…`);
      return loadFrom(index + 1);
    }
    throw err;
  }
}

async function ensureEngine() {
  if (engine) return engine;
  if (enginePromise) return enginePromise;
  if (!('gpu' in navigator)) {
    loadFailed = true;
    setStatus('WebGPU non disponible sur ce navigateur', 'error');
    throw new Error('WebGPU unavailable');
  }

  enginePromise = loadFrom(preferredIndex)
    .then(e => {
      engine = e;
      return e;
    })
    .catch(err => {
      loadFailed = true;
      enginePromise = null;
      setStatus('IA locale indisponible', 'error');
      throw err;
    });
  return enginePromise;
}

function dangerous(q) {
  const t = normalize(q);
  return /(odeur de gaz|fuite de gaz|fumee|incendie|feu|panneau electrique|tableau electrique|fil denude|eau.*electric|electric.*eau|mur porteur|amiante)/i.test(t);
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

  if (dangerous(q)) {
    const safe = 'Cette situation peut présenter un risque. N’essaie pas de la réparer toi-même. Éloigne-toi du danger si nécessaire et contacte un professionnel qualifié — ou les services d’urgence si le danger est immédiat.';
    addMessage('assistant', safe);
    history.push({ role: 'user', content: q }, { role: 'assistant', content: safe });
    return;
  }

  const bubble = addMessage('assistant', 'Je prépare la meilleure IA compatible avec ton appareil…', true);

  try {
    const e = await ensureEngine();
    bubble.textContent = '';
    bubble.classList.remove('typing');
    const req = [
      { role: 'system', content: SYSTEM },
      ...history.slice(-10),
      { role: 'user', content: q }
    ];

    const stream = await e.chat.completions.create({
      messages: req,
      temperature: 0.5,
      max_tokens: 520,
      stream: true
    });

    let answer = '';
    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content || '';
      answer += token;
      bubble.textContent = answer;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    answer = answer.trim() || 'Je n’ai pas réussi à formuler une réponse.';
    bubble.textContent = answer;
    history.push({ role: 'user', content: q }, { role: 'assistant', content: answer });
  } catch (err) {
    bubble.classList.remove('typing');
    bubble.textContent = loadFailed
      ? 'Je peux répondre instantanément aux échanges simples, mais l’IA complète ne peut pas démarrer sur ce navigateur. Essaie avec une version récente de Chrome ou Edge sur un appareil compatible WebGPU.'
      : 'Une erreur est survenue. Réessaie dans un instant.';
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

// Préchargement prudent : on ne télécharge pas 2,5 à 5 Go sans interaction.
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const canPreload = !connection?.saveData && !['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
const chosen = TIERS[preferredIndex];
if (canPreload && 'gpu' in navigator && chosen.rank <= 2) {
  const start = () => ensureEngine().catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 3000 });
  else setTimeout(start, 1800);
}
