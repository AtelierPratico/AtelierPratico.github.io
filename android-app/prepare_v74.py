from pathlib import Path
import runpy

# Start from v7.3: expressive Tiko + premium UI + Gemini Live diagnostics.
runpy.run_path('android-app/prepare_v73.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'
main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8')

# Native Android speech recognition is used as the reliable voice-command path.
imports_anchor = 'import android.media.MediaRecorder;\n'
imports_extra = '''import android.media.MediaRecorder;\nimport android.content.Intent;\nimport android.os.Bundle;\nimport android.speech.RecognitionListener;\nimport android.speech.RecognizerIntent;\nimport android.speech.SpeechRecognizer;\nimport android.speech.tts.TextToSpeech;\n'''
# Bundle is already imported lower in the file; avoid duplicate after replacement.
if imports_anchor not in s:
    raise SystemExit('v7.4: import anchor missing')
s = s.replace(imports_anchor, imports_extra, 1)
s = s.replace('import android.os.Bundle;\nimport android.os.Bundle;\n', 'import android.os.Bundle;\n')

if 'import java.util.Locale;' not in s:
    s = s.replace('import java.util.Arrays;\n', 'import java.util.Arrays;\nimport java.util.Locale;\n', 1)

# Separate permission flow for native speech so the old Gemini Live path remains available internally.
s = s.replace('private static final int REQ_AUDIO = 301;', 'private static final int REQ_AUDIO = 301;\n    private static final int REQ_NATIVE_AUDIO = 302;', 1)

field_anchor = '    private Thread audioThread;\n'
field_extra = '''    private Thread audioThread;\n\n    private SpeechRecognizer nativeRecognizer;\n    private boolean nativeListening = false;\n    private boolean pendingNativePermission = false;\n    private TextToSpeech nativeTts;\n'''
if field_anchor not in s:
    raise SystemExit('v7.4: field anchor missing')
s = s.replace(field_anchor, field_extra, 1)

# Initialise system TTS once. This makes voice commands useful even when Gemini Live is unavailable.
create_anchor = '        deviceId = buildStableDeviceId();\n        webView = new WebView(this);'
create_repl = '''        deviceId = buildStableDeviceId();\n        nativeTts = new TextToSpeech(this, status -> {\n            if (status == TextToSpeech.SUCCESS && nativeTts != null) {\n                try { nativeTts.setLanguage(Locale.CANADA_FRENCH); } catch (Exception ignored) { }\n                try { nativeTts.setSpeechRate(1.03f); } catch (Exception ignored) { }\n            }\n        });\n        webView = new WebView(this);'''
if create_anchor not in s:
    raise SystemExit('v7.4: onCreate anchor missing')
s = s.replace(create_anchor, create_repl, 1)

# Add robust Android SpeechRecognizer flow before the old Gemini Live toggle.
method_anchor = '    private void toggleVoiceFromUi() {\n'
methods = r'''    private void toggleNativeVoiceFromUi() {
        if (nativeListening) {
            stopNativeVoiceSession();
            return;
        }
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            runJs("window.PratikoVoice && window.PratikoVoice.onNativeError && window.PratikoVoice.onNativeError('La reconnaissance vocale Android n’est pas disponible sur ce téléphone.')");
            return;
        }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingNativePermission = true;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_NATIVE_AUDIO);
            return;
        }
        startNativeVoiceSession();
    }

    private void startNativeVoiceSession() {
        main.post(() -> {
            try {
                stopNativeVoiceSession();
                nativeRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
                nativeRecognizer.setRecognitionListener(new RecognitionListener() {
                    @Override public void onReadyForSpeech(Bundle params) {
                        nativeListening = true;
                        runJs("window.PratikoVoice && window.PratikoVoice.onNativeReady && window.PratikoVoice.onNativeReady()");
                    }
                    @Override public void onBeginningOfSpeech() { nativeListening = true; }
                    @Override public void onRmsChanged(float rmsdB) { }
                    @Override public void onBufferReceived(byte[] buffer) { }
                    @Override public void onEndOfSpeech() { nativeListening = false; }
                    @Override public void onError(int error) {
                        nativeListening = false;
                        String message;
                        if (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) message = "Je n’ai rien entendu clairement. Réessaie.";
                        else if (error == SpeechRecognizer.ERROR_NETWORK || error == SpeechRecognizer.ERROR_NETWORK_TIMEOUT) message = "La reconnaissance vocale n’a pas accès au réseau pour le moment.";
                        else if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) message = "Autorise le microphone pour parler à Tiko.";
                        else message = "La reconnaissance vocale s’est interrompue. Réessaie.";
                        runJs("window.PratikoVoice && window.PratikoVoice.onNativeError && window.PratikoVoice.onNativeError(" + JSONObject.quote(message) + ")");
                        destroyNativeRecognizer();
                    }
                    @Override public void onResults(Bundle results) {
                        nativeListening = false;
                        String text = "";
                        try {
                            java.util.ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) text = matches.get(0);
                        } catch (Exception ignored) { }
                        if (!text.trim().isEmpty()) {
                            runJs("window.PratikoVoice && window.PratikoVoice.onNativeCommand && window.PratikoVoice.onNativeCommand(" + JSONObject.quote(text.trim()) + ")");
                        } else {
                            runJs("window.PratikoVoice && window.PratikoVoice.onNativeError && window.PratikoVoice.onNativeError('Je n’ai pas compris. Réessaie.')");
                        }
                        destroyNativeRecognizer();
                    }
                    @Override public void onPartialResults(Bundle partialResults) {
                        try {
                            java.util.ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                runJs("window.PratikoVoice && window.PratikoVoice.onNativePartial && window.PratikoVoice.onNativePartial(" + JSONObject.quote(matches.get(0)) + ")");
                            }
                        } catch (Exception ignored) { }
                    }
                    @Override public void onEvent(int eventType, Bundle params) { }
                });

                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "fr-CA");
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "fr-CA");
                intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
                nativeRecognizer.startListening(intent);
                nativeListening = true;
                runJs("window.PratikoVoice && window.PratikoVoice.onNativeReady && window.PratikoVoice.onNativeReady()");
            } catch (Exception e) {
                nativeListening = false;
                destroyNativeRecognizer();
                runJs("window.PratikoVoice && window.PratikoVoice.onNativeError && window.PratikoVoice.onNativeError('Le microphone n’a pas pu démarrer.')");
            }
        });
    }

    private void destroyNativeRecognizer() {
        main.post(() -> {
            try { if (nativeRecognizer != null) nativeRecognizer.destroy(); } catch (Exception ignored) { }
            nativeRecognizer = null;
            nativeListening = false;
        });
    }

    private void stopNativeVoiceSession() {
        main.post(() -> {
            try { if (nativeRecognizer != null) nativeRecognizer.cancel(); } catch (Exception ignored) { }
            try { if (nativeRecognizer != null) nativeRecognizer.destroy(); } catch (Exception ignored) { }
            nativeRecognizer = null;
            nativeListening = false;
            runJs("window.PratikoVoice && window.PratikoVoice.onNativeStopped && window.PratikoVoice.onNativeStopped()");
        });
    }

    private void speakNativeText(String text) {
        if (text == null || text.trim().isEmpty()) return;
        main.post(() -> {
            try {
                if (nativeTts != null) nativeTts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "pratiko_tiko_reply");
            } catch (Exception ignored) { }
        });
    }

    private void stopNativeSpeaking() {
        main.post(() -> { try { if (nativeTts != null) nativeTts.stop(); } catch (Exception ignored) { } });
    }

'''
if method_anchor not in s:
    raise SystemExit('v7.4: voice method anchor missing')
s = s.replace(method_anchor, methods + method_anchor, 1)

# Permission callback for the reliable native recognizer.
perm_anchor = '''        if (requestCode == REQ_AUDIO && pendingVoicePermission) {
            pendingVoicePermission = false;
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) startVoiceSession();
            else runJs("window.PratikoVoice && window.PratikoVoice.onError('Autorise le microphone pour parler avec Tiko.')");
        }
'''
perm_repl = perm_anchor + '''        if (requestCode == REQ_NATIVE_AUDIO && pendingNativePermission) {
            pendingNativePermission = false;
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) startNativeVoiceSession();
            else runJs("window.PratikoVoice && window.PratikoVoice.onNativeError && window.PratikoVoice.onNativeError('Autorise le microphone pour parler avec Tiko.')");
        }
'''
if perm_anchor not in s:
    raise SystemExit('v7.4: permission callback anchor missing')
s = s.replace(perm_anchor, perm_repl, 1)

# Expose native voice controls to the WebView.
bridge_anchor = '        @JavascriptInterface\n        public void toggleVoice() { main.post(MainActivity.this::toggleVoiceFromUi); }\n'
bridge_repl = '''        @JavascriptInterface
        public void toggleVoice() { main.post(MainActivity.this::toggleVoiceFromUi); }

        @JavascriptInterface
        public void toggleNativeVoice() { main.post(MainActivity.this::toggleNativeVoiceFromUi); }

        @JavascriptInterface
        public void stopNativeVoice() { main.post(MainActivity.this::stopNativeVoiceSession); }

        @JavascriptInterface
        public void speakText(String text) { speakNativeText(text); }

        @JavascriptInterface
        public void stopSpeaking() { stopNativeSpeaking(); }
'''
if bridge_anchor not in s:
    raise SystemExit('v7.4: JS bridge anchor missing')
s = s.replace(bridge_anchor, bridge_repl, 1)

# Stop native recognition/TTS with the Activity lifecycle.
s = s.replace('if (voiceActive || voiceStarting) stopVoiceSession();\n    }\n\n    @Override\n    protected void onDestroy()', 'if (voiceActive || voiceStarting) stopVoiceSession();\n        if (nativeListening || nativeRecognizer != null) stopNativeVoiceSession();\n        stopNativeSpeaking();\n    }\n\n    @Override\n    protected void onDestroy()', 1)
s = s.replace('        generationId.incrementAndGet();\n        stopVoiceSession();', '        generationId.incrementAndGet();\n        stopVoiceSession();\n        stopNativeVoiceSession();\n        try { if (nativeTts != null) { nativeTts.stop(); nativeTts.shutdown(); } } catch (Exception ignored) { }\n        nativeTts = null;', 1)

s = s.replace('PratikoAIAndroid/7.3', 'PratikoAIAndroid/7.4').replace('android-7.3', 'android-7.4')
main.write_text(s, encoding='utf-8')

# Load the v7.4 web voice controller after the base app scripts.
index = ASSETS / 'index.html'
h = index.read_text(encoding='utf-8')
if '<script src="v74.js"></script>' not in h:
    h = h.replace('</body>', '<script src="v74.js"></script></body>')
index.write_text(h, encoding='utf-8')

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'7.3'", "version:'7.4'")
appjs.write_text(a, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 34', 'versionCode 35').replace("versionName '7.3.0'", "versionName '7.4.0'")
gradle.write_text(g, encoding='utf-8')

print('Pratiko AI v7.4 prepared — reliable native Android speech recognition + spoken Tiko replies, while retaining Gemini Live code as secondary stack')
