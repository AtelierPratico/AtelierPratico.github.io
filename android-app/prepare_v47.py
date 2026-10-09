from pathlib import Path
import runpy

# Build on the stable v4.5 pipeline, then add the live interactive Tiko layer.
runpy.run_path('android-app/prepare_v45.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/4.5','PratikoAIAndroid/4.7').replace('android-4.5','android-4.7')
main.write_text(s, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'4.5'", "version:'4.7'")
appjs.write_text(a, encoding='utf-8')

index = Path('android-app/app/src/main/assets/index.html')
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v47.css">' not in h:
    h = h.replace('<link rel="stylesheet" href="v45.css">', '<link rel="stylesheet" href="v45.css"><link rel="stylesheet" href="v47.css">')
if '<script src="v47.js"></script>' not in h:
    h = h.replace('<script src="tiko-premium-patch.js"></script>', '<script src="tiko-premium-patch.js"></script><script src="v47.js"></script>')
index.write_text(h, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 14','versionCode 16').replace("versionName '4.5.0'", "versionName '4.7.0'")
gradle.write_text(g, encoding='utf-8')
