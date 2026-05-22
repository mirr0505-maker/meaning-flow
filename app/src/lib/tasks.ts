// 🚀 tasks 테이블 helper
// PRD 5.1: tasks 컬럼 id, user_id, title, micro_action, status, scheduled_for
// status: 'pending' / 'done_70' / 'done_full' / 'skipped'

import { supabase } from "./supabase";

export type TaskStatus = "pending" | "done_70" | "done_full" | "skipped";

export type Task = {
  id: string;
  title: string;
  micro_action: string | null;
  status: TaskStatus;
  scheduled_for: string | null;
};

// 오늘 날짜 (YYYY-MM-DD, 로컬 시간 기준)
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 어젯밤 예약된 "첫 단추" — scheduled_for = 오늘, status = pending 중 가장 먼저 생성된 것
export async function fetchTodaysFirstTask(userId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, micro_action, status, scheduled_for")
    .eq("user_id", userId)
    .eq("scheduled_for", todayISO())
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Task | null;
}

export async function createTask(userId: string, title: string, microAction?: string): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title,
      micro_action: microAction ?? null,
      scheduled_for: todayISO(),
    })
    .select("id, title, micro_action, status, scheduled_for")
    .single();
  if (error) throw error;
  return data as Task;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) throw error;
}
