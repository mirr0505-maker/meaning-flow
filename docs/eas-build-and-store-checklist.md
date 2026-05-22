# EAS Build · App Store · Play Store 체크리스트

> 작성: 2026-05-22 · Phase 1~4 셋업 + 출시(Phase Launch) 체크리스트
> [`blueprint.md`](../blueprint.md) §6.1 EAS Build + Submit / §10 로드맵 / §13 리스크 — GDPR 참조

---

## 0. 작업 분담

| 작업 | 주체 | 비고 |
|------|------|------|
| Expo 계정 생성·로그인 | **사용자** | `eas login` 1회 |
| EAS project id 발급 (`eas init`) | **사용자** | `app.json.extra.eas.projectId` 자동 채워짐 |
| Apple Developer 멤버십 ($99/년) | **사용자** | iOS 빌드·제출 필수 |
| Google Play Console 가입 ($25 1회) | **사용자** | Android 빌드·제출 필수 |
| `eas.json` 작성 | ✅ 메인 세션 완료 | 이번 STEP |
| `app.json` 메타 (bundleId·package·color) | ✅ 메인 세션 완료 | 이번 STEP |
| 빌드 실행 | **사용자** (또는 사용자 승인 후 메인) | 인증·키 입력 필요 |
| Store 메타·심사 제출 | **사용자** | 스크린샷·심사 노트 작성 |

> 메인 세션은 키·자격증명·빌드 실행 자체는 하지 않는다 — 사용자 명시 승인 후 실행.

---

## 1. 초기 셋업 (사용자 1회)

```powershell
# 1) Expo 계정 / 로그인
cd e:\meaningflow\app
npx eas login                            # 또는 npm i -g eas-cli 후 eas login

# 2) EAS project 발급 — app.json.extra.eas.projectId 자동 채워짐
npx eas init                             # interactive: project 이름 = "meaning-flow"

# 3) Supabase 환경변수 EAS Secret 등록 — 빌드 시점에 자동 주입됨 (eas.json 에 직접 박지 않음)
npx eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://nmxiaxiafcudmuadptah.supabase.co" --visibility plaintext
npx eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<anon-key>" --visibility sensitive
```

---

## 2. Development Build (실기기 검증)

> 목적: Expo Go 한계(custom native module 미지원) 회피, 실 디바이스 디버깅.

```powershell
# iOS — Apple Developer 멤버십 필요
npx eas build --profile development --platform ios
# → 빌드 완료 후 QR 코드로 TestFlight 미경유 직접 설치 가능

# Android — APK 형태, USB 또는 QR 설치
npx eas build --profile development --platform android

# 모든 플랫폼 동시
npx eas build --profile development --platform all
```

빌드 후 결과:
- iOS: `.ipa` 다운로드 링크 + QR (TestFlight 안 거치고 등록된 기기에만)
- Android: `.apk` 다운로드 링크

**비용**:
- 무료 티어: 월 30 빌드 (Hobby plan)
- Production 플랜 $29/월: 무제한 + 우선 큐
- Phase 1~4 동안 무료 티어로 충분

---

## 3. Preview Build (베타용 — Phase 4)

```powershell
npx eas build --profile preview --platform all
# → 베타 사용자 15명 × 한국·해외 에게 internal distribution 링크
```

베타 채널:
- iOS: TestFlight (Apple Developer Program 필수)
- Android: Google Play Internal Testing track

---

## 4. Production Build (Phase Launch)

```powershell
npx eas build --profile production --platform all
# autoIncrement: true → buildNumber/versionCode 자동 증가
```

---

## 5. Submit — Store 자동 제출

```powershell
# iOS — App Store Connect
npx eas submit --profile production --platform ios

# Android — Play Console (internal track 부터)
npx eas submit --profile production --platform android
```

`eas.json.submit.production` 채우는 방법 (**현재는 비워둠 — `eas init` schema 가 빈 문자열 자체를 거부**):
- iOS: `npx eas submit:configure` 또는 첫 `eas submit --platform ios` 시 대화형으로 `appleId` · `ascAppId` · `appleTeamId` 입력 → 자동 저장
- Android: Play Console 에서 service account JSON 발급 후 `eas.json.submit.production.android.serviceAccountKeyPath: "./google-service-account.json"` 직접 추가 (**`.gitignore` 등록 필수**)

---

## 6. Store 제출 체크리스트

### 6.1 공통

