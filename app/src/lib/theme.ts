// 🚀 4시간대 모드별 색 매핑 helper
// dark = mode === "night" 일 때 카드/글자 색을 다크 톤으로 전환.
// 라이트 모드는 paper/ink 톤, 다크 모드는 night-bg2/night-ink 톤.

export function modeColors(dark: boolean) {
  return {
    // 카드
    cardBg:     dark ? "bg-night-bg2"      : "bg-paper",
    cardBorder: dark ? "border-night-hair" : "border-hair-soft",
    // 텍스트 — 강·중·약
    ink:        dark ? "text-night-ink"    : "text-ink",       // 강 — 헤드라인
    inkSoft:    dark ? "text-night-soft"   : "text-ink-soft",  // 중 — 본문
    mute:       dark ? "text-night-muted"  : "text-mute",      // 약 — eyebrow/메타
    // 라인
    line:       dark ? "border-night-hair" : "border-hair",
  };
}
