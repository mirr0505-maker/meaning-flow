// 🚀 Phase 3 STEP 3-A — Edge Function: resonance_publish
// 의미 일기 → 공명방 게시 흐름. M4 핵심 게이트.
//
// 1. 호출자 인증 확인 (Authorization: Bearer <user JWT>)
// 2. OpenAI Moderation API 호출 (omni-moderation-latest) — 키 없으면 mock pass
// 3. flagged === true 면 resonance_posts INSERT 거부 + 부드러운 안내 카피 키 반환
//    (작성자 reflections 일기는 client 가 별도로 보존 — 이 함수는 게시만)
// 4. 통과 시 service_role 로 resonance_posts INSERT (RLS 우회 — combo_nickname 스냅샷)
//
// Deno runtime — Supabase Edge Functions 표준.
// Deploy: npx supabase functions deploy resonance_publish --project-ref nmxiaxiafcudmuadptah

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.1";

// CORS — Expo 웹/모바일 모두 호출 가능하게
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  content: string;
  language: string;
  combo_nickname: string;          // profiles 에서 받아 client 가 같이 보냄 — Edge Function 에서 재검증 가능
}

interface OpenAIModerationResponse {
  results: Array<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }>;
}

Deno.serve(async (req) => {
  try {
    return await handle(req);
  } catch (e) {
    // unhandled exception 은 운영 logs 에 기록 + client 엔 unknown error
    const msg = (e as Error)?.message ?? String(e);
    console.error("[resonance_publish] unhandled:", msg, (e as Error)?.stack);
    return json({ ok: false, error: "unhandled_exception", message_key: "garden.unknownError" }, 500);
  }
});

async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")    return json({ ok: false, error: "method_not_allowed" }, 405);

  // ─── 1. 인증 ───
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ ok: false, error: "auth_required" }, 401);

  const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY      = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supaUser = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await supaUser.auth.getUser();
  if (authErr || !user) return json({ ok: false, error: "auth_invalid" }, 401);

  // ─── 2. 입력 검증 ───
  let body: RequestBody;
  try { body = await req.json() as RequestBody; }
  catch { return json({ ok: false, error: "bad_json" }, 400); }

  const content = (body.content ?? "").trim();
  const language = body.language ?? "ko";
  const combo_nickname = body.combo_nickname ?? "combos.unknown";

  if (!content) return json({ ok: false, error: "empty_content" }, 400);
  if (content.length > 200) return json({ ok: false, error: "too_long" }, 400);

  // ─── 3. OpenAI Moderation (키 없으면 mock pass) ───
  const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
  let modScore = 0;
  let modBlocked = false;
  let modFlagged: string[] = [];

  if (OPENAI_KEY) {
    try {
      const r = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_KEY}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({ input: content, model: "omni-moderation-latest" }),
      });
      if (!r.ok) {
        // OpenAI 장애 시: 안전 측으로 차단 (M4 — 실패 시 차단 우선)
        return json({ ok: false, error: "moderation_unavailable", message_key: "garden.moderationDown" }, 503);
      }
      const mod = await r.json() as OpenAIModerationResponse;
      const res = mod.results?.[0];
      modBlocked = !!res?.flagged;
      modFlagged = res ? Object.entries(res.categories).filter(([, v]) => v).map(([k]) => k) : [];
      modScore = res ? Math.max(...Object.values(res.category_scores ?? {})) : 0;
    } catch {
      return json({ ok: false, error: "moderation_unavailable", message_key: "garden.moderationDown" }, 503);
    }
  } else {
    // mock 모드 — 매우 단순한 키워드 가드만 (개발용)
    const banned = ["kill yourself", "fuck you", "씨발", "죽어"];
    modBlocked = banned.some((w) => content.toLowerCase().includes(w));
    modFlagged = modBlocked ? ["mock_keyword"] : [];
  }

  // ─── 4. 차단 시 부드러운 안내 ───
  if (modBlocked) {
    return json({
      ok: false,
      error: "moderation_blocked",
      message_key: "garden.moderationBlocked",
      categories: modFlagged,
    }, 200);   // 200 OK — UI 에서 부드럽게 표시
  }

  // ─── 5. INSERT — user JWT 로 호출 → RLS `resonance_posts_self_insert` (auth.uid() = user_id) 통과
  //    M4 핵심 (moderation_score 등 server-only 필드) 은 Edge Function 안에서만 채워지므로
  //    client 가 우회 불가. user JWT INSERT 로 충분.
  const { data, error } = await supaUser
    .from("resonance_posts")
    .insert({
      user_id: user.id,
      content,
      language,
      combo_nickname,
      moderation_score: modScore,
      status: "visible",
    })
    .select("id, created_at")
    .single();

  if (error) return json({ ok: false, error: "insert_failed", detail: error.message }, 500);

  return json({ ok: true, post_id: data.id, created_at: data.created_at }, 200);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
