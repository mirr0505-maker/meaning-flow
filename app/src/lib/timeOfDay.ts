// 🚀 현재 시각 → 4시간대 모드 매핑 (PRD 3.2)
//   06–10 morning · 10–18 day · 18–22 evening · 22–02 night

export type Mode = "morning" | "day" | "evening" | "night";

export function modeForHour(hour: number): Mode {
  if (hour >= 6  && hour < 10) return "morning";
  if (hour >= 10 && hour < 18) return "day";
  if (hour >= 18 && hour < 22) return "evening";
  return "night"; // 22–02 (자정 넘어가는 구간 포함)
}

export function currentMode(): Mode {
  return modeForHour(new Date().getHours());
}
