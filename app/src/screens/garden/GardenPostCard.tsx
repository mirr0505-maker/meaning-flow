// 🚀 🌿 공명방 게시 카드 — PRD 4.5 F-RES-003 + 3-D 번역
// 카드: 국기 + 조합 닉네임 + 대략적 시각 + content + `🌍 번역` + `🌿 N` 공명 토글
// CLAUDE.md M3: 작성자 식별자 노출 금지 — 닉네임만 (resonance_feed VIEW 가 user_id 제외)
// CLAUDE.md M5: 원문 우선 — 번역은 사용자가 누를 때만, 영구 캐싱

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { getResonanceCount, hasResonated, toggleResonance, type FeedPost } from "../../lib/resonance";
import { fetchTranslation, type TranslateResult } from "../../lib/translation";
import { ReportModal } from "./ReportModal";

export function GardenPostCard({ post, flag, isOwnLang, selfLang }: {
  post: FeedPost;
  flag: string;
  isOwnLang: boolean;
  selfLang: string;                   // 'ko' / 'en' / 'ja' — 본인 UI 언어
}) {
  const { t } = useTranslation();
  const [count, setCount] = useState(post.resonance_count);
  const [resonated, setResonated] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  // 번역 상태 — null=원문 모드, "loading"=요청 중, TranslateResult=결과
  const [translation, setTranslation] = useState<null | "loading" | TranslateResult>(null);

  // 신고 모달
  const [reportOpen, setReportOpen] = useState(false);
  const [hidden, setHidden] = useState(false);   // 본인이 신고 완료 후 카드 숨김

  // 본인이 이미 공명했는지 (효율 위해 RPC 1회 호출)
  useEffect(() => {
    let cancelled = false;
    hasResonated(post.id)
      .then((v) => !cancelled && setResonated(v))
      .catch(() => !cancelled && setResonated(false));
    return () => { cancelled = true; };
  }, [post.id]);

  async function handleTranslate() {
    // 이미 번역 결과 표시 중 → 원문으로 되돌리기
    if (translation && translation !== "loading") {
      setTranslation(null);
      return;
    }
    if (translation === "loading") return;
    setTranslation("loading");
    const res = await fetchTranslation({ postId: post.id, targetLang: selfLang });
    setTranslation(res);
  }

  async function handleToggle() {
    if (pending || resonated === null) return;
    setPending(true);
    const prev = resonated;
    setResonated(!prev);                   // optimistic
    setCount((c) => c + (prev ? -1 : 1));
    try {
      const now = await toggleResonance(post.id);
      setResonated(now);
      const fresh = await getResonanceCount(post.id);
      setCount(fresh);
    } catch {
      // 롤백
      setResonated(prev);
      setCount((c) => c + (prev ? 1 : -1));
    } finally {
      setPending(false);
    }
  }

  // 본인이 신고 완료한 글은 시각적으로 숨김 (해당 신고가 처리되기 전까지 본인 화면에서만)
  if (hidden) {
    return (
      <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-3 items-center">
        <Text className="text-night-muted text-xs italic">{t("garden.report.hiddenFromYou")}</Text>
      </View>
    );
  }

  return (
    <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-3">
      {/* eyebrow — 국기 + 조합 닉네임 + 대략적 시각 + ⋯ 신고 */}
      <View className="flex-row items-center mb-2">
        <Text style={{ fontSize: 14 }}>{flag}</Text>
        <Text className="text-night-muted text-[11px] tracking-wide ml-2 flex-1" numberOfLines={1}>
          {t(post.combo_nickname)}
        </Text>
        <Text className="text-night-muted text-[10px] mr-2">{roughTime(post.created_at, t)}</Text>
        <Pressable
          onPress={() => setReportOpen(true)}
          hitSlop={8}
          className="px-1.5"
          accessibilityLabel={t("garden.report.openMenu")}
        >
          <Text className="text-night-muted text-xs">⋯</Text>
        </Pressable>
      </View>

      <ReportModal
        visible={reportOpen}
        postId={post.id}
        selfLang={selfLang}
        onClose={() => setReportOpen(false)}
        onSubmitted={() => { setReportOpen(false); setHidden(true); }}
      />

      {/* 본문 — 원문 우선 (M5). 번역 결과가 있고 ok 면 그쪽 표시 */}
      <Text
        className="text-night-ink"
        style={{ fontSize: 15, lineHeight: 24 }}
      >
        {translation && translation !== "loading" && translation.ok ? translation.text : post.content}
      </Text>

      {/* 🌍 번역 버튼 — 다른 언어 게시물에만 노출. 토글로 원문↔번역 전환 */}
      {!isOwnLang && (
        <View className="mt-2 flex-row items-center" style={{ gap: 8 }}>
          <Pressable
            onPress={handleTranslate}
            disabled={translation === "loading"}
            className="rounded-pill border border-night-hair px-2.5 py-1 flex-row items-center"
          >
            {translation === "loading" ? (
              <ActivityIndicator color="#7E7E92" size="small" />
            ) : (
              <Text className="text-night-soft text-[11px]">
                {translation && translation.ok
                  ? `📄 ${t("garden.translate.showOriginal")}`
                  : `🌍 ${t("garden.translate.translateBtn")}`}
              </Text>
            )}
          </Pressable>
          {/* provider · cache 표시 */}
          {translation && translation !== "loading" && translation.ok && (
            <Text className="text-night-muted text-[10px] italic">
              {translation.cache
                ? t("garden.translate.providerCache", { provider: translation.provider })
                : t("garden.translate.providerFresh", { provider: translation.provider })}
            </Text>
          )}
          {/* 실패 안내 (한도/제공자 다운 등) */}
          {translation && translation !== "loading" && !translation.ok && (
            <Text className="text-night-muted text-[10px] italic flex-1">
              {t(translation.messageKey)}
            </Text>
          )}
        </View>
      )}

      {/* 공명 액션 + 합계 — STEP 3-C */}
      <View className="flex-row items-center mt-3 pt-3 border-t border-night-hair">
        <Pressable
          onPress={handleToggle}
          disabled={pending || resonated === null}
          className={
            "rounded-pill border px-3 py-1.5 " +
            (resonated
              ? "bg-leaf/30 border-leaf"
              : "border-night-hair")
          }
        >
          <Text className={(resonated ? "text-leaf-soft" : "text-night-soft") + " text-xs"}>
            🌿 {t(resonated ? "garden.resonated" : "garden.resonate")}
          </Text>
        </Pressable>
        <Text className="text-night-muted text-[11px] ml-3">
          {t("garden.resonanceCount", { count })}
        </Text>
      </View>
    </View>
  );
}

// 대략적 시각 — "오늘 저녁", "어제", "n일 전" — PRD 표시 안 함: 정확한 시각
function roughTime(iso: string, t: (k: string, p?: Record<string, unknown>) => string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffH < 1)  return t("garden.time.justNow");
  if (diffH < 6)  return t("garden.time.hoursAgo", { h: diffH });
  if (diffH < 12) return t("garden.time.today");
  if (diffD < 1)  return t("garden.time.todayEvening");
  if (diffD < 2)  return t("garden.time.yesterday");
  if (diffD < 7)  return t("garden.time.daysAgo", { d: diffD });
  return t("garden.time.longAgo");
}
