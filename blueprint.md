# Blueprint — Meaning Flow (의미의 흐름)

> 🌱 전 세계 IN 계열(INFP·INTP·INFJ·INTJ)을 위한 시간 흐름·정체성·익명 공명 기반 To-Do 앱
> 청사진 v1.1 (2026-05-21 갱신 — PRD/UserGuide v1.1 흡수, 현재 진척: 단일 HTML 디자인 프로토타입 완료)

이 문서는 Meaning Flow의 **사양·기술·진척을 한 곳에 모은 청사진**이다.
- Claude Code의 작업 규칙은 [`CLAUDE.md`](CLAUDE.md) 에 둔다.
- 1차 원본 명세는 [`MeaningFlow_PRD_v1.1.docx`](MeaningFlow_PRD_v1.1.docx) + [`MeaningFlow_UserGuide_v1.1.docx`](MeaningFlow_UserGuide_v1.1.docx).
- 모든 STEP/Phase 단위 작업은 10장의 로드맵을 기준으로 한다.

---

## 1. 제품 개요

### 1.1 한 줄 정의

Meaning Flow는 전 세계 INTP·INTJ·INFJ·INFP 사용자의 뇌 작동 방식에 맞춰 설계된, **시간 흐름 · 두 자아 정체성 · 익명 공명** 기반의 글로벌 To-Do 앱이다.

### 1.2 왜 필요한가

일반 To-Do 앱은 사고형(T)·감각형(S)에 최적화되어 있다. '목표 → 계획 → 실행' 선형 구조 + 달성률·스트릭·통계로 사용자를 압박. IN 계열의 뇌는 다른 연료로 움직인다 — 외부 압력에는 저항, 내부 정체성·의미에는 강력하게 반응. 완벽주의·분석 마비·야간 직관 폭주라는 고유 함정.

게다가 IN은 외로워하지만 직접 만남은 부담스러워한다. **익명 공명**이 그 답.

### 1.3 핵심 차별점

- **시간이 곧 모드다** — 아침·낮·저녁·밤 4개의 다른 화면
- **두 자아 시스템** — 위계 없는 '혼자/함께' 두 MBTI 선택
- **밤 모드가 메인** — 생각 잠그기·5분 타이머·이불 촉감 모드
- **의미 일기** — 통계가 아닌 한 줄 회고로 자기 효능감
- **70% 만족 버튼** — 완벽주의 회로 차단 장치
- **익명 공명방** — 댓글 없이 '공명해요' 하나로 전 세계 IN과 무언의 연결
- **원문 + 온디맨드 번역** — 다른 나라 IN의 한 줄을 원어로 읽고, 필요할 때 번역

### 1.4 절대 원칙 (위반 금지 — 상세는 [`CLAUDE.md`](CLAUDE.md) M1~M7)

1. **통계·압박·완벽주의 회로 차단** — 스트릭·달성률·붉은 배지 금지.
2. **공명방 안전** — 댓글·좋아요·팔로워·실명·정확 시각 노출 금지. `🌿 공명해요` 한 액션만.
3. **원문 우선 + 온디맨드 번역** — 자동 전체 번역 금지. 캐싱으로 99% 비용 절감.
4. **모더레이션 + 위기 자원** — OpenAI Moderation 통과 필수, 자해 암시 시 위기 자원 자동 노출.
5. **데이터 프라이버시** — RLS 기반, 작성자 식별자 분리, 비밀키 환경변수 경유.
6. **카피라이팅** — 명령형 금지, 숫자 강조 금지, 두 자아 인정, 모국어 카피 검수.

---

## 2. 대상 사용자

### 2.1 글로벌 시장 (PRD 2.1)

| 지역 | 추정 IN 인구 | 디지털 친숙도 | 출시 우선순위 |
|------|-------------|--------------|---------------|
| 한국 | 약 1,000만 | 매우 높음 | Phase 1 (출시) |
| 영어권 전체 | 약 3-4억 | 매우 높음 | Phase 1 (출시) |
| 일본 | 약 3,000만 | 매우 높음 | **Phase 1 (출시)** ← 2026-05-22 격상 (PRD 원안: Phase 2) |
| 프랑스 | 약 1,600만 | 높음 | Phase 5+ (+6개월) |
| 독일 | 약 2,000만 | 높음 | Phase 5+ (+6개월) |

### 2.2 글로벌 페르소나 (PRD 2.2)

| 페르소나 | 인적사항 | 조합 | 특징 |
|---------|----------|------|------|
| A 한국 | 지원, 28, 디자이너, 서울 | INFP × INTJ | 아이디어 폭발 + 실행 불가 + 야간 불면 |
| B 독일 | Mia, 24, Grad student, Berlin | INFJ × INTP | Overthinking, deep isolation, wants quiet connection |
| C 일본 | Kenji, 35, Software Engineer, 東京 | INTP × INTJ | 分析麻痺, 完璧主義, 一人で考え込む夜 |
| D 프랑스 | Léa, 31, Artist, Paris | INFP × INFJ | Sensible mais épuisée, cherche du sens dans le quotidien |

---

## 3. 핵심 개념

### 3.1 두 자아 시스템 (Dual-Self System)

기존 MBTI 앱이 '주/부' 위계 표현을 쓰는 반면, 이 앱은 위계 없이 두 자아를 동등하게 인정.

| 구분 | Solo Self (혼자일 때의 나) | Social Self (함께일 때의 나) |
|------|---------------------------|---------------------------|
| 온보딩 질문 | 방문을 닫고 혼자 있을 때, 당신은 어떤 모습인가요? | 사람들 사이에 있을 때, 당신은 어떤 역할로 존재하나요? |
| 활성 시간대 | 밤 (22:00–02:00) | 아침·낮 (06:00–18:00) |

**조합 닉네임 (6종 — PRD UserGuide):**

| Solo | Social | 닉네임 |
|------|--------|--------|
| INFP | INTJ | 가치를 품은 전략가 |
| INFP | INTP | 탐험하는 시인 |
| INFP | INFJ | 공명하는 이상주의자 |
| INTP | INTJ | 체계를 짓는 사색가 |
| INTP | INFJ | 통찰하는 분석가 |
| INTJ | INFJ | 비전을 가진 건축가 |

### 3.2 시간대별 모드 (PRD 3.2)

| 시간 | 모드 | 뇌 상태 | 앱의 역할 |
|------|------|---------|----------|
| 06–10시 | 🌅 점화 (Ignition) | 전두엽 기상 중 | 어젯밤 첫 단추 + 정체성 질문 |
| 10–18시 | ☀️ 실행 (Action) | 전두엽 풀가동 | 2분 마이크로 태스크, 70% 만족 |
| 18–22시 | 🌆 통합 (Integration) | 전두엽 피로 | 의미 일기 + 공명방 흘려보내기 |
| 22–02시 | 🌙 착륙 (Landing) | 직관 폭주 | 생각 보관함, 5분 타이머, 이불 모드 |

