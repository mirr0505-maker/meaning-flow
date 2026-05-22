// 🚀 4시간대 자동 라우팅 + dev 모드 토글
// 현재 시각으로 morning/day/evening/night 자동 결정.
// 우상단에 4칩 토글 (개발/검증용 — 프로토타입의 Tweaks 패널 역할 축약).

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { Profile } from "../lib/profiles";
import { currentMode, type Mode } from "../lib/timeOfDay";
import { MorningScreen } from "./MorningScreen";
import { DayScreen } from "./DayScreen";
import { EveningScreen } from "./EveningScreen";
import { NightScreen } from "./NightScreen";

const MODES: Mode[] = ["morning", "day", "evening", "night"];
const MODE_ACCENT: Record<Mode, { bg: string; pill: string }> = {
  morning: { bg: "bg-paper-warm", pill: "bg-morning" },
  day:     { bg: "bg-paper",      pill: "bg-day" },
  evening: { bg: "bg-dusk-bg",    pill: "bg-evening" }, // 🌆 다크 가기 전 그레이
  night:   { bg: "bg-night-bg",   pill: "bg-night" },
};

// 🌐 3-cycle 언어 토글 — ko → en → ja → ko
const LANG_ORDER = ["ko", "en", "ja"] as const;
type Lang = (typeof LANG_ORDER)[number];

function currentLang(code: string): Lang {
  if (code.startsWith("ja")) return "ja";
  if (code.startsWith("en")) return "en";
  return "ko";
}

export function FlowRouter({ profile }: { profile: Profile }) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<Mode>(currentMode());
  const cur = currentLang(i18n.language);
  const next = LANG_ORDER[(LANG_ORDER.indexOf(cur) + 1) % LANG_ORDER.length];
  const toggleLang = () => i18n.changeLanguage(next);

  const accent = MODE_ACCENT[mode];
  // 🌙 night + 🌆 evening 은 다크/그레이 톤 — 헤더·토글·칩 글자색 분기
  const dark = mode === "night" || mode === "evening";
  const subTextClass    = dark ? "text-night-muted"  : "text-mute";
  const mainTextClass   = dark ? "text-night-ink"    : "text-ink";
  const toggleBorder    = dark ? "border-night-hair" : "border-hair";
  const chipOffBg       = dark ? "bg-night-bg2 border-night-hair" : "bg-paper border-hair";
  const chipOffText     = dark ? "text-night-ink"    : "text-ink-soft";
  const chipOnText      = dark ? "text-night-bg"     : "text-paper-warm";

  return (
    <ScrollView className={`flex-1 ${accent.bg}`} contentContainerStyle={{ paddingTop: 56, paddingBottom: 48 }}>
      {/* 상단 — 모드 라벨 + 언어 토글 (토글 폭 고정 → 헤더 흔들림 방지) */}
      <View className="px-6 flex-row items-start mb-3">
        <View className="flex-1">
          <Text className={`${subTextClass} text-xs tracking-widest`}>{t("flow.devToggle")}</Text>
          <Text className={`${mainTextClass} text-base font-medium mt-0.5`}>{t(`modes.${mode}.label`)}</Text>
        </View>
        <Pressable
          onPress={toggleLang}
          className={`px-3 py-2 rounded-pill border ${toggleBorder} items-center justify-center`}
          style={{ minWidth: 84 }}
        >
          <Text className={`${mainTextClass} text-xs font-medium`}>
            {t(`lang.${next}`)}
          </Text>
        </Pressable>
      </View>

      {/* 모드 4칩 — dev 검증용 */}
      <View className="px-6 flex-row mb-5">
        {MODES.map((m) => {
          const on = m === mode;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              className={
                "flex-1 py-2 rounded-pill mr-1.5 items-center justify-center border " +
                (on ? `${MODE_ACCENT[m].pill} border-transparent` : chipOffBg)
              }
            >
              <Text className={"text-xs font-medium " + (on ? chipOnText : chipOffText)}>
                {t(`modes.${m}.name`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "morning" && <MorningScreen profile={profile} dark={dark} />}
      {mode === "day"     && <DayScreen     profile={profile} dark={dark} />}
      {mode === "evening" && <EveningScreen profile={profile} />}
      {mode === "night"   && <NightScreen   profile={profile} />}
    </ScrollView>
  );
}

