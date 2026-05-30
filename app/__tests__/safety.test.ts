// 🚀 Phase 3 STEP 3-F — 자해 키워드 감지 단위 테스트
// CLAUDE.md §검증 의무: 키워드 사전은 사용자 정서 안전 핵심이라 매치/비매치 둘 다 검증.

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { containsSelfHarm } from "../src/lib/safety/selfHarmKeywords";

describe("containsSelfHarm — 매치 케이스 (한국어)", () => {
  it("핵심 자해 의도 표현 — 한국어", () => {
    assert.equal(containsSelfHarm("정말 죽고싶다", "ko"), true);
    assert.equal(containsSelfHarm("죽고 싶다 오늘은", "ko"), true);
    assert.equal(containsSelfHarm("자해하고 싶은 마음이", "ko"), true);
    assert.equal(containsSelfHarm("자살에 대해 생각이 멈추지 않아", "ko"), true);
    assert.equal(containsSelfHarm("그냥 사라지고 싶다", "ko"), true);
  });
});

describe("containsSelfHarm — 매치 케이스 (영어)", () => {
  it("핵심 자해 의도 표현 — 영어", () => {
    assert.equal(containsSelfHarm("I want to kill myself sometimes", "en"), true);
    assert.equal(containsSelfHarm("end my life", "en"), true);
    assert.equal(containsSelfHarm("Thinking about suicide a lot", "en"), true);
    assert.equal(containsSelfHarm("Self-harm thoughts again", "en"), true);
    assert.equal(containsSelfHarm("I just want to die", "en"), true);
  });

  it("대소문자 무관 매치", () => {
    assert.equal(containsSelfHarm("I WANT TO DIE", "en"), true);
    assert.equal(containsSelfHarm("Suicide", "en"), true);
  });
});

describe("containsSelfHarm — 매치 케이스 (일본어)", () => {
  it("핵심 자해 의도 표현 — 일본어", () => {
    assert.equal(containsSelfHarm("死にたい気持ちが消えない", "ja"), true);
    assert.equal(containsSelfHarm("自殺について考えている", "ja"), true);
    assert.equal(containsSelfHarm("自傷したくなる", "ja"), true);
    assert.equal(containsSelfHarm("もう消えたい", "ja"), true);
  });
});

describe("containsSelfHarm — 비매치 (오탐 방지)", () => {
  it("빈 문자열·공백", () => {
    assert.equal(containsSelfHarm("", "ko"), false);
    assert.equal(containsSelfHarm("   ", "ko"), false);
  });

  it("일반 회고·관용 표현 (오탐 차단)", () => {
    // "끝내고 싶다" 는 일반적으로 일·프로젝트 종료 의미 — 사전에서 제외
    assert.equal(containsSelfHarm("이번 프로젝트 빨리 끝내고 싶다", "ko"), false);
    // "죽음" 단독은 회고·철학적 텍스트에서 자주 등장 — 제외
    assert.equal(containsSelfHarm("이번 주는 죽음에 대해 생각이 많았다", "ko"), false);
    // "die laughing" 같은 관용 표현은 "want to die" 와 결합이 아니어서 비매치
    assert.equal(containsSelfHarm("That joke made me die laughing", "en"), false);
    // "die" 단독은 비매치
    assert.equal(containsSelfHarm("All things die eventually", "en"), false);
  });

  it("한자 단독 — 일본어 \"死\"  만으로는 매치 안 함", () => {
    assert.equal(containsSelfHarm("生と死について考える", "ja"), false);
  });
});

describe("containsSelfHarm — 언어 자동 감지 (lang 미지정/잘못)", () => {
  it("lang 가 'fr' 여도 한글이 있으면 한국어 사전 적용", () => {
    assert.equal(containsSelfHarm("죽고싶다", "fr"), true);
  });

  it("lang 가 'ko' 여도 본문이 영어면 영어 사전 적용 (fallback)", () => {
    assert.equal(containsSelfHarm("I want to die", "ko"), true);
  });
});

