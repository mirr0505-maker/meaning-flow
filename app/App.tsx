import "./global.css";
import "./src/lib/i18n"; // i18n 초기화 (side-effect)

import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert, SafeAreaView, Text, View } from "react-native";

import { deleteAccount } from "./src/lib/account";
import { checkMvpAccess } from "./src/lib/access";
import { getCurrentSession, readFirstProvider, rememberFirstProvider } from "./src/lib/auth";
import { readConsent } from "./src/lib/consent";
import { identify, initPosthogIfConsented, track } from "./src/lib/posthog";
import { fetchProfile, type Profile } from "./src/lib/profiles";
import { initSentryIfConsented } from "./src/lib/sentry";
import { supabase } from "./src/lib/supabase";
import { ConsentScreen } from "./src/screens/ConsentScreen";
import { FlowRouter } from "./src/screens/FlowRouter";
import { LockedScreen } from "./src/screens/LockedScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { Onboarding } from "./src/onboarding/Onboarding";
import { t } from "i18next";

// 🚀 App 라우팅 + 모바일 폭 컨테이너
// NativeWind flex-1 이 RN 빌드에서 누락되는 케이스 회피 — 모든 wrapper 에 inline flex:1 보강

type AppState =
  | { phase: "loading" }
  | { phase: "auth_error"; message: string }
  | { phase: "consent" }                              // 4-J: GDPR/APPI/PIPA 동의 (첫 부팅 1회)
  | { phase: "login" }                                // 2026-05-28: 첫 진입 + 로그아웃 후 노출
  | { phase: "onboarding"; userId: string }
  | { phase: "main"; profile: Profile }
  | { phase: "locked"; expiredAt: Date };             // 4-L: MVP 베타 30일 access 만료

export default function App() {
  const [state, setState] = useState<AppState>({ phase: "loading" });

  async function boot() {
    setState({ phase: "loading" });

    // 4-J: GDPR/APPI/PIPA — 동의 본 적 없으면 동의 화면 먼저 (auth 보다 우선)
    const consent = await readConsent();
    if (!consent.seen) {
      setState({ phase: "consent" });
      return;
    }

    // 4-B/4-C: Sentry/PostHog init — consent.{sentry,posthog} 가 true 이고 키 있을 때만 실 init.
    // 두 init 은 본문 의존성 없어 병렬. 실패해도 앱 흐름 차단 X (silent).
    await Promise.all([
      initSentryIfConsented().catch(() => {}),
      initPosthogIfConsented().catch(() => {}),
    ]);
    track("app_started");

    // 2026-05-28: 세션 없으면 LoginScreen 노출 (자동 익명 생성 X)
    let sess: { userId: string } | null;
    try {
      sess = await getCurrentSession();
    } catch (e) {
      setState({ phase: "auth_error", message: e instanceof Error ? e.message : String(e) });
      return;
    }
    if (!sess) {
      setState({ phase: "login" });
      return;
    }

    // 🚀 2026-05-29: 다른 SNS 로 들어왔는지 감지 → 강제 안내 Alert
    // getCurrentSession 에서 이미 user 검증됨. 여기서 user 정보 가져오기.
    let currentProvider: "google" | "apple" | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      currentProvider = pickProvider(user?.identities);
    } catch {
      // 네트워크/세션 문제 — 그냥 LoginScreen 으로
      setState({ phase: "login" });
      return;
    }
    const firstProvider = await readFirstProvider();
    if (currentProvider && firstProvider && currentProvider !== firstProvider) {
      // 🚀 2026-05-29 사용자 결정 — '서로 다른 나' 문제 차단:
      // 다른 SNS 로 들어오면 → Alert 안내 → 새 user 즉시 영구 삭제 (cascade) → LoginScreen 강제 복귀.
      // "그래도 진행" 옵션 없음. 데이터 분리 / orphan user 누적 차단.
      await showDifferentProviderAlert(firstProvider, currentProvider);
      try {
        await deleteAccount();   // 새 user cascade 삭제 + signOut
      } catch {
        await supabase.auth.signOut().catch(() => {});
      }
      setState({ phase: "login" });
      return;
    } else if (currentProvider && !firstProvider) {
      await rememberFirstProvider(currentProvider);
    }

    try {
      const profile = await fetchProfile(sess.userId);
      identify(sess.userId);   // PostHog 식별 (user.id 만, M6 본문 X)
      if (profile) {
        // 4-L: MVP 베타 30일 access 만료 검사 — onboarding 마친 사용자만 대상
        const access = await checkMvpAccess(sess.userId);
        if (access.kind === "expired") {
          setState({ phase: "locked", expiredAt: access.expiredAt });
          return;
        }
        setState({ phase: "main", profile });
        // Push token 등록은 사용자가 정원 화면 알림 토글 ON 할 때만 — 자동 권한 요청 X (M3 능동적 진입)
      } else {
        setState({ phase: "onboarding", userId: sess.userId });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState({ phase: "auth_error", message: msg });
    }
  }

  useEffect(() => { boot(); }, []);

  // 🚀 2026-05-29 — 다른 SNS 로 들어옴 강제 안내 (확인 1개만, 데이터 분리 차단)
  // 사용자 결정: "그래도 진행" 제거. 무조건 처음 가입 SNS 로 다시 로그인 강제.
  function showDifferentProviderAlert(first: "google" | "apple", current: "google" | "apple"): Promise<void> {
    return new Promise((resolve) => {
      Alert.alert(
        t("login.differentProvider.title"),
        t("login.differentProvider.body", {
          first:   t(`providerName.${first}`),
          current: t(`providerName.${current}`),
        }),
        [
          {
            text: t("login.differentProvider.ok"),
            onPress: () => resolve(),
          },
        ],
        { cancelable: false },
      );
    });
  }

  function pickProvider(identities: { provider: string }[] | undefined): "google" | "apple" | null {
    if (!identities) return null;
    for (const i of identities) {
      if (i.provider === "google" || i.provider === "apple") return i.provider;
    }
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F3E9" }}>
      <View style={{ flex: 1, width: "100%", alignItems: "center" }}>
        <View style={{ flex: 1, width: "100%", maxWidth: 440 }}>
          {state.phase === "loading" && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8F3E9" }}>
              <ActivityIndicator color="#1A1A1F" />
            </View>
          )}
          {state.phase === "auth_error" && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F8F3E9" }}>
              <Text className="text-ink text-base font-medium mb-2">⚠ Auth 오류</Text>
              <Text className="text-ink-soft text-sm text-center">{state.message}</Text>
              <Text className="text-mute text-xs mt-4 text-center">
                Supabase Dashboard → Authentication → Sign In / Up{"\n"}
                "Allow anonymous sign-ins" 이 ON 인지 확인하세요.
              </Text>
            </View>
          )}
          {state.phase === "consent" && <ConsentScreen onContinue={boot} />}
          {state.phase === "login" && <LoginScreen onLoggedIn={boot} />}
          {state.phase === "onboarding" && <Onboarding onDone={boot} />}
          {state.phase === "main" && <FlowRouter profile={state.profile} onAccountDeleted={boot} />}
          {state.phase === "locked" && <LockedScreen expiredAt={state.expiredAt} />}
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
