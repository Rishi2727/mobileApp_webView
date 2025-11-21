import moment from 'moment-timezone';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getAllMobileSliders, getMobileSliderIds, getAppConfig, getLatestVersionDetails, getServerTime, getWeatherInfo } from './api';
import type { AppConfig, OpenWeatherResponse, SliderImages } from './api/ResponseModels';
// import defaultBanner from './api/defaultBanner.json';

// const defaultBannerData: SliderImages[] = defaultBanner as SliderImages[];
const defaultBannerData: SliderImages[] = [] as SliderImages[];

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
    sliders: SliderImages[];
};

export const useMainStore = create<MainStore>()(
    persist(
        (set, get) => ({
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            fetchInitialData: async (_platform: 'I' | 'A') => {

                getWeatherInfo().then((res) => {
                    if (res?.success && res.data) {
                        set({ currentWeather: res.data });
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                }).catch((_err) => {
                    // console.warn("Error fetching weather info:", _err);`
                });
                getMobileSliderIds().then((res) => {
                    if (res?.success && res.data) {
                        const sliderIds = res.data.join(',');
                        const existingSliders = (get().sliders?.map(s => s.seq) ?? []).join(',');
                        if (sliderIds !== existingSliders) {
                            // Fetch full slider details only if there is a change in slider IDs
                            getAllMobileSliders().then((sliderRes) => {
                                if (sliderRes?.success && sliderRes.data) {
                                    if (sliderRes.data.length === 0) {
                                        set({ sliders: defaultBannerData });
                                    } else {
                                        set({ sliders: sliderRes.data });
                                    }
                                }
                            }).catch(() => {
                                // console.warn("Error fetching full slider details:", err);
                            });
                        }
                    }
                }).catch(() => {
                    // console.warn("Error fetching slider ids:", err);
                });
            },
            checkLatestVersionInfo: async (platform: 'I' | 'A') => {
                // Get version from package.json or environment variables
                const versionName = import.meta.env.VITE_APP_VERSION || "0.0.0";
                const runtimeVersion = import.meta.env.VITE_RUNTIME_VERSION || "";
                const res = await getLatestVersionDetails(platform, versionName, runtimeVersion);
                if (res?.success && res?.data?.versionName) {
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
            sliders: defaultBannerData,
        }),
        {
            name: 'main-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                appConfig: state.appConfig,
                currentWeather: state.currentWeather,
                welcomeBannerHidden: state.welcomeBannerHidden,
                sliders: state.sliders,
            }),
        }
    )
);