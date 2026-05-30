// 🚀 온보딩 인트로 — 브랜드 + 타이틀 + 3행 안내
// 원본: src/onboarding.jsx 의 OBIntro / OBIntroRow

import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

export function OBIntro() {
  const { t } = useTranslation();
  return (
    <View className="pt-6">
      <Text className="text-mute text-xs tracking-widest mb-5">
        {t("onboarding.brand")}
      </Text>

      {/* IN 특성 선택 직후 안내 — 사용자에게 닿았음을 부드럽게 전함 */}
      <View className="rounded-card border border-evening bg-evening-soft p-3.5 mb-5 flex-row items-center">
        <Text style={{ fontSize: 18, marginRight: 10 }}>🌿</Text>
        <Text className="text-ink text-sm flex-1 leading-relaxed">
          {t("onboarding.intro.helps")}
        </Text>
      </View>

      <Text className="text-ink text-3xl font-normal leading-snug">
        {t("onboarding.intro.title")}
      </Text>
      <Text className="text-ink-soft text-sm leading-relaxed mt-7">
        {t("onboarding.intro.body")}
      </Text>

      <View className="mt-9 border-t border-hair">
        <Row num="01" titleKey="onboarding.intro.row1.title" descKey="onboarding.intro.row1.desc" />
        <Row num="02" titleKey="onboarding.intro.row2.title" descKey="onboarding.intro.row2.desc" />
        <Row num="03" titleKey="onboarding.intro.row3.title" descKey="onboarding.intro.row3.desc" last />
      </View>
    </View>
  );
}

function Row({ num, titleKey, descKey, last }: {
  num: string; titleKey: string; descKey: string; last?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View className={"py-5 px-1 flex-row " + (last ? "" : "border-b border-hair")}>
      <Text className="text-mute text-xs mr-4">{num}</Text>
      <View className="flex-1">
        <Text className="text-ink text-base font-medium">{t(titleKey)}</Text>
        <Text className="text-mute text-xs mt-1">{t(descKey)}</Text>
      </View>
    </View>
  );
}
