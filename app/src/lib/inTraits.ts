// 🚀 Phase 4 UI/UX STEP 1 — IN 특성 자기 발견 데이터
// 사용자 결정 2026-05-23: 외부 MBTI 테스트 대신 앱 안에서 "내가 IN 인가?" 자기 발견 흐름.
// PRD UserGuide + 사용자 명시 특성 통합.
//
// 키는 영구 안정 (DB 의 in_traits TEXT[] 에 저장). 카피는 i18n.

export type InTraitKey =
  | "idea_flood"          // 뇌 부스터 / 아이디어 폭주
  | "perfectionism_block" // 완벽 추구 → 시작 차단
  | "depth_first"         // 깊이 우선
  | "solo_charge"         // 혼자 시간 충전
  | "meaning_fuel"        // 의미가 연료
  | "pattern_sight"       // 직관·패턴 포착
  | "simulation_block"    // 시뮬레이션 → 행동 차단
  | "low_meaning_block";  // 의미 없는 일 차단

export type InTrait = {
  key: InTraitKey;
  emoji: string;
};

// 8개 IN 특성. 순서는 사용자가 가장 공감하기 쉬운 순서로 (뇌 부스터 → 완벽주의 → 깊이 ...)
export const IN_TRAITS: InTrait[] = [
  { key: "idea_flood",          emoji: "🧠" },
  { key: "perfectionism_block", emoji: "🌀" },
  { key: "depth_first",         emoji: "🔍" },
  { key: "solo_charge",         emoji: "🪟" },
  { key: "meaning_fuel",        emoji: "🎯" },
  { key: "pattern_sight",       emoji: "🌌" },
  { key: "simulation_block",    emoji: "💭" },
  { key: "low_meaning_block",   emoji: "📚" },
];

// i18n 키 헬퍼 — onboarding.inTraits.{key} 패턴
export function labelKey(k: InTraitKey): string {
  return `onboarding.inTraits.${k}`;
}

// 모든 키 (smoke 테스트 + SettingsScreen 표시용)
export const ALL_IN_TRAIT_KEYS: InTraitKey[] = IN_TRAITS.map((t) => t.key);
