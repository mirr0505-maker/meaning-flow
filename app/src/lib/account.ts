// 🚀 Phase 4 STEP 4-H — 계정 삭제 client helper
// PRD 5.2 / Apple 5.1.1(v) / GDPR 17조
//
// Edge Function `account_delete` 호출 + 로컬 sign-out.
// cascade FK 가 모든 본인 데이터 (reflections·thought_vault·tasks·resonance_posts·... ) 자동 삭제.
// 다음 부팅 시 getCurrentSession() 가 null → LoginScreen 노출 → 사용자 SNS 재가입.

import { track } from "./posthog";
import { supabase } from "./supabase";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; reason: "auth" | "server" | "network" | "unknown"; messageKey: string };

// 🚀 Phase 4 UI/UX (2026-05-24) — 로그아웃 (SNS 연동 사용자용)
// 데이터는 보존 — 다음 SNS 재로그인 시 같은 user 로 복원 (Manual Linking).
// 익명 user 는 로그아웃하면 데이터 복구 불가 → UI 에서 메뉴 자체를 숨김.
export type LogoutResult = { ok: true } | { ok: false; messageKey: string };

export async function logoutAccount(): Promise<LogoutResult> {
  try {
    track("account_logout");
    await supabase.auth.signOut();
    return { ok: true };
  } catch {
    return { ok: false, messageKey: "settings.account.logoutError.network" };
  }
}

export async function deleteAccount(): Promise<DeleteAccountResult> {
  try {
    const { data, error } = await supabase.functions.invoke<{
      ok: boolean;
      error?: string;
    }>("account_delete", { body: {} });

    if (error)        return { ok: false, reason: "network", messageKey: "settings.account.deleteError.network" };
    if (!data?.ok) {
      const r = data?.error;
      if (r === "auth_required" || r === "auth_invalid") {
        return { ok: false, reason: "auth", messageKey: "settings.account.deleteError.auth" };
      }
      return { ok: false, reason: "server", messageKey: "settings.account.deleteError.server" };
    }

    // 서버 측 user row 삭제 성공 → 로컬 세션도 정리
    track("account_deleted");   // signOut 전에 — track 이 user 의존 가능 (M6: user_id 만)
    await supabase.auth.signOut();
    return { ok: true };
  } catch {
    return { ok: false, reason: "network", messageKey: "settings.account.deleteError.network" };
  }
}
