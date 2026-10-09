package ai.pratico.app;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class MainActivity extends Activity {
    private static final String APP_URL = "file:///android_asset/index.html";
    private static final String CONFIG_URL = "https://atelierpratico.github.io/pratico-ai-config.json";

    private WebView webView;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService executor = Executors.newCachedThreadPool();
    private final AtomicInteger generationId = new AtomicInteger(0);
    private volatile String apiUrl = "";
    private volatile boolean pageReady = false;
    private String deviceId = "";

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
        settings.setUserAgentString(settings.getUserAgentString() + " PratikoAIAndroid/3.0");

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
                }
            } catch (Exception ignored) {
                apiUrl = "";
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
            conn.setRequestProperty("X-Pratico-Client", "android-3.0");
            conn.setRequestProperty("X-Pratico-Device", deviceId);
            byte[] bytes = payload.getBytes(StandardCharsets.UTF_8);
            conn.getOutputStream().write(bytes);
            conn.getOutputStream().flush();

            int code = conn.getResponseCode();
            String remoteConversationId = conn.getHeaderField("X-Pratico-Conversation-ID");
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
                if (!text.isEmpty() && generationId.get() == requestId) {
                    runJs("window.PraticoCloud.onToken(" + JSONObject.quote(text) + ")");
                }
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

    public class ChatBridge {
        @JavascriptInterface
        public String getEngineStatus() {
            return apiUrl.isEmpty() ? "setup" : "ready";
        }

        @JavascriptInterface
        public void sendMessage(String payload) {
            int requestId = generationId.incrementAndGet();
            if (apiUrl.isEmpty()) {
                runJs("window.PraticoCloud.onError('cloud_not_connected'," + JSONObject.quote("Le backend Pratiko AI n’est pas encore joignable.") + ")");
                return;
            }
            executor.execute(() -> streamCloud(payload, requestId));
        }

        @JavascriptInterface
        public void cancelGeneration() {
            generationId.incrementAndGet();
            runJs("window.PraticoCloud.onDone()");
        }
    }

    @Override
    public void onBackPressed() {
        runJs("if(document.getElementById('drawer')?.classList.contains('open')){document.getElementById('closeDrawer').click()}else{history.back()}");
    }

    @Override
    protected void onDestroy() {
        generationId.incrementAndGet();
        executor.shutdownNow();
        if (webView != null) {
            webView.removeJavascriptInterface("PraticoNative");
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }
}
