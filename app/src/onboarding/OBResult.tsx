// 🚀 온보딩 결과 — 조합 닉네임 표시 + 사용자 닉네임 편집 + 저장 후 메인 진입
// Phase 4 UI/UX STEP 1: 자동 생성 조합 닉네임을 보고 본인이 마음에 들면 그대로,
// 다른 이름 원하면 입력란에 직접 작성 (선택). 미입력 시 자동 닉네임 사용.

import { Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  nicknameKey: string | null;   // null = 두 자아 둘 다 unknown — auto 닉네임 없음
  displayNickname: string;       // 사용자가 입력 중인 값
  onChangeDisplayNickname: (v: string) => void;
  saving: boolean;
  saveError: string | null;
  onEnter: () => void;
};

export function OBResult({
  nicknameKey, displayNickname, onChangeDisplayNickname,
  saving, saveError, onEnter,
}: Props) {
  const { t } = useTranslation();
  const autoNickname = nicknameKey ? t(nicknameKey) : t("onboarding.result.noCombo");

  return (
    <View className="pt-6">
      <Text className="text-mute text-xs tracking-widest">{t("onboarding.result.tag")}</Text>
      <Text className="text-ink text-base mt-3">{t("onboarding.result.lead")}</Text>
      <Text className="text-ink text-3xl font-medium mt-2">{autoNickname}</Text>

      {/* 닉네임 편집 — 자동 닉네임이 마음에 들지 않을 때만 입력. 미입력 시 자동 사용 */}
      <View className="mt-7">
        <Text className="text-ink-soft text-xs mb-2">{t("onboarding.result.editLabel")}</Text>
        <TextInput
          value={displayNickname}
          onChangeText={onChangeDisplayNickname}
          maxLength={30}
          placeholder={autoNickname}
          placeholderTextColor="#9A9486"
          className="rounded-card border border-hair bg-paper px-4"
          style={{ height: 48, fontSize: 16, color: "#1A1A1F" }}
        />
        <Text className="text-mute text-[11px] mt-1.5 leading-relaxed">
          {t("onboarding.result.editHint")}
        </Text>
      </View>

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
