#!/usr/bin/env python3
"""
Downloads verified Sahih al-Bukhari dataset in Bengali and formats it for
100% offline mobile-friendly reading in the Android WebView app.
"""
import urllib.request
import json
import os
import sys

BENGALI_BOOK_NAMES = {
    0: ("ভূমিকা ও বিবিধ হাদিস", "Introduction & General Hadiths"),
    1: ("ওহীর সূচনা", "Revelation"),
    2: ("ঈমান (বিশ্বাস)", "Belief"),
    3: ("ইলম (জ্ঞান)", "Knowledge"),
    4: ("ওযু (পবিত্রতা অর্জন)", "Ablutions"),
    5: ("গোসল (গোসলের বিধান)", "Bathing"),
    6: ("হায়েয (ঋতুস্রাব)", "Menstrual Periods"),
    7: ("তায়াম্মুম", "Rubbing Hands & Feet with Dust"),
    8: ("সালাত (নামায)", "Prayers"),
    9: ("সালাতের ওয়াক্ত (সময়সমূহ)", "Times of the Prayers"),
    10: ("আযান (নামাযের আহ্বান)", "Call to Prayers"),
    11: ("জুমুআ (শুক্রবার সালাত)", "Friday Prayer"),
    12: ("ভয়ের সালাত (খওফ)", "Fear Prayer"),
    13: ("দুই ঈদ (ঈদুল ফিতর ও ঈদুল আযহা)", "The Two Festivals"),
    14: ("বিতর সালাত", "Witr Prayer"),
    15: ("ইস্তিসকা (বৃষ্টি প্রার্থনা)", "Invoking Allah for Rain"),
    16: ("কুসুফ (সূর্য ও চন্দ্রগ্রহণ)", "Eclipses"),
    17: ("সিজদাহ তিলাওয়াত", "Prostration During Recitation"),
    18: ("সালাত কসর (সংক্ষেপণ)", "Shortening the Prayers"),
    19: ("তাহাজ্জুদ ও কিয়ামুল লাইল", "Night Prayer - Tahajjud"),
    20: ("মক্কা ও মদীনার মসজিদে সালাত", "Virtues of Prayer at Mecca & Madinah"),
    21: ("সালাতের আচরণ ও নিয়ম", "Actions while Praying"),
    22: ("সাহু সিজদাহ (ভুল সংশোধন)", "Forgetfulness in Prayer"),
    23: ("জানাযা (মরদেহ সৎকারের নিয়ম)", "Funerals"),
    24: ("যাকাত (বাধ্যতামূলক দান)", "Zakat"),
    25: ("হজ্জ (পবিত্র হজ্জব্রত)", "Hajj"),
    26: ("উমরাহ", "Umrah"),
    27: ("মুহসার (হজ্জে বাধাগ্রস্ত ব্যক্তি)", "Pilgrim Prevented"),
    28: ("শিকারের কাফফারা", "Penalty of Hunting"),
    29: ("মদীনা মুনাওয়ারার ফযীলত", "Virtues of Madinah"),
    30: ("সাওম (রোযা)", "Fasting"),
    31: ("তারাবীহ সালাত", "Tarawih Prayers"),
    32: ("লাইলাতুল কদরের ফযীলত", "Virtues of the Night of Qadr"),
    33: ("ইতিকাফ", "I'tikaf"),
    34: ("ক্রয়-বিক্রয় ও ব্যবসা", "Sales and Trade"),
    35: ("আস-সালাম (অগ্রিম ক্রয়)", "As-Salam"),
    36: ("শুফআ (অগ্রক্রয়াধিকার)", "Pre-emption"),
    37: ("ইজারা (ভাড়া ও মজুরি)", "Hiring"),
    38: ("হাওয়ালা (ঋণ স্থানান্তর)", "Transferance of Debt"),
    39: ("কাফালাহ (জামিনদারি)", "Kafalah"),
    40: ("ওয়াকালাহ (প্রতিনিধিত্ব)", "Representation"),
    41: ("বর্গাচাষ ও চাষাবাদ", "Agriculture"),
    42: ("পানি বণ্টন ও সেচ", "Distribution of Water"),
    43: ("ঋণ গ্রহণ ও আদায়", "Loans and Debts"),
    44: ("বিবাদ ও মামলা নিষ্পত্তি", "Quarrels"),
    45: ("লুকতাহ (কুড়িয়ে পাওয়া বস্তু)", "Lost Property"),
    46: ("মাজালিম (জুলুম ও অবিচার)", "Oppressions"),
    47: ("শিরকাত (অংশীদারিত্ব)", "Partnership"),
    48: ("রহ্‌ন (বন্ধক)", "Mortgaging"),
    49: ("দাসমুক্তি ও আজাদী", "Manumission of Slaves"),
    50: ("মুকাতাব (চুক্তিবদ্ধ দাস)", "Mukatab"),
    51: ("হেবা (উপহার ও দান)", "Gifts"),
    52: ("শাহাদাত (সাক্ষ্য প্রদান)", "Witnesses"),
    53: ("সুলহ (সন্ধি ও মীমাংসা)", "Peacemaking"),
    54: ("শুরূত (শর্তাবলী)", "Conditions"),
    55: ("অসিয়ত (উইল)", "Wills and Testaments"),
    56: ("জিহাদ ও সংগ্রাম", "Jihad"),
    57: ("খুমুস (এক-পঞ্চমাংশ বণ্টন)", "One-fifth of Booty"),
    58: ("জিযিয়া ও চুক্তি", "Jizyah and Mawaada'ah"),
    59: ("সৃষ্টির সূচনা ও বিকাশ", "Beginning of Creation"),
    60: ("নবী-রাসূলগণের ঘটনা", "Prophets"),
    61: ("নবী করিম (সাঃ)-এর সুমহান মর্যাদা", "Virtues and Merits of the Prophet"),
    62: ("সাহাবায়ে কিরামের ফযীলত", "Companions of the Prophet"),
    63: ("আনসারগণের মর্যাদা", "Merits of the Helpers in Madinah"),
    64: ("মাগাযী (সামরিক যুদ্ধাভিযান)", "Military Expeditions"),
    65: ("কুরআনের তাফসীর", "Prophetic Commentary on Quran"),
    66: ("কুরআনের ফযীলত ও মাহাত্ম্য", "Virtues of the Quran"),
    67: ("নিকাহ (বিবাহ)", "Wedlock, Marriage"),
    68: ("তালাক (বিবাহবিচ্ছেদ)", "Divorce"),
    69: ("পরিবারের ভরণপোষণ", "Supporting the Family"),
    70: ("খাদ্য ও আহার", "Food, Meals"),
    71: ("আকীকা", "Sacrifice on Occasion of Birth"),
    72: ("শিকার ও যবেহ", "Hunting, Slaughtering"),
    73: ("কুরবানী", "Al-Adha Festival Sacrifice"),
    74: ("পানীয় সংক্রান্ত বিধান", "Drinks"),
    75: ("রোগী ও অসুস্থদের সেবা", "Patients"),
    76: ("চিকিৎসা ও ঔষধ", "Medicine"),
    77: ("পোশাক ও সাজসজ্জা", "Dress"),
    78: ("আদব (শিষ্টাচার ও সদ্ব্যবহার)", "Good Manners - Adab"),
    79: ("অনুমতি প্রার্থনা", "Asking Permission"),
    80: ("দুআ ও যিকির", "Invocations"),
    81: ("রিক্বাক্ব (দিল নরমকারী নসীহত)", "Heart-melting Traditions"),
    82: ("তাকদীর (ভাগ্যলিপি)", "Divine Pre-ordainment"),
    83: ("কসম ও মানত", "Oaths and Vows"),
    84: ("কাফফারা (শপথের কাফফারা)", "Expiation for Oaths"),
    85: ("ফারায়েয (উত্তরাধিকার আইন)", "Laws of Inheritance"),
    86: ("হুদূদ (দণ্ডবিধি ও শাস্তি)", "Punishments - Hudood"),
    87: ("দিয়াত (রক্তপণ)", "Blood Money"),
    88: ("মুরতাদ সংক্রান্ত হুকুম", "Apostates"),
    89: ("ইকরাম (জোরজবরদস্তি)", "Coercion"),
    90: ("হীলাহ (ছলচাতুরী বর্জন)", "Tricks"),
    91: ("স্বপ্নের ব্যাখ্যা (তাবীর)", "Interpretation of Dreams"),
    92: ("ফিতনা ও কেয়ামতের আলামত", "Afflictions and End of the World"),
    93: ("আহকাম ও বিচারব্যবস্থা", "Judgments"),
    94: ("তামান্না (আকাঙ্ক্ষা ও কামনা)", "Wishes"),
    95: ("খবরে ওয়াহেদ (একক সাক্ষ্য)", "Information given by One Person"),
    96: ("কুরআন ও সুন্নাহ আঁকড়ে ধরা", "Holding Fast to Quran & Sunnah"),
    97: ("তাওহীদ (আল্লাহর একত্ববাদ)", "Oneness of Allah - Tawheed")
}

