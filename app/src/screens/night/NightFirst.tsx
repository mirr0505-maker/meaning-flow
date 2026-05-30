// 🚀 🌙 NightFirst — 내일의 첫 단추 (Phase 4 UI/UX STEP U-5, v2)
// 사용자 결정 2026-05-24:
//   - 첫 단추는 최대 3개. 같은 title 중복 X. 3개 가득이면 입력/옵션 disabled.
//   - 입력란 (직접 적어보기) 위, 누적 박스 아래.
//   - 박스 상단 = 예약된 1~3개 row (X 로 개별 취소) + "내일 아침에 만나요" 인라인.
//   - 박스 그 밑 = 나머지 누적 옵션 (선택 안 된 것만, ×N 빈도).
// CLAUDE.md M1: 사용 횟수 부드럽게 노출, 압박 카피 X.

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { fetchTopFirsts, type FirstOption } from "../../lib/firsts";
import {
  FIRST_BUTTON_MAX,
  addTomorrowFirstTask,
  cancelFirstTask,
  fetchTomorrowsFirstTasks,
  type Task,
} from "../../lib/tasks";

const DEFAULT_OPTS: { key: "water" | "stretch" | "vit" }[] = [
  { key: "water"   },
  { key: "stretch" },
  { key: "vit"     },
];

