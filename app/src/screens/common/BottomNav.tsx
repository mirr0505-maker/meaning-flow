// 🚀 Phase 4 UI/UX — 하단 네비바 (3칸, 밝은 톤에 어울리는 차분한 디자인)
// 사용자 결정 2026-05-24: 색감 통일 + active 옅은 배경 알약 + 가독성

import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

export type NavTab = "home" | "flow" | "review";

const ITEMS: { key: NavTab; emoji: string; labelKey: string }[] = [
  { key: "home",   emoji: "🏠", labelKey: "nav.home" },
  { key: "flow",   emoji: "🌊", labelKey: "nav.flow" },
  { key: "review", emoji: "📓", labelKey: "nav.review" },
];

const NAV_BG       = "#FBF8F1";    // 더 밝은 paper
const NAV_BORDER   = "#E8E0D0";
const TEXT_OFF     = "#9A9486";
const TEXT_ON      = "#1A1A1F";
const ACTIVE_BG    = "#EDE6D4";    // 옅은 강조 알약

export function BottomNav({
  active,
  onChange,
}: {
  active: NavTab;
  onChange: (next: NavTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row px-3"
      style={{
        backgroundColor: NAV_BG,
        borderTopWidth: 1,
        borderTopColor: NAV_BORDER,
        paddingBottom: 14,
        paddingTop: 8,
      }}
    >
      {ITEMS.map((item) => {
        const on = item.key === active;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            className="flex-1 items-center justify-center mx-1"
            style={{
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: on ? ACTIVE_BG : "transparent",
            }}
          >
            <Text style={{ fontSize: 20, marginBottom: 2 }}>{item.emoji}</Text>
            <Text
              style={{
                fontSize: 11,
                color: on ? TEXT_ON : TEXT_OFF,
                fontWeight: on ? "600" : "400",
                letterSpacing: 0.3,
              }}
            >
              {t(item.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
