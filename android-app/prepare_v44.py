from pathlib import Path
import runpy

# Reuse the stable v4.3 preparation, then layer v4.4 on top.
runpy.run_path('android-app/prepare_v43.py', run_name='__main__')

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/4.3','PratikoAIAndroid/4.4').replace('android-4.3','android-4.4')
main.write_text(s, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8').replace("version:'4.3'", "version:'4.4'")
# Make casual greetings feel less robotic/repetitive while preserving instant response speed.
a = a.replace("if(/^(allo+|salut|bonjour|bonsoir|hey+|yo+|coucou|hello)$/.test(t)) return 'Salut 👋 Moi c’est Tiko. Qu’est-ce que je peux faire pour toi?';",
'''if(/^(yo+|yoo+|yooo+)$/.test(t)) return ['Yooo 😄 Qu’est-ce qu’on fait aujourd’hui?','Yooo ✨ Je suis là. On travaille sur quoi?','Yooo 🙌 Vas-y, je t’écoute.'][Math.floor(Math.random()*3)];
    if(/^(allo+|salut|bonjour|bonsoir|hey+|coucou|hello)$/.test(t)) return ['Salut 👋 Qu’est-ce que je peux faire pour toi?','Hey 😄 Dis-moi ce qu’il te faut.','Allô 🙌 Je suis prêt. On commence par quoi?'][Math.floor(Math.random()*3)];''')
appjs.write_text(a, encoding='utf-8')

index = Path('android-app/app/src/main/assets/index.html')
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v44.css">' not in h:
    h = h.replace('<link rel="stylesheet" href="v43.css">', '<link rel="stylesheet" href="v43.css"><link rel="stylesheet" href="v44.css">')
if '<script src="v44.js"></script>' not in h:
    h = h.replace('<script src="v43.js"></script>', '<script src="v43.js"></script><script src="v44.js"></script>')
index.write_text(h, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8').replace('versionCode 12','versionCode 13').replace("versionName '4.3.0'", "versionName '4.4.0'")
gradle.write_text(g, encoding='utf-8')
