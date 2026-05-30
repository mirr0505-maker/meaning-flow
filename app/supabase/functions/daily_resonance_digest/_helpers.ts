// 🚀 Phase 3 STEP 3-G-2 — daily_resonance_digest 의 pure helper
// Deno + Node (tsx) 양쪽에서 import 가능하도록 외부 API 의존 없는 순수 로직만.
// Edge Function (Deno) 과 단위테스트 (node:test) 가 같은 코드를 참조.

// ───────────────────────────────────────────────────────────
// 알림 카피 — ko/en/ja
// M3 합계 숫자만 노출, M1 0 분기는 caller (Edge Function) 측에서 skip.
// M5: fr/de 는 Phase 5+ → 현재는 ko fallback (정원 원문 미번역 노출과 일관).
// ───────────────────────────────────────────────────────────
export function pushBodyFor(lang: string, count: number): { title: string; body: string } {
  const l = lang?.split("-")[0] ?? "ko";
  if (l === "en") {
    return {
      title: "Resonance",
      body: count === 1
        ? "1 person resonated with your line from yesterday."
        : `${count} people resonated with your line from yesterday.`,
    };
  }
  if (l === "ja") {
    return {
      title: "共鳴",
      body: `昨日の一行に${count}人が共鳴しました。`,
    };
  }
  return {
    title: "공명",
    body: `어제 흘려보낸 한 줄에 ${count}명이 공명했어요.`,
  };
}

// ───────────────────────────────────────────────────────────
// 사용자 timezone 기준 어제 날짜 (YYYY-MM-DD)
// ledger 의 sent_date 와 RPC 검색 키로 사용.
// ───────────────────────────────────────────────────────────
export function yesterdayInTz(tz: string, now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const parts = fmt.formatToParts(now);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  const today = new Date(`${y}-${m}-${d}T00:00:00Z`);
  const yest  = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  return yest.toISOString().slice(0, 10);
}
