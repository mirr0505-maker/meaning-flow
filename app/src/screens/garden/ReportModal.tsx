// 🚀 Phase 3 STEP 3-E — 공명방 신고 모달 + 자해 시 위기 자원 자동 노출
// PRD 4.5 F-RES-005 / CLAUDE.md M4·M7
//
// 흐름:
//   1. 사유 선택 (abuse_hate · spam · self_harm · other)
//   2. 자해 선택 시: 위기 자원 모달이 먼저 뜸 (사용자가 노출되도록) — 신고는 그 이후 INSERT
//   3. 신고 INSERT — auto_hide_on_reports trigger 가 3회 누적 시 hidden, 자해 1회면 pending_review
//   4. 본인 시각에선 즉시 hidden 처리 (onSubmitted 콜백)

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { crisisResourcesFor, REPORT_REASONS, submitReport, type ReportReason } from "../../lib/reports";

export function ReportModal({
  visible, postId, selfLang, onClose, onSubmitted,
}: {
  visible: boolean;
  postId: string;
  selfLang: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"pick" | "crisis" | "submitting" | "error">("pick");
  const [pickedReason, setPickedReason] = useState<ReportReason | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  function handleClose() {
    setPhase("pick");
    setPickedReason(null);
    setErrMsg(null);
    onClose();
  }

  async function actuallySubmit(reason: ReportReason) {
    setPhase("submitting");
    const res = await submitReport({ postId, reason });
    if (res.ok) {
      onSubmitted();
    } else {
      setErrMsg(t(res.messageKey));
      setPhase("error");
    }
  }

  function handlePick(reason: ReportReason) {
    setPickedReason(reason);
    if (reason === "self_harm") {
      // 자해 선택 시 — 위기 자원 모달 먼저 노출 (M4). 신고 INSERT 는 사용자가 "신고를 마저 제출" 누를 때.
      setPhase("crisis");
    } else {
      actuallySubmit(reason);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable onPress={handleClose} className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-card bg-night-bg2 border border-night-hair p-5 mx-4"
          style={{ width: "100%", maxWidth: 360 }}
        >
          {phase === "pick"       && <PickReasonView onPick={handlePick} onClose={handleClose} />}
          {phase === "crisis"     && (
            <CrisisView
              lang={selfLang}
              onContinueReport={() => actuallySubmit("self_harm")}
              onClose={handleClose}
            />
          )}
          {phase === "submitting" && (
            <Text className="text-night-soft text-sm text-center py-6">{t("garden.report.submitting")}</Text>
          )}
          {phase === "error" && (
            <View className="py-2">
              <Text className="text-night-ink text-sm font-medium">{t("garden.report.errorTitle")}</Text>
              <Text className="text-night-muted text-xs mt-2">{errMsg}</Text>
              <Pressable
                onPress={handleClose}
                className="mt-4 rounded-pill bg-night-bg3 border border-night-hair items-center justify-center"
                style={{ height: 40 }}
              >
                <Text className="text-night-soft text-xs">{t("garden.report.close")}</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PickReasonView({ onPick, onClose }: { onPick: (r: ReportReason) => void; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="text-night-ink text-base font-medium">{t("garden.report.title")}</Text>
      <Text className="text-night-muted text-xs mt-1.5 leading-relaxed">{t("garden.report.subtitle")}</Text>

      <View className="mt-4">
        {REPORT_REASONS.map((r) => (
          <Pressable
            key={r}
            onPress={() => onPick(r)}
            className="rounded-card border border-night-hair bg-night-bg3 p-3 mb-2"
          >
            <Text className="text-night-ink text-sm">{t(`garden.report.reason.${r}`)}</Text>
            <Text className="text-night-muted text-[11px] mt-0.5">{t(`garden.report.reasonDesc.${r}`)}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onClose} className="mt-3 items-center">
        <Text className="text-night-muted text-xs underline">{t("garden.report.cancel")}</Text>
      </Pressable>
    </View>
  );
}

function CrisisView({ lang, onContinueReport, onClose }: {
  lang: string;
  onContinueReport: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const r = crisisResourcesFor(lang);

  return (
    <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ paddingBottom: 8 }}>
      <Text className="text-night-ink text-base font-medium">{t("garden.crisis.title")}</Text>
      <Text className="text-night-soft text-xs mt-2 leading-relaxed">{t("garden.crisis.intro")}</Text>

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

      {/* 신고를 마저 제출 vs 닫기 */}
      <Pressable
        onPress={onContinueReport}
        className="mt-5 rounded-pill bg-night-ink items-center justify-center"
        style={{ height: 44 }}
      >
        <Text className="text-night-bg text-sm font-medium">{t("garden.crisis.continueReport")}</Text>
      </Pressable>
      <Pressable onPress={onClose} className="mt-3 items-center">
        <Text className="text-night-muted text-xs underline">{t("garden.crisis.closeOnly")}</Text>
      </Pressable>
    </ScrollView>
  );
}
