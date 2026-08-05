#!/usr/bin/env python3
"""
One-shot script to apply timezone unit-name localizations for the 10
non-English locales. Reads client/src/data/conversion/timezone.json for
the English canonical names, and for each locale writes translations
into client/src/data/localization/units/{locale}.json.

Not committed to the working set of scripts (used once for the
localization pass); left in-tree as documentation of the translation
choices in case they need revisiting.
"""

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ─── Translations keyed by English canonical name ───
# City names use the language's conventional native spelling. Time
# descriptors ("Eastern Time" etc.) are translated to the equivalent
# meaning in each language.

TRANSLATIONS = {
    "es": {  # Spanish
        "Coordinated Universal Time": "Tiempo Universal Coordinado",
        "New York (Eastern Time)": "Nueva York (hora del Este)",
        "Chicago (Central Time)": "Chicago (hora Central)",
        "Denver (Mountain Time)": "Denver (hora de la Montaña)",
        "Los Angeles (Pacific Time)": "Los Ángeles (hora del Pacífico)",
        "Anchorage (Alaska Time)": "Anchorage (hora de Alaska)",
        "Honolulu (Hawaii Time)": "Honolulu (hora de Hawái)",
        "São Paulo": "São Paulo",
        "London": "Londres",
        "Paris (Central European)": "París (Europa Central)",
        "Berlin": "Berlín",
        "Moscow": "Moscú",
        "Johannesburg": "Johannesburgo",
        "Dubai": "Dubái",
        "Kolkata (India)": "Calcuta (India)",
        "Shanghai (China)": "Shanghái (China)",
        "Tokyo": "Tokio",
        "Sydney": "Sídney",
        "Auckland": "Auckland",
    },
    "fr": {  # French
        "Coordinated Universal Time": "Temps universel coordonné",
        "New York (Eastern Time)": "New York (heure de l'Est)",
        "Chicago (Central Time)": "Chicago (heure du Centre)",
        "Denver (Mountain Time)": "Denver (heure des Rocheuses)",
        "Los Angeles (Pacific Time)": "Los Angeles (heure du Pacifique)",
        "Anchorage (Alaska Time)": "Anchorage (heure de l'Alaska)",
        "Honolulu (Hawaii Time)": "Honolulu (heure d'Hawaï)",
        "São Paulo": "São Paulo",
        "London": "Londres",
        "Paris (Central European)": "Paris (Europe centrale)",
        "Berlin": "Berlin",
        "Moscow": "Moscou",
        "Johannesburg": "Johannesbourg",
        "Dubai": "Dubaï",
        "Kolkata (India)": "Calcutta (Inde)",
        "Shanghai (China)": "Shanghai (Chine)",
        "Tokyo": "Tokyo",
        "Sydney": "Sydney",
        "Auckland": "Auckland",
    },
    "de": {  # German
        "Coordinated Universal Time": "Koordinierte Weltzeit",
        "New York (Eastern Time)": "New York (Ostküstenzeit)",
        "Chicago (Central Time)": "Chicago (Central Time)",
        "Denver (Mountain Time)": "Denver (Mountain Time)",
        "Los Angeles (Pacific Time)": "Los Angeles (Pazifikzeit)",
        "Anchorage (Alaska Time)": "Anchorage (Alaska-Zeit)",
        "Honolulu (Hawaii Time)": "Honolulu (Hawaii-Zeit)",
        "São Paulo": "São Paulo",
        "London": "London",
        "Paris (Central European)": "Paris (Mitteleuropa)",
        "Berlin": "Berlin",
        "Moscow": "Moskau",
        "Johannesburg": "Johannesburg",
        "Dubai": "Dubai",
        "Kolkata (India)": "Kalkutta (Indien)",
        "Shanghai (China)": "Shanghai (China)",
        "Tokyo": "Tokio",
        "Sydney": "Sydney",
        "Auckland": "Auckland",
    },
    "it": {  # Italian
        "Coordinated Universal Time": "Tempo coordinato universale",
        "New York (Eastern Time)": "New York (ora orientale)",
        "Chicago (Central Time)": "Chicago (ora centrale)",
        "Denver (Mountain Time)": "Denver (ora delle Montagne Rocciose)",
        "Los Angeles (Pacific Time)": "Los Angeles (ora del Pacifico)",
        "Anchorage (Alaska Time)": "Anchorage (ora dell'Alaska)",
        "Honolulu (Hawaii Time)": "Honolulu (ora delle Hawaii)",
        "São Paulo": "San Paolo",
        "London": "Londra",
        "Paris (Central European)": "Parigi (Europa centrale)",
        "Berlin": "Berlino",
        "Moscow": "Mosca",
        "Johannesburg": "Johannesburg",
        "Dubai": "Dubai",
        "Kolkata (India)": "Calcutta (India)",
        "Shanghai (China)": "Shanghai (Cina)",
        "Tokyo": "Tokyo",
        "Sydney": "Sydney",
        "Auckland": "Auckland",
    },
    "pt": {  # Portuguese
        "Coordinated Universal Time": "Tempo Universal Coordenado",
        "New York (Eastern Time)": "Nova Iorque (hora do Leste)",
        "Chicago (Central Time)": "Chicago (hora Central)",
        "Denver (Mountain Time)": "Denver (hora das Montanhas)",
        "Los Angeles (Pacific Time)": "Los Angeles (hora do Pacífico)",
        "Anchorage (Alaska Time)": "Anchorage (hora do Alasca)",
        "Honolulu (Hawaii Time)": "Honolulu (hora do Havaí)",
        "São Paulo": "São Paulo",
        "London": "Londres",
        "Paris (Central European)": "Paris (Europa Central)",
        "Berlin": "Berlim",
        "Moscow": "Moscou",
        "Johannesburg": "Joanesburgo",
        "Dubai": "Dubai",
        "Kolkata (India)": "Calcutá (Índia)",
        "Shanghai (China)": "Xangai (China)",
        "Tokyo": "Tóquio",
        "Sydney": "Sydney",
        "Auckland": "Auckland",
    },
    "ru": {  # Russian
        "Coordinated Universal Time": "Всемирное координированное время",
        "New York (Eastern Time)": "Нью-Йорк (восточное время)",
        "Chicago (Central Time)": "Чикаго (центральное время)",
        "Denver (Mountain Time)": "Денвер (горное время)",
        "Los Angeles (Pacific Time)": "Лос-Анджелес (тихоокеанское время)",
        "Anchorage (Alaska Time)": "Анкоридж (аляскинское время)",
        "Honolulu (Hawaii Time)": "Гонолулу (гавайское время)",
        "São Paulo": "Сан-Паулу",
        "London": "Лондон",
        "Paris (Central European)": "Париж (центральноевропейское)",
        "Berlin": "Берлин",
        "Moscow": "Москва",
        "Johannesburg": "Йоханнесбург",
        "Dubai": "Дубай",
        "Kolkata (India)": "Калькутта (Индия)",
        "Shanghai (China)": "Шанхай (Китай)",
        "Tokyo": "Токио",
        "Sydney": "Сидней",
        "Auckland": "Окленд",
    },
    "ja": {  # Japanese
        "Coordinated Universal Time": "協定世界時",
        "New York (Eastern Time)": "ニューヨーク (東部標準時)",
        "Chicago (Central Time)": "シカゴ (中部標準時)",
        "Denver (Mountain Time)": "デンバー (山岳部標準時)",
        "Los Angeles (Pacific Time)": "ロサンゼルス (太平洋標準時)",
        "Anchorage (Alaska Time)": "アンカレッジ (アラスカ標準時)",
        "Honolulu (Hawaii Time)": "ホノルル (ハワイ標準時)",
        "São Paulo": "サンパウロ",
        "London": "ロンドン",
        "Paris (Central European)": "パリ (中央ヨーロッパ)",
        "Berlin": "ベルリン",
        "Moscow": "モスクワ",
        "Johannesburg": "ヨハネスブルグ",
        "Dubai": "ドバイ",
        "Kolkata (India)": "コルカタ (インド)",
        "Shanghai (China)": "上海 (中国)",
        "Tokyo": "東京",
        "Sydney": "シドニー",
        "Auckland": "オークランド",
    },
    "ko": {  # Korean
        "Coordinated Universal Time": "협정 세계시",
        "New York (Eastern Time)": "뉴욕 (동부 표준시)",
        "Chicago (Central Time)": "시카고 (중부 표준시)",
        "Denver (Mountain Time)": "덴버 (산악 표준시)",
        "Los Angeles (Pacific Time)": "로스앤젤레스 (태평양 표준시)",
        "Anchorage (Alaska Time)": "앵커리지 (알래스카 표준시)",
        "Honolulu (Hawaii Time)": "호놀룰루 (하와이 표준시)",
        "São Paulo": "상파울루",
        "London": "런던",
        "Paris (Central European)": "파리 (중앙유럽)",
        "Berlin": "베를린",
        "Moscow": "모스크바",
        "Johannesburg": "요하네스버그",
        "Dubai": "두바이",
        "Kolkata (India)": "콜카타 (인도)",
        "Shanghai (China)": "상하이 (중국)",
        "Tokyo": "도쿄",
        "Sydney": "시드니",
        "Auckland": "오클랜드",
    },
    "zh": {  # Chinese (Simplified)
        "Coordinated Universal Time": "协调世界时",
        "New York (Eastern Time)": "纽约(东部时间)",
        "Chicago (Central Time)": "芝加哥(中部时间)",
        "Denver (Mountain Time)": "丹佛(山区时间)",
        "Los Angeles (Pacific Time)": "洛杉矶(太平洋时间)",
        "Anchorage (Alaska Time)": "安克雷奇(阿拉斯加时间)",
        "Honolulu (Hawaii Time)": "檀香山(夏威夷时间)",
        "São Paulo": "圣保罗",
        "London": "伦敦",
        "Paris (Central European)": "巴黎(中欧)",
        "Berlin": "柏林",
        "Moscow": "莫斯科",
        "Johannesburg": "约翰内斯堡",
        "Dubai": "迪拜",
        "Kolkata (India)": "加尔各答(印度)",
        "Shanghai (China)": "上海(中国)",
        "Tokyo": "东京",
        "Sydney": "悉尼",
        "Auckland": "奥克兰",
    },
    "ar": {  # Arabic
        "Coordinated Universal Time": "التوقيت العالمي المنسق",
        "New York (Eastern Time)": "نيويورك (التوقيت الشرقي)",
        "Chicago (Central Time)": "شيكاغو (التوقيت الأوسط)",
        "Denver (Mountain Time)": "دنفر (توقيت الجبال)",
        "Los Angeles (Pacific Time)": "لوس أنجلوس (توقيت المحيط الهادئ)",
        "Anchorage (Alaska Time)": "أنكوراج (توقيت ألاسكا)",
        "Honolulu (Hawaii Time)": "هونولولو (توقيت هاواي)",
        "São Paulo": "ساو باولو",
        "London": "لندن",
        "Paris (Central European)": "باريس (وسط أوروبا)",
        "Berlin": "برلين",
        "Moscow": "موسكو",
        "Johannesburg": "جوهانسبرغ",
        "Dubai": "دبي",
        "Kolkata (India)": "كولكاتا (الهند)",
        "Shanghai (China)": "شنغهاي (الصين)",
        "Tokyo": "طوكيو",
        "Sydney": "سيدني",
        "Auckland": "أوكلاند",
    },
}


def main() -> int:
    with open(os.path.join(ROOT, "client/src/data/conversion/timezone.json")) as f:
        tz = json.load(f)
    english_names = [u["name"] for u in tz["units"]]

    # Validate every translation table covers every English name.
    errors = []
    for locale, table in TRANSLATIONS.items():
        for name in english_names:
            if name not in table:
                errors.append(f"{locale}: missing translation for {name!r}")
        for k in table:
            if k not in english_names:
                errors.append(f"{locale}: stale key {k!r} not in timezone.json")
    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        return 1

    # Apply translations to each locale file.
    for locale, table in TRANSLATIONS.items():
        path = os.path.join(ROOT, "client/src/data/localization/units", f"{locale}.json")
        with open(path) as f:
            data = json.load(f)
        for english, translated in table.items():
            data[english] = translated
        with open(path, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"  {locale}: wrote {len(table)} translations")
    return 0


if __name__ == "__main__":
    sys.exit(main())