- [ ] **앱 아이콘**: 1024×1024 PNG (alpha 채널 없음 — iOS 거부)
- [ ] **스플래시**: 다크/라이트 분리 권장 (현재 라이트 #FBF8F1 단일)
- [ ] **버전**: `app.json.version` semver
- [ ] **다국어**: Store 메타도 한국어·영어·**일본어** 3종 (PRD 8.1)
- [ ] **개인정보 처리방침 URL** (필수): Supabase·Sentry·PostHog 명시 + GDPR 대응 ([blueprint.md §13](../blueprint.md))
- [ ] **카테고리**: Productivity / Lifestyle (Lifestyle 권장 — Meaning Flow 의 정서 톤)

### 6.2 iOS App Store

- [ ] **App Store Connect 앱 생성** — Bundle ID `com.meaningflow.app`
- [ ] **Screenshots** (필수): iPhone 6.7" + 6.5" + 5.5" 각 3~10장 (한·영·일)
- [ ] **App Preview Video** (선택)
- [ ] **Privacy Manifest** — Apple 의 PrivacyInfo.xcprivacy 요구 (`expo-localization`·`@react-native-async-storage` 등이 자동 처리, 단 EAS 가 결합 필요)
- [ ] **App Tracking Transparency** — 익명 인증·PostHog 사용 시 ATT 동의 화면 필요 여부 검토
- [ ] **콘텐츠 등급**: 12+ 또는 17+ 검토 — 공명방 사용자 작성물 (PRD 4.5) 때문에 "User Generated Content" 표기 필수
- [ ] **심사 노트**: 익명 로그인 — Apple 가이드라인 4.8 "Sign in with Apple" 함께 제공 필요 여부 확인 (현재 anonymous only — 별도 OAuth 추가 시점에 검토)

### 6.3 Google Play Store

- [ ] **Play Console 앱 생성** — Package `com.meaningflow.app`
- [ ] **Feature Graphic**: 1024×500 PNG/JPG (필수)
- [ ] **Screenshots**: phone 4~8장 (한·영·일)
- [ ] **개인정보 처리방침 URL** (필수)
- [ ] **Data safety form** — 수집 데이터 (`reflections`, `thought_vault`, 익명 user_id) 명시, RLS 본인만 read/write 강조
- [ ] **콘텐츠 등급**: IARC 설문 — 사용자 생성 콘텐츠 (공명방) 체크
- [ ] **앱 카테고리**: Lifestyle 권장

### 6.4 GDPR / 일본 APPI

- [ ] **PostHog self-host** ([blueprint.md §13](../blueprint.md)) — Phase 4 이전 셋업
- [ ] **데이터 처리 동의 화면** — 첫 부팅 시 1회 (Onboarding 직전 또는 직후)
- [ ] **계정 삭제 기능** — Apple 가이드라인 5.1.1(v) + GDPR 17조. 의미 일기·생각 보관함 cascade delete 보장 (Supabase FK ON DELETE CASCADE 이미 적용 — [`migrations/20260521143033_initial_schema.sql`](../app/supabase/migrations/20260521143033_initial_schema.sql))
- [ ] **위기 자원 안내 카피의 국가별 핫라인** — 한·미·일 정확성 검증 ([docs/i18n-review-workflow.md](./i18n-review-workflow.md) §4.4)

---

## 7. 출시 직전 빌드 검증 (메인 세션이 할 수 있는 작업)

```powershell
# 빌드 전 종합 검증
cd e:\meaningflow\app
npm test                    # 9/9 통과 확인
npm run typecheck           # tsc 0
npx expo export --platform web    # 웹 번들 통과 (모바일 빌드 사전 검증)

# 모바일 dry-run — 빌드 안 함, 설정만 검증
npx eas build --profile development --platform ios --local --no-wait || true
```

---

## 8. EAS 무료 vs 유료 비교

| 플랜 | 가격 | 빌드 한도 | 우선순위 큐 | 권장 시점 |
|------|------|----------|------------|---------|
| Free | $0 | 월 30 | 일반 (5~30분 대기) | Phase 1~3 |
| Production | $29/월 | 무제한 | 우선 | Phase 4 베타 + Launch |
| Enterprise | $999+/월 | 무제한 + SLA | 최우선 | 사용 안 함 |

---

## 9. 환경변수 / Secret 관리

| 변수 | 위치 | 공개 여부 |
|------|------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | `eas.json` env + EAS secret | plaintext OK (URL 만 노출됨) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | EAS secret (sensitive) | client 에 노출되지만 RLS 로 안전 |
| Service Role Key | **client 절대 금지**, Supabase Edge Function 만 | sensitive |
| `OPENAI_API_KEY` (Phase 3) | Supabase Edge Function 환경변수 | client 노출 금지 |
| `DEEPL_AUTH_KEY` (Phase 3) | Supabase Edge Function 환경변수 | client 노출 금지 |
| Apple `AuthKey_XXX.p8` | 로컬만 + `.gitignore` | 절대 커밋 금지 |
| `google-service-account.json` | 로컬만 + `.gitignore` | 절대 커밋 금지 |

> `EXPO_PUBLIC_*` 접두사가 있는 것만 client 에 노출됨. 다른 키는 client 코드에서 접근 불가.

---

## 10. 다음 액션 (사용자 결정 대기)

1. ⏳ Expo 계정 생성 + `eas login` + `eas init`
2. ⏳ Apple Developer Program 가입 결정 ($99/년 — Phase 4 직전까지 보류 가능)
3. ⏳ Google Play Console 가입 결정 ($25 1회 — Phase 4 직전까지 보류 가능)
4. ⏳ `eas build --profile development --platform ios` 첫 실기기 빌드 실행 (사용자 명시 승인 후 메인 세션 실행 가능)
5. ⏳ Phase 3 완료 후 `production` 빌드 시점에 위 6.x 체크리스트 전체 점검

---

## 부록 A. 실제 빌드 트리거 시 메인 세션이 묻는 것

```
사용자: "EAS development 빌드 실행해줘"
메인:
  1) 사전 검증 — npm test, tsc, expo export 모두 통과 확인
  2) eas login 상태 확인 (사용자가 로그인되어 있어야)
  3) plat (ios/android/all) + profile 확정
  4) 빌드 시간(15~25분) · 비용(무료 티어 잔여) 안내
  5) 사용자 명시 승인 후 실행
```

CLAUDE.md §실행 주의 — 외부 빌드 시스템 작동·비용 발생은 매번 확인 필요.