describe("i18n — safety.writeTime.* 키 무결성 (3-F-4)", () => {
  it("ko/en/ja 모두 safety.writeTime.{title,intro,closeOnly} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    for (const lang of [ko, en, ja]) {
      const s = (lang as any).default.safety?.writeTime;
      assert.ok(s, "safety.writeTime namespace 누락");
      assert.ok(typeof s.title     === "string" && s.title.length     > 0, "safety.writeTime.title 누락");
      assert.ok(typeof s.intro     === "string" && s.intro.length     > 0, "safety.writeTime.intro 누락");
      assert.ok(typeof s.closeOnly === "string" && s.closeOnly.length > 0, "safety.writeTime.closeOnly 누락");
    }
  });
});

describe("i18n — consent.* 키 무결성 (4-J 첫 부팅 동의)", () => {
  it("ko/en/ja 모두 consent.{title,intro,supabase.*,sentry.*,posthog.*,continue,...} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const top = ["eyebrow", "title", "intro", "required", "privacyLink", "continue", "changeLater"];
    const sections = ["supabase", "sentry", "posthog"];
    for (const lang of [ko, en, ja]) {
      const c = (lang as any).default.consent;
      assert.ok(c, "consent namespace 누락");
      for (const k of top) {
        assert.ok(typeof c[k] === "string" && c[k].length > 0, `consent.${k} 누락`);
      }
      for (const s of sections) {
        assert.ok(typeof c[s]?.label === "string" && c[s].label.length > 0, `consent.${s}.label 누락`);
        assert.ok(typeof c[s]?.desc  === "string" && c[s].desc.length  > 0, `consent.${s}.desc 누락`);
      }
    }
  });
});

describe("i18n — settings.account.link.* 키 무결성 (4-A1 SNS OAuth — Google + Apple)", () => {
  it("ko/en/ja 모두 settings.account.link.{section,desc,google.*,apple.*,errorTitle,error.*} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const errKeys = ["cancelled", "auth", "network", "unknown"];
    for (const lang of [ko, en, ja]) {
      const l = (lang as any).default.settings.account.link;
      assert.ok(l, "settings.account.link namespace 누락");
      assert.ok(typeof l.section === "string"     && l.section.length     > 0, "section 누락");
      assert.ok(typeof l.desc    === "string"     && l.desc.length        > 0, "desc 누락");
      for (const provider of ["google", "apple"]) {
        assert.ok(typeof l[provider]?.btn    === "string" && l[provider].btn.length    > 0, `${provider}.btn 누락`);
        assert.ok(typeof l[provider]?.linked === "string" && l[provider].linked.length > 0, `${provider}.linked 누락`);
      }
      assert.ok(typeof l.errorTitle === "string"  && l.errorTitle.length  > 0, "errorTitle 누락");
      for (const k of errKeys) {
        assert.ok(typeof l.error?.[k] === "string" && l.error[k].length > 0,
          `settings.account.link.error.${k} 누락`);
      }
    }
  });
});