### 3.3 공명의 정원 (Resonance Garden) — v1.1 핵심 추가

댓글 없음, 좋아요 없음, **오직 `🌿 공명해요` 하나**. 전 세계 IN이 익명으로 한 줄 의미 일기를 흘려보내는 무언의 광장.

**작동 흐름:**
1. 저녁 회고에서 의미 일기 작성
2. 하단 체크박스: '익명으로 공명방에 흘려보내기' (**기본 OFF**)
3. 체크 → OpenAI Moderation 통과 → 공명방 게시
4. 다른 사용자가 `🌿 공명해요` 버튼
5. 작성자에게 'N명이 당신에게 공명했어요' 알림 (1일 1회 합산)

**표시 정보 / 표시 안 함:**

| 표시 O | 표시 X |
|--------|--------|
| MBTI 조합 닉네임 | 작성자 닉네임/실명 |
| 의미 일기 한 줄 (최대 200자) | 프로필 이미지 |
| 작성된 국가/언어 (🇯🇵 일본어) | 팔로워/팔로잉 (개념 자체 없음) |
| 공명 받은 수 (합계만) | 정확한 게시 시각 |
| 대략적 시각 ('오늘 저녁') | 작성자 위치/기기 정보 |

### 3.4 다국어 전략 — 원문 우선 + 온디맨드 번역

공명방의 모든 게시물은 **원어 그대로** 표시. 사용자가 '🌍 번역' 버튼을 누를 때만 본인 언어로 변환.

**원문 우선의 이유 (PRD 3.4.1):**
- 정서 보존 — 일본어의 정중함, 독일어의 직설성, 프랑스어의 운율
- 이국적 매력 — '베를린의 INFJ가 적은 한 줄' 감각
- **비용 효율 — 자동 전체 번역 대비 API 호출 99% 감소**
- 사용자 통제권 + 외국어 학습 효과

**번역 처리 정책 (PRD 3.4.3):**
- 게시물별 캐싱 (`translations` 테이블 영구 저장)
- 두 번째부터 누구나 번역 버튼 눌러도 캐시 사용 → 비용 0
- DeepL 우선, 미지원 언어는 Google Translate 폴백
- 사용자당 월 100회 한도

**언어 확장 로드맵:**

| 단계 | 시점 | 추가 언어 | 이유 |
|------|------|-----------|------|
| Phase 1 | MVP 출시 | 🇰🇷 한국어 + 🇺🇸 영어 + **🇯🇵 일본어** | 검증 시장 + 글로벌 최대 + MBTI 강한 시장 동시 진입 (2026-05-22 격상) |
| Phase 5+ | +6개월 | 🇫🇷 프랑스어 + 🇩🇪 독일어 | 유럽 IN 시장 |

**⚠ 일본어 출고 게이트**: `ja.json` 1차 초안 작성 완료(2026-05-22). 베타(Phase 4) 진입 전 **일본 native speaker 검수 필수** — 11.0-F 별도 트랙에서 추적.

---

## 4. 기능 명세

### 4.1 🌅 점화 모드 — F-MOR-001
어젯밤 첫 단추 카드 + 오늘의 정체성 질문 + 스킵 옵션.

### 4.2 ☀️ 실행 모드 — F-DAY-001
단 하나의 할 일 카드 + 2분 마이크로 변환기 + 70% 완료 버튼 + 접힌 보관함.

### 4.3 🌆 통합 모드 — F-EVE-001
의미 일기 + 두 자아 통합 질문 + '공명방에 흘려보내기' 토글.

### 4.4 🌙 착륙 모드 — F-NIT-001 ~ F-NIT-004
생각 보관함(자이가르닉 차단) + **텍스트 5분 영감 타이머** + 내일의 첫 단추 + 이불 촉감 모드.

영감 타이머는 PRD 4.4·UserGuide 기능 2 원안 그대로 — *"딱 5분만 쏟아내고, 강제로 닫힙니다"* 텍스트 기반.

> **음성 2분 스피치는 출시 이후로 보류 (2026-05-22 사용자 결정)** — MVP 범위에서 제외. 사용자 베타 피드백 + 운영 데이터 확인 후 Phase 5+ 에서 재검토. 본문 위·아래 STEP 표·MVP 범위·11.0-F 트랙 모두 동일 적용.

### 4.5 🌿 공명의 정원 — F-RES-001 ~ F-RES-005

| ID | 기능 | 핵심 |
|----|------|------|
| F-RES-001 | 게시 | 의미 일기 하단 토글(기본 OFF) + 모더레이션 통과 |
| F-RES-002 | 피드 | 저녁(18–22시) 진입, 시간순 정렬, 무한 스크롤 금지(20개+더보기), 필터(같은 MBTI/언어/전 세계) |
| F-RES-003 | 공명 액션 | `🌿 공명해요` 토글, 1일 1회 합산 푸시, '내 공명 일기'에 저장 |
| F-RES-004 | 번역 | `🌍 번역` 버튼, 사용자 언어 변환, 원문 토글, 월 100회, 영구 캐싱 |
| F-RES-005 | 신고 | 사유(욕설/스팸/자해/기타), 자해 우선 처리 + 위기 자원 자동, 3회 신고 시 자동 숨김 |

### 4.6 카피·UI 핵심 패턴 (PRD 4.x · UserGuide)

- **2분 마이크로 변환기** — '운동하기' → 잠시 멈춤 → "이걸 2분 안에 시작할 수 있나요?" → '운동복 갈아입기' 같은 작은 단위 제안
- **70% 만족 버튼** — 두 버튼 동등 배치, 70% 쪽이 시각적으로 더 눈에 띄게 (의도된 디자인)
- **의미 일기 질문 톤** — 조합별 변주: INFP×INTJ "1년 뒤에도 의미가 있을까요?" / INTP×INFJ "누구와 나누고 싶나요?" / INTJ×INFJ "어떤 비전이 한 걸음 가까워졌나요?"

---

## 5. 데이터 모델

### 5.1 핵심 엔티티 (PRD 5.1 — 총 10 테이블)

