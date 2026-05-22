// 🚀 온보딩 메인 컨테이너 — 3 step (intro → Solo → Social → Result)
// 원본: src/onboarding.jsx 의 Onboarding
// 완료 시 ensureSession() → upsertProfile() → onDone() 콜백으로 부모(App)가 Main 으로 라우팅

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ensureSession } from "../lib/auth";
import { upsertProfile } from "../lib/profiles";
import { type MBTI, resolveComboKey } from "../lib/combos";

import { OBIntro } from "./OBIntro";
import { OBPickMBTI } from "./OBPickMBTI";
import { OBResult } from "./OBResult";

type Step = 0 | 1 | 2 | 3;

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<Step>(0);
  const [solo, setSolo] = useState<MBTI | null>(null);
  const [social, setSocial] = useState<MBTI | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const comboKey = solo && social ? resolveComboKey(solo, social) : "combos.unknown";
  const nextDisabled = (step === 1 && !solo) || (step === 2 && !social);

  async function handleEnter() {
    if (!solo || !social) return;
    setSaving(true);
    setSaveError(null);
    try {
      const sess = await ensureSession();
      if ("error" in sess) {
        setSaveError(sess.error);
        return;
      }
      await upsertProfile({
        id: sess.userId,
        solo_mbti: solo,
        social_mbti: social,
        combo_nickname: comboKey,
        language: i18n.language.slice(0, 2),
      });
      onDone();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-paper-warm pt-14" style={{ flex: 1, backgroundColor: "#F8F3E9", paddingTop: 56 }}>
      {/* 진행도 (3 step) */}
      <View className="px-6 pt-3 flex-row">
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            className={"flex-1 h-0.5 rounded-pill mr-1.5 " + (i <= step ? "bg-ink" : "bg-hair")}
          />
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 32, paddingBottom: 24 }}>
        {step === 0 && <OBIntro />}
        {step === 1 && (
          <OBPickMBTI
            titleKey="onboarding.pickSolo.title"
            subtitleKey="onboarding.pickSolo.subtitle"
            tagKey="onboarding.pickSolo.tag"
            tagColorClass="bg-evening"
            field="Solo"
            value={solo}
            onChange={setSolo}
          />
        )}
        {step === 2 && (
          <OBPickMBTI
            titleKey="onboarding.pickSocial.title"
            subtitleKey="onboarding.pickSocial.subtitle"
            tagKey="onboarding.pickSocial.tag"
            tagColorClass="bg-day"
            field="Social"
            value={social}
            onChange={setSocial}
          />
        )}
        {step === 3 && (
          <OBResult
            nicknameKey={comboKey}
            saving={saving}
            saveError={saveError}
            onEnter={handleEnter}
          />
        )}
      </ScrollView>

      {/* 하단 액션 바 (Result 단계는 OBResult 의 자체 버튼 사용) */}
      {step < 3 && (
        <View className="px-6 pb-12 pt-3 flex-row">
          {step > 0 && (
            <Pressable
              onPress={() => setStep((step - 1) as Step)}
              className="px-5 rounded-pill border border-hair items-center justify-center mr-3"
              style={{ height: 52 }}
            >
              <Text className="text-ink-soft text-sm">{t("onboarding.actions.back")}</Text>
            </Pressable>
          )}
          <Pressable
            disabled={nextDisabled}
            onPress={() => setStep((step + 1) as Step)}
            className={"flex-1 rounded-pill items-center justify-center bg-ink " + (nextDisabled ? "opacity-30" : "")}
            style={{ height: 52 }}
          >
            <Text className="text-paper-warm text-sm font-medium">
              {step === 0 ? t("onboarding.actions.start")
               : step === 1 ? t("onboarding.actions.next")
               :              t("onboarding.actions.done")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
