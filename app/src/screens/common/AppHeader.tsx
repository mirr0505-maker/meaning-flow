// 🚀 Phase 4 UI/UX — 메인 헤더 (한 줄, 밝은 차분 톤)
// 사용자 결정 2026-05-24:
//   - 한 줄로 정리 (status bar 영역은 SafeArea 가 노출)
//   - 좌: 🌿 + 닉네임  (탭 → IdentityEdit)
//   - 우: ⚙  🌐 가로 (탭 영역 분리)

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text, View } from "react-native";

import { type Profile } from "../../lib/profiles";

const LANGS = [
  { code: "ko", labelKey: "lang.ko" },
  { code: "en", labelKey: "lang.en" },
  { code: "ja", labelKey: "lang.ja" },
] as const;

export function AppHeader({
  profile,
  onPressIdentity,
  onPressSettings,
}: {
  profile: Profile;
  onPressIdentity: () => void;
  onPressSettings: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const nickname = profile.display_nickname ?? t(profile.combo_nickname ?? "combos.unknown");

  function selectLang(code: string) {
    i18n.changeLanguage(code);
    setLangOpen(false);
  }

  return (
    <View
      className="px-5 flex-row items-center"
      style={{ paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#E8E0D0" }}
    >
      {/* 좌측 — 🌿 + 닉네임 (탭 → IdentityEdit 단축) */}
      <Pressable
        onPress={onPressIdentity}
        accessibilityLabel={t("identity.editLabel")}
        className="flex-1 flex-row items-center pr-3"
      >
        <Text style={{ fontSize: 16, marginRight: 8 }}>🌿</Text>
        <Text className="text-ink text-sm font-medium" numberOfLines={1} style={{ flexShrink: 1 }}>
          {nickname}
        </Text>
      </Pressable>

      {/* 우측 — ⚙  🌐 가로 */}
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <Pressable
          onPress={onPressSettings}
          accessibilityLabel={t("settings.title")}
          className="rounded-pill items-center justify-center"
          style={{ width: 32, height: 32 }}
        >
          <Text className="text-ink" style={{ fontSize: 16 }}>⚙</Text>
        </Pressable>
        <Pressable
          onPress={() => setLangOpen(true)}
          accessibilityLabel={t("lang.select")}
          className="rounded-pill items-center justify-center"
          style={{ width: 32, height: 32 }}
        >
          <Text style={{ fontSize: 16 }}>🌐</Text>
        </Pressable>
      </View>

      {/* 언어 드롭다운 */}
      <Modal
        visible={langOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangOpen(false)}
      >
        <Pressable
          onPress={() => setLangOpen(false)}
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
        >
          <View className="absolute" style={{ top: 60, right: 14 }}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-card border border-hair bg-paper py-1"
              style={{ minWidth: 140 }}
            >
              {LANGS.map((l) => {
                const on = i18n.language.startsWith(l.code);
                return (
                  <Pressable
                    key={l.code}
                    onPress={() => selectLang(l.code)}
                    className="px-4 py-2.5 flex-row items-center"
                  >
                    <Text className={(on ? "text-ink font-medium" : "text-ink-soft") + " text-sm flex-1"}>
                      {t(l.labelKey)}
                    </Text>
                    {on && <Text className="text-leaf text-sm ml-2">✓</Text>}
                  </Pressable>
                );
              })}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
