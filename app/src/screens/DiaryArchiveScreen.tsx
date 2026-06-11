// 🚀 Phase 4 UI/UX STEP 3 — 의미 일기 아카이브 (본인 흐름 다시 보기)
// 사용자 결정 2026-05-23: 30일 후에도 본인 흐름 다시 볼 수 있게.
// CLAUDE.md M1: 통계·완료율 X. CLAUDE.md M6: 본인만 read.
//
// 진입점: EveningTabs 의 새 탭 "내 흐름" 또는 SettingsScreen 메뉴.
// 디자인: PRD 7.3 패턴 — 20개+더보기, 정확 시각 X (날짜만), 빈 화면 따뜻하게.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { fetchMyReflections, type Reflection } from "../lib/reflections";
import { modeColors } from "../lib/theme";

const PAGE_SIZE = 20;

export function DiaryArchiveScreen({ userId, dark = false }: { userId: string; dark?: boolean }) {
  const { t, i18n } = useTranslation();
  const c = modeColors(dark);
  const [items, setItems] = useState<Reflection[] | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyReflections({ userId, pageSize: PAGE_SIZE })
      .then((rows) => {
        if (cancelled) return;
        setItems(rows);
        setHasMore(rows.length === PAGE_SIZE);
      })
      .catch((e) => !cancelled && setErr(e instanceof Error ? e.message : String(e)));
    return () => { cancelled = true; };
  }, [userId]);

  async function handleMore() {
    if (!items || items.length === 0 || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await fetchMyReflections({
        userId,
        cursorDate: items[items.length - 1].date,
        pageSize: PAGE_SIZE,
      });
      setItems([...items, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingMore(false);
    }
  }

  const localeCode =
    i18n.language.startsWith("ja") ? "ja-JP" :
    i18n.language.startsWith("en") ? "en-US" : "ko-KR";

  return (
    <View className="px-6 pt-2 pb-6">
      <Text className={c.mute + " text-xs tracking-widest mb-3"}>
        {t("diary.eyebrow")}
      </Text>
      <Text className={c.ink + " text-base font-medium mb-1"}>
        {t("diary.title")}
      </Text>
      <Text className={c.mute + " text-[11px] mb-5 leading-relaxed italic"}>
        {t("diary.intro")}
      </Text>

      {items === null && !err && (
        <View className="items-center py-12"><ActivityIndicator color="#C9C5DE" /></View>
      )}

      {err && (
        <View className={`rounded-card border p-4 ${c.cardBorder} ${c.cardBg}`}>
          <Text className={c.ink + " text-sm"}>{t("diary.loadError")}</Text>
          <Text className={c.mute + " text-xs mt-1"}>{err}</Text>
        </View>
      )}

      {items && items.length === 0 && (
        <Text className={c.mute + " text-xs italic text-center py-12 leading-relaxed"}>
          {t("diary.empty")}
        </Text>
      )}

      {items && items.length > 0 && (
        <View>
          {items.map((r) => (
            <View key={r.id} className={`rounded-card border p-4 mb-2.5 ${c.cardBorder} ${c.cardBg}`}>
              <View className="flex-row items-center mb-2">
                <Text className={c.mute + " text-[11px]"}>
                  {new Date(r.date).toLocaleDateString(localeCode, { year: "numeric", month: "long", day: "numeric" })}
                </Text>
                {r.shared_to_resonance && (
                  <Text className="text-leaf style-[10px] ml-2">🌿 {t("diary.sharedBadge")}</Text>
                )}
              </View>
              <Text className={c.ink + " text-sm italic leading-relaxed"}>
                {r.reflection_text ?? "—"}
              </Text>
            </View>
          ))}

          {hasMore && (
            <Pressable
              onPress={handleMore}
              disabled={loadingMore}
              className={`mt-3 rounded-pill border items-center justify-center ${c.cardBorder} ${c.cardBg}`}
              style={{ height: 44 }}
            >
              <Text className={c.inkSoft + " text-xs"}>
                {loadingMore ? t("diary.loadingMore") : t("diary.more")}
              </Text>
            </Pressable>
          )}
          {!hasMore && items.length > 0 && (
            <Text className={c.mute + " text-[11px] text-center mt-4 italic"}>
              {t("diary.endOfList")}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
