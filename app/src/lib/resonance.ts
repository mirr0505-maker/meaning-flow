// 🚀 Phase 3 — 공명방 client helper
// PRD 4.5 / CLAUDE.md M3·M4·M5
//
// publishToGarden  — STEP 3-A : Edge Function 호출 (Moderation → INSERT)
// fetchFeed        — STEP 3-B : VIEW resonance_feed SELECT (user_id 비노출)
// toggleResonance  — STEP 3-C : RPC toggle_resonance (UNIQUE 충돌 회피)
// getResonanceCount/hasResonated — STEP 3-C : 보조 RPC
//
// DEV mock: EXPO_PUBLIC_RESONANCE_MOCK=1 → Edge Function 미배포 환경에서도 UI 흐름 검증 가능.

import { track } from "./posthog";
import { supabase } from "./supabase";

const MOCK = process.env.EXPO_PUBLIC_RESONANCE_MOCK === "1";

export type DuplicateExisting = {
  id: string;
  content: string;
  language: string;
  created_at: string;
};

export type PublishResult =
  | { ok: true; postId: string; updated?: boolean }
  | { ok: false; reason: "moderation_blocked" | "moderation_unavailable" | "too_long" | "empty" | "auth" | "network" | "unknown"; messageKey: string; categories?: string[] }
  // 백로그 ⑥ (b): 같은 user/today row 존재 — client 가 "이미 있어요, 수정할까요?" 모달 노출
  | { ok: false; reason: "duplicate_today"; existing: DuplicateExisting };

export type FeedPost = {
  id: string;
  content: string;
  language: string;
  combo_nickname: string;
  created_at: string;
  resonance_count: number;
};

export type FeedFilter = "world" | "same_combo" | "same_language";

// ─── STEP 3-A : 공명방 게시 ───
// overwrite=true 면 같은 user/today row 를 덮어쓰기 (백로그 ⑥ 정책 b 의 "수정해서 보낼게요" 분기).
export async function publishToGarden(args: {
  content: string;
  language: string;
  combo_nickname: string;
  overwrite?: boolean;
}): Promise<PublishResult> {
  const content = args.content.trim();
  if (!content)               return { ok: false, reason: "empty",    messageKey: "flow.evening.savedPrivate" };
  if (content.length > 200)   return { ok: false, reason: "too_long", messageKey: "flow.evening.charHint" };

  if (MOCK) {
    return { ok: true, postId: "mock-" + Date.now(), updated: !!args.overwrite };
  }

  try {
    const { data, error } = await supabase.functions.invoke<{
      ok: boolean;
      post_id?: string;
      updated?: boolean;
      error?: string;
      message_key?: string;
      categories?: string[];
      existing?: DuplicateExisting;
    }>("resonance_publish", { body: args });

    if (error)        return { ok: false, reason: "network", messageKey: "garden.networkError" };
    if (!data?.ok) {
      const r = data?.error;
      if (r === "duplicate_today" && data?.existing) {
        return { ok: false, reason: "duplicate_today", existing: data.existing };
      }
      const reason =
        r === "moderation_blocked"     ? "moderation_blocked"     :
        r === "moderation_unavailable" ? "moderation_unavailable" :
        r === "auth_required" || r === "auth_invalid" ? "auth"    :
                                         "unknown";
      if (reason === "moderation_blocked") track("moderation_blocked");   // M4 빈도 — 본문 X
      return { ok: false, reason, messageKey: data?.message_key ?? "garden.unknownError", categories: data?.categories };
    }
    track("garden_published", { language: args.language });   // M6: 본문 X
    return { ok: true, postId: data.post_id!, updated: data.updated };
  } catch {
    return { ok: false, reason: "network", messageKey: "garden.networkError" };
  }
}

// ─── STEP 3-B : 피드 ───
export async function fetchFeed(args: {
  filter: FeedFilter;
  selfLanguage: string;
  selfComboNickname: string;
  cursor?: string;             // ISO created_at — 이전 페이지 마지막 row 의 시각
  pageSize?: number;           // 기본 20 (PRD 무한스크롤 금지)
}): Promise<FeedPost[]> {
  if (MOCK) return MOCK_FEED.slice(0, args.pageSize ?? 20);

  let q = supabase
    .from("resonance_feed")
    .select("id, content, language, combo_nickname, created_at, resonance_count")
    .order("created_at", { ascending: false })
    .limit(args.pageSize ?? 20);

  if (args.cursor)              q = q.lt("created_at", args.cursor);
  if (args.filter === "same_language") q = q.eq("language",       args.selfLanguage);
  if (args.filter === "same_combo")    q = q.eq("combo_nickname", args.selfComboNickname);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as FeedPost[];
}

// ─── STEP 3-C : 공명 액션 ───
export async function toggleResonance(postId: string): Promise<boolean> {
  if (MOCK) return true;
  const { data, error } = await supabase.rpc("toggle_resonance", { p_post_id: postId });
  if (error) throw error;
  if (data) track("garden_resonated");   // 켰을 때만 (해제 제외)
  return !!data;
}

export async function getResonanceCount(postId: string): Promise<number> {
  if (MOCK) return Math.floor(Math.random() * 12);
  const { data, error } = await supabase.rpc("get_resonance_count", { p_post_id: postId });
  if (error) throw error;
  return (data as number) ?? 0;
}

export async function hasResonated(postId: string): Promise<boolean> {
  if (MOCK) return false;
  const { data, error } = await supabase.rpc("has_resonated", { p_post_id: postId });
  if (error) throw error;
  return !!data;
}

// ─── Mock 데이터 (5개국 — src/garden-me.jsx 디자인 프로토타입 톤 반영) ───
const MOCK_FEED: FeedPost[] = [
  { id: "mock-1", content: "오늘은 그냥 하늘만 봤다. 근데 그게 충분했다.",      language: "ko", combo_nickname: "combos.infpIntj", created_at: new Date(Date.now() - 1 * 3600_000).toISOString(), resonance_count: 7 },
  { id: "mock-2", content: "Silence held me longer than any conversation did.",    language: "en", combo_nickname: "combos.intpInfj", created_at: new Date(Date.now() - 3 * 3600_000).toISOString(), resonance_count: 3 },
  { id: "mock-3", content: "今日は何もしなかった。それで十分だった。",            language: "ja", combo_nickname: "combos.infpInfj", created_at: new Date(Date.now() - 5 * 3600_000).toISOString(), resonance_count: 12 },
  { id: "mock-4", content: "Ein Gedanke, der mich nicht verlassen wollte.",        language: "de", combo_nickname: "combos.intjInfj", created_at: new Date(Date.now() - 8 * 3600_000).toISOString(), resonance_count: 1 },
  { id: "mock-5", content: "J'ai fait moins. C'était plus.",                       language: "fr", combo_nickname: "combos.intpIntj", created_at: new Date(Date.now() - 14 * 3600_000).toISOString(), resonance_count: 5 },
];
