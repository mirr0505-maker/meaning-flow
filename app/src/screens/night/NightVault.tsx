// 🚀 🌙 NightVault — 생각 보관함 (PRD 4.4 F-NIT-001)
// 자이가르닉 차단: 머릿속 미완료 작업을 외부 칩으로 옮겨 수면 방해 차단.
// 잠금은 시각 상태만 — 실제 데이터는 thought_vault 에 영구. 본인이 다음 날 다시 볼 수 있게.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { addThought, fetchVault, removeThought, type Thought } from "../../lib/thoughtVault";

export function NightVault({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [thoughts, setThoughts] = useState<Thought[] | null>(null);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchVault(userId)
      .then((v) => !cancelled && setThoughts(v))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => { cancelled = true; };
  }, [userId]);

  async function handleAdd() {
    const text = input.trim();
    if (!text || locked) return;
    setInput("");
    try {
      const created = await addThought({ userId, text, source: "night_vault" });
      setThoughts((prev) => (prev ? [created, ...prev] : [created]));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setInput(text); // 실패 시 텍스트 복원
    }
  }

  async function handleRemove(id: string) {
    if (locked) return;
    const backup = thoughts;
    setThoughts((prev) => (prev ? prev.filter((x) => x.id !== id) : prev));
    try {
      await removeThought(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setThoughts(backup ?? null); // 롤백
    }
  }

  return (
    <View>
      <Text className="text-night-ink italic font-light" style={{ fontSize: 19, lineHeight: 28 }}>
        {t("flow.night.vault.lead")}
      </Text>

      <View
        className={
          "mt-5 rounded-card border bg-night-bg2 p-4 " +
          (locked ? "border-night-soft" : "border-night-hair")
        }
      >
        <View className="flex-row items-center mb-3">
          <View
            className={
              "w-7 h-7 rounded-md items-center justify-center mr-2.5 border " +
              (locked ? "bg-night-soft border-night-soft" : "bg-night-bg3 border-night-hair")
            }
          >
            <Text className={(locked ? "text-night-bg" : "text-night-muted") + " text-xs"}>
              {locked ? "🔒" : "🔓"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-night-muted text-[10px] tracking-widest font-medium">
              {t("flow.night.vault.brand")}
            </Text>
            <Text className="text-night-ink text-xs mt-0.5">
              {thoughts === null
                ? t("flow.loading")
                : t("flow.night.vault.count", { count: thoughts.length })}
            </Text>
          </View>
        </View>

        {/* 보관 칩들 */}
        {thoughts === null && (
          <View className="items-center py-6">
            <ActivityIndicator color="#C9C5DE" />
          </View>
        )}

        {thoughts !== null && thoughts.length === 0 && (
          <Text className="text-night-muted text-xs italic py-3">
            {t("flow.night.vault.empty")}
          </Text>
        )}

        {thoughts !== null && thoughts.length > 0 && (
          <View className="flex-row flex-wrap" style={{ gap: 6, minHeight: 40 }}>
            {thoughts.map((th) => (
              <Pressable
                key={th.id}
                onPress={() => handleRemove(th.id)}
                disabled={locked}
                className="rounded-pill border border-night-hair bg-night-bg3 px-3 py-1.5"
              >
                <Text className="text-night-ink text-xs">{th.thought_text}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* 입력 */}
        <View className="mt-4 flex-row" style={{ gap: 8 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t("flow.night.vault.placeholder")}
            placeholderTextColor="#7E7E92"
            editable={!locked}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            style={{
              flex: 1,
              height: 38,
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#2D2E3A",
              backgroundColor: "#14151C",
              color: "#E8E6E0",
              fontSize: 13,
            }}
          />
          <Pressable
            onPress={handleAdd}
            disabled={!input.trim() || locked}
            className={
              "rounded-pill border border-night-hair bg-night-bg3 items-center justify-center px-4 " +
              (!input.trim() || locked ? "opacity-30" : "")
            }
            style={{ height: 38 }}
          >
            <Text className="text-night-ink text-xs">{t("flow.night.vault.addBtn")}</Text>
          </Pressable>
        </View>
      </View>

      {/* 잠금 / 해제 */}
      <Pressable
        onPress={() => setLocked(!locked)}
        className={
          "mt-4 rounded-card items-center justify-center " +
          (locked ? "border border-night-hair bg-night-bg2" : "bg-night-ink")
        }
        style={{ height: 50 }}
      >
        <Text className={(locked ? "text-night-soft" : "text-night-bg") + " text-sm font-medium"}>
          🔒 {locked ? t("flow.night.vault.locked") : t("flow.night.vault.lockBtn")}
        </Text>
      </Pressable>

      {error && (
        <Text className="text-night-muted text-xs mt-3 italic">
          {t("flow.loadError")}: {error}
        </Text>
      )}
    </View>
  );
}
