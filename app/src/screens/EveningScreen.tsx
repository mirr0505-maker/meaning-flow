// 🚀 🌆 통합 모드 (Evening / Integration) — PRD 4.3
// 의미 일기 한 줄 (최대 200자) + 두 자아 통합 질문 + 공명방 토글
// 공명방 토글은 reflections.shared_to_resonance 컬럼 저장만 (Phase 2 범위).
// 실 게시·OpenAI Moderation 호출은 Phase 3 STEP 으로 분리 (M4 위반 방지).
// 톤: dusk (그레이) — 다크로 가기 전 중간 단계. text·card 다크 톤이지만 카드 배경은 #6E6B7A.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import type { Profile } from "../lib/profiles";
import {
  fetchTodayReflection,
  questionKeyForComboKey,
  saveTodayReflection,
  type Reflection,
} from "../lib/reflections";
import { track } from "../lib/posthog";
import { publishToGarden, type DuplicateExisting, type PublishResult } from "../lib/resonance";
import { containsSelfHarm } from "../lib/safety/selfHarmKeywords";
import { SelfHarmModal } from "./safety/SelfHarmModal";

import { DuplicatePromptCard } from "./evening/DuplicatePromptCard";
import { SavedView } from "./evening/SavedView";
import { WritingForm } from "./evening/WritingForm";

type Stage =
  | { kind: "loading" }
  | { kind: "writing"; text: string; share: boolean; prior: Reflection | null }
  | { kind: "saving" }
  | { kind: "saved"; share: boolean; publish?: PublishResult }
  // 백로그 ⑥ (b): 같은 user/today row 존재 — 사용자 결정 대기
  | { kind: "duplicate_prompt"; text: string; share: boolean; existing: DuplicateExisting }
  | { kind: "error"; message: string };

