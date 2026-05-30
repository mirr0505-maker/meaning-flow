// 🚀 Phase 3 STEP 3-F — 작성 시점 자해 키워드 감지 모달
// PRD 5.1 / CLAUDE.md M4·M7
//
// ReportModal 안 CrisisView 와 시각 톤은 같지만, 흐름이 다름:
//   - 신고가 아니라 "본인용 안내" — "신고 마저 제출" 버튼 없음
//   - 톤: 본인이 힘들 수 있다는 가능성에 부드럽게 닿음
//   - 일기는 그대로 저장됨 (차단 아님)

import { useTranslation } from "react-i18next";
import { Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { crisisResourcesFor } from "../../lib/reports";

export function SelfHarmModal({
  visible,
  lang,
  onClose,
}: {
  visible: boolean;
  lang: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const r = crisisResourcesFor(lang);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-card bg-night-bg2 border border-night-hair p-5 mx-4"
          style={{ width: "100%", maxWidth: 360 }}
        >
          <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ paddingBottom: 8 }}>
            <Text className="text-night-ink text-base font-medium">
              {t("safety.writeTime.title")}
            </Text>
            <Text className="text-night-soft text-xs mt-2 leading-relaxed">
              {t("safety.writeTime.intro")}
            </Text>

            <View className="mt-4">
              {r.hotlines.map((h) => (
                <Pressable
                  key={h.name}
                  onPress={() => Linking.openURL(`tel:${h.phone.replace(/[^0-9+]/g, "")}`)}
                  className="rounded-card border border-night-soft bg-night-bg3 p-3 mb-2"
                >
                  <Text className="text-night-ink text-sm font-medium">{h.name}</Text>
                  <Text className="text-night-ink text-base font-mono mt-0.5">{h.phone}</Text>
                  {h.hours && <Text className="text-night-muted text-[11px] mt-0.5">{h.hours}</Text>}
                  {h.note  && <Text className="text-night-muted text-[11px] mt-0.5 italic">{h.note}</Text>}
                </Pressable>
              ))}
            </View>

            <Text className="text-night-muted text-[11px] mt-3 leading-relaxed italic">
              {t(r.webNoticeKey)}
            </Text>

            <Pressable
              onPress={onClose}
              className="mt-5 rounded-pill bg-night-bg3 border border-night-hair items-center justify-center"
              style={{ height: 44 }}
            >
              <Text className="text-night-soft text-sm">{t("safety.writeTime.closeOnly")}</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
