// 🚀 🌙 NightBlanket — 이불 촉감 모드 (PRD 4.4 F-NIT-004)
// 호흡하는 원 + 정적 카피. 화면 자동 디밍(15초)은 expo-keep-awake/screen-brightness 부담으로 보류.
// Animated API 만 사용 — Reanimated 추가 없음.

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Text, View } from "react-native";

export function NightBlanket() {
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 4초 들숨 → 4초 날숨 무한 반복 (1.0 ↔ 1.18)
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.18,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <View className="items-center" style={{ paddingTop: 36, paddingBottom: 40 }}>
      {/* 호흡 원 */}
      <Animated.View
        style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: "#8F88B0",
          opacity: 0.78,
          shadowColor: "#8F88B0",
          shadowOpacity: 0.45,
          shadowRadius: 40,
          shadowOffset: { width: 0, height: 0 },
          transform: [{ scale }],
        }}
      />

      <View className="mt-8 items-center">
        <Text
          className="text-night-ink italic font-light text-center"
          style={{ fontSize: 21, lineHeight: 34 }}
        >
          {t("flow.night.blanket.lead")}
        </Text>
        <Text
          className="text-night-soft italic font-light text-center mt-5"
          style={{ fontSize: 16, lineHeight: 28 }}
        >
          {t("flow.night.blanket.body")}
        </Text>
      </View>

      <Text className="text-night-muted text-[10px] tracking-widest mt-10">
        {t("flow.night.blanket.footer")}
      </Text>
    </View>
  );
}
