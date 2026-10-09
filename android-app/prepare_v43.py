from pathlib import Path
import runpy

# Reuse the stable v4.2 preparation, then layer v4.3 on top.
runpy.run_path('android-app/prepare_v42.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/4.2','PratikoAIAndroid/4.3').replace('android-4.2','android-4.3')
main.write_text(s, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'4.2'", "version:'4.3'")
appjs.write_text(a, encoding='utf-8')

index = Path('android-app/app/src/main/assets/index.html')
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v43.css">' not in h:
    h = h.replace('<link rel="stylesheet" href="v42.css">', '<link rel="stylesheet" href="v42.css"><link rel="stylesheet" href="v43.css">')
if '<script src="v43.js"></script>' not in h:
    h = h.replace('<script src="v42.js"></script>', '<script src="v42.js"></script><script src="v43.js"></script>')
index.write_text(h, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 11','versionCode 12').replace("versionName '4.2.0'", "versionName '4.3.0'")
gradle.write_text(g, encoding='utf-8')
