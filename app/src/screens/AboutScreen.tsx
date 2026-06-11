// 🚀 Phase 4 UI/UX STEP 4 — About / "왜 만들었나" 화면
// 사용자 결정 2026-05-23: 사용자가 답답할 때 다시 읽을 수 있는 앱 소개 + IN 특성 설명.
// 진입점: SettingsScreen 의 "Meaning Flow 이야기" 메뉴.

import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import { IN_TRAITS, labelKey } from "../lib/inTraits";
import { Ionicons } from "@expo/vector-icons";

export function AboutScreen({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-night-bg">
      {/* 헤더 */}
      <View className="px-6 pt-14 pb-4 flex-row items-center border-b border-night-hair">
        <Pressable onPress={onClose} className="py-2 pr-3">
          <Text className="text-night-ink text-xl">{"<"}</Text>
        </Pressable>
        <Text className="text-night-ink text-base font-medium flex-1">
          {t("about.title")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}>
        {/* 왜 만들었나 */}
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("about.whySection")}
        </Text>
        <Text className="text-night-ink text-lg font-normal leading-snug mb-3" style={{ lineHeight: 28 }}>
          {t("about.whyTitle")}
        </Text>
        <Text className="text-night-soft text-sm leading-relaxed mb-6">
          {t("about.whyBody")}
        </Text>

        {/* 두 가지 약속 */}
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("about.promiseSection")}
        </Text>
        <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-2.5">
          <Text className="text-night-ink text-sm font-medium mb-1">
            {t("about.promise1Title")}
          </Text>
          <Text className="text-night-soft text-xs leading-relaxed">
            {t("about.promise1Body")}
          </Text>
        </View>
        <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-6">
          <Text className="text-night-ink text-sm font-medium mb-1">
            {t("about.promise2Title")}
          </Text>
          <Text className="text-night-soft text-xs leading-relaxed">
            {t("about.promise2Body")}
          </Text>
        </View>

        {/* IN 특성 다시 보기 */}
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("about.inTraitsSection")}
        </Text>
        <Text className="text-night-soft text-xs leading-relaxed mb-3">
          {t("about.inTraitsIntro")}
        </Text>
        <View className="mb-6">
          {IN_TRAITS.map((trait) => (
            <View key={trait.key} className="rounded-card border border-night-hair bg-night-bg2 p-3 mb-1.5 flex-row items-center">
              <View style={{ width: 24, alignItems: "center", marginRight: 8 }}>
                <Ionicons name={trait.iconName as any} size={18} color="#A6A3B3" />
              </View>
              <Text className="text-night-ink text-xs flex-1 leading-relaxed">
                {t(labelKey(trait.key))}
              </Text>
            </View>
          ))}
        </View>

        {/* 두 자아 — 인지만, 진단 X */}
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("about.dualSelfSection")}
        </Text>
        <Text className="text-night-soft text-xs leading-relaxed mb-6">
          {t("about.dualSelfBody")}
        </Text>

        {/* 마지막 한 줄 */}
        <Text className="text-night-muted text-xs text-center italic leading-relaxed">
          {t("about.closing")}
        </Text>
      </ScrollView>
    </View>
  );
}