| 테이블 | 용도 | 주요 필드 |
|--------|------|-----------|
| `profiles` | 사용자 정보 | id, solo_mbti, social_mbti, combo_nickname, language, country, timezone |
| `daily_themes` | 오늘 테마 | id, user_id, date, theme_text |
| `tasks` | 할 일 | id, user_id, title, micro_action, status, scheduled_for |
| `reflections` | 의미 일기 | id, user_id, date, reflection_text, language, shared_to_resonance |
| `thought_vault` | 밤 보관함 | id, user_id, thought_text, captured_at, source |
| `resonance_posts` | 공명방 게시물 | id, user_id, content, language, combo_nickname, created_at, status, moderation_score |
| `resonances` | 공명 액션 | id, post_id, user_id, created_at |
| `translations` | 번역 캐시 | id, post_id, source_lang, target_lang, translated_text, provider, created_at |
| `reports` | 신고 | id, post_id, reporter_id, reason, status, created_at |
| `prompt_templates` | 프롬프트 다국어 | id, time_zone, category, solo_mbti, social_mbti, language, template |

### 5.2 RLS 정책 요약 (PRD 5.2)

- `reflections` — 본인만 read/write
- `resonance_posts` — 모두 read, 본인만 write/delete
- `resonances` — 본인이 누른 것만 본인 view (작성자엔 합계만)
- `translations` — 모두 read (캐시 공유), 시스템만 write
- `reports` — 본인이 신고한 것만 view, 운영자 별도 권한

---

## 6. 기술 스택

### 6.1 권장 조합 (PRD 6.1)

| 계층 | 기술 | 선택 이유 |
|------|------|----------|
| 프레임워크 | React Native + Expo | iOS·Android 동시, OTA, 1인 개발 최적 |
| UI | NativeWind (Tailwind) | 빠른 스타일링 |
| 상태 관리 | Zustand | Redux 대비 가벼움 |
| 백엔드 | Supabase | PostgreSQL + Auth + Realtime + RLS + Edge Functions |
| 로컬 저장 | MMKV | AsyncStorage 대비 30배 |
| 알림 | Expo Notifications | '정체성 알림' 구현 |
| 애니메이션 | Reanimated 3 | 잠금 애니메이션, 이불 모드 트랜지션 |
| i18n | react-i18next + expo-localization | 다국어 UI, OS 언어 자동 감지 |
| 번역 API | DeepL + Google Translate (폴백) | DeepL 품질 우수, 미지원 폴백 |
| 모더레이션 | OpenAI Moderation API | 무료, 다국어, 자해/혐오/스팸 |
| 배포 | EAS Build + Submit | App Store / Play Store 자동 |
| 에러 추적 | Sentry | 무료 티어 |
| 분석 | PostHog (self-host) | 프라이버시 친화, GDPR 대응 |

### 6.2 월 비용 추정 (MAU 5,000 기준 — PRD 6.2)

| 서비스 | 플랜 | 비용 |
|--------|------|------|
| Supabase | Pro | $25/월 |
| Expo EAS | Production | $29/월 |
| DeepL API | Pro | ~$10/월 (캐싱 효과) |
| OpenAI Moderation | 무료 | $0 |
| Sentry | Developer | $0 |
| **합계 (텍스트 MVP)** | | **약 $64/월 (~9만원)** |

---

## 7. 디자인 원칙

### 7.1 시각 톤 (PRD 7.1)
- 팔레트: 차분한 청회색·따뜻한 크림·연한 라벤더 (**붉은 알림 배지 금지**)
- 타이포: 가독성 높은 명조 또는 부드러운 산세리프
- 여백: 화면의 60%는 여백
- 애니메이션: 빠름보다 부드러움

### 7.2 카피라이팅 원칙 (PRD 7.2 — [`CLAUDE.md`](CLAUDE.md) M2)
- 명령형 금지 ('하세요' 대신 '해볼까요?')
- 숫자 강조 금지
- 질문형 활용
- 두 자아 인정
- 다국어 — 정서적 결을 살린 모국어 카피

### 7.3 공명방 디자인 원칙 (PRD 7.3)
- 플로우 차원에서 격리 — 공명방은 '내 작업'과 시각적으로 다른 톤
- 느린 스크롤 — 무한 스크롤 금지, 한 번에 20개씩
- 국기 이모지로 작성된 국가/언어를 부드럽게 표시
- '공명' 버튼은 식물 아이콘(🌿) — 압박 없는 따뜻함

### 7.4 디자인 토큰 (현 프로토타입 `src/tokens.css` 기준)

| 카테고리 | 키 |
|----------|-----|
| 종이/잉크 | `--paper`, `--paper-warm`, `--ink`, `--ink-soft`, `--mute`, `--hair`, `--hair-soft`, `--cream` |
| 모드 색 | `--morning`, `--morning-soft`, `--day`, `--day-soft`, `--evening`, `--evening-soft`, `--night`, `--night-soft`, `--night-bg` |
| 폰트 | `.mf-serif`, `.mf-mono` |

Phase 1(RN/Expo) 마이그레이션 시 이 토큰을 NativeWind config 로 1:1 이식.

---

## 8. MVP 범위

### 8.1 MVP 포함 (V1.1 — PRD 8.1)

- 두 자아 온보딩 (4종 × 4종 조합)
- 4시간대 모드 (점화·실행·통합·착륙)
- 2분 마이크로 변환기
- 70% 완료 버튼
- 생각 보관함
- 영감 타이머 — **텍스트 5분** (PRD 원안)
- 내일의 첫 단추 + 이불 촉감 모드
- 의미 일기
- **익명 공명방** (게시·읽기·공명·번역·신고)
- **다국어 UI** (한국어·영어·**일본어** — 일본어는 native 검수 후 출고)
- **콘텐츠 모더레이션**
- Supabase 계정 동기화

### 8.2 MVP 제외 (V2.0+ — PRD 8.2)

- 프랑스어·독일어 UI (Phase 5+) — 일본어는 Phase 1로 격상됨 (2026-05-22)
- **음성 2분 스피치** (출시 이후 Phase 5+ 재검토 — 2026-05-22 결정)
- 연도별 회고 (Year in Review)
- AI 기반 동적 프롬프트 생성
- 위젯 (홈 화면 첫 단추)
- Apple Watch / Wear OS 연동
- 수익화
- '세계의 공명' 큐레이션 기능

---

## 9. 성공 지표

### 9.1 측정 지표 (PRD 9.1)

| 지표 | 측정 | MVP 목표 |
|------|------|----------|
| D7 잔존율 | 가입 후 7일 재방문 | 40%+ (일반 To-Do 평균 25%) |
| 밤 모드 사용률 | 22시 이후 진입 | DAU의 30%+ |
| 의미 일기 작성률 | 일일 회고 작성 DAU | DAU의 25%+ |
| 공명방 게시율 | 일기 작성자 중 공유 | 작성자의 15%+ |
| 공명 받은 비율 | 게시물당 평균 공명 수 | 게시물당 평균 5+ |
| 번역 사용률 | 타국어 게시물에 번역 누른 비율 | 타국어 노출의 30%+ |
| 글로벌 비율 | 한국 외 사용자 비율 | 3개월 내 30%+ |

