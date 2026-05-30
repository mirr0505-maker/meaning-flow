// 🚀 ☀️ 실행 모드 (Day / Action) — Phase 4 UI/UX (2026-05-24)
// 사용자 결정: 본 일 + 세부 일 최대 3개 (각각 체크 가능, 완료 시 취소선)
// 모달 3 입력란 = 기존 옵션 카피 미리 채워짐, 사용자가 자기 일에 맞게 직접 수정 가능 (비우면 스킵).
//
// 데이터: tasks 테이블, parent_id NULL = 본 일 / 값 = 세부 일.

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from "react-native";

import type { Profile } from "../lib/profiles";
import {
  createTaskWithSubs,
  fetchTodaysTasksWithSubs,
  updateTaskStatus,
  type Task,
  type TaskStatus,
  type TaskWithSubs,
} from "../lib/tasks";
import { modeColors } from "../lib/theme";

type MicroPrompt =
  | { kind: "hidden" }
  | { kind: "open"; draftTitle: string; sub1: string; sub2: string; sub3: string };

export function DayScreen({ profile, dark = false }: { profile: Profile; dark?: boolean }) {
  const { t } = useTranslation();
  const c = modeColors(dark);
  const [tasks, setTasks] = useState<TaskWithSubs[] | null>(null);
  const [input, setInput] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [micro, setMicro] = useState<MicroPrompt>({ kind: "hidden" });

  const reload = useCallback(() => {
    fetchTodaysTasksWithSubs(profile.id)
      .then((rows: TaskWithSubs[]) => setTasks(rows))
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, [profile.id]);

  useEffect(() => { reload(); }, [reload]);

  function handleAdd() {
    if (!input.trim()) return;
    // 세부 입력란은 빈 값으로 시작 — placeholder 만 회색으로 표시. 사용자가 누르면 바로 입력.
    setMicro({
      kind: "open",
      draftTitle: input.trim(),
      sub1: "",
      sub2: "",
      sub3: "",
    });
  }

  async function commitTask(title: string, subs: string[]) {
    try {
      await createTaskWithSubs({ userId: profile.id, title, subs });
      setInput("");
      setMicro({ kind: "hidden" });
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleDone(taskId: string, status: TaskStatus) {
    if (busyId) return;
    setBusyId(taskId);
    try {
      await updateTaskStatus(taskId, status);
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  if (tasks === null && !err) {
    return (
      <View className="px-6 pt-2 pb-6">
        <View className={`rounded-card border p-6 items-center mt-2 ${c.cardBg} ${c.cardBorder}`}>
          <ActivityIndicator color={dark ? "#C9C5DE" : "#5C5A53"} />
        </View>
      </View>
    );
  }

  const pending = (tasks ?? []).filter((t) => t.status === "pending");
  const done    = (tasks ?? []).filter((t) => t.status === "done_70" || t.status === "done_full");

  return (
    <View className="px-6 pt-2 pb-6">
      <Text className={`${c.mute} text-sm ml-1 mb-2`}>{t("flow.day.lead")}</Text>

      {err && (
        <View className="rounded-card bg-evening-soft p-4 mt-2 mb-3">
          <Text className="text-ink text-sm font-medium">{t("flow.loadError")}</Text>
          <Text className="text-ink-soft text-xs mt-1">{err}</Text>
        </View>
      )}

      {/* 입력란 */}
      <View className={`rounded-card border p-4 mt-2 ${c.cardBg} ${c.cardBorder}`}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t("flow.day.addPlaceholder")}
          placeholderTextColor={dark ? "#7E7E92" : "#9A9486"}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          style={{ fontSize: 17, minHeight: 44, paddingHorizontal: 4, paddingVertical: 8, color: dark ? "#E8E6E0" : "#1A1A1F" }}
        />
        <Pressable
          disabled={!input.trim()}
          onPress={handleAdd}
          className={"mt-3 rounded-pill items-center justify-center " + (dark ? "bg-night-ink" : "bg-ink") + (!input.trim() ? " opacity-30" : "")}
          style={{ height: 48 }}
        >
          <Text className={(dark ? "text-night-bg" : "text-paper-warm") + " text-base font-medium"}>
            {t("flow.day.add")}
          </Text>
        </Pressable>
      </View>

      {pending.length > 0 && (
        <View className="mt-5">
          <Text className={`${c.mute} text-sm tracking-widest ml-1 mb-2`}>
            {t("flow.day.focusSection")}
          </Text>
          {pending.map((task, idx) => (
            <TodoRow
              key={task.id}
              task={task}
              isFocus={idx === 0}
              busyId={busyId}
              onDone={handleDone}
              dark={dark}
            />
          ))}
        </View>
      )}

      {done.length > 0 && (
        <View className="mt-6">
          <Text className={`${c.mute} text-sm tracking-widest ml-1 mb-2`}>
            {t("flow.day.doneSection")}
          </Text>
          {done.map((task) => (
            <TodoRow
              key={task.id}
              task={task}
              isFocus={false}
              busyId={busyId}
              onDone={handleDone}
              dark={dark}
              archived
            />
          ))}
        </View>
      )}

      {pending.length === 0 && done.length === 0 && !err && (
        <Text className={`${c.mute} text-sm text-center mt-6 italic leading-relaxed`}>
          {t("flow.day.emptyHint")}
        </Text>
      )}

      <MicroModal
        state={micro}
        onChangeSub={(idx, v) => {
          if (micro.kind !== "open") return;
          if (idx === 1) setMicro({ ...micro, sub1: v });
          if (idx === 2) setMicro({ ...micro, sub2: v });
          if (idx === 3) setMicro({ ...micro, sub3: v });
        }}
        onConfirm={() => {
          if (micro.kind !== "open") return;
          commitTask(micro.draftTitle, [micro.sub1, micro.sub2, micro.sub3]);
        }}
        onSkip={() => {
          if (micro.kind !== "open") return;
          commitTask(micro.draftTitle, []);
        }}
        onClose={() => setMicro({ kind: "hidden" })}
      />
    </View>
  );
}

// 🚀 2분 마이크로 모달 — 3 입력란 (미리 채움, 사용자 수정·삭제 가능)
function MicroModal({
  state, onChangeSub, onConfirm, onSkip, onClose,
}: {
  state: MicroPrompt;
  onChangeSub: (idx: 1 | 2 | 3, v: string) => void;
  onConfirm: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const visible = state.kind === "open";
  const draftTitle = state.kind === "open" ? state.draftTitle : "";
  const sub1 = state.kind === "open" ? state.sub1 : "";
  const sub2 = state.kind === "open" ? state.sub2 : "";
  const sub3 = state.kind === "open" ? state.sub3 : "";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-card bg-paper border border-hair p-5 mx-4"
          style={{ width: "100%", maxWidth: 380 }}
        >
          <Text className="text-ink text-lg font-medium leading-snug">{t("flow.day.microTitle")}</Text>
          <Text className="text-ink-soft text-sm mt-2 leading-relaxed">{t("flow.day.microBody")}</Text>
          <Text className="text-mute text-sm mt-3 mb-2">{draftTitle}</Text>

          <Text className="text-mute text-sm mt-2 mb-1.5">{t("flow.day.subLabel")}</Text>
          <SubInput value={sub1} onChange={(v) => onChangeSub(1, v)} placeholder={t("flow.day.subPlaceholder1")} />
          <SubInput value={sub2} onChange={(v) => onChangeSub(2, v)} placeholder={t("flow.day.subPlaceholder2")} />
          <SubInput value={sub3} onChange={(v) => onChangeSub(3, v)} placeholder={t("flow.day.subPlaceholder3")} />
          <Text className="text-mute text-xs mt-1 leading-relaxed">{t("flow.day.subHint")}</Text>

          <Pressable
            onPress={onConfirm}
            className="mt-5 rounded-pill items-center justify-center bg-ink"
            style={{ height: 48 }}
          >
            <Text className="text-paper-warm text-base font-medium">{t("flow.day.subConfirm")}</Text>
          </Pressable>
          <Pressable onPress={onSkip} className="mt-3 items-center">
            <Text className="text-mute text-sm underline">{t("flow.day.subSkip")}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SubInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#9A9486"
      maxLength={100}
      className="rounded-card border border-hair bg-paper-warm px-3 mb-2"
      style={{ height: 48, fontSize: 15, color: "#1A1A1F" }}
    />
  );
}

// 🚀 본 일 카드 — 본 일 체크 + 세부 일 inline (각 체크 + 취소선)
function TodoRow({ task, isFocus, busyId, onDone, dark, archived = false }: {
  task: TaskWithSubs;
  isFocus: boolean;
  busyId: string | null;
  onDone: (id: string, status: TaskStatus) => void;
  dark: boolean;
  archived?: boolean;
}) {
  const { t } = useTranslation();
  const c = modeColors(dark);
  const parentBusy = busyId === task.id;
  const isFull = task.status === "done_full";

  return (
    <View
      className={
        "rounded-card border p-3.5 mb-2 " +
        (isFocus && !archived
          ? "border-leaf bg-day-soft"
          : `${c.cardBg} ${c.cardBorder}`)
      }
    >
      {/* 본 일 행 */}
      <View className="flex-row items-center">
        <ParentCheckbox
          status={task.status}
          busy={parentBusy}
          onDone={(status) => onDone(task.id, status)}
        />
        <View className="flex-1 ml-3">
          {isFocus && !archived && (
            <Text className="text-leaf text-xs tracking-widest mb-1">
              {t("flow.day.focusBadge")}
            </Text>
          )}
          <Text
            className={(archived ? c.inkSoft : (isFocus ? "text-ink" : c.ink)) + " text-base leading-relaxed"}
            style={archived ? { textDecorationLine: "line-through" } : undefined}
          >
            {task.title}
          </Text>
        </View>
        {!archived && (
          <Pressable
            onPress={() => onDone(task.id, "done_full")}
            disabled={parentBusy}
            className="ml-2 p-2"
            style={{ opacity: parentBusy ? 0.4 : 1 }}
          >
            <Text className={`${c.mute} text-sm`}>✓✓</Text>
          </Pressable>
        )}
        {archived && isFull && <Text className={`${c.mute} text-sm ml-2`}>✓✓</Text>}
      </View>

      {/* 세부 일 inline — 본 일 아래 들여쓰기 */}
      {task.subs.length > 0 && (
        <View className="mt-2.5 ml-9">
          {task.subs.map((sub: Task) => {
            const subBusy = busyId === sub.id;
            const subDone = sub.status === "done_70" || sub.status === "done_full";
            return (
              <View key={sub.id} className="flex-row items-center py-1.5">
                <Pressable
                  onPress={() => onDone(sub.id, subDone ? "pending" : "done_70")}
                  disabled={subBusy}
                  className="mr-2.5 items-center justify-center"
                  style={{
                    width: 22, height: 22,
                    borderRadius: 11,
                    borderWidth: 1.5,
                    borderColor: subDone ? "#7AA86D" : (dark ? "#3D4050" : "#CFCAB8"),
                    backgroundColor: subDone ? "#7AA86D" : "transparent",
                    opacity: subBusy ? 0.4 : 1,
                  }}
                >
                  {subDone && <Text style={{ color: "#FFF", fontSize: 12, lineHeight: 14 }}>✓</Text>}
                </Pressable>
                <Text
                  className={(subDone ? c.inkSoft : c.ink) + " text-sm flex-1 leading-relaxed"}
                  style={subDone ? { textDecorationLine: "line-through" } : undefined}
                >
                  ↳ {sub.title}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function ParentCheckbox({ status, busy, onDone }: {
  status: TaskStatus;
  busy: boolean;
  onDone: (status: TaskStatus) => void;
}) {
  const isDone = status === "done_70" || status === "done_full";
  // 완료 상태 다시 누르면 pending 으로 되돌림 (잘못 체크한 경우)
  return (
    <Pressable
      onPress={() => onDone(isDone ? "pending" : "done_70")}
      disabled={busy}
      className="items-center justify-center"
      style={{
        width: 32, height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#7AA86D",
        backgroundColor: isDone ? "#7AA86D" : "transparent",
        opacity: busy ? 0.4 : 1,
      }}
    >
      {busy && <ActivityIndicator color="#5C5A53" size="small" />}
      {!busy && isDone && <Text style={{ color: "#FFF", fontSize: 16 }}>✓</Text>}
    </Pressable>
  );
}
