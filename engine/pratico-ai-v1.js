import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1';

const ui = {
  messages: document.getElementById('messages'),
  form: document.getElementById('chatForm'),
  input: document.getElementById('chatInput'),
  status: document.getElementById('status'),
  statusText: document.getElementById('statusText'),
  quick: document.getElementById('quick'),
  loadbar: document.getElementById('loadbar'),
};

const ENGINE = {
  name: 'PRATICO AI',
  version: '1.0',
  primaryModel: 'onnx-community/gemma-3n-E2B-it-ONNX',
  fallbackModel: 'onnx-community/gemma-3-1b-it-ONNX',
  historyLimit: 12,
};

const KNOWLEDGE = [
  {
    id: 'brand',
    tags: ['pratico','collection','tome','mission','assistant'],
    text: `Pratico — L’atelier du quotidien est une collection généraliste de guides pratiques. La marque n’est pas limitée au bricolage. Les futurs tomes peuvent porter sur la cuisine, les recettes, les relations, l’organisation, les animaux, l’apprentissage, la technologie et d’autres thèmes du quotidien.`
  },
  {
    id: 'method',
    tags: ['methode','observer','identifier','preparer','agir','verifier','maison','reparation'],
    text: `Pour le Tome 1 Maison, la méthode Pratico suit cinq étapes : Observer, Identifier, Préparer, Agir, Vérifier.`
  },
  {
    id: 'safety',
    tags: ['securite','danger','gaz','electricite','fumee','feu','structure','fuite'],
    text: `Pour une situation dangereuse — fumée, feu, odeur de gaz, eau près de l’électricité, structure instable ou intervention qui dépasse le bricolage amateur — Pratico recommande de ne pas prendre de risque et de faire appel à une ressource ou un professionnel approprié.`
  },
  {
    id: 'tone',
    tags: ['style','ton','reponse'],
    text: `Le style Pratico est clair, humain, concret, accessible, non moralisateur et orienté vers des actions simples.`
  }
];

const SYSTEM = `Tu es PRATICO AI, l’assistant généraliste de la marque Pratico — L’atelier du quotidien.
Tu aides sur les sujets du quotidien : maison, cuisine, recettes, relations, organisation, apprentissage, technologie, animaux, loisirs, idées, rédaction et conversation générale.
Tu n’es jamais limité au Tome 1 ni au bricolage.
Réponds en français par défaut, sauf si l’utilisateur écrit dans une autre langue.
Sois naturel, clair, chaleureux, concret et utile. Évite les formulations robotiques.
N’invente pas les faits. Quand tu n’es pas certain, dis-le simplement.
Pour les sujets médicaux, juridiques, financiers ou de sécurité importants, donne de l’information générale prudente et indique quand une ressource qualifiée est préférable.
Quand des éléments de la base Pratico sont fournis, considère-les comme la source prioritaire sur la marque et ses guides.`;

let history = [];
let generator = null;
let modelName = null;
let loadingPromise = null;
let busy = false;

function normalize(s='') {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
}

function tokens(s='') {
  return new Set(normalize(s).split(' ').filter(w => w.length > 2));
}

function retrieve(query, max=3) {
  const q = tokens(query);
  return KNOWLEDGE
    .map(item => {
      const hay = new Set([...tokens(item.text), ...item.tags.map(normalize)]);
      let score = 0;
      q.forEach(t => { if (hay.has(t)) score += 2; else if ([...hay].some(h => h.includes(t) || t.includes(h))) score += 0.5; });
      return { item, score };
    })
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0,max)
    .map(x => x.item.text);
}

function setStatus(text, state='ready') {
  if (!ui.statusText || !ui.status) return;
  ui.statusText.textContent = text;
  ui.status.classList.remove('ready','error');
  if (state === 'ready') ui.status.classList.add('ready');
  if (state === 'error') ui.status.classList.add('error');
}

function setProgress(v) {
  if (!ui.loadbar) return;
  ui.loadbar.style.opacity = '1';
  ui.loadbar.style.width = `${Math.max(2, Math.min(100, v))}%`;
}

function addMessage(role, text, typing=false) {
  const row = document.createElement('div');
  row.className = `message ${role}`;
  if (role === 'assistant') {
    const av = document.createElement('span');
    av.className = 'avatar';
    av.textContent = 'P';
    row.appendChild(av);
  }
  const bubble = document.createElement('div');
  bubble.className = `bubble${typing ? ' typing' : ''}`;
  bubble.textContent = text;
  row.appendChild(bubble);
  ui.messages.appendChild(row);
  ui.messages.scrollTop = ui.messages.scrollHeight;
  return bubble;
}