### 9.2 측정하지 않는 것 (의도적 — PRD 9.2)

- 스트릭 — IN 계열의 실패 압박감
- 총 할 일 완료 수 — 의미 없음
- 앱 사용 시간 — 짧을수록 좋음
- 공명방 팔로워 수 — 개념 자체 없음

> 위 지표는 **개발자 분석용(PostHog)** 만. UI에 노출 금지. ([`CLAUDE.md`](CLAUDE.md) M1)

---

## 10. 개발 로드맵

### 10.1 Phase 트랙 (PRD 10)

| 단계 | 기간 | 핵심 활동 | 상태 |
|------|------|----------|------|
| Phase 0 | Week 1-2 | 기획 확정, 단일 HTML 프로토타입으로 흐름 검증 | ✅ 2026-05 완료 (11장) |
| Phase 1 | Week 3-6 | Expo 셋업, Supabase 스키마, i18n 구조, 온보딩 + 점화/실행 모드 | ◐ 진행 중 (STEP 1-A ✅) |
| Phase 2 | Week 7-10 | 통합/착륙 모드 + MBTI 프롬프트 시스템 (KR/EN) | ⏸ |
| Phase 3 | Week 11-14 | 공명방 + 번역 시스템 + 모더레이션 | ⏸ |
| Phase 4 | Week 15-16 | 내부 베타 (한국 + 해외 각 15명), 버그 수정 | ⏸ |
| Launch | Week 17 | App Store / Play Store 출시 (**KR + EN + JA**) | ⏸ |
| Phase 5+ | +6개월 | 🇫🇷 프랑스어 + 🇩🇪 독일어 추가 | ⏸ |

> 2026-05-22 변경: PRD 원안의 Phase 5 (+3개월 일본어 추가)는 Phase 1에 합쳐짐 — 일본어 출고는 베타 전 native 검수 통과가 게이트.

### 10.2 Phase 1 진입 시 STEP 분해 (제안 — 사용자 승인 후 확정)

| STEP | 내용 | 검증 기준 | 상태 |
|------|------|----------|------|
| 1-A | Expo 프로젝트 셋업 + tokens 이식 | `expo export --platform web` 통과 + CSS에 4시간대 색 박힘 | ✅ 2026-05-21 |
| 1-B | Supabase 프로젝트 + 10 테이블 스키마 + RLS + GRANT + supabase-js 연결 | 헬스 체크 ✅ 배지 | ✅ 2026-05-21 |
| 1-C | i18n 구조 (react-i18next, 5개 언어 자리, ko/en/ja 채움 — ja는 1차 초안) | 언어 토글 ko↔en↔ja 3-cycle 전환 | ✅ 2026-05-21 + 2026-05-22 ja 추가 |
| 1-D | 온보딩 (두 자아 선택 + 조합 닉네임) + anonymous auth + profiles 저장 | 3-step 진행 → 닉네임 확정 → DevDashboard 진입 | ✅ 2026-05-22 |
| 1-E | 🌅 점화 모드 + ☀️ 실행 모드 (첫 단추 + 2분 변환기 + 70% 버튼) | tasks CRUD + 4칩 토글 + 70% 우대 + 모바일 검증 | ✅ 2026-05-22 |

### 10.4 Phase 3 STEP 분해 (2026-05-22 사용자 승인)

**이번 세션 범위**: 3-A + 3-B + 3-C (게시·피드·공명 액션 1 cycle). 3-D~3-G 는 별도 세션.

| STEP | 내용 | 외부 의존 | 상태 |
|------|------|----------|------|
| 3-0 | **M3 차단 마이그레이션** — `resonance_posts` 의 `user_id` 컬럼이 client SELECT 노출되지 않도록 VIEW `resonance_feed` 추가 + RPC `get_resonance_count(post_id)`·`has_resonated(post_id)`·`toggle_resonance(post_id)` 추가 + `reports` 3회 누적 시 status='hidden' trigger (자해 1회는 즉시 pending_review) | — | ✅ 2026-05-22 (`20260522_phase3_resonance_view_rpc_trigger.sql` — **사용자가 Supabase Studio 에 수동 적용 필요**) |
| 3-A | **공명방 게시** — Edge Function `resonance_publish` (OpenAI Moderation → INSERT, 키 없으면 mock pass) + client `publishToGarden` + EveningScreen 저장 후 share=true 시 게시. 차단 시 일기는 본인에게 보존 + 부드러운 안내 카피 | OpenAI key (mock 으로 동작) | ✅ 2026-05-22 |
| 3-B | **공명방 피드 (GardenScreen)** — `resonance_feed` VIEW 시간순 20개 + 더 보기 + 필터 칩(전세계/조합/언어) + 진입 면책 카피 + 5개국 mock 데이터 | — | ✅ 2026-05-22 |
| 3-C | **공명 액션 `🌿 공명해요`** — `toggle_resonance` RPC (optimistic UI) + `has_resonated`·`get_resonance_count` + 작성자에게는 합계만 | — | ✅ 2026-05-22 |
| 3-D | **번역** `🌍 번역` 버튼 — Migration `translation_quota` + Edge Function `translate_post` (cache hit→무료 / miss→DeepL→Google→INSERT+quota++) + client `lib/translation.ts` + GardenPostCard 원문↔번역 토글. DEV mock 모드 (DEEPL+GOOGLE 둘 다 없으면 prefix 안내) | DeepL + Google key | ✅ 코드 2026-05-22 / 외부 키·deploy 사용자 측 대기 |
| 3-E | **신고** — `lib/reports.ts` (submitReport + crisisResourcesFor) + ReportModal (사유 4종 + ⋯ 메뉴 + hiddenFromYou) + 자해 사유 시 위기 자원 모달 자동 노출 + tel: 링크 (KR 1393·1577-0199·1388 / US 988·741741 / JP 0120-279-338·0570-783-556). UNIQUE(post_id,reporter_id) 중복 신고 차단 + auto_hide trigger 활용 | — | ✅ 2026-05-22 |
| 3-F | **위기 자원 + 면책 카피** — 전 화면 면책 카피 + 입력 시 자해 키워드 검사 모달. 신고 흐름의 위기 자원 (3-E) 와 별개로 *작성 시점* 검사 | — | ⏸ 다음 STEP |
| 3-G | **1일 1회 합산 공명 알림** — Expo Notifications + Supabase cron | Expo Push 인증 | ⏸ Phase 4 |

### 10.3 Phase 2 STEP 분해 (2026-05-22 사용자 승인)

