package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("আল-কোরআন বাংলা", appName)
  }

  @Test
  fun `verify android bridge functions`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val bridge = AndroidBridge(context)
    assertEquals("1.0.0", bridge.getAppVersion())
  }

  @Test
  fun `verify bundled offline quran assets exist`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val assetManager = context.assets
    
    // Verify index.html exists
    val indexStream = assetManager.open("www/index.html")
    assertNotNull(indexStream)
    assertTrue(indexStream.available() > 0)
    indexStream.close()

    // Verify metadata exists
    val metaStream = assetManager.open("www/data/surahs_metadata.js")
    assertNotNull(metaStream)
    assertTrue(metaStream.available() > 0)
    metaStream.close()

    // Verify complete quran dataset exists
    val quranStream = assetManager.open("www/data/quran_complete.js")
    assertNotNull(quranStream)
    assertTrue(quranStream.available() > 0)
    quranStream.close()

    // Verify Sahih al-Bukhari metadata exists
    val bukhariStream = assetManager.open("www/data/hadith/bukhari_books_meta.js")
    assertNotNull(bukhariStream)
    assertTrue(bukhariStream.available() > 0)
    bukhariStream.close()

    // Verify Sahih al-Bukhari preloaded data exists
    val bukhariPreloadStream = assetManager.open("www/data/hadith/bukhari_preloaded.js")
    assertNotNull(bukhariPreloadStream)
    assertTrue(bukhariPreloadStream.available() > 0)
    bukhariPreloadStream.close()
  }
}
