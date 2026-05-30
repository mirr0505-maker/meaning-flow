// 🚀 🌆 통합 모드 (Evening / Integration) — PRD 4.3
// 의미 일기 한 줄 (최대 200자) + 두 자아 통합 질문 + 공명방 토글
// 공명방 토글은 reflections.shared_to_resonance 컬럼 저장만 (Phase 2 범위).
// 실 게시·OpenAI Moderation 호출은 Phase 3 STEP 으로 분리 (M4 위반 방지).
// 톤: dusk (그레이) — 다크로 가기 전 중간 단계. text·card 다크 톤이지만 카드 배경은 #6E6B7A.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Switch, Text, TextInput, View } from "react-native";

import type { Profile } from "../lib/profiles";
import {
  fetchTodayReflection,
  MAX_REFLECTION_LEN,
  questionKeyForComboKey,
  saveTodayReflection,
  type Reflection,
} from "../lib/reflections";
import { track } from "../lib/posthog";
import { publishToGarden, type DuplicateExisting, type PublishResult } from "../lib/resonance";
import { containsSelfHarm } from "../lib/safety/selfHarmKeywords";
import { SelfHarmModal } from "./safety/SelfHarmModal";

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

// 🚀 백로그 ⑥ (b) — 오늘 이미 정원에 보낸 글이 있을 때 부드러운 안내 카드
function DuplicatePromptCard({
  existing,
  onOverwrite,
  onKeep,
}: {
  existing: DuplicateExisting;
  onOverwrite: () => void;
  onKeep: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="mt-6 rounded-card border border-night-hair bg-dusk-card p-5">
      <Text className="text-night-ink text-sm font-medium">
        {t("garden.duplicateToday.title")}
      </Text>
      <Text className="text-night-soft text-xs mt-2 leading-relaxed">
        {t("garden.duplicateToday.intro")}
      </Text>

      {/* 기존 글 preview */}
      <View className="mt-4 rounded-card border border-night-hair bg-night-bg3 p-3">
        <Text className="text-night-muted text-[11px] mb-1">
          {t("garden.duplicateToday.existingLabel")}
        </Text>
        <Text className="text-night-ink text-sm italic" style={{ lineHeight: 22 }}>
          {existing.content}
        </Text>
      </View>

      <Pressable
        onPress={onOverwrite}
        className="mt-5 rounded-pill bg-night-ink items-center justify-center"
        style={{ height: 44 }}
      >
        <Text className="text-night-bg text-sm font-medium">
          {t("garden.duplicateToday.overwrite")}
        </Text>
      </Pressable>
      <Pressable onPress={onKeep} className="mt-3 items-center">
        <Text className="text-night-muted text-xs underline">
          {t("garden.duplicateToday.keep")}
        </Text>
      </Pressable>
    </View>
  );
}

// 🚀 저장 후 결과 표시 — share OFF / share ON 성공 / share ON 모더레이션 차단 분기
function SavedView({
  share, publish, onEditAgain,
}: { share: boolean; publish?: PublishResult; onEditAgain: () => void }) {
  const { t } = useTranslation();

  // 결과 카피 결정
  let headlineKey: string;
  if (!share)                                          headlineKey = "flow.evening.savedPrivate";
  else if (publish?.ok && publish.updated)             headlineKey = "flow.evening.savedUpdated";
  else if (publish?.ok)                                headlineKey = "flow.evening.savedShared";
  else if (publish && !publish.ok && publish.reason === "duplicate_today") {
                                                       headlineKey = "flow.evening.duplicateKept";
  } else {
    const r = publish?.reason;
    headlineKey =
      r === "moderation_blocked"     ? "garden.moderationBlocked"     :
      r === "moderation_unavailable" ? "garden.moderationDown"        :
      r === "network"                ? "garden.networkError"          :
      r === "auth"                   ? "garden.authError"             :
                                       "garden.unknownError";
  }

  const blocked =
    share && publish && !publish.ok &&
    publish.reason !== "duplicate_today"; // duplicateKept 는 본인 결정으로 유지, 차단 안내 X

  return (
    <View className="mt-6 items-center">
      <Text className="text-night-soft italic text-sm text-center" style={{ lineHeight: 22 }}>
        {t(headlineKey)}
      </Text>
      {blocked && (
        <Text className="text-night-muted text-[11px] text-center mt-2" style={{ lineHeight: 18 }}>
          {t("garden.reflectionPreserved")}
        </Text>
      )}
      <Pressable onPress={onEditAgain} className="mt-4">
        <Text className="text-night-muted text-xs underline">
          {t("flow.evening.editAgain")}
        </Text>
      </Pressable>
    </View>
  );
}

function WritingForm({
  text,
  share,
  onTextChange,
  onShareChange,
  onSubmit,
}: {
  text: string;
  share: boolean;
  onTextChange: (v: string) => void;
  onShareChange: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const canSubmit = text.trim().length > 0;

  return (
    <View>
      {/* 입력 카드 */}
      <View
        className="mt-5 rounded-card border border-night-hair bg-dusk-card p-5"
        style={{ minHeight: 180 }}
      >
        <TextInput
          multiline
          value={text}
          onChangeText={onTextChange}
          maxLength={MAX_REFLECTION_LEN}
          placeholder={t("flow.evening.placeholder")}
          placeholderTextColor="#9A9486"
          style={{
            fontSize: 17,
            lineHeight: 27,
            minHeight: 130,
            color: "#E8E6E0",
            textAlignVertical: "top",
          }}
        />
        <View className="flex-row justify-between items-center border-t border-night-hair pt-3 mt-2">
          <Text className="text-night-muted text-xs">
            {text.length} / {MAX_REFLECTION_LEN}
          </Text>
          <Text className="text-night-muted text-xs">{t("flow.evening.charHint")}</Text>
        </View>
      </View>

      {/* 공명방 토글 — 기본 OFF (M3) */}
      <View
        className={
          "mt-4 rounded-card border p-4 flex-row items-center " +
          (share ? "border-evening bg-evening-soft" : "border-night-hair")
        }
      >
        <Switch
          value={share}
          onValueChange={onShareChange}
          trackColor={{ false: "#2D2E3A", true: "#B8829C" }}
          thumbColor={share ? "#FBF8F1" : "#7E7E92"}
        />
        <View className="flex-1 ml-3">
          <Text className={(share ? "text-ink" : "text-night-ink") + " text-sm font-medium"}>
            🌿 {t("flow.evening.shareLabel")}
          </Text>
          <Text className={(share ? "text-ink-soft" : "text-night-soft") + " text-xs mt-0.5"}>
            {share ? t("flow.evening.shareDescOn") : t("flow.evening.shareDescOff")}
          </Text>
        </View>
      </View>

      {/* 면책 카피 (M7) — 공명방 토글 ON 시만 노출 */}
      {share && (
        <Text className="text-night-muted text-[11px] mt-2 ml-1 leading-relaxed">
          {t("flow.evening.shareDisclaimer")}
        </Text>
      )}

      {/* 저장 */}
      <Pressable
        disabled={!canSubmit}
        onPress={onSubmit}
        className={"mt-5 rounded-pill items-center justify-center bg-night-ink" + (!canSubmit ? " opacity-30" : "")}
        style={{ height: 52 }}
      >
        <Text className="text-night-bg text-base font-medium">{t("flow.evening.submit")}</Text>
      </Pressable>
    </View>
  );
}