describe("i18n — about.* + diary.* + flow.day.* (UI/UX STEP 2~4)", () => {
  it("ko/en/ja 모두 about.{menuLabel,whyTitle,promise1Title,inTraitsSection,closing} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const required = ["menuLabel", "menuDesc", "menuAction", "title",
                      "whySection", "whyTitle", "whyBody",
                      "promiseSection", "promise1Title", "promise1Body",
                      "promise2Title", "promise2Body",
                      "inTraitsSection", "inTraitsIntro",
                      "dualSelfSection", "dualSelfBody", "closing"];
    for (const lang of [ko, en, ja]) {
      const a = (lang as any).default.about;
      assert.ok(a, "about namespace 누락");
      for (const k of required) {
        assert.ok(typeof a[k] === "string" && a[k].length > 0, `about.${k} 누락`);
      }
    }
  });

  it("ko/en/ja 모두 diary.{eyebrow,title,intro,empty,more,...} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const required = ["eyebrow", "title", "intro", "empty", "loadError",
                      "more", "loadingMore", "endOfList", "sharedBadge"];
    for (const lang of [ko, en, ja]) {
      const d = (lang as any).default.diary;
      assert.ok(d, "diary namespace 누락");
      for (const k of required) {
        assert.ok(typeof d[k] === "string" && d[k].length > 0, `diary.${k} 누락`);
      }
    }
  });

  it("ko/en/ja 모두 flow.day.{focusSection,focusBadge,doneSection,emptyHint} + flow.evening.tabs.archive 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const dayKeys = ["focusSection", "focusBadge", "doneSection", "emptyHint"];
    for (const lang of [ko, en, ja]) {
      const day = (lang as any).default.flow.day;
      for (const k of dayKeys) {
        assert.ok(typeof day[k] === "string" && day[k].length > 0, `flow.day.${k} 누락`);
      }
      const archive = (lang as any).default.flow.evening.tabs.archive;
      assert.ok(typeof archive === "string" && archive.length > 0, "flow.evening.tabs.archive 누락");
    }
  });

  it("ko/en/ja 모두 onboarding.intro.helps 존재 (IN 특성 직후 안내)", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    for (const lang of [ko, en, ja]) {
      const helps = (lang as any).default.onboarding.intro.helps;
      assert.ok(typeof helps === "string" && helps.length > 0, "onboarding.intro.helps 누락");
    }
  });
});

describe("i18n — onboarding.inTraits.* + identity.* 키 무결성 (UI/UX STEP 1)", () => {
  it("ko/en/ja 모두 onboarding.inTraits.{eyebrow,title,subtitle,hint,ready,8 keys} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const meta = ["eyebrow", "title", "subtitle", "hint", "ready"];
    const traits = ["idea_flood","perfectionism_block","depth_first","solo_charge",
                    "meaning_fuel","pattern_sight","simulation_block","low_meaning_block"];
    for (const lang of [ko, en, ja]) {
      const o = (lang as any).default.onboarding.inTraits;
      assert.ok(o, "onboarding.inTraits namespace 누락");
      for (const k of meta)   assert.ok(typeof o[k] === "string" && o[k].length > 0, `inTraits.${k} 누락`);
      for (const k of traits) assert.ok(typeof o[k] === "string" && o[k].length > 0, `inTraits.${k} 누락`);
    }
  });

  it("ko/en/ja 모두 identity.{section,editLabel,editDesc,editAction,title,nicknameSection,inTraitsSection,dualSelfSection,save,saveError} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const required = ["section","editLabel","editDesc","editAction","title",
                      "nicknameSection","inTraitsSection","dualSelfSection","save","saveError"];
    for (const lang of [ko, en, ja]) {
      const i = (lang as any).default.identity;
      assert.ok(i, "identity namespace 누락");
      for (const k of required) {
        assert.ok(typeof i[k] === "string" && i[k].length > 0, `identity.${k} 누락`);
      }
    }
  });

  it("ko/en/ja 모두 onboarding.result.{noCombo,editLabel,editHint} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    for (const lang of [ko, en, ja]) {
      const r = (lang as any).default.onboarding.result;
      for (const k of ["noCombo", "editLabel", "editHint"]) {
        assert.ok(typeof r[k] === "string" && r[k].length > 0, `onboarding.result.${k} 누락`);
      }
    }
  });
});

describe("i18n — locked.* 키 무결성 (4-L 30일 access 만료)", () => {
  it("ko/en/ja 모두 locked.{eyebrow,title,body,expiredAt,export*,notify*,dataKept} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const required = [
      "eyebrow", "title", "body", "expiredAt",
      "exportLabel", "exportDesc", "exportBtn", "exportErrorTitle",
      "notifyLabel", "notifyDesc", "dataKept",
    ];
    for (const lang of [ko, en, ja]) {
      const l = (lang as any).default.locked;
      assert.ok(l, "locked namespace 누락");
      for (const k of required) {
        assert.ok(typeof l[k] === "string" && l[k].length > 0, `locked.${k} 누락`);
      }
    }
  });
});

