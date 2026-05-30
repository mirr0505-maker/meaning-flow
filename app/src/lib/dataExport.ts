// 🚀 Phase 4 STEP 4-K — 데이터 export (GDPR 20조 right to data portability)
// CLAUDE.md M6: reflections·thought_vault·tasks 본인만 read (RLS 정책) → client 직접 query OK.
// resonance_posts 본인 row 만 (user_id = auth.uid()) — 다른 사용자 row 는 RLS 가 차단.
//
// 결과 포맷: JSON. 사용자가 RN Share API 로 공유 시트 호출 → 메일/파일 저장/메시지 등 자유.

import { track } from "./posthog";
import { supabase } from "./supabase";

export type ExportPayload = {
  schema_version: 1;
  exported_at: string;
  user_id: string;
  reflections:     unknown[];
  thought_vault:   unknown[];
  tasks:           unknown[];
  resonance_posts: unknown[];
};

export type ExportResult =
  | { ok: true; payload: ExportPayload; json: string }
  | { ok: false; reason: "auth" | "network" | "unknown"; messageKey: string };

export async function exportMyData(): Promise<ExportResult> {
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { ok: false, reason: "auth", messageKey: "settings.dataExport.error.auth" };
    }

    // 4 테이블 본인 row 동시 조회. RLS 가 본인 row 만 허용.
    const [reflectionsRes, vaultRes, tasksRes, postsRes] = await Promise.all([
      supabase.from("reflections")     .select("*").eq("user_id", user.id),
      supabase.from("thought_vault")   .select("*").eq("user_id", user.id),
      supabase.from("tasks")           .select("*").eq("user_id", user.id),
      supabase.from("resonance_posts") .select("*").eq("user_id", user.id),
    ]);

    if (reflectionsRes.error || vaultRes.error || tasksRes.error || postsRes.error) {
      return { ok: false, reason: "network", messageKey: "settings.dataExport.error.network" };
    }

    const payload: ExportPayload = {
      schema_version: 1,
      exported_at:    new Date().toISOString(),
      user_id:        user.id,
      reflections:     reflectionsRes.data ?? [],
      thought_vault:   vaultRes.data       ?? [],
      tasks:           tasksRes.data       ?? [],
      resonance_posts: postsRes.data       ?? [],
    };

    track("data_exported");
    return { ok: true, payload, json: JSON.stringify(payload, null, 2) };
  } catch {
    return { ok: false, reason: "network", messageKey: "settings.dataExport.error.network" };
  }
}
