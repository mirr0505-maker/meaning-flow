// 🚀 Phase 4 STEP 4-L — 베타 30일 access 만료 후 화면
// 사용자 결정 2026-05-23: 데이터 보존, "내 데이터 내보내기" 우선 노출, 정식 출시 알림 신청
//
// M2 카피 — 명령형 X, "30일이 끝났어요" 가 아니라 "30일의 흐름을 함께 흘려보냈어요" 같은 권유형

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Text, View } from "react-native";

import { exportMyData } from "../lib/dataExport";

export function LockedScreen({ expiredAt }: { expiredAt: Date }) {
  const { t, i18n } = useTranslation();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await exportMyData();
      if (!res.ok) {
        Alert.alert(t("locked.exportErrorTitle"), t(res.messageKey));
        return;
      }
      await Share.share({
        title:   "meaning-flow-export.json",
        message: res.json,
      });
    } catch {
      // 공유 시트 취소 — silent
    } finally {
      setExporting(false);
    }
  }

  // 만료 날짜 표시 — 사용자 locale 기준
  const expiredAtStr = expiredAt.toLocaleDateString(
    i18n.language.startsWith("ja") ? "ja-JP" :
    i18n.language.startsWith("en") ? "en-US" : "ko-KR",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <View className="flex-1 bg-night-bg">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 }}>
        <Text className="text-night-muted text-xs tracking-widest mb-3">
          {t("locked.eyebrow")}
        </Text>
        <Text className="text-night-ink italic font-light mb-3" style={{ fontSize: 22, lineHeight: 32 }}>
          {t("locked.title")}
        </Text>
        <Text className="text-night-soft text-sm leading-relaxed mb-2">
          {t("locked.body")}
        </Text>
        <Text className="text-night-muted text-xs mb-8 italic">
          {t("locked.expiredAt", { date: expiredAtStr })}
        </Text>

        {/* 데이터 내보내기 — 우선 노출 */}
        <View className="rounded-card border border-night-hair bg-night-bg2 p-4 mb-4">
          <Text className="text-night-ink text-sm font-medium">
            {t("locked.exportLabel")}
          </Text>
          <Text className="text-night-muted text-[11px] mt-1.5 leading-relaxed">
            {t("locked.exportDesc")}
          </Text>
          <Pressable
            onPress={handleExport}
            disabled={exporting}
            className="mt-4 rounded-pill bg-night-ink items-center justify-center"
            style={{ height: 44, opacity: exporting ? 0.5 : 1 }}
          >
            {exporting ? (
              <ActivityIndicator color="#FBF8F1" />
            ) : (
              <Text className="text-night-bg text-sm font-medium">
                {t("locked.exportBtn")}
              </Text>
            )}
          </Pressable>
        </View>

        {/* 정식 출시 알림 신청 — 외부 채널 안내 (현재는 placeholder, 출시 직전 URL 채움) */}
        <View className="rounded-card border border-night-hair bg-night-bg2 p-4">
          <Text className="text-night-ink text-sm font-medium">
            {t("locked.notifyLabel")}
          </Text>
          <Text className="text-night-muted text-[11px] mt-1.5 leading-relaxed">
            {t("locked.notifyDesc")}
          </Text>
        </View>

        <Text className="text-night-muted text-[11px] text-center mt-8 leading-relaxed italic">
          {t("locked.dataKept")}
        </Text>
      </ScrollView>
    </View>
  );
}
