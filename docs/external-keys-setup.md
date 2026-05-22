# 외부 API 키 발급 절차 — Phase 3 진입 게이트

> 작성: 2026-05-22 · 사용자 병행 작업용
> 메인 세션은 코드 작성·검증, 키 발급·결제 등록·EAS Secret 등록은 **사용자 직접**.

---

## 0. 개요

| 키 | 용도 | 비용 (MAU 5,000 기준) | 우선순위 | 메인 세션 의존도 |
|----|------|--------------------|---------|----------------|
| **OpenAI API Key** | 공명방 게시 전 콘텐츠 모더레이션 (M4) | **무료** (rate limit 만) | ★★★ STEP 3-A 게이트 | Edge Function 으로 wrap (server-only) |
| **DeepL API Key** | 공명방 게시물 번역 우선 제공자 | 무료 500K char/월 · 초과 시 Pro $5.49/월 + $25/1M | ★★ STEP 3-D 게이트 | Edge Function (server-only) |
| **Google Translate API Key** | DeepL 폴백 (DeepL 미지원 언어·실패 시) | 무료 500K char/월 · 초과 시 $20/1M | ★★ STEP 3-D 게이트 | Edge Function (server-only) |
| **Supabase Edge Functions 활성화** | 위 3개 키를 client 노출 없이 wrap | **무료 500K invocations/월** | ★★★ 모든 Phase 3 게이트 | 메인 세션이 deploy 가능 |

> 모든 키는 **client 에 노출 금지** — Edge Function 안에서만 `Deno.env.get(...)` 으로 접근. EAS Secret 이 아니라 **Supabase Edge Function Secret** 으로 등록.

---

## 1. OpenAI API Key (Moderation)

### 1.1 발급 (사용자 작업, 약 10분)

