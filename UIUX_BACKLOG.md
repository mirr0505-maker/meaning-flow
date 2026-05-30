# UI/UX 백로그 — 출시 후 / 정식 출시 전 다듬기

> 작성 2026-05-29 (Phase 4 SNS 인증 완료 시점). 출시 블로커 X — 모두 "사용 가능 + 다듬기 가치 있음" 영역.
> CLAUDE.md / M1~M7 위반 X. 우선순위는 `P0(MVP)` < `P1(베타→정식)` < `P2(정식 후)` 로 표시.

---

## 1. 글자 크기 일관성 (P0)

이번 세션 [`feedback_design_consistency`](.claude/memory/feedback_design_consistency.md) 결정 — "일반 앱 표준 크기로". 일부 화면만 적용됨.

| 화면 | 글자 크기 상태 |
|---|---|
| HomeScreen | ✅ 적용 (인사 24pt, 카드 16pt) |
| DayScreen (실행) | ✅ 적용 (본 일 16pt, 세부 일 14pt) |
| MorningScreen (점화) | ✅ 적용 (카드 16pt, 버튼 52px) |
| **EveningScreen (통합)** | ❌ 미적용 |
| **NightScreen (착륙)** sub 화면 (Vault·Timer·First·Blanket) | ❌ 미적용 |
| **ReviewScreen + 4 sub-tabs** (DiaryArchive·Vault·Firsts·DoneTasks) | ❌ 미적용 |
| **SettingsScreen** | ❌ 미적용 (카드 본문 11pt → 13pt 권장) |
| **AboutScreen** | ❌ 미적용 |
| **IdentityEditScreen** | ⚠ 일부 (SNS 섹션 추가됨, 닉네임 입력란 등 점검) |
| **ConsentScreen / LockedScreen** | 점검 필요 |

기준: `text-xs → text-sm` / `text-sm → text-base` / inline `fontSize:11~12 → 13~14` / 버튼 높이 `44 → 48`.

---

## 2. 일본어 native 검수 (P1 — 베타 전 필수)

`app/src/locales/ja.json` 은 메인 세션 1차 초안 상태. [`blueprint.md`](blueprint.md) 11.0-F 별도 트랙.

- ✅ 키 자리 모두 채워짐
- ❌ Native speaker 검수 미진행
- 검수 포인트: 정서적 결, 경어/평어 일관성, IN 톤 (압박 카피 회피)
- 베타 (10명) Phase 4-K 진입 전까지 완료해야 출고 가능

---

## 3. 공명방 — 출시 후 강화 (P2)

| 항목 | 현재 | 정식 출시 시 강화 |
|---|---|---|
| 게시물 rate limit | 없음 (베타 10명 OK) | 일 N개 / 분 N개 server-side 강제 |
| Auto-translation 캐시 정책 | 영구 보존 | 1년 이상 미참조 시 정리 |
| 신고 자동 처리 | 5건 신고 시 자동 숨김 (이미 trigger 있음) | 사람 검수 큐 + 재게시 흐름 |
| 정원 진입 시 면책 문구 (M7) | 어딘가에 표시되는지 점검 필요 | 첫 진입 1회 명시적 동의 |

---

## 4. 디자인 일관성 작은 다듬기 (P1)

이번 세션 발견된 / 다음 검증에서 보일 수 있는 항목:

- **헤더** AppHeader 일관성 — 모드별로 정상이지만 SettingsScreen 진입 시 다른 헤더 (자체) 사용. 헤더 컴포넌트 통일 가능
- **BottomNav 3탭** (home / flow / review) — 활성 pill 강조 색상 미세 조정
- **점화 모드 카드 색상** — 사용자가 추가 의견 가능성 (이번 세션 미언급)
- **FlowRouter 의 모드 sub-chip 4개** — 이모지만 있는 상태에서 글자 라벨 추가됨. 위치/간격 점검
- **모달 하단 손잡이** (SignUpSheet 같은 시트) — 다른 시트에도 적용 일관성

---

## 5. 회원가입 / 로그인 흐름 — 마이크로 카피 (P1)

이번 세션 v4 LoginScreen 안정화 후 추가 검토 항목:

- 회원가입 시트 안의 환영 카피 (`signUpDesc`) — "30일 무료 베타" 부분이 정식 출시 후엔 다른 카피
- LoginScreen "Google 또는 Apple 로 시작해요" subhead — 정식 출시 시 더 정체성 강한 카피로 가능
- 다른 SNS Alert (`differentProvider.body`) — Apple Private Relay 경우 안내 한 줄 추가 가능
- 회원탈퇴 confirm 2단계 — 카피 톤 점검 ("회원탈퇴" 단어가 사용자에게 압박 느낌인지)

---

## 6. 알림 / 푸시 (P1)

`app/src/lib/notifications.ts` 는 셋업됨. 다만:

- ✅ pg_cron + Supabase Vault 트리거 + Edge Function (daily_resonance_digest) 동작
- ❌ 사용자가 실제로 푸시 받았을 때 인 앱 알림과의 경계 카피
- ❌ 푸시 알림 빈도 정책 (M1 압박 회피: 매일 vs 주 1-2회)
- ❌ 푸시 OFF 시 부드러운 안내 (사용자 결정 그대로)

---

## 7. UI 잔여 컴포넌트 / 화면 (P2)

- 회고 → 4 sub-tabs (Vault·Firsts·DoneTasks 등) 의 빈 상태 카피 다듬기
- LockedScreen (베타 30일 만료) — 정식 출시 가격 안내 카피
- ConsentScreen (첫 부팅 동의) — 카피 톤 점검

---

## 정리 — 우선순위

| 시점 | 작업 |
|---|---|
| **출시 전 (P0)** | 글자 크기 일관 (1) — 빠른 일괄 작업 |
| **베타 직전 (P1)** | 일본어 native 검수 (2), 마이크로 카피 (5), 알림 정책 (6), 디자인 다듬기 (4) |
| **정식 출시 후 (P2)** | 공명방 강화 (3), UI 잔여 (7) |
