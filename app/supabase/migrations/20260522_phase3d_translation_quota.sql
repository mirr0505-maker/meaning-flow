-- ═══════════════════════════════════════════════════════════
-- Phase 3 STEP 3-D-0 — 번역 한도 추적
-- 2026-05-22
--
-- PRD 3.4.3: 사용자당 월 100회 번역 한도
-- 단, cache hit (같은 post + target_lang 기존 번역) 은 무료 — quota 차감 안 함
-- Edge Function translate_post 가 cache miss 시 INSERT 직전 quota 검증·차감
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.translation_quota (
  user_id     UUID  NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year_month  TEXT  NOT NULL,             -- 'YYYY-MM' 형식
  count       INT   NOT NULL DEFAULT 0 CHECK (count >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, year_month)
);

COMMENT ON TABLE public.translation_quota IS
  'Phase 3-D: 사용자별 월 번역 한도 추적 (PRD 3.4.3 — 100회/월). cache miss 만 차감.';

-- RLS — 본인 quota 만 SELECT (한도 표시용). INSERT/UPDATE 는 Edge Function (user JWT) 이 처리
ALTER TABLE public.translation_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translation_quota_self_read"   ON public.translation_quota
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "translation_quota_self_insert" ON public.translation_quota
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "translation_quota_self_update" ON public.translation_quota
  FOR UPDATE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.translation_quota TO authenticated;

-- ───────────────────────────────────────────────────────────
-- RPC current_translation_quota — 본인 이번 달 사용량 (UI 표시용)
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_translation_quota()
RETURNS TABLE(count INT, ym TEXT)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT COALESCE(tq.count, 0)::int AS count,
         TO_CHAR(now() AT TIME ZONE 'UTC', 'YYYY-MM') AS ym
  FROM (SELECT TO_CHAR(now() AT TIME ZONE 'UTC', 'YYYY-MM') AS ym) m
  LEFT JOIN public.translation_quota tq
    ON tq.user_id = auth.uid()
    AND tq.year_month = m.ym;
$$;

GRANT EXECUTE ON FUNCTION public.current_translation_quota() TO authenticated;