1. [platform.openai.com](https://platform.openai.com) 가입 (Google/Microsoft OAuth 또는 이메일)
2. **결제 카드 등록 필요** — Moderation 자체는 무료지만 OpenAI 정책상 활성 계정만 호출 허용. [platform.openai.com/account/billing](https://platform.openai.com/account/billing) → "Add payment method"
3. **사용 한도 설정** (권장) — Billing → Usage limits → Hard limit `$5/month`, Soft limit `$1/month` (Moderation 만 쓰면 $0 유지되지만 안전망)
4. [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → "Create new secret key"
   - Name: `meaning-flow-moderation`
   - Permissions: **Restricted** → `Models.read` + `Moderations.write` 만 체크 (다른 권한 제외 — 키 유출 시 피해 최소화)
5. 키 복사 (`sk-proj-...`) — **단 1번만 표시됨**, 안전한 곳에 백업

### 1.2 검증 (curl 1줄)

```powershell
curl https://api.openai.com/v1/moderations `
  -H "Authorization: Bearer sk-proj-..." `
  -H "Content-Type: application/json" `
  -d '{\"input\": \"hello world\", \"model\": \"omni-moderation-latest\"}'
```

`results[0].flagged: false` 응답 오면 OK.

### 1.3 Supabase Edge Function Secret 등록 (사용자 또는 메인 세션 — 키 확보 후)

```powershell
# Supabase CLI 로
cd e:\meaningflow\app
npx supabase secrets set OPENAI_API_KEY=sk-proj-... --project-ref nmxiaxiafcudmuadptah
```

또는 [Supabase Studio → Edge Functions → Secrets](https://supabase.com/dashboard/project/nmxiaxiafcudmuadptah/settings/functions) 웹 UI 에서 직접 입력.

---

## 2. DeepL API Key (번역 우선 제공자)

### 2.1 발급 (사용자 작업, 약 5분)

1. [deepl.com/pro-api](https://www.deepl.com/pro-api) → "DeepL API Free" (무료 500K char/월)
2. 이메일 + 비밀번호 가입
3. **신용카드 등록 필수** — 무료 티어도 카드 필요 (악용 방지). 한도 초과 시에만 과금
4. [deepl.com/account/summary](https://www.deepl.com/account/summary) → Authentication Key 복사 (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx` — `:fx` 접미사가 Free 티어 표시)

> ⚠ `:fx` 가 붙은 키는 endpoint 가 `api-free.deepl.com` (유료는 `api.deepl.com`). Edge Function 에서 분기 처리.

### 2.2 검증

```powershell
curl https://api-free.deepl.com/v2/translate `
  -H "Authorization: DeepL-Auth-Key xxxxxxxx-...:fx" `
  -d "text=Hello&target_lang=KO"
```

`{"translations":[{"detected_source_language":"EN","text":"안녕하세요"}]}` 오면 OK.

### 2.3 Supabase Secret 등록

```powershell
npx supabase secrets set DEEPL_AUTH_KEY=xxxxxxxx-...:fx --project-ref nmxiaxiafcudmuadptah
```

---

## 3. Google Translate API Key (폴백)

### 3.1 발급 (사용자 작업, 약 15분 — 가장 복잡)

1. [console.cloud.google.com](https://console.cloud.google.com) 가입
2. 프로젝트 생성 — Name: `meaning-flow` (project id 는 자동 채워짐)
3. **Billing 활성화 필수** — Billing → Link a billing account → 신용카드 등록 (Translation API 무료 티어 500K char/월 사용해도 카드 필수)
4. APIs & Services → Library → "Cloud Translation API" 검색 → **Enable**
5. APIs & Services → Credentials → "Create credentials" → API key
6. **API key 제한 설정 필수** (보안):
   - Name: `meaning-flow-translate`
   - Application restrictions: **HTTP referrers** → `https://*.supabase.co/*` (Edge Function 만 호출)
   - API restrictions: **Restrict key** → "Cloud Translation API" 만 체크

### 3.2 검증

```powershell
curl "https://translation.googleapis.com/language/translate/v2?key=AIza...&q=Hello&target=ko&source=en"
```

`{"data":{"translations":[{"translatedText":"안녕하세요"}]}}` 오면 OK.

### 3.3 Supabase Secret 등록

```powershell
npx supabase secrets set GOOGLE_TRANSLATE_API_KEY=AIza... --project-ref nmxiaxiafcudmuadptah
```

---

## 4. Supabase Edge Functions 활성화 (가장 먼저)

### 4.1 활성화 확인

[Supabase Studio → Edge Functions](https://supabase.com/dashboard/project/nmxiaxiafcudmuadptah/functions) 접속 → "Get started" 버튼이 있으면 클릭.

> Free Plan 도 500K invocations/월 무료. Pro Plan ($25/월) 으로 가도 2M invocations 무료.

### 4.2 Supabase CLI 로 deploy 테스트 (메인 세션이 수행 가능)

```powershell
cd e:\meaningflow\app
npx supabase functions new health_check     # 빈 함수 생성
npx supabase functions deploy health_check --project-ref nmxiaxiafcudmuadptah
# → URL https://nmxiaxiafcudmuadptah.supabase.co/functions/v1/health_check
```

> CLI 가 access token 을 요구하면: Supabase Dashboard → Account → Access Tokens 에서 발급 → `npx supabase login`

---

## 5. 발급 후 메인 세션에 알릴 것

각 키 발급 완료 시 한 줄로:

> "OpenAI key 발급 + Supabase secret 등록 완료"
> "DeepL key 발급 + Supabase secret 등록 완료"
> "Google Translate key 발급 + Supabase secret 등록 완료"
> "Supabase Edge Functions 활성화 + supabase login 완료"

메인 세션은 그 시점에 Edge Function deploy + client mock 모드 해제 진행.

---

## 6. Mock 모드 — 키 없이도 동작 (CLAUDE.md §검증 의무 4)

키 발급 전에도 client 빌드·UI 검증이 가능하도록 메인 세션이 작성하는 코드:

```typescript
// app/src/lib/supabaseFunctions.ts (Phase 3 STEP 3-A 에서 작성 예정)
const MOCK = process.env.EXPO_PUBLIC_RESONANCE_MOCK === "1";

export async function publishResonance(text: string, lang: string) {
  if (MOCK) {
    return { ok: true, postId: "mock-" + Date.now(), moderation: "passed (mock)" };
  }
  // 실 호출 ...
}
```

`.env.local` (gitignored):
```
EXPO_PUBLIC_RESONANCE_MOCK=1
EXPO_PUBLIC_TRANSLATE_MOCK=1
```

| 환경 | 모드 |
|------|------|
| dev (사용자 로컬) | mock 가능 — UI 검증용 |
| dev build (EAS) | mock OFF, 실 키 |
| production | mock OFF 강제 |

---

## 7. 비용 모니터링 (Phase 4 베타 진입 직전)

| 서비스 | 모니터링 URL | 알림 설정 |
|--------|--------------|---------|
| OpenAI | platform.openai.com/account/usage | Hard limit `$5/월` |
| DeepL | deepl.com/account/usage | 무료 한도 80% 도달 시 이메일 |
| Google Cloud | console.cloud.google.com/billing/budgets | Budget `$10/월` 알림 |
| Supabase Edge Functions | Supabase Studio → Edge Functions → invocations | Free 500K 한도 |

> Phase 4 베타에서 MAU 100~200 으로 시작 → 비용 거의 0. 출시 후 운영비 폭증 방지 위해 한도 설정 필수.

---

## 8. 발급 우선순위 (이번 세션 가이드)

```
1순위 (STEP 3-A 게이트):  Supabase Edge Functions 활성화 + OpenAI API Key
                          → 게시 흐름 실 동작 가능

2순위 (STEP 3-D 게이트):  DeepL Key + Google Translate Key
                          → 번역 기능 실 동작. STEP 3-D 작업 시점에만 필요

3순위 (Phase 4):          Sentry DSN, PostHog Key
                          → 베타 직전 정밀 모니터링용
```

> **이번 세션 (3-A + 3-B + 3-C)**: 1순위만 발급되면 끝까지 동작. 2순위는 다음 세션 (3-D) 직전에 발급해도 OK.
