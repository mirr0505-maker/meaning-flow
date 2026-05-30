// 🚀 개발 단계 임시 대시보드 (STEP 1-A/B/C/D 검증용)
// STEP 1-E 에서 4시간대 모드 화면으로 대체될 예정.
// 현재 표시: 헤더 + 언어 토글 + 사용자 조합 닉네임 + Supabase 헬스 체크 + 4시간대 토큰

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/profiles";

const MODE_KEYS = ["morning", "day", "evening", "night"] as const;
const MODE_ACCENT = {
  morning: { bg: "bg-morning-soft", accent: "bg-morning" },
  day:     { bg: "bg-day-soft",     accent: "bg-day" },
  evening: { bg: "bg-evening-soft", accent: "bg-evening" },
  night:   { bg: "bg-night-soft",   accent: "bg-night" },
} as const;

type Health =
  | { state: "checking" }
  | { state: "ok"; rowCount: number }
  | { state: "error"; message: string };

export function DevDashboard({ profile }: { profile: Profile }) {
  const { t, i18n } = useTranslation();
  const [health, setHealth] = useState<Health>({ state: "checking" });

  useEffect(() => {
    let cancelled = false;
    supabase.from("prompt_templates")
      .select("*", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (cancelled) return;
        if (error) setHealth({ state: "error", message: error.message });
        else       setHealth({ state: "ok", rowCount: count ?? 0 });
      });
    return () => { cancelled = true; };
  }, []);

  const isKo = i18n.language.startsWith("ko");
  const toggleLang = () => i18n.changeLanguage(isKo ? "en" : "ko");

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 56 }}>
      <View className="flex-row items-start">
        <View className="flex-1 pr-3">
          <Text className="text-ink text-2xl font-semibold">{t("app.name")}</Text>
          <Text className="text-mute text-sm mt-1">{t("app.subtitle")}</Text>
        </View>
        <Pressable
          onPress={toggleLang}
          className="px-3 py-2 rounded-pill border border-hair"
        >
          <Text className="text-ink text-xs font-medium">
            {isKo ? t("lang.en") : t("lang.ko")}
          </Text>
        </Pressable>
      </View>

      {/* 사용자 조합 닉네임 — 온보딩 저장 결과 확인 */}
      <View className="mt-4 p-4 rounded-card bg-cream border border-hair-soft">
        <Text className="text-mute text-xs tracking-widest">
          {profile.solo_mbti} × {profile.social_mbti}
        </Text>
        <Text className="text-ink text-lg font-medium mt-1">
          {profile.display_nickname ?? t(profile.combo_nickname ?? "combos.unknown")}
        </Text>
      </View>

      {/* Supabase 헬스 체크 */}
      <View className={
        "rounded-card p-4 mt-4 mb-6 flex-row items-center " +
        (health.state === "ok"   ? "bg-day-soft"
         : health.state === "error" ? "bg-evening-soft"
         : "bg-hair-soft")
      }>
        <Text className="text-lg mr-3">
          {health.state === "ok" ? "✅" : health.state === "error" ? "⚠️" : "⏳"}
        </Text>
        <View className="flex-1">
          <Text className="text-ink text-sm font-medium">
            {health.state === "ok"      ? t("health.ok")
             : health.state === "error" ? t("health.error")
             :                            t("health.checking")}
          </Text>
          <Text className="text-ink-soft text-xs mt-0.5">
            {health.state === "ok"
              ? t("health.okDetail", { count: health.rowCount })
              : health.state === "error"
              ? health.message
              : t("health.checkingDetail")}
          </Text>
        </View>
      </View>

      {MODE_KEYS.map((k) => (
        <View key={k} className={`${MODE_ACCENT[k].bg} rounded-card p-4 mb-3 flex-row items-center`}>
          <View className={`${MODE_ACCENT[k].accent} w-10 h-10 rounded-pill mr-3`} />
          <View className="flex-1">
            <Text className="text-ink text-base font-medium">{t(`modes.${k}.label`)}</Text>
            <Text className="text-ink-soft text-xs mt-0.5">{t(`modes.${k}.name`)}</Text>
          </View>
        </View>
      ))}

      <View className="mt-6 border-t border-hair pt-4">
        <Text className="text-mute text-xs">{t("footer.tokenSource")}</Text>
      </View>
    </ScrollView>
  );
}
