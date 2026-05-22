// 🚀 i18n — react-i18next + expo-localization
// 정책 (CLAUDE.md M5): 키 자리는 5개 언어 모두 마련, 출고는 ko/en.
// 누락 키는 en 으로 fallback (PRD 3.4.5).

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import ko from "../locales/ko.json";
import en from "../locales/en.json";
import ja from "../locales/ja.json";
import fr from "../locales/fr.json";
import de from "../locales/de.json";

const SUPPORTED = ["ko", "en", "ja", "fr", "de"] as const;
type Lang = (typeof SUPPORTED)[number];

function detectInitialLang(): Lang {
  const tag = Localization.getLocales()[0]?.languageCode ?? "en";
  return (SUPPORTED as readonly string[]).includes(tag) ? (tag as Lang) : "en";
}

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
    fr: { translation: fr },
    de: { translation: de },
  },
  lng: detectInitialLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React 가 이미 XSS 보호
  returnNull: false,
  // 🚀 모바일에서 첫 렌더 빈 화면 회피 — suspense 끄고 즉시 key/fallback 반환
  react: { useSuspense: false },
});

export default i18n;
