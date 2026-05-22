// 🚀 조합 닉네임 i18n key → 저녁 의미 일기 질문 i18n key 매핑
// profile.combo_nickname 에 저장된 키("combos.infpIntj")를 받아 "flow.evening.question.infpIntj" 로 변환.
// pure 함수 — supabase/i18n 의존성 없음.

export function questionKeyForComboKey(comboKey: string | null | undefined): string {
  if (!comboKey) return "flow.evening.question.unknown";
  const m = /^combos\.(\w+)$/.exec(comboKey);
  if (!m) return "flow.evening.question.unknown";
  return `flow.evening.question.${m[1]}`;
}
