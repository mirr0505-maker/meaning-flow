// 🚀 🌙 NightTimer — 5분 영감 타이머 (PRD 4.4 F-NIT-002)
// "아이디어가 멈추지 않을 때 켜는 타이머. 딱 5분만 쏟아내고, 강제로 닫힙니다."
// PRD/UserGuide 원문 그대로: 텍스트 기반 5분 카운트다운.
// SVG ring 은 react-native-svg 추가 부담 회피 — 가로 진행 막대로 대체 (디자인 의도 보존).

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

import { addThought } from "../../lib/thoughtVault";

const DURATION_SEC = 5 * 60; // 5분 = 300초

type Phase = "idle" | "running" | "paused" | "done";

export function NightTimer({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(DURATION_SEC);
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1초 틱
  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPhase("done");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  function handleStartPause() {
    if (phase === "idle" || phase === "paused") setPhase("running");
    else if (phase === "running") setPhase("paused");
  }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle");
    setRemaining(DURATION_SEC);
  }

  async function handleSaveToVault() {
    const t2 = text.trim();
    if (!t2) return;
    try {
      await addThought({ userId, text: t2, source: "inspiration_5min" });
      setSavedAt(Date.now());
      setText("");
    } catch {
      // 저장 실패 시 텍스트 유지 — 사용자가 직접 보관함 탭으로 옮길 수 있음
    }
  }

  const mm = String(Math.floor(remaining / 60)).padStart(1, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = 1 - remaining / DURATION_SEC; // 0 → 1

  return (
    <View>
      <Text className="text-night-ink italic font-light" style={{ fontSize: 19, lineHeight: 28 }}>
        {t("flow.night.timer.lead")}
      </Text>

      {/* 큰 mono 숫자 + 가로 진행바 */}
      <View className="mt-8 items-center">
        <Text
          className="text-night-ink"
          style={{ fontSize: 64, fontWeight: "300", letterSpacing: -2, fontVariant: ["tabular-nums"] }}
        >
          {mm}:{ss}
        </Text>
        <Text className="text-night-muted text-[10px] tracking-widest mt-1.5">
          {phase === "done"    ? t("flow.night.timer.statusDone")    :
           phase === "running" ? t("flow.night.timer.statusPouring") :
           phase === "paused"  ? t("flow.night.timer.statusPaused")  :
                                 t("flow.night.timer.statusReady")}
        </Text>
        <View className="mt-5 bg-night-bg3 rounded-full overflow-hidden" style={{ width: 220, height: 4 }}>
          <View className="bg-night-soft h-full" style={{ width: `${progress * 100}%` }} />
        </View>
      </View>

      {/* 제어 버튼 */}
      <View className="mt-6 flex-row" style={{ gap: 8 }}>
        <Pressable
          onPress={handleStartPause}
          disabled={phase === "done"}
          className={
            "flex-1 rounded-pill items-center justify-center " +
            (phase === "done" ? "bg-night-bg2 opacity-40" : "bg-night-ink")
          }
          style={{ height: 48 }}
        >
          <Text className="text-night-bg text-sm font-medium">
            {phase === "running" ? t("flow.night.timer.pause") :
             phase === "paused"  ? t("flow.night.timer.resume") :
             phase === "done"    ? t("flow.night.timer.stopped") :
                                   t("flow.night.timer.start")}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleReset}
          className="rounded-pill border border-night-hair bg-night-bg2 items-center justify-center px-5"
          style={{ height: 48 }}
        >
          <Text className="text-night-soft text-sm">{t("flow.night.timer.reset")}</Text>
        </Pressable>
      </View>

      {/* 5분 중·후 텍스트 입력 — 쏟아낸 결과 보관 */}
      {(phase === "running" || phase === "paused" || phase === "done") && (
        <View className="mt-6 rounded-card border border-night-hair bg-night-bg2 p-4">
          <Text className="text-night-muted text-[10px] tracking-widest mb-2">
            {t("flow.night.timer.captureLabel")}
          </Text>
          <TextInput
            multiline
            value={text}
            onChangeText={setText}
            placeholder={t("flow.night.timer.capturePlaceholder")}
            placeholderTextColor="#7E7E92"
            style={{
              minHeight: 80,
              fontSize: 14,
              lineHeight: 22,
              color: "#E8E6E0",
              textAlignVertical: "top",
            }}
          />
          <Pressable
            onPress={handleSaveToVault}
            disabled={!text.trim()}
            className={
              "mt-2 rounded-pill border border-night-hair bg-night-bg3 items-center justify-center " +
              (!text.trim() ? "opacity-30" : "")
            }
            style={{ height: 40 }}
          >
            <Text className="text-night-ink text-xs">{t("flow.night.timer.saveBtn")}</Text>
          </Pressable>
          {savedAt && (
            <Text className="text-night-muted text-[11px] mt-2 italic">
              {t("flow.night.timer.savedHint")}
            </Text>
          )}
        </View>
      )}

      {/* 강제 종료 카피 (M1 — "강제로 닫힙니다" 정신 보존) */}
      {phase === "done" && (
        <Text
          className="text-night-soft italic text-center mt-6"
          style={{ fontSize: 14, lineHeight: 22 }}
        >
          {t("flow.night.timer.afterCopy")}
        </Text>
      )}

    </View>
  );
}
