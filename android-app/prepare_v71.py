from pathlib import Path
import runpy

# Keep the stable v7.0 AI + image + Rive stack and apply the final premium UI pass.
runpy.run_path('android-app/prepare_v70.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'

index = ASSETS / 'index.html'
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v71.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v71.css"></head>')
if '<script src="v71.js"></script>' not in h:
    h = h.replace('</body>', '<script src="v71.js"></script></body>')
index.write_text(h, encoding='utf-8')

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'7.0'", "version:'7.1'")
appjs.write_text(a, encoding='utf-8')

main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/7.0','PratikoAIAndroid/7.1').replace('android-7.0','android-7.1')
main.write_text(s, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 31','versionCode 32').replace("versionName '7.0.0'", "versionName '7.1.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v7.1 prepared — corrected Tiko scale, premium mobile conversation layout, amplified live motion')
