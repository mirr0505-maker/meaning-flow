// 🚀 Phase 4 STEP 4-J — 데이터 처리 동의 (GDPR / APPI / 한국 PIPA)
// 첫 부팅 시 1회 노출. 동의 후 AsyncStorage 에 기록.
// Sentry/PostHog 는 선택 — 거부해도 앱 정상 동작. 실제 초기화 분기는 4-B/4-C 에서.
//
// 키 디자인:
//   consent_v1.seen        — '1' 이면 동의 화면을 본 적 있음 (재노출 안 함)
//   consent_v1.sentry      — '1' | '0'
//   consent_v1.posthog     — '1' | '0'
//
// 정책 변경 시 키 prefix 를 v2 로 올려 모든 사용자에게 재동의 받음.

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_SEEN    = "consent_v1.seen";
const KEY_SENTRY  = "consent_v1.sentry";
const KEY_POSTHOG = "consent_v1.posthog";

export type ConsentState = {
  seen: boolean;
  sentry: boolean;
  posthog: boolean;
};

export async function readConsent(): Promise<ConsentState> {
  const [seen, sentry, posthog] = await Promise.all([
    AsyncStorage.getItem(KEY_SEEN),
    AsyncStorage.getItem(KEY_SENTRY),
    AsyncStorage.getItem(KEY_POSTHOG),
  ]);
  return {
    seen:    seen === "1",
    sentry:  sentry === "1",
    posthog: posthog === "1",
  };
}

export async function saveConsent(args: { sentry: boolean; posthog: boolean }): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEY_SEEN,    "1"),
    AsyncStorage.setItem(KEY_SENTRY,  args.sentry  ? "1" : "0"),
    AsyncStorage.setItem(KEY_POSTHOG, args.posthog ? "1" : "0"),
  ]);
}
