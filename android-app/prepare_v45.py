from pathlib import Path
import runpy

# Reuse the stable v4.4 preparation, then layer v4.5 on top.
runpy.run_path('android-app/prepare_v44.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/4.4','PratikoAIAndroid/4.5').replace('android-4.4','android-4.5')
main.write_text(s, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'4.4'", "version:'4.5'")
appjs.write_text(a, encoding='utf-8')

index = Path('android-app/app/src/main/assets/index.html')
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v45.css">' not in h:
    h = h.replace('<link rel="stylesheet" href="v44.css">', '<link rel="stylesheet" href="v44.css"><link rel="stylesheet" href="v45.css">')
if '<script src="v45.js"></script>' not in h:
    h = h.replace('<script src="v44.js"></script>', '<script src="v44.js"></script><script src="v45.js"></script>')
index.write_text(h, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 13','versionCode 14').replace("versionName '4.4.0'", "versionName '4.5.0'")
gradle.write_text(g, encoding='utf-8')
