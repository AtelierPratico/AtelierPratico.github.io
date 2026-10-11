from pathlib import Path
import runpy

# Start from v7.5: native voice, animated Tiko, markdown cleanup.
runpy.run_path('android-app/prepare_v75.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'

# Load the no-bubble streaming layout last so it overrides v7.5 cleanly.
index = ASSETS / 'index.html'
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v76.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v76.css"></head>')
index.write_text(h, encoding='utf-8')

# Bump web client metadata.
appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'7.5'", "version:'7.6'")
appjs.write_text(a, encoding='utf-8')

# Bump Android metadata produced by v7.5.
main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/7.5','PratikoAIAndroid/7.6').replace('android-7.5','android-7.6')
main.write_text(s, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 36','versionCode 37').replace("versionName '7.5.0'", "versionName '7.6.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v7.6 prepared — assistant replies stream directly on the conversation canvas with no assistant bubble')
