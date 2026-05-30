// 🚀 Phase 4 UI/UX STEP U-2-C — 회고 화면 (네비바 5번째)
// 일기 · 보관 · 단추 · 완료 4 sub-tab. U-4 에서 보관/단추/완료 데이터 fetch 채움.
// 일기는 STEP 3 의 DiaryArchiveScreen 재사용.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { DiaryArchiveScreen } from "./DiaryArchiveScreen";
import { ReviewVault } from "./review/ReviewVault";
import { ReviewFirsts } from "./review/ReviewFirsts";
import { ReviewDoneTasks } from "./review/ReviewDoneTasks";

type SubTab = "diary" | "vault" | "firsts" | "tasks";

const TABS: SubTab[] = ["diary", "vault", "firsts", "tasks"];

export function ReviewScreen({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<SubTab>("diary");

  return (
    <View className="flex-1">
      {/* sub-tab 4 칩 — 밝은 차분 톤 */}
      <View className="px-6 pt-2 mb-3 flex-row" style={{ gap: 6 }}>
        {TABS.map((s) => {
          const on = s === tab;
          return (
            <Pressable
              key={s}
              onPress={() => setTab(s)}
              className={
                "flex-1 rounded-pill items-center justify-center border " +
                (on ? "bg-paper border-ink-soft" : "border-hair")
              }
              style={{ height: 32 }}
            >
              <Text className={(on ? "text-ink" : "text-mute") + " text-[11px] font-medium tracking-widest"}>
                {t(`review.tabs.${s}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "diary"  && <DiaryArchiveScreen userId={userId} />}
      {tab === "vault"  && <ReviewVault       userId={userId} />}
      {tab === "firsts" && <ReviewFirsts      userId={userId} />}
      {tab === "tasks"  && <ReviewDoneTasks   userId={userId} />}
    </View>
  );
}
