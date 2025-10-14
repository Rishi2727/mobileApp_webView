import { create } from 'zustand';
import { getMyNotifications } from './api';
import type { PushNotification } from './api/ResponseModels';
import { isEqual } from 'lodash';

let refreshTimer: ReturnType<typeof setInterval> | null = null;
const intervalMs = 3000; // Refresh interval in milliseconds

export type pushMethods = 'ALL_USERS' | 'IDENTITY_WISE' | 'USER_SPECIFIC';

type MessagesStore = {
    init: () => void;
    stopAndClear: () => void;
    setSelectedMethod: (method: pushMethods | null) => void;
    selectedMethod: pushMethods | null;
    setSelectedClassification: (classification: number[] | null) => void;
    selectedClassification: number[] | null;
    myNotifications: PushNotification[];
    getMyNotificationsList: (pageNumber: number | null) => Promise<void>;
    loadedPages: number;
    haveMore: boolean;
};

export const useMessagesStore = create<MessagesStore>((set, get) => ({
    myNotifications: [] as PushNotification[],
    loadedPages: -1,
    haveMore: true,
    selectedMethod: null,
    selectedClassification: null,
    setSelectedMethod: (method: pushMethods | null) => {
        if (method === get().selectedMethod) {
            method = null;
        }
        set({ selectedMethod: method });
        set({ myNotifications: [] });
        set({ loadedPages: -1 });
        set({ haveMore: true });
    },
    setSelectedClassification: (classification: number[] | null) => {
        if (classification === get().selectedClassification) {
            classification = null;
        }
        set({ selectedClassification: classification });
        set({ myNotifications: [] });
        set({ loadedPages: -1 });
        set({ haveMore: true });
    },

    getMyNotificationsList: async (pageNumber: number | null) => {
        let page = pageNumber ?? get().loadedPages + 1;
        let method = get().selectedMethod;
        const res = await getMyNotifications(
            {
                page: page,
                size: 20,
                sort: ["pushId,desc"],
                pushMethod: method || undefined,
                classificationCode: get().selectedClassification || undefined,
            });
        if (res?.data && method === get().selectedMethod) {
            let notifications = get().myNotifications || [];
            let newNotifications = res?.data?.content || [];
            const isSame = newNotifications.every((newNotification, index) => isEqual(newNotification, notifications?.[index]));
            if (!isSame) {
                set({ loadedPages: page });
                if (page === 0) {
                    notifications = [...newNotifications];
                } else {
                    newNotifications.forEach((newNotification) => {
                        const index = notifications.findIndex((notification) => notification.pushId === newNotification.pushId);
                        if (index === -1) {
                            notifications.push(newNotification);
                        } else {
                            notifications[index] = newNotification;
                        }
                    })
                }
                set({ myNotifications: [...notifications] });
            }

            const currentHaveMore = res?.data?.page?.totalPages && res?.data?.page?.totalPages > get().loadedPages + 1;
            if (get().haveMore !== currentHaveMore) {
                set({ haveMore: currentHaveMore || false });
            }
        }
    },

    init: () => {
        if (refreshTimer) return; // already started
        get().getMyNotificationsList(0);
        refreshTimer = setInterval(() => {
            get().getMyNotificationsList(0);
        }, intervalMs);
    },

    stopAndClear: () => {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    },

}));