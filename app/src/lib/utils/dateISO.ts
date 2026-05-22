// 🚀 로컬 시간 기준 YYYY-MM-DD 헬퍼
// tasks.scheduled_for · reflections.date 등 DATE 컬럼과 일관된 포맷.
// pure 함수만 — supabase/expo 의존성 없음. node:test 로 단독 검증 가능.

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function isoFromDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return isoFromDate(new Date());
}

export function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoFromDate(d);
}
