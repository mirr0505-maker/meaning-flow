// 🚀 Phase 4 UI/UX — 회고 > 단추 (예약·완료한 첫 단추 + 사용 횟수, 밝은 차분 톤)

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import { fetchTopFirsts, type FirstOption } from "../../lib/firsts";

export function ReviewFirsts({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<FirstOption[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTopFirsts(userId, 20)
      .then((rows: FirstOption[]) => { if (!cancelled) setItems(rows); })
      .catch((e: unknown) => !cancelled && setErr(e instanceof Error ? e.message : String(e)));
    return () => { cancelled = true; };
  }, [userId]);

  const localeCode =
    i18n.language.startsWith("ja") ? "ja-JP" :
    i18n.language.startsWith("en") ? "en-US" : "ko-KR";

  return (
    <View className="px-6 pt-2 pb-6">
      <Text className="text-mute text-xs tracking-widest mb-3">{t("review.firsts.eyebrow")}</Text>
      <Text className="text-ink text-base font-medium mb-1">{t("review.firsts.title")}</Text>
      <Text className="text-mute text-[11px] leading-relaxed italic mb-5">{t("review.firsts.intro")}</Text>

      {items === null && !err && (
        <View className="items-center py-12"><ActivityIndicator color="#5C5A53" /></View>
      )}

      {err && (
        <View className="rounded-card border border-hair bg-paper p-4">
          <Text className="text-mute text-xs">{err}</Text>
        </View>
      )}

      {items && items.length === 0 && (
        <Text className="text-mute text-xs italic text-center py-12 leading-relaxed">
          {t("review.firsts.empty")}
        </Text>
      )}

      {items && items.length > 0 && items.map((opt) => (
        <View key={opt.title} className="rounded-card border border-hair bg-paper p-3.5 mb-2 flex-row items-center">
          <View className="flex-1">
            <Text className="text-ink text-sm leading-relaxed">{opt.title}</Text>
            {opt.last_used && (
              <Text className="text-mute text-[11px] mt-0.5">
                {t("review.firsts.lastUsed", {
                  date: new Date(opt.last_used).toLocaleDateString(localeCode, { month: "short", day: "numeric" }),
                })}
              </Text>
            )}
          </View>
          <View className="rounded-pill bg-paper-warm px-2.5 py-1 ml-2 border border-hair">
            <Text className="text-ink-soft text-[11px]">×{opt.count}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
