// 🚀 Phase 4 UI/UX — FlowRouter 재구성 (홈/흐름/회고 3 탭)
// 사용자 결정 2026-05-24: 홈 화면 추가 + 네비바 3칸 + "흐름" 안 4 모드 sub-chip

import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";

import type { Profile } from "../lib/profiles";
import { currentMode, type Mode } from "../lib/timeOfDay";

import { AppHeader } from "./common/AppHeader";
import { BottomNav, type NavTab } from "./common/BottomNav";
import { DayScreen } from "./DayScreen";
import { HomeScreen } from "./HomeScreen";
import { IdentityEditScreen } from "./IdentityEditScreen";
import { MorningScreen } from "./MorningScreen";
import { NightScreen } from "./NightScreen";
import { ReviewScreen } from "./ReviewScreen";
import { SettingsScreen } from "./SettingsScreen";
import { EveningTabs } from "./evening/EveningTabs";

const MODES: Mode[] = ["morning", "day", "evening", "night"];
const MODE_EMOJI: Record<Mode, string> = {
  morning: "🌅",
  day:     "☀️",
  evening: "🌆",
  night:   "🌙",
};
const MODE_ACCENT: Record<Mode, string> = {
  morning: "#E6C58A",
  day:     "#7AA86D",
  evening: "#B8829C",
  night:   "#7E7E92",
};

export function FlowRouter({ profile, onAccountDeleted }: {
  profile: Profile;
  onAccountDeleted: () => void;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<NavTab>("home");
  // "흐름" 탭 안 sub-chip — 현재 시간대 자동 active. 사용자가 chip 으로 변경 가능.
  const [flowMode, setFlowMode] = useState<Mode>(currentMode());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);

  if (settingsOpen) {
    return (
      <SettingsScreen
        userId={profile.id}
        onClose={() => setSettingsOpen(false)}
        onAccountDeleted={onAccountDeleted}
      />
    );
  }
  if (identityOpen) {
    return <IdentityEditScreen userId={profile.id} onClose={() => setIdentityOpen(false)} />;
  }

  function goToMode(mode: Mode) {
    setFlowMode(mode);
    setTab("flow");
  }

  const isFlow = tab === "flow";
  const isEvening = isFlow && flowMode === "evening";
  const isNight = isFlow && flowMode === "night";
  const isDark = isEvening || isNight;
  const bg = isNight ? "#14151C" : (isEvening ? "#5A5867" : "#F8F3E9");

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppHeader
        profile={profile}
        onPressIdentity={() => setIdentityOpen(true)}
        onPressSettings={() => setSettingsOpen(true)}
        dark={isDark}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {tab === "home" && (
          <HomeScreen profile={profile} onGoToMode={goToMode} />
        )}
        {tab === "flow" && (
          <View>
            {/* 모드 4종 sub-chip — 이모지 + 라벨 가로, active 옅은 배경 */}
            <View className="px-4 pt-3 mb-3 flex-row" style={{ gap: 6 }}>
              {MODES.map((m) => {
                const on = m === flowMode;
                
                // 현재 전체 테마가 다크(evening/night)인지 여부에 따라 칩 색상 결정
                let chipBg = "transparent";
                let chipBorder = isDark ? "rgba(255,255,255,0.15)" : "#E8E0D0";
                let chipTextColor = isDark ? "#7E7E92" : "#9A9486"; // inactive 색상
                
                if (on) {
                  if (flowMode === "evening") {
                    chipBg = "#6E6B7A"; // dusk.card
                    chipBorder = "#C9C5DE"; // night.soft
                    chipTextColor = "#E8E6E0"; // night.ink
                  } else if (flowMode === "night") {
                    chipBg = "#262732"; // night.bg3
                    chipBorder = "#C9C5DE"; // night.soft
                    chipTextColor = "#E8E6E0"; // night.ink
                  } else {
                    chipBg = "#EDE6D4"; // light active bg
                    chipBorder = "#CFCAB8"; // light active border
                    chipTextColor = "#1A1A1F"; // light active text
                  }
                }

                return (
                  <Pressable
                    key={m}
                    onPress={() => setFlowMode(m)}
                    className="flex-1 items-center justify-center"
                    style={{
                      height: 56,
                      borderRadius: 14,
                      backgroundColor: chipBg,
                      borderWidth: 1,
                      borderColor: chipBorder,
                    }}
                  >
                    <Text style={{ fontSize: 18, marginBottom: 2 }}>{MODE_EMOJI[m]}</Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: chipTextColor,
                        fontWeight: on ? "600" : "400",
                      }}
                    >
                      {t(`modes.${m}.name`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {flowMode === "morning" && <MorningScreen profile={profile} dark={false} />}
            {flowMode === "day"     && <DayScreen     profile={profile} dark={false} />}
            {flowMode === "evening" && <EveningTabs   profile={profile} />}
            {flowMode === "night"   && <NightScreen   profile={profile} />}
          </View>
        )}
        {tab === "review" && <ReviewScreen userId={profile.id} />}
      </ScrollView>

      <BottomNav active={tab} onChange={setTab} />
    </View>
  );
}
