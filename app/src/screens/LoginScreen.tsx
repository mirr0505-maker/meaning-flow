// 🚀 Phase 4 UI/UX v4 (2026-05-29) — 첫 진입 로그인/회원가입 화면
// 사용자 결정 2026-05-29:
//   - 메인 = 통합 (Google/Apple "로 시작하기") — 일반 사용자 / 재로그인 자연스러움
//   - 아래 "회원가입" 텍스트 링크 → SignUpSheet 시트로 환영 + SNS 옵션
//   - Google 로고 (4색 G) + 흰 배경 (공식 가이드)
//   - Apple 로고 (단색) + 검정 배경 (HIG)
//   - 다른 SNS Alert 카피 보강 — 설정 연결 안내 추가
//
// CLAUDE.md M3 정합: 회원가입 강요 X, 부드러운 안내.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, Text, View } from "react-native";

import { AppleLogo } from "../components/icons/AppleLogo";
import { GoogleLogo } from "../components/icons/GoogleLogo";
import { signInWithProvider, type SnsProvider } from "../lib/sns-auth";

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<"none" | "google" | "apple">("none");
  const [signUpOpen, setSignUpOpen] = useState(false);

  async function handleSns(provider: SnsProvider) {
    if (busy !== "none") return;
    setBusy(provider);
    try {
      const res = await signInWithProvider(provider);
      if (res.ok) {
        setSignUpOpen(false);
        onLoggedIn();
        return;
      }
      if (res.reason !== "cancelled") {
        Alert.alert(t("login.errorTitle"), t(res.messageKey));
      }
    } finally {
      setBusy("none");
    }
  }

  const showApple = Platform.OS === "ios";

  return (
    <View className="flex-1 bg-paper-warm">
      {/* 본문 */}
      <View className="flex-1 px-7 justify-center">
        <Text className="text-mute text-sm tracking-widest mb-3">
          {t("login.brand")}
        </Text>
        <Text className="text-ink text-3xl font-medium leading-tight mb-3">
          {t("login.headline")}
        </Text>
        <Text className="text-ink-soft text-base leading-relaxed">
          {t("login.subhead")}
        </Text>
      </View>

      {/* 하단 — 메인 SNS 버튼 (통합) + 회원가입 링크 */}
      <View className="px-7 pb-12">
        <GoogleButton busy={busy === "google"} disabled={busy !== "none"} onPress={() => handleSns("google")} label={t("login.googleStart")} />

        {showApple && (
          <View className="mt-3">
            <AppleButton busy={busy === "apple"} disabled={busy !== "none"} onPress={() => handleSns("apple")} label={t("login.appleStart")} />
          </View>
        )}

        {/* 구분선 + 회원가입 텍스트 링크 */}
        <View className="mt-7 mb-1 flex-row items-center">
          <View className="flex-1 h-px bg-hair" />
          <Text className="text-mute text-xs mx-3 tracking-widest">
            {t("login.or")}
          </Text>
          <View className="flex-1 h-px bg-hair" />
        </View>

        <Pressable
          onPress={() => setSignUpOpen(true)}
          disabled={busy !== "none"}
          className="items-center py-3"
        >
          <Text className="text-ink-soft text-sm">
            {t("login.signUpLink")}
          </Text>
        </Pressable>
      </View>

      {/* 회원가입 시트 (드롭업 모달) */}
      <Modal
        visible={signUpOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSignUpOpen(false)}
      >
        <Pressable
          onPress={() => setSignUpOpen(false)}
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-paper-warm rounded-t-card px-7 pt-7 pb-12"
          >
            {/* 시트 손잡이 */}
            <View
              className="self-center mb-5"
              style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#CFCAB8" }}
            />

            <Text className="text-mute text-sm tracking-widest mb-2">
              {t("login.signUpHeading")}
            </Text>
            <Text className="text-ink text-xl font-medium mb-2">
              {t("login.signUpTitle")}
            </Text>
            <Text className="text-ink-soft text-sm leading-relaxed mb-6">
              {t("login.signUpDesc")}
            </Text>

            <GoogleButton busy={busy === "google"} disabled={busy !== "none"} onPress={() => handleSns("google")} label={t("login.googleSignUp")} />

            {showApple && (
              <View className="mt-3">
                <AppleButton busy={busy === "apple"} disabled={busy !== "none"} onPress={() => handleSns("apple")} label={t("login.appleSignUp")} />
              </View>
            )}

            <Pressable onPress={() => setSignUpOpen(false)} className="mt-5 items-center">
              <Text className="text-mute text-xs underline">{t("login.cancel")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// Google 버튼 — 공식 가이드: 흰 배경 + 회색 테두리 + 컬러 G 로고 + 검정 텍스트
function GoogleButton({ busy, disabled, onPress, label }: {
  busy: boolean; disabled: boolean; onPress: () => void; label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="rounded-pill flex-row items-center justify-center bg-paper border border-hair"
      style={{ height: 52, opacity: busy ? 0.6 : 1 }}
    >
      {busy ? (
        <ActivityIndicator color="#5C5A53" />
      ) : (
        <>
          <View style={{ marginRight: 10 }}>
            <GoogleLogo size={20} />
          </View>
          <Text className="text-ink text-base font-medium">{label}</Text>
        </>
      )}
    </Pressable>
  );
}

// Apple 버튼 — HIG: 검정 배경 + 흰 Apple 로고 + 흰 텍스트
function AppleButton({ busy, disabled, onPress, label }: {
  busy: boolean; disabled: boolean; onPress: () => void; label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="rounded-pill flex-row items-center justify-center"
      style={{ height: 52, backgroundColor: "#000000", opacity: busy ? 0.6 : 1 }}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <View style={{ marginRight: 8, marginTop: -2 }}>
            <AppleLogo size={22} color="#FFFFFF" />
          </View>
          <Text className="text-base font-medium" style={{ color: "#FFFFFF" }}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
