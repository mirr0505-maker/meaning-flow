// 🚀 두 자아 조합 매트릭스 (PRD UserGuide '당신의 조합' 6종)
// combo_nickname 컬럼에는 i18n key 를 저장한다. 표시 시점에 t() 로 다국어 변환.
// (이렇게 하면 사용자 언어 변경 시 닉네임도 자동 변환)

export type MBTI = "INFP" | "INFJ" | "INTP" | "INTJ";

export type Combo = {
  solo: MBTI;
  social: MBTI;
  nicknameKey: string;          // 예: "combos.infpIntj"
};

// PRD UserGuide 표 — 6개 조합 (순서 무관, solo×social == social×solo)
export const COMBOS: Combo[] = [
  { solo: "INFP", social: "INTJ", nicknameKey: "combos.infpIntj" },
  { solo: "INFP", social: "INTP", nicknameKey: "combos.infpIntp" },
  { solo: "INFP", social: "INFJ", nicknameKey: "combos.infpInfj" },
  { solo: "INTP", social: "INTJ", nicknameKey: "combos.intpIntj" },
  { solo: "INTP", social: "INFJ", nicknameKey: "combos.intpInfj" },
  { solo: "INTJ", social: "INFJ", nicknameKey: "combos.intjInfj" },
];

// 같은 MBTI 두 번 골랐을 때 폴백 닉네임 (PRD UserGuide: "같아도 괜찮습니다")
const SAME_FALLBACK_KEY: Record<MBTI, string> = {
  INFP: "combos.sameInfp",
  INFJ: "combos.sameInfj",
  INTP: "combos.sameIntp",
  INTJ: "combos.sameIntj",
};

export function resolveComboKey(solo: MBTI, social: MBTI): string {
  if (solo === social) return SAME_FALLBACK_KEY[solo];
  const match = COMBOS.find(
    (c) =>
      (c.solo === solo && c.social === social) ||
      (c.solo === social && c.social === solo)
  );
  // 6 조합 + 4 same fallback 으로 모든 16경우 커버되므로 match 는 항상 존재해야 한다
  return match?.nicknameKey ?? "combos.unknown";
}
