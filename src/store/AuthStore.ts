import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getMyProfile, getMyQrCode, signin } from './api';
import type { MyBookingModel, UserProfile, UserQrCode } from './api/ResponseModels';
import moment from 'moment-timezone';
import { getDeviceUUID, setAuthStoreReference } from './api/client';
import { useBookingsStore } from './BookingsStore';
import { useMessagesStore } from './MessagesStore';
import { useMainStore } from './MainStore';
import { encryptWithStringKey } from '@/lib/crypto';
import { isEqual } from 'lodash';

const basePath = import.meta.env.VITE_BASE_PATH?.replace(/\/$/, '') || '/';
let refreshTimer: ReturnType<typeof setInterval> | null = null;
const intervalMs = 3000; // Refresh interval in milliseconds

declare global {
    interface Window {
        fcmToken?: string;
        deviceUUID?: string | null;
        isNativeApp?: boolean;
        platformType?: 'I' | 'A';
        appLanguage?: string;
    }
}

type AuthStore = {
    init: () => void;
    stopAndClear: () => void;
    login: (userId: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    mustLoggedIn: () => Promise<boolean>;
    isLoggedIn: () => boolean;
    myProfile: UserProfile | null;
    myQrCode: UserQrCode | null;
    qrCodeUpdatedAt: number;
    token: string | null;
    getMyProfile: () => Promise<void>;
    getQrCode: () => Promise<UserQrCode | undefined>;
    kmouSecretGenerate: () => Promise<string | undefined>;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            token: null,

            login: async (userId, password) => {
                const fcmToken: string | undefined = window?.fcmToken;
                const deviceUUID = await getDeviceUUID();

                console.log('FCM Token:', fcmToken);
                console.log('Device UUID:', deviceUUID);

                const res = await signin({
                    userId: userId,
                    password: password,
                    platformType: 'A',
                    pushTokenDevice: fcmToken,
                    pushTokenExpo: fcmToken ? 'FCM_WEB' : undefined,
                    deviceUniqueId: deviceUUID && fcmToken ? deviceUUID : undefined,
                });

                if (res) {
                    // Save token only in Zustand state
                    set({ token: res?.data || '' });
                    // Use setTimeout to ensure state is updated before navigation
                    setTimeout(() => {
                        window.location.href = basePath;
                    }, 100);

                    // Fetch user profile and QR code after login
                    get().getMyProfile();
                }
            },

            logout: async () => {
                // Clear token from Zustand state only
                set({ token: null, myProfile: null, myQrCode: null, qrCodeUpdatedAt: 0 });
                // Use Other stores to clear this user related data
                useBookingsStore.setState({
                    myBookings: [] as MyBookingModel[],
                    loadedPages: -1,
                    haveMore: true,
                    selectedCategory: null,
                });
                useMessagesStore.setState({
                    myNotifications: [],
                    selectedMethod: null,
                    loadedPages: -1,
                    haveMore: true
                });
                useMainStore.setState({ welcomeBannerHidden: false });
                // Use setTimeout to ensure state is cleared before navigation
                setTimeout(() => {
                    window.location.href = basePath + '/login';
                }, 100);
            },

            mustLoggedIn: async () => {
                const { token } = get();
                if (!token || token === 'null' || token === '') {
                    // Use setTimeout to ensure navigation happens after current render cycle
                    setTimeout(() => {
                        window.location.href = basePath + '/login';
                    }, 100);
                    return false;
                }
                return true;
            },

            isLoggedIn: () => {
                const { token } = get();
                return !(!token || token === 'null' || token === '');
            },

            myProfile: null,
            getMyProfile: async () => {
                const res = await getMyProfile();
                if (res && !isEqual(get().myProfile, res?.data)) set({ myProfile: res?.data });
            },

            myQrCode: null,
            qrCodeUpdatedAt: 0,
            getQrCode: async () => {
                const res = await getMyQrCode();
                const qrCode = res?.data;
                if (qrCode) {
                    qrCode.ExpireAt = moment(qrCode.ExpireAt).add(-10, 'seconds').format('YYYY-MM-DD HH:mm:ss');
                }

                set({ myQrCode: qrCode, qrCodeUpdatedAt: Date.now() });
                return qrCode;
            },

            init: () => {
                if (refreshTimer) return; // already started
                get().getMyProfile();
                refreshTimer = setInterval(() => {
                    get().getMyProfile();
                }, intervalMs);
            },

            stopAndClear: () => {
                if (refreshTimer) {
                    clearInterval(refreshTimer);
                    refreshTimer = null;
                }
            },

            kmouSecretGenerate: async () => {
                const { myProfile } = get();
                if (!myProfile) return;

                const userId = myProfile.userId;
                const userName = myProfile.userName;
                const timestamp = moment().format('YYYYMMDDHHmmss');
                const data = `${userId}▼${timestamp}▼${userName}`;

                const encryptedData = await encryptWithStringKey(data, "librarykmouackr#wiseneoscofuture", "librarykmouackr#");
                return encryptedData;
            }
        }),
        {
            name: 'auth-storage', // Storage key name
            storage: createJSONStorage(() => localStorage),
            // Only persist specific fields, not functions
            partialize: (state) => ({
                token: state.token,
                myProfile: state.myProfile,
                myQrCode: state.myQrCode,
                qrCodeUpdatedAt: state.qrCodeUpdatedAt,
            }),
        }
    )
);

// Register the auth store with the API client
setAuthStoreReference(
    // Function to get token
    () => useAuthStore.getState().token,
    // Function to clear auth on unauthorized
    () => {
        useAuthStore.getState().logout();
    }
);