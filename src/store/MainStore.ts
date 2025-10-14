import moment from 'moment-timezone';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getAppConfig, getLatestVersionDetails, getServerTime, getWeatherInfo } from './api';
import type { AppConfig, OpenWeatherResponse } from './api/ResponseModels';

type MainStore = {
    fetchInitialData: (platform: 'I' | 'A') => void;
    currentWeather: OpenWeatherResponse | null;
    appConfig: AppConfig | null;
    fetchAppConfig?: () => Promise<void>;
    timeOffset: number;
    checkLatestVersionInfo: (platform: 'I' | 'A') => Promise<boolean>;
    syncServerTime: () => Promise<void>;
    welcomeBannerHidden: boolean;
    setWelcomeBannerHidden: (hidden: boolean) => void;
};

export const useMainStore = create<MainStore>()(
    persist(
        (set) => ({
            fetchInitialData: async (_platform: 'I' | 'A') => {

                getWeatherInfo().then((res) => {
                    if (res?.success && res.data) {
                        set({ currentWeather: res.data });
                    }
                }).catch((_err) => {
                    // console.warn("Error fetching weather info:", _err);`
                });
            },
            checkLatestVersionInfo: async (platform: 'I' | 'A') => {
                // Get version from package.json or environment variables
                const versionName = import.meta.env.VITE_APP_VERSION || "0.0.0";
                const runtimeVersion = import.meta.env.VITE_RUNTIME_VERSION || "";
                const res = await getLatestVersionDetails(platform, versionName, runtimeVersion);
                if (res?.success && res.data?.versionName) {
                    return true;
                }
                return false;
            },
            syncServerTime: async () => {
                const time = await getServerTime();
                if (time?.success && time.data) {
                    const serverTime = time.data.currentTime; // 2025-01-01 00:00:00
                    const serverTimeZone = time.data.timezone; // Asia/Seoul
                    const serverMoment = moment.tz(serverTime, serverTimeZone);
                    const localMoment = moment();

                    // Calculate offset between server time and local time in milliseconds
                    const offset = serverMoment.valueOf() - localMoment.valueOf();

                    // Store the offset for future reference
                    set({ timeOffset: offset });

                    // Override moment.now to use the server time offset
                    moment.now = () => {
                        return Date.now() + offset;
                    };

                    moment.tz.setDefault(time.data.timezone);

                    console.log("Server time synced:", serverMoment.format(), " :: Offset:", offset, "ms :: ", offset / 1000, "seconds");
                }
            },
            fetchAppConfig: async () => {
                const res = await getAppConfig();
                if (res?.success && res.data) {
                    set({ appConfig: res.data });
                }
            },
            timeOffset: 0,
            appConfig: null,
            currentWeather: null,
            welcomeBannerHidden: false,
            setWelcomeBannerHidden: (hidden: boolean) => {
                set({ welcomeBannerHidden: hidden });
            },
        }),
        {
            name: 'main-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                appConfig: state.appConfig,
                currentWeather: state.currentWeather,
                welcomeBannerHidden: state.welcomeBannerHidden,
            }),
        }
    )
);