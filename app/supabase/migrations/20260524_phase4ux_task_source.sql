-- ═══════════════════════════════════════════════════════════
-- Phase 4 UI/UX — tasks.source 컬럼 (NightFirst vs DayAction 구분)
-- 2026-05-24
--
-- 사용자 결정: 착륙 모드 "지금까지" 리스트엔 첫단추(NightFirst) 만 노출.
-- 실행 모드 task 는 제외.
--
-- source 값:
--   'night_first' = NightFirst 에서 예약한 첫단추 (다음날 morning 노출)
--   NULL          = 일반 실행 모드 task (또는 마이그레이션 이전 데이터)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS source TEXT NULL
    CHECK (source IS NULL OR source IN ('night_first', 'day_action'));

-- 조회 성능 — first button 통계 쿼리용
CREATE INDEX IF NOT EXISTS idx_tasks_user_source
  ON public.tasks(user_id, source)
  WHERE source = 'night_first';

-- 확인:
--   SELECT source, COUNT(*) FROM public.tasks GROUP BY source;
