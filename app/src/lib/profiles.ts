// 🚀 profiles 테이블 helper
// RLS 정책: id = auth.uid() 인 행만 본인이 read/write (PRD 5.2)

import { supabase } from "./supabase";
import type { MBTI } from "./combos";

export type Profile = {
  id: string;
  solo_mbti: MBTI;
  social_mbti: MBTI;
  combo_nickname: string;        // i18n key (예: "combos.infpIntj") — 표시 시점에 t() 로 번역
  language: string;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, solo_mbti, social_mbti, combo_nickname, language")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(p: Profile): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(p);
  if (error) throw error;
}
