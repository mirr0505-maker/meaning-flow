-- 🚀 Meaning Flow — 초기 스키마 (PRD v1.1 5장 기반)
-- 10 테이블 + RLS 활성화 + 5.2 정책 + 인덱스
-- CLAUDE.md M6 데이터 프라이버시: 의미 일기 본인만, 공명방 작성자 식별자 분리

-- ───────────────────────────────────────────────────────────
-- 1. profiles — 사용자 정보 (auth.users 와 1:1)
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  solo_mbti       TEXT NOT NULL CHECK (solo_mbti   IN ('INFP','INFJ','INTP','INTJ')),
  social_mbti     TEXT NOT NULL CHECK (social_mbti IN ('INFP','INFJ','INTP','INTJ')),
  combo_nickname  TEXT NOT NULL,
  language        TEXT NOT NULL DEFAULT 'ko' CHECK (language IN ('ko','en','ja','fr','de')),
  country         TEXT,
  timezone        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- 2. daily_themes — 오늘의 정체성 테마 (1일 1행)
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.daily_themes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  theme_text  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
CREATE INDEX idx_daily_themes_user_date ON public.daily_themes(user_id, date DESC);

-- ───────────────────────────────────────────────────────────
-- 3. tasks — 할 일 (status: pending / done_70 / done_full / skipped)
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  micro_action  TEXT,                                                 -- 2분 마이크로 변환 결과
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','done_70','done_full','skipped')),
  scheduled_for DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_user_scheduled ON public.tasks(user_id, scheduled_for);

-- ───────────────────────────────────────────────────────────
-- 4. reflections — 의미 일기 (1일 1행)
--    CLAUDE.md M6 핵심: 본인만 read/write
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.reflections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date                DATE NOT NULL,
  reflection_text     TEXT,
  language            TEXT NOT NULL DEFAULT 'ko',
  shared_to_resonance BOOLEAN NOT NULL DEFAULT false,                 -- 공명방 흘려보냄 여부
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
CREATE INDEX idx_reflections_user_date ON public.reflections(user_id, date DESC);

-- ───────────────────────────────────────────────────────────
-- 5. thought_vault — 밤 모드 생각 보관함 (자이가르닉 차단용)
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.thought_vault (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  thought_text  TEXT NOT NULL,
  captured_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  source        TEXT                                                  -- 'night_vault' / 'inspiration_5min' 등
);
CREATE INDEX idx_thought_vault_user ON public.thought_vault(user_id, captured_at DESC);

-- ───────────────────────────────────────────────────────────
-- 6. resonance_posts — 공명방 게시물 (원문 그대로 저장, 최대 200자)
--    CLAUDE.md M3: 작성자 식별자(user_id)는 server에만, client 쿼리에서 SELECT 제외
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.resonance_posts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content           TEXT NOT NULL CHECK (char_length(content) <= 200),
  language          TEXT NOT NULL,
  combo_nickname    TEXT NOT NULL,                                    -- 조합 닉네임 스냅샷 (작성 시점)
  status            TEXT NOT NULL DEFAULT 'visible'
                      CHECK (status IN ('visible','hidden','removed','pending_review')),
  moderation_score  REAL,                                             -- OpenAI Moderation score
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_resonance_posts_created  ON public.resonance_posts(created_at DESC) WHERE status = 'visible';
CREATE INDEX idx_resonance_posts_language ON public.resonance_posts(language, created_at DESC) WHERE status = 'visible';

-- ───────────────────────────────────────────────────────────
-- 7. resonances — 공명 액션 (한 사용자는 한 게시물에 1회만)
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.resonances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.resonance_posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id)       ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
CREATE INDEX idx_resonances_post ON public.resonances(post_id);
CREATE INDEX idx_resonances_user ON public.resonances(user_id, created_at DESC);

-- ───────────────────────────────────────────────────────────
-- 8. translations — 번역 캐시 (같은 (post, target_lang) 1회만 API 호출)
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.translations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES public.resonance_posts(id) ON DELETE CASCADE,
  source_lang     TEXT NOT NULL,
  target_lang     TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  provider        TEXT NOT NULL CHECK (provider IN ('deepl','google')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, target_lang)
);
CREATE INDEX idx_translations_post ON public.translations(post_id, target_lang);

-- ───────────────────────────────────────────────────────────
-- 9. reports — 신고 (한 신고자는 한 게시물에 1회만)
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID NOT NULL REFERENCES public.resonance_posts(id) ON DELETE CASCADE,
  reporter_id   UUID NOT NULL REFERENCES public.profiles(id)       ON DELETE CASCADE,
  reason        TEXT NOT NULL CHECK (reason IN ('abuse_hate','spam','self_harm','other')),
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','reviewed','dismissed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, reporter_id)
);
CREATE INDEX idx_reports_post ON public.reports(post_id);

-- ───────────────────────────────────────────────────────────
-- 10. prompt_templates — 시간대·조합·언어별 프롬프트 (시스템 콘텐츠)
-- ───────────────────────────────────────────────────────────
CREATE TABLE public.prompt_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_zone     TEXT NOT NULL CHECK (time_zone IN ('morning','day','evening','night')),
  category      TEXT NOT NULL,                                        -- 'identity_question' / 'reflection_prompt' 등
  solo_mbti     TEXT CHECK (solo_mbti   IN ('INFP','INFJ','INTP','INTJ')),
  social_mbti   TEXT CHECK (social_mbti IN ('INFP','INFJ','INTP','INTJ')),
  language      TEXT NOT NULL DEFAULT 'ko',
  template      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prompt_templates_lookup ON public.prompt_templates(time_zone, language);

-- ═══════════════════════════════════════════════════════════
-- RLS 활성화 (모든 테이블)
-- automatic RLS 옵션이 켜져 있어도 명시적으로 한 번 더 — 멱등성
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_themes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thought_vault    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resonance_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resonances       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- RLS 정책 (PRD 5.2)
-- ═══════════════════════════════════════════════════════════

-- profiles: 본인만 read/write (id = auth.uid())
CREATE POLICY "profiles_self_read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- daily_themes / tasks / reflections / thought_vault: 본인만 (user_id = auth.uid())
CREATE POLICY "daily_themes_self_all"  ON public.daily_themes  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_self_all"         ON public.tasks         FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reflections_self_all"   ON public.reflections   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "thought_vault_self_all" ON public.thought_vault FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- resonance_posts: 모두 read (visible 만), 본인만 insert/update/delete
CREATE POLICY "resonance_posts_public_read"  ON public.resonance_posts FOR SELECT USING (status = 'visible');
CREATE POLICY "resonance_posts_self_insert"  ON public.resonance_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resonance_posts_self_update"  ON public.resonance_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "resonance_posts_self_delete"  ON public.resonance_posts FOR DELETE USING (auth.uid() = user_id);

-- resonances: 본인이 누른 것만 본인 view (작성자에게는 합계만 — application layer COUNT 또는 별도 RPC)
CREATE POLICY "resonances_self_read"   ON public.resonances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "resonances_self_insert" ON public.resonances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resonances_self_delete" ON public.resonances FOR DELETE USING (auth.uid() = user_id);

-- translations: 모두 read (캐시 공유). client write 금지 → Edge Function 이 service_role 로만 INSERT
CREATE POLICY "translations_public_read" ON public.translations FOR SELECT USING (true);

-- reports: 본인이 신고한 것만 view, 본인만 insert
CREATE POLICY "reports_self_read"   ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "reports_self_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- prompt_templates: 모두 read (시스템 콘텐츠), client write 금지
CREATE POLICY "prompt_templates_public_read" ON public.prompt_templates FOR SELECT USING (true);
