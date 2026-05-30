// 🚀 Phase 3 STEP 3-D-2 — 번역 client helper
// PRD 3.4 / CLAUDE.md M5
//
// fetchTranslation — 우선 client 측 캐시 SELECT, miss 시 Edge Function translate_post 호출
// fetchQuota       — 본인 이번 달 사용량
//
// DEV mock: EXPO_PUBLIC_TRANSLATE_MOCK=1 → Edge Function 미배포 환경에서도 UI 검증 가능

import { track } from "./posthog";
import { supabase } from "./supabase";

const MOCK = process.env.EXPO_PUBLIC_TRANSLATE_MOCK === "1";

export type TranslateProvider = "deepl" | "google" | "mock" | "noop";
export type TranslateFailReason = "quota_exceeded" | "provider_down" | "post_not_found" | "auth" | "network" | "unknown";

export type TranslateResult =
  | { ok: true;  text: string; provider: TranslateProvider; cache: boolean; sourceLang: string; quota?: { used: number; limit: number } }
  | { ok: false; reason: TranslateFailReason; messageKey: string; quota?: { used: number; limit: number } };

export async function fetchTranslation(args: {
  postId: string;
  targetLang: string;
}): Promise<TranslateResult> {
  if (MOCK) {
    return {
      ok: true,
      text: `[mock→${args.targetLang}] (cache: pretend)`,
      provider: "mock",
      cache: false,
      sourceLang: "??",
    };
  }

  // 1) client 측 캐시 SELECT — 같은 게시물 같은 언어 번역이 이미 있으면 외부 호출 0
  const cached = await supabase
    .from("translations")
    .select("translated_text, provider, source_lang")
    .eq("post_id", args.postId)
    .eq("target_lang", args.targetLang)
    .maybeSingle();

  if (cached.data) {
    return {
      ok: true,
      text:        cached.data.translated_text,
      provider:    cached.data.provider as TranslateProvider,
      cache:       true,
      sourceLang:  cached.data.source_lang,
    };
  }

  // 2) Edge Function 호출 — 내부에서 다시 캐시 검증 + DeepL → Google → INSERT + quota++
  try {
    const { data, error } = await supabase.functions.invoke<{
      ok: boolean;
      translated_text?: string;
      provider?: string;
      cache?: boolean;
      source_lang?: string;
      error?: string;
      message_key?: string;
      quota?: { used: number; limit: number };
    }>("translate_post", {
      body: { post_id: args.postId, target_lang: args.targetLang },
    });

    if (error) return { ok: false, reason: "network", messageKey: "garden.translate.networkError" };
    if (!data?.ok) {
      const r = data?.error;
      const reason: TranslateFailReason =
        r === "quota_exceeded"     ? "quota_exceeded"     :
        r === "translation_failed" ? "provider_down"      :
        r === "post_not_found"     ? "post_not_found"     :
        r === "auth_required" || r === "auth_invalid" ? "auth" :
                                     "unknown";
      return { ok: false, reason, messageKey: data?.message_key ?? "garden.translate.unknownError", quota: data?.quota };
    }
    const result = {
      ok: true as const,
      text:       data.translated_text!,
      provider:   data.provider as TranslateProvider,
      cache:      !!data.cache,
      sourceLang: data.source_lang ?? "??",
      quota:      data.quota,
    };
    track("garden_translated", {
      source_language: result.sourceLang,
      target_language: args.targetLang,
      provider:        result.provider,
      cache:           result.cache,
    });
    return result;
  } catch {
    return { ok: false, reason: "network", messageKey: "garden.translate.networkError" };
  }
}

// 이번 달 사용량 조회 (사용자에게 한도 임박 안내용 — 선택)
export async function fetchTranslationQuota(): Promise<{ used: number; limit: number; ym: string }> {
  if (MOCK) return { used: 0, limit: 100, ym: new Date().toISOString().slice(0, 7) };
  const { data, error } = await supabase.rpc("current_translation_quota");
  if (error) return { used: 0, limit: 100, ym: new Date().toISOString().slice(0, 7) };
  // RPC 가 single row 반환
  const row = Array.isArray(data) ? data[0] : data;
  return {
    used:  (row?.count as number) ?? 0,
    limit: 100,
    ym:    (row?.ym   as string) ?? new Date().toISOString().slice(0, 7),
  };
}
