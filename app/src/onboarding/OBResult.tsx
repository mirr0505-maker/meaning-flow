// 🚀 온보딩 결과 — 조합 닉네임 표시 + 저장 후 메인 진입

import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  nicknameKey: string;
  saving: boolean;
  saveError: string | null;
  onEnter: () => void;
};

export function OBResult({ nicknameKey, saving, saveError, onEnter }: Props) {
  const { t } = useTranslation();
  return (
    <View className="pt-6">
      <Text className="text-mute text-xs tracking-widest">{t("onboarding.result.tag")}</Text>
      <Text className="text-ink text-base mt-3">{t("onboarding.result.lead")}</Text>
      <Text className="text-ink text-3xl font-medium mt-2">{t(nicknameKey)}</Text>

      {saveError && (
        <View className="mt-5 p-3 bg-evening-soft rounded-card">
          <Text className="text-ink text-xs font-medium">{t("onboarding.result.saveError")}</Text>
          <Text className="text-ink-soft text-xs mt-1">{saveError}</Text>
        </View>
      )}

      <Pressable
        onPress={onEnter}
        disabled={saving}
        className={"mt-8 rounded-pill items-center justify-center bg-ink " + (saving ? "opacity-50" : "")}
        style={{ height: 52 }}
      >
        <Text className="text-paper-warm text-sm font-medium">
          {saving ? t("onboarding.result.saving") : t("onboarding.result.enter")}
        </Text>
      </Pressable>
    </View>
  );
}
