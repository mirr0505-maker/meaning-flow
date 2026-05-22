-- 🚀 Meaning Flow — anon / authenticated 역할에 SQL-level 권한 부여
-- 배경: 프로젝트 생성 시 "Automatically expose new tables" 옵션을 끔.
--       → 새 테이블에 GRANT 가 자동 부여되지 않음 → REST API 호출이 401.
-- RLS 는 행 단위 필터일 뿐, 그 이전에 PostgreSQL GRANT 가 통과해야 한다.

-- ───────────────────────────────────────────────────────────
-- 1) 공개 read 테이블 — anon + authenticated 모두 SELECT
--    (RLS 정책으로 추가 필터: resonance_posts.status='visible' 등)
-- ───────────────────────────────────────────────────────────
GRANT SELECT ON public.prompt_templates TO anon, authenticated;
GRANT SELECT ON public.resonance_posts  TO anon, authenticated;
GRANT SELECT ON public.translations     TO anon, authenticated;

-- ───────────────────────────────────────────────────────────
-- 2) 본인 데이터 테이블 — authenticated 만 (anon 금지)
--    RLS 정책이 auth.uid() 로 본인 행만 통과시킴
-- ───────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_themes   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflections    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.thought_vault  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resonances     TO authenticated;

-- ───────────────────────────────────────────────────────────
-- 3) 공명방 게시물 — read 는 anon 도, write 는 authenticated 만
-- ───────────────────────────────────────────────────────────
GRANT INSERT, UPDATE, DELETE ON public.resonance_posts TO authenticated;

-- ───────────────────────────────────────────────────────────
-- 4) 신고 — authenticated 가 본인 신고만 INSERT/SELECT (RLS 가 보장)
-- ───────────────────────────────────────────────────────────
GRANT SELECT, INSERT ON public.reports TO authenticated;

-- 참고: translations / prompt_templates 의 INSERT 는 Edge Function 이
-- service_role 키로 호출하므로 anon/authenticated 에 GRANT 하지 않는다.
