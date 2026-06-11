import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

export type DeletePhase = "hidden" | "first" | "final" | "deleting" | "error";

export function DeleteConfirmModal({
  visible,
  phase,
  errMsg,
  onCancel,
  onContinue,
  onDelete,
}: {
  visible: boolean;
  phase: DeletePhase;
  errMsg: string | null;
  onCancel: () => void;
  onContinue: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => phase !== "deleting" && onCancel()}
    >
      <Pressable
        onPress={() => phase !== "deleting" && onCancel()}
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-card bg-night-bg2 border border-night-hair p-5 mx-4"
          style={{ width: "100%", maxWidth: 360 }}
        >
          {phase === "first" && (
            <View>
              <Text className="text-night-ink text-base font-medium">
                {t("settings.account.confirm1Title")}
              </Text>
              <Text className="text-night-soft text-xs mt-2 leading-relaxed">
                {t("settings.account.confirm1Body")}
              </Text>
              <Pressable
                onPress={onContinue}
                className="mt-5 rounded-pill border border-night-soft items-center justify-center"
                style={{ height: 44 }}
              >
                <Text className="text-night-soft text-sm">
                  {t("settings.account.confirm1Continue")}
                </Text>
              </Pressable>
              <Pressable onPress={onCancel} className="mt-3 items-center">
                <Text className="text-night-muted text-xs underline">
                  {t("settings.account.cancel")}
                </Text>
              </Pressable>
            </View>
          )}

          {phase === "final" && (
            <View>
              <Text className="text-night-ink text-base font-medium">
                {t("settings.account.confirm2Title")}
              </Text>
              <Text className="text-night-soft text-xs mt-2 leading-relaxed">
                {t("settings.account.confirm2Body")}
              </Text>
              <Pressable
                onPress={onDelete}
                className="mt-5 rounded-pill bg-night-ink items-center justify-center"
                style={{ height: 44 }}
              >
                <Text className="text-night-bg text-sm font-medium">
                  {t("settings.account.confirm2Delete")}
                </Text>
              </Pressable>
              <Pressable onPress={onCancel} className="mt-3 items-center">
                <Text className="text-night-muted text-xs underline">
                  {t("settings.account.cancel")}
                </Text>
              </Pressable>
            </View>
          )}

          {phase === "deleting" && (
            <View className="items-center py-4">
              <ActivityIndicator color="#C9C5DE" />
              <Text className="text-night-soft text-xs mt-3">
                {t("settings.account.deleting")}
              </Text>
            </View>
          )}

          {phase === "error" && (
            <View>
              <Text className="text-night-ink text-sm font-medium">
                {t("settings.account.deleteErrorTitle")}
              </Text>
              <Text className="text-night-muted text-xs mt-2">{errMsg}</Text>
              <Pressable
                onPress={onCancel}
                className="mt-4 rounded-pill border border-night-hair items-center justify-center"
                style={{ height: 40 }}
              >
                <Text className="text-night-soft text-xs">
                  {t("settings.account.cancel")}
                </Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
