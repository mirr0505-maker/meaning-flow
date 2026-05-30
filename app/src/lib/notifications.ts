// 🚀 Phase 3 STEP 3-G-1 — Expo Push Token 등록 + profile 저장
// PRD 4.5 F-RES-003 / CLAUDE.md M3·M6
//
// Expo SDK 54 canonical 패턴:
//   1. Android: setNotificationChannelAsync (permission 보다 먼저)
//   2. getPermissionsAsync → requestPermissionsAsync (필요 시)
//   3. getExpoPushTokenAsync({ projectId }) — projectId 는 EAS project ID
//   4. profile 에 토큰 + device timezone 저장
//
// **Expo Go Android (SDK 53+) 에선 push 미지원** — development build 필요 (EAS Build 셋업 완료).
// Expo Go iOS 에서도 SDK 53+ 권장 X. 안전을 위해 try/catch 로 native module 없음 케이스 silent fail.
//
// 권한 거부도 정상 흐름 — 알림은 옵션, 앱은 정상 동작 (M3 정신 — 사용자 의지로 진입).

import Constants from "expo-constants";
import * as Localization from "expo-localization";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { supabase } from "./supabase";

export type RegisterPushResult =
  | { ok: true; token: string }
  | {
      ok: false;
      reason:
        | "permission_denied"
        | "no_project_id"
        | "not_supported"
        | "save_failed"
        | "unknown";
    };

export async function registerPushTokenForProfile(
  userId: string,
): Promise<RegisterPushResult> {
  try {
    // 1. Android channel — permission 보다 먼저
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default channel",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    // 2. 권한 — 이미 granted 면 재요청 안 함 (UX 압박 회피)
    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }
    if (final !== "granted") {
      return { ok: false, reason: "permission_denied" };
    }

    // 3. projectId — app.json 의 extra.eas.projectId 자동 추출
    const projectId =
      (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;
    if (!projectId) return { ok: false, reason: "no_project_id" };

    // 4. Expo Push Token
    const tokenObj = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenObj?.data;
    if (!token) return { ok: false, reason: "unknown" };

    // 5. profile 갱신 — token + device timezone (e.g. 'Asia/Seoul')
    // timezone 은 첫 등록 시점에만 갱신. 사용자가 여행 등으로 변경되면 다음 진입 때 자동 반영.
    const tz =
      Localization.getCalendars?.()?.[0]?.timeZone ??
      Localization.getLocales?.()?.[0]?.regionCode ??
      null;
    const patch: Record<string, string> = { expo_push_token: token };
    if (tz) patch.timezone = tz;

    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId);
    if (error) return { ok: false, reason: "save_failed" };

    return { ok: true, token };
  } catch {
    // native module 없음 (Expo Go) 또는 기타 — 앱 흐름 차단 X
    return { ok: false, reason: "not_supported" };
  }
}

// 🚀 토글 OFF 또는 명시적 unsubscribe — profile.expo_push_token 을 NULL 로 비움
// cron 발송 view (push_recipients_at_06) 가 IS NOT NULL 필터라 자동으로 대상에서 제외됨.
// OS 권한 자체는 OS 설정에서만 revoke 가능 (앱이 OS 권한 해제 불가) — 토큰 비우는 것만으로 충분.
export async function unregisterPushTokenForProfile(
  userId: string,
): Promise<{ ok: boolean }> {
  const { error } = await supabase
    .from("profiles")
    .update({ expo_push_token: null })
    .eq("id", userId);
  return { ok: !error };
}
