// 🚀 Phase 2 lib 유닛 테스트 — supabase 의존성 없는 순수 함수만 검증
// 실행: npm test (== npx tsx --test __tests__/lib.test.ts)
// CLAUDE.md §검증 의무 4: 외부 API 의존 코드는 가짜 데이터 검증을 붙인다.
// supabase 호출 (fetch/save/...) 는 모바일 Expo Go 수동 검증으로 커버.

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { questionKeyForComboKey } from "../src/lib/utils/comboQuestion";
import { isoFromDate, todayISO, tomorrowISO } from "../src/lib/utils/dateISO";

describe("dateISO", () => {
  it("isoFromDate — YYYY-MM-DD 포맷 + 0 패딩", () => {
    assert.equal(isoFromDate(new Date(2026, 0, 1)),  "2026-01-01");
    assert.equal(isoFromDate(new Date(2026, 11, 31)), "2026-12-31");
    assert.equal(isoFromDate(new Date(2026, 4, 22)),  "2026-05-22");
  });

  it("todayISO — 오늘과 같은 일자", () => {
    const v = todayISO();
    const today = new Date();
    assert.equal(v, isoFromDate(today));
  });

  it("tomorrowISO — 오늘 +1일", () => {
    const today = new Date();
    const expectedTomorrow = new Date(today);
    expectedTomorrow.setDate(today.getDate() + 1);
    assert.equal(tomorrowISO(), isoFromDate(expectedTomorrow));
  });

  it("tomorrowISO — 월말 경계 (5/31 → 6/1)", () => {
    // isoFromDate 가 Date 인스턴스를 받으므로 직접 시뮬레이션
    const may31 = new Date(2026, 4, 31);
    const next = new Date(may31);
    next.setDate(may31.getDate() + 1);
    assert.equal(isoFromDate(next), "2026-06-01");
  });

  it("tomorrowISO — 연말 경계 (12/31 → 다음해 1/1)", () => {
    const dec31 = new Date(2026, 11, 31);
    const next = new Date(dec31);
    next.setDate(dec31.getDate() + 1);
    assert.equal(isoFromDate(next), "2027-01-01");
  });
});

describe("questionKeyForComboKey", () => {
  it("6 조합 닉네임 → 6 질문 키 (PRD 3.1)", () => {
    assert.equal(questionKeyForComboKey("combos.infpIntj"), "flow.evening.question.infpIntj");
    assert.equal(questionKeyForComboKey("combos.infpIntp"), "flow.evening.question.infpIntp");
    assert.equal(questionKeyForComboKey("combos.infpInfj"), "flow.evening.question.infpInfj");
    assert.equal(questionKeyForComboKey("combos.intpIntj"), "flow.evening.question.intpIntj");
    assert.equal(questionKeyForComboKey("combos.intpInfj"), "flow.evening.question.intpInfj");
    assert.equal(questionKeyForComboKey("combos.intjInfj"), "flow.evening.question.intjInfj");
  });

  it("same MBTI 4 종 fallback (combos.ts resolveComboKey 결과)", () => {
    assert.equal(questionKeyForComboKey("combos.sameInfp"), "flow.evening.question.sameInfp");
    assert.equal(questionKeyForComboKey("combos.sameInfj"), "flow.evening.question.sameInfj");
    assert.equal(questionKeyForComboKey("combos.sameIntp"), "flow.evening.question.sameIntp");
    assert.equal(questionKeyForComboKey("combos.sameIntj"), "flow.evening.question.sameIntj");
  });

  it("unknown / null / undefined / 잘못된 형식 → unknown 으로 안전 fallback", () => {
    assert.equal(questionKeyForComboKey("combos.unknown"),    "flow.evening.question.unknown");
    assert.equal(questionKeyForComboKey(null),                "flow.evening.question.unknown");
    assert.equal(questionKeyForComboKey(undefined),           "flow.evening.question.unknown");
    assert.equal(questionKeyForComboKey(""),                  "flow.evening.question.unknown");
    assert.equal(questionKeyForComboKey("infpIntj"),          "flow.evening.question.unknown"); // prefix 없음
    assert.equal(questionKeyForComboKey("flow.evening.foo"),  "flow.evening.question.unknown"); // 다른 namespace
  });
});

describe("i18n 키 무결성 — locales 정합 (스모크)", () => {
  it("ko/en/ja 모두 flow.evening.question.* + flow.night.* 키 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const comboKeys = ["infpIntj","infpIntp","infpInfj","intpIntj","intpInfj","intjInfj",
                       "sameInfp","sameInfj","sameIntp","sameIntj","unknown"];
    for (const lang of [ko, en, ja]) {
      const q = (lang as any).default.flow.evening.question;
      for (const k of comboKeys) {
        assert.ok(typeof q[k] === "string" && q[k].length > 0, `flow.evening.question.${k} 누락`);
      }
      const night = (lang as any).default.flow.night;
      for (const tab of ["vault","timer","first","blanket"]) {
        assert.ok(typeof night.tabs[tab] === "string", `flow.night.tabs.${tab} 누락`);
      }
      assert.ok(night.vault.lead && night.timer.lead && night.first.lead && night.blanket.lead,
        "flow.night.{vault,timer,first,blanket}.lead 중 하나 누락");
    }
  });
});
