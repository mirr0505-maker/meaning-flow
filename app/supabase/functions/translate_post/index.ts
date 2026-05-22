// 🚀 Phase 3 STEP 3-D-1 — Edge Function: translate_post
// PRD 3.4 / CLAUDE.md M5 — 원문 우선 + 온디맨드 번역 + 영구 캐싱 + 월 100회 한도
//
// 흐름:
//   1. auth (user JWT) 검증
//   2. 입력: { post_id, target_lang }
//   3. translations 테이블 cache hit? → 캐시 그대로 반환 (quota 차감 X, 외부 API 0회)
//   4. miss → quota 검증 (월 100회 한도)
//   5. resonance_feed VIEW 에서 원문·source_lang 조회
//   6. source == target 이면 원문 그대로 반환 (캐시도 안 만듦)
//   7. DeepL 호출 → 실패 시 Google 폴백
//   8. INSERT translations (UNIQUE 충돌은 다른 동시 요청이 먼저 INSERT — race 일 때 cache 재조회)
//   9. UPSERT translation_quota (count++)
//
// Mock 모드: DEEPL/GOOGLE secret 둘 다 없으면 "[mock-translated] " prefix 로 즉시 반환

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.1";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MONTHLY_LIMIT = 100;

// DeepL 미지원 언어 (DeepL Free 기준 — 한국·일·영·프·독 모두 지원, fallback 거의 발생 안 함)
const DEEPL_SUPPORTED = new Set(["EN","DE","FR","IT","JA","KO","ZH","ES","PT","NL","PL","RU","BG","CS","DA","EL","ET","FI","HU","ID","LT","LV","NB","RO","SK","SL","SV","TR","UK"]);

interface RequestBody {
  post_id: string;
  target_lang: string;       // 'ko' / 'en' / 'ja' / ...
}

Deno.serve(async (req) => {
  try { return await handle(req); }
  catch (e) {
    const msg = (e as Error)?.message ?? String(e);
    console.error("[translate_post] unhandled:", msg, (e as Error)?.stack);
    return json({ ok: false, error: "unhandled_exception", message_key: "garden.translate.unknownError" }, 500);
  }
});

