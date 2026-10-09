from pathlib import Path
import runpy

# Start from v5.2: exact original Tiko, transparent and frameless.
runpy.run_path('android-app/prepare_v52.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.2','PratikoAIAndroid/5.3').replace('android-5.2','android-5.3')
main.write_text(s, encoding='utf-8')

index = Path('android-app/app/src/main/assets/index.html')
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v53.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v53.css"></head>')
if '<script src="v53.js"></script>' not in h:
    h = h.replace('</body>', '<script src="v53.js"></script></body>')
index.write_text(h, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'5.2'", "version:'5.3'").replace("version:'3.4'", "version:'5.3'")
appjs.write_text(a, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 19','versionCode 20').replace("versionName '5.2.0'", "versionName '5.3.0'")
gradle.write_text(g, encoding='utf-8')
