package com.example.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.appopen.AppOpenAd
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

object AdConfig {
    const val APP_ID = "ca-app-pub-4457456603618689~8216824297"
    const val PUBLISHER_ID = "pub-4457456603618689"
    const val BANNER_ID = "ca-app-pub-4457456603618689/6775575102"
    const val INTERSTITIAL_ID = "ca-app-pub-4457456603618689/9018595069"
    const val APP_OPEN_ID = "ca-app-pub-4457456603618689/9749825440"
    const val NATIVE_ID = "ca-app-pub-4457456603618689/8713829969"
    const val REWARD_ID = "ca-app-pub-4457456603618689/5288153480"
}

object AdManager {
    private const val TAG = "AdManager"

    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null
    private var appOpenAd: AppOpenAd? = null
    private var isAppOpenAdLoading = false
    private var isInterstitialLoading = false
    private var isRewardedLoading = false
    private var lastInterstitialShownTime: Long = 0

    fun initialize(context: Context) {
        try {
            MobileAds.initialize(context) { status ->
                Log.d(TAG, "Google Mobile Ads initialized: $status")
            }
            loadInterstitial(context)
            loadRewardedAd(context)
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing MobileAds", e)
        }
    }

    /**
     * Create Banner AdView
     */
    fun createBannerAdView(context: Context, onAdLoaded: () -> Unit = {}, onAdFailed: () -> Unit = {}): AdView {
        return AdView(context).apply {
            setAdSize(AdSize.BANNER)
            adUnitId = AdConfig.BANNER_ID
            adListener = object : com.google.android.gms.ads.AdListener() {
                override fun onAdLoaded() {
                    super.onAdLoaded()
                    onAdLoaded()
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    super.onAdFailedToLoad(error)
                    Log.d(TAG, "Banner failed to load: ${error.message}")
                    onAdFailed()
                }
            }
            loadAd(AdRequest.Builder().build())
        }
    }

    /**
     * App Open Ad
     */
    fun loadAndShowAppOpenAd(activity: Activity) {
        try {
            if (appOpenAd != null || isAppOpenAdLoading) return

            isAppOpenAdLoading = true
            val request = AdRequest.Builder().build()
            AppOpenAd.load(
                activity,
                AdConfig.APP_OPEN_ID,
                request,
                object : AppOpenAd.AppOpenAdLoadCallback() {
                    override fun onAdLoaded(ad: AppOpenAd) {
                        appOpenAd = ad
                        isAppOpenAdLoading = false
                        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                            override fun onAdDismissedFullScreenContent() {
                                appOpenAd = null
                            }

                            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                                appOpenAd = null
                            }
                        }
                        if (!activity.isFinishing && !activity.isDestroyed) {
                            ad.show(activity)
                        }
                    }

                    override fun onAdFailedToLoad(error: LoadAdError) {
                        isAppOpenAdLoading = false
                        appOpenAd = null
                        Log.d(TAG, "App Open Ad failed to load: ${error.message}")
                    }
                }
            )
        } catch (e: Exception) {
            isAppOpenAdLoading = false
            Log.e(TAG, "Error loading App Open Ad", e)
        }
    }

    /**
     * Interstitial Ad
     */
    fun loadInterstitial(context: Context) {
        if (interstitialAd != null || isInterstitialLoading) return

        isInterstitialLoading = true
        val request = AdRequest.Builder().build()
        InterstitialAd.load(
            context,
            AdConfig.INTERSTITIAL_ID,
            request,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                    isInterstitialLoading = false
                    Log.d(TAG, "Interstitial loaded successfully")
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    interstitialAd = null
                    isInterstitialLoading = false
                    Log.d(TAG, "Interstitial failed to load: ${error.message}")
                }
            }
        )
    }

    fun showInterstitial(activity: Activity, onDismissed: () -> Unit = {}): Boolean {
        // Enforce 60-second cooldown so Quran reading flow is never aggressively disrupted
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastInterstitialShownTime < 60_000) {
            onDismissed()
            return false
        }

        val ad = interstitialAd
        if (ad != null && !activity.isFinishing && !activity.isDestroyed) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    interstitialAd = null
                    lastInterstitialShownTime = System.currentTimeMillis()
                    loadInterstitial(activity)
                    onDismissed()
                }

                override fun onAdFailedToShowFullScreenContent(error: AdError) {
                    interstitialAd = null
                    loadInterstitial(activity)
                    onDismissed()
                }
            }
            ad.show(activity)
            return true
        } else {
            loadInterstitial(activity)
            onDismissed()
            return false
        }
    }

    /**
     * Rewarded Ad
     */
    fun loadRewardedAd(context: Context) {
        if (rewardedAd != null || isRewardedLoading) return

        isRewardedLoading = true
        val request = AdRequest.Builder().build()
        RewardedAd.load(
            context,
            AdConfig.REWARD_ID,
            request,
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    rewardedAd = ad
                    isRewardedLoading = false
                    Log.d(TAG, "Rewarded Ad loaded successfully")
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    rewardedAd = null
                    isRewardedLoading = false
                    Log.d(TAG, "Rewarded Ad failed to load: ${error.message}")
                }
            }
        )
    }

    fun showRewardedAd(activity: Activity, onRewarded: (Int) -> Unit, onDismissed: () -> Unit = {}): Boolean {
        val ad = rewardedAd
        if (ad != null && !activity.isFinishing && !activity.isDestroyed) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    rewardedAd = null
                    loadRewardedAd(activity)
                    onDismissed()
                }

                override fun onAdFailedToShowFullScreenContent(error: AdError) {
                    rewardedAd = null
                    loadRewardedAd(activity)
                    onDismissed()
                }
            }
            ad.show(activity) { rewardItem ->
                onRewarded(rewardItem.amount)
            }
            return true
        } else {
            loadRewardedAd(activity)
            onDismissed()
            return false
        }
    }
}
