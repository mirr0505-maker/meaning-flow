// 🚀 Phase 4 UI/UX — IN 사용자에게 매일 다른 응원 한 마디
// MBTI 4종(INFP/INFJ/INTP/INTJ) × 14개 = 56 메시지 (2주 사이클).
// MBTI 미선택 사용자는 'unknown' fallback.
//
// 결정적 인덱스: dayOfYear % 14 → 같은 날 같은 MBTI 는 모두 같은 메시지.
// CLAUDE.md M2: 권유형 + 차분한 톤.

import type { MBTI } from "./combos";

const CYCLE = 14;

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const today = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((today - start) / 86400000) + 1;
}

// 사용자의 solo_mbti + 오늘 날짜 → i18n 키
// 예: dailyMessageKey("INFP", new Date()) → "home.daily.infp.5"
export function dailyMessageKey(soloMbti: MBTI | null | undefined, date: Date = new Date()): string {
  const key = soloMbti?.toLowerCase() ?? "unknown";
  const validKeys = new Set(["infp", "infj", "intp", "intj"]);
  const safeKey = validKeys.has(key) ? key : "unknown";
  const idx = dayOfYear(date) % CYCLE;
  return `home.daily.${safeKey}.${idx}`;
}

// 테스트용 — 모든 키 목록 (i18n 무결성 검증)
export const ALL_DAILY_KEYS: string[] = [];
for (const mbti of ["infp", "infj", "intp", "intj", "unknown"]) {
  for (let i = 0; i < CYCLE; i++) {
    ALL_DAILY_KEYS.push(`home.daily.${mbti}.${i}`);
  }
}

export const DAILY_CYCLE = CYCLE;
