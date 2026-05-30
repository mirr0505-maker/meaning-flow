// 🚀 Phase 3 STEP 3-G — 정원 화면 알림 토글 (M3: 능동적 진입)
// 기본 OFF. 사용자가 의지로 ON → OS 권한 요청 → token 등록.
// OFF 로 되돌리면 profiles.expo_push_token = NULL → cron 발송 대상에서 자동 제외.
// PRD F-RES-003 의 "1일 1회 합산 푸시" 는 유지하되, 받을지 말지는 사용자가 결정.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Switch, Text, View } from "react-native";

import {
  registerPushTokenForProfile,
  unregisterPushTokenForProfile,
} from "../../lib/notifications";
import { supabase } from "../../lib/supabase";

export function PushToggleCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState<boolean | null>(null); // null = loading
  const [busy, setBusy] = useState(false);

  // 마운트 시 현재 토큰 상태 fetch — token IS NOT NULL 이면 토글 ON
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setEnabled(!!(data as { expo_push_token: string | null } | null)?.expo_push_token);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleToggle(next: boolean) {
    if (busy || enabled === null) return;
    setBusy(true);
    try {
      if (next) {
        const res = await registerPushTokenForProfile(userId);
        if (res.ok) {
          setEnabled(true);
        } else {
          // 권한 거부·Expo Go·기기 환경 — 토글 OFF 그대로 + 부드러운 안내
          Alert.alert(
            t("notifications.permissionDeniedTitle"),
            t("notifications.permissionDeniedBody"),
          );
          setEnabled(false);
        }
      } else {
        const res = await unregisterPushTokenForProfile(userId);
        setEnabled(res.ok ? false : true);
      }
    } finally {
      setBusy(false);
    }
  }

  if (enabled === null) {
    return (
      <View
        className="rounded-card border border-night-hair bg-dusk-card p-3 mb-4 items-center justify-center"
        style={{ height: 56 }}
      >
        <ActivityIndicator color="#9A9486" />
      </View>
    );
  }

  return (
    <View className="rounded-card border border-night-hair bg-dusk-card p-3 mb-4 flex-row items-center">
      <Switch
        value={enabled}
        onValueChange={handleToggle}
        disabled={busy}
        trackColor={{ false: "#2D2E3A", true: "#B8829C" }}
        thumbColor={enabled ? "#FBF8F1" : "#7E7E92"}
      />
      <View className="flex-1 ml-3">
        <Text className="text-night-ink text-xs font-medium">
          🌿 {t("notifications.toggleLabel")}
        </Text>
        <Text className="text-night-muted text-[11px] mt-0.5 leading-relaxed">
          {enabled ? t("notifications.toggleDescOn") : t("notifications.toggleDescOff")}
        </Text>
      </View>
    </View>
  );
}
