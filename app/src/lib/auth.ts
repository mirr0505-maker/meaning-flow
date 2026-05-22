// 🚀 익명 sign-in helper
// 세션이 없으면 supabase.auth.signInAnonymously() 로 auth.users 익명 행 생성.
// CLAUDE.md M6: 익명 사용자도 'authenticated' role 을 받아 RLS 정책 통과.

import { supabase } from "./supabase";

export type SessionResult =
  | { userId: string }
  | { error: string };

export async function ensureSession(): Promise<SessionResult> {
  const { data: { session }, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) return { error: sessErr.message };
  if (session?.user) return { userId: session.user.id };

  // 익명 sign-in. Dashboard 의 Anonymous Sign-in 토글이 OFF 면 여기서 에러.
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) return { error: error.message };
  if (!data.user) return { error: "익명 sign-in 응답에 user 가 없음" };
  return { userId: data.user.id };
}
