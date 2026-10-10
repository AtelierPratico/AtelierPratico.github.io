from pathlib import Path
import runpy

# Start from v5.10: humanized Tiko + contextual image editing backend support.
runpy.run_path('android-app/prepare_v510.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8')

old = """  function imageEditContext(text,chat){\n    const ctx=lastImageContext(chat); if(!ctx)return null;\n    const t=text.toLowerCase().trim();\n    const explicit=/(image|photo|visuel|celle[- ]?ci|celle[- ]?l[aà]|pr[eé]c[eé]dente|dessus|sur l['’]image|sur la photo)/i.test(t);\n    const edit=/(ajout|enl[eè]v|retir|supprim|chang|remplac|modifi|transform|mets?\\b|met\\b|rends?\\b|rend\\b|avec\\b|sans\\b|plus de\\b|moins de\\b|fleur|couleur|ciel|fond|arri[eè]re[- ]?plan|recadr|zoom|[ée]clairc|assombr)/i.test(t);\n    if(!edit || (ctx.distance!==1 && !explicit)) return null;\n    return ctx;\n  }\n"""

new = """  function imageEditContext(text,chat){\n    const ctx=lastImageContext(chat); if(!ctx)return null;\n    const t=text.toLowerCase().trim();\n    const explicit=/(image|photo|visuel|celle[- ]?ci|celle[- ]?l[aà]|pr[eé]c[eé]dente|dessus|sur l['’]image|sur la photo)/i.test(t);\n    const strongEdit=/(ajout|enl[eè]v|retir|supprim|chang|remplac|modifi|transform|mets?\\b|met\\b|rends?\\b|rend\\b|recadr|zoom|[ée]clairc|assombr)/i.test(t);\n    const softEdit=/(avec\\b|sans\\b|plus de\\b|moins de\\b|fleur|couleur|ciel|fond|arri[eè]re[- ]?plan)/i.test(t);\n    // Keep the most recent generated image as the active visual context.\n    // Strong edit commands such as \"ajoute\", \"enlève\", \"change\" or \"modifie\"\n    // must still target that image even if a failed text reply happened in between.\n    if(strongEdit && (ctx.distance<=8 || explicit)) return ctx;\n    if(softEdit && (ctx.distance<=3 || explicit)) return ctx;\n    return null;\n  }\n"""

if old not in a:
    raise SystemExit('Could not find v5.10 imageEditContext block')
a = a.replace(old, new, 1)
a = a.replace("version:'5.10'", "version:'5.11'")
appjs.write_text(a, encoding='utf-8')

main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.10','PratikoAIAndroid/5.11').replace('android-5.10','android-5.11')
main.write_text(s, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 27','versionCode 28').replace("versionName '5.10.0'", "versionName '5.11.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v5.11 prepared — persistent recent-image edit context')
