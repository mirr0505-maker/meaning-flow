import { useTranslation } from "react-i18next";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MAX_REFLECTION_LEN } from "../../lib/reflections";

export function WritingForm({
  text,
  share,
  onTextChange,
  onShareChange,
  onSubmit,
}: {
  text: string;
  share: boolean;
  onTextChange: (v: string) => void;
  onShareChange: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const canSubmit = text.trim().length > 0;

  return (
    <View>
      {/* 입력 카드 */}
      <View
        className="mt-5 rounded-card border border-night-hair bg-dusk-card p-5"
        style={{ minHeight: 180 }}
      >
        <TextInput
          multiline
          value={text}
          onChangeText={onTextChange}
          maxLength={MAX_REFLECTION_LEN}
          placeholder={t("flow.evening.placeholder")}
          placeholderTextColor="#9A9486"
          style={{
            fontSize: 17,
            lineHeight: 27,
            minHeight: 130,
            color: "#E8E6E0",
            textAlignVertical: "top",
          }}
        />
        <View className="flex-row justify-between items-center border-t border-night-hair pt-3 mt-2">
          <Text className="text-night-muted text-xs">
            {text.length} / {MAX_REFLECTION_LEN}
          </Text>
          <Text className="text-night-muted text-xs">{t("flow.evening.charHint")}</Text>
        </View>
      </View>

      {/* 공명방 토글 — 기본 OFF (M3) */}
      <View
        className={
          "mt-4 rounded-card border p-4 flex-row items-center " +
          (share ? "border-evening bg-evening-soft" : "border-night-hair")
        }
      >
        <Switch
          value={share}
          onValueChange={onShareChange}
          trackColor={{ false: "#2D2E3A", true: "#B8829C" }}
          thumbColor={share ? "#FBF8F1" : "#7E7E92"}
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Ionicons
              name="leaf-outline"
              size={14}
              color={share ? "#7FA37F" : "#A6A3B3"}
              style={{ marginRight: 4 }}
            />
            <Text className={(share ? "text-ink" : "text-night-ink") + " text-sm font-medium"}>
              {t("flow.evening.shareLabel")}
            </Text>
          </View>
          <Text className={(share ? "text-ink-soft" : "text-night-soft") + " text-xs mt-0.5"}>
            {share ? t("flow.evening.shareDescOn") : t("flow.evening.shareDescOff")}
          </Text>
        </View>
      </View>

      {/* 면책 카피 (M7) — 공명방 토글 ON 시만 노출 */}
      {share && (
        <Text className="text-night-muted text-[11px] mt-2 ml-1 leading-relaxed">
          {t("flow.evening.shareDisclaimer")}
        </Text>
      )}

      {/* 저장 */}
      <Pressable
        disabled={!canSubmit}
        onPress={onSubmit}
        className={"mt-5 rounded-pill items-center justify-center bg-night-ink" + (!canSubmit ? " opacity-30" : "")}
        style={{ height: 52 }}
      >
        <Text className="text-night-bg text-base font-medium">{t("flow.evening.submit")}</Text>
      </Pressable>
    </View>
  );
}
