from pathlib import Path
import runpy

# Start from v5.1 and include the corrected transparent original Tiko asset.
runpy.run_path('android-app/prepare_v51.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.1','PratikoAIAndroid/5.2').replace('android-5.1','android-5.2')
main.write_text(s, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'5.1'", "version:'5.2'")
appjs.write_text(a, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 18','versionCode 19').replace("versionName '5.1.0'", "versionName '5.2.0'")
gradle.write_text(g, encoding='utf-8')
