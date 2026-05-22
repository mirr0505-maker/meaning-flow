// 🚀 🌅 점화 모드 (Morning / Ignition) — PRD 4.1
// 어젯밤 예약한 첫 단추 카드 + 정체성 (조합 닉네임) + 스킵 옵션
// dark prop: night 모드에서 호출 시 다크 톤 카드/글자

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { Profile } from "../lib/profiles";
import { fetchTodaysFirstTask, updateTaskStatus, type Task } from "../lib/tasks";
import { modeColors } from "../lib/theme";

type Loadable<T> = { state: "loading" } | { state: "ok"; value: T } | { state: "error"; message: string };

export function MorningScreen({ profile, dark = false }: { profile: Profile; dark?: boolean }) {
  const { t } = useTranslation();
  const c = modeColors(dark);
  const [task, setTask] = useState<Loadable<Task | null>>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchTodaysFirstTask(profile.id)
      .then((v) => !cancelled && setTask({ state: "ok", value: v }))
      .catch((e) => !cancelled && setTask({ state: "error", message: e instanceof Error ? e.message : String(e) }));
    return () => { cancelled = true; };
  }, [profile.id]);

  async function handleSkip(id: string) {
    setTask({ state: "loading" });
    try {
      await updateTaskStatus(id, "skipped");
      setTask({ state: "ok", value: null });
    } catch (e) {
      setTask({ state: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  async function handleStart(id: string) {
    try {
      await updateTaskStatus(id, "done_full");
      setTask({ state: "ok", value: null });
    } catch (e) {
      setTask({ state: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <View className="px-6 pt-2 pb-6">
      {/* 정체성 카드 — 조합 닉네임 */}
      <View className={`rounded-card border p-5 mb-4 ${c.cardBg} ${c.cardBorder}`}>
        <Text className={`${c.mute} text-xs tracking-widest mb-2`}>
          {profile.solo_mbti} × {profile.social_mbti}
        </Text>
        <Text className={`${c.ink} text-xl font-medium`}>
          {t("flow.morning.identityLead")}{t(profile.combo_nickname)}{t("flow.morning.identityTail")}
        </Text>
      </View>

      {/* 어젯밤 첫 단추 */}
      <Text className={`${c.mute} text-xs ml-1 mb-1.5`}>{t("flow.morning.lead")}</Text>
      <Text className={`${c.ink} text-2xl font-medium ml-1 mb-4`}>{t("flow.morning.headline")}</Text>

      {task.state === "loading" && (
        <View className={`rounded-card border p-6 items-center ${c.cardBg} ${c.cardBorder}`}>
          <ActivityIndicator color={dark ? "#C9C5DE" : "#5C5A53"} />
        </View>
      )}

      {task.state === "error" && (
        <View className="rounded-card bg-evening-soft p-4">
          <Text className="text-ink text-sm font-medium">{t("flow.loadError")}</Text>
          <Text className="text-ink-soft text-xs mt-1">{task.message}</Text>
        </View>
      )}

      {task.state === "ok" && !task.value && (
        <View className={`rounded-card border p-5 ${c.cardBg} ${c.cardBorder}`}>
          <Text className={`${c.ink} text-base font-medium`}>{t("flow.morning.emptyLead")}</Text>
          <Text className={`${c.inkSoft} text-sm mt-2 leading-relaxed`}>{t("flow.morning.emptyBody")}</Text>
        </View>
      )}

      {task.state === "ok" && task.value && (
        <FirstButtonCard task={task.value} onStart={handleStart} onSkip={handleSkip} dark={dark} />
      )}
    </View>
  );
}

function FirstButtonCard({ task, onStart, onSkip, dark }: {
  task: Task; onStart: (id: string) => void; onSkip: (id: string) => void; dark: boolean;
}) {
  const { t } = useTranslation();
  const c = modeColors(dark);
  return (
    <View className={`rounded-card border p-5 overflow-hidden ${c.cardBg} ${c.cardBorder}`}>
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-morning" />

      <View className="flex-row items-center mb-5">
        <View className="w-12 h-12 rounded-card bg-morning-soft items-center justify-center mr-3">
          <Text className="text-2xl">💧</Text>
        </View>
        <View className="flex-1">
          <Text className={`${c.mute} text-xs tracking-widest`}>2 MIN</Text>
          <Text className={`${c.ink} text-base font-medium mt-0.5`}>{task.title}</Text>
          {task.micro_action && (
            <Text className={`${c.inkSoft} text-xs mt-0.5`}>{task.micro_action}</Text>
          )}
        </View>
      </View>

      <Pressable
        onPress={() => onStart(task.id)}
        className={"rounded-pill items-center justify-center " + (dark ? "bg-night-ink" : "bg-ink")}
        style={{ height: 48 }}
      >
        <Text className={(dark ? "text-night-bg" : "text-paper-warm") + " text-sm font-medium"}>{t("flow.morning.start")}</Text>
      </Pressable>
      <Pressable onPress={() => onSkip(task.id)} className="mt-3 items-center">
        <Text className={`${c.mute} text-xs underline`}>{t("flow.morning.skip")}</Text>
      </Pressable>
    </View>
  );
}
