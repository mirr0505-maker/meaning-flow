import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import type { DuplicateExisting } from "../../lib/resonance";

export function DuplicatePromptCard({
  existing,
  onOverwrite,
  onKeep,
}: {
  existing: DuplicateExisting;
  onOverwrite: () => void;
  onKeep: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="mt-6 rounded-card border border-night-hair bg-dusk-card p-5">
      <Text className="text-night-ink text-sm font-medium">
        {t("garden.duplicateToday.title")}
      </Text>
      <Text className="text-night-soft text-xs mt-2 leading-relaxed">
        {t("garden.duplicateToday.intro")}
      </Text>

      {/* 기존 글 preview */}
      <View className="mt-4 rounded-card border border-night-hair bg-night-bg3 p-3">
        <Text className="text-night-muted text-[11px] mb-1">
          {t("garden.duplicateToday.existingLabel")}
        </Text>
        <Text className="text-night-ink text-sm italic" style={{ lineHeight: 22 }}>
          {existing.content}
        </Text>
      </View>

      <Pressable
        onPress={onOverwrite}
        className="mt-5 rounded-pill bg-night-ink items-center justify-center"
        style={{ height: 44 }}
      >
        <Text className="text-night-bg text-sm font-medium">
          {t("garden.duplicateToday.overwrite")}
        </Text>
      </Pressable>
      <Pressable onPress={onKeep} className="mt-3 items-center">
        <Text className="text-night-muted text-xs underline">
          {t("garden.duplicateToday.keep")}
        </Text>
      </Pressable>
    </View>
  );
}
