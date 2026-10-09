from pathlib import Path
import runpy

# Start from v5.0, which restores the original Tiko asset, then bump version.
runpy.run_path('android-app/prepare_v50.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.0','PratikoAIAndroid/5.1').replace('android-5.0','android-5.1')
main.write_text(s, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'5.0'", "version:'5.1'")
appjs.write_text(a, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 17','versionCode 18').replace("versionName '5.0.0'", "versionName '5.1.0'")
gradle.write_text(g, encoding='utf-8')
