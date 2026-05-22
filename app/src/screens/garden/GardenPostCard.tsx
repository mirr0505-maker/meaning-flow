// 🚀 🌿 공명방 게시 카드 — PRD 4.5 F-RES-003
// 카드: 국기 + 조합 닉네임 + 대략적 시각 + content + `🌿 N` 공명 토글
// CLAUDE.md M3: 작성자 식별자 노출 금지 — 닉네임만 (resonance_feed VIEW 가 user_id 제외)
// CLAUDE.md M5: 원문 우선 — 번역은 사용자가 누를 때만 (STEP 3-D 에서 추가)

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { getResonanceCount, hasResonated, toggleResonance, type FeedPost } from "../../lib/resonance";

export function GardenPostCard({ post, flag, isOwnLang }: {
  post: FeedPost;
  flag: string;
  isOwnLang: boolean;
}) {
  const { t } = useTranslation();
  const [count, setCount] = useState(post.resonance_count);
  const [resonated, setResonated] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  // 본인이 이미 공명했는지 (효율 위해 RPC 1회 호출)
  useEffect(() => {
    let cancelled = false;
    hasResonated(post.id)
      .then((v) => !cancelled && setResonated(v))
      .catch(() => !cancelled && setResonated(false));
    return () => { cancelled = true; };
  }, [post.id]);

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

  return (
    <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-3">
      {/* eyebrow — 국기 + 조합 닉네임 + 대략적 시각 */}
      <View className="flex-row items-center mb-2">
        <Text style={{ fontSize: 14 }}>{flag}</Text>
        <Text className="text-night-muted text-[11px] tracking-wide ml-2 flex-1" numberOfLines={1}>
          {t(post.combo_nickname)}
        </Text>
        <Text className="text-night-muted text-[10px]">{roughTime(post.created_at, t)}</Text>
      </View>

      {/* 본문 — 원문 우선 (M5). 번역 버튼은 STEP 3-D 추가 */}
      <Text
        className="text-night-ink"
        style={{ fontSize: 15, lineHeight: 24 }}
      >
        {post.content}
      </Text>

      {/* 다른 언어면 향후 🌍 번역 버튼 자리 (STEP 3-D — 키 미발급 시 disabled placeholder) */}
      {!isOwnLang && (
        <Text className="text-night-muted text-[10px] italic mt-2">
          🌍 {t("garden.translateComingSoon")}
        </Text>
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