async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")    return json({ ok: false, error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ ok: false, error: "auth_required" }, 401);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;
  const DEEPL_KEY    = Deno.env.get("DEEPL_AUTH_KEY");
  const GOOGLE_KEY   = Deno.env.get("GOOGLE_TRANSLATE_API_KEY");

  const supa = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  // ─── auth ───
  const { data: { user }, error: authErr } = await supa.auth.getUser();
  if (authErr || !user) return json({ ok: false, error: "auth_invalid" }, 401);

  // ─── input ───
  let body: RequestBody;
  try { body = await req.json() as RequestBody; }
  catch { return json({ ok: false, error: "bad_json" }, 400); }

  const postId = body.post_id;
  const targetLangRaw = (body.target_lang ?? "").toLowerCase();
  const targetLang = targetLangRaw.split("-")[0];               // 'en-US' → 'en'
  if (!postId || !targetLang) return json({ ok: false, error: "missing_fields" }, 400);

  // ─── 1. cache hit ───
  const cached = await supa
    .from("translations")
    .select("translated_text, provider, source_lang, created_at")
    .eq("post_id", postId)
    .eq("target_lang", targetLang)
    .maybeSingle();
  if (cached.data) {
    return json({
      ok: true,
      translated_text: cached.data.translated_text,
      provider:        cached.data.provider,
      cache:           true,
      source_lang:     cached.data.source_lang,
    });
  }

  // ─── 2. 원문 조회 (resonance_feed VIEW 가 user_id 비노출) ───
  const post = await supa
    .from("resonance_feed")
    .select("content, language")
    .eq("id", postId)
    .maybeSingle();
  if (!post.data) return json({ ok: false, error: "post_not_found" }, 404);

  const sourceLang = post.data.language.toLowerCase();
  if (sourceLang === targetLang) {
    return json({
      ok: true,
      translated_text: post.data.content,
      provider:        "noop",
      cache:           false,
      source_lang:     sourceLang,
    });
  }

  // ─── 3. quota 검증 ───
  const ym = new Date().toISOString().slice(0, 7);              // 'YYYY-MM'
  const q = await supa
    .from("translation_quota")
    .select("count")
    .eq("user_id", user.id)
    .eq("year_month", ym)
    .maybeSingle();
  const used = q.data?.count ?? 0;
  if (used >= MONTHLY_LIMIT) {
    return json({
      ok: false,
      error: "quota_exceeded",
      message_key: "garden.translate.quotaExceeded",
      quota: { used, limit: MONTHLY_LIMIT },
    }, 200);
  }

  // ─── 4. 번역 (DeepL → Google → mock) ───
  let translated: string | null = null;
  let provider: "deepl" | "google" | "mock" | null = null;

  if (DEEPL_KEY && DEEPL_SUPPORTED.has(targetLang.toUpperCase())) {
    translated = await callDeepL(post.data.content, sourceLang, targetLang, DEEPL_KEY);
    if (translated) provider = "deepl";
  }
  if (!translated && GOOGLE_KEY) {
    translated = await callGoogle(post.data.content, sourceLang, targetLang, GOOGLE_KEY);
    if (translated) provider = "google";
  }
  if (!translated && !DEEPL_KEY && !GOOGLE_KEY) {
    // 두 key 다 없으면 mock — UI 검증용
    translated = `[mock-${sourceLang}→${targetLang}] ${post.data.content}`;
    provider = "mock";
  }
  if (!translated || !provider) {
    return json({ ok: false, error: "translation_failed", message_key: "garden.translate.providerDown" }, 503);
  }

  // ─── 5. INSERT translations (mock 은 캐싱 안 함) ───
  if (provider !== "mock") {
    const ins = await supa
      .from("translations")
      .insert({
        post_id: postId,
        source_lang: sourceLang,
        target_lang: targetLang,
        translated_text: translated,
        provider,
      })
      .select("translated_text, provider")
      .single();
    // UNIQUE 충돌 시 다른 요청이 먼저 INSERT — 캐시 재조회
    if (ins.error && (ins.error as any).code === "23505") {
      const refetch = await supa
        .from("translations")
        .select("translated_text, provider")
        .eq("post_id", postId)
        .eq("target_lang", targetLang)
        .single();
      if (refetch.data) {
        translated = refetch.data.translated_text;
        provider = refetch.data.provider as typeof provider;
        // 동시성으로 인한 race — quota 도 차감 안 함 (이 사용자는 새 번역 안 만든 셈)
        return json({ ok: true, translated_text: translated, provider, cache: true, source_lang: sourceLang });
      }
    }
  }

  // ─── 6. quota++ (mock 도 차감 — 사용자에겐 체감 동일) ───
  await supa.from("translation_quota").upsert(
    { user_id: user.id, year_month: ym, count: used + 1, updated_at: new Date().toISOString() },
    { onConflict: "user_id,year_month" },
  );

  return json({
    ok: true,
    translated_text: translated,
    provider,
    cache: false,
    source_lang: sourceLang,
    quota: { used: used + 1, limit: MONTHLY_LIMIT },
  });
}

// ─── DeepL ───
// Free 키는 endpoint 가 api-free.deepl.com (Pro 는 api.deepl.com). key 끝의 ':fx' 로 판별.
async function callDeepL(text: string, source: string, target: string, key: string): Promise<string | null> {
  const isFree = key.endsWith(":fx");
  const url = isFree ? "https://api-free.deepl.com/v2/translate"
                     : "https://api.deepl.com/v2/translate";
  const params = new URLSearchParams();
  params.append("text", text);
  params.append("target_lang", target.toUpperCase());
  if (source && source !== "auto") params.append("source_lang", source.toUpperCase());
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${key}`,
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    if (!r.ok) return null;
    const data = await r.json() as { translations?: Array<{ text: string }> };
    return data.translations?.[0]?.text ?? null;
  } catch { return null; }
}

// ─── Google Translate (v2) ───
async function callGoogle(text: string, source: string, target: string, key: string): Promise<string | null> {
  try {
    const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: source || undefined, target, format: "text" }),
    });
    if (!r.ok) return null;
    const data = await r.json() as { data?: { translations?: Array<{ translatedText: string }> } };
    return data.data?.translations?.[0]?.translatedText ?? null;
  } catch { return null; }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
