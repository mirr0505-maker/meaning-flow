// 🚀 reflections 테이블 helper — 의미 일기 (PRD 5.1)
// 컬럼: id, user_id, date, reflection_text, language, shared_to_resonance
// 하루 1행 UNIQUE(user_id, date) → upsert 로 작성/수정 통일.
// M6: 본인만 read/write (RLS 로 보호). shared_to_resonance 는 토글 상태만 저장.
// 실제 resonance_posts 게시·OpenAI Moderation 호출은 Phase 3 STEP 으로 분리.

import { supabase } from "./supabase";
import { todayISO } from "./utils/dateISO";

export const MAX_REFLECTION_LEN = 200;

// re-export — 기존 import 호환
export { questionKeyForComboKey } from "./utils/comboQuestion";

export type Reflection = {
  id: string;
  date: string;
  reflection_text: string | null;
  language: string;
  shared_to_resonance: boolean;
};

export async function fetchTodayReflection(userId: string): Promise<Reflection | null> {
  const { data, error } = await supabase
    .from("reflections")
    .select("id, date, reflection_text, language, shared_to_resonance")
    .eq("user_id", userId)
    .eq("date", todayISO())
    .maybeSingle();
  if (error) throw error;
  return (data as Reflection | null) ?? null;
}

// 🚀 Phase 4 UI/UX STEP 3 — 의미 일기 아카이브 (본인 시간순)
// 사용자 결정 2026-05-23: 30일 후에도 본인 흐름 다시 볼 수 있게.
// M6: 본인만 read (RLS).  PRD 7.3: 20개+더보기 패턴 (무한 스크롤 X).
export async function fetchMyReflections(args: {
  userId: string;
  cursorDate?: string;          // ISO date — 이전 페이지 마지막 row 의 date (이보다 과거)
  pageSize?: number;             // 기본 20
}): Promise<Reflection[]> {
  let q = supabase
    .from("reflections")
    .select("id, date, reflection_text, language, shared_to_resonance")
    .eq("user_id", args.userId)
    .order("date", { ascending: false })
    .limit(args.pageSize ?? 20);
  if (args.cursorDate) q = q.lt("date", args.cursorDate);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Reflection[];
}

// upsert — user_id + date 유니크 키. 같은 날 재저장 시 같은 row 갱신.
// text 는 호출 전 trim() + 200자 가드 통과 가정 (UI 에서 maxLength=200).
export async function saveTodayReflection(args: {
  userId: string;
  text: string;
  language: string;
  sharedToResonance: boolean;
}): Promise<Reflection> {
  const payload = {
    user_id: args.userId,
    date: todayISO(),
    reflection_text: args.text,
    language: args.language,
    shared_to_resonance: args.sharedToResonance,
  };
  const { data, error } = await supabase
    .from("reflections")
    .upsert(payload, { onConflict: "user_id,date" })
    .select("id, date, reflection_text, language, shared_to_resonance")
    .single();
  if (error) throw error;
  return data as Reflection;
}

