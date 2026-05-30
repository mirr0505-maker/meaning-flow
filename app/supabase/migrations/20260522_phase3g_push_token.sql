-- ═══════════════════════════════════════════════════════════
-- Phase 3 STEP 3-G-0 — 1일 1회 합산 공명 알림 (Expo Push)
-- 2026-05-22
--
-- PRD 4.5 F-RES-003 — 작성자에게 "N명이 당신에게 공명했어요" 알림 1일 1회 합산
-- M3 정합: 누가 공명했는지는 노출 X, 합계 숫자만
-- M1 정합: 합계 0 인 사용자에게 알림 안 보냄 (압박 회로 차단) — Edge Function 측에서 처리
--
-- profiles.timezone 은 초기 스키마에 이미 존재 → 사용자 device timezone (e.g. 'Asia/Seoul')
-- profiles.language 도 이미 존재 → 알림 카피 i18n 키 선택용
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- 1. profiles.expo_push_token 컬럼 추가
-- ───────────────────────────────────────────────────────────
-- ExponentPushToken[xxxxxx...] 형식 문자열. 사용자가 알림 권한 거부 시 NULL.
-- Edge Function 의 발송 대상 list 는 IS NOT NULL 필터.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS expo_push_token TEXT NULL;

-- RLS: 본인만 자기 토큰 UPDATE 가능. 다른 사용자의 토큰은 read/write 불가 (M6 프라이버시)
-- (profiles 의 기존 self-update 정책이 이미 본인 row 만 허용하므로 추가 정책 불필요)


-- ───────────────────────────────────────────────────────────
-- 2. 사용자별 어제 합산 공명 수 RPC
-- ───────────────────────────────────────────────────────────
-- Edge Function 이 호출. user_id 기준 어제(사용자 timezone) 본인 게시물 SUM(공명 수).
-- 합계 0 인 사용자는 결과 row 자체가 비어 나옴 (M1 — 0 알림 안 보냄)
--
-- 시각 비교: 사용자의 timezone 으로 어제 00:00 ~ 오늘 00:00 사이 created_at 게시물의
-- 공명 수 합계. timezone NULL 인 사용자는 UTC 기준 (안전 fallback).
CREATE OR REPLACE FUNCTION public.get_yesterday_resonance_for_user(p_user UUID)
RETURNS INT
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_tz       TEXT;
  v_y_start  TIMESTAMPTZ;
  v_y_end    TIMESTAMPTZ;
  v_count    INT;
BEGIN
  SELECT COALESCE(timezone, 'UTC') INTO v_tz FROM public.profiles WHERE id = p_user;

  -- timezone 기준 어제 00:00 ~ 오늘 00:00 의 UTC 표현
  v_y_start := (date_trunc('day', now() AT TIME ZONE v_tz) - INTERVAL '1 day') AT TIME ZONE v_tz;
  v_y_end   := (date_trunc('day', now() AT TIME ZONE v_tz)                   ) AT TIME ZONE v_tz;

  SELECT COALESCE(COUNT(r.*), 0) INTO v_count
    FROM public.resonance_posts p
    JOIN public.resonances      r ON r.post_id = p.id
   WHERE p.user_id   = p_user
     AND p.status    = 'visible'
     AND p.created_at >= v_y_start
     AND p.created_at <  v_y_end;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_yesterday_resonance_for_user(UUID) TO service_role;


-- ───────────────────────────────────────────────────────────
-- 3. 발송 대상 사용자 list 뷰
-- ───────────────────────────────────────────────────────────
-- Edge Function 이 매시간 호출 → 현재 시각이 자기 timezone 06:00 인 사용자 중
-- expo_push_token 가 NOT NULL 인 사람만 추출. 합계는 Edge Function 안에서 RPC 호출로 계산.
--
-- 시간 매칭: 사용자의 현지 시각의 hour 가 6 인 사용자.
-- (Edge Function 측에서 한 시간에 한 번 호출되므로, hour=6 매치되는 분이면 그 시간대 안에 1회 발송)
CREATE OR REPLACE VIEW public.push_recipients_at_06 AS
  SELECT
    id              AS user_id,
    language,
    expo_push_token,
    COALESCE(timezone, 'UTC') AS timezone
    FROM public.profiles
   WHERE expo_push_token IS NOT NULL
     AND EXTRACT(HOUR FROM (now() AT TIME ZONE COALESCE(timezone, 'UTC'))) = 6;

-- 본 view 는 service_role 만 select (Edge Function 안에서만 사용 — client 노출 X)
REVOKE ALL ON public.push_recipients_at_06 FROM anon, authenticated;
GRANT  SELECT ON public.push_recipients_at_06 TO service_role;


-- ───────────────────────────────────────────────────────────
-- 4. 발송 기록 (중복 발송 방지)
-- ───────────────────────────────────────────────────────────
-- 같은 사용자에게 같은 날 두 번 발송하지 않도록 ledger.
-- pg_cron 이 한 시간에 한 번 호출되더라도 동일 날짜 record 가 이미 있으면 skip.
CREATE TABLE IF NOT EXISTS public.push_sent_ledger (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sent_date  DATE NOT NULL,            -- 사용자 timezone 기준 어제 날짜
  count      INT  NOT NULL,            -- 발송한 공명 합계
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sent_date)
);

ALTER TABLE public.push_sent_ledger ENABLE ROW LEVEL SECURITY;
-- ledger 는 client 노출 X — service_role 만 read/write.
REVOKE ALL ON public.push_sent_ledger FROM anon, authenticated;
GRANT  ALL  ON public.push_sent_ledger TO service_role;
