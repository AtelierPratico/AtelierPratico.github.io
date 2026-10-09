from pathlib import Path
import runpy

# Start from the last clean Tiko build (v5.2), NOT v5.3/v5.4 which used bitmap face slices.
runpy.run_path('android-app/prepare_v52.py', run_name='__main__')

# Keep the cloud engine usable even if the remote config request briefly fails.
main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8')
s = s.replace('private volatile String apiUrl = "";', 'private volatile String apiUrl = "https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/chat";')
s = s.replace('private volatile String voiceUrl = "";', 'private volatile String voiceUrl = "https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/voice-token";')
s = s.replace('            } catch (Exception ignored) {\n                apiUrl = "";\n                voiceUrl = "";\n            } finally {', '            } catch (Exception ignored) {\n                // Keep built-in fallback endpoints.\n            } finally {')
s = s.replace('PratikoAIAndroid/5.2','PratikoAIAndroid/5.5').replace('android-5.2','android-5.5')
main.write_text(s, encoding='utf-8')

# Add the safe facial FX. This version never duplicates/crops pieces of Tiko's bitmap.
index = Path('android-app/app/src/main/assets/index.html')
h = index.read_text(encoding='utf-8')
h = h.replace('<link rel="stylesheet" href="v53.css">','').replace('<script src="v53.js"></script>','')
if '<link rel="stylesheet" href="v55.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v55.css"></head>')
if '<script src="v55.js"></script>' not in h:
    h = h.replace('</body>', '<script src="v55.js"></script></body>')
index.write_text(h, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'5.2'", "version:'5.5'").replace("version:'3.4'", "version:'5.5'")
appjs.write_text(a, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 19','versionCode 22').replace("versionName '5.2.0'", "versionName '5.5.0'")
gradle.write_text(g, encoding='utf-8')
