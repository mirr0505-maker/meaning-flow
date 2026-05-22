// 🚀 Phase 3 STEP 3-E — 공명방 신고 client helper
// PRD 4.5 F-RES-005 / CLAUDE.md M4
//
// reports 테이블 + trigger fn_auto_hide_on_reports 은 이미 셋업 (3-0 migration):
//   - reason 'self_harm' 1회만 있어도 status='pending_review' 즉시 분리
//   - 일반 신고 3회 누적 시 status='hidden' 자동
//
// 본 lib 는 단순 INSERT + 본인이 이미 신고했는지 확인만.
// 자해 사유 선택 시 client 가 위기 자원 모달 표시 (3-E-3) — 신고는 그와 별개로 INSERT 통과.

import { supabase } from "./supabase";

export type ReportReason = "abuse_hate" | "spam" | "self_harm" | "other";
export const REPORT_REASONS: ReportReason[] = ["abuse_hate", "spam", "self_harm", "other"];

export type ReportResult =
  | { ok: true; alreadyReported?: boolean }
  | { ok: false; reason: "already_reported" | "auth" | "network" | "unknown"; messageKey: string };

export async function submitReport(args: {
  postId: string;
  reason: ReportReason;
}): Promise<ReportResult> {
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { ok: false, reason: "auth", messageKey: "garden.report.authError" };
    }

    const { error } = await supabase
      .from("reports")
      .insert({
        post_id: args.postId,
        reporter_id: user.id,
        reason: args.reason,
      });

    // UNIQUE(post_id, reporter_id) 위반 — 같은 사용자 같은 글 중복 신고
    if (error && (error as any).code === "23505") {
      return { ok: false, reason: "already_reported", messageKey: "garden.report.alreadyReported" };
    }
    if (error) {
      return { ok: false, reason: "network", messageKey: "garden.report.networkError" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "network", messageKey: "garden.report.networkError" };
  }
}

// 본인이 이 게시물을 이미 신고했는지 — UI 에서 중복 신고 버튼 disabled 처리용
export async function hasReported(postId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("reports")
    .select("id")
    .eq("post_id", postId)
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

// ─── 위기 자원 데이터 (M4 / M7) ───
// 국가별 핫라인 — 사용자 i18n.language 기준 매핑.
// MVP: ko/en/ja 만. 다른 언어는 international fallback.
export type CrisisResource = {
  hotlines: { name: string; phone: string; hours?: string; note?: string }[];
  textLine?: { name: string; phone: string; note?: string };
  webNoticeKey: string;     // i18n key for region-specific guidance
};

export function crisisResourcesFor(lang: string): CrisisResource {
  switch (lang.split("-")[0]) {
    case "ko":
      return {
        hotlines: [
          { name: "자살예방상담전화", phone: "1393",        hours: "24시간" },
          { name: "정신건강위기상담", phone: "1577-0199",   hours: "24시간" },
          { name: "청소년전화",       phone: "1388",        hours: "24시간" },
        ],
        webNoticeKey: "garden.crisis.notice_ko",
      };
    case "ja":
      return {
        hotlines: [
          { name: "よりそいホットライン", phone: "0120-279-338", hours: "24時間" },
          { name: "いのちの電話",         phone: "0570-783-556", hours: "10:00–22:00" },
        ],
        webNoticeKey: "garden.crisis.notice_ja",
      };
    case "en":
    default:
      return {
        hotlines: [
          { name: "988 Suicide & Crisis Lifeline (US)", phone: "988",            hours: "24/7" },
          { name: "Crisis Text Line (US)",              phone: "Text HOME to 741741", note: "Text-based" },
          { name: "Befrienders Worldwide",              phone: "befrienders.org", note: "Find a local helpline" },
        ],
        webNoticeKey: "garden.crisis.notice_en",
      };
  }
}
