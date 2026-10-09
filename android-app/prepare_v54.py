from pathlib import Path
import runpy

# Start from v5.3: exact original Tiko + facial animations.
runpy.run_path('android-app/prepare_v53.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8')
# Always keep a working engine fallback even if the remote config request briefly fails.
s = s.replace('private volatile String apiUrl = "";', 'private volatile String apiUrl = "https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/chat";')
s = s.replace('private volatile String voiceUrl = "";', 'private volatile String voiceUrl = "https://ibrtukocutdaxyltrmhk.supabase.co/functions/v1/voice-token";')
s = s.replace('            } catch (Exception ignored) {\n                apiUrl = "";\n                voiceUrl = "";\n            } finally {', '            } catch (Exception ignored) {\n                // Keep the built-in fallback endpoints so the app remains usable offline from GitHub config.\n            } finally {')
s = s.replace('PratikoAIAndroid/5.3','PratikoAIAndroid/5.4').replace('android-5.3','android-5.4')
main.write_text(s, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'5.3'", "version:'5.4'")
appjs.write_text(a, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 20','versionCode 21').replace("versionName '5.3.0'", "versionName '5.4.0'")
gradle.write_text(g, encoding='utf-8')
