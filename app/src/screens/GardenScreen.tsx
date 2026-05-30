// 🚀 🌿 공명의 정원 (GardenScreen) — PRD 4.5 F-RES-002 + 4.5 F-RES-003
// 시간순 20개 + 더보기 + 필터 칩 (전 세계 / 같은 조합 / 같은 언어)
// CLAUDE.md M3: VIEW resonance_feed 로 user_id 노출 차단
// CLAUDE.md M7: 진입 시 면책 카피 상시 노출

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { Profile } from "../lib/profiles";
import { fetchFeed, type FeedFilter, type FeedPost } from "../lib/resonance";
import { GardenPostCard } from "./garden/GardenPostCard";
import { PushToggleCard } from "./garden/PushToggleCard";

const PAGE_SIZE = 20;

const FILTERS: FeedFilter[] = ["world", "same_combo", "same_language"];

// 언어 코드 → 국기 (PRD 7.3)
const FLAG: Record<string, string> = {
  ko: "🇰🇷", en: "🇺🇸", ja: "🇯🇵", fr: "🇫🇷", de: "🇩🇪",
};

export function GardenScreen({ profile }: { profile: Profile }) {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<FeedFilter>("world");
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 필터 바뀔 때마다 처음부터
  useEffect(() => {
    let cancelled = false;
    setPosts(null);
    setHasMore(true);
    setErr(null);
    fetchFeed({
      filter,
      selfLanguage: i18n.language.split("-")[0] ?? "ko",
      selfComboNickname: profile.combo_nickname ?? "combos.unknown",
      pageSize: PAGE_SIZE,
    })
      .then((rows) => {
        if (cancelled) return;
        setPosts(rows);
        setHasMore(rows.length === PAGE_SIZE);
      })
      .catch((e) => !cancelled && setErr(e instanceof Error ? e.message : String(e)));
    return () => { cancelled = true; };
  }, [filter, i18n.language, profile.combo_nickname, profile.id]);

  async function handleMore() {
    if (!posts || posts.length === 0 || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await fetchFeed({
        filter,
        selfLanguage: i18n.language.split("-")[0] ?? "ko",
        selfComboNickname: profile.combo_nickname ?? "combos.unknown",
        cursor: posts[posts.length - 1].created_at,
        pageSize: PAGE_SIZE,
      });
      setPosts([...posts, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <View className="px-6 pt-2 pb-6">
      {/* M7 면책 — 상시 */}
      <View className="rounded-card border border-night-hair bg-dusk-card p-3 mb-4">
        <Text className="text-night-soft text-[11px] leading-relaxed">
          {t("garden.disclaimer")}
        </Text>
      </View>

      {/* 알림 토글 — M3 능동적 진입: 기본 OFF, 사용자가 의지로 ON */}
      <PushToggleCard userId={profile.id} />

      {/* 필터 칩 — 3개 */}
      <View className="flex-row mb-4" style={{ gap: 6 }}>
        {FILTERS.map((f) => {
          const on = f === filter;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={
                "px-3 py-1.5 rounded-pill border " +
                (on ? "bg-night-bg3 border-night-soft" : "border-night-hair")
              }
            >
              <Text className={(on ? "text-night-ink" : "text-night-muted") + " text-xs"}>
                {t(`garden.filter.${f}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 로딩·에러 */}
      {posts === null && !err && (
        <View className="items-center py-12"><ActivityIndicator color="#C9C5DE" /></View>
      )}
      {err && (
        <View className="rounded-card border border-night-hair bg-dusk-card p-4">
          <Text className="text-night-ink text-sm">{t("garden.feedError")}</Text>
          <Text className="text-night-muted text-xs mt-1">{err}</Text>
        </View>
      )}

      {/* 빈 상태 */}
      {posts && posts.length === 0 && (
        <Text className="text-night-muted text-xs italic text-center py-12 leading-relaxed">
          {t("garden.empty")}
        </Text>
      )}

      {/* 카드 리스트 */}
      {posts && posts.length > 0 && (
        <View>
          {posts.map((p) => {
            const sl = i18n.language.split("-")[0] ?? "ko";
            return (
              <GardenPostCard
                key={p.id}
                post={p}
                flag={FLAG[p.language] ?? "🌍"}
                isOwnLang={p.language === sl}
                selfLang={sl}
              />
            );
          })}

          {/* 무한 스크롤 금지 — 더 보기 버튼 (PRD 7.3) */}
          {hasMore && (
            <Pressable
              onPress={handleMore}
              disabled={loadingMore}
              className="mt-3 rounded-pill border border-night-hair bg-night-bg2 items-center justify-center"
              style={{ height: 44 }}
            >
              <Text className="text-night-soft text-xs">
                {loadingMore ? t("garden.loadingMore") : t("garden.more")}
              </Text>
            </Pressable>
          )}
          {!hasMore && posts.length > 0 && (
            <Text className="text-night-muted text-[11px] text-center mt-4 italic">
              {t("garden.endOfFeed")}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
