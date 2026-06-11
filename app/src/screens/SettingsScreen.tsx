// 🚀 Phase 4 STEP 4-H — 설정 화면 (현재는 계정 삭제 단일 기능)
// 향후 확장: 알림 일괄 설정 / 데이터 export / ToS·Privacy 링크 / 계정 연결(SNS) 등
//
// 진입점: FlowRouter 헤더 우상단 작은 톱니바퀴 아이콘.
// 디자인 톤: IN 정서 친화 — 단일 카드, 강조 X. 위험 액션(계정 삭제) 만 마지막에 분리.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, Share, Switch, Text, View } from "react-native";

import { deleteAccount, logoutAccount } from "../lib/account";
import { readConsent, saveConsent } from "../lib/consent";
import { exportMyData } from "../lib/dataExport";
import { getLinkedProviders, linkProviderToCurrentUser, type SnsProvider } from "../lib/sns-auth";

import { AboutScreen } from "./AboutScreen";
import { IdentityEditScreen } from "./IdentityEditScreen";
import { DeleteConfirmModal, type DeletePhase } from "./settings/DeleteConfirmModal";
import { LogoutConfirmModal, type LogoutPhase } from "./settings/LogoutConfirmModal";

// 4-I: GitHub Pages 호스팅 완료 (2026-05-29). repo: mirr0505-maker/meaning-flow-legal
const TOS_URL = "https://mirr0505-maker.github.io/meaning-flow-legal/tos-ko.html";
const PRIVACY_POLICY_URL = "https://mirr0505-maker.github.io/meaning-flow-legal/privacy-ko.html";

