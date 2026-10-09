const messagesEl = document.getElementById('messages');
const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');
const status = document.getElementById('status');
const statusText = document.getElementById('statusText');
const quick = document.getElementById('quick');
const loadbar = document.getElementById('loadbar');

const MODEL = 'gpt-5.4-nano';
let history = [];
let busy = false;

const SYSTEM = `Tu es Assistant Pratico, l'assistant généraliste de la marque Pratico - L'atelier du quotidien.
Pratico est une collection de guides qui pourra couvrir la maison, la cuisine et les recettes, les relations, l'organisation, l'apprentissage, la technologie, les loisirs et d'autres thèmes du quotidien.
Tu n'es PAS limité au bricolage ni au Tome 1. Réponds naturellement à presque toute question générale dans la mesure de tes connaissances.
Tu peux converser, expliquer, rédiger, proposer des recettes et des idées, aider à réfléchir à une situation relationnelle, organiser un projet, enseigner un concept et répondre aux questions pratiques.
Quand une demande porte sur une situation dangereuse ou à enjeu élevé, privilégie la sécurité et indique clairement les limites utiles. Pour les questions médicales, juridiques ou financières importantes, donne de l'information générale sans prétendre remplacer un professionnel.
N'invente pas des faits. Si tu n'es pas certain, dis-le. Si une question dépend d'informations très récentes auxquelles tu n'as pas accès, précise-le simplement.
Réponds en français par défaut, sauf si l'utilisateur écrit dans une autre langue. Sois clair, naturel, chaleureux, concret et concis. Ne ramène jamais inutilement une réponse au bricolage.`;

function setStatus(text, state = 'ready') {
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
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[!?.,;:'\"()]/g, ' ').replace(/\s+/g, ' ').trim();
}

function instantReply(raw) {
  const t = normalize(raw);
  if (/^(salut|allo|bonjour|bonsoir|hey|yo|coucou|hello|hi)$/.test(t)) return 'Salut 👋 Qu’est-ce que je peux faire pour toi?';
  if (/^(ca va|sa va|comment ca va|tu vas bien|comment vas tu|comment allez vous)$/.test(t)) return 'Oui, ça va bien 😄 Merci! Et toi?';
  if (/^(merci|merci beaucoup|thx|thanks)$/.test(t)) return 'Avec plaisir 😊';
  return null;
}

function buildConversation(q) {
  return [
    { role: 'system', content: SYSTEM },
    ...history.slice(-14),
    { role: 'user', content: q }
  ];
}

async function askOpenAI(q, bubble) {
  if (!window.puter?.ai?.chat) throw new Error('Puter.js indisponible');

  setStatus('GPT réfléchit…');
  if (loadbar) {
    loadbar.style.opacity = '1';
    loadbar.style.width = '72%';
  }

  const conversation = buildConversation(q);
  const response = await window.puter.ai.chat(
    conversation,
    false,
    { model: MODEL, stream: true }
  );

  let answer = '';
  bubble.textContent = '';
  bubble.classList.remove('typing');

  for await (const part of response) {
    if (part?.text) {
      answer += part.text;
      bubble.textContent = answer;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  answer = answer.trim();
  if (!answer) throw new Error('Réponse vide');

  if (loadbar) {
    loadbar.style.width = '100%';
    setTimeout(() => loadbar.style.opacity = '.2', 600);
  }
  setStatus('GPT prêt · OpenAI', 'ready');
  return answer;
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
  const bubble = addMessage('assistant', 'Je réfléchis…', true);

  try {
    const answer = await askOpenAI(q, bubble);
    bubble.classList.remove('typing');
    bubble.textContent = answer;
    history.push({ role: 'user', content: q }, { role: 'assistant', content: answer });
  } catch (err) {
    console.error('Assistant Pratico / Puter:', err);
    bubble.classList.remove('typing');
    const msg = String(err?.message || err || '').toLowerCase();
    if (msg.includes('auth') || msg.includes('sign') || msg.includes('login') || msg.includes('permission')) {
      bubble.textContent = 'Pour utiliser GPT dans Pratico sans clé API, Puter doit t’identifier une première fois. Autorise la connexion Puter, puis renvoie ta question.';
      setStatus('Connexion Puter requise', 'error');
    } else {
      bubble.textContent = 'GPT n’a pas pu répondre pour le moment. Recharge la page puis renvoie ta question. Si Puter demande une autorisation ou une connexion, accepte-la pour activer GPT.';
      setStatus('GPT temporairement indisponible', 'error');
    }
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

setStatus('GPT prêt · OpenAI', 'ready');
if (loadbar) loadbar.style.width = '100%';