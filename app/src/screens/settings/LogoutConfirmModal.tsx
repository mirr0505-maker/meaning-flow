import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

export type LogoutPhase = "hidden" | "confirm" | "out" | "error";

export function LogoutConfirmModal({
  visible,
  phase,
  logoutErr,
  onCancel,
  onLogout,
}: {
  visible: boolean;
  phase: LogoutPhase;
  logoutErr: string | null;
  onCancel: () => void;
  onLogout: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => phase !== "out" && onCancel()}
    >
      <Pressable
        onPress={() => phase !== "out" && onCancel()}
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-card bg-night-bg2 border border-night-hair p-5 mx-4"
          style={{ width: "100%", maxWidth: 360 }}
        >
          {phase === "confirm" && (
            <View>
              <Text className="text-night-ink text-base font-medium">
                {t("settings.account.logoutConfirmTitle")}
              </Text>
              <Text className="text-night-soft text-xs mt-2 leading-relaxed">
                {t("settings.account.logoutConfirmBody")}
              </Text>
              <Pressable
                onPress={onLogout}
                className="mt-5 rounded-pill bg-night-ink items-center justify-center"
                style={{ height: 44 }}
              >
                <Text className="text-night-bg text-sm font-medium">
                  {t("settings.account.logoutConfirmBtn")}
                </Text>
              </Pressable>
              <Pressable onPress={onCancel} className="mt-3 items-center">
                <Text className="text-night-muted text-xs underline">
                  {t("settings.account.cancel")}
                </Text>
              </Pressable>
            </View>
          )}

          {phase === "out" && (
            <View className="items-center py-4">
              <ActivityIndicator color="#C9C5DE" />
              <Text className="text-night-soft text-xs mt-3">
                {t("settings.account.loggingOut")}
              </Text>
            </View>
          )}

          {phase === "error" && (
            <View>
              <Text className="text-night-ink text-sm font-medium">
                {t("settings.account.logoutErrorTitle")}
              </Text>
              <Text className="text-night-muted text-xs mt-2">{logoutErr}</Text>
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
