from pathlib import Path
import runpy

# Start from v5.9: humanized Rive Tiko + stable Android build.
runpy.run_path('android-app/prepare_v59.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'

main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.9','PratikoAIAndroid/5.10').replace('android-5.9','android-5.10')
main.write_text(s, encoding='utf-8')

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'5.9'", "version:'5.10'").replace("version:'3.4'", "version:'5.10'")
appjs.write_text(a, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 26','versionCode 27').replace("versionName '5.9.0'", "versionName '5.10.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v5.10 prepared — contextual image follow-up edits + reference-image generation')
