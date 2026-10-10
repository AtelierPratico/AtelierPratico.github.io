from pathlib import Path
import runpy

# Keep the stable v6.1 AI/image system and replace the presentation layer with Pratiko 7.
runpy.run_path('android-app/prepare_v61.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'

index = ASSETS / 'index.html'
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v70.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v70.css"></head>')
if '<script src="v70.js"></script>' not in h:
    h = h.replace('</body>', '<script src="v70.js"></script></body>')
index.write_text(h, encoding='utf-8')

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'6.1'", "version:'7.0'")
appjs.write_text(a, encoding='utf-8')

main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/6.1','PratikoAIAndroid/7.0').replace('android-6.1','android-7.0')
main.write_text(s, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 30','versionCode 31').replace("versionName '6.1.0'", "versionName '7.0.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v7.0 prepared — premium fluid Tiko-first interface')
