// 🚀 Phase 4 UI/UX STEP 1 — IN 특성 자기 선택 (온보딩 step 1)
// 8개 IN 특성 carousel/list. 다중 선택. 1개 이상 = 다음 활성.
// "내가 IN 인가? IN 이면 뭐지?" 자기 발견 흐름.

import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { IN_TRAITS, labelKey, type InTraitKey } from "../lib/inTraits";

export function OBInTraits({
  selected,
  onChange,
}: {
  selected: InTraitKey[];
  onChange: (next: InTraitKey[]) => void;
}) {
  const { t } = useTranslation();

  function toggle(k: InTraitKey) {
    if (selected.includes(k)) {
      onChange(selected.filter((x) => x !== k));
    } else {
      onChange([...selected, k]);
    }
  }

  return (
    <View>
      <Text className="text-mute text-xs tracking-widest mb-2">
        {t("onboarding.inTraits.eyebrow")}
      </Text>
      <Text className="text-ink text-xl font-medium mb-2" style={{ lineHeight: 30 }}>
        {t("onboarding.inTraits.title")}
      </Text>
      <Text className="text-ink-soft text-sm leading-relaxed mb-5">
        {t("onboarding.inTraits.subtitle")}
      </Text>

      <View>
        {IN_TRAITS.map((trait) => {
          const on = selected.includes(trait.key);
          return (
            <Pressable
              key={trait.key}
              onPress={() => toggle(trait.key)}
              className={
                "rounded-card border p-3.5 mb-2 flex-row items-center " +
                (on ? "border-ink bg-paper" : "border-hair bg-paper-warm")
              }
            >
              <View style={{ width: 28, alignItems: "center", marginRight: 10 }}>
                <Ionicons
                  name={trait.iconName as any}
                  size={22}
                  color={on ? "#1A1A1F" : "#9A9486"}
                />
              </View>
              <Text className={(on ? "text-ink font-medium" : "text-ink-soft") + " flex-1 text-sm leading-relaxed"}>
                {t(labelKey(trait.key))}
              </Text>
              {on && <Text className="text-ink text-base ml-2">✓</Text>}
            </Pressable>
          );
        })}
      </View>

      {/* M2 권유형 안내 — 1개라도 선택하면 충분 */}
      <Text className="text-mute text-xs text-center mt-4 leading-relaxed italic">
        {selected.length === 0
          ? t("onboarding.inTraits.hint")
          : t("onboarding.inTraits.ready", { count: selected.length })}
      </Text>
    </View>
  );
}
