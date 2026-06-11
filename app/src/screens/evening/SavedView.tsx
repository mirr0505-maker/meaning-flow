import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import type { PublishResult } from "../../lib/resonance";

export function SavedView({
  share,
  publish,
  onEditAgain,
}: {
  share: boolean;
  publish?: PublishResult;
  onEditAgain: () => void;
}) {
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
