// 🚀 Phase 4 STEP 4-B — Sentry 오류 추적 wrapper
// CLAUDE.md M6: 일기 본문은 절대 보내지 않음. 메타데이터(에러 stack, breadcrumbs)만.
// CLAUDE.md M3 능동적 진입: consent.sentry 가 true 일 때만 init.
//
// DSN 누락 시 silent no-op (개발 환경에서 .env 비어있어도 앱 정상 동작).
// init 은 App.tsx boot() 의 main phase 진입 직전 1회만 호출.

import { readConsent } from "./consent";

const DSN  = process.env.EXPO_PUBLIC_SENTRY_DSN;

let initialized = false;
let SentryRef: typeof import("@sentry/react-native") | null = null;

export async function initSentryIfConsented(): Promise<void> {
  if (initialized) return;
  if (__DEV__)     return;          // 로컬 개발 환경에서는 Sentry 할당량 소모 방지
  if (!DSN)        return;          // 키 없으면 no-op (DEV 친화)

  const consent = await readConsent();
  if (!consent.sentry) return;      // 사용자가 거부 — 데이터 수집 안 함 (M3)

  try {
    const Sentry = await import("@sentry/react-native");
    Sentry.init({
      dsn: DSN,
      // 일기 본문은 sendDefaultPii=false 로 PII 자동 제거. error stack 만 전송.
      sendDefaultPii: false,
      enableAutoSessionTracking: true,
      // tracesSampleRate 는 베타 단계 0.1 (10%) 권장 — Phase 5+ 안정화 후 조정
      tracesSampleRate: 0.1,
    });
    SentryRef = Sentry;
    initialized = true;
  } catch {
    // import 실패 — 패키지 미설치 케이스. silent.
  }
}

// 핵심 호출 위치에서 사용. init 안 됐으면 silent no-op.
export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!SentryRef) return;
  try {
    SentryRef.captureException(err, context ? { extra: context } : undefined);
  } catch {}
}
