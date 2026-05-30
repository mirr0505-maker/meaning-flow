-- ═══════════════════════════════════════════════════════════
-- Phase 4 STEP 4-L — MVP 베타 30일 access 만료
-- 2026-05-23
--
-- 사용자 결정 (2026-05-23): MVP 베타 10명 내외, 개인별 가입 시점부터 30일 자동 만료.
-- 데이터는 보존 (Supabase row 그대로). 정식 출시 시 SQL 한 줄로 access 연장.
--
-- 만료 후 client 가 LockedScreen 으로 라우팅 → "내 데이터 내보내기" + "정식 출시 알림 신청"
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- 1. profiles.mvp_access_expires_at 컬럼 추가
-- ───────────────────────────────────────────────────────────
-- NULL = 만료 검사 skip (관리자/개발자 계정 또는 정식 출시 후 전체 NULL 처리 가능)
-- 가입 시점에 NOW() + INTERVAL '30 days' 자동 set
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mvp_access_expires_at TIMESTAMPTZ NULL;

-- ───────────────────────────────────────────────────────────
-- 2. 기존 row 백필 — 이미 가입된 사용자(베타 시점 이전 생성)는 created_at + 30일 기준
-- ───────────────────────────────────────────────────────────
-- 베타 정식 시작 전엔 created_at 기반 백필. 정식 출시 시점에 SQL 한 줄로 전체 갱신:
--   UPDATE public.profiles SET mvp_access_expires_at = NULL;  -- 또는 새 만료일 set
UPDATE public.profiles
   SET mvp_access_expires_at = created_at + INTERVAL '30 days'
 WHERE mvp_access_expires_at IS NULL
   AND created_at IS NOT NULL;

-- ───────────────────────────────────────────────────────────
-- 3. 신규 가입 시 자동 set 트리거
-- ───────────────────────────────────────────────────────────
-- profiles INSERT 시점에 mvp_access_expires_at 가 NULL 이면 NOW() + 30일로 자동 채움.
-- 명시적으로 NULL 지정 시 (관리자 계정 등) 트리거 우회 가능 — TG_OP 에서 NEW.mvp_access_expires_at IS DISTINCT FROM old 체크
CREATE OR REPLACE FUNCTION public.fn_set_mvp_expiry_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.mvp_access_expires_at IS NULL THEN
    NEW.mvp_access_expires_at := NOW() + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_mvp_expiry ON public.profiles;
CREATE TRIGGER trg_set_mvp_expiry
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_mvp_expiry_on_signup();

-- 확인:
--   SELECT id, created_at, mvp_access_expires_at,
--          (mvp_access_expires_at - NOW()) AS time_remaining
--     FROM public.profiles ORDER BY created_at DESC LIMIT 5;
