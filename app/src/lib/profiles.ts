// 🚀 profiles 테이블 helper
// RLS 정책: id = auth.uid() 인 행만 본인이 read/write (PRD 5.2)

import { supabase } from "./supabase";
import type { MBTI } from "./combos";
import type { InTraitKey } from "./inTraits";

// Phase 4 UI/UX STEP 1: 사용자 결정 2026-05-23 — 반드시 두 자아 다 알 필요 X, 닉네임 사용자 정의 가능
export type Profile = {
  id: string;
  solo_mbti: MBTI | null;          // NULL = "잘 모르겠어요" 또는 미선택
  social_mbti: MBTI | null;        // NULL = "잘 모르겠어요" 또는 미선택
  combo_nickname: string | null;   // i18n key (예: "combos.infpIntj"). 두 자아 NULL 이면 NULL
  display_nickname: string | null; // 사용자 정의 닉네임. NULL 면 combo_nickname 의 t() 결과 사용
  in_traits: InTraitKey[] | null;  // 자기 선택한 IN 특성 배열
  language: string;
};

const SELECT_COLS = "id, solo_mbti, social_mbti, combo_nickname, display_nickname, in_traits, language";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT_COLS)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(p: Profile): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(p);
  if (error) throw error;
}

// SettingsScreen 의 "내 정체성" 섹션용 — 일부 필드만 갱신
export async function updateProfileIdentity(args: {
  userId: string;
  in_traits?: InTraitKey[] | null;
  solo_mbti?: MBTI | null;
  social_mbti?: MBTI | null;
  combo_nickname?: string | null;
  display_nickname?: string | null;
}): Promise<{ ok: boolean }> {
  const patch: Record<string, unknown> = {};
  if (args.in_traits !== undefined)         patch.in_traits         = args.in_traits;
  if (args.solo_mbti !== undefined)         patch.solo_mbti         = args.solo_mbti;
  if (args.social_mbti !== undefined)       patch.social_mbti       = args.social_mbti;
  if (args.combo_nickname !== undefined)    patch.combo_nickname    = args.combo_nickname;
  if (args.display_nickname !== undefined)  patch.display_nickname  = args.display_nickname;

  const { error } = await supabase.from("profiles").update(patch).eq("id", args.userId);
  return { ok: !error };
}
