from pathlib import Path
import runpy

# Start from v6.0 and add persistent image lineage / true edit context wiring.
runpy.run_path('android-app/prepare_v60.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'
appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8')

# Image cards keep their server generation ID so future edits can target the exact source image.
a = a.replace(
"const title=document.createElement('div'); title.className='image-card-title'; title.textContent='✨ Création de Tiko'; body.appendChild(title);",
"const title=document.createElement('div'); title.className='image-card-title'; title.textContent=m.mode==='edit'?'✨ Retouche de Tiko':m.mode==='variation'?'✨ Variante de Tiko':'✨ Création de Tiko'; body.appendChild(title);"
)
a = a.replace(
"const redo=document.createElement('button'); redo.textContent='Refaire'; redo.onclick=()=>repeatImage(m.prompt,false); actions.appendChild(redo);",
"const redo=document.createElement('button'); redo.textContent='Refaire'; redo.onclick=()=>repeatImage(m,false); actions.appendChild(redo);"
)
a = a.replace(
"const variant=document.createElement('button'); variant.textContent='Variante'; variant.onclick=()=>repeatImage(m.prompt,true); actions.appendChild(variant);",
"const variant=document.createElement('button'); variant.textContent='Variante'; variant.onclick=()=>repeatImage(m,true); actions.appendChild(variant);"
)

# Natural edit requests now send both the exact server generation id and URL.
a = a.replace(
"requestImage(buildImageEditPrompt(text,editCtx),{sourceImageUrl:editCtx.message.url,aspectRatio:editCtx.message.aspect_ratio||aspectFor(editCtx.message.prompt||'')});",
"requestImage(buildImageEditPrompt(text,editCtx),{sourceImageUrl:editCtx.message.url,sourceGenerationId:editCtx.message.id||null,aspectRatio:editCtx.message.aspect_ratio||aspectFor(editCtx.message.prompt||''),mode:'edit',conversationId:c.remoteId||null});"
)
a = a.replace(
"if(isImageRequest(text)){ requestImage(text); return; }",
"if(isImageRequest(text)){ requestImage(text,{mode:'create',conversationId:c.remoteId||null}); return; }"
)

# Tool-routed image generation/editing gets the same strong lineage information.
a = a.replace(
"if(d.kind==='generate' && d.prompt){ requestImage(d.prompt,{aspectRatio:d.aspectRatio}); return true; }",
"if(d.kind==='generate' && d.prompt){ requestImage(d.prompt,{aspectRatio:d.aspectRatio,mode:'create',conversationId:c?.remoteId||null}); return true; }"
)
a = a.replace(
"requestImage(buildImageEditPrompt(d.instruction,ctx),{sourceImageUrl:ctx.message.url,aspectRatio:ctx.message.aspect_ratio||'1:1'}); return true;",
"requestImage(buildImageEditPrompt(d.instruction,ctx),{sourceImageUrl:ctx.message.url,sourceGenerationId:ctx.message.id||null,aspectRatio:ctx.message.aspect_ratio||'1:1',mode:'edit',conversationId:c?.remoteId||null}); return true;"
)

old_body = """    const aspectRatio=options.aspectRatio||aspectFor(prompt);\n    const body={prompt,aspect_ratio:aspectRatio};\n    if(options.sourceImageUrl) body.source_image_url=options.sourceImageUrl;\n"""
new_body = """    const aspectRatio=options.aspectRatio||aspectFor(prompt);\n    const body={prompt,aspect_ratio:aspectRatio,mode:options.mode||'create'};\n    if(options.sourceImageUrl) body.source_image_url=options.sourceImageUrl;\n    if(options.sourceGenerationId) body.source_generation_id=options.sourceGenerationId;\n    if(options.conversationId) body.conversation_id=options.conversationId;\n"""
if old_body not in a:
    raise SystemExit('v6.1: requestImage body block not found')
a = a.replace(old_body, new_body, 1)

old_message = """      const c=active(); const m={role:'assistant',kind:'image',url:data.image.url,prompt:data.image.prompt||prompt,aspect_ratio:data.image.aspect_ratio||aspectRatio,remaining:data.quota?.remaining,limit:data.quota?.limit}; c.messages.push(m); save(); appendImageMessage(m); setTiko('point'); setTimeout(()=>setTiko('wave'),1200);\n"""
new_message = """      const c=active(); const m={role:'assistant',kind:'image',id:data.image.id||null,url:data.image.url,prompt:data.image.prompt||prompt,aspect_ratio:data.image.aspect_ratio||aspectRatio,mode:data.image.mode||options.mode||'create',source_generation_id:data.image.source_generation_id||options.sourceGenerationId||null,remaining:data.quota?.remaining,limit:data.quota?.limit}; c.messages.push(m); save(); appendImageMessage(m); setTiko('point'); setTimeout(()=>setTiko('wave'),1200);\n"""
if old_message not in a:
    raise SystemExit('v6.1: image success message block not found')
a = a.replace(old_message, new_message, 1)

old_repeat = """  function repeatImage(prompt,variant){\n    let c=active(); if(!c){newChat(false);c=active();}\n    const label=variant?'Fais-moi une variante de cette image':'Refais cette image'; c.messages.push({role:'user',content:label}); save(); appendMessage('user',label);\n    requestImage(variant?`${prompt}\\nCrée une nouvelle variante visuelle clairement différente tout en gardant le même sujet principal.`:prompt);\n  }\n"""
new_repeat = """  function repeatImage(source,variant){\n    let c=active(); if(!c){newChat(false);c=active();}\n    const label=variant?'Fais-moi une variante de cette image':'Refais cette image'; c.messages.push({role:'user',content:label}); save(); appendMessage('user',label);\n    if(variant){\n      requestImage('Crée une variante visuelle de cette image en conservant le même sujet principal et son identité, avec une interprétation légèrement différente mais cohérente.',{sourceImageUrl:source.url,sourceGenerationId:source.id||null,aspectRatio:source.aspect_ratio||'1:1',mode:'variation',conversationId:c.remoteId||null});\n    } else {\n      requestImage(source.prompt||'Refais cette image',{aspectRatio:source.aspect_ratio||'1:1',mode:'create',conversationId:c.remoteId||null});\n    }\n  }\n"""
if old_repeat not in a:
    raise SystemExit('v6.1: repeatImage block not found')
a = a.replace(old_repeat, new_repeat, 1)

# Better edit-provider error wording: backend is authoritative and can become available without another APK.
a = a.replace(
"const isEdit=!!options.sourceImageUrl; if(isEdit && state.imageCapabilities.exact_editing===false){ appendMessage('assistant','La création d’images fonctionne, mais la retouche exacte de la même image nécessite un moteur d’édition authentifié. Je préfère ne pas remplacer ton image par une autre.'); return; } const loading=appendImageLoading(isEdit); setGenerating(true);",
"const isEdit=!!options.sourceImageUrl; const loading=appendImageLoading(isEdit); setGenerating(true);"
)

# Ensure the app can immediately benefit when a provider is enabled server-side later.
a = a.replace("version:'6.0'", "version:'6.1'")
appjs.write_text(a, encoding='utf-8')

main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/6.0','PratikoAIAndroid/6.1').replace('android-6.0','android-6.1')
main.write_text(s, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 29','versionCode 30').replace("versionName '6.0.0'", "versionName '6.1.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v6.1 prepared — persistent image lineage and provider-ready exact edits')
