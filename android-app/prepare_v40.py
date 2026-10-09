from pathlib import Path

main = Path('android-app/app/src/main/java/ai/pratico/app/MainActivity.java')
s = main.read_text(encoding='utf-8')
replacements = {
    'PratikoAIAndroid/3.1': 'PratikoAIAndroid/4.0',
    'android-3.1': 'android-4.0',
    'String voiceName = obj.optString("voice", "Kore");': 'String voiceName = obj.optString("voice", "Achird");',
    "Tu es Tiko, l'assistant vocal de Pratiko AI. Parle naturellement, chaleureusement et de façon concise. Réponds en français par défaut, sauf si la personne parle dans une autre langue.": "Tu es Tiko, l'assistant vocal de Pratiko AI. Ta personnalité est amicale, souriante, spontanée et légèrement taquine. Parle avec chaleur et naturel, avec une légère coloration hispanique ou méditerranéenne dans le rythme et l'intonation, subtile et jamais caricaturale. Tu peux rire doucement quand le contexte s'y prête. Garde un ton charmant, accessible et énergique, sans surjouer. Réponds en français par défaut, sauf si la personne parle dans une autre langue. Sois concis et conversationnel."
}
for old, new in replacements.items():
    if old not in s:
        raise SystemExit(f'Missing MainActivity replacement: {old}')
    s = s.replace(old, new)

imports_old = 'import android.app.Activity;\nimport android.content.pm.PackageManager;'
imports_new = 'import android.app.Activity;\nimport android.app.DownloadManager;\nimport android.content.Context;\nimport android.content.pm.PackageManager;\nimport android.net.Uri;\nimport android.os.Environment;\nimport android.widget.Toast;'
if imports_old not in s:
    raise SystemExit('Missing Android imports marker')
s = s.replace(imports_old, imports_new)

file_access = '        settings.setAllowFileAccess(true);'
if file_access not in s:
    raise SystemExit('Missing WebView file access marker')
s = s.replace(file_access, file_access + '\n        settings.setAllowUniversalAccessFromFileURLs(true);')

marker = '    public class ChatBridge {'
download_method = '''    private void downloadImageToDevice(String url) {
        try {
            if (url == null || !url.startsWith("https://")) return;
            String lower = url.toLowerCase();
            String ext = lower.contains(".png") ? ".png" : lower.contains(".webp") ? ".webp" : ".jpg";
            String mime = ext.equals(".png") ? "image/png" : ext.equals(".webp") ? "image/webp" : "image/jpeg";
            String filename = "PratikoAI-" + System.currentTimeMillis() + ext;
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle("Pratiko AI — création de Tiko");
            request.setDescription("Téléchargement de ton image");
            request.setMimeType(mime);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);
            DownloadManager manager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (manager != null) manager.enqueue(request);
            Toast.makeText(this, "Image enregistrée dans Téléchargements", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Toast.makeText(this, "Le téléchargement n’a pas pu démarrer.", Toast.LENGTH_SHORT).show();
        }
    }

'''
if marker not in s:
    raise SystemExit('Missing ChatBridge marker')
s = s.replace(marker, download_method + marker)

status_marker = '        public String getEngineStatus() { return apiUrl.isEmpty() ? "setup" : "ready"; }'
bridge_methods = status_marker + '''

        @JavascriptInterface
        public String getDeviceId() { return deviceId; }

        @JavascriptInterface
        public void downloadImage(String url) { main.post(() -> downloadImageToDevice(url)); }'''
if status_marker not in s:
    raise SystemExit('Missing bridge status marker')
s = s.replace(status_marker, bridge_methods)
main.write_text(s, encoding='utf-8')

manifest = Path('android-app/app/src/main/AndroidManifest.xml')
m = manifest.read_text(encoding='utf-8')
perm_marker = '    <uses-permission android:name="android.permission.RECORD_AUDIO" />'
legacy_perm = perm_marker + '\n    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />'
if legacy_perm not in m:
    if perm_marker not in m:
        raise SystemExit('Missing permission marker')
    m = m.replace(perm_marker, legacy_perm)
manifest.write_text(m, encoding='utf-8')

appjs = Path('android-app/app/src/main/assets/app.js')
a = appjs.read_text(encoding='utf-8')
a = a.replace("version:'3.4'", "version:'4.0'")
appjs.write_text(a, encoding='utf-8')

index = Path('android-app/app/src/main/assets/index.html')
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v4.css">' not in h:
    h = h.replace('<link rel="stylesheet" href="streaming.css">', '<link rel="stylesheet" href="streaming.css"><link rel="stylesheet" href="v4.css">')
if '<script src="v4.js"></script>' not in h:
    h = h.replace('<script src="streaming.js"></script>', '<script src="streaming.js"></script><script src="v4.js"></script>')
index.write_text(h, encoding='utf-8')

gradle = Path('android-app/app/build.gradle')
g = gradle.read_text(encoding='utf-8')
if 'versionCode 4' not in g or "versionName '3.1.0'" not in g:
    raise SystemExit('Missing Gradle version markers')
g = g.replace('versionCode 4', 'versionCode 9').replace("versionName '3.1.0'", "versionName '4.0.0'")
gradle.write_text(g, encoding='utf-8')
