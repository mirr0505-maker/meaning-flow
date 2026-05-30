// 🚀 온보딩 메인 컨테이너 — 5 step (IN 특성 → intro+안내 → Solo → Social → Result+닉네임)
// Phase 4 UI/UX STEP 1 (2026-05-23): IN 특성을 먼저 보여서 자기 발견 → intro 에 "이 앱이 도움이 될 수 있어요" 부드러운 연결
// 완료 시 ensureSession() → upsertProfile() → onDone() 콜백으로 부모(App)가 Main 으로 라우팅

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import { getCurrentSession } from "../lib/auth";
import { type MBTI, resolveComboKey } from "../lib/combos";
import { type InTraitKey } from "../lib/inTraits";
import { upsertProfile } from "../lib/profiles";

import { OBInTraits } from "./OBInTraits";
import { OBIntro } from "./OBIntro";
import { OBPickMBTI } from "./OBPickMBTI";
import { OBResult } from "./OBResult";

type Step = 0 | 1 | 2 | 3 | 4;

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<Step>(0);
  const [inTraits, setInTraits] = useState<InTraitKey[]>([]);
  const [solo, setSolo] = useState<MBTI | null>(null);
  const [social, setSocial] = useState<MBTI | null>(null);
  const [displayNickname, setDisplayNickname] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 두 자아 둘 다 NULL 이면 combo NULL — IN 특성만으로도 가입 가능 (사용자 결정 2026-05-23)
  const comboKey = solo && social ? resolveComboKey(solo, social) : null;

  // step 0: IN 특성 (1개 이상 필수). step 1 부터는 모두 next 활성 (두 자아는 NULL OK)
  const nextDisabled = (step === 0 && inTraits.length === 0);

  async function handleEnter() {
    setSaving(true);
    setSaveError(null);
    try {
      const sess = await getCurrentSession();
      if (!sess) {
        setSaveError("세션이 만료됐어요. 다시 로그인해 주세요.");
        return;
      }
      const dn = displayNickname.trim();
      await upsertProfile({
        id: sess.userId,
        solo_mbti: solo,
        social_mbti: social,
        combo_nickname: comboKey,
        display_nickname: dn.length > 0 ? dn : null,
        in_traits: inTraits,
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
      {/* 진행도 (5 step) */}
      <View className="px-6 pt-3 flex-row">
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className={"flex-1 h-0.5 rounded-pill mr-1 " + (i <= step ? "bg-ink" : "bg-hair")}
          />
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 32, paddingBottom: 24 }}>
        {step === 0 && (
          <OBInTraits selected={inTraits} onChange={setInTraits} />
        )}
        {step === 1 && <OBIntro />}
        {step === 2 && (
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
        {step === 3 && (
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
        {step === 4 && (
          <OBResult
            nicknameKey={comboKey}
            displayNickname={displayNickname}
            onChangeDisplayNickname={setDisplayNickname}
            saving={saving}
            saveError={saveError}
            onEnter={handleEnter}
          />
        )}
      </ScrollView>

      {/* 하단 액션 바 (Result 단계는 OBResult 의 자체 버튼 사용) */}
      {step < 4 && (
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
              {step === 1 ? t("onboarding.actions.start")
               : step === 3 ? t("onboarding.actions.done")
               :              t("onboarding.actions.next")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
