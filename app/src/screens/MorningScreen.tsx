// 🚀 🌅 점화 모드 (Morning / Ignition) — PRD 4.1
// Phase 4 UI/UX v2 (2026-05-24): 첫 단추 최대 3개 stack (어젯밤 예약된 1~3개 카드)
// dark prop: night 모드에서 호출 시 다크 톤 카드/글자

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { Profile } from "../lib/profiles";
import { fetchTodaysFirstTasks, updateTaskStatus, type Task } from "../lib/tasks";
import { modeColors } from "../lib/theme";

type Loadable<T> = { state: "loading" } | { state: "ok"; value: T } | { state: "error"; message: string };

export function MorningScreen({ profile, dark = false }: { profile: Profile; dark?: boolean }) {
  const { t } = useTranslation();
  const c = modeColors(dark);
  const [tasks, setTasks] = useState<Loadable<Task[]>>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchTodaysFirstTasks(profile.id)
      .then((v) => !cancelled && setTasks({ state: "ok", value: v }))
      .catch((e) => !cancelled && setTasks({ state: "error", message: e instanceof Error ? e.message : String(e) }));
    return () => { cancelled = true; };
  }, [profile.id]);

  async function handleSkip(id: string) {
    if (tasks.state !== "ok") return;
    const next = tasks.value.map((task) =>
      task.id === id ? { ...task, status: "skipped" as const } : task
    );
    setTasks({ state: "ok", value: next });
    try {
      await updateTaskStatus(id, "skipped");
    } catch (e) {
      setTasks({ state: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  async function handleStart(id: string) {
    if (tasks.state !== "ok") return;
    const next = tasks.value.map((task) =>
      task.id === id ? { ...task, status: "done_full" as const } : task
    );
    setTasks({ state: "ok", value: next });
    try {
      await updateTaskStatus(id, "done_full");
    } catch (e) {
      setTasks({ state: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <View className="px-6 pt-2 pb-6">
      {/* 정체성 카드 — 조합 닉네임 */}
      <View className={`rounded-card border p-5 mb-4 ${c.cardBg} ${c.cardBorder}`}>
        <Text className={`${c.mute} text-sm tracking-widest mb-2`}>
          {profile.solo_mbti} × {profile.social_mbti}
        </Text>
        <Text className={`${c.ink} text-xl font-medium`}>
          {t("flow.morning.identityLead")}
          {profile.display_nickname ?? t(profile.combo_nickname ?? "combos.unknown")}
          {t("flow.morning.identityTail")}
        </Text>
      </View>

      {/* 어젯밤 첫 단추 */}
      <Text className={`${c.mute} text-sm ml-1 mb-2`}>{t("flow.morning.lead")}</Text>
      <Text className={`${c.ink} text-2xl font-medium ml-1 mb-4`}>{t("flow.morning.headline")}</Text>

      {tasks.state === "loading" && (
        <View className={`rounded-card border p-6 items-center ${c.cardBg} ${c.cardBorder}`}>
          <ActivityIndicator color={dark ? "#C9C5DE" : "#5C5A53"} />
        </View>
      )}

      {tasks.state === "error" && (
        <View className="rounded-card bg-evening-soft p-4">
          <Text className="text-ink text-sm font-medium">{t("flow.loadError")}</Text>
          <Text className="text-ink-soft text-xs mt-1">{tasks.message}</Text>
        </View>
      )}

      {tasks.state === "ok" && tasks.value.length === 0 && (
        <View className={`rounded-card border p-5 ${c.cardBg} ${c.cardBorder}`}>
          <Text className={`${c.ink} text-lg font-medium`}>{t("flow.morning.emptyLead")}</Text>
          <Text className={`${c.inkSoft} text-base mt-2 leading-relaxed`}>{t("flow.morning.emptyBody")}</Text>
        </View>
      )}

      {tasks.state === "ok" && tasks.value.map((task) => (
        <View key={task.id} className="mb-3">
          <FirstButtonCard task={task} onStart={handleStart} onSkip={handleSkip} dark={dark} />
        </View>
      ))}
    </View>
  );
}

function FirstButtonCard({ task, onStart, onSkip, dark }: {
  task: Task; onStart: (id: string) => void; onSkip: (id: string) => void; dark: boolean;
}) {
  const { t } = useTranslation();
  const c = modeColors(dark);
  const isDone = task.status === "done_full" || task.status === "done_70";
  const isSkipped = task.status === "skipped";
  const isFinished = isDone || isSkipped;

  return (
    <View className={`rounded-card border p-5 overflow-hidden ${c.cardBg} ${c.cardBorder} ${isFinished ? "opacity-60" : ""}`}>
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-morning" />

      <View className="flex-row items-center mb-5">
        <View className="w-14 h-14 rounded-card bg-morning-soft items-center justify-center mr-3">
          <Text className="text-3xl">💧</Text>
        </View>
        <View className="flex-1">
          <Text className={`${c.mute} text-sm tracking-widest`}>2 MIN</Text>
          <Text className={`${c.ink} text-lg font-medium mt-0.5`}>{task.title}</Text>
          {task.micro_action && (
            <Text className={`${c.inkSoft} text-sm mt-1`}>{task.micro_action}</Text>
          )}
        </View>
      </View>

      {isDone && (
        <View
          className="rounded-pill items-center justify-center bg-morning-soft"
          style={{ height: 52 }}
        >
          <Text className="text-morning text-base font-semibold">✓ {t("flow.morning.done")}</Text>
        </View>
      )}

      {isSkipped && (
        <View
          className={`rounded-pill items-center justify-center ${dark ? "bg-night-bg3" : "bg-hair-soft"}`}
          style={{ height: 52 }}
        >
          <Text className={`${c.mute} text-base font-semibold`}>{t("flow.morning.skipped")}</Text>
        </View>
      )}

      {!isFinished && (
        <>
          <Pressable
            onPress={() => onStart(task.id)}
            className={"rounded-pill items-center justify-center " + (dark ? "bg-night-ink" : "bg-ink")}
            style={{ height: 52 }}
          >
            <Text className={(dark ? "text-night-bg" : "text-paper-warm") + " text-base font-medium"}>{t("flow.morning.start")}</Text>
          </Pressable>
          <Pressable onPress={() => onSkip(task.id)} className="mt-3 items-center">
            <Text className={`${c.mute} text-sm underline`}>{t("flow.morning.skip")}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
