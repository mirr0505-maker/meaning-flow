// 🚀 Phase 4 UI/UX — 회고 > 보관 (thought_vault 시간순, 밝은 차분 톤)

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { fetchVault, type Thought } from "../../lib/thoughtVault";

export function ReviewVault({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Thought[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchVault(userId, 50)
      .then((rows: Thought[]) => { if (!cancelled) setItems(rows); })
      .catch((e: unknown) => !cancelled && setErr(e instanceof Error ? e.message : String(e)));
    return () => { cancelled = true; };
  }, [userId]);

  const localeCode =
    i18n.language.startsWith("ja") ? "ja-JP" :
    i18n.language.startsWith("en") ? "en-US" : "ko-KR";

  return (
    <View className="px-6 pt-2 pb-6">
      <Text className="text-mute text-xs tracking-widest mb-3">{t("review.vault.eyebrow")}</Text>
      <Text className="text-ink text-base font-medium mb-1">{t("review.vault.title")}</Text>
      <Text className="text-mute text-[11px] leading-relaxed italic mb-5">{t("review.vault.intro")}</Text>

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
          {t("review.vault.empty")}
        </Text>
      )}

      {items && items.length > 0 && items.map((th) => (
        <View key={th.id} className="rounded-card border border-hair bg-paper p-3.5 mb-2">
          <View className="flex-row items-center mb-1">
            <Text className="text-mute text-[11px]">
              {new Date(th.captured_at).toLocaleDateString(localeCode, { month: "short", day: "numeric" })}
            </Text>
            {th.source === "inspiration_5min" && (
              <View className="flex-row items-center ml-2">
                <Feather name="clock" size={10} color="#7FA37F" style={{ marginRight: 2 }} />
                <Text className="text-leaf text-[10px]">{t("review.vault.from5min")}</Text>
              </View>
            )}
          </View>
          <Text className="text-ink text-sm leading-relaxed">{th.thought_text}</Text>
        </View>
      ))}
    </View>
  );
}
