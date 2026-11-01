/**
 * আল-কোরআন ও সহীহ বুখারী শরীফ - সম্পূর্ণ অফলাইন ইসলামিক লাইব্রেরি
 * Complete Offline Quran & Sahih al-Bukhari App Logic
 */

(function () {
  'use strict';

  // State Management
  const state = {
    currentView: 'home',
    activeSurahNumber: null,
    activeAyahNumber: null,
    activeHadithBookNumber: null,
    filter: 'all',
    bukhariFilter: 'all',

    // Quran Data
    surahsMetadata: window.QURAN_METADATA || [],
    quranData: window.QURAN_DATA || [],
    bookmarks: JSON.parse(localStorage.getItem('quran_bookmarks') || '[]'),
    lastRead: JSON.parse(localStorage.getItem('quran_last_read') || 'null'),

    // Bukhari Hadith Data
    bukhariMetadata: window.BUKHARI_METADATA || [],
    bukhariBooks: window.BUKHARI_BOOKS || window.BUKHARI_PRELOADED || {},
    hadithBookmarks: JSON.parse(localStorage.getItem('hadith_bookmarks') || '[]'),
    loadingBooks: {},

    settings: {
      arabicSize: parseInt(localStorage.getItem('quran_ar_size') || '28', 10),
      bengaliSize: parseInt(localStorage.getItem('quran_bn_size') || '16', 10),
      showArabic: localStorage.getItem('quran_show_ar') !== 'false',
      showBengali: localStorage.getItem('quran_show_bn') !== 'false',
      darkMode: localStorage.getItem('quran_dark_mode') === 'true'
    },

    audio: {
      player: new Audio(),
      isPlaying: false,
      currentAyahGlobalId: null,
      currentSurahNumber: null,
      currentAyahNumberInSurah: null
    }
  };

  // DOM Elements Cache
  const dom = {
    app: document.getElementById('app'),
    appHeader: document.getElementById('appHeader'),
    btnHeaderBack: document.getElementById('btnHeaderBack'),
    headerTitle: document.getElementById('headerTitle'),
    headerSubtitle: document.getElementById('headerSubtitle'),
    headerBranding: document.getElementById('headerBranding'),
    btnQuickSearch: document.getElementById('btnQuickSearch'),
    btnSurahSettings: document.getElementById('btnSurahSettings'),

    // Views
    views: {
      home: document.getElementById('viewHome'),
      surah: document.getElementById('viewSurah'),
      bukhari: document.getElementById('viewBukhari'),
      hadithList: document.getElementById('viewHadithList'),
      search: document.getElementById('viewSearch'),
      bookmarks: document.getElementById('viewBookmarks'),
      settings: document.getElementById('viewSettings')
    },
    bottomNav: document.getElementById('bottomNav'),
    navItems: document.querySelectorAll('.bottom-nav .nav-item'),

    // Home / Quran
    homeSearchInput: document.getElementById('homeSearchInput'),
    btnClearHomeSearch: document.getElementById('btnClearHomeSearch'),
    surahList: document.getElementById('surahList'),
    surahCountBadge: document.getElementById('surahCountBadge'),
    noSurahMatch: document.getElementById('noSurahMatch'),
    filterChips: document.querySelectorAll('.filter-chips .chip'),
    lastReadCard: document.getElementById('lastReadCard'),
    lastReadSurahText: document.getElementById('lastReadSurahText'),
    lastReadAyahText: document.getElementById('lastReadAyahText'),
    btnResumeRead: document.getElementById('btnResumeRead'),

    // Surah Reading
    readingSurahNumber: document.getElementById('readingSurahNumber'),
    readingSurahAr: document.getElementById('readingSurahAr'),
    readingSurahBn: document.getElementById('readingSurahBn'),
    readingSurahMeta: document.getElementById('readingSurahMeta'),
    bismillahBanner: document.getElementById('bismillahBanner'),
    ayahsContainer: document.getElementById('ayahsContainer'),
    btnOpenJumpModal: document.getElementById('btnOpenJumpModal'),
    btnPrevSurah: document.getElementById('btnPrevSurah'),
    btnNextSurah: document.getElementById('btnNextSurah'),
    prevSurahName: document.getElementById('prevSurahName'),
    nextSurahName: document.getElementById('nextSurahName'),

    // Sahih al-Bukhari Book List
    bukhariSearchInput: document.getElementById('bukhariSearchInput'),
    btnClearBukhariSearch: document.getElementById('btnClearBukhariSearch'),
    bukhariBookList: document.getElementById('bukhariBookList'),
    bukhariCountBadge: document.getElementById('bukhariCountBadge'),
    noBukhariMatch: document.getElementById('noBukhariMatch'),
    bukhariFilterChips: document.querySelectorAll('[data-bukhari-filter]'),

    // Bukhari Hadith Reader
    readingHadithBookNumber: document.getElementById('readingHadithBookNumber'),
    readingHadithBookAr: document.getElementById('readingHadithBookAr'),
    readingHadithBookBn: document.getElementById('readingHadithBookBn'),
    readingHadithBookMeta: document.getElementById('readingHadithBookMeta'),
    hadithsContainer: document.getElementById('hadithsContainer'),
    btnOpenJumpHadithModal: document.getElementById('btnOpenJumpHadithModal'),
    btnPrevHadithBook: document.getElementById('btnPrevHadithBook'),
    btnNextHadithBook: document.getElementById('btnNextHadithBook'),
    prevHadithBookName: document.getElementById('prevHadithBookName'),
    nextHadithBookName: document.getElementById('nextHadithBookName'),

    // Search
    verseSearchInput: document.getElementById('verseSearchInput'),
    btnClearVerseSearch: document.getElementById('btnClearVerseSearch'),
    verseSearchResults: document.getElementById('verseSearchResults'),
    verseSearchResultsInfo: document.getElementById('verseSearchResultsInfo'),
    searchResultCount: document.getElementById('searchResultCount'),
    searchPromptState: document.getElementById('searchPromptState'),
    noVerseMatch: document.getElementById('noVerseMatch'),

    // Bookmarks
    bookmarksList: document.getElementById('bookmarksList'),
    noBookmarksState: document.getElementById('noBookmarksState'),

    // Settings
    sliderArabicFont: document.getElementById('sliderArabicFont'),
    sliderBengaliFont: document.getElementById('sliderBengaliFont'),
    lblArabicSize: document.getElementById('lblArabicSize'),
    lblBengaliSize: document.getElementById('lblBengaliSize'),
    toggleShowBengali: document.getElementById('toggleShowBengali'),
    toggleShowArabic: document.getElementById('toggleShowArabic'),
    toggleDarkMode: document.getElementById('toggleDarkMode'),

    // Audio Player
    audioPlayerBar: document.getElementById('audioPlayerBar'),
    audioPlayerSurah: document.getElementById('audioPlayerSurah'),
    audioPlayerAyah: document.getElementById('audioPlayerAyah'),
    btnAudioPlayPause: document.getElementById('btnAudioPlayPause'),
    btnAudioPrev: document.getElementById('btnAudioPrev'),
    btnAudioNext: document.getElementById('btnAudioNext'),
    btnAudioClose: document.getElementById('btnAudioClose'),
    svgPlay: document.getElementById('svgPlay'),
    svgPause: document.getElementById('svgPause'),
    audioProgressFill: document.getElementById('audioProgressFill'),

    // Jump Modals
    modalJumpAyah: document.getElementById('modalJumpAyah'),
    jumpAyahRangeText: document.getElementById('jumpAyahRangeText'),
    inputJumpAyahNumber: document.getElementById('inputJumpAyahNumber'),
    btnDoJumpAyah: document.getElementById('btnDoJumpAyah'),
    btnCloseJumpModal: document.getElementById('btnCloseJumpModal'),

    modalJumpHadith: document.getElementById('modalJumpHadith'),
    jumpHadithRangeText: document.getElementById('jumpHadithRangeText'),
    inputJumpHadithNumber: document.getElementById('inputJumpHadithNumber'),
    btnDoJumpHadith: document.getElementById('btnDoJumpHadith'),
    btnCloseJumpHadithModal: document.getElementById('btnCloseJumpHadithModal'),

    // Toast
    toastNotification: document.getElementById('toastNotification'),
    toastMessage: document.getElementById('toastMessage')
  };

  // Convert English digits to Bengali numerals
  function toBengaliNumeral(num) {
    if (num === null || num === undefined) return '';
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, function (d) {
      return digits[parseInt(d, 10)];
    });
  }

  // Toast notification
  let toastTimer = null;
  function showToast(msg) {
    if (!dom.toastNotification) return;
    dom.toastMessage.textContent = msg;
    dom.toastNotification.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      dom.toastNotification.classList.add('hidden');
    }, 2200);

    if (window.AndroidBridge && window.AndroidBridge.showToast) {
      window.AndroidBridge.showToast(msg);
    }
  }

  // Haptic feedback
  function triggerHaptic() {
    if (window.AndroidBridge && window.AndroidBridge.vibrate) {
      window.AndroidBridge.vibrate(25);
    } else if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  }

  // Apply Settings & Typography
  function applySettings() {
    if (state.settings.darkMode) {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
      dom.toggleDarkMode.checked = true;
    } else {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
      dom.toggleDarkMode.checked = false;
    }

    dom.sliderArabicFont.value = state.settings.arabicSize;
    dom.sliderBengaliFont.value = state.settings.bengaliSize;
    dom.lblArabicSize.textContent = toBengaliNumeral(state.settings.arabicSize) + ' পিক্সেল';
    dom.lblBengaliSize.textContent = toBengaliNumeral(state.settings.bengaliSize) + ' পিক্সেল';

    dom.toggleShowArabic.checked = state.settings.showArabic;
    dom.toggleShowBengali.checked = state.settings.showBengali;

    document.querySelectorAll('.ayah-arabic-text').forEach(function (el) {
      el.style.fontSize = state.settings.arabicSize + 'px';
      el.style.display = state.settings.showArabic ? 'block' : 'none';
    });
    document.querySelectorAll('.ayah-bengali-text').forEach(function (el) {
      el.style.fontSize = state.settings.bengaliSize + 'px';
      el.style.display = state.settings.showBengali ? 'block' : 'none';
    });
  }

  // Switch View
  function switchView(viewName) {
    state.currentView = viewName;
    Object.keys(dom.views).forEach(function (name) {
      if (dom.views[name]) {
        dom.views[name].classList.toggle('active', name === viewName);
      }
    });

    // Update bottom nav
    dom.navItems.forEach(function (item) {
      const v = item.dataset.view;
      item.classList.toggle('active', v === viewName || (viewName === 'surah' && v === 'home') || (viewName === 'hadithList' && v === 'bukhari'));
    });

    // Update Header Bar
    if (viewName === 'home') {
      dom.btnHeaderBack.classList.add('hidden');
      dom.headerBranding.classList.remove('hidden');
      dom.headerTitle.textContent = 'আল-কোরআন বাংলা';
      dom.headerSubtitle.textContent = 'সম্পূর্ণ ১১৪টি সূরা • অফলাইন';
      dom.btnQuickSearch.classList.remove('hidden');
      dom.btnSurahSettings.classList.add('hidden');
      window.scrollTo(0, 0);
    } else if (viewName === 'surah') {
      dom.btnHeaderBack.classList.remove('hidden');
      dom.headerBranding.classList.add('hidden');
      const meta = state.surahsMetadata.find(s => s.number === state.activeSurahNumber);
      if (meta) {
        dom.headerTitle.textContent = meta.nameBn;
        dom.headerSubtitle.textContent = meta.nameAr + ' • ' + toBengaliNumeral(meta.ayahsCount) + ' আয়াত';
      }
      dom.btnQuickSearch.classList.add('hidden');
      dom.btnSurahSettings.classList.remove('hidden');
      window.scrollTo(0, 0);
    } else if (viewName === 'bukhari') {
      dom.btnHeaderBack.classList.add('hidden');
      dom.headerBranding.classList.remove('hidden');
      dom.headerTitle.textContent = 'সহীহ আল-বুখারী';
      dom.headerSubtitle.textContent = '৯৭টি কিতাব • ৭,৫০০+ হাদিস';
      dom.btnQuickSearch.classList.remove('hidden');
      dom.btnSurahSettings.classList.add('hidden');
      window.scrollTo(0, 0);
      renderBukhariBookList();
    } else if (viewName === 'hadithList') {
      dom.btnHeaderBack.classList.remove('hidden');
      dom.headerBranding.classList.add('hidden');
      const meta = state.bukhariMetadata.find(b => b.bookNumber === state.activeHadithBookNumber);
      if (meta) {
        dom.headerTitle.textContent = meta.titleBn;
        dom.headerSubtitle.textContent = `অধ্যায় ${toBengaliNumeral(meta.bookNumber)} • ${toBengaliNumeral(meta.hadithCount)}টি হাদিস`;
      }
      dom.btnQuickSearch.classList.add('hidden');
      dom.btnSurahSettings.classList.add('hidden');
      window.scrollTo(0, 0);
    } else if (viewName === 'search') {
      dom.btnHeaderBack.classList.add('hidden');
      dom.headerBranding.classList.remove('hidden');
      dom.headerTitle.textContent = 'অনুসন্ধান';
      dom.headerSubtitle.textContent = 'কোরআন ও হাদিস সার্চ';
      dom.btnQuickSearch.classList.add('hidden');
      dom.btnSurahSettings.classList.add('hidden');
    } else if (viewName === 'bookmarks') {
      dom.btnHeaderBack.classList.add('hidden');
      dom.headerBranding.classList.remove('hidden');
      dom.headerTitle.textContent = 'বুকমার্কসমূহ';
      dom.headerSubtitle.textContent = toBengaliNumeral(state.bookmarks.length + state.hadithBookmarks.length) + 'টি সংরক্ষিত আইটেম';
      dom.btnQuickSearch.classList.add('hidden');
      dom.btnSurahSettings.classList.add('hidden');
      renderBookmarksView();
    } else if (viewName === 'settings') {
      dom.btnHeaderBack.classList.add('hidden');
      dom.headerBranding.classList.remove('hidden');
      dom.headerTitle.textContent = 'সেটিংস ও তথ্য';
      dom.headerSubtitle.textContent = 'অ্যাপ কাস্টমাইজেশন';
      dom.btnQuickSearch.classList.add('hidden');
      dom.btnSurahSettings.classList.add('hidden');
    }
  }

  // -------------------------------------------------------------
  // 1. QURAN MODULE LOGIC
  // -------------------------------------------------------------

  function renderSurahList() {
    const query = dom.homeSearchInput.value.trim().toLowerCase();
    const filter = state.filter;

    const filtered = state.surahsMetadata.filter(function (s) {
      if (filter === 'meccan' && s.revelationEn !== 'Meccan') return false;
      if (filter === 'medinan' && s.revelationEn !== 'Medinan') return false;

      if (!query) return true;
      const numMatch = String(s.number) === query;
      const bnMatch = s.nameBn.toLowerCase().includes(query);
      const enMatch = s.nameEn.toLowerCase().includes(query);
      const meaningMatch = s.meaningBn.toLowerCase().includes(query);
      const arMatch = s.nameAr.includes(query);
      return numMatch || bnMatch || enMatch || meaningMatch || arMatch;
    });

    dom.surahCountBadge.textContent = toBengaliNumeral(filtered.length) + 'টি সূরা';
    dom.surahList.innerHTML = '';

    if (filtered.length === 0) {
      dom.noSurahMatch.classList.remove('hidden');
      return;
    }
    dom.noSurahMatch.classList.add('hidden');

    const fragment = document.createDocumentFragment();
    filtered.forEach(function (s) {
      const card = document.createElement('div');
      card.className = 'surah-card';
      card.dataset.number = s.number;

      card.innerHTML = `
        <div class="surah-card-left">
          <div class="surah-num-badge">${toBengaliNumeral(s.number)}</div>
          <div class="surah-card-info">
            <h3 class="surah-name-bn">${s.nameBn}</h3>
            <div class="surah-card-meta">
              <span>${s.revelationType}</span>
              <span>•</span>
              <span>${toBengaliNumeral(s.ayahsCount)} আয়াত</span>
            </div>
          </div>
        </div>
        <div class="surah-card-right">
          <span class="surah-name-ar">${s.nameAr}</span>
          <span class="surah-meaning-bn">${s.meaningBn}</span>
        </div>
      `;

      card.addEventListener('click', function () {
        triggerHaptic();
        openSurah(s.number);
      });

      fragment.appendChild(card);
    });

    dom.surahList.appendChild(fragment);
  }

  function updateLastReadCard() {
    if (!state.lastRead) {
      dom.lastReadCard.classList.add('hidden');
      return;
    }
    const meta = state.surahsMetadata.find(s => s.number === state.lastRead.surahNumber);
    if (!meta) {
      dom.lastReadCard.classList.add('hidden');
      return;
    }
    dom.lastReadSurahText.textContent = meta.nameBn;
    dom.lastReadAyahText.textContent = 'আয়াত ' + toBengaliNumeral(state.lastRead.ayahNumber);
    dom.lastReadCard.classList.remove('hidden');
  }

  function saveLastRead(surahNumber, ayahNumber) {
    state.lastRead = {
      surahNumber: surahNumber,
      ayahNumber: ayahNumber,
      timestamp: Date.now()
    };
    localStorage.setItem('quran_last_read', JSON.stringify(state.lastRead));
    updateLastReadCard();
  }

  function openSurah(surahNumber, targetAyahNumber) {
    state.activeSurahNumber = surahNumber;
    state.activeAyahNumber = targetAyahNumber || 1;

    if (!state.quranData || state.quranData.length === 0) {
      state.quranData = window.QURAN_DATA || [];
    }
    const surahData = state.quranData.find(s => s.number === surahNumber);
    if (!surahData) {
      showToast('সূরার তথ্য লোড হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন...');
      return;
    }

    const meta = surahData.metadata;

    dom.readingSurahNumber.textContent = toBengaliNumeral(meta.number);
    dom.readingSurahAr.textContent = meta.nameAr;
    dom.readingSurahBn.textContent = meta.nameBn;
    dom.readingSurahMeta.textContent = `${meta.revelationType} • ${toBengaliNumeral(meta.ayahsCount)}টি আয়াত • ${meta.meaningBn}`;

    if (meta.number === 9) {
      dom.bismillahBanner.classList.add('hidden');
    } else {
      dom.bismillahBanner.classList.remove('hidden');
    }

    if (surahNumber > 1) {
      dom.btnPrevSurah.style.visibility = 'visible';
      const prevMeta = state.surahsMetadata.find(s => s.number === surahNumber - 1);
      dom.prevSurahName.textContent = prevMeta ? prevMeta.nameBn : '';
    } else {
      dom.btnPrevSurah.style.visibility = 'hidden';
    }

    if (surahNumber < 114) {
      dom.btnNextSurah.style.visibility = 'visible';
      const nextMeta = state.surahsMetadata.find(s => s.number === surahNumber + 1);
      dom.nextSurahName.textContent = nextMeta ? nextMeta.nameBn : '';
    } else {
      dom.btnNextSurah.style.visibility = 'hidden';
    }

    renderAyahs(surahData, targetAyahNumber);
    switchView('surah');
    saveLastRead(surahNumber, state.activeAyahNumber);

    if (targetAyahNumber) {
      setTimeout(function () {
        const targetEl = document.getElementById(`ayah-${surahNumber}-${targetAyahNumber}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.add('active-reading');
          setTimeout(() => targetEl.classList.remove('active-reading'), 2000);
        }
      }, 250);
    }
  }

  function renderAyahs(surahData, highlightAyahNumber) {
    dom.ayahsContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    surahData.ayahs.forEach(function (ayah) {
      const card = document.createElement('div');
      card.className = 'ayah-card';
      card.id = `ayah-${surahData.number}-${ayah.number}`;
      if (highlightAyahNumber && ayah.number === highlightAyahNumber) {
        card.classList.add('active-reading');
      }

      const isBookmarked = state.bookmarks.some(
        b => b.surahNumber === surahData.number && b.ayahNumber === ayah.number
      );

      let displayArabic = ayah.arabic;
      if (surahData.number !== 1 && surahData.number !== 9 && ayah.number === 1) {
        displayArabic = displayArabic
          .replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '')
          .replace(/^بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '');
      }

      card.innerHTML = `
        <div class="ayah-card-top">
          <div class="ayah-num-indicator">
            <span class="ayah-circle-badge">${toBengaliNumeral(ayah.number)}</span>
            ${ayah.sajda ? '<span class="sajda-tag">সিজদাহ</span>' : ''}
          </div>
        </div>

        <div class="ayah-arabic-text" dir="rtl" style="font-size: ${state.settings.arabicSize}px; display: ${state.settings.showArabic ? 'block' : 'none'};">
          ${displayArabic}
        </div>

        <div class="ayah-bengali-text" style="font-size: ${state.settings.bengaliSize}px; display: ${state.settings.showBengali ? 'block' : 'none'};">
          ${ayah.bengali}
        </div>

        <div class="ayah-card-footer">
          <button class="ayah-btn-pill btn-share" title="অন্যান্য অ্যাপে শেয়ার করুন" data-ayah="${ayah.number}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            <span>শেয়ার করুন</span>
          </button>

          <button class="ayah-btn-pill btn-copy" title="কপি করুন" data-ayah="${ayah.number}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            <span>কপি</span>
          </button>

          <button class="ayah-btn-pill btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" title="বুকমার্ক" data-ayah="${ayah.number}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="${isBookmarked ? 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z' : 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z'}"/>
            </svg>
            <span>${isBookmarked ? 'সংরক্ষিত' : 'বুকমার্ক'}</span>
          </button>

          <button class="ayah-btn-pill btn-audio" title="তেলাওয়াত শুনুন" data-global="${ayah.globalId}" data-ayah="${ayah.number}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <span>শুনুন</span>
          </button>
        </div>
      `;

      card.querySelector('.btn-share').addEventListener('click', function () {
        triggerHaptic();
        shareAyah(surahData.metadata, ayah, displayArabic);
      });

      card.querySelector('.btn-copy').addEventListener('click', function () {
        triggerHaptic();
        copyAyah(surahData.metadata, ayah, displayArabic);
      });

      card.querySelector('.btn-bookmark').addEventListener('click', function () {
        triggerHaptic();
        toggleBookmark(surahData.number, ayah);
      });

      card.querySelector('.btn-audio').addEventListener('click', function () {
        triggerHaptic();
        playAyahAudio(surahData.number, ayah.number, ayah.globalId);
      });

      fragment.appendChild(card);
    });

    dom.ayahsContainer.appendChild(fragment);
  }

  function toggleBookmark(surahNumber, ayah) {
    const existingIndex = state.bookmarks.findIndex(
      b => b.surahNumber === surahNumber && b.ayahNumber === ayah.number
    );

    const surahMeta = state.surahsMetadata.find(s => s.number === surahNumber);

    if (existingIndex >= 0) {
      state.bookmarks.splice(existingIndex, 1);
      showToast('বুকমার্ক মুছে ফেলা হয়েছে');
    } else {
      state.bookmarks.unshift({
        type: 'quran',
        surahNumber: surahNumber,
        surahNameBn: surahMeta ? surahMeta.nameBn : `সূরা ${surahNumber}`,
        surahNameAr: surahMeta ? surahMeta.nameAr : '',
        ayahNumber: ayah.number,
        globalId: ayah.globalId,
        arabic: ayah.arabic,
        bengali: ayah.bengali,
        timestamp: Date.now()
      });
      showToast('আয়াত বুকমার্কে সংরক্ষণ করা হয়েছে');
    }

    localStorage.setItem('quran_bookmarks', JSON.stringify(state.bookmarks));

    const card = document.getElementById(`ayah-${surahNumber}-${ayah.number}`);
    if (card) {
      const btn = card.querySelector('.btn-bookmark');
      const isBookmarked = existingIndex < 0;
      btn.classList.toggle('bookmarked', isBookmarked);
      btn.querySelector('path').setAttribute(
        'd',
        isBookmarked
          ? 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z'
          : 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z'
      );
    }
  }

  function copyAyah(surahMeta, ayah, cleanArabic) {
    const arabicText = cleanArabic || ayah.arabic;
    const textToCopy = `${arabicText.trim()}\n\nবাংলা অনুবাদ:\n"${ayah.bengali.trim()}"\n\n— [সূরা ${surahMeta.nameBn}: আয়াত ${toBengaliNumeral(ayah.number)}]\n(আল-কোরআন ও সহীহ বুখারী)`;

    if (window.AndroidBridge && window.AndroidBridge.copyToClipboard) {
      window.AndroidBridge.copyToClipboard(textToCopy);
      showToast('আয়াত ক্লিপবোর্ডে কপি করা হয়েছে');
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(function () {
        showToast('আয়াত ক্লিপবোর্ডে কপি করা হয়েছে');
      }).catch(function () {
        fallbackCopyText(textToCopy);
      });
    } else {
      fallbackCopyText(textToCopy);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('টেক্সট কপি করা হয়েছে');
    } catch (e) {
      showToast('কপি করতে ব্যর্থ হয়েছে');
    }
    document.body.removeChild(textArea);
  }

  function shareAyah(surahMeta, ayah, cleanArabic) {
    const arabicText = (cleanArabic || ayah.arabic).trim();
    const hasBismillah = arabicText.startsWith('بِسْمِ') || arabicText.startsWith('بِّسْمِ');
    const bismillahHeader = hasBismillah ? '' : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\n\n';
    const shareText = `${bismillahHeader}${arabicText}\n\nবাংলা অনুবাদ:\n"${ayah.bengali.trim()}"\n\n— [সূরা ${surahMeta.nameBn}: আয়াত ${toBengaliNumeral(ayah.number)}]\n(আল-কোরআন ও সহীহ বুখারী)`;
    const title = `কোরআন: সূরা ${surahMeta.nameBn} আয়াত ${toBengaliNumeral(ayah.number)}`;

    if (window.AndroidBridge && window.AndroidBridge.shareAyah) {
      window.AndroidBridge.shareAyah(arabicText, ayah.bengali, surahMeta.nameBn, ayah.number);
    } else if (navigator.share) {
      navigator.share({ title: title, text: shareText }).catch(() => {});
    } else {
      copyAyah(surahMeta, ayah, cleanArabic);
    }
  }

  function playAyahAudio(surahNumber, ayahNumber, globalId) {
    const surahMeta = state.surahsMetadata.find(s => s.number === surahNumber);
    state.audio.currentSurahNumber = surahNumber;
    state.audio.currentAyahNumberInSurah = ayahNumber;
    state.audio.currentAyahGlobalId = globalId;

    dom.audioPlayerSurah.textContent = `তেলাওয়াত চলছে: সূরা ${surahMeta ? surahMeta.nameBn : surahNumber}`;
    dom.audioPlayerAyah.textContent = `আয়াত ${toBengaliNumeral(ayahNumber)} • ক্বারী মিশারী আল-আফাসী`;
    dom.audioPlayerBar.classList.remove('hidden');

    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalId}.mp3`;

    state.audio.player.src = audioUrl;
    state.audio.player.play().then(function () {
      state.audio.isPlaying = true;
      dom.svgPlay.classList.add('hidden');
      dom.svgPause.classList.remove('hidden');
    }).catch(function () {
      state.audio.isPlaying = false;
      dom.svgPlay.classList.remove('hidden');
      dom.svgPause.classList.add('hidden');
      showToast('অডিওর জন্য ইন্টারনেট প্রয়োজন। সম্পূর্ণ কোরআন টেক্সট অফলাইনে আছে।');
    });

    const card = document.getElementById(`ayah-${surahNumber}-${ayahNumber}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // -------------------------------------------------------------
  // 2. SAHIH AL-BUKHARI MODULE LOGIC
  // -------------------------------------------------------------

  function renderBukhariBookList() {
    if (!state.bukhariMetadata || state.bukhariMetadata.length === 0) {
      state.bukhariMetadata = window.BUKHARI_METADATA || [];
    }

    const query = dom.bukhariSearchInput.value.trim().toLowerCase();
    const filter = state.bukhariFilter;

    const filtered = state.bukhariMetadata.filter(function (b) {
      if (filter === 'ibadat') {
        // Books 2 (Faith), 8 (Prayer), 10 (Adhan), 24 (Zakat), 25 (Hajj), 30 (Fasting)
        if (![2, 8, 9, 10, 11, 14, 24, 25, 30].includes(b.bookNumber)) return false;
      } else if (filter === 'muamalat') {
        // Books 34 (Trade), 37 (Hiring), 43 (Debts), 47 (Partnership), 51 (Gifts)
        if (![34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 47, 51].includes(b.bookNumber)) return false;
      } else if (filter === 'adab') {
        // Books 78 (Adab), 79 (Permission), 80 (Invocations), 81 (Riqaq)
        if (![77, 78, 79, 80, 81, 82].includes(b.bookNumber)) return false;
      }

      if (!query) return true;
      const numMatch = String(b.bookNumber) === query;
      const bnMatch = b.titleBn.toLowerCase().includes(query);
      const enMatch = b.titleEn.toLowerCase().includes(query);
      return numMatch || bnMatch || enMatch;
    });

    dom.bukhariCountBadge.textContent = toBengaliNumeral(filtered.length) + 'টি অধ্যায়';
    dom.bukhariBookList.innerHTML = '';

    if (filtered.length === 0) {
      dom.noBukhariMatch.classList.remove('hidden');
      return;
    }
    dom.noBukhariMatch.classList.add('hidden');

    const fragment = document.createDocumentFragment();
    filtered.forEach(function (b) {
      const card = document.createElement('div');
      card.className = 'surah-card';
      card.dataset.bookNumber = b.bookNumber;

      card.innerHTML = `
        <div class="surah-card-left">
          <div class="surah-num-badge" style="background: var(--gold-light); color: var(--gold-dark); border-color: rgba(191,161,54,0.3);">${toBengaliNumeral(b.bookNumber)}</div>
          <div class="surah-card-info">
            <h3 class="surah-name-bn">${b.titleBn}</h3>
            <div class="surah-card-meta">
              <span>${toBengaliNumeral(b.hadithCount)}টি হাদিস</span>
              <span>•</span>
              <span class="book-hadith-range">হাদিস ${toBengaliNumeral(b.hadithFirst)} - ${toBengaliNumeral(b.hadithLast)}</span>
            </div>
          </div>
        </div>
        <div class="surah-card-right">
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--primary);">${b.titleEn}</span>
        </div>
      `;

      card.addEventListener('click', function () {
        triggerHaptic();
        openBukhariBook(b.bookNumber);
      });

      fragment.appendChild(card);
    });

    dom.bukhariBookList.appendChild(fragment);
  }

  function openBukhariBook(bookNumber, targetHadithNumber) {
    state.activeHadithBookNumber = bookNumber;
    const meta = state.bukhariMetadata.find(b => b.bookNumber === bookNumber);

    dom.readingHadithBookNumber.textContent = toBengaliNumeral(bookNumber);
    dom.readingHadithBookBn.textContent = meta ? meta.titleBn : `অধ্যায় ${bookNumber}`;
    dom.readingHadithBookAr.textContent = meta ? meta.titleEn : 'সহীহ বুখারী';
    dom.readingHadithBookMeta.textContent = meta
      ? `হাদিস ${toBengaliNumeral(meta.hadithFirst)} থেকে ${toBengaliNumeral(meta.hadithLast)} • মোট ${toBengaliNumeral(meta.hadithCount)}টি হাদিস`
      : '';

    // Prev / Next Book navigation buttons
    if (bookNumber > 1) {
      dom.btnPrevHadithBook.style.visibility = 'visible';
      const prevMeta = state.bukhariMetadata.find(b => b.bookNumber === bookNumber - 1);
      dom.prevHadithBookName.textContent = prevMeta ? prevMeta.titleBn : '';
    } else {
      dom.btnPrevHadithBook.style.visibility = 'hidden';
    }

    if (bookNumber < state.bukhariMetadata.length) {
      dom.btnNextHadithBook.style.visibility = 'visible';
      const nextMeta = state.bukhariMetadata.find(b => b.bookNumber === bookNumber + 1);
      dom.nextHadithBookName.textContent = nextMeta ? nextMeta.titleBn : '';
    } else {
      dom.btnNextHadithBook.style.visibility = 'hidden';
    }

    switchView('hadithList');

    // Check if book hadiths are already loaded
    const loadedBooks = window.BUKHARI_BOOKS || window.BUKHARI_PRELOADED || {};
    if (loadedBooks[bookNumber]) {
      renderHadiths(bookNumber, loadedBooks[bookNumber], targetHadithNumber);
      return;
    }

    // Otherwise load the book JS dynamically
    dom.hadithsContainer.innerHTML = `
      <div style="text-align: center; padding: 50px 20px;">
        <div class="loading-spinner"></div>
        <p style="margin-top: 14px; color: var(--text-secondary); font-size: 0.9rem;">হাদিস লোড হচ্ছে...</p>
      </div>
    `;

    const script = document.createElement('script');
    script.src = `data/hadith/books/${bookNumber}.js`;
    script.onload = function () {
      const books = window.BUKHARI_BOOKS || {};
      if (books[bookNumber]) {
        renderHadiths(bookNumber, books[bookNumber], targetHadithNumber);
      } else {
        dom.hadithsContainer.innerHTML = `<p style="text-align:center; padding: 40px;">হাদিস লোড করা সম্ভব হয়নি।</p>`;
      }
    };
    script.onerror = function () {
      dom.hadithsContainer.innerHTML = `<p style="text-align:center; padding: 40px; color: #dc2626;">হাদিস ফাইল লোড করতে ব্যর্থ হয়েছে।</p>`;
    };
    document.body.appendChild(script);
  }

  function renderHadiths(bookNumber, hadiths, highlightHadithNumber) {
    dom.hadithsContainer.innerHTML = '';
    const bookMeta = state.bukhariMetadata.find(b => b.bookNumber === bookNumber);
    const fragment = document.createDocumentFragment();

    hadiths.forEach(function (h) {
      const card = document.createElement('div');
      card.className = 'hadith-card';
      card.id = `hadith-${h.hadithnumber}`;
      if (highlightHadithNumber && h.hadithnumber === highlightHadithNumber) {
        card.classList.add('active-reading');
      }

      const isBookmarked = state.hadithBookmarks.some(b => b.hadithNumber === h.hadithnumber);

      card.innerHTML = `
        <div class="ayah-card-top">
          <div class="ayah-num-indicator">
            <span class="hadith-num-badge">হাদিস নং ${toBengaliNumeral(h.hadithnumber)}</span>
            <span class="hadith-ref-tag">অধ্যায় ${toBengaliNumeral(bookNumber)}</span>
          </div>
          <div class="ayah-actions-toolbar">
            <button class="ayah-action-btn btn-hadith-bookmark ${isBookmarked ? 'bookmarked' : ''}" title="বুকমার্ক">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="${isBookmarked ? 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z' : 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z'}"/>
              </svg>
            </button>
            <button class="ayah-action-btn btn-hadith-copy" title="কপি করুন">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
            <button class="ayah-action-btn btn-hadith-share" title="শেয়ার করুন">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="hadith-body-text" style="font-size: ${state.settings.bengaliSize}px;">
          ${h.text}
        </div>
      `;

      card.querySelector('.btn-hadith-bookmark').addEventListener('click', function () {
        triggerHaptic();
        toggleHadithBookmark(bookNumber, h);
      });

      card.querySelector('.btn-hadith-copy').addEventListener('click', function () {
        triggerHaptic();
        copyHadith(bookMeta, h);
      });

      card.querySelector('.btn-hadith-share').addEventListener('click', function () {
        triggerHaptic();
        shareHadith(bookMeta, h);
      });

      fragment.appendChild(card);
    });

    dom.hadithsContainer.appendChild(fragment);

    if (highlightHadithNumber) {
      setTimeout(function () {
        const el = document.getElementById(`hadith-${highlightHadithNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('active-reading');
          setTimeout(() => el.classList.remove('active-reading'), 2000);
        }
      }, 250);
    }
  }

  function toggleHadithBookmark(bookNumber, hadith) {
    const existingIndex = state.hadithBookmarks.findIndex(b => b.hadithNumber === hadith.hadithnumber);
    const bookMeta = state.bukhariMetadata.find(b => b.bookNumber === bookNumber);

    if (existingIndex >= 0) {
      state.hadithBookmarks.splice(existingIndex, 1);
      showToast('হাদিস বুকমার্ক মুছে ফেলা হয়েছে');
    } else {
      state.hadithBookmarks.unshift({
        type: 'hadith',
        bookNumber: bookNumber,
        bookTitleBn: bookMeta ? bookMeta.titleBn : `অধ্যায় ${bookNumber}`,
        hadithNumber: hadith.hadithnumber,
        text: hadith.text,
        timestamp: Date.now()
      });
      showToast('হাদিস বুকমার্কে সংরক্ষণ করা হয়েছে');
    }

    localStorage.setItem('hadith_bookmarks', JSON.stringify(state.hadithBookmarks));

    const card = document.getElementById(`hadith-${hadith.hadithnumber}`);
    if (card) {
      const btn = card.querySelector('.btn-hadith-bookmark');
      const isBookmarked = existingIndex < 0;
      btn.classList.toggle('bookmarked', isBookmarked);
      btn.querySelector('path').setAttribute(
        'd',
        isBookmarked
          ? 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z'
          : 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z'
      );
    }
  }

  function copyHadith(bookMeta, hadith) {
    const textToCopy = `হাদিস নং ${toBengaliNumeral(hadith.hadithnumber)}:\n${hadith.text}\n\n— [সহীহ আল-বুখারী: ${bookMeta ? bookMeta.titleBn : ''}]\n(আল-কোরআন ও সহীহ বুখারী অ্যাপ)`;

    if (window.AndroidBridge && window.AndroidBridge.copyToClipboard) {
      window.AndroidBridge.copyToClipboard(textToCopy);
      showToast('হাদিস ক্লিপবোর্ডে কপি করা হয়েছে');
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(function () {
        showToast('হাদিস ক্লিপবোর্ডে কপি করা হয়েছে');
      }).catch(function () {
        fallbackCopyText(textToCopy);
      });
    } else {
      fallbackCopyText(textToCopy);
    }
  }

  function shareHadith(bookMeta, hadith) {
    const textToShare = `হাদিস নং ${toBengaliNumeral(hadith.hadithnumber)}:\n${hadith.text}\n\n— [সহীহ আল-বুখারী: ${bookMeta ? bookMeta.titleBn : ''}]\n(আল-কোরআন ও সহীহ বুখারী)`;
    const title = `সহীহ বুখারী: হাদিস নং ${toBengaliNumeral(hadith.hadithnumber)}`;

    if (window.AndroidBridge && window.AndroidBridge.shareHadith) {
      window.AndroidBridge.shareHadith(hadith.hadithnumber, hadith.text, bookMeta ? bookMeta.titleBn : '');
    } else if (navigator.share) {
      navigator.share({ title: title, text: textToShare }).catch(() => {});
    } else {
      copyHadith(bookMeta, hadith);
    }
  }

  // -------------------------------------------------------------
  // 3. SEARCH & BOOKMARKS LOGIC
  // -------------------------------------------------------------

  let searchDebounce = null;
  function executeVerseSearch() {
    const rawQuery = dom.verseSearchInput.value.trim();
    if (!rawQuery) {
      dom.verseSearchResults.innerHTML = '';
      dom.verseSearchResultsInfo.classList.add('hidden');
      dom.searchPromptState.classList.remove('hidden');
      dom.noVerseMatch.classList.add('hidden');
      return;
    }

    dom.searchPromptState.classList.add('hidden');
    const query = rawQuery.toLowerCase();
    const results = [];

    if (!state.quranData || state.quranData.length === 0) {
      state.quranData = window.QURAN_DATA || [];
    }

    for (let i = 0; i < state.quranData.length; i++) {
      const surah = state.quranData[i];
      for (let j = 0; j < surah.ayahs.length; j++) {
        const ayah = surah.ayahs[j];
        const inBn = ayah.bengali.toLowerCase().includes(query);
        const inAr = ayah.arabic.includes(query);

        if (inBn || inAr) {
          results.push({
            type: 'quran',
            surahNumber: surah.number,
            surahNameBn: surah.metadata.nameBn,
            surahNameAr: surah.metadata.nameAr,
            ayahNumber: ayah.number,
            arabic: ayah.arabic,
            bengali: ayah.bengali
          });
        }
        if (results.length >= 80) break;
      }
      if (results.length >= 80) break;
    }

    // Also check preloaded Bukhari hadiths
    const loadedBooks = window.BUKHARI_BOOKS || window.BUKHARI_PRELOADED || {};
    Object.keys(loadedBooks).forEach(function (bId) {
      const bHadiths = loadedBooks[bId];
      const meta = state.bukhariMetadata.find(b => b.bookNumber === parseInt(bId, 10));
      for (let k = 0; k < bHadiths.length; k++) {
        const h = bHadiths[k];
        if (h.text.toLowerCase().includes(query) || String(h.hadithnumber) === query) {
          results.push({
            type: 'hadith',
            bookNumber: parseInt(bId, 10),
            bookTitleBn: meta ? meta.titleBn : `অধ্যায় ${bId}`,
            hadithNumber: h.hadithnumber,
            text: h.text
          });
        }
        if (results.length >= 100) break;
      }
    });

    dom.verseSearchResultsInfo.classList.remove('hidden');
    dom.searchResultCount.textContent = `${toBengaliNumeral(results.length)}টি ফলাফল পাওয়া গেছে`;
    dom.verseSearchResults.innerHTML = '';

    if (results.length === 0) {
      dom.noVerseMatch.classList.remove('hidden');
      return;
    }
    dom.noVerseMatch.classList.add('hidden');

    const fragment = document.createDocumentFragment();
    results.forEach(function (res) {
      const card = document.createElement('div');
      card.className = 'search-result-card';

      if (res.type === 'quran') {
        let highlightedBn = res.bengali;
        try {
          const regex = new RegExp(`(${rawQuery})`, 'gi');
          highlightedBn = res.bengali.replace(regex, '<span class="highlight-match">$1</span>');
        } catch (e) {}

        card.innerHTML = `
          <div class="search-result-header">
            <span class="result-surah-title">কোরআন: সূরা ${res.surahNameBn} • আয়াত ${toBengaliNumeral(res.ayahNumber)}</span>
            <span class="surah-name-ar" style="font-size: 1.1rem;">${res.surahNameAr}</span>
          </div>
          <p class="ayah-arabic-text" dir="rtl" style="font-size: 20px; margin-bottom: 8px;">
            ${res.arabic}
          </p>
          <p class="ayah-bengali-text" style="font-size: 14px;">
            ${highlightedBn}
          </p>
          <div class="ayah-card-footer" style="margin-top: 8px; padding-top: 6px;">
            <button class="ayah-btn-pill btn-share" style="padding: 4px 12px; font-size: 0.8rem;" title="শেয়ার করুন">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
              <span>শেয়ার</span>
            </button>
            <button class="ayah-btn-pill btn-copy" style="padding: 4px 12px; font-size: 0.8rem;" title="কপি করুন">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              <span>কপি</span>
            </button>
          </div>
        `;

        card.querySelector('.btn-share').addEventListener('click', function (e) {
          e.stopPropagation();
          triggerHaptic();
          shareAyah({ nameBn: res.surahNameBn }, { number: res.ayahNumber, arabic: res.arabic, bengali: res.bengali });
        });

        card.querySelector('.btn-copy').addEventListener('click', function (e) {
          e.stopPropagation();
          triggerHaptic();
          copyAyah({ nameBn: res.surahNameBn }, { number: res.ayahNumber, arabic: res.arabic, bengali: res.bengali });
        });

        card.addEventListener('click', function () {
          triggerHaptic();
          openSurah(res.surahNumber, res.ayahNumber);
        });
      } else {
        card.innerHTML = `
          <div class="search-result-header">
            <span class="result-surah-title" style="color: var(--gold-dark);">সহীহ বুখারী: ${res.bookTitleBn} • হাদিস ${toBengaliNumeral(res.hadithNumber)}</span>
          </div>
          <p class="ayah-bengali-text" style="font-size: 14px; margin-top: 6px;">
            ${res.text.slice(0, 220)}...
          </p>
          <div class="ayah-card-footer" style="margin-top: 8px; padding-top: 6px;">
            <button class="ayah-btn-pill btn-share" style="padding: 4px 12px; font-size: 0.8rem;" title="শেয়ার করুন">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
              <span>শেয়ার</span>
            </button>
            <button class="ayah-btn-pill btn-copy" style="padding: 4px 12px; font-size: 0.8rem;" title="কপি করুন">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              <span>কপি</span>
            </button>
          </div>
        `;

        card.querySelector('.btn-share').addEventListener('click', function (e) {
          e.stopPropagation();
          triggerHaptic();
          shareHadith({ titleBn: res.bookTitleBn }, { hadithnumber: res.hadithNumber, text: res.text });
        });

        card.querySelector('.btn-copy').addEventListener('click', function (e) {
          e.stopPropagation();
          triggerHaptic();
          copyHadith({ titleBn: res.bookTitleBn }, { hadithnumber: res.hadithNumber, text: res.text });
        });

        card.addEventListener('click', function () {
          triggerHaptic();
          openBukhariBook(res.bookNumber, res.hadithNumber);
        });
      }

      fragment.appendChild(card);
    });

    dom.verseSearchResults.appendChild(fragment);
  }

  function renderBookmarksView() {
    dom.bookmarksList.innerHTML = '';
    const totalCount = state.bookmarks.length + state.hadithBookmarks.length;

    if (totalCount === 0) {
      dom.noBookmarksState.classList.remove('hidden');
      return;
    }
    dom.noBookmarksState.classList.add('hidden');

    const fragment = document.createDocumentFragment();

    // Render Quran bookmarks
    state.bookmarks.forEach(function (bm, index) {
      const card = document.createElement('div');
      card.className = 'bookmark-card';

      card.innerHTML = `
        <div class="bookmark-card-top">
          <span class="result-surah-title">কোরআন: সূরা ${bm.surahNameBn} • আয়াত ${toBengaliNumeral(bm.ayahNumber)}</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="ayah-action-btn btn-share-bm" title="শেয়ার করুন">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>
            <button class="ayah-action-btn btn-delete-bm" title="মুছে ফেলুন" data-type="quran" data-index="${index}">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
        <p class="ayah-arabic-text" dir="rtl" style="font-size: 20px; margin-bottom: 8px;">
          ${bm.arabic}
        </p>
        <p class="ayah-bengali-text" style="font-size: 14px;">
          ${bm.bengali}
        </p>
      `;

      card.addEventListener('click', function (e) {
        if (e.target.closest('.btn-share-bm')) {
          e.stopPropagation();
          triggerHaptic();
          shareAyah({ nameBn: bm.surahNameBn }, { number: bm.ayahNumber, arabic: bm.arabic, bengali: bm.bengali });
          return;
        }
        if (e.target.closest('.btn-delete-bm')) {
          e.stopPropagation();
          triggerHaptic();
          state.bookmarks.splice(index, 1);
          localStorage.setItem('quran_bookmarks', JSON.stringify(state.bookmarks));
          showToast('বুকমার্ক মুছে ফেলা হয়েছে');
          renderBookmarksView();
          return;
        }
        triggerHaptic();
        openSurah(bm.surahNumber, bm.ayahNumber);
      });

      fragment.appendChild(card);
    });

    // Render Hadith bookmarks
    state.hadithBookmarks.forEach(function (hb, index) {
      const card = document.createElement('div');
      card.className = 'bookmark-card';
      card.style.borderLeft = '4px solid var(--gold)';

      card.innerHTML = `
        <div class="bookmark-card-top">
          <span class="result-surah-title" style="color: var(--gold-dark);">সহীহ বুখারী: ${hb.bookTitleBn} • হাদিস ${toBengaliNumeral(hb.hadithNumber)}</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="ayah-action-btn btn-share-bm" title="শেয়ার করুন">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>
            <button class="ayah-action-btn btn-delete-bm" title="মুছে ফেলুন" data-type="hadith" data-index="${index}">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
        <p class="ayah-bengali-text" style="font-size: 14px; margin-top: 6px;">
          ${hb.text.slice(0, 220)}...
        </p>
      `;

      card.addEventListener('click', function (e) {
        if (e.target.closest('.btn-share-bm')) {
          e.stopPropagation();
          triggerHaptic();
          shareHadith({ titleBn: hb.bookTitleBn }, { hadithnumber: hb.hadithNumber, text: hb.text });
          return;
        }
        if (e.target.closest('.btn-delete-bm')) {
          e.stopPropagation();
          triggerHaptic();
          state.hadithBookmarks.splice(index, 1);
          localStorage.setItem('hadith_bookmarks', JSON.stringify(state.hadithBookmarks));
          showToast('হাদিস বুকমার্ক মুছে ফেলা হয়েছে');
          renderBookmarksView();
          return;
        }
        triggerHaptic();
        openBukhariBook(hb.bookNumber, hb.hadithNumber);
      });

      fragment.appendChild(card);
    });

    dom.bookmarksList.appendChild(fragment);
  }

  // -------------------------------------------------------------
  // 4. EVENT LISTENERS
  // -------------------------------------------------------------

  function setupEventListeners() {
    dom.navItems.forEach(function (btn) {
      btn.addEventListener('click', function () {
        triggerHaptic();
        switchView(this.dataset.view);
      });
    });

    dom.btnHeaderBack.addEventListener('click', function () {
      triggerHaptic();
      if (state.currentView === 'hadithList') {
        switchView('bukhari');
      } else {
        switchView('home');
      }
    });

    dom.btnQuickSearch.addEventListener('click', function () {
      triggerHaptic();
      switchView('search');
      setTimeout(() => dom.verseSearchInput.focus(), 200);
    });

    dom.btnSurahSettings.addEventListener('click', function () {
      triggerHaptic();
      switchView('settings');
    });

    // Home / Quran Search
    dom.homeSearchInput.addEventListener('input', function () {
      dom.btnClearHomeSearch.classList.toggle('hidden', !this.value);
      renderSurahList();
    });

    dom.btnClearHomeSearch.addEventListener('click', function () {
      dom.homeSearchInput.value = '';
      this.classList.add('hidden');
      renderSurahList();
    });

    dom.filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        triggerHaptic();
        dom.filterChips.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        state.filter = this.dataset.filter;
        renderSurahList();
      });
    });

    dom.btnResumeRead.addEventListener('click', function () {
      triggerHaptic();
      if (state.lastRead) {
        openSurah(state.lastRead.surahNumber, state.lastRead.ayahNumber);
      }
    });

    // Quran Prev / Next
    dom.btnPrevSurah.addEventListener('click', function () {
      triggerHaptic();
      if (state.activeSurahNumber > 1) openSurah(state.activeSurahNumber - 1);
    });

    dom.btnNextSurah.addEventListener('click', function () {
      triggerHaptic();
      if (state.activeSurahNumber < 114) openSurah(state.activeSurahNumber + 1);
    });

    // Bukhari Search
    dom.bukhariSearchInput.addEventListener('input', function () {
      dom.btnClearBukhariSearch.classList.toggle('hidden', !this.value);
      renderBukhariBookList();
    });

    dom.btnClearBukhariSearch.addEventListener('click', function () {
      dom.bukhariSearchInput.value = '';
      this.classList.add('hidden');
      renderBukhariBookList();
    });

    dom.bukhariFilterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        triggerHaptic();
        dom.bukhariFilterChips.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        state.bukhariFilter = this.dataset.bukhariFilter;
        renderBukhariBookList();
      });
    });

    // Bukhari Prev / Next Book
    dom.btnPrevHadithBook.addEventListener('click', function () {
      triggerHaptic();
      if (state.activeHadithBookNumber > 1) {
        openBukhariBook(state.activeHadithBookNumber - 1);
      }
    });

    dom.btnNextHadithBook.addEventListener('click', function () {
      triggerHaptic();
      if (state.activeHadithBookNumber < state.bukhariMetadata.length) {
        openBukhariBook(state.activeHadithBookNumber + 1);
      }
    });

    // Jump to Ayah Modal
    dom.btnOpenJumpModal.addEventListener('click', function () {
      triggerHaptic();
      const meta = state.surahsMetadata.find(s => s.number === state.activeSurahNumber);
      if (meta) {
        dom.jumpAyahRangeText.textContent = `১ থেকে ${toBengaliNumeral(meta.ayahsCount)} এর মধ্যে যেকোনো নম্বর লিখুন:`;
        dom.inputJumpAyahNumber.max = meta.ayahsCount;
        dom.inputJumpAyahNumber.value = '';
        dom.modalJumpAyah.classList.remove('hidden');
        setTimeout(() => dom.inputJumpAyahNumber.focus(), 200);
      }
    });

    dom.btnCloseJumpModal.addEventListener('click', function () {
      dom.modalJumpAyah.classList.add('hidden');
    });

    dom.btnDoJumpAyah.addEventListener('click', function () {
      const num = parseInt(dom.inputJumpAyahNumber.value, 10);
      const meta = state.surahsMetadata.find(s => s.number === state.activeSurahNumber);
      if (num >= 1 && meta && num <= meta.ayahsCount) {
        dom.modalJumpAyah.classList.add('hidden');
        const targetEl = document.getElementById(`ayah-${state.activeSurahNumber}-${num}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.add('active-reading');
          saveLastRead(state.activeSurahNumber, num);
          setTimeout(() => targetEl.classList.remove('active-reading'), 2000);
        }
      } else {
        showToast('অনুগ্রহ করে সঠিক আয়াত নম্বর লিখুন');
      }
    });

    // Jump to Hadith Modal
    dom.btnOpenJumpHadithModal.addEventListener('click', function () {
      triggerHaptic();
      const meta = state.bukhariMetadata.find(b => b.bookNumber === state.activeHadithBookNumber);
      if (meta) {
        dom.jumpHadithRangeText.textContent = `হাদিস ${toBengaliNumeral(meta.hadithFirst)} থেকে ${toBengaliNumeral(meta.hadithLast)} এর মধ্যে নম্বর লিখুন:`;
        dom.inputJumpHadithNumber.min = meta.hadithFirst;
        dom.inputJumpHadithNumber.max = meta.hadithLast;
        dom.inputJumpHadithNumber.value = '';
        dom.modalJumpHadith.classList.remove('hidden');
        setTimeout(() => dom.inputJumpHadithNumber.focus(), 200);
      }
    });

    dom.btnCloseJumpHadithModal.addEventListener('click', function () {
      dom.modalJumpHadith.classList.add('hidden');
    });

    dom.btnDoJumpHadith.addEventListener('click', function () {
      const num = parseInt(dom.inputJumpHadithNumber.value, 10);
      if (num >= 1) {
        dom.modalJumpHadith.classList.add('hidden');
        const targetEl = document.getElementById(`hadith-${num}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.add('active-reading');
          setTimeout(() => targetEl.classList.remove('active-reading'), 2000);
        } else {
          showToast(`হাদিস নং ${num} এই অধ্যায়ে পাওয়া যায়নি`);
        }
      }
    });

    // Search Input
    dom.verseSearchInput.addEventListener('input', function () {
      dom.btnClearVerseSearch.classList.toggle('hidden', !this.value);
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(executeVerseSearch, 250);
    });

    dom.btnClearVerseSearch.addEventListener('click', function () {
      dom.verseSearchInput.value = '';
      this.classList.add('hidden');
      executeVerseSearch();
    });

    document.querySelectorAll('.keyword-tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        triggerHaptic();
        dom.verseSearchInput.value = this.dataset.kw;
        dom.btnClearVerseSearch.classList.remove('hidden');
        executeVerseSearch();
      });
    });

    // Settings
    dom.sliderArabicFont.addEventListener('input', function () {
      state.settings.arabicSize = parseInt(this.value, 10);
      dom.lblArabicSize.textContent = toBengaliNumeral(state.settings.arabicSize) + ' পিক্সেল';
      localStorage.setItem('quran_ar_size', state.settings.arabicSize);
      applySettings();
    });

    dom.sliderBengaliFont.addEventListener('input', function () {
      state.settings.bengaliSize = parseInt(this.value, 10);
      dom.lblBengaliSize.textContent = toBengaliNumeral(state.settings.bengaliSize) + ' পিক্সেল';
      localStorage.setItem('quran_bn_size', state.settings.bengaliSize);
      applySettings();
    });

    dom.toggleShowArabic.addEventListener('change', function () {
      state.settings.showArabic = this.checked;
      localStorage.setItem('quran_show_ar', this.checked);
      applySettings();
    });

    dom.toggleShowBengali.addEventListener('change', function () {
      state.settings.showBengali = this.checked;
      localStorage.setItem('quran_show_bn', this.checked);
      applySettings();
    });

    dom.toggleDarkMode.addEventListener('change', function () {
      state.settings.darkMode = this.checked;
      localStorage.setItem('quran_dark_mode', this.checked);
      applySettings();
    });
  }

  // Back Button integration with Android
  window.handleAndroidBack = function () {
    if (!dom.modalJumpAyah.classList.contains('hidden')) {
      dom.modalJumpAyah.classList.add('hidden');
      return true;
    }
    if (!dom.modalJumpHadith.classList.contains('hidden')) {
      dom.modalJumpHadith.classList.add('hidden');
      return true;
    }

    if (state.currentView === 'hadithList') {
      switchView('bukhari');
      return true;
    }
    if (state.currentView === 'surah') {
      switchView('home');
      return true;
    }
    if (state.currentView !== 'home') {
      switchView('home');
      return true;
    }
    return false;
  };

  // Initialization
  function init() {
    applySettings();
    renderSurahList();
    renderBukhariBookList();
    updateLastReadCard();
    setupEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
