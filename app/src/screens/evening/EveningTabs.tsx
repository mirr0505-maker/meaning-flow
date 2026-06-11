// 🚀 🌆 통합 모드 sub-tab — 의미 일기 | 공명의 정원
// PRD 4.5 F-RES-002: 공명방은 저녁(18~22시) 진입이 자연. evening 모드 내부에 sub-tab.
// 기본 진입: journal. 사용자가 garden 칩 선택 시 GardenScreen.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import type { Profile } from "../../lib/profiles";
import { DiaryArchiveScreen } from "../DiaryArchiveScreen";
import { EveningScreen } from "../EveningScreen";
import { GardenScreen } from "../GardenScreen";

type SubTab = "journal" | "archive" | "garden";

export function EveningTabs({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<SubTab>("journal");

  return (
    <View>
      {/* sub-tab — 3 칩. 헤더와 충돌 방지 상단 패딩 */}
      <View className="px-6 pt-3 mb-4 flex-row" style={{ gap: 6 }}>
        {(["journal", "archive", "garden"] as SubTab[]).map((s) => {
          const on = s === tab;
          return (
            <Pressable
              key={s}
              onPress={() => setTab(s)}
              className={
                "flex-1 rounded-pill items-center justify-center border " +
                (on ? "bg-night-bg3 border-night-soft" : "border-night-hair")
              }
              style={{ height: 32 }}
            >
              <Text className={(on ? "text-night-ink" : "text-night-muted") + " text-[11px] font-medium tracking-widest"}>
                {t(`flow.evening.tabs.${s}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "journal" && <EveningScreen profile={profile} />}
      {tab === "archive" && <DiaryArchiveScreen userId={profile.id} dark={true} />}
      {tab === "garden"  && <GardenScreen  profile={profile} />}
    </View>
  );
}
