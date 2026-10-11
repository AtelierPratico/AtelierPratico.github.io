from pathlib import Path
import runpy

# Start from v7.4: premium UI, Rive Tiko and reliable native voice.
runpy.run_path('android-app/prepare_v74.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'

# Load the v7.5 conversation presentation last so it cleanly overrides older UI layers.
index = ASSETS / 'index.html'
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v75.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v75.css"></head>')
if '<script src="v75.js"></script>' not in h:
    h = h.replace('</body>', '<script src="v75.js"></script></body>')
index.write_text(h, encoding='utf-8')

# Bump web client metadata.
appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'7.4'", "version:'7.5'")
appjs.write_text(a, encoding='utf-8')

# Bump Android metadata produced by v7.4.
main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/7.4','PratikoAIAndroid/7.5').replace('android-7.4','android-7.5')
main.write_text(s, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 35','versionCode 36').replace("versionName '7.4.0'", "versionName '7.5.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v7.5 prepared — threaded assistant bubbles + no visible markdown markers in replies')
