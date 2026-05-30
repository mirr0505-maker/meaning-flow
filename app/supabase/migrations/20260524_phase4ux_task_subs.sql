-- ═══════════════════════════════════════════════════════════
-- Phase 4 UI/UX — 본 일 + 세부 일 3개 까지 (자식 task)
-- 2026-05-24
--
-- 사용자 결정 (2026-05-24): 실행 모드에서 본 일 한 가지 + 세부 일 최대 3개.
-- 세부 일은 본 일의 자식 task (parent_id 로 연결). 각각 체크 가능.
--
-- 데이터 모델:
--   parent_id NULL  = 본 일 (top-level)
--   parent_id 값    = 세부 일 (자식)
--
-- 기존 micro_action 컬럼은 backward compat 유지 (NULL 허용, deprecated).
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS parent_id UUID NULL REFERENCES public.tasks(id) ON DELETE CASCADE;

-- 조회 성능 — 같은 부모의 자식 빠르게
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON public.tasks(parent_id) WHERE parent_id IS NOT NULL;

-- 확인:
--   SELECT id, parent_id, title, status FROM public.tasks ORDER BY created_at DESC LIMIT 10;
