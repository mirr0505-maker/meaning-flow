// 🚀 Phase 4 STEP 4-L — MVP 베타 30일 access 만료 검사
// 사용자 결정 2026-05-23: 개인별 가입 시점부터 30일. 데이터 보존. 정식 출시 시 SQL 한 줄로 연장.
//
// 정책:
//   - mvp_access_expires_at IS NULL → access 무제한 (관리자 또는 정식 출시 후 전체 NULL 처리)
//   - mvp_access_expires_at > NOW() → access OK
//   - mvp_access_expires_at <= NOW() → expired → LockedScreen 로 라우팅
//
// 만료 후에도 데이터는 그대로. 사용자는 LockedScreen 에서 "내 데이터 내보내기" 가능.

import { supabase } from "./supabase";

export type AccessStatus =
  | { kind: "active";  expiresAt: Date | null }    // expiresAt=null 이면 무제한
  | { kind: "expired"; expiredAt: Date };

export async function checkMvpAccess(userId: string): Promise<AccessStatus> {
  const { data, error } = await supabase
    .from("profiles")
    .select("mvp_access_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    // 조회 실패 시 보수적으로 active 처리 (앱 사용 차단보다 정상 동작 우선)
    return { kind: "active", expiresAt: null };
  }

  const raw = (data as { mvp_access_expires_at: string | null }).mvp_access_expires_at;
  if (!raw) return { kind: "active", expiresAt: null };

  const expiresAt = new Date(raw);
  if (expiresAt > new Date()) {
    return { kind: "active", expiresAt };
  }
  return { kind: "expired", expiredAt: expiresAt };
}
