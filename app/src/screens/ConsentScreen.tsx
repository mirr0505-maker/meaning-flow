// 🚀 Phase 4 STEP 4-J — 데이터 처리 동의 화면 (GDPR / APPI / 한국 PIPA)
// 첫 부팅 시 1회. 정책 변경 시 consent_v1 → v2 키 prefix 로 재노출.
//
// 디자인:
//  - Supabase = 필수 (앱 동작 위해 데이터 저장. 거부 옵션 없음)
//  - Sentry / PostHog = 선택 (토글 OFF 가 기본 — IN 정서 친화. 거부해도 앱 정상)
//  - 처리방침 링크는 [11.0-F](blueprint.md) 의 4-I 작업으로 본문·URL 채워지면 활성

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, ScrollView, Switch, Text, View } from "react-native";

import { saveConsent } from "../lib/consent";

// 4-I: GitHub Pages 호스팅 완료 (2026-05-29).
const PRIVACY_POLICY_URL = "https://mirr0505-maker.github.io/meaning-flow-legal/privacy-ko.html";

export function ConsentScreen({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  // 선택 토글 — 기본 OFF (M3 능동적 진입)
  const [sentry,  setSentry]  = useState(false);
  const [posthog, setPosthog] = useState(false);

  async function handleContinue() {
    await saveConsent({ sentry, posthog });
    onContinue();
  }

  function handleOpenPrivacy() {
    if (!PRIVACY_POLICY_URL) return;
    Linking.openURL(PRIVACY_POLICY_URL);
  }

  return (
    <View className="flex-1 bg-paper-warm">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 }}>
        <Text className="text-mute text-xs tracking-widest mb-2">
          {t("consent.eyebrow")}
        </Text>
        <Text className="text-ink text-xl font-medium mb-3">
          {t("consent.title")}
        </Text>
        <Text className="text-ink-soft text-sm leading-relaxed mb-6">
          {t("consent.intro")}
        </Text>

        {/* 필수 — Supabase */}
        <View className="rounded-card border border-hair bg-paper p-4 mb-3">
          <View className="flex-row items-center mb-1.5">
            <Text className="text-ink text-sm font-medium flex-1">
              {t("consent.supabase.label")}
            </Text>
            <View className="px-2 py-0.5 rounded-pill bg-ink">
              <Text className="text-paper-warm text-[10px]">{t("consent.required")}</Text>
            </View>
          </View>
          <Text className="text-ink-soft text-xs leading-relaxed">
            {t("consent.supabase.desc")}
          </Text>
        </View>

        {/* 선택 — Sentry */}
        <View className="rounded-card border border-hair bg-paper p-4 mb-3 flex-row items-center">
          <Switch
            value={sentry}
            onValueChange={setSentry}
            trackColor={{ false: "#CFCAB8", true: "#7E7E92" }}
            thumbColor={sentry ? "#FBF8F1" : "#FBF8F1"}
          />
          <View className="flex-1 ml-3">
            <Text className="text-ink text-sm font-medium">
              {t("consent.sentry.label")}
            </Text>
            <Text className="text-ink-soft text-xs mt-0.5 leading-relaxed">
              {t("consent.sentry.desc")}
            </Text>
          </View>
        </View>

        {/* 선택 — PostHog */}
        <View className="rounded-card border border-hair bg-paper p-4 mb-5 flex-row items-center">
          <Switch
            value={posthog}
            onValueChange={setPosthog}
            trackColor={{ false: "#CFCAB8", true: "#7E7E92" }}
            thumbColor={posthog ? "#FBF8F1" : "#FBF8F1"}
          />
          <View className="flex-1 ml-3">
            <Text className="text-ink text-sm font-medium">
              {t("consent.posthog.label")}
            </Text>
            <Text className="text-ink-soft text-xs mt-0.5 leading-relaxed">
              {t("consent.posthog.desc")}
            </Text>
          </View>
        </View>

        {/* 처리방침 링크 — 4-I 에서 URL 채워지면 활성 */}
        <Pressable
          onPress={handleOpenPrivacy}
          disabled={!PRIVACY_POLICY_URL}
          className="mb-6 items-center"
        >
          <Text className={(PRIVACY_POLICY_URL ? "text-ink-soft" : "text-mute") + " text-xs underline"}>
            {t("consent.privacyLink")}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          className="rounded-pill bg-ink items-center justify-center"
          style={{ height: 52 }}
        >
          <Text className="text-paper-warm text-base font-medium">
            {t("consent.continue")}
          </Text>
        </Pressable>

        <Text className="text-mute text-[11px] text-center mt-4 leading-relaxed">
          {t("consent.changeLater")}
        </Text>
      </ScrollView>
    </View>
  );
}