export function EveningScreen({ profile }: { profile: Profile }) {
  const { t, i18n } = useTranslation();
  const [stage, setStage] = useState<Stage>({ kind: "loading" });

  // 🚀 작성 시점 자해 감지 (M4·M7) — 같은 writing 세션에서 한 번만 띄움 (반복 노출 압박 X)
  const [selfHarmModalVisible, setSelfHarmModalVisible] = useState(false);
  const [selfHarmAcked, setSelfHarmAcked] = useState(false);

  // text 변경 debounce — 800ms 동안 추가 입력 없으면 키워드 검사
  useEffect(() => {
    if (stage.kind !== "writing") return;
    if (selfHarmAcked) return;
    const text = stage.text;
    if (!text.trim()) return;
    const handle = setTimeout(() => {
      const lang = i18n.language.split("-")[0] ?? "ko";
      if (containsSelfHarm(text, lang)) {
        setSelfHarmModalVisible(true);
        setSelfHarmAcked(true);
        track("self_harm_modal_shown", { lang });  // M4 노출 빈도 — 본문 X
      }
    }, 800);
    return () => clearTimeout(handle);
  }, [stage, i18n.language, selfHarmAcked]);

  // 첫 마운트: 오늘 일기 prefill
  useEffect(() => {
    let cancelled = false;
    fetchTodayReflection(profile.id)
      .then((r) => {
        if (cancelled) return;
        setStage({
          kind: "writing",
          text: r?.reflection_text ?? "",
          share: r?.shared_to_resonance ?? false,
          prior: r,
        });
      })
      .catch((e) =>
        !cancelled &&
        setStage({ kind: "error", message: e instanceof Error ? e.message : String(e) }),
      );
    return () => { cancelled = true; };
  }, [profile.id]);

  async function handleSave() {
    if (stage.kind !== "writing") return;
    const text = stage.text.trim();
    if (!text) return;
    const share = stage.share;
    const lang = i18n.language.split("-")[0] ?? "ko";
    setStage({ kind: "saving" });

    try {
      // 1. 본인 일기 보존 — 공명방 실패해도 일기는 무조건 남는다 (M4 정신)
      await saveTodayReflection({
        userId: profile.id,
        text,
        language: lang,
        sharedToResonance: share,
      });
      // M6: 본문 X, 메타데이터만
      track("reflection_saved", { shared_to_resonance: share, language: lang, char_count: text.length });

      // 2. 공명방 게시 — share=true 일 때만
      let publish: PublishResult | undefined;
      if (share) {
        publish = await publishToGarden({
          content: text,
          language: lang,
          combo_nickname: profile.combo_nickname ?? "combos.unknown",
        });

        // 백로그 ⑥ (b): 같은 user/today row 존재 → 사용자 결정 대기 (정원 row 는 아직 안 건드림)
        if (!publish.ok && publish.reason === "duplicate_today") {
          setStage({ kind: "duplicate_prompt", text, share, existing: publish.existing });
          return;
        }

        // 게시 실패 시 shared_to_resonance 컬럼은 false 로 롤백 (실제 게시 안 됐으니)
        if (!publish.ok) {
          await saveTodayReflection({
            userId: profile.id,
            text,
            language: lang,
            sharedToResonance: false,
          });
        }
      }

      setStage({ kind: "saved", share, publish });
    } catch (e) {
      setStage({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  // 백로그 ⑥ (b): "수정해서 보낼게요" — Edge Function 의 same row UPDATE
  async function handleOverwrite() {
    if (stage.kind !== "duplicate_prompt") return;
    const { text, share } = stage;
    const lang = i18n.language.split("-")[0] ?? "ko";
    setStage({ kind: "saving" });
    try {
      const publish = await publishToGarden({
        content: text,
        language: lang,
        combo_nickname: profile.combo_nickname ?? "combos.unknown",
        overwrite: true,
      });
      setStage({ kind: "saved", share, publish });
    } catch (e) {
      setStage({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  // 백로그 ⑥ (b): "그대로 둘게요" — 정원 row 그대로, 일기는 이미 본인에게 저장됨
  function handleKeepExisting() {
    if (stage.kind !== "duplicate_prompt") return;
    // duplicate_today 결과를 SavedView 로 그대로 전달 — 카피 분기에서 "기존 글 유지" 안내
    setStage({
      kind: "saved",
      share: stage.share,
      publish: { ok: false, reason: "duplicate_today", existing: stage.existing },
    });
  }

  function handleEditAgain() {
    // 저장 후 다시 수정 — 오늘 일기 재로딩. ack 도 리셋해 새 세션처럼 동작.
    setSelfHarmAcked(false);
    setStage({ kind: "loading" });
    fetchTodayReflection(profile.id)
      .then((r) =>
        setStage({
          kind: "writing",
          text: r?.reflection_text ?? "",
          share: r?.shared_to_resonance ?? false,
          prior: r,
        }),
      )
      .catch((e) => setStage({ kind: "error", message: e instanceof Error ? e.message : String(e) }));
  }

  const questionKey = questionKeyForComboKey(profile.combo_nickname);
  const comboName = profile.combo_nickname ? t(profile.combo_nickname) : t("combos.unknown");

  return (
    <View className="px-6 pt-2 pb-6">
      <Text className="text-night-muted text-xs tracking-widest mb-3">
        {t("flow.evening.eyebrow")}
      </Text>
      <Text
        className="text-night-ink italic font-light"
        style={{ fontSize: 22, lineHeight: 32 }}
      >
        {t(questionKey)}
      </Text>
      <Text className="text-night-muted text-xs mt-2.5">
        {t("flow.evening.attribution", { combo: comboName })}
      </Text>

      {stage.kind === "loading" && (
        <View className="mt-5 rounded-card border border-night-hair bg-dusk-card p-6 items-center">
          <ActivityIndicator color="#C9C5DE" />
        </View>
      )}

      {stage.kind === "error" && (
        <View className="mt-5 rounded-card border border-night-hair bg-dusk-card p-5">
          <Text className="text-night-ink text-sm font-medium">{t("flow.loadError")}</Text>
          <Text className="text-night-soft text-xs mt-1">{stage.message}</Text>
        </View>
      )}

      {stage.kind === "writing" && (
        <WritingForm
          text={stage.text}
          share={stage.share}
          onTextChange={(text) => setStage({ ...stage, text })}
          onShareChange={(share) => setStage({ ...stage, share })}
          onSubmit={handleSave}
        />
      )}

      {stage.kind === "saving" && (
        <View className="mt-5 rounded-card border border-night-hair bg-dusk-card p-6 items-center">
          <ActivityIndicator color="#C9C5DE" />
          <Text className="text-night-soft text-xs mt-3">{t("flow.evening.saving")}</Text>
        </View>
      )}

      {stage.kind === "saved" && (
        <SavedView share={stage.share} publish={stage.publish} onEditAgain={handleEditAgain} />
      )}

      {stage.kind === "duplicate_prompt" && (
        <DuplicatePromptCard
          existing={stage.existing}
          onOverwrite={handleOverwrite}
          onKeep={handleKeepExisting}
        />
      )}

      <SelfHarmModal
        visible={selfHarmModalVisible}
        lang={i18n.language}
        onClose={() => setSelfHarmModalVisible(false)}
      />
    </View>
  );
}


