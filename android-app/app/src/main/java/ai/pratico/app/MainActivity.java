package ai.pratico.app;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.AudioTrack;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

public class MainActivity extends Activity {
    private static final String APP_URL = "file:///android_asset/index.html";
    private static final String CONFIG_URL = "https://atelierpratico.github.io/pratico-ai-config.json";
    private static final int REQ_AUDIO = 301;

    private WebView webView;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService executor = Executors.newCachedThreadPool();
    private final AtomicInteger generationId = new AtomicInteger(0);
    private final OkHttpClient wsClient = new OkHttpClient.Builder().pingInterval(20, TimeUnit.SECONDS).build();

    private volatile String apiUrl = "";
    private volatile String voiceUrl = "";
    private volatile boolean pageReady = false;
    private String deviceId = "";

    private volatile boolean voiceActive = false;
    private volatile boolean voiceStarting = false;
    private volatile boolean pendingVoicePermission = false;
    private WebSocket voiceSocket;
    private AudioRecord audioRecord;
    private AudioTrack audioTrack;
    private Thread audioThread;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(9, 11, 14));
        getWindow().setNavigationBarColor(Color.rgb(9, 11, 14));
        getWindow().getDecorView().setSystemUiVisibility(0);

        deviceId = buildStableDeviceId();
        webView = new WebView(this);
        configureWebView();
        setContentView(webView);
        webView.loadUrl(APP_URL);
        fetchRemoteConfig();
    }

    private String buildStableDeviceId() {
        try {
            String raw = Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
            if (raw == null || raw.isEmpty()) raw = getPackageName() + "-fallback";
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest((getPackageName() + ":" + raw).getBytes(StandardCharsets.UTF_8));
            StringBuilder out = new StringBuilder();
            for (byte b : digest) out.append(String.format("%02x", b));
            return out.toString();
        } catch (Exception e) {
            return "pratiko-android-fallback-0001";
        }
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setTextZoom(100);
        settings.setUserAgentString(settings.getUserAgentString() + " PratikoAIAndroid/3.1");

        webView.setBackgroundColor(Color.rgb(9, 11, 14));
        webView.addJavascriptInterface(new ChatBridge(), "PraticoNative");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                pageReady = true;
                notifyEngineStatus();
            }
        });
    }

    private void fetchRemoteConfig() {
        executor.execute(() -> {
            HttpURLConnection conn = null;
            try {
                conn = (HttpURLConnection) new URL(CONFIG_URL + "?v=" + System.currentTimeMillis()).openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setRequestProperty("Accept", "application/json");
                if (conn.getResponseCode() >= 200 && conn.getResponseCode() < 300) {
                    String body = readAll(conn.getInputStream());
                    JSONObject obj = new JSONObject(body);
                    apiUrl = obj.optString("api_url", "").trim();
                    voiceUrl = obj.optString("voice_url", "").trim();
                }
            } catch (Exception ignored) {
                apiUrl = "";
                voiceUrl = "";
            } finally {
                if (conn != null) conn.disconnect();
                notifyEngineStatus();
            }
        });
    }

    private void notifyEngineStatus() {
        if (!pageReady) return;
        String status = apiUrl.isEmpty() ? "setup" : "ready";
        runJs("window.PraticoCloud && window.PraticoCloud.onEngineStatus(" + JSONObject.quote(status) + ")");
        runJs("window.PratikoVoice && window.PratikoVoice.onAvailability(" + (!voiceUrl.isEmpty()) + ")");
    }

    private void runJs(String js) {
        main.post(() -> {
            if (webView != null) webView.evaluateJavascript(js, null);
        });
    }

    private String readAll(InputStream input) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) out.append(line).append('\n');
        return out.toString().trim();
    }

    private void streamCloud(String payload, int requestId) {
        HttpURLConnection conn = null;
        try {
            runJs("window.PraticoCloud.onStart()");
            conn = (HttpURLConnection) new URL(apiUrl).openConnection();
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(120000);
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            conn.setRequestProperty("Accept", "text/event-stream, application/json");
            conn.setRequestProperty("X-Pratiko-Client", "android-3.1");
            conn.setRequestProperty("X-Pratiko-Device", deviceId);
            byte[] bytes = payload.getBytes(StandardCharsets.UTF_8);
            conn.getOutputStream().write(bytes);
            conn.getOutputStream().flush();

            int code = conn.getResponseCode();
            String remoteConversationId = conn.getHeaderField("X-Pratiko-Conversation-ID");
            if (remoteConversationId == null || remoteConversationId.isEmpty()) remoteConversationId = conn.getHeaderField("X-Pratico-Conversation-ID");
            if (remoteConversationId != null && !remoteConversationId.isEmpty()) {
                runJs("window.PraticoCloud.onConversationId(" + JSONObject.quote(remoteConversationId) + ")");
            }

            if (code < 200 || code >= 300) {
                InputStream err = conn.getErrorStream();
                String detail = err != null ? readAll(err) : ("HTTP " + code);
                String message = "Tiko n’a pas réussi à joindre le moteur Pratiko AI. Réessaie dans un instant.";
                String errorCode = "network";
                try {
                    JSONObject obj = new JSONObject(detail);
                    errorCode = obj.optString("error", errorCode);
                    message = obj.optString("message", message);
                } catch (Exception ignored) { }
                runJs("window.PraticoCloud.onError(" + JSONObject.quote(errorCode) + "," + JSONObject.quote(message) + ")");
                return;
            }

            String type = conn.getContentType() == null ? "" : conn.getContentType().toLowerCase();
            if (type.contains("text/event-stream")) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                String line;
                while ((line = reader.readLine()) != null && generationId.get() == requestId) {
                    if (!line.startsWith("data:")) continue;
                    String data = line.substring(5).trim();
                    if (data.isEmpty()) continue;
                    if ("[DONE]".equals(data)) break;
                    String delta = "";
                    try {
                        JSONObject obj = new JSONObject(data);
                        delta = obj.optString("delta", obj.optString("text", ""));
                    } catch (Exception ignored) {
                        delta = data;
                    }
                    if (!delta.isEmpty()) runJs("window.PraticoCloud.onToken(" + JSONObject.quote(delta) + ")");
                }
            } else {
                String body = readAll(conn.getInputStream());
                String text = body;
                try {
                    JSONObject obj = new JSONObject(body);
                    text = obj.optString("text", obj.optString("output_text", body));
                } catch (Exception ignored) { }
                if (!text.isEmpty() && generationId.get() == requestId) runJs("window.PraticoCloud.onToken(" + JSONObject.quote(text) + ")");
            }

            if (generationId.get() == requestId) runJs("window.PraticoCloud.onDone()");
        } catch (Exception e) {
            if (generationId.get() == requestId) {
                String msg = "Tiko n’a pas réussi à joindre le moteur Pratiko AI. Réessaie dans un instant.";
                runJs("window.PraticoCloud.onError('network'," + JSONObject.quote(msg) + ")");
            }
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private void toggleVoiceFromUi() {
        if (voiceActive || voiceStarting) {
            stopVoiceSession();
            return;
        }
        if (voiceUrl.isEmpty()) {
            runJs("window.PratikoVoice && window.PratikoVoice.onError('Le service vocal de Tiko n’est pas encore configuré.')");
            return;
        }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingVoicePermission = true;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_AUDIO);
            return;
        }
        startVoiceSession();
    }

    private void startVoiceSession() {
        if (voiceStarting || voiceActive) return;
        voiceStarting = true;
        runJs("window.PratikoVoice && window.PratikoVoice.onState('connecting')");
        executor.execute(() -> {
            HttpURLConnection conn = null;
            try {
                conn = (HttpURLConnection) new URL(voiceUrl).openConnection();
                conn.setRequestMethod("POST");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(12000);
                conn.setDoOutput(true);
                conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                conn.setRequestProperty("X-Pratiko-Device", deviceId);
                conn.getOutputStream().write("{}".getBytes(StandardCharsets.UTF_8));
                conn.getOutputStream().flush();
                int code = conn.getResponseCode();
                String body = readAll(code >= 200 && code < 300 ? conn.getInputStream() : conn.getErrorStream());
                if (code < 200 || code >= 300) {
                    String message = "Impossible de démarrer le mode vocal de Tiko.";
                    try { message = new JSONObject(body).optString("message", message); } catch (Exception ignored) { }
                    voiceStarting = false;
                    runJs("window.PratikoVoice && window.PratikoVoice.onError(" + JSONObject.quote(message) + ")");
                    return;
                }
                JSONObject obj = new JSONObject(body);
                String token = obj.optString("token", "");
                String model = obj.optString("model", "gemini-3.8-live");
                String wsBase = obj.optString("websocket_url", "");
                String voiceName = obj.optString("voice", "Kore");
                if (token.isEmpty() || wsBase.isEmpty()) throw new Exception("missing voice token");
                connectGeminiVoice(token, model, wsBase, voiceName);
            } catch (Exception e) {
                voiceStarting = false;
                runJs("window.PratikoVoice && window.PratikoVoice.onError('Le mode vocal de Tiko est temporairement indisponible.')");
            } finally {
                if (conn != null) conn.disconnect();
            }
        });
    }

    private void connectGeminiVoice(String token, String model, String wsBase, String voiceName) throws Exception {
        String wsUrl = wsBase + "?access_token=" + URLEncoder.encode(token, StandardCharsets.UTF_8.toString());
        Request request = new Request.Builder().url(wsUrl).build();
        voiceSocket = wsClient.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                try {
                    JSONObject setup = new JSONObject();
                    setup.put("model", "models/" + model);
                    JSONObject generationConfig = new JSONObject();
                    generationConfig.put("responseModalities", new JSONArray().put("AUDIO"));
                    JSONObject speechConfig = new JSONObject();
                    JSONObject voiceConfig = new JSONObject();
                    voiceConfig.put("prebuiltVoiceConfig", new JSONObject().put("voiceName", voiceName));
                    speechConfig.put("voiceConfig", voiceConfig);
                    generationConfig.put("speechConfig", speechConfig);
                    setup.put("generationConfig", generationConfig);
                    setup.put("inputAudioTranscription", new JSONObject());
                    setup.put("outputAudioTranscription", new JSONObject());
                    setup.put("systemInstruction", new JSONObject().put("parts", new JSONArray().put(new JSONObject().put("text", "Tu es Tiko, l'assistant vocal de Pratiko AI. Parle naturellement, chaleureusement et de façon concise. Réponds en français par défaut, sauf si la personne parle dans une autre langue."))));
                    webSocket.send(new JSONObject().put("setup", setup).toString());
                } catch (Exception e) {
                    runJs("window.PratikoVoice && window.PratikoVoice.onError('Erreur de préparation de la voix.')");
                    stopVoiceSession();
                }
            }

            @Override
            public void onMessage(WebSocket webSocket, String text) {
                try {
                    JSONObject msg = new JSONObject(text);
                    if (msg.has("setupComplete")) {
                        voiceStarting = false;
                        voiceActive = true;
                        prepareAudioOutput();
                        startMicrophoneStream(webSocket);
                        runJs("window.PratikoVoice && window.PratikoVoice.onState('listening')");
                        return;
                    }
                    JSONObject server = msg.optJSONObject("serverContent");
                    if (server == null) return;
                    JSONObject inputT = server.optJSONObject("inputTranscription");
                    if (inputT != null) {
                        String t = inputT.optString("text", "");
                        if (!t.isEmpty()) runJs("window.PratikoVoice && window.PratikoVoice.onTranscript('user'," + JSONObject.quote(t) + ")");
                    }
                    JSONObject outputT = server.optJSONObject("outputTranscription");
                    if (outputT != null) {
                        String t = outputT.optString("text", "");
                        if (!t.isEmpty()) runJs("window.PratikoVoice && window.PratikoVoice.onTranscript('assistant'," + JSONObject.quote(t) + ")");
                    }
                    JSONObject modelTurn = server.optJSONObject("modelTurn");
                    if (modelTurn != null) {
                        JSONArray parts = modelTurn.optJSONArray("parts");
                        if (parts != null) {
                            for (int i = 0; i < parts.length(); i++) {
                                JSONObject inline = parts.optJSONObject(i) == null ? null : parts.optJSONObject(i).optJSONObject("inlineData");
                                if (inline != null) {
                                    String data = inline.optString("data", "");
                                    if (!data.isEmpty()) playVoiceAudio(Base64.decode(data, Base64.DEFAULT));
                                }
                            }
                        }
                    }
                    if (server.optBoolean("turnComplete", false)) runJs("window.PratikoVoice && window.PratikoVoice.onState('listening')");
                } catch (Exception ignored) { }
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                voiceStarting = false;
                voiceActive = false;
                releaseAudio();
                runJs("window.PratikoVoice && window.PratikoVoice.onError('La conversation vocale a été interrompue.')");
            }

            @Override
            public void onClosed(WebSocket webSocket, int code, String reason) {
                voiceStarting = false;
                voiceActive = false;
                releaseAudio();
                runJs("window.PratikoVoice && window.PratikoVoice.onState('idle')");
            }
        });
    }

    private void prepareAudioOutput() {
        try {
            int min = AudioTrack.getMinBufferSize(24000, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_16BIT);
            audioTrack = new AudioTrack.Builder()
                    .setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
                    .setAudioFormat(new AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(24000).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                    .setBufferSizeInBytes(Math.max(min, 9600))
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .build();
            audioTrack.play();
        } catch (Exception ignored) { }
    }

    private void startMicrophoneStream(WebSocket socket) {
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) return;
        try {
            int min = AudioRecord.getMinBufferSize(16000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
            audioRecord = new AudioRecord(MediaRecorder.AudioSource.VOICE_COMMUNICATION, 16000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, Math.max(min, 6400));
            audioRecord.startRecording();
            audioThread = new Thread(() -> {
                byte[] buffer = new byte[3200];
                while (voiceActive && socket == voiceSocket) {
                    try {
                        int n = audioRecord.read(buffer, 0, buffer.length);
                        if (n > 0) {
                            byte[] chunk = n == buffer.length ? buffer : Arrays.copyOf(buffer, n);
                            String b64 = Base64.encodeToString(chunk, Base64.NO_WRAP);
                            JSONObject audio = new JSONObject().put("data", b64).put("mimeType", "audio/pcm;rate=16000");
                            JSONObject realtime = new JSONObject().put("audio", audio);
                            socket.send(new JSONObject().put("realtimeInput", realtime).toString());
                        }
                    } catch (Exception e) { break; }
                }
            }, "PratikoVoiceMic");
            audioThread.start();
        } catch (Exception e) {
            runJs("window.PratikoVoice && window.PratikoVoice.onError('Le microphone n’a pas pu démarrer.')");
            stopVoiceSession();
        }
    }

    private void playVoiceAudio(byte[] audio) {
        try {
            AudioTrack track = audioTrack;
            if (track != null && voiceActive) track.write(audio, 0, audio.length);
        } catch (Exception ignored) { }
    }

    private synchronized void releaseAudio() {
        try { if (audioRecord != null) { audioRecord.stop(); audioRecord.release(); } } catch (Exception ignored) { }
        audioRecord = null;
        try { if (audioTrack != null) { audioTrack.pause(); audioTrack.flush(); audioTrack.release(); } } catch (Exception ignored) { }
        audioTrack = null;
    }

    private synchronized void stopVoiceSession() {
        voiceActive = false;
        voiceStarting = false;
        releaseAudio();
        if (voiceSocket != null) {
            try { voiceSocket.close(1000, "user_stop"); } catch (Exception ignored) { }
            voiceSocket = null;
        }
        runJs("window.PratikoVoice && window.PratikoVoice.onState('idle')");
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_AUDIO && pendingVoicePermission) {
            pendingVoicePermission = false;
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) startVoiceSession();
            else runJs("window.PratikoVoice && window.PratikoVoice.onError('Autorise le microphone pour parler avec Tiko.')");
        }
    }

    public class ChatBridge {
        @JavascriptInterface
        public String getEngineStatus() { return apiUrl.isEmpty() ? "setup" : "ready"; }

        @JavascriptInterface
        public void sendMessage(String payload) {
            int requestId = generationId.incrementAndGet();
            if (apiUrl.isEmpty()) {
                runJs("window.PraticoCloud.onError('cloud_not_connected','Le backend Pratiko AI n’est pas encore joignable.')");
                return;
            }
            executor.execute(() -> streamCloud(payload, requestId));
        }

        @JavascriptInterface
        public void cancelGeneration() {
            generationId.incrementAndGet();
            runJs("window.PraticoCloud.onDone()");
        }

        @JavascriptInterface
        public void toggleVoice() { main.post(MainActivity.this::toggleVoiceFromUi); }

        @JavascriptInterface
        public void stopVoice() { main.post(MainActivity.this::stopVoiceSession); }
    }

    @Override
    public void onBackPressed() {
        if (voiceActive || voiceStarting) { stopVoiceSession(); return; }
        runJs("if(document.getElementById('drawer')?.classList.contains('open')){document.getElementById('closeDrawer').click()}else{history.back()}");
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (voiceActive || voiceStarting) stopVoiceSession();
    }

    @Override
    protected void onDestroy() {
        generationId.incrementAndGet();
        stopVoiceSession();
        executor.shutdownNow();
        wsClient.dispatcher().executorService().shutdown();
        if (webView != null) {
            webView.removeJavascriptInterface("PraticoNative");
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }
}
