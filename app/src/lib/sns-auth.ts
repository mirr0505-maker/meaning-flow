// 🚀 Phase 4 STEP 4-A1 — SNS OAuth (Google + Apple) + anonymous → SNS link 마이그레이션
// 사용자 결정 2026-05-23: 이메일 회원가입/로그인 배제. SNS 만. Kakao(한국)·LINE(일본) 정식 출시 후.
//
// 흐름 (anonymous user 가 SNS link):
//   1. supabase.auth.linkIdentity({ provider, options: { redirectTo, skipBrowserRedirect: true } })
//   2. WebBrowser.openAuthSessionAsync(data.url, redirectTo)
//   3. result.url 의 fragment 에서 access_token/refresh_token 추출
//   4. supabase.auth.setSession({ access_token, refresh_token })
//      → 같은 user.id 유지, identities 에 provider 추가, 모든 데이터 보존
//
// Apple 주의:
//   - MVP Android 단계엔 코드만 셋업. 정식 iOS 출시 시점에 Apple Developer Service ID + Supabase Apple Provider 등록 필요
//   - Apple 가이드라인 4.8 (다른 SNS 가 있으면 Sign in with Apple 동시 제공)는 iOS 출시 시점에 적용
//   - MVP 단순화 위해 Google 과 동일한 OAuth 패턴 사용 (native AppleAuthentication 미사용)

import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { track } from "./posthog";
import { supabase } from "./supabase";

// Web 환경에서 OAuth 콜백 완료 처리 (RN 에선 no-op)
WebBrowser.maybeCompleteAuthSession();

// 동적 redirect — Expo Go (exp://) 와 정식 빌드 (meaningflow://) 둘 다 자동 대응
// Linking.createURL("auth-callback") 결과:
//   - Expo Go    → "exp://192.168.x.x:8081/--/auth-callback"
//   - 정식 빌드  → "meaningflow://auth-callback"
const REDIRECT_TO = Linking.createURL("auth-callback");

export type SnsProvider = "google" | "apple";  // Phase 5+ kakao(한국)/line(일본) 추가 시 union 확장

export type LinkResult =
  | { ok: true }
  | {
      ok: false;
      reason: "cancelled" | "auth" | "network" | "unknown";
      messageKey: string;
    };

// URL fragment 에서 OAuth token 추출. URL polyfill 의 edge case 피하려 단순 string 처리.
function parseAuthCallback(url: string): {
  access_token?: string;
  refresh_token?: string;
} {
  const fragment = url.split("#")[1] ?? "";
  const params: Record<string, string> = {};
  for (const pair of fragment.split("&")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    params[decodeURIComponent(pair.slice(0, eq))] = decodeURIComponent(pair.slice(eq + 1));
  }
  return { access_token: params.access_token, refresh_token: params.refresh_token };
}

// 🚀 첫 진입 로그인 — 세션이 없는 상태에서 SNS 로 새 세션 생성.
// 같은 provider account 로 이전에 로그인한 적 있으면 자동으로 그 user 로 복원 (Supabase 가 처리).
// LoginScreen 의 Google/Apple 버튼에서 호출.
export async function signInWithProvider(
  provider: SnsProvider,
): Promise<LinkResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: REDIRECT_TO, skipBrowserRedirect: true },
    });
    if (error || !data?.url) {
      return { ok: false, reason: "auth", messageKey: "settings.account.link.error.auth" };
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_TO);
    if (result.type !== "success" || !result.url) {
      return { ok: false, reason: "cancelled", messageKey: "settings.account.link.error.cancelled" };
    }

    const { access_token, refresh_token } = parseAuthCallback(result.url);
    if (!access_token || !refresh_token) {
      return { ok: false, reason: "unknown", messageKey: "settings.account.link.error.unknown" };
    }

    const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
    if (setErr) {
      return { ok: false, reason: "unknown", messageKey: "settings.account.link.error.unknown" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "network", messageKey: "settings.account.link.error.network" };
  }
}

export async function linkProviderToCurrentUser(
  provider: SnsProvider,
): Promise<LinkResult> {
  try {
    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: REDIRECT_TO, skipBrowserRedirect: true },
    });
    if (error || !data?.url) {
      return { ok: false, reason: "auth", messageKey: "settings.account.link.error.auth" };
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_TO);
    if (result.type !== "success" || !result.url) {
      return { ok: false, reason: "cancelled", messageKey: "settings.account.link.error.cancelled" };
    }

    const { access_token, refresh_token } = parseAuthCallback(result.url);
    if (!access_token || !refresh_token) {
      return { ok: false, reason: "unknown", messageKey: "settings.account.link.error.unknown" };
    }

    const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
    if (setErr) {
      return { ok: false, reason: "unknown", messageKey: "settings.account.link.error.unknown" };
    }
    track("account_linked", { provider });
    return { ok: true };
  } catch {
    return { ok: false, reason: "network", messageKey: "settings.account.link.error.network" };
  }
}

// 현재 user 에 연결된 SNS provider 목록 — SettingsScreen 표시용
export async function getLinkedProviders(): Promise<SnsProvider[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return ((user.identities ?? []) as { provider: string }[])
    .map((i) => i.provider)
    .filter((p): p is SnsProvider => p === "google" || p === "apple");
}

// 🚀 SNS 연결 정보 (provider + display name + email) — IdentityEditScreen 참고용
// 우리 앱 안에선 어디서도 안 씀. SNS 측에서 자동 제공된 메타데이터만 표시.
export type LinkedIdentity = {
  provider: SnsProvider;
  displayName: string | null;
  email: string | null;
};

export async function getLinkedIdentities(): Promise<LinkedIdentity[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  type RawIdentity = {
    provider: string;
    identity_data?: { full_name?: string; name?: string; email?: string };
  };
  return ((user.identities ?? []) as RawIdentity[])
    .filter((i) => i.provider === "google" || i.provider === "apple")
    .map((i) => ({
      provider:    i.provider as SnsProvider,
      displayName: i.identity_data?.full_name ?? i.identity_data?.name ?? null,
      email:       i.identity_data?.email ?? null,
    }));
}