| STEP | 내용 | 검증 기준 | 상태 |
|------|------|----------|------|
| 2-A | 🌆 EveningScreen — 의미 일기 reflections CRUD + 200자 카운터 + 공명방 토글(기본 OFF, **이번 단계는 `shared_to_resonance` 컬럼 저장만** — 실 게시·모더레이션은 Phase 3) | reflections 1건 저장 + 200자 가드 + 토글 상태 영구 + i18n ko/en/ja | ✅ 2026-05-22 |
| 2-B | 🌙 NightScreen 컨테이너 + 4 stage 탭(vault/timer/first/blanket) + 다크 톤 | 탭 전환 + 다크 톤 일관성 | ✅ 2026-05-22 |
| 2-C | 🌙 NightVault — 생각 보관함 thought_vault CRUD + '찰칵 잠그기' 시각 전환 | 단어 추가/삭제 + 잠금 상태 토글 + 영구 저장 | ✅ 2026-05-22 |
| 2-D | 🌙 NightTimer — **텍스트 5분 카운트다운** (가로 진행바 + start/pause/reset + 강제 종료 카피 + 결과물 보관함 담기) | 5:00→0:00 자동, 일시정지 정확 | ✅ 2026-05-22 |
| 2-E | 🌙 NightFirst — 내일의 첫 단추 (4 옵션 + 직접 입력) → `tasks.scheduled_for=내일` | DB row + 다음 morning 진입 시 표시 | ✅ 2026-05-22 |
| 2-F | 🌙 NightBlanket — 이불 모드 (Animated 호흡 4초 들숨/4초 날숨 + 정적 카피) | 시각 확인 | ✅ 2026-05-22 |
| ~~2-G~~ | ~~🌙 NightTimer 음성 모드 — 2분 스피치~~ | — | ❌ **출시 이후 보류 (2026-05-22 사용자 결정)**. Phase 5+ 베타 피드백 후 재검토 |

> Phase 1~6 의 외부 키(SUPABASE / DEEPL / OPENAI_MODERATION / EAS / SENTRY) 발급 체크리스트는 사용자가 별도 관리.

---

## 11. 현재 진척 상태 (2026-05-21 갱신)

**핵심 메시지**: **Phase 1 전체 완료 + GitHub push 완료** (2026-05-22). Expo SDK 54 + NativeWind v4 + Supabase (10 테이블 + RLS 16 + GRANT) + supabase-js + i18n (한·영·일 3언어, 모바일 ko/en/ja 3-cycle 토글) + Anonymous Auth + Onboarding (두 자아 + 6 조합 닉네임) + 🌅 점화·☀️ 실행 화면 (tasks CRUD + 2분 마이크로 변환 + 70% 우대) + 🌆 통합(dusk 그레이)·🌙 착륙(다크) 모드 분리 + 모바일(iPhone Expo Go) 검증 통과. 일본어는 Phase 5에서 Phase 1으로 격상 — 1차 초안 작성, native 검수는 Phase 4 베타 전 출시 게이트. **GitHub**: https://github.com/mirr0505-maker/meaning-flow (Private).

**Phase 2 완료 (2026-05-22)**: STEP 2-A~2-F 텍스트 기반 통합·착륙 모드 실구현 + 빌드 검증 (tsc 0 · npm test 9/9 · expo export 475 모듈, +14 from Phase 1). 공명방 토글은 `shared_to_resonance` 컬럼 저장만 (실 게시는 Phase 3). 영감 타이머는 텍스트 5분 (PRD 원안). **음성 2분 스피치 (구 STEP 2-G) 는 출시 이후로 보류** — 2026-05-22 사용자 결정, Phase 5+ 베타 피드백 후 재검토.

**Phase 3 1차 사이클 완료 (2026-05-22)**: STEP 3-0 (M3 차단 마이그레이션) + 3-A (게시 Edge Function) + 3-B (GardenScreen 피드) + 3-C (공명 액션) + i18n garden.* ko/en/ja 전체. 빌드 검증 (tsc 0 · npm test 10/10 · expo export). **실 검증 통과 (2026-05-22 로컬호스트)**: ① 게시 ✅ / ② 정원 표시 ✅ / ③ 공명 토글 ✅ / ④ 필터 3종 ✅ / ⑤ OpenAI Moderation 차단 + 일기 보존 ✅ / ⑦ 공명 해제 ✅. OpenAI key + Supabase Edge Function deploy + 마이그레이션 적용 모두 사용자 측 완료.

**검증 중 발견된 fix (2026-05-22)**: Edge Function 의 INSERT 가 service_role 대신 user JWT (supaUser) 로 동작하도록 변경 — `SUPABASE_SERVICE_ROLE_KEY` 자동 주입 누락 시에도 RLS `resonance_posts_self_insert` 정책으로 INSERT 통과. moderation_score 같은 server-only 필드는 Edge Function 안에서만 채워지므로 client 우회 불가, M4 정신 유지.

3-D 번역 · 3-E 신고 · 3-F 위기 자원 · 3-G 알림은 다음 세션.

