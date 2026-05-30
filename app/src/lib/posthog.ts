// 🚀 Phase 4 STEP 4-C — PostHog 사용 분석 wrapper
// CLAUDE.md M1: **사용자에게 절대 노출 X** — 개발자 분석용. "오늘 X개 작성!" 같은 카피로 다시 사용자에게 보내지 않음.
// CLAUDE.md M6: 일기 본문·생각 본문 등 사용자 텍스트는 절대 보내지 않음. 이벤트 종류 + 메타데이터(언어·timezone·MBTI 조합 등)만.
// CLAUDE.md M3: consent.posthog 가 true 일 때만 init.

import { readConsent } from "./consent";

const KEY  = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let initialized = false;
// posthog-react-native 가 설치되면 실제 타입이 들어와 우리 union 과 충돌 — any 로 우회 (호출부는 try/catch 로 안전)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let posthogClient: any = null;

export async function initPosthogIfConsented(): Promise<void> {
  if (initialized) return;
  if (!KEY)        return;          // 키 없으면 no-op (DEV 친화)

  const consent = await readConsent();
  if (!consent.posthog) return;     // 사용자 거부 → 데이터 수집 안 함 (M3)

  try {
    // posthog-react-native 는 의도적으로 미설치 — Hermes 호환 이슈로 제거.
    // 키가 있고 패키지가 나중에 설치되면 자동 활성. 미설치 시 catch 로 silent.
    // @ts-expect-error 패키지 미설치 (의도) — TS 모듈 해석 우회
    const mod = await import("posthog-react-native");
    const PostHog = mod.default;
    posthogClient = new PostHog(KEY, { host: HOST });
    initialized = true;
  } catch {
    // 패키지 미설치 — silent
  }
}

// 분석 이벤트 — 본문 절대 X, 메타데이터만
export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (!posthogClient) return;
  try {
    posthogClient.capture(event, props);
  } catch {}
}

// user_id 식별 (Supabase user.id) — 디바이스 cross-시점 묶기용. M6 정합: user.id 는 익명 UUID, 개인정보 아님.
export function identify(userId: string): void {
  if (!posthogClient?.identify) return;
  try {
    posthogClient.identify(userId);
  } catch {}
}

// 사전 정의된 이벤트만 추적 — 타입 안전 + 본문 누출 방지
export type AnalyticsEvent =
  | "app_started"
  | "onboarding_completed"
  | "reflection_saved"        // props: { shared_to_resonance, language, char_count }
  | "garden_published"         // props: { language }
  | "garden_resonated"         // props: { post_language }
  | "garden_translated"        // props: { source_language, target_language, provider }
  | "moderation_blocked"
  | "self_harm_modal_shown"    // M4 흐름 빈도 확인 — 일기 본문 X
  | "account_linked"           // props: { provider }
  | "account_deleted"
  | "account_logout"
  | "data_exported";
