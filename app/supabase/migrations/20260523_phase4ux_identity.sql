-- ═══════════════════════════════════════════════════════════
-- Phase 4 UI/UX STEP 1 — IN 정체성 발견 흐름
-- 2026-05-23
--
-- 사용자 결정 (2026-05-23): 앱 정체성 = IN 친화 todo list.
-- 온보딩에서 IN 특성 자기 선택 → 두 자아 (선택적) → 닉네임 (수정 가능) 흐름.
-- 모두 SettingsScreen 에서 사후 변경 가능.
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- 1. in_traits — 사용자가 선택한 IN 특성 키 배열
-- ───────────────────────────────────────────────────────────
-- 예: ['trait_idea_flood', 'trait_perfectionism_block', 'trait_meaning_fuel']
-- i18n 키 매핑은 lib/inTraits.ts 에서 처리. 키 자체는 영구 안정.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS in_traits TEXT[] NULL;

-- ───────────────────────────────────────────────────────────
-- 2. display_nickname — 사용자 정의 닉네임 (선택)
-- ───────────────────────────────────────────────────────────
-- NULL = combo_nickname 의 i18n 키 자동 사용 (예: "가치를 품은 전략가")
-- 값이 있으면 그대로 표시. 본인이 편한 이름.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_nickname TEXT NULL
    CHECK (display_nickname IS NULL OR char_length(display_nickname) BETWEEN 1 AND 30);

-- ───────────────────────────────────────────────────────────
-- 3. solo_mbti / social_mbti — NULL 허용으로 완화
-- ───────────────────────────────────────────────────────────
-- 사용자 결정 (2026-05-23): "반드시 2 조합 아니어도 됨".
-- IN 특성 1개 이상 선택만으로 가입 가능. MBTI 는 알면 입력, 모르면 NULL.
-- 기존 CHECK 제약은 유지 (값이 있으면 INFP/INFJ/INTP/INTJ 중 하나여야).
ALTER TABLE public.profiles
  ALTER COLUMN solo_mbti   DROP NOT NULL;
ALTER TABLE public.profiles
  ALTER COLUMN social_mbti DROP NOT NULL;

-- combo_nickname 도 NULL 허용 — 두 자아 둘 다 unknown 인 경우 NULL
ALTER TABLE public.profiles
  ALTER COLUMN combo_nickname DROP NOT NULL;

-- ───────────────────────────────────────────────────────────
-- 확인:
--   SELECT id, in_traits, display_nickname, solo_mbti, social_mbti, combo_nickname
--     FROM public.profiles ORDER BY created_at DESC LIMIT 5;
-- ───────────────────────────────────────────────────────────
