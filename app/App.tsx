import "./global.css";
import "./src/lib/i18n"; // i18n 초기화 (side-effect)

import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";

import { ensureSession } from "./src/lib/auth";
import { fetchProfile, type Profile } from "./src/lib/profiles";
import { FlowRouter } from "./src/screens/FlowRouter";
import { Onboarding } from "./src/onboarding/Onboarding";

// 🚀 App 라우팅 + 모바일 폭 컨테이너
// NativeWind flex-1 이 RN 빌드에서 누락되는 케이스 회피 — 모든 wrapper 에 inline flex:1 보강

type AppState =
  | { phase: "loading" }
  | { phase: "auth_error"; message: string }
  | { phase: "onboarding"; userId: string }
  | { phase: "main"; profile: Profile };

export default function App() {
  const [state, setState] = useState<AppState>({ phase: "loading" });

  async function boot() {
    setState({ phase: "loading" });
    const sess = await ensureSession();
    if ("error" in sess) {
      setState({ phase: "auth_error", message: sess.error });
      return;
    }
    try {
      const profile = await fetchProfile(sess.userId);
      if (profile) setState({ phase: "main", profile });
      else         setState({ phase: "onboarding", userId: sess.userId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState({ phase: "auth_error", message: msg });
    }
  }

  useEffect(() => { boot(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1A1A1F" }}>
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
          {state.phase === "onboarding" && <Onboarding onDone={boot} />}
          {state.phase === "main" && <FlowRouter profile={state.profile} />}
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
