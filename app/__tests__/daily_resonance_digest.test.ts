// 🚀 Phase 3 STEP 3-G-4 — daily_resonance_digest pure helper 단위 테스트
// CLAUDE.md §검증 의무 4: 외부 API 의존 코드는 가짜 데이터 검증을 붙인다.
// Edge Function 본체는 Deno + Expo Push HTTP 의존 → 통합 검증.
// 본 테스트는 pushBodyFor (카피 분기) + yesterdayInTz (timezone 계산) pure 부분만.

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

// Edge Function (Deno) 은 ./_helpers.ts 확장자 명시. node:test (tsx) 는 확장자 없이 import.
import { pushBodyFor, yesterdayInTz } from "../supabase/functions/daily_resonance_digest/_helpers";

describe("pushBodyFor — 언어 분기 + 합계 숫자만 (M3·M1)", () => {
  it("한국어 — N명이 공명했어요", () => {
    const r = pushBodyFor("ko", 5);
    assert.equal(r.title, "공명");
    assert.ok(r.body.includes("5명"), `body 에 합계 숫자 누락: ${r.body}`);
    assert.ok(!r.body.includes("name") && !r.body.includes("닉네임"),
      "M3 위반 가능 — 공명한 사용자 식별 표현");
  });

  it("영어 — 1명일 때 'person', 2명+ 일 때 'people'", () => {
    const one = pushBodyFor("en", 1);
    assert.ok(one.body.includes("1 person"), `1인 단수 누락: ${one.body}`);
    const many = pushBodyFor("en", 3);
    assert.ok(many.body.includes("3 people"), `복수 누락: ${many.body}`);
  });

  it("일본어 — N人が共鳴しました", () => {
    const r = pushBodyFor("ja", 7);
    assert.equal(r.title, "共鳴");
    assert.ok(r.body.includes("7人"), `합계 누락: ${r.body}`);
  });

  it("locale 변형 (ko-KR / en-US / ja-JP) — 같은 카피", () => {
    assert.equal(pushBodyFor("ko-KR", 2).title, "공명");
    assert.equal(pushBodyFor("en-US", 2).title, "Resonance");
    assert.equal(pushBodyFor("ja-JP", 2).title, "共鳴");
  });

  it("fr/de — Phase 5+ → ko fallback (M5: 미검수 카피 출고 금지 대신 일관성)", () => {
    assert.equal(pushBodyFor("fr", 2).title, "공명");
    assert.equal(pushBodyFor("de", 2).title, "공명");
  });
});

describe("yesterdayInTz — 사용자 timezone 기준 어제 (YYYY-MM-DD)", () => {
  it("Asia/Seoul 자정 직후 — 어제 정상 계산", () => {
    // KST 2026-05-22 00:30 = UTC 2026-05-21 15:30
    const now = new Date("2026-05-21T15:30:00Z");
    assert.equal(yesterdayInTz("Asia/Seoul", now), "2026-05-21");
  });

  it("Asia/Seoul 자정 직전 — 같은 날 어제", () => {
    // KST 2026-05-21 23:30 = UTC 2026-05-21 14:30
    const now = new Date("2026-05-21T14:30:00Z");
    assert.equal(yesterdayInTz("Asia/Seoul", now), "2026-05-20");
  });

  it("America/Los_Angeles 06시 (PDT) — 어제 PDT 기준", () => {
    // PDT (UTC-7) 2026-05-22 06:00 = UTC 2026-05-22 13:00
    const now = new Date("2026-05-22T13:00:00Z");
    assert.equal(yesterdayInTz("America/Los_Angeles", now), "2026-05-21");
  });

  it("UTC fallback — timezone 'UTC' 명시", () => {
    const now = new Date("2026-05-22T06:00:00Z");
    assert.equal(yesterdayInTz("UTC", now), "2026-05-21");
  });

  it("월말 경계 (UTC) — 6/1 06시 → 어제 5/31", () => {
    const now = new Date("2026-06-01T06:00:00Z");
    assert.equal(yesterdayInTz("UTC", now), "2026-05-31");
  });

  it("연말 경계 (Asia/Seoul) — 2027-01-01 KST 06시 → 어제 2026-12-31", () => {
    // KST 2027-01-01 06:00 = UTC 2026-12-31 21:00
    const now = new Date("2026-12-31T21:00:00Z");
    assert.equal(yesterdayInTz("Asia/Seoul", now), "2026-12-31");
  });
});
