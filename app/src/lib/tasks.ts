// 🚀 tasks 테이블 helper
// PRD 5.1: tasks 컬럼 id, user_id, title, micro_action, status, scheduled_for, parent_id
// status: 'pending' / 'done_70' / 'done_full' / 'skipped'
// parent_id: NULL = 본 일, 값 = 세부 일 (자식)

import { supabase } from "./supabase";
import { todayISO, tomorrowISO } from "./utils/dateISO";

export type TaskStatus = "pending" | "done_70" | "done_full" | "skipped";

export type Task = {
  id: string;
  title: string;
  micro_action: string | null;
  status: TaskStatus;
  scheduled_for: string | null;
  parent_id: string | null;
};

// 본 일 + 자식 세부 일 묶음 — UI 표시용
export type TaskWithSubs = Task & { subs: Task[] };

const COLS = "id, title, micro_action, status, scheduled_for, parent_id";

// 어젯밤 예약된 "첫 단추" — 본 일 (parent_id null) 중에서 첫 pending
export async function fetchTodaysFirstTask(userId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select(COLS)
    .eq("user_id", userId)
    .is("parent_id", null)
    .eq("scheduled_for", todayISO())
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Task | null;
}

// 🚀 Phase 4 UI/UX (2026-05-24) — 오늘 첫 단추 최대 3개 (source='night_first' 만)
// 점화 모드(morning)에서 stack 으로 표시.
export async function fetchTodaysFirstTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(COLS)
    .eq("user_id", userId)
    .eq("source", "night_first")
    .is("parent_id", null)
    .eq("scheduled_for", todayISO())
    .order("created_at", { ascending: true })
    .limit(3);
  if (error) throw error;
  return (data ?? []) as Task[];
}

// 단일 task INSERT — 본 일 또는 자식
// source: 'night_first' (착륙·NightFirst 예약) | 'day_action' (실행 모드) | undefined (자식 / legacy)
export async function createTask(args: {
  userId: string;
  title: string;
  microAction?: string | null;
  parentId?: string | null;
  scheduledFor?: string;
  source?: "night_first" | "day_action";
}): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: args.userId,
      title: args.title,
      micro_action: args.microAction ?? null,
      parent_id: args.parentId ?? null,
      scheduled_for: args.scheduledFor ?? todayISO(),
      source: args.source ?? null,
    })
    .select(COLS)
    .single();
  if (error) throw error;
  return data as Task;
}

// 🚀 Phase 4 UI/UX (2026-05-24) — 본 일 + 세부 일 최대 3개 한 번에 INSERT
// 실행 모드에서만 호출 → source='day_action' 박음
export async function createTaskWithSubs(args: {
  userId: string;
  title: string;
  subs: string[];          // 비어있지 않은 세부 일 텍스트 (0~3개)
}): Promise<TaskWithSubs> {
  const parent = await createTask({ userId: args.userId, title: args.title, source: "day_action" });
  const subs: Task[] = [];
  for (const subText of args.subs.slice(0, 3)) {
    const text = subText.trim();
    if (!text) continue;
    const sub = await createTask({ userId: args.userId, title: text, parentId: parent.id });
    subs.push(sub);
  }
  return { ...parent, subs };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) throw error;
}

// 🚀 Phase 4 UI/UX — 과거 완료된 본 일 (회고용). 자식 세부 일은 별도 fetch.
export async function fetchPastDoneTasks(userId: string, limit = 50): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(COLS)
    .eq("user_id", userId)
    .is("parent_id", null)
    .in("status", ["done_70", "done_full"])
    .lt("scheduled_for", todayISO())
    .order("scheduled_for", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Task[];
}

// 🚀 Phase 4 UI/UX — 오늘의 모든 task (본 일 + 자식 묶음)
// 본 일은 created_at 순. 각 본 일 아래에 자식 세부 일을 inline 표시용으로 묶음.
export async function fetchTodaysTasksWithSubs(userId: string): Promise<TaskWithSubs[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(COLS)
    .eq("user_id", userId)
    .eq("scheduled_for", todayISO())
    .order("created_at", { ascending: true });
  if (error) throw error;
  const all = (data ?? []) as Task[];
  const parents = all.filter((t) => t.parent_id === null);
  const childrenByParent = new Map<string, Task[]>();
  for (const t of all) {
    if (t.parent_id) {
      const arr = childrenByParent.get(t.parent_id) ?? [];
      arr.push(t);
      childrenByParent.set(t.parent_id, arr);
    }
  }
  return parents.map((p) => ({ ...p, subs: childrenByParent.get(p.id) ?? [] }));
}

// NightFirst — 내일의 첫 단추 예약 (본 일). source='night_first' 박음.
export async function createTomorrowFirstTask(userId: string, title: string): Promise<Task> {
  return createTask({ userId, title, scheduledFor: tomorrowISO(), source: "night_first" });
}

// 🚀 Phase 4 UI/UX (2026-05-24, v2) — 첫 단추 최대 3개. 결정 사항:
//   - 중복 title = 거절 (reason: 'duplicate')
//   - 이미 3개 = 거절 (reason: 'full')
//   - 그 외 INSERT.
// UI 에서 reason 받아 부드러운 안내 카피 출력.
export const FIRST_BUTTON_MAX = 3;
export type AddFirstResult =
  | { ok: true; task: Task }
  | { ok: false; reason: "duplicate" | "full" };

export async function addTomorrowFirstTask(userId: string, title: string): Promise<AddFirstResult> {
  const text = title.trim();
  if (!text) return { ok: false, reason: "duplicate" };

  const existing = await fetchTomorrowsFirstTasks(userId);
  if (existing.length >= FIRST_BUTTON_MAX) return { ok: false, reason: "full" };
  if (existing.some((t) => t.title === text)) return { ok: false, reason: "duplicate" };

  const task = await createTomorrowFirstTask(userId, text);
  return { ok: true, task };
}

// 내일 예약된 첫 단추 (최대 3개, pending).
export async function fetchTomorrowsFirstTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(COLS)
    .eq("user_id", userId)
    .eq("source", "night_first")
    .eq("scheduled_for", tomorrowISO())
    .eq("status", "pending")
    .is("parent_id", null)
    .order("created_at", { ascending: true })
    .limit(FIRST_BUTTON_MAX);
  if (error) throw error;
  return (data ?? []) as Task[];
}

// 예약 취소 (X 버튼) — pending night_first 만 안전하게 DELETE.
export async function cancelFirstTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("source", "night_first")
    .eq("status", "pending");
  if (error) throw error;
}