describe("i18n — settings.legal.* 키 무결성 (4-I 약관 링크)", () => {
  it("ko/en/ja 모두 settings.legal.{section,tos,privacy} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    for (const lang of [ko, en, ja]) {
      const l = (lang as any).default.settings.legal;
      assert.ok(l, "settings.legal namespace 누락");
      for (const k of ["section", "tos", "privacy"]) {
        assert.ok(typeof l[k] === "string" && l[k].length > 0, `settings.legal.${k} 누락`);
      }
    }
  });
});

describe("i18n — settings.analytics.* 키 무결성 (4-B/4-C 동의 변경)", () => {
  it("ko/en/ja 모두 settings.analytics.{section,sentry.*,posthog.*,restartNote} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    for (const lang of [ko, en, ja]) {
      const a = (lang as any).default.settings.analytics;
      assert.ok(a, "settings.analytics namespace 누락");
      assert.ok(typeof a.section === "string"     && a.section.length     > 0, "section 누락");
      assert.ok(typeof a.restartNote === "string" && a.restartNote.length > 0, "restartNote 누락");
      for (const k of ["sentry", "posthog"]) {
        assert.ok(typeof a[k]?.label === "string" && a[k].label.length > 0, `${k}.label 누락`);
        assert.ok(typeof a[k]?.desc  === "string" && a[k].desc.length  > 0, `${k}.desc 누락`);
      }
    }
  });
});

describe("i18n — settings.dataExport.* 키 무결성 (4-K 데이터 export)", () => {
  it("ko/en/ja 모두 settings.dataExport.{section,label,desc,btn,errorTitle,error.{auth,network,unknown}} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const top = ["section", "label", "desc", "btn", "errorTitle"];
    const errKeys = ["auth", "network", "unknown"];
    for (const lang of [ko, en, ja]) {
      const d = (lang as any).default.settings.dataExport;
      assert.ok(d, "settings.dataExport namespace 누락");
      for (const k of top) {
        assert.ok(typeof d[k] === "string" && d[k].length > 0, `settings.dataExport.${k} 누락`);
      }
      for (const k of errKeys) {
        assert.ok(typeof d.error?.[k] === "string" && d.error[k].length > 0,
          `settings.dataExport.error.${k} 누락`);
      }
    }
  });
});

describe("i18n — settings.account.* 키 무결성 (4-H 계정 삭제)", () => {
  it("ko/en/ja 모두 settings.account.{section,delete*,confirm1*,confirm2*,deleting,deleteError*,cancel} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const required = [
      "section", "deleteLabel", "deleteDesc", "deleteBtn",
      "confirm1Title", "confirm1Body", "confirm1Continue",
      "confirm2Title", "confirm2Body", "confirm2Delete",
      "deleting", "deleteErrorTitle", "cancel",
    ];
    const errKeys = ["auth", "server", "network"];
    for (const lang of [ko, en, ja]) {
      const s = (lang as any).default.settings;
      assert.ok(s && s.title, "settings.title 누락");
      const a = s.account;
      assert.ok(a, "settings.account namespace 누락");
      for (const k of required) {
        assert.ok(typeof a[k] === "string" && a[k].length > 0, `settings.account.${k} 누락`);
      }
      for (const k of errKeys) {
        assert.ok(typeof a.deleteError?.[k] === "string" && a.deleteError[k].length > 0,
          `settings.account.deleteError.${k} 누락`);
      }
    }
  });
});

describe("i18n — notifications.* 키 무결성 (3-G 토글)", () => {
  it("ko/en/ja 모두 notifications.{toggleLabel,toggleDescOn,toggleDescOff,permissionDenied*} 존재", async () => {
    const ko = await import("../src/locales/ko.json");
    const en = await import("../src/locales/en.json");
    const ja = await import("../src/locales/ja.json");
    const required = [
      "toggleLabel", "toggleDescOn", "toggleDescOff",
      "permissionDeniedTitle", "permissionDeniedBody",
    ];
    for (const lang of [ko, en, ja]) {
      const n = (lang as any).default.notifications;
      assert.ok(n, "notifications namespace 누락");
      for (const k of required) {
        assert.ok(typeof n[k] === "string" && n[k].length > 0, `notifications.${k} 누락`);
      }
    }
  });
});
