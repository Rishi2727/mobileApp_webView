import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SettingsStore = {
    // Notification settings
    pushAll: boolean;
    push401: boolean;
    push402: boolean;
    push403: boolean;
    push404: boolean;
    pushUniversity: boolean;

    // Actions
    setPushAll: (value: boolean) => void;
    setPush401: (value: boolean) => void;
    setPush402: (value: boolean) => void;
    setPush403: (value: boolean) => void;
    setPush404: (value: boolean) => void;
    setPushUniversity: (value: boolean) => void;
    // Helper for toggling multiple settings
    toggleAllPushSettings: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            // Initial state
            pushAll: true,
            push401: true,
            push402: true,
            push403: true,
            push404: true,
            pushUniversity: true,

            // Setters
            setPushAll: (value: boolean) => {
                set({ pushAll: value });
                // If turning off the main toggle, turn off all other toggles
                if (!value) {
                    get().toggleAllPushSettings(false);
                }
            },
            setPush401: (value: boolean) => set({ push401: value }),
            setPush402: (value: boolean) => set({ push402: value }),
            setPush403: (value: boolean) => set({ push403: value }),
            setPush404: (value: boolean) => set({ push404: value }),
            setPushUniversity: (value: boolean) => set({ pushUniversity: value }),
            // Helper method to toggle all push settings
            toggleAllPushSettings: (value: boolean) => {
                set({
                    pushAll: value,
                    push401: value,
                    push402: value,
                    push403: value,
                    push404: value,
                    pushUniversity: value
                });
            },
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);