// 🚀 자해 위험 키워드 사전 — 작성 시점 (EveningScreen) 감지용
// PRD 5.1 / CLAUDE.md M4·M7
//
// 원칙:
//  - 보수적으로 좁게: 일반 회고·철학·관용표현에서 오탐 안 되도록.
//    예) "프로젝트 끝내고 싶다", "I want to die laughing" 같은 표현까진 잡지 않음
//        (관용 표현이라도 회고 일기 맥락에선 신호일 수 있어, 안내만 노출하고 차단은 안 함)
//  - 일기 자체는 **저장 차단하지 않음** — 모달은 본인용 안내일 뿐 (M4 정신)
//  - 매치 정책: 단순 substring (정규식 X). UI 로직이 무거워지면 안 됨

const KEYWORDS_KO = [
  "죽고싶", "죽고 싶",
  "자해",
  "자살",
  "사라지고싶", "사라지고 싶",
];

const KEYWORDS_EN = [
  "kill myself", "kill my self",
  "end my life", "end it all",
  "suicide",
  "self harm", "self-harm", "selfharm",
  "want to die",
  "don't want to live", "dont want to live", "do not want to live",
];

const KEYWORDS_JA = [
  "死にたい",
  "自殺",
  "自傷",
  "消えたい",
];

export function containsSelfHarm(text: string, lang: string): boolean {
  if (!text) return false;

  const lower = text.toLowerCase();
  const langKey = lang.split("-")[0] ?? "";

  // 한국어: 언어 ko 이거나 한글이 포함된 경우 검사
  const hasHangul = /[가-힯]/.test(text);
  if (langKey === "ko" || hasHangul) {
    for (const k of KEYWORDS_KO) if (lower.includes(k)) return true;
  }

  // 일본어: 언어 ja 이거나 일본어 문자가 포함된 경우
  const hasJapanese = /[぀-ヿ]/.test(text) || /[一-鿿]/.test(text);
  if (langKey === "ja" || hasJapanese) {
    for (const k of KEYWORDS_JA) if (text.includes(k)) return true;
  }

  // 영어: 모든 언어에서 fallback — 한국 사용자가 영어로 적을 수도 있음
  for (const k of KEYWORDS_EN) if (lower.includes(k)) return true;

  return false;
}
