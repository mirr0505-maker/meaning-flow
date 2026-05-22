// 🚀 🌙 착륙 모드 (Night / Landing) — PRD 4.4
// 4 stage 탭: vault (보관함) · timer (5분) · first (내일의 첫 단추) · blanket (이불)
// 다크 톤 (night-bg 배경 + night-ink 글자). FlowRouter 에서 ScrollView 배경은 이미 bg-night-bg.
// 음성 2분 스피치는 별도 STEP 2-G — Timer 탭 안에 자리만 안내.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import type { Profile } from "../lib/profiles";
import { NightBlanket } from "./night/NightBlanket";
import { NightFirst } from "./night/NightFirst";
import { NightTimer } from "./night/NightTimer";
import { NightVault } from "./night/NightVault";

type Stage = "vault" | "timer" | "first" | "blanket";
const STAGES: Stage[] = ["vault", "timer", "first", "blanket"];

export function NightScreen({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>("vault");

  return (
    <View className="px-6 pt-2 pb-6">
      {/* 4 stage 탭 — mono 폰트 톤, 선택 시 night-bg3 채움 */}
      <View className="flex-row mb-5" style={{ gap: 6 }}>
        {STAGES.map((s) => {
          const on = s === stage;
          return (
            <Pressable
              key={s}
              onPress={() => setStage(s)}
              className={
                "flex-1 rounded-pill items-center justify-center border " +
                (on
                  ? "bg-night-bg3 border-night-soft"
                  : "border-night-hair")
              }
              style={{ height: 32 }}
            >
              <Text
                className={(on ? "text-night-ink" : "text-night-muted") + " text-[10px] font-medium tracking-widest"}
              >
                {t(`flow.night.tabs.${s}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {stage === "vault"   && <NightVault userId={profile.id} />}
      {stage === "timer"   && <NightTimer userId={profile.id} />}
      {stage === "first"   && <NightFirst userId={profile.id} />}
      {stage === "blanket" && <NightBlanket />}
    </View>
  );
}
