from pathlib import Path
import runpy

# Build on the working Rive v5.6 package.
runpy.run_path('android-app/prepare_v56.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'

index = ASSETS / 'index.html'
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v57.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v57.css"></head>')
if '<script src="v57.js"></script>' not in h:
    h = h.replace('</body>', '<script src="v57.js"></script></body>')
index.write_text(h, encoding='utf-8')

main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.6','PratikoAIAndroid/5.7').replace('android-5.6','android-5.7')
main.write_text(s, encoding='utf-8')

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'5.6'", "version:'5.7'")
appjs.write_text(a, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 23','versionCode 24').replace("versionName '5.6.0'", "versionName '5.7.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v5.7 prepared — Rive facial states + reference-style fluid body/head motion')
