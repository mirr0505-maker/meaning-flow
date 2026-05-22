// 🚀 ☀️ 실행 모드 (Day / Action) — PRD 4.2
// 단 하나의 할 일 + 2분 마이크로 변환기 + 70% / 100% 완료 버튼
// 70% 버튼이 시각적으로 더 눈에 띄게 (CLAUDE.md M1 — 완벽주의 회로 차단)
// dark prop: night 모드에서 호출 시 다크 톤 카드/글자

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import type { Profile } from "../lib/profiles";
import { createTask, fetchTodaysFirstTask, updateTaskStatus, type Task } from "../lib/tasks";
import { modeColors } from "../lib/theme";

type Stage =
  | { kind: "loading" }
  | { kind: "empty" }                              // task 없음 → 입력 폼
  | { kind: "suggesting"; draftTitle: string }     // 2분 마이크로 변환 안내
  | { kind: "active"; task: Task }                 // 진행 중인 task
  | { kind: "done"; status: "done_70" | "done_full" }
  | { kind: "error"; message: string };

export function DayScreen({ profile, dark = false }: { profile: Profile; dark?: boolean }) {
  const { t } = useTranslation();
  const c = modeColors(dark);
  const [stage, setStage] = useState<Stage>({ kind: "loading" });
  const [input, setInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchTodaysFirstTask(profile.id)
      .then((v) => {
        if (cancelled) return;
        if (v) setStage({ kind: "active", task: v });
        else   setStage({ kind: "empty" });
      })
      .catch((e) => !cancelled && setStage({ kind: "error", message: e instanceof Error ? e.message : String(e) }));
    return () => { cancelled = true; };
  }, [profile.id]);

  function handleSubmitDraft() {
    if (!input.trim()) return;
    setStage({ kind: "suggesting", draftTitle: input.trim() });
  }

  async function commitTask(title: string, micro: string | null) {
    setStage({ kind: "loading" });
    try {
      const task = await createTask(profile.id, title, micro ?? undefined);
      setInput("");
      setStage({ kind: "active", task });
    } catch (e) {
      setStage({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  async function complete(taskId: string, status: "done_70" | "done_full") {
    setStage({ kind: "loading" });
    try {
      await updateTaskStatus(taskId, status);
      setStage({ kind: "done", status });
    } catch (e) {
      setStage({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <View className="px-6 pt-2 pb-6">
      <Text className={`${c.mute} text-xs ml-1 mb-1.5`}>{t("flow.day.lead")}</Text>

      {stage.kind === "loading" && (
        <View className={`rounded-card border p-6 items-center mt-2 ${c.cardBg} ${c.cardBorder}`}>
          <ActivityIndicator color={dark ? "#C9C5DE" : "#5C5A53"} />
        </View>
      )}

      {stage.kind === "error" && (
        <View className="rounded-card bg-evening-soft p-4 mt-2">
          <Text className="text-ink text-sm font-medium">{t("flow.loadError")}</Text>
          <Text className="text-ink-soft text-xs mt-1">{stage.message}</Text>
        </View>
      )}

      {stage.kind === "empty" && (
        <View className={`rounded-card border p-5 mt-2 ${c.cardBg} ${c.cardBorder}`}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t("flow.day.addPlaceholder")}
            placeholderTextColor={dark ? "#7E7E92" : "#9A9486"}
            className={c.ink}
            style={{ fontSize: 15, minHeight: 48, paddingHorizontal: 4, paddingVertical: 8, color: dark ? "#E8E6E0" : "#1A1A1F" }}
          />
          <Pressable
            disabled={!input.trim()}
            onPress={handleSubmitDraft}
            className={"mt-4 rounded-pill items-center justify-center " + (dark ? "bg-night-ink" : "bg-ink") + (!input.trim() ? " opacity-30" : "")}
            style={{ height: 48 }}
          >
            <Text className={(dark ? "text-night-bg" : "text-paper-warm") + " text-sm font-medium"}>{t("flow.day.add")}</Text>
          </Pressable>
        </View>
      )}

      {stage.kind === "suggesting" && (
        <MicroSuggest
          draftTitle={stage.draftTitle}
          dark={dark}
          onUse={(micro) => commitTask(stage.draftTitle, micro)}
          onSkip={() => commitTask(stage.draftTitle, null)}
        />
      )}

      {stage.kind === "active" && (
        <ActiveTaskCard task={stage.task} dark={dark} onDone={complete} />
      )}

      {stage.kind === "done" && (
        <View className="rounded-card bg-day-soft p-5 mt-2">
          <Text className="text-ink text-base font-medium">{t("flow.day.doneCelebrate")}</Text>
          {stage.status === "done_70" && (
            <Text className="text-ink-soft text-xs mt-2">{t("flow.day.done70Hint")}</Text>
          )}
          <Pressable
            onPress={() => setStage({ kind: "empty" })}
            className="mt-5 rounded-pill items-center justify-center border border-hair bg-paper"
            style={{ height: 44 }}
          >
            <Text className="text-ink-soft text-sm">{t("flow.day.addAnother")}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function MicroSuggest({ draftTitle, dark, onUse, onSkip }: {
  draftTitle: string; dark: boolean; onUse: (micro: string) => void; onSkip: () => void;
}) {
  const { t } = useTranslation();
  const c = modeColors(dark);
  const options = [t("flow.day.microOpt1"), t("flow.day.microOpt2"), t("flow.day.microOpt3")];

  return (
    <View className="rounded-card bg-day-soft p-5 mt-2">
      {/* day-soft 가 라이트하므로 텍스트는 항상 어두운 톤 유지 */}
      <Text className="text-ink text-base font-medium leading-snug">{t("flow.day.microTitle")}</Text>
      <Text className="text-ink-soft text-xs mt-2 leading-relaxed">{t("flow.day.microBody")}</Text>

      <View className="mt-4">
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onUse(opt)}
            className={`rounded-card border p-3 mb-2 ${c.cardBg} ${c.cardBorder}`}
          >
            <Text className={`${c.mute} text-xs tracking-widest mb-0.5`}>{draftTitle}</Text>
            <Text className={`${c.ink} text-sm font-medium`}>↳ {opt}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onSkip} className="mt-3 items-center">
        <Text className="text-mute text-xs underline">{t("flow.day.microSkip")}</Text>
      </Pressable>
    </View>
  );
}

function ActiveTaskCard({ task, dark, onDone }: {
  task: Task; dark: boolean; onDone: (id: string, status: "done_70" | "done_full") => void;
}) {
  const { t } = useTranslation();
  const c = modeColors(dark);
  return (
    <View className={`rounded-card border p-5 mt-2 overflow-hidden ${c.cardBg} ${c.cardBorder}`}>
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-day" />
      <Text className={`${c.ink} text-xl font-medium`}>{task.title}</Text>
      {task.micro_action && (
        <Text className={`${c.inkSoft} text-sm mt-2`}>↳ {task.micro_action}</Text>
      )}

      {/* 70% 가 더 눈에 띄게 — CLAUDE.md M1 완벽주의 회로 차단 */}
      <Pressable
        onPress={() => onDone(task.id, "done_70")}
        className="mt-6 rounded-pill items-center justify-center bg-leaf"
        style={{ height: 52 }}
      >
        <Text className="text-paper-warm text-base font-medium">{t("flow.day.done70")}</Text>
      </Pressable>
      <Text className={`${c.mute} text-xs text-center mt-2`}>{t("flow.day.done70Hint")}</Text>

      <Pressable
        onPress={() => onDone(task.id, "done_full")}
        className={`mt-4 rounded-pill items-center justify-center border ${c.cardBorder} ${c.cardBg}`}
        style={{ height: 44 }}
      >
        <Text className={`${c.inkSoft} text-sm`}>{t("flow.day.done100")}</Text>
      </Pressable>
    </View>
  );
}
