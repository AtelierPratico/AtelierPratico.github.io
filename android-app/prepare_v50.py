from pathlib import Path
import runpy

runpy.run_path('android-app/prepare_v47.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/4.7','PratikoAIAndroid/5.0').replace('android-4.7','android-5.0')
main.write_text(s, encoding='utf-8')

index = Path('android-app/app/src/main/assets/index.html')
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v50.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v50.css"></head>')
if '<script src="v50.js"></script>' not in h:
    h = h.replace('</body>', '<script src="v50.js"></script></body>')
index.write_text(h, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 16','versionCode 17').replace("versionName '4.7.0'", "versionName '5.0.0'")
gradle.write_text(g, encoding='utf-8')
