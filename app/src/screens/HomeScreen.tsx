// 🚀 Phase 4 UI/UX — 홈 화면
// 사용자 결정 2026-05-24: 잔잔한 환영 + 현재 모드 안내 + 오늘의 흐름 + 오늘의 IN + 데일리 메시지
// CLAUDE.md M1: 카운터·달성률 X. 시간 위치만 표시.

import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import { dailyMessageKey } from "../lib/dailyMessage";
import { IN_TRAITS, labelKey, type InTraitKey } from "../lib/inTraits";
import { type Profile } from "../lib/profiles";
import { currentMode, type Mode } from "../lib/timeOfDay";

const MODE_ICON: Record<Mode, keyof typeof Feather.glyphMap> = {
  morning: "sunrise",
  day:     "sun",
  evening: "sunset",
  night:   "moon",
};

const MODE_ORDER: Mode[] = ["morning", "day", "evening", "night"];

// 시간 위치 점 표시용 — 06/10/18/22 시 경계 기준
function hourToPosition(hour: number): { modeIdx: number; ratio: number } {
  // morning: 6-10, day: 10-18, evening: 18-22, night: 22-6
  if (hour >= 6 && hour < 10)  return { modeIdx: 0, ratio: (hour - 6)  / 4 };
  if (hour >= 10 && hour < 18) return { modeIdx: 1, ratio: (hour - 10) / 8 };
  if (hour >= 18 && hour < 22) return { modeIdx: 2, ratio: (hour - 18) / 4 };
  if (hour >= 22)              return { modeIdx: 3, ratio: (hour - 22) / 8 };
  return { modeIdx: 3, ratio: (hour + 2) / 8 };  // 0-2 시
}

export function HomeScreen({
  profile,
  onGoToMode,
}: {
  profile: Profile;
  onGoToMode: (mode: Mode) => void;
}) {
  const { t } = useTranslation();
  const now = new Date();
  const mode = currentMode();
  const hour = now.getHours();
  const nickname = profile.display_nickname ?? t(profile.combo_nickname ?? "combos.unknown");

  const greetingKey =
    mode === "morning" ? "home.greetingMorning" :
    mode === "day"     ? "home.greetingDay"     :
    mode === "evening" ? "home.greetingEvening" :
                         "home.greetingNight";

  const currentHintKey =
    mode === "morning" ? "home.currentHintMorning" :
    mode === "day"     ? "home.currentHintDay"     :
    mode === "evening" ? "home.currentHintEvening" :
                         "home.currentHintNight";

  const pos = hourToPosition(hour);

  // 사용자가 선택한 IN 특성 중 오늘 1개 (date-of-year 기반 결정적)
  const userTraits: InTraitKey[] = (profile.in_traits ?? []) as InTraitKey[];
  const traitsPool = userTraits.length > 0 ? userTraits : IN_TRAITS.map((t) => t.key);
  const traitToday = traitsPool[now.getDate() % traitsPool.length];
  const traitObj = IN_TRAITS.find((t) => t.key === traitToday);

  return (
    <View className="px-6 pt-4 pb-6">
      {/* 닉네임 + 시간 인사 */}
      <Text className="text-ink text-2xl font-medium mb-1.5">
        {t(greetingKey, { nick: nickname })}
      </Text>
      <Text className="text-mute text-sm italic">
        {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}
      </Text>

      {/* 현재 모드 안내 카드 */}
      <View className="mt-6 rounded-card border border-hair bg-paper p-5">
        <View className="flex-row items-center mb-2">
          <Feather name={MODE_ICON[mode]} size={20} color="#1A1A1F" style={{ marginRight: 6 }} />
          <Text className="text-ink text-lg font-medium">
            {t("home.currentSection", { mode: t(`modes.${mode}.name`) })}
          </Text>
        </View>
        <Text className="text-ink-soft text-base leading-relaxed mb-4">
          {t(currentHintKey)}
        </Text>
        <Pressable
          onPress={() => onGoToMode(mode)}
          className="rounded-pill items-center justify-center bg-ink"
          style={{ height: 48 }}
        >
          <Text className="text-paper-warm text-base font-medium">
            {t("home.enterMode", { mode: t(`modes.${mode}.name`) })}
          </Text>
        </Pressable>
      </View>

      {/* 오늘의 흐름 — 시간 위치 표시 (개수 X, M1 정합) */}
      <Text className="text-mute text-sm tracking-widest mt-7 mb-3">
        {t("home.todayFlowSection")}
      </Text>
      <View className="rounded-card border border-hair bg-paper p-4">
        {MODE_ORDER.map((m, idx) => {
          const active = idx === pos.modeIdx;
          return (
            <Pressable
              key={m}
              onPress={() => onGoToMode(m)}
              className="flex-row items-center py-2.5"
            >
              <View style={{ width: 28, alignItems: "center", marginRight: 10 }}>
                <Feather
                  name={MODE_ICON[m]}
                  size={20}
                  color={active ? "#1A1A1F" : "#9A9486"}
                />
              </View>
              <Text className={(active ? "text-ink font-medium" : "text-ink-soft") + " text-base flex-1"}>
                {t(`modes.${m}.name`)}
              </Text>
              <View style={{ flexDirection: "row" }}>
                {[0, 1, 2, 3].map((d) => {
                  const isFilled = idx < pos.modeIdx || (active && d / 4 <= pos.ratio);
                  return (
                    <View
                      key={d}
                      style={{
                        width: 4, height: 4, borderRadius: 2, marginLeft: 3,
                        backgroundColor: isFilled ? "#1A1A1F" : "#CFCAB8",
                      }}
                    />
                  );
                })}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* 오늘의 IN */}
      {traitObj && (
        <>
          <Text className="text-mute text-sm tracking-widest mt-7 mb-3">
            {t("home.inTraitSection")}
          </Text>
          <View className="rounded-card border border-hair bg-paper p-5 flex-row items-center">
            <View style={{ width: 36, alignItems: "center", marginRight: 12 }}>
              <Ionicons name={traitObj.iconName as any} size={28} color="#1A1A1F" />
            </View>
            <Text className="text-ink text-base flex-1 leading-relaxed">
              {t(labelKey(traitObj.key))}
            </Text>
          </View>
        </>
      )}

      {/* 오늘의 한 마디 — MBTI 별 데일리 */}
      <Text className="text-mute text-sm tracking-widest mt-7 mb-3">
        {t("home.dailySection")}
      </Text>
      <View className="rounded-card border border-leaf bg-day-soft p-5">
        <Text className="text-ink text-base italic leading-relaxed" style={{ lineHeight: 26 }}>
          {t(dailyMessageKey(profile.solo_mbti, now))}
        </Text>
      </View>
    </View>
  );
}
