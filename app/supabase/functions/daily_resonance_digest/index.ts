// 🚀 Phase 3 STEP 3-G-2 — Edge Function: daily_resonance_digest
// PRD 4.5 F-RES-003 — 작성자에게 어제 공명 합산 알림 1일 1회
//
// 호출 흐름:
//   1. pg_cron 이 매시간 정각 (0분) 에 본 함수 invoke (service_role JWT 자동 주입)
//   2. push_recipients_at_06 view 조회 — 현재 사용자 timezone 06시 매치 + push_token NOT NULL
//   3. 각 사용자별:
//      a. push_sent_ledger 에 오늘 날짜 record 있으면 skip (중복 발송 차단)
//      b. get_yesterday_resonance_for_user(user_id) RPC → 합계 N
//      c. N === 0 이면 skip (M1 — 0 알림 안 보냄)
//      d. Expo Push HTTP API 호출 (https://exp.host/--/api/v2/push/send)
//      e. push_sent_ledger INSERT
//
// M3 정합: 알림 본문엔 합계 N 만, 공명한 사용자 id/닉네임 절대 노출 X.
// M1 정합: N=0 케이스 자동 skip → "오늘은 공명 0이에요" 같은 압박 카피 절대 안 나감.
//
// i18n: profiles.language 기준으로 카피 선택. ko/en/ja 만 (M5 — fr/de 는 Phase 5+).
//
// Deploy: npx supabase functions deploy daily_resonance_digest --project-ref nmxiaxiafcudmuadptah
// pg_cron 등록은 사용자 측 Supabase Studio 에서 별도 SQL 실행 (본 파일 하단 주석 참조).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.1";

import { pushBodyFor, yesterdayInTz } from "./_helpers.ts";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Recipient {
  user_id: string;
  language: string;
  expo_push_token: string;
  timezone: string;
}

async function sendExpoPush(
  token: string,
  title: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        title,
        body,
        sound: "default",
        priority: "default",
      }),
    });
    if (!res.ok) return { ok: false, error: `expo_http_${res.status}` };
    const data = await res.json();
    if (data?.data?.status === "error") return { ok: false, error: data.data?.message ?? "expo_error" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  // service_role 권한으로 동작 — pg_cron 호출 또는 수동 invoke 만 허용
  const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SERVICE_ROLE) {
    return new Response(
      JSON.stringify({ ok: false, error: "service_role_missing" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // 1. 현재 시각이 사용자 timezone 06시 인 사용자 list
  const { data: recipients, error: recErr } = await admin
    .from("push_recipients_at_06")
    .select("*") as { data: Recipient[] | null; error: any };

  if (recErr) {
    return new Response(
      JSON.stringify({ ok: false, error: "recipients_query_failed", detail: recErr.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  const results: Array<{ user_id: string; status: string; count?: number; error?: string }> = [];

  for (const r of recipients ?? []) {
    const yest = yesterdayInTz(r.timezone);

    // 2a. 이미 보냈는지 확인
    const { data: ledger } = await admin
      .from("push_sent_ledger")
      .select("user_id")
      .eq("user_id", r.user_id)
      .eq("sent_date", yest)
      .maybeSingle();
    if (ledger) {
      results.push({ user_id: r.user_id, status: "skipped_duplicate" });
      continue;
    }

    // 2b. 어제 공명 합계
    const { data: countData, error: countErr } = await admin.rpc(
      "get_yesterday_resonance_for_user",
      { p_user: r.user_id },
    );
    if (countErr) {
      results.push({ user_id: r.user_id, status: "rpc_failed", error: countErr.message });
      continue;
    }
    const count = (countData as number) ?? 0;

    // 2c. N=0 skip (M1)
    if (count === 0) {
      results.push({ user_id: r.user_id, status: "skipped_zero", count: 0 });
      continue;
    }

    // 2d. Expo Push
    const { title, body } = pushBodyFor(r.language, count);
    const sendRes = await sendExpoPush(r.expo_push_token, title, body);
    if (!sendRes.ok) {
      results.push({ user_id: r.user_id, status: "send_failed", count, error: sendRes.error });
      continue;
    }

    // 2e. ledger INSERT
    await admin.from("push_sent_ledger").insert({
      user_id:   r.user_id,
      sent_date: yest,
      count,
    });

    results.push({ user_id: r.user_id, status: "sent", count });
  }

  return new Response(
    JSON.stringify({ ok: true, processed: results.length, results }),
    { headers: { ...CORS, "Content-Type": "application/json" } },
  );
});

// ───────────────────────────────────────────────────────────
// pg_cron 등록 SQL (사용자 측 Supabase Studio 에서 실행)
// ───────────────────────────────────────────────────────────
// ⚠ Supabase managed Postgres 에선 postgres user 가 superuser 아님 →
//   ALTER DATABASE ... SET ... 는 permission denied. Vault 사용이 정공법.
//
// -- 1. extension 활성화
// CREATE EXTENSION IF NOT EXISTS pg_cron;
// CREATE EXTENSION IF NOT EXISTS pg_net;
// CREATE EXTENSION IF NOT EXISTS supabase_vault;
//
// -- 2. service_role key 를 Vault 에 저장
// --    (Dashboard → Settings → API → "service_role" key 값)
// SELECT vault.create_secret('<SUPABASE_SERVICE_ROLE_KEY 값>', 'service_role_key');
//
// -- 3. 매시간 정각에 본 Edge Function 호출 (Vault 에서 key 동적 조회)
// SELECT cron.schedule(
//   'daily_resonance_digest_hourly',
//   '0 * * * *',                                    -- 매시간 정각
//   $$
//   SELECT net.http_post(
//     url     := 'https://nmxiaxiafcudmuadptah.supabase.co/functions/v1/daily_resonance_digest',
//     headers := jsonb_build_object(
//       'Content-Type',  'application/json',
//       'Authorization', 'Bearer ' || (
//         SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'
//       )
//     ),
//     body    := '{}'::jsonb
//   );
//   $$
// );
//
// -- 확인
// SELECT jobname, schedule, active FROM cron.job;
// SELECT name, created_at FROM vault.decrypted_secrets WHERE name = 'service_role_key';
// ───────────────────────────────────────────────────────────