**백로그 정리 (2026-05-22)**:
- B-1 NativeWind `flex-1` 조사 — 설정·버전 조합은 호환 정상. 원인 1순위 = Metro 캐시 (`--clear` 누락) ([11.0-F](#110-f-별도-트랙-2026-05-22-발견-추후-처리)).
- B-2 영·일 native 검수 트랙 — [`docs/i18n-review-workflow.md`](docs/i18n-review-workflow.md) 신규 + ko/en/ja 의 `_status` 필드 정비 (`draft` / `null`).

**EAS Build 셋업 (2026-05-22)**: `app.json` (bundleIdentifier `com.meaningflow.app` + scheme + runtimeVersion) + `eas.json` (development/preview/production 3 프로파일) + `.gitignore` secret 보강 + [`docs/eas-build-and-store-checklist.md`](docs/eas-build-and-store-checklist.md) 작성. 실 빌드는 사용자 `eas login` + `eas init` 후 명시 승인 시 진행.

### 11.0-F 별도 트랙 (2026-05-22 발견, 추후 처리)

| 트랙 | 우선순위 | 내용 |
|------|---------|------|
| NativeWind `flex-1` 모바일 누락 원인 디버깅 | ★ | ✅ **2026-05-22 조사 완료**. 결론: **설정·버전 조합은 모두 호환 정상** — NativeWind 4.2.4 는 Expo SDK 54 (Reanimated 4.1.1 + React 19 + RN 0.81) 호환 패치 포함 (v4.2.0+ Reanimated v4 patch). `babel.config.js` `["babel-preset-expo", { jsxImportSource: "nativewind" }] + "nativewind/babel"` 및 `metro.config.js withNativeWind(..., { input: "./global.css" })` 모두 공식 권장 그대로. **실제 원인 가설 (NativeWind v4 troubleshooting 공식 문서 기준 우선순위)**: ① **Metro 캐시** (`npx expo start --clear` 미실행 시 className → style 매핑 stale) → 90% 케이스 해결, ② **동적 className 분기**(`className={"flex-1 " + (cond ? "A" : "B")}`)의 일부 케이스에서 정적 분석 누락, ③ ScrollView `contentContainerStyle` 와 `className` 의 우선순위 충돌, ④ Reanimated/Worklets 플러그인 중복 시 컴파일 누락. **권장 처치**: (a) 다음 모바일 검증 전 `--clear` 강제, (b) 동적 분기보다 `clsx`/`twMerge` 같은 유틸 고려는 보류 (의존성 추가 부담), (c) 정적 className 우선 작성. **현재 코드 영향**: `Onboarding.tsx:57` 의 inline `style={{ flex: 1, ... }}` 한 곳만 임시 보강 — 캐시 클린 후 재검증해서 inline 제거 가능. Phase 2 신규 코드는 모두 정적 className 만 사용 → 정상 동작 예상 |
| 영어 · **일본어** 카피 native 검수 | ★★★ **출시 게이트** | 2026-05-22 사용자 결정 — native 검수 없이 출시 불가. 베타(Phase 4) 진입 전 필수. 영어는 1차 다듬기 완료, 일본어는 1차 초안(`ja.json` `_status` 필드로 표시). PRD 7.2 정서 결 + UserGuide 톤 기준. 일본어가 가장 위험 — 경어·간접·시적 톤 검증 어려움. **검수 워크플로**: ① 영어 native (또는 검수 도구) → ② 일본 native (지인·crowdsourcing·유료 서비스 중 사용자 선택) → ③ 베타 사용자 피드백 |
| ~~Phase 2-G 음성 입력 STEP~~ | ❌ 출시 이후 | 2026-05-22 사용자 결정 — **출시 이후로 보류**. 베타 피드백 + 운영 비용 데이터 확인 후 Phase 5+ 에서 재검토. M4 검사·24h 보관·면책 카피·STT 비용 등 부담이 MVP 적합성 대비 큼 |
| **PRD `.docx` 갱신** | ★★ | 2026-05-22 결정으로 blueprint.md 만 1차 반영. PRD v1.1 .docx 는 1차 소스라 별도 v1.2 리비전으로 일본어 Phase 1 격상·음성 보류·STEP 2-G 제외 등 명시 후 git commit. 사용자가 docx 편집기에서 직접 작성 또는 메인 세션이 markdown 으로 초안 작성 후 사용자 변환 |
| **공명방 같은 user 의 하루 중복 게시 제한** | ★ | 2026-05-22 실 검증 ⑥ 에서 발견 — 같은 사용자가 같은 글을 여러 번 흘려보내면 정원에 같은 글이 여러 행. 정책 결정 필요: (a) `resonance_posts` 에 `UNIQUE(user_id, date)` 추가 → 하루 1회만 (reflections 와 정합), (b) Edge Function 에서 "이미 오늘 게시했어요" 안내 후 update, (c) 그대로 두기. UX 안전상 (a) 권장 |
| 다크모드 UX 전체 검토 | ✅ 2026-05-22 | `app/src/lib/theme.ts` `modeColors(dark)` helper 추출 + MorningScreen·DayScreen 에 dark prop 전파. night 모드에서 호출 시 카드·글자·placeholder 색이 모두 다크 톤(`bg-night-bg2` / `text-night-ink` / `text-night-soft` / `text-night-muted` 등)으로 자동 전환. day-soft 같은 모드 전용 강조 카드는 라이트 유지 |
| 데스크탑 웹 가로폭 변동 | ◐ 부분 완료 | App.tsx max-width 440px 컨테이너로 해결. 모바일에선 viewport <440 이라 자동 처리 |

### 11.0-E Phase 1 STEP 1-E 결과물 (2026-05-22)

| 항목 | 값 |
|------|-----|
| Lib | `app/src/lib/tasks.ts` (fetchTodaysFirstTask, createTask, updateTaskStatus), `timeOfDay.ts` (modeForHour, currentMode) |
| Screens | `app/src/screens/MorningScreen.tsx`, `DayScreen.tsx`, `FlowRouter.tsx` (자동 모드 + dev 4칩 토글, evening/night는 Phase 2 placeholder) |
| Morning UI | 조합 닉네임 정체성 카드 + 어젯밤 첫 단추 (있으면 시작/스킵, 없으면 빈 상태 안내) |
| Day UI | 입력 → **2분 마이크로 변환기** (3 옵션 + skip) → active 카드 → **70% 완료(녹색 leaf 강조)** + 100% 완료(아웃라인) — CLAUDE.md M1 완벽주의 회로 차단 디자인 |
| 종료 처리 | 70%/100% 모두 `tasks.status` 갱신 → "오늘은 이걸로 충분해요" 축하 카피 → 다른 한 가지 추가 옵션 |
| App 라우팅 | DevDashboard 제거, FlowRouter 가 메인. Onboarding 흐름 그대로 유지 |
| i18n 확장 | `flow.morning.*`, `flow.day.*`, `flow.evening.*`, `flow.night.*`, `flow.devToggle`, `flow.loading`, `flow.loadError` (ko/en 양쪽) |
| 빌드 검증 | tsc 통과 + `expo export` 464 모듈, CSS 10.8 kB, JS 1.04 MB |

### 11.0-D Phase 1 STEP 1-D 결과물 (2026-05-22)

| 항목 | 값 |
|------|-----|
| Auth | Supabase Anonymous Sign-in (Dashboard ON) |
| Lib | `app/src/lib/auth.ts` (ensureSession), `profiles.ts` (fetch/upsert), `combos.ts` (6 매트릭스 + 4 same fallback + resolveComboKey) |
| Onboarding UI | `app/src/onboarding/{Onboarding,OBIntro,OBPickMBTI,OBResult}.tsx` (4 컴포넌트 분리 — CLAUDE.md §5 200줄 규칙) |
| 메인 화면 | `app/src/screens/DevDashboard.tsx` — 기존 dev 화면 + 사용자 조합 닉네임 카드 |
| App 라우팅 | `app/App.tsx` — phase: loading / auth_error / onboarding / main 분기. 첫 부팅 시 anonymous + onboarding, 재부팅 시 profile 있으면 직행 |
| i18n 확장 | ko/en 각각 `onboarding.*` + `mbti.*` + `combos.*` (6+4+unknown=11) 키 추가 |
| 닉네임 다국어 정책 | `combo_nickname` 컬럼에는 **i18n key**(예 "combos.infpIntj") 저장. 표시 시점에 `t()` 로 변환 → 사용자 언어 변경 시 닉네임도 자동 전환 |
| 빌드 검증 | tsc 통과 + `expo export` 460 모듈, CSS 10.2 kB, JS 1.03 MB |

### 11.0-C Phase 1 STEP 1-C 결과물 (2026-05-21)

| 항목 | 값 |
|------|-----|
| 패키지 | `i18next` + `react-i18next` + `expo-localization` (config plugin 자동 등록) |
| 초기화 | `app/src/lib/i18n.ts` — OS 언어 자동 감지, fallback `en` |
| 키 자리 | `app/src/locales/{ko,en,ja,fr,de}.json` — 5개 언어 자리 마련 (CLAUDE.md M5), **ko/en/ja 채움** (ja는 2026-05-22 1차 초안, native 검수 미완) / fr·de 빈 객체 (Phase 5+) |
| 채워진 키 | `app.*`, `health.*`, `modes.{morning,day,evening,night}.{label,name}`, `footer.tokenSource`, `lang.{ko,en}` |
| App 통합 | FlowRouter 우상단 언어 토글 (**ko → en → ja → ko 3-cycle**) + 모든 카피 `t()` 호출로 전환 |
| 빌드 검증 | `expo export --platform web` 452 모듈, CSS 8.45 kB, JS 1.01 MB |
| 사용자 확인 | 2026-05-21 dev server 부팅 — 헬스 체크 ✅ + 토글로 ko↔en 정상 전환 |

### 11.0-B Phase 1 STEP 1-B 결과물 (2026-05-21)

| 항목 | 값 |
|------|-----|
| Supabase 프로젝트 ref | `nmxiaxiafcudmuadptah` (ap-northeast-2 서울) |
| Supabase CLI | 2.101.0 (devDependency) |
| 마이그레이션 파일 | `app/supabase/migrations/20260521143033_initial_schema.sql` (200줄) |
| 생성된 테이블 | 10개 (PRD 5.1) — profiles, daily_themes, tasks, reflections, thought_vault, resonance_posts, resonances, translations, reports, prompt_templates |
| RLS | 10/10 테이블 활성화 |
| 정책 | 16개 (PRD 5.2 그대로) — 의미 일기·생각 보관함·할 일·테마·프로필 본인만 / 공명방 모두 read·본인만 write / 공명 본인만 view / 번역·프롬프트 모두 read |
| 추가 안전망 | MBTI·언어·status·reason CHECK 제약, 일기/공명/신고/번역 UNIQUE 제약, content 200자 제한, 공명방 visible partial index |
| 적용 방식 | Supabase Studio SQL Editor 수동 실행 (2건: 스키마 + GRANT 보강) |
| 보강 마이그레이션 | `app/supabase/migrations/20260521144727_grants_for_anon_authenticated.sql` — "Automatically expose new tables" 끔에 따른 GRANT 수동 부여 |
| client 패키지 | `@supabase/supabase-js` + `@react-native-async-storage/async-storage` + `react-native-url-polyfill` |
| client 코드 | `app/src/lib/supabase.ts` — env 로드 가드 + AsyncStorage 세션 + URL polyfill |
| 헬스 체크 | `App.tsx` 상단 배지 — `prompt_templates` COUNT 쿼리 성공 시 ✅, 실패 시 ⚠️ + 에러 메시지 |
| 빌드 검증 | `expo export --platform web` 416 모듈 통과, env 주입 확인 |
| 다음 (선택) | `npx supabase link --project-ref nmxiaxiafcudmuadptah` — 향후 마이그레이션 `db push` 자동화 (DB password 1회 필요) |

### 11.0 Phase 1 STEP 1-A 결과물 (2026-05-21)

| 항목 | 값 |
|------|-----|
| Expo SDK | 54.0.33 |
| React / React Native | 19.1.0 / 0.81.5 |
| TypeScript | 5.9.2 |
| NativeWind | v4 (+ Tailwind 3.4.17) |
| 신규 폴더 | `app/` (디자인 프로토타입 `src/` 와 완전 분리) |
| 핵심 설정 파일 | `app/tailwind.config.js`, `app/babel.config.js`, `app/metro.config.js`, `app/global.css`, `app/nativewind-env.d.ts` |
| 검증 화면 | `app/App.tsx` — 4시간대 색 4종 + 종이/잉크/잉크소프트/뮤트/헤어 토큰 시각 확인 |
| 검증 명령 | `cd app && npx tsc --noEmit` (통과) + `npx expo export --platform web` (347 모듈 번들 OK) |
| 추가 dev 의존성 | `babel-preset-expo` (Expo 54 hoist 누락 보강), `react-dom` + `react-native-web` (web 빌드용) |

### 11.1 디자인 프로토타입 인벤토리

| 파일 | 줄 수 | 역할 |
|------|------|------|
| `Meaning Flow.html` | 24 | 엔트리 — React/Babel CDN + 스크립트 로드 순서 정의 |
| `src/tokens.css` | 115 | 디자인 토큰 (종이/잉크/4모드 색/폰트 클래스) |
| `src/ios-frame.jsx` | 338 | iPhone 14 Pro 프레임 + 다크/라이트 토글 |
| `src/tweaks-panel.jsx` | 568 | 디자이너용 라이브 트윅 패널 (모드 전환·조합 변경·온보딩 재진입) |
| `src/components.jsx` | 265 | 공용 컴포넌트 — `MODES`, `COMBOS`(6종), `Horizon`, `TopBar`, `BottomNav` |
| `src/onboarding.jsx` | 184 | 두 자아 선택 3 STEP (intro → Solo → Social) |
| `src/flow-screens.jsx` | 681 | 4시간대 화면 (`ScreenMorning`/`Day`/`Evening`/`Night`) |
| `src/garden-me.jsx` | 371 | 🌿 공명의 정원 피드 + 마이페이지 (5개국 mock post + 번역 토글) |
| `src/app.jsx` | 115 | 라우팅 (flow/garden/me 탭) + 온보딩 진입/완료 |
| **합계** | **2,661** | |

부가 자산:
- `screenshots/01-morning.png` — 아침 모드 캡처
- `uploads/files/` — PRD/UserGuide docx 사본

### 11.2 프로토타입 단계에서 확인된 사항

- 4시간대(아침/낮/저녁/밤) 시각 톤 분리 → 디자인 토큰으로 1:1 매핑 가능
- 두 자아 온보딩 흐름 → 6 조합 닉네임 라우팅까지 동작
- 공명방 mock — 5개국 게시물(ko/de/ja/en/fr) + 원문↔번역 토글 UI 확립
- iOS 402×874 프레임 기준 레이아웃 확정
- 다크 모드 = 밤 모드(Landing) 자동 전환

### 11.3 Phase 0 → Phase 1 마이그레이션 시 보존 대상

[`CLAUDE.md`](CLAUDE.md) §2 코드 보호 원칙에 따라 다음을 보존:
- `tokens.css` 의 모든 CSS 변수 → NativeWind config 로 이식
- `COMBOS` 6종 닉네임 매트릭스 → 상수 그대로
- 4시간대 모드 메타(`MODES`) → 그대로
- 온보딩 카피 톤 (PRD 7.2 + UserGuide 검수)
- 공명방 UI 패턴 (국기 이모지 + 대략적 시각 + 단방향 공명 액션)

### 11.4 외부 키 발급 체크리스트

| 키 | 발급처 | 상태 |
|----|--------|------|
| SUPABASE_URL / SUPABASE_ANON_KEY | supabase.com | ⏳ Phase 1 진입 시 |
| EAS account | expo.dev | ⏳ Phase 1 |
| OPENAI_API_KEY (Moderation) | platform.openai.com | ⏳ Phase 3 |
| DEEPL_AUTH_KEY | deepl.com/pro | ⏳ Phase 3 |
| GOOGLE_TRANSLATE_API_KEY (폴백) | cloud.google.com | ⏳ Phase 3 |
| SENTRY_DSN | sentry.io | ⏳ Phase 4 |
| POSTHOG_KEY | posthog.com (self-host) | ⏳ Phase 4 |

---

## 12. 비기능 요구사항

| 항목 | 요구 |
|------|------|
| 성능 | 화면 전환 60fps, 콜드 스타트 2초 이내 |
| 오프라인 | 로컬 우선 (MMKV). 일기·할 일·밤 모드 등 개인 기능 인터넷 없이 동작. 공명방·번역만 인터넷 필요. |
| 데이터 보존 | `reflections`·`thought_vault` 영구 (사용자 삭제 시 hard delete). 공명방 게시물 30일 후 피드에서 아카이브. |
| 다국어 | UI 한·영 (MVP), 일·불·독 단계 확장. 공명방 원문은 처음부터 전 언어 표시. |
| 장애 대응 | 외부 API(DeepL·Moderation) 실패 시 원문만 보여주거나 부드러운 안내. 앱 멈추지 않음. |

---

## 13. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 공명방 악성 게시물 | 사용자 정서 훼손 | OpenAI Moderation 게시 전 차단 + 3회 신고 자동 숨김 + 자해 우선 처리 |
| 번역 API 비용 폭증 | 운영비 압박 | 영구 캐싱 + 사용자당 월 100회 한도 + 자동 전체 번역 금지 |
| 자해 암시 글 | 법적·윤리 리스크 | 위기 자원 자동 노출 + 작성자 일기는 본인에 한해 보존 |
| MBTI 비과학 비판 | 신뢰성 손상 | UserGuide FAQ — '진단 도구'가 아닌 '대화의 출발점'으로만 사용 |
| RLS 누락 | 의미 일기 노출 | Supabase 마이그레이션마다 RLS 테스트 의무 (PRD 5.2) |
| OS 알림 권한 거부 | '정체성 알림' 미작동 | 권한 거부 시에도 앱 내 시간대 자동 전환은 동작 |
| 일본/유럽 GDPR | 데이터 처리 동의 | PostHog self-host + 익명화 + 명시적 동의 화면 |

---

## 14. 명령어 참조

### 14.1 디자인 프로토타입 (Phase 0 — 현재)

```powershell
# 1) 루트에서 정적 서버 띄우기 (Babel CDN 사용 — CORS 회피)
cd e:\meaningflow
python -m http.server 8080
# → 브라우저에서 http://localhost:8080/Meaning%20Flow.html

# 우측 Tweaks 패널로 모드 전환·조합 변경·온보딩 재진입 가능
```

### 14.2 Phase 1 진입 후 (Expo / Supabase — 예정)

```powershell
# Expo
npx create-expo-app meaningflow-app --template tabs@52
cd meaningflow-app
npx expo start          # 개발 서버
npx expo prebuild       # 네이티브 디렉토리 생성
eas build --profile development

# Supabase
npx supabase init
npx supabase migration new initial_schema
npx supabase db push

# i18n
npm install i18next react-i18next expo-localization
```

> 위 명령은 PRD 10장 Phase 1 진입 시 사용자 승인 후 STEP 1-A~E 분해하여 실행. 임의 실행 금지.

---

## 부록 A. 용어

- **IN 계열** — INFP·INTP·INFJ·INTJ. 내향(I) + 직관(N) 4유형.
- **두 자아 (Dual-Self)** — Solo Self(혼자일 때) + Social Self(함께일 때). 위계 없음.
- **조합 닉네임** — 두 자아 조합으로 생성되는 6종 닉네임 (3.1).
- **시간대 모드** — 점화(06–10) / 실행(10–18) / 통합(18–22) / 착륙(22–02).
- **2분 마이크로 변환기** — '운동하기' 같은 큰 단어를 '운동복 갈아입기' 같은 2분 단위로 쪼개는 장치.
- **70% 만족 버튼** — 완벽주의 회로 차단. 100%와 동등 배치, 70%가 시각적으로 더 눈에 띄게.
- **의미 일기** — 통계 대신 한 줄 회고. `reflections` 테이블.
- **공명의 정원 (Resonance Garden)** — 익명 광장. `🌿 공명해요` 단방향 액션만.
- **자이가르닉 효과** — 미완료 작업이 머릿속에 남아 잠을 방해. 생각 보관함이 차단.
- **원문 우선 + 온디맨드 번역** — 공명방 게시물 자동 전체 번역 금지. 사용자가 누를 때만 변환 + 영구 캐싱.

## 부록 B. 다음 액션

1. ✅ `blueprint.md` + `CLAUDE.md` 작성 (2026-05-21)
2. ✅ Phase 1 STEP 1-A~E 전체 완료 (2026-05-21~22)
3. ✅ 일본어 1차 초안 추가 + Phase 1 격상 결정 반영 (2026-05-22)
4. ✅ git init + GitHub push (https://github.com/mirr0505-maker/meaning-flow) (2026-05-22)
5. ⏳ **다음 세션 후보** (사용자 결정):
   - **A. Phase 2 진입** — 🌆 통합 (의미 일기 + 공명방 진입) + 🌙 착륙 (생각 보관함·5분 타이머·내일의 첫 단추·이불 모드)
   - **B. 백로그 정리** ([blueprint.md 11.0-F](#11-0-f-별도-트랙-2026-05-22-발견-추후-처리))
     - NativeWind `flex-1` 모바일 누락 근본 원인 (★)
     - 영어·일본어 native 검수 (★★★ 출시 게이트, Phase 4 베타 전)
   - **C. EAS Build 셋업** — develop build로 실기기 검증 (PRD 6.1 EAS Production)