export function SettingsScreen({ userId, onClose, onAccountDeleted }: {
  userId: string;
  onClose: () => void;
  onAccountDeleted: () => void;
}) {
  const { t } = useTranslation();
  const [confirmPhase, setConfirmPhase] = useState<DeletePhase>("hidden");
  const [logoutPhase,  setLogoutPhase]  = useState<LogoutPhase>("hidden");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [logoutErr, setLogoutErr] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  // Phase 4 UI/UX: 내 정체성 편집 / About 화면 진입
  const [identityOpen, setIdentityOpen] = useState(false);
  const [aboutOpen, setAboutOpen]       = useState(false);
  // 4-A1: 계정 연결 상태 + 연결 진행 중 flag
  const [linkedProviders, setLinkedProviders] = useState<SnsProvider[]>([]);
  const [linking, setLinking] = useState(false);

  // 4-B/4-C: 분석 도구 동의 토글 — 변경은 다음 부팅부터 적용 (init 한 SDK 동적 disable 어려움)
  const [sentryEnabled,  setSentryEnabled]  = useState<boolean | null>(null);
  const [posthogEnabled, setPosthogEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    getLinkedProviders().then(setLinkedProviders);
    readConsent().then((c) => {
      setSentryEnabled(c.sentry);
      setPosthogEnabled(c.posthog);
    });
  }, []);

  async function persistConsent(next: { sentry: boolean; posthog: boolean }) {
    await saveConsent(next);
  }

  async function handleSentryToggle(next: boolean) {
    if (sentryEnabled === null || posthogEnabled === null) return;
    setSentryEnabled(next);
    await persistConsent({ sentry: next, posthog: posthogEnabled });
  }

  async function handlePosthogToggle(next: boolean) {
    if (sentryEnabled === null || posthogEnabled === null) return;
    setPosthogEnabled(next);
    await persistConsent({ sentry: sentryEnabled, posthog: next });
  }

  const isGoogleLinked = linkedProviders.includes("google");
  const isAppleLinked  = linkedProviders.includes("apple");
  // Apple Sign In 은 iOS 에서만 노출 (Apple 가이드라인 + 의미 일관성). MVP Android 단계엔 어차피 hide.
  const showAppleBtn   = Platform.OS === "ios";

  async function handleLink(provider: SnsProvider) {
    if (linking) return;
    if (provider === "google" && isGoogleLinked) return;
    if (provider === "apple"  && isAppleLinked)  return;
    setLinking(true);
    try {
      const res = await linkProviderToCurrentUser(provider);
      if (res.ok) {
        const list = await getLinkedProviders();
        setLinkedProviders(list);
      } else if (res.reason !== "cancelled") {
        Alert.alert(t("settings.account.link.errorTitle"), t(res.messageKey));
      }
    } finally {
      setLinking(false);
    }
  }

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await exportMyData();
      if (!res.ok) {
        Alert.alert(t("settings.dataExport.errorTitle"), t(res.messageKey));
        return;
      }
      // RN 내장 Share — 공유 시트 호출. 사용자가 메일·파일 저장·메시지 등 자유 선택.
      await Share.share({
        title:   "meaning-flow-export.json",
        message: res.json,
      });
    } catch {
      // 공유 시트 사용자가 취소한 경우 — 에러 아님. silent.
    } finally {
      setExporting(false);
    }
  }

  async function handleLogout() {
    setLogoutPhase("out");
    const res = await logoutAccount();
    if (res.ok) {
      onAccountDeleted();   // 부모 boot() 호출 — 세션 종료 후 새 익명 user / onboarding
    } else {
      setLogoutErr(t(res.messageKey));
      setLogoutPhase("error");
    }
  }

  async function handleDelete() {
    setConfirmPhase("deleting");
    const res = await deleteAccount();
    if (res.ok) {
      // 부모(App)에 통보 → onboarding 으로 이동
      onAccountDeleted();
    } else {
      setErrMsg(t(res.messageKey));
      setConfirmPhase("error");
    }
  }

  if (identityOpen) {
    return <IdentityEditScreen userId={userId} onClose={() => setIdentityOpen(false)} />;
  }
  if (aboutOpen) {
    return <AboutScreen onClose={() => setAboutOpen(false)} />;
  }

  return (
    <View className="flex-1 bg-night-bg">
      {/* 헤더 */}
      <View className="px-6 pt-14 pb-4 flex-row items-center border-b border-night-hair">
        <Pressable onPress={onClose} className="py-2 pr-3">
          <Text className="text-night-ink text-xl">{"<"}</Text>
        </Pressable>
        <Text className="text-night-ink text-base font-medium flex-1">
          {t("settings.title")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}>
        {/* 내 정체성 — 가장 위 (앱 정체성 핵심) */}
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("identity.section")}
        </Text>
        <Pressable
          onPress={() => setIdentityOpen(true)}
          className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-2.5"
        >
          <Text className="text-night-ink text-sm font-medium">
            {t("identity.editLabel")}
          </Text>
          <Text className="text-night-muted text-[11px] mt-1.5 leading-relaxed">
            {t("identity.editDesc")}
          </Text>
          <Text className="text-night-soft text-xs mt-3">{t("identity.editAction")} →</Text>
        </Pressable>

        {/* Meaning Flow 이야기 — About */}
        <Pressable
          onPress={() => setAboutOpen(true)}
          className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-6"
        >
          <Text className="text-night-ink text-sm font-medium">
            {t("about.menuLabel")}
          </Text>
          <Text className="text-night-muted text-[11px] mt-1.5 leading-relaxed">
            {t("about.menuDesc")}
          </Text>
          <Text className="text-night-soft text-xs mt-3">{t("about.menuAction")} →</Text>
        </Pressable>

        {/* 내 데이터 — GDPR 20조 portability */}
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("settings.dataExport.section")}
        </Text>
        <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-6">
          <Text className="text-night-ink text-sm font-medium">
            {t("settings.dataExport.label")}
          </Text>
          <Text className="text-night-muted text-[11px] mt-1.5 leading-relaxed">
            {t("settings.dataExport.desc")}
          </Text>
          <Pressable
            onPress={handleExport}
            disabled={exporting}
            className="mt-4 rounded-pill border border-night-soft items-center justify-center"
            style={{ height: 40, opacity: exporting ? 0.5 : 1 }}
          >
            {exporting ? (
              <ActivityIndicator color="#9A9486" />
            ) : (
              <Text className="text-night-soft text-xs">
                {t("settings.dataExport.btn")}
              </Text>
            )}
          </Pressable>
        </View>

        {/* 분석 도구 동의 변경 — Sentry/PostHog ON/OFF */}
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("settings.analytics.section")}
        </Text>
        <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-2 flex-row items-center">
          <Switch
            value={!!sentryEnabled}
            onValueChange={handleSentryToggle}
            disabled={sentryEnabled === null}
            trackColor={{ false: "#2D2E3A", true: "#7E7E92" }}
            thumbColor="#FBF8F1"
          />
          <View className="flex-1 ml-3">
            <Text className="text-night-ink text-sm font-medium">
              {t("settings.analytics.sentry.label")}
            </Text>
            <Text className="text-night-muted text-[11px] mt-0.5 leading-relaxed">
              {t("settings.analytics.sentry.desc")}
            </Text>
          </View>
        </View>
        <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-2 flex-row items-center">
          <Switch
            value={!!posthogEnabled}
            onValueChange={handlePosthogToggle}
            disabled={posthogEnabled === null}
            trackColor={{ false: "#2D2E3A", true: "#7E7E92" }}
            thumbColor="#FBF8F1"
          />
          <View className="flex-1 ml-3">
            <Text className="text-night-ink text-sm font-medium">
              {t("settings.analytics.posthog.label")}
            </Text>
            <Text className="text-night-muted text-[11px] mt-0.5 leading-relaxed">
              {t("settings.analytics.posthog.desc")}
            </Text>
          </View>
        </View>
        <Text className="text-night-muted text-[11px] mb-6 leading-relaxed">
          {t("settings.analytics.restartNote")}
        </Text>

        {/* 계정 연결 — 디바이스 변경 시 데이터 보존 (사용자 결정 2026-05-23) */}
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("settings.account.link.section")}
        </Text>
        <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-6">
          <Text className="text-night-soft text-[11px] leading-relaxed mb-3">
            {t("settings.account.link.desc")}
          </Text>

          <Pressable
            onPress={() => handleLink("google")}
            disabled={linking || isGoogleLinked}
            className={
              "rounded-pill items-center justify-center border " +
              (isGoogleLinked ? "border-night-soft bg-night-bg3" : "border-night-soft")
            }
            style={{ height: 44, opacity: linking ? 0.5 : 1 }}
          >
            {linking ? (
              <ActivityIndicator color="#9A9486" />
            ) : (
              <Text className="text-night-soft text-sm">
                {isGoogleLinked
                  ? t("settings.account.link.google.linked")
                  : t("settings.account.link.google.btn")}
              </Text>
            )}
          </Pressable>

          {/* Apple Sign In — iOS 만 (MVP Android 출시엔 hide. 정식 iOS 출시 시 활성) */}
          {showAppleBtn && (
            <Pressable
              onPress={() => handleLink("apple")}
              disabled={linking || isAppleLinked}
              className={
                "mt-3 rounded-pill items-center justify-center border " +
                (isAppleLinked ? "border-night-soft bg-night-bg3" : "border-night-soft")
              }
              style={{ height: 44, opacity: linking ? 0.5 : 1 }}
            >
              {linking ? (
                <ActivityIndicator color="#9A9486" />
              ) : (
                <Text className="text-night-soft text-sm">
                  {isAppleLinked
                    ? t("settings.account.link.apple.linked")
                    : t("settings.account.link.apple.btn")}
                </Text>
              )}
            </Pressable>
          )}
        </View>

        {/* 계정 섹션 */}
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("settings.account.section")}
        </Text>

        {/* 로그아웃 — SNS 연동된 사용자만. 익명 user 가 로그아웃하면 데이터 복구 불가라 메뉴 숨김. */}
        {linkedProviders.length > 0 && (
          <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-2.5">
            <Text className="text-night-ink text-sm font-medium">
              {t("settings.account.logoutLabel")}
            </Text>
            <Text className="text-night-muted text-[11px] mt-1.5 leading-relaxed">
              {t("settings.account.logoutDesc")}
            </Text>
            <Pressable
              onPress={() => setLogoutPhase("confirm")}
              className="mt-4 rounded-pill border border-night-soft items-center justify-center"
              style={{ height: 40 }}
            >
              <Text className="text-night-soft text-xs">
                {t("settings.account.logoutBtn")}
              </Text>
            </Pressable>
          </View>
        )}

        <View className="rounded-card border border-night-hair bg-night-bg2 p-4">
          <Text className="text-night-ink text-sm font-medium">
            {t("settings.account.deleteLabel")}
          </Text>
          <Text className="text-night-muted text-[11px] mt-1.5 leading-relaxed">
            {t("settings.account.deleteDesc")}
          </Text>
          <Pressable
            onPress={() => setConfirmPhase("first")}
            className="mt-4 rounded-pill border border-night-soft items-center justify-center"
            style={{ height: 40 }}
          >
            <Text className="text-night-soft text-xs">
              {t("settings.account.deleteBtn")}
            </Text>
          </Pressable>
        </View>

        {/* 약관 — 출시 직전 URL 채워지면 활성 (4-I) */}
        <Text className="text-night-muted text-xs tracking-widest mt-8 mb-3">
          {t("settings.legal.section")}
        </Text>
        <Pressable
          onPress={() => TOS_URL && Linking.openURL(TOS_URL)}
          disabled={!TOS_URL}
          className="py-3 border-b border-night-hair"
        >
          <Text className={(TOS_URL ? "text-night-soft" : "text-night-muted") + " text-sm"}>
            {t("settings.legal.tos")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => PRIVACY_POLICY_URL && Linking.openURL(PRIVACY_POLICY_URL)}
          disabled={!PRIVACY_POLICY_URL}
          className="py-3"
        >
          <Text className={(PRIVACY_POLICY_URL ? "text-night-soft" : "text-night-muted") + " text-sm"}>
            {t("settings.legal.privacy")}
          </Text>
        </Pressable>
      </ScrollView>

      {/* 이중 확인 회원 탈퇴 모달 */}
      <DeleteConfirmModal
        visible={confirmPhase !== "hidden"}
        phase={confirmPhase}
        errMsg={errMsg}
        onCancel={() => setConfirmPhase("hidden")}
        onContinue={() => setConfirmPhase("final")}
        onDelete={handleDelete}
      />

      {/* 로그아웃 확인 모달 */}
      <LogoutConfirmModal
        visible={logoutPhase !== "hidden"}
        phase={logoutPhase}
        logoutErr={logoutErr}
        onCancel={() => setLogoutPhase("hidden")}
        onLogout={handleLogout}
      />
    </View>
  );
}
