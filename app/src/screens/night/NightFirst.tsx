// 🚀 🌙 NightFirst — 내일의 첫 단추 예약 (PRD 4.4 F-NIT-003)
// 4 옵션(물·스트레칭·영양제·직접입력) 중 하나 선택 → tasks.scheduled_for=내일 으로 insert.
// 내일 morning 진입 시 FlowRouter → MorningScreen 에서 fetchTodaysFirstTask 로 노출됨.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

import { createTomorrowFirstTask } from "../../lib/tasks";

type OptionKey = "water" | "stretch" | "vit" | "custom";
const OPTIONS: { k: OptionKey; icon: string }[] = [
  { k: "water",   icon: "💧" },
  { k: "stretch", icon: "🧘" },
  { k: "vit",     icon: "💊" },
  { k: "custom",  icon: "✏️" },
];

export function NightFirst({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [pick, setPick] = useState<OptionKey>("water");
  const [customText, setCustomText] = useState("");
  const [phase, setPhase] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleReserve() {
    const title =
      pick === "custom" ? customText.trim() : t(`flow.night.first.opt.${pick}`);
    if (!title) return;
    setPhase("saving");
    setErrMsg(null);
    try {
      await createTomorrowFirstTask(userId, title);
      setPhase("done");
    } catch (e) {
      setPhase("error");
      setErrMsg(e instanceof Error ? e.message : String(e));
    }
  }

  const canReserve =
    phase !== "saving" && (pick !== "custom" || customText.trim().length > 0);

  return (
    <View>
      <Text className="text-night-ink italic font-light" style={{ fontSize: 19, lineHeight: 28 }}>
        {t("flow.night.first.lead")}
      </Text>

      {/* 4 옵션 그리드 (2x2) */}
      <View className="mt-5 flex-row flex-wrap" style={{ gap: 10 }}>
        {OPTIONS.map((opt) => {
          const on = pick === opt.k;
          return (
            <Pressable
              key={opt.k}
              onPress={() => setPick(opt.k)}
              className={
                "rounded-card p-5 border " +
                (on
                  ? "bg-night-bg3 border-night-soft"
                  : "bg-night-bg2 border-night-hair")
              }
              style={{ width: "47%" }}
            >
              <Text style={{ fontSize: 28 }}>{opt.icon}</Text>
              <Text className="text-night-ink text-sm mt-2">
                {t(`flow.night.first.opt.${opt.k}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {pick === "custom" && (
        <TextInput
          value={customText}
          onChangeText={setCustomText}
          placeholder={t("flow.night.first.customPlaceholder")}
          placeholderTextColor="#7E7E92"
          style={{
            marginTop: 14,
            height: 44,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#2D2E3A",
            backgroundColor: "#14151C",
            color: "#E8E6E0",
            fontSize: 14,
          }}
        />
      )}

      <Pressable
        onPress={handleReserve}
        disabled={!canReserve}
        className={
          "mt-5 rounded-pill items-center justify-center bg-night-ink " +
          (!canReserve ? "opacity-40" : "")
        }
        style={{ height: 50 }}
      >
        <Text className="text-night-bg text-sm font-medium">
          {phase === "saving" ? t("flow.night.first.saving") :
           phase === "done"   ? t("flow.night.first.doneBtn") :
                                t("flow.night.first.reserve")}
        </Text>
      </Pressable>

      {phase === "done" && (
        <Text className="text-night-soft italic text-xs text-center mt-3">
          {t("flow.night.first.doneHint")}
        </Text>
      )}

      {phase === "error" && (
        <Text className="text-night-muted text-xs mt-3 italic">
          {t("flow.loadError")}: {errMsg}
        </Text>
      )}
    </View>
  );
}
