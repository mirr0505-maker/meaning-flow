// 🚀 Phase 4 UI/UX STEP U-5 — 내일의 첫 단추 누적 통계
// CLAUDE.md M1: 통계 자체는 사용자 노출 OK (압박 X — 단순 "자주 쓴 옵션" 빈도).
//
// 첫 단추 = tasks 중 source = 'night_first' 인 row 만.
// 실행 모드(day_action / NULL legacy) task 는 절대 포함 X — 사용자 결정 2026-05-24.
// 같은 title 사용 횟수 group by → 자주 옵션 추천 + ReviewFirsts 표시.

import { supabase } from "./supabase";

export type FirstOption = {
  title: string;
  count: number;
  last_used: string | null;
};

// 자주 사용된 first button 상위 N개 (NightFirst 에서 등록한 것만)
export async function fetchTopFirsts(userId: string, limit = 5): Promise<FirstOption[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("title, scheduled_for, created_at")
    .eq("user_id", userId)
    .eq("source", "night_first");
  if (error) throw error;

  const map = new Map<string, { count: number; last: string }>();
  for (const row of (data ?? []) as { title: string; scheduled_for: string | null; created_at: string }[]) {
    const key = row.scheduled_for ?? row.created_at;
    const cur = map.get(row.title);
    if (cur) {
      cur.count += 1;
      if (key > cur.last) cur.last = key;
    } else {
      map.set(row.title, { count: 1, last: key });
    }
  }
  return Array.from(map.entries())
    .map(([title, v]) => ({ title, count: v.count, last_used: v.last }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
