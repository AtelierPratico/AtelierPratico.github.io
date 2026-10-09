from pathlib import Path
import runpy

# Reuse the stable v4.1 preparation, then layer v4.2 on top.
runpy.run_path('android-app/prepare_v41.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/4.1','PratikoAIAndroid/4.2').replace('android-4.1','android-4.2')
main.write_text(s, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'4.1'", "version:'4.2'")
appjs.write_text(a, encoding='utf-8')

index = Path('android-app/app/src/main/assets/index.html')
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v42.css">' not in h:
    h = h.replace('<link rel="stylesheet" href="v4.css">', '<link rel="stylesheet" href="v4.css"><link rel="stylesheet" href="v42.css">')
if '<script src="v42.js"></script>' not in h:
    h = h.replace('<script src="v4.js"></script>', '<script src="v4.js"></script><script src="v42.js"></script>')
index.write_text(h, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 10','versionCode 11').replace("versionName '4.1.0'", "versionName '4.2.0'")
gradle.write_text(g, encoding='utf-8')
