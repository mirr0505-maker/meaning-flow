// 🚀 Phase 4 UI/UX STEP 1 — 내 정체성 편집 화면
// SettingsScreen → "내 정체성" 카드 → 이 화면.
// IN 특성 / 두 자아 / 닉네임 모두 수정 가능. OBInTraits + OBPickMBTI 재사용.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppleLogo } from "../components/icons/AppleLogo";
import { GoogleLogo } from "../components/icons/GoogleLogo";
import { type MBTI, resolveComboKey } from "../lib/combos";
import { type InTraitKey } from "../lib/inTraits";
import { fetchProfile, updateProfileIdentity, type Profile } from "../lib/profiles";
import { getLinkedIdentities, type LinkedIdentity } from "../lib/sns-auth";

import { OBInTraits } from "../onboarding/OBInTraits";
import { OBPickMBTI } from "../onboarding/OBPickMBTI";

type SaveState = "idle" | "saving" | "error";

export function IdentityEditScreen({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [inTraits, setInTraits] = useState<InTraitKey[]>([]);
  const [solo, setSolo] = useState<MBTI | null>(null);
  const [social, setSocial] = useState<MBTI | null>(null);
  const [displayNickname, setDisplayNickname] = useState<string>("");
  const [linkedIds, setLinkedIds] = useState<LinkedIdentity[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile(userId).then((p) => {
      if (!p) return;
      setProfile(p);
      setInTraits(p.in_traits ?? []);
      setSolo(p.solo_mbti);
      setSocial(p.social_mbti);
      setDisplayNickname(p.display_nickname ?? "");
    });
    getLinkedIdentities().then(setLinkedIds).catch(() => setLinkedIds([]));
  }, [userId]);

  const autoComboKey = solo && social ? resolveComboKey(solo, social) : null;
  const autoNickname = autoComboKey ? t(autoComboKey) : t("onboarding.result.noCombo");
  const canSave = inTraits.length > 0;  // IN 특성 1개 이상 유지

  async function handleSave() {
    if (!canSave) return;
    setSaveState("saving");
    setErrMsg(null);
    const dn = displayNickname.trim();
    const res = await updateProfileIdentity({
      userId,
      in_traits:        inTraits,
      solo_mbti:        solo,
      social_mbti:      social,
      combo_nickname:   autoComboKey,
      display_nickname: dn.length > 0 ? dn : null,
    });
    if (res.ok) {
      setSaveState("idle");
      onClose();
    } else {
      setErrMsg(t("identity.saveError"));
      setSaveState("error");
    }
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-paper-warm items-center justify-center">
        <ActivityIndicator color="#1A1A1F" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper-warm">
      {/* 헤더 */}
      <View className="px-6 pt-14 pb-4 flex-row items-center border-b border-hair">
        <Pressable onPress={onClose} className="py-2 pr-3">
          <Text className="text-ink text-xl">{"<"}</Text>
        </Pressable>
        <Text className="text-ink text-base font-medium flex-1">
          {t("identity.title")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}>
        {/* 닉네임 */}
        <Text className="text-mute text-xs tracking-widest mb-3">
          {t("identity.nicknameSection")}
        </Text>
        <Text className="text-ink-soft text-xs mb-2">
          {t("onboarding.result.editLabel")}
        </Text>
        <TextInput
          value={displayNickname}
          onChangeText={setDisplayNickname}
          maxLength={30}
          placeholder={autoNickname}
          placeholderTextColor="#9A9486"
          className="rounded-card border border-hair bg-paper px-4"
          style={{ height: 48, fontSize: 16, color: "#1A1A1F" }}
        />
        <Text className="text-mute text-[11px] mt-1.5 mb-6 leading-relaxed">
          {t("onboarding.result.editHint")}
        </Text>

        {/* IN 특성 */}
        <Text className="text-mute text-xs tracking-widest mb-3">
          {t("identity.inTraitsSection")}
        </Text>
        <View className="mb-6">
          <OBInTraits selected={inTraits} onChange={setInTraits} />
        </View>

        {/* 두 자아 */}
        <Text className="text-mute text-xs tracking-widest mb-3">
          {t("identity.dualSelfSection")}
        </Text>
        <View className="mb-4">
          <OBPickMBTI
            titleKey="onboarding.pickSolo.title"
            subtitleKey="onboarding.pickSolo.subtitle"
            tagKey="onboarding.pickSolo.tag"
            tagColorClass="bg-evening"
            field="Solo"
            value={solo}
            onChange={setSolo}
          />
        </View>
        <View className="mb-6">
          <OBPickMBTI
            titleKey="onboarding.pickSocial.title"
            subtitleKey="onboarding.pickSocial.subtitle"
            tagKey="onboarding.pickSocial.tag"
            tagColorClass="bg-day"
            field="Social"
            value={social}
            onChange={setSocial}
          />
        </View>

        {errMsg && (
          <View className="mb-4 p-3 bg-evening-soft rounded-card">
            <Text className="text-ink text-xs">{errMsg}</Text>
          </View>
        )}

        <Pressable
          onPress={handleSave}
          disabled={!canSave || saveState === "saving"}
          className={"rounded-pill items-center justify-center bg-ink " +
            ((!canSave || saveState === "saving") ? "opacity-30" : "")}
          style={{ height: 52 }}
        >
          {saveState === "saving" ? (
            <ActivityIndicator color="#F8F3E9" />
          ) : (
            <Text className="text-paper-warm text-sm font-medium">
              {t("identity.save")}
            </Text>
          )}
        </Pressable>

        {/* 🚀 연결된 SNS — 참고 정보. 앱 안 어디서도 안 쓰는, SNS 측 자동 메타데이터만 */}
        {linkedIds.length > 0 && (
          <View className="mt-10">
            <Text className="text-mute text-xs tracking-widest mb-3">
              {t("identity.snsSection")}
            </Text>
            {linkedIds.map((id) => (
              <View
                key={id.provider}
                className="rounded-card border border-hair bg-paper p-4 mb-2 flex-row items-center"
              >
                <View style={{ marginRight: 12 }}>
                  {id.provider === "google" ? (
                    <GoogleLogo size={22} />
                  ) : (
                    <AppleLogo size={22} color="#1A1A1F" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-ink text-sm font-medium">
                    {id.displayName ?? t("identity.snsNoName")}
                  </Text>
                  {id.email && (
                    <Text className="text-mute text-xs mt-0.5">{id.email}</Text>
                  )}
                </View>
              </View>
            ))}
            <Text className="text-mute text-[11px] mt-2 leading-relaxed">
              {t("identity.snsHint")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
