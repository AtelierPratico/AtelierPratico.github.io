from pathlib import Path
import runpy

# Pratiko AI 6.0 starts from the stable v5.11 build and upgrades the AI orchestration layer.
runpy.run_path('android-app/prepare_v511.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'
appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8')

# Track server-side image capabilities so the UI never pretends an unavailable edit engine works.
a = a.replace(
"const state = { chats: [], activeId: null, generating: false, activeBubble: null, engine: 'setup', voice: 'idle', imageQuota: {used:0,remaining:15,limit:15,plan:'free'} };",
"const state = { chats: [], activeId: null, generating: false, activeBubble: null, engine: 'setup', voice: 'idle', imageQuota: {used:0,remaining:15,limit:15,plan:'free'}, imageCapabilities:{generation:true,exact_editing:null,provider:'unknown'} };"
)

old_refresh = """  async function refreshImageQuota(){ const d=deviceId(); if(!d)return; try{ const r=await fetch(IMAGE_API,{headers:{'X-Pratiko-Device':d}}); if(!r.ok)return; const data=await r.json(); if(data?.quota)updateQuota(data.quota); }catch{} }\n"""
new_refresh = """  async function refreshImageQuota(){ const d=deviceId(); if(!d)return; try{ const r=await fetch(IMAGE_API,{headers:{'X-Pratiko-Device':d}}); if(!r.ok)return; const data=await r.json(); if(data?.quota)updateQuota(data.quota); if(data?.capabilities)state.imageCapabilities={...state.imageCapabilities,...data.capabilities}; }catch{} }\n"""
if old_refresh not in a:
    raise SystemExit('v6.0: refreshImageQuota block not found')
a = a.replace(old_refresh, new_refresh, 1)

old_image_request = """  function isImageRequest(text){\n    const t=text.toLowerCase();\n    const action=/(g[eé]n[eè]r|cr[eé][ée]|dessin|illustr|fais[- ]?moi|fabrique|con[cç]ois|generate|create|make)/i.test(t);\n    const visual=/(image|photo|logo|affiche|poster|wallpaper|fond d['’ ]?[ée]cran|visuel|illustration|portrait|maquette)/i.test(t);\n    return action && visual;\n  }\n"""
new_image_request = """  function isImageRequest(text){\n    const t=text.toLowerCase().trim();\n    const action=/(g[eé]n[eè]r|cr[eé][ée]|dessin|illustre?|fais[- ]?moi|fabrique|con[cç]ois|imagine visuellement|generate|create|make|render)/i.test(t);\n    const visual=/(image|photo|logo|affiche|poster|wallpaper|fond d['’ ]?[ée]cran|visuel|illustration|portrait|maquette|photoreal|photor[eé]al|4k|8k|cin[eé]matique)/i.test(t);\n    const direct=/^(dessine|illustre|g[eé]n[eè]re|cr[eé]e)\\b/i.test(t);\n    return (action && visual) || direct;\n  }\n"""
if old_image_request not in a:
    raise SystemExit('v6.0: isImageRequest block not found')
a = a.replace(old_image_request, new_image_request, 1)

old_edit_prompt = """  function buildImageEditPrompt(text,ctx){\n    return `${ctx.message.prompt}\\n\\nMODIFICATION DEMANDÉE: ${text}\\nConserve autant que possible la même composition, le même cadrage, le même sujet, le même style et le même éclairage de l’image précédente. Modifie uniquement ce qui est demandé.`;\n  }\n"""
new_edit_prompt = """  function buildImageEditPrompt(text,ctx){\n    return `Modifie l’image de référence uniquement selon cette instruction : ${text}. Conserve strictement tout le reste : sujet principal, identité, architecture, cadrage, perspective, proportions, lumière, couleurs non visées et composition. Ne recrée pas une nouvelle scène.`;\n  }\n"""
if old_edit_prompt not in a:
    raise SystemExit('v6.0: buildImageEditPrompt block not found')
a = a.replace(old_edit_prompt, new_edit_prompt, 1)

old_loading = """  function appendImageLoading(){ const row=makeAssistantRow(); row.classList.add('image-loading-row'); const b=document.createElement('div'); b.className='bubble image-loading'; b.innerHTML='<div class=\"image-loading-orb\"></div><div class=\"image-loading-copy\"><b>Tiko modifie ton image…</b><span>Ça peut prendre quelques secondes.</span></div>'; row.appendChild(b); scrollBottom(); return row; }\n"""
new_loading = """  function appendImageLoading(isEdit=false){ const row=makeAssistantRow(); row.classList.add('image-loading-row'); const b=document.createElement('div'); b.className='bubble image-loading'; b.innerHTML=`<div class=\"image-loading-orb\"></div><div class=\"image-loading-copy\"><b>${isEdit?'Tiko retouche ton image…':'Tiko crée ton image…'}</b><span>Ça peut prendre quelques secondes.</span></div>`; row.appendChild(b); scrollBottom(); return row; }\n"""
if old_loading not in a:
    raise SystemExit('v6.0: appendImageLoading block not found')
a = a.replace(old_loading, new_loading, 1)

# Add a machine-readable tool bridge. If the language model recognizes an image request that
# local heuristics missed, it can hand control back to the image engine instead of claiming it is text-only.
anchor = """  window.PraticoCloud={\n"""
bridge = """  function parseTikoDirective(text){\n    const raw=(text||'').trim();\n    const gen='[[PRATIKO_IMAGE_GENERATE]]';\n    const edit='[[PRATIKO_IMAGE_EDIT]]';\n    try{\n      if(raw.startsWith(gen)){ const x=JSON.parse(raw.slice(gen.length).trim()); return {kind:'generate',prompt:(x.prompt||'').trim(),aspectRatio:x.aspect_ratio||'1:1'}; }\n      if(raw.startsWith(edit)){ const x=JSON.parse(raw.slice(edit.length).trim()); return {kind:'edit',instruction:(x.instruction||'').trim()}; }\n    }catch{}\n    return null;\n  }\n  function launchTikoDirective(d){\n    if(!d)return false;\n    const c=active();\n    if(d.kind==='generate' && d.prompt){ requestImage(d.prompt,{aspectRatio:d.aspectRatio}); return true; }\n    if(d.kind==='edit' && d.instruction){\n      const ctx=lastImageContext(c);\n      if(!ctx){ appendMessage('assistant','Crée ou ouvre d’abord une image, puis dis-moi ce que tu veux modifier.'); return true; }\n      requestImage(buildImageEditPrompt(d.instruction,ctx),{sourceImageUrl:ctx.message.url,aspectRatio:ctx.message.aspect_ratio||'1:1'}); return true;\n    }\n    return false;\n  }\n\n  window.PraticoCloud={\n"""
if anchor not in a:
    raise SystemExit('v6.0: PraticoCloud anchor not found')
a = a.replace(anchor, bridge, 1)

old_done = """    onDone(){ const c=active(); if(state.activeBubble){ state.activeBubble.classList.remove('typing-cursor'); const text=state.activeBubble.textContent.trim(); if(text && c){c.messages.push({role:'assistant',content:text});save();} } state.activeBubble=null; setGenerating(false); setTiko('point'); setTimeout(()=>setTiko('wave'),1100); },\n"""
new_done = """    onDone(){\n      const c=active(); const bubble=state.activeBubble;\n      if(bubble){\n        bubble.classList.remove('typing-cursor');\n        const text=bubble.textContent.trim(); const directive=parseTikoDirective(text);\n        if(directive){ const row=bubble.closest('.message'); if(row)row.remove(); state.activeBubble=null; setGenerating(false); launchTikoDirective(directive); return; }\n        if(text && c){c.messages.push({role:'assistant',content:text});save();}\n      }\n      state.activeBubble=null; setGenerating(false); setTiko('point'); setTimeout(()=>setTiko('wave'),1100);\n    },\n"""
if old_done not in a:
    raise SystemExit('v6.0: onDone block not found')
a = a.replace(old_done, new_done, 1)

# Make image requests capability-aware and give generation/editing distinct loading states.
a = a.replace("const loading=appendImageLoading(); setGenerating(true);", "const isEdit=!!options.sourceImageUrl; if(isEdit && state.imageCapabilities.exact_editing===false){ appendMessage('assistant','La création d’images fonctionne, mais la retouche exacte de la même image nécessite un moteur d’édition authentifié. Je préfère ne pas remplacer ton image par une autre.'); return; } const loading=appendImageLoading(isEdit); setGenerating(true);", 1)
a = a.replace("if(data?.quota)updateQuota(data.quota); return; }\n      if(!r.ok || !data?.image?.url)", "if(data?.quota)updateQuota(data.quota); return; }\n      if(data?.capabilities)state.imageCapabilities={...state.imageCapabilities,...data.capabilities};\n      if(!r.ok || !data?.image?.url)", 1)

a = a.replace("version:'5.11'", "version:'6.0'")
appjs.write_text(a, encoding='utf-8')

main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.11','PratikoAIAndroid/6.0').replace('android-5.11','android-6.0')
main.write_text(s, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 28','versionCode 29').replace("versionName '5.11.0'", "versionName '6.0.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v6.0 prepared — unified AI routing, image tool bridge, capability-aware media engine')
