// 🚀 Phase 4 UI/UX — 회고 > 완료 (과거 done tasks, 밝은 차분 톤)

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import { fetchPastDoneTasks, type Task } from "../../lib/tasks";

export function ReviewDoneTasks({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Task[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPastDoneTasks(userId, 50)
      .then((rows: Task[]) => { if (!cancelled) setItems(rows); })
      .catch((e: unknown) => !cancelled && setErr(e instanceof Error ? e.message : String(e)));
    return () => { cancelled = true; };
  }, [userId]);

  const localeCode =
    i18n.language.startsWith("ja") ? "ja-JP" :
    i18n.language.startsWith("en") ? "en-US" : "ko-KR";

  return (
    <View className="px-6 pt-2 pb-6">
      <Text className="text-mute text-xs tracking-widest mb-3">{t("review.tasks.eyebrow")}</Text>
      <Text className="text-ink text-base font-medium mb-1">{t("review.tasks.title")}</Text>
      <Text className="text-mute text-[11px] leading-relaxed italic mb-5">{t("review.tasks.intro")}</Text>

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
          {t("review.tasks.empty")}
        </Text>
      )}

      {items && items.length > 0 && items.map((task) => {
        const isFull = task.status === "done_full";
        return (
          <View key={task.id} className="rounded-card border border-hair bg-paper p-3.5 mb-2">
            <View className="flex-row items-center mb-1">
              <Text className={(isFull ? "text-ink" : "text-leaf") + " text-xs mr-2"}>
                {isFull ? "✓✓" : "✓"}
              </Text>
              <Text className="text-mute text-[11px]">
                {task.scheduled_for
                  ? new Date(task.scheduled_for).toLocaleDateString(localeCode, { month: "short", day: "numeric" })
                  : ""}
              </Text>
            </View>
            <Text
              className="text-ink-soft text-sm leading-relaxed"
              style={{ textDecorationLine: "line-through" }}
            >
              {task.title}
            </Text>
            {task.micro_action && (
              <Text className="text-mute text-[11px] mt-1 italic">↳ {task.micro_action}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
