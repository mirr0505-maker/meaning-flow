// 🚀 인증 helper
// Phase 4 UI/UX v3 (2026-05-29): 익명 가입 제거. SNS 회원가입 강제 흐름.
//   - getCurrentSession() — 세션 확인 (LoginScreen 분기용)
//   - rememberFirstProvider / readFirstProvider — 폰 단위로 첫 가입 SNS 기록 (boot 시 다른 SNS 감지)
//
// CLAUDE.md M6: 모든 사용자 'authenticated' role + RLS 정책 통과.

import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "./supabase";

const FIRST_PROVIDER_KEY = "mf_first_provider";

export type SessionResult = { userId: string } | { error: string };

// 세션 있으면 userId, 없으면 null.
// stale refresh token / 삭제된 user 자동 정리 — boot 흐름 크래시 방지.
export async function getCurrentSession(): Promise<{ userId: string } | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      if (error) await supabase.auth.signOut().catch(() => {});
      return null;
    }
    // session 은 storage 에 있지만 실제 user 가 존재하는지 네트워크 검증.
    // user 가 삭제됐으면 401 → stale 토큰 정리하고 LoginScreen 으로.
    const { error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      await supabase.auth.signOut().catch(() => {});
      return null;
    }
    return { userId: session.user.id };
  } catch {
    await supabase.auth.signOut().catch(() => {});
    return null;
  }
}

// 🚀 첫 가입 SNS 기록 — 폰 단위. boot 시 다른 SNS 로 들어왔는지 감지하는 용.
//   - 첫 SNS 로그인 성공 시 저장
//   - signOut / 회원탈퇴 시 유지 (다음 재로그인이 같은 SNS 인지 비교용)
//   - 사용자가 명시적으로 "새로 시작" 선택 시 갱신
export async function rememberFirstProvider(provider: "google" | "apple"): Promise<void> {
  const existing = await readFirstProvider();
  if (existing) return;   // 이미 있으면 덮어쓰지 않음 (첫 가입 기록)
  await AsyncStorage.setItem(FIRST_PROVIDER_KEY, provider);
}

export async function readFirstProvider(): Promise<"google" | "apple" | null> {
  const v = await AsyncStorage.getItem(FIRST_PROVIDER_KEY);
  return v === "google" || v === "apple" ? v : null;
}

export async function setFirstProvider(provider: "google" | "apple"): Promise<void> {
  await AsyncStorage.setItem(FIRST_PROVIDER_KEY, provider);
}

export async function clearFirstProvider(): Promise<void> {
  await AsyncStorage.removeItem(FIRST_PROVIDER_KEY);
}