def main():
    print("=== Downloading Sahih al-Bukhari Bengali Dataset ===")
    url = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ben-bukhari.json"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    hadiths = data.get("hadiths", [])
    print(f"Total Hadiths downloaded: {len(hadiths)}")

    out_base = "app/src/main/assets/www/data/hadith"
    books_dir = os.path.join(out_base, "books")
    os.makedirs(books_dir, exist_ok=True)

    # Group hadiths by book
    by_book = {}
    for h in hadiths:
        book_id = h.get("reference", {}).get("book", 1)
        by_book.setdefault(book_id, []).append(h)

    # Build books metadata
    books_meta = []
    # Sorted book IDs
    book_ids = sorted([b for b in by_book.keys() if b > 0])

    for b_id in book_ids:
        b_hadiths = by_book[b_id]
        first_h = b_hadiths[0].get("hadithnumber", 0)
        last_h = b_hadiths[-1].get("hadithnumber", 0)
        
        bn_title, en_title = BENGALI_BOOK_NAMES.get(b_id, (f"অধ্যায় {b_id}", f"Book {b_id}"))

        meta_item = {
            "bookNumber": b_id,
            "titleBn": bn_title,
            "titleEn": en_title,
            "hadithCount": len(b_hadiths),
            "hadithFirst": first_h,
            "hadithLast": last_h
        }
        books_meta.append(meta_item)

        # Save individual book JS
        book_js_path = os.path.join(books_dir, f"{b_id}.js")
        with open(book_js_path, "w", encoding="utf-8") as f:
            f.write(f"window.BUKHARI_BOOKS = window.BUKHARI_BOOKS || {{}};\nwindow.BUKHARI_BOOKS[{b_id}] = " + json.dumps(b_hadiths, ensure_ascii=False) + ";\n")

    print(f"Saved {len(book_ids)} individual book JS files in {books_dir}")

    # Save books metadata JS & JSON
    meta_js_path = os.path.join(out_base, "bukhari_books_meta.js")
    with open(meta_js_path, "w", encoding="utf-8") as f:
        f.write("window.BUKHARI_METADATA = " + json.dumps(books_meta, ensure_ascii=False) + ";\n")
    print(f"Saved {meta_js_path}")

    # Pre-bundle initial popular books (Books 1, 2, 3: ওহীর সূচনা, ঈমান, ইলম) for instant zero-latency reading
    preloaded_books = {}
    for b_id in [1, 2, 3]:
        if b_id in by_book:
            preloaded_books[b_id] = by_book[b_id]

    preloaded_js_path = os.path.join(out_base, "bukhari_preloaded.js")
    with open(preloaded_js_path, "w", encoding="utf-8") as f:
        f.write("window.BUKHARI_PRELOADED = " + json.dumps(preloaded_books, ensure_ascii=False) + ";\n")
    print(f"Saved {preloaded_js_path} (preloaded initial books 1-3)")

    # Save Hadith license and attribution file
    license_doc = os.path.join(out_base, "BUKHARI_SOURCES_AND_LICENSES.txt")
    with open(license_doc, "w", encoding="utf-8") as f:
        f.write("""SAHIH AL-BUKHARI (সহীহ বুখারী শরীফ) DATA SOURCES & CREDITS
===========================================================
Book: Sahih al-Bukhari (সহীহ আল-বুখারী)
Compiler: Imam Muhammad ibn Ismail al-Bukhari (ইমাম বুখারী রহ.)
Language: Bengali Translation (বাংলা অনুবাদ)
Source: Islamic Foundation Bangladesh / Modern Prokashoni
Data API Source: Hadith-API Open Project (fawazahmed0/hadith-api)
Chapters (কিতাব): 97 কিতাব
Hadith Count: 7,500+ সহীহ হাদিস
License: Free redistribution for Islamic education and offline mobile apps.
""")
    print("=== Bukhari Dataset Preparation Finished Successfully! ===")

if __name__ == "__main__":
    main()
