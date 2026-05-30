# Meaning Flow — 법무 문서 (Legal)

> Phase 4 STEP 4-I — 출고 게이트 ★★★. 베타 진입 전 한·영·일 native + **변호사 검토 통과 필수**.

본 디렉토리는 출시에 필요한 법적 문서의 **1차 한국어 골격**을 담는다. 메인 세션이 작성한 골격은 *항목 누락 방지용 체크리스트* 성격이며, 실제 출고 본문은 변호사 검토 후 사용자가 확정한다.

## 파일

| 파일 | 내용 | 상태 |
|------|------|------|
| [terms-of-service-ko.md](./terms-of-service-ko.md) | 이용약관 (한국어 1차 골격) | 🟡 골격 (변호사 검토 대기) |
| [privacy-policy-ko.md](./privacy-policy-ko.md) | 개인정보 처리방침 (한국어 1차 골격) | 🟡 골격 (변호사 검토 대기) |
| `*-en.md` | 영어 본문 | ⏸ 한국어 확정 후 작성 |
| `*-ja.md` | 일본어 본문 | ⏸ 한국어·영어 확정 후 작성 |

## 출시 전 체크리스트

### 1. 본문 확정
- [ ] 한국어 ToS — 변호사 검토 + 사용자 결정 사항 반영
- [ ] 한국어 Privacy — 변호사 검토 + GDPR/APPI/PIPA 정합 확인
- [ ] 영어 — 한국어 본문 기반 native + legal review
- [ ] 일본어 — 한국어·영어 본문 기반 native + legal review (검수자 섭외 트랙)

### 2. 호스팅
- [ ] 호스팅 위치 결정 — **Notion 공개 페이지** (무료, 빠름) 또는 **GitHub Pages** (도메인 보유 시) 권장
- [ ] URL 발급 후 [`app/src/screens/ConsentScreen.tsx`](../../app/src/screens/ConsentScreen.tsx) 의 `PRIVACY_POLICY_URL` 상수 채우기
- [ ] [`app/src/screens/SettingsScreen.tsx`](../../app/src/screens/SettingsScreen.tsx) 의 `TOS_URL` / `PRIVACY_POLICY_URL` 상수 채우기

### 3. 스토어 등록
- [ ] App Store Connect → App Information → **Privacy Policy URL**
- [ ] Play Console → Store Listing → **Privacy Policy URL**
- [ ] Apple ATT (App Tracking Transparency) 필요 여부 검토 — 익명 user + PostHog 사용 (자세히는 변호사)

### 4. 사용자 동의 흐름
- [x] ConsentScreen — 첫 부팅 1회 (4-J 완료)
- [x] SettingsScreen — 사후 변경 가능 (4-B/4-C 토글 완료)
- [ ] 온보딩 또는 SNS 가입 시 **ToS + Privacy 동의 체크박스** (스토어 정책 요구사항. 4-J 의 ConsentScreen 확장)

## 사용자가 채워야 할 핵심 정보 (변호사 검토 시 함께)

| 항목 | 입력값 |
|------|--------|
| **회사명/사업자명** (개인 사업자 가능) | __________ |
| **사업자등록번호** (한국 사용자 시) | __________ |
| **대표자명·연락처·이메일** | __________ |
| **고객지원 이메일** | __________ |
| **데이터 보관 국가** | Supabase 의 region 기준 — `ap-northeast-2` (서울) |
| **수익화 모델 세부** | 3일 무료 → 연간 구독 (사용자 결정 2026-05-23). 가격·환불 정책 명시 필요 |

## 도메인 원칙 정합 점검 (작성 시 확인)

- **M3 공명방 안전** — 댓글·좋아요·팔로워 없는 단방향 공명. 사용자가 ToS 에서 이를 인지해야
- **M4 모더레이션·자해 안전** — 자동 모더레이션 통과 후 게시, 자해 키워드 시 위기 자원 제공. 면책 카피 명시 (의료 상담 대체 아님)
- **M5 다국어 원문 보존** — 정원 게시물은 원문 유지, 번역은 선택. 사용자 동의 없이 다른 언어로 자동 노출되지 않음
- **M6 데이터 프라이버시** — 의미 일기·생각은 본인만 read/write. 공명방은 익명 닉네임만
- **3일 무료 trial + 연간 구독** — 사용자가 trial 종료 전 취소 가능. 자동 결제 안내 의무 (Apple/Google 정책)
