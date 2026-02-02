import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationSettingsSchema } from "~/modules/settings/settings.schema";

interface SettingsState {
  // Notification preferences
  notifications: NotificationSettingsSchema;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  updateNotifications: (settings: Partial<NotificationSettingsSchema>) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  resetNotifications: () => void;
}

const defaultNotifications: NotificationSettingsSchema = {
  emailOnTransactionAccepted: true,
  emailOnTransactionRejected: true,
  emailPaymentReminder: true,
  eventReminder: true,
  emailNotifications: true,
  inAppNotifications: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: defaultNotifications,
      isLoading: false,
      isSaving: false,

      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setSaving: (saving) => set({ isSaving: saving }),

      resetNotifications: () => set({ notifications: defaultNotifications }),
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    },
  ),
);
