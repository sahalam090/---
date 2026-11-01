package com.example

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ads.AdManager
import com.example.ui.theme.MyApplicationTheme
import com.google.android.gms.ads.AdView

class MainActivity : ComponentActivity() {

    private var webView: WebView? = null
    private var bannerAdView: AdView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // 1. Initialize Google Mobile Ads SDK with user IDs
        AdManager.initialize(this)

        // 2. Load App Open Ad on launch
        AdManager.loadAndShowAppOpenAd(this)

        // 3. Handle Android system back button navigation inside WebView
        val backCallback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val currentWebView = webView
                if (currentWebView != null) {
                    currentWebView.evaluateJavascript("window.handleAndroidBack ? window.handleAndroidBack() : false") { result ->
                        val handled = result?.replace("\"", "")?.toBoolean() ?: false
                        if (!handled) {
                            isEnabled = false
                            onBackPressedDispatcher.onBackPressed()
                            isEnabled = true
                        }
                    }
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                    isEnabled = true
                }
            }
        }
        onBackPressedDispatcher.addCallback(this, backCallback)

        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    QuranWebViewScreen(
                        onWebViewCreated = { wv -> webView = wv },
                        onBannerCreated = { bv -> bannerAdView = bv }
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        bannerAdView?.resume()
        webView?.onResume()
    }

    override fun onPause() {
        bannerAdView?.pause()
        webView?.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        bannerAdView?.destroy()
        bannerAdView = null
        webView?.destroy()
        webView = null
        super.onDestroy()
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun QuranWebViewScreen(
    onWebViewCreated: (WebView) -> Unit,
    onBannerCreated: (AdView) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var isBannerLoaded by remember { mutableStateOf(false) }

    val webView = remember {
        WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                @Suppress("DEPRECATION")
                allowFileAccessFromFileURLs = true
                @Suppress("DEPRECATION")
                allowUniversalAccessFromFileURLs = true
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                useWideViewPort = true
                loadWithOverviewMode = true
                displayZoomControls = false
                builtInZoomControls = false
                cacheMode = WebSettings.LOAD_DEFAULT
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    safeBrowsingEnabled = false
                }
            }

            webViewClient = object : WebViewClient() {
                override fun onReceivedError(
                    view: WebView?,
                    request: android.webkit.WebResourceRequest?,
                    error: android.webkit.WebResourceError?
                ) {
                    super.onReceivedError(view, request, error)
                    android.util.Log.e("QuranApp", "WebView Error: ${error?.description} for ${request?.url}")
                }

                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    // Stay inside bundled local assets unless an external link is clicked
                    if (url != null && url.startsWith("file:///android_asset/")) {
                        return false
                    }
                    if (url != null) {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            // Fallback
                        }
                    }
                    return true
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(message: android.webkit.ConsoleMessage?): Boolean {
                    android.util.Log.d("QuranApp", "JS Console: ${message?.message()} (line ${message?.lineNumber()})")
                    return true
                }
            }

            // Native Android Bridge Interface
            addJavascriptInterface(AndroidBridge(context), "AndroidBridge")

            // Load 100% offline bundled HTML interface
            loadUrl("file:///android_asset/www/index.html")
        }
    }

    val bannerView = remember {
        AdManager.createBannerAdView(
            context = context,
            onAdLoaded = {
                isBannerLoaded = true
            },
            onAdFailed = {
                isBannerLoaded = false
            }
        )
    }

    DisposableEffect(webView) {
        onWebViewCreated(webView)
        onDispose {
            webView.stopLoading()
        }
    }

    DisposableEffect(bannerView) {
        onBannerCreated(bannerView)
        onDispose {
            bannerView.destroy()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        // Main Quran Content WebView
        AndroidView(
            factory = {
                (webView.parent as? ViewGroup)?.removeView(webView)
                webView
            },
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        )

        // Native AdMob Banner Container (Visible only when ad successfully loaded)
        if (isBannerLoaded) {
            AndroidView(
                factory = {
                    (bannerView.parent as? ViewGroup)?.removeView(bannerView)
                    bannerView
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight()
                    .background(Color(0xFF033B1E))
            )
        }
    }
}

/**
 * Native Android JavaScript Interface Bridge
 */
class AndroidBridge(private val context: Context) {

    @JavascriptInterface
    fun shareAyah(arabic: String, bengali: String, surahName: String, ayahNum: Int) {
        val bnDigits = charArrayOf('০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯')
        val ayahNumBn = ayahNum.toString().map { if (it in '0'..'9') bnDigits[it - '0'] else it }.joinToString("")
        val cleanAr = arabic.trim()
        val shareText = buildString {
            if (!cleanAr.startsWith("بِسْمِ") && !cleanAr.startsWith("بِّسْمِ")) {
                append("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\n\n")
            }
            append(cleanAr).append("\n\n")
            append("বাংলা অনুবাদ:\n\"").append(bengali.trim()).append("\"\n\n")
            append("— [সূরা ").append(surahName).append(": আয়াত ").append(ayahNumBn).append("]\n")
            append("(আল-কোরআন ও সহীহ বুখারী)")
        }

        android.os.Handler(android.os.Looper.getMainLooper()).post {
            try {
                val sendIntent = Intent(Intent.ACTION_SEND).apply {
                    putExtra(Intent.EXTRA_TEXT, shareText)
                    type = "text/plain"
                }
                val chooser = Intent.createChooser(sendIntent, "আয়াত শেয়ার করুন").apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(chooser)
            } catch (e: Exception) {
                Toast.makeText(context, "শেয়ার করতে সমস্যা হয়েছে", Toast.LENGTH_SHORT).show()
            }
        }
    }

    @JavascriptInterface
    fun shareHadith(hadithNum: Int, hadithText: String, bookTitle: String) {
        val bnDigits = charArrayOf('০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯')
        val hadithNumBn = hadithNum.toString().map { if (it in '0'..'9') bnDigits[it - '0'] else it }.joinToString("")
        val shareText = buildString {
            append("সহীহ আল-বুখারী\n")
            append("হাদিস নং ").append(hadithNumBn).append(":\n\n")
            append(hadithText.trim()).append("\n\n")
            if (bookTitle.isNotBlank()) {
                append("— [অধ্যায়: ").append(bookTitle).append("]\n")
            }
            append("(আল-কোরআন ও সহীহ বুখারী)")
        }

        android.os.Handler(android.os.Looper.getMainLooper()).post {
            try {
                val sendIntent = Intent(Intent.ACTION_SEND).apply {
                    putExtra(Intent.EXTRA_TEXT, shareText)
                    type = "text/plain"
                }
                val chooser = Intent.createChooser(sendIntent, "হাদিস শেয়ার করুন").apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(chooser)
            } catch (e: Exception) {
                Toast.makeText(context, "শেয়ার করতে সমস্যা হয়েছে", Toast.LENGTH_SHORT).show()
            }
        }
    }

    @JavascriptInterface
    fun copyToClipboard(text: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        val clip = ClipData.newPlainText("Quran Ayah", text)
        clipboard?.setPrimaryClip(clip)
    }

    @JavascriptInterface
    fun showToast(message: String) {
        android.os.Handler(android.os.Looper.getMainLooper()).post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun vibrate(milliseconds: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(
                        VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(milliseconds)
                }
            }
        } catch (e: Exception) {
            // Ignore vibration exception if not supported
        }
    }

    @JavascriptInterface
    fun showInterstitialAd() {
        (context as? Activity)?.let { activity ->
            activity.runOnUiThread {
                AdManager.showInterstitial(activity)
            }
        }
    }

    @JavascriptInterface
    fun showRewardedAd() {
        (context as? Activity)?.let { activity ->
            activity.runOnUiThread {
                AdManager.showRewardedAd(
                    activity,
                    onRewarded = { amount ->
                        showToast("পুরস্কার অর্জিত হয়েছে: $amount পয়েন্ট")
                    }
                )
            }
        }
    }

    @JavascriptInterface
    fun isOnline(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        val network = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "1.0.0"
    }
}
