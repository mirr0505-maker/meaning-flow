// 🚀 Phase 4 STEP 4-H — Edge Function: account_delete
// PRD 5.2 / CLAUDE.md M6 / Apple App Store Guideline 5.1.1(v) + GDPR 17조
//
// 호출자의 auth.uid() 로 본인 계정만 영구 삭제.
//   1. Authorization header 의 user JWT 로 본인 확인
//   2. service_role 권한으로 auth.admin.deleteUser(user.id) — auth.users row 삭제
//   3. 초기 스키마 ([20260521143033_initial_schema.sql]) 의 모든 FK 가 ON DELETE CASCADE 라
//      profiles · reflections · thought_vault · tasks · resonance_posts · resonances ·
//      reports · translation_quota · push_sent_ledger 모두 자동 cascade 삭제
//   4. client 는 sign-out + onboarding 으로 이동
//
// 다른 사용자 데이터에 영향 없음 — 단지 본인 row 들만 cascade. M6 유지.
//
// Deploy: npx supabase functions deploy account_delete --project-ref nmxiaxiafcudmuadptah

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.1";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")    return json({ ok: false, error: "method_not_allowed" }, 405);

  // 1. 본인 확인 — user JWT 필수 (service_role 만으론 어떤 user 삭제할지 모름)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ ok: false, error: "auth_required" }, 401);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SERVICE_ROLE) return json({ ok: false, error: "service_role_missing" }, 500);

  const supaUser = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await supaUser.auth.getUser();
  if (authErr || !user) return json({ ok: false, error: "auth_invalid" }, 401);

  // 2. service_role 권한으로 본인 row 삭제 — cascade FK 가 나머지 처리
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return json({ ok: false, error: "delete_failed", detail: delErr.message }, 500);

  return json({ ok: true, deleted_user_id: user.id }, 200);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
