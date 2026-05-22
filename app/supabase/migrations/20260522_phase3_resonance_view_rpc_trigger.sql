-- ═══════════════════════════════════════════════════════════
-- Phase 3 STEP 3-0 — M3·M4 안전망 보강
-- 2026-05-22
--
-- 1. VIEW resonance_feed       — client 가 SELECT 할 안전한 view (user_id 제외)
-- 2. RPC get_resonance_count   — 작성자에게도 합계만
-- 3. RPC has_resonated         — 본인이 공명했는지 (효율)
-- 4. RPC toggle_resonance      — 공명 액션 (UNIQUE 위반 회피)
-- 5. TRIGGER auto_hide         — reports 3회 누적 시 status='hidden'
-- 6. GRANT                     — public access
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- 1. VIEW resonance_feed
--    M3 핵심: user_id 컬럼 비노출. status='visible' 자동 필터.
--    resonance_count 는 sub-select 로 조회 (단순 — 큰 부하 시 materialized view 로 승격)
-- ───────────────────────────────────────────────────────────
DROP VIEW IF EXISTS public.resonance_feed;

CREATE VIEW public.resonance_feed
WITH (security_barrier = true, security_invoker = true)
AS
SELECT
  rp.id,
  rp.content,
  rp.language,
  rp.combo_nickname,
  rp.created_at,
  (SELECT COUNT(*)::int FROM public.resonances r WHERE r.post_id = rp.id) AS resonance_count
FROM public.resonance_posts rp
WHERE rp.status = 'visible';

COMMENT ON VIEW public.resonance_feed IS
  'Phase 3 STEP 3-0: M3 차단 — resonance_posts 에서 user_id 컬럼 제외. client 는 이 VIEW 만 SELECT 가능.';

-- ───────────────────────────────────────────────────────────
-- 2. RPC get_resonance_count(post_id)
--    작성자에게도 합계만 노출. 누가 공명했는지 본인 외에 보이면 안 됨.
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_resonance_count(p_post_id UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT COUNT(*)::int
  FROM public.resonances
  WHERE post_id = p_post_id;
$$;

COMMENT ON FUNCTION public.get_resonance_count IS
  'Phase 3 STEP 3-C: 공명 합계만 반환. RLS 우회하지 않음 (SECURITY INVOKER).';

-- ───────────────────────────────────────────────────────────
-- 3. RPC has_resonated(post_id)
--    본인이 이 게시물에 공명했는지. resonances RLS 가 본인만 SELECT 허용하므로
--    그대로 EXISTS 쿼리.
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.has_resonated(p_post_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.resonances
    WHERE post_id = p_post_id AND user_id = auth.uid()
  );
$$;

-- ───────────────────────────────────────────────────────────
-- 4. RPC toggle_resonance(post_id)
--    공명 액션 토글. 이미 누른 상태면 DELETE, 아니면 INSERT.
--    UNIQUE (post_id, user_id) 충돌 회피 + 단일 RPC 로 race condition 방지.
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.toggle_resonance(p_post_id UUID)
RETURNS BOOLEAN                               -- 토글 후 상태 (true = 공명 중, false = 해제)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_existed BOOLEAN;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  DELETE FROM public.resonances
  WHERE post_id = p_post_id AND user_id = v_uid
  RETURNING true INTO v_existed;

  IF v_existed IS NULL THEN
    INSERT INTO public.resonances (post_id, user_id) VALUES (p_post_id, v_uid);
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- ───────────────────────────────────────────────────────────
-- 5. TRIGGER auto_hide_on_reports
--    같은 post_id 에 reports 가 3개 이상이면 status='hidden' (PRD F-RES-005)
--    자해(reason='self_harm') 는 1회만으로도 'pending_review' 로 즉시 분리 — Phase 3-E 에서 워크플로 추가
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_auto_hide_on_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER                              -- resonance_posts.UPDATE 권한 필요 (RLS 우회)
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  -- 자해 신고는 1회만 있어도 즉시 pending_review
  IF NEW.reason = 'self_harm' THEN
    UPDATE public.resonance_posts
    SET status = 'pending_review'
    WHERE id = NEW.post_id AND status = 'visible';
    RETURN NEW;
  END IF;

  -- 일반 신고 3회 누적 시 hidden
  SELECT COUNT(*) INTO v_count FROM public.reports WHERE post_id = NEW.post_id;
  IF v_count >= 3 THEN
    UPDATE public.resonance_posts
    SET status = 'hidden'
    WHERE id = NEW.post_id AND status = 'visible';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_hide_on_reports ON public.reports;
CREATE TRIGGER trg_auto_hide_on_reports
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_hide_on_reports();

-- ───────────────────────────────────────────────────────────
-- 6. GRANT — VIEW + RPC 를 anon/authenticated 가 호출 가능하게
-- ───────────────────────────────────────────────────────────
GRANT SELECT ON public.resonance_feed                                  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_resonance_count(UUID)             TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_resonated(UUID)                   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_resonance(UUID)                TO authenticated;     -- anonymous 도 인증되어 있으므로 authenticated 만