export function NightFirst({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [topOpts, setTopOpts] = useState<FirstOption[] | null>(null);
  const [currents, setCurrents] = useState<Task[]>([]);
  const [customText, setCustomText] = useState("");
  const [phase, setPhase] = useState<"idle" | "saving" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);   // 부드러운 안내 (중복/가득)

  const reload = useCallback(() => {
    Promise.all([
      fetchTopFirsts(userId, 8).catch(() => [] as FirstOption[]),
      fetchTomorrowsFirstTasks(userId).catch(() => [] as Task[]),
    ]).then(([opts, curs]) => {
      setTopOpts(opts);
      setCurrents(curs);
    });
  }, [userId]);

  useEffect(() => { reload(); }, [reload]);

  const isFull = currents.length >= FIRST_BUTTON_MAX;

  async function reserve(title: string) {
    if (!title.trim() || phase === "saving") return;
    setPhase("saving");
    setErrMsg(null);
    setNotice(null);
    try {
      const result = await addTomorrowFirstTask(userId, title.trim());
      if (!result.ok) {
        setNotice(t(result.reason === "duplicate"
          ? "flow.night.first.noticeDuplicate"
          : "flow.night.first.noticeFull"));
      } else {
        setCustomText("");
      }
      setPhase("idle");
      reload();
    } catch (e) {
      setPhase("error");
      setErrMsg(e instanceof Error ? e.message : String(e));
    }
  }

  async function cancel(taskId: string) {
    setPhase("saving");
    setNotice(null);
    try {
      await cancelFirstTask(taskId);
      setPhase("idle");
      reload();
    } catch (e) {
      setPhase("error");
      setErrMsg(e instanceof Error ? e.message : String(e));
    }
  }

  const totalUsed = (topOpts ?? []).reduce((sum, o) => sum + o.count, 0);
  const reservedTitles = new Set(currents.map((c) => c.title));
  const restOpts = (topOpts ?? []).filter((o) => !reservedTitles.has(o.title));
  const showDefaults = topOpts !== null && topOpts.length === 0 && currents.length === 0;

  const inputDisabled = isFull || phase === "saving";

  return (
    <View>
      {/* 안내 카피 */}
      <Text className="text-night-ink italic font-light" style={{ fontSize: 19, lineHeight: 28 }}>
        {t("flow.night.first.lead")}
      </Text>

      {/* ① 직접 적어보기 */}
      <View className="mt-5 rounded-card border border-night-hair bg-night-bg2 p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-night-muted text-xs">{t("flow.night.first.customLabel")}</Text>
          <Text className="text-night-muted text-xs">
            {t("flow.night.first.slotCount", { current: currents.length, max: FIRST_BUTTON_MAX })}
          </Text>
        </View>
        <TextInput
          value={customText}
          onChangeText={setCustomText}
          placeholder={isFull ? t("flow.night.first.fullPlaceholder") : t("flow.night.first.customPlaceholder")}
          placeholderTextColor="#7E7E92"
          editable={!isFull}
          onSubmitEditing={() => reserve(customText)}
          returnKeyType="done"
          style={{
            height: 48, paddingHorizontal: 12, borderRadius: 10,
            borderWidth: 1, borderColor: "#2D2E3A",
            backgroundColor: isFull ? "#0E0F14" : "#14151C",
            color: "#E8E6E0", fontSize: 16,
            opacity: isFull ? 0.5 : 1,
          }}
        />
        <Pressable
          onPress={() => reserve(customText)}
          disabled={!customText.trim() || inputDisabled}
          className={"mt-3 rounded-pill items-center justify-center bg-night-ink " + ((!customText.trim() || inputDisabled) ? "opacity-40" : "")}
          style={{ height: 48 }}
        >
          <Text className="text-night-bg text-base font-medium">
            {phase === "saving" ? t("flow.night.first.saving") : t("flow.night.first.reserve")}
          </Text>
        </Pressable>
      </View>

      {notice && (
        <Text className="text-night-soft italic text-sm text-center mt-3">{notice}</Text>
      )}
      {phase === "error" && (
        <Text className="text-night-muted text-sm mt-3 italic">
          {t("flow.loadError")}: {errMsg}
        </Text>
      )}

      {/* ② 섹션 헤더 */}
      <View className="mt-7 mb-3 flex-row items-end justify-between">
        <Text className="text-night-muted text-sm tracking-widest">
          {t("flow.night.first.pastSection")}
        </Text>
        {topOpts !== null && totalUsed > 0 && (
          <Text className="text-night-muted text-sm">
            {t("flow.night.first.totalUsed", { count: totalUsed })}
          </Text>
        )}
      </View>

      {topOpts === null && (
        <View className="items-center py-6"><ActivityIndicator color="#C9C5DE" /></View>
      )}

      {/* ③ 오늘 예약된 1~3개 (강조) */}
      {currents.map((task) => (
        <View
          key={task.id}
          className="rounded-card border bg-night-soft p-4 mb-2"
          style={{ borderColor: "#A89BD0" }}
        >
          <View className="flex-row items-center">
            <Text style={{ color: "#A89BD0", fontSize: 18, marginRight: 10 }}>✓</Text>
            <Text className="text-night-ink text-base font-medium flex-1">{task.title}</Text>
            <Pressable
              onPress={() => cancel(task.id)}
              disabled={phase === "saving"}
              hitSlop={10}
              style={{ paddingHorizontal: 6, paddingVertical: 2 }}
            >
              <Text className="text-night-muted text-lg">×</Text>
            </Pressable>
          </View>
          <Text className="text-night-soft italic text-sm mt-2 ml-7">
            {t("flow.night.first.doneHint")}
          </Text>
        </View>
      ))}

      {/* ④ 나머지 누적 옵션 */}
      {restOpts.map((opt) => (
        <Pressable
          key={opt.title}
          onPress={() => reserve(opt.title)}
          disabled={inputDisabled}
          className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-2 flex-row items-center"
          style={{ opacity: inputDisabled ? 0.4 : 1 }}
        >
          <Text className="text-night-ink text-base flex-1">{opt.title}</Text>
          <Text className="text-night-muted text-sm ml-2">×{opt.count}</Text>
        </Pressable>
      ))}

      {/* ⑤ 첫 사용자 fallback */}
      {showDefaults && (
        <>
          <Text className="text-night-muted text-sm mb-3">
            {t("flow.night.first.emptyHint")}
          </Text>
          {DEFAULT_OPTS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => reserve(t(`flow.night.first.opt.${opt.key}`))}
              disabled={inputDisabled}
              className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-2 flex-row items-center"
              style={{ opacity: inputDisabled ? 0.4 : 1 }}
            >
              <Text className="text-night-ink text-base flex-1">
                {t(`flow.night.first.opt.${opt.key}`)}
              </Text>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}
