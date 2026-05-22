// 🚀 thought_vault 테이블 helper — 밤 모드 생각 보관함 (PRD 5.1)
// 컬럼: id, user_id, thought_text, captured_at, source
// source: 'night_vault' (보관함 직접 입력) / 'inspiration_5min' (5분 타이머 결과물)
// M6: RLS 본인만 read/write.
// PRD: 자이가르닉 효과 차단 — 머릿속 미완료 작업을 외부 컨테이너로 옮겨 수면 방해 차단.

import { supabase } from "./supabase";

export type VaultSource = "night_vault" | "inspiration_5min";

export type Thought = {
  id: string;
  thought_text: string;
  captured_at: string;
  source: VaultSource | null;
};

// 최근 N개 (기본 20개) — 보관함 칩 표시용
export async function fetchVault(userId: string, limit = 20): Promise<Thought[]> {
  const { data, error } = await supabase
    .from("thought_vault")
    .select("id, thought_text, captured_at, source")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Thought[];
}

export async function addThought(args: {
  userId: string;
  text: string;
  source: VaultSource;
}): Promise<Thought> {
  const { data, error } = await supabase
    .from("thought_vault")
    .insert({
      user_id: args.userId,
      thought_text: args.text,
      source: args.source,
    })
    .select("id, thought_text, captured_at, source")
    .single();
  if (error) throw error;
  return data as Thought;
}

export async function removeThought(thoughtId: string): Promise<void> {
  const { error } = await supabase
    .from("thought_vault")
    .delete()
    .eq("id", thoughtId);
  if (error) throw error;
}