function instantReply(raw) {
  const t = normalize(raw);
  if (/^(salut|allo|bonjour|bonsoir|hey|yo|coucou|hello|hi)$/.test(t)) return 'Salut 👋 Je suis Pratico AI. Qu’est-ce que je peux faire pour toi?';
  if (/^(ca va|sa va|comment ca va|tu vas bien|comment vas tu)$/.test(t)) return 'Oui 😄 Merci! Et toi, ça va comment?';
  if (/^(merci|merci beaucoup|thanks|thx)$/.test(t)) return 'Avec plaisir 😊';
  return null;
}

function progressCallback(info) {
  if (typeof info?.progress === 'number') {
    const p = Math.round(info.progress);
    setProgress(p);
    setStatus(`PRATICO AI se prépare… ${p}%`);
  }
}

async function loadModel() {
  if (generator) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const device = navigator.gpu ? 'webgpu' : 'wasm';
    const memory = Number(navigator.deviceMemory || 0);
    const candidates = [];
    if (navigator.gpu && (!memory || memory >= 6)) candidates.push(ENGINE.primaryModel);
    candidates.push(ENGINE.fallbackModel);

    let lastError;
    for (const model of [...new Set(candidates)]) {
      try {
        setStatus('PRATICO AI se prépare…');
        setProgress(4);
        generator = await pipeline('text-generation', model, {
          dtype: 'q4',
          device,
          progress_callback: progressCallback,
        });
        modelName = model;
        setProgress(100);
        setStatus('PRATICO AI · prêt', 'ready');
        return;
      } catch (err) {
        lastError = err;
        generator = null;
        console.warn('Pratico AI: modèle indisponible, essai suivant', model, err);
      }
    }
    throw lastError || new Error('Aucun modèle local disponible');
  })().catch(err => {
    loadingPromise = null;
    throw err;
  });
  return loadingPromise;
}

function buildMessages(q) {
  const knowledge = retrieve(q);
  const context = knowledge.length ? `\n\nConnaissances Pratico pertinentes:\n- ${knowledge.join('\n- ')}` : '';
  return [
    { role: 'system', content: SYSTEM + context },
    ...history.slice(-ENGINE.historyLimit),
    { role: 'user', content: q },
  ];
}

async function generateAnswer(q) {
  await loadModel();
  setStatus('PRATICO AI réfléchit…');
  setProgress(68);

  const output = await generator(buildMessages(q), {
    max_new_tokens: 360,
    do_sample: true,
    temperature: 0.6,
    top_p: 0.9,
    repetition_penalty: 1.08,
  });

  const generated = output?.[0]?.generated_text;
  let answer = '';
  if (Array.isArray(generated)) answer = String(generated.at(-1)?.content || '');
  else answer = String(generated || '');

  answer = answer.trim();
  if (!answer) throw new Error('Réponse vide');
  setProgress(100);
  setStatus('PRATICO AI · prêt', 'ready');
  return answer;
}

async function send(raw) {
  const q = raw.trim();
  if (!q || busy) return;

  addMessage('user', q);
  ui.input.value = '';
  ui.input.style.height = 'auto';

  const instant = instantReply(q);
  if (instant) {
    addMessage('assistant', instant);
    history.push({role:'user',content:q},{role:'assistant',content:instant});
    return;
  }

  busy = true;
  const bubble = addMessage('assistant', 'Je réfléchis…', true);
  try {
    const answer = await generateAnswer(q);
    bubble.classList.remove('typing');
    bubble.textContent = answer;
    history.push({role:'user',content:q},{role:'assistant',content:answer});
  } catch (err) {
    console.error('Pratico AI:', err);
    bubble.classList.remove('typing');
    bubble.textContent = navigator.gpu
      ? 'Pratico AI n’a pas réussi à charger son moteur local sur cet appareil. Recharge la page et réessaie.'
      : 'Ce navigateur ne fournit pas l’accélération locale idéale. Essaie une version récente de Chrome ou Edge.';
    setStatus('PRATICO AI · moteur indisponible', 'error');
  } finally {
    busy = false;
  }
}

ui.form?.addEventListener('submit', e => { e.preventDefault(); send(ui.input.value); });
ui.input?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(ui.input.value); }
});
ui.input?.addEventListener('input', () => {
  ui.input.style.height = 'auto';
  ui.input.style.height = Math.min(ui.input.scrollHeight,120) + 'px';
});
ui.quick?.querySelectorAll('button').forEach(b => b.addEventListener('click', () => send(b.dataset.q || b.textContent)));

window.PraticoAI = {
  version: ENGINE.version,
  ask: send,
  retrieve,
  getModel: () => modelName,
  clearMemory: () => { history = []; },
};

setStatus('PRATICO AI · prêt', 'ready');
setProgress(100);
