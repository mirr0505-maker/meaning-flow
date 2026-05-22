// 🚀 온보딩 MBTI 4지선다 — Solo / Social 두 단계 공용
// 원본: src/onboarding.jsx 의 OBPickMBTI

import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { MBTI } from "../lib/combos";

const MBTI_KEYS = ["INFP", "INFJ", "INTP", "INTJ"] as const;

type Props = {
  titleKey: string;
  subtitleKey: string;
  tagKey: string;
  tagColorClass: string;       // 예: "bg-evening" / "bg-day"
  field: "Solo" | "Social";
  value: MBTI | null;
  onChange: (m: MBTI | null) => void;
};

export function OBPickMBTI(props: Props) {
  const { t } = useTranslation();
  const { titleKey, subtitleKey, tagKey, tagColorClass, field, value, onChange } = props;

  return (
    <View>
      <View className="flex-row items-center mb-3.5">
        <View className={`w-1.5 h-1.5 rounded-pill ${tagColorClass} mr-2`} />
        <Text className="text-mute text-xs tracking-widest">{t(tagKey).toUpperCase()}</Text>
      </View>
      <Text className="text-ink text-2xl font-normal leading-snug">
        {t(titleKey)}{"\n"}{t(subtitleKey)}
      </Text>

      <View className="mt-7 flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
        {MBTI_KEYS.map((k) => {
          const on = value === k;
          const lower = k.toLowerCase();
          const subtitleText = field === "Solo"
            ? t(`mbti.${lower}.titleSolo`)
            : t(`mbti.${lower}.titleSocial`);
          return (
            <View key={k} style={{ width: "50%", padding: 5 }}>
              <Pressable
                onPress={() => onChange(k)}
                className={
                  "p-4 rounded-card " +
                  (on ? "bg-ink border border-ink" : "bg-paper border border-hair-soft")
                }
                style={{ minHeight: 122 }}
              >
                <Text className={"text-xs tracking-widest " + (on ? "text-paper-warm opacity-70" : "text-mute")}>
                  {k}
                </Text>
                <Text className={"text-sm font-medium mt-1.5 " + (on ? "text-paper-warm" : "text-ink")}>
                  {subtitleText}
                </Text>
                <Text className={"text-xs leading-snug mt-2 " + (on ? "text-paper-warm opacity-75" : "text-ink-soft")}>
                  {t(`mbti.${lower}.desc`)}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable onPress={() => onChange(null)} className="mt-5">
        <Text className="text-mute text-xs underline">{t("onboarding.actions.unknown")}</Text>
      </Pressable>
    </View>
  );
}
