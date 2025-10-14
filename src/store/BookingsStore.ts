import { create } from 'zustand';
import { changeBooking, confirmBooking, createBooking, extendBooking, getMyBookings, getUserDemography, returnBooking } from './api';
import type { ApiResponse, MyBookingModel, UserDemography } from './api/ResponseModels';
import type { SeatBookingRequest } from './api/RequestModels';
import isEqual from 'lodash/isEqual';


let refreshTimer: ReturnType<typeof setInterval> | null = null;
const intervalMs = 3000;

type BookingsStore = {
    init: () => void;
    stopAndClear: () => void;
    setSelectedCategory: (catCodes: number[] | null) => void;
    selectedCategory: number[] | null;
    myBookings: MyBookingModel[];
    getMyBookingsList: (pageNumber: number | null) => Promise<void>;
    confirmBooking: (bookingId: string) => Promise<ApiResponse<MyBookingModel> | null>;
    changeBooking: (bookingId: string, payload: SeatBookingRequest) => Promise<ApiResponse<MyBookingModel> | null>;
    extendBooking: (bookingId: string) => Promise<ApiResponse<MyBookingModel> | null>;
    returnBooking: (bookingId: string) => Promise<ApiResponse<MyBookingModel> | null>;
    createBooking: (payload: SeatBookingRequest) => Promise<ApiResponse<MyBookingModel> | null>;
    getUserDemography: (userId: string) => Promise<ApiResponse<UserDemography> | null>;
    loadedPages: number;
    haveMore: boolean;
};

export const useBookingsStore = create<BookingsStore>((set, get) => ({
    myBookings: [] as MyBookingModel[],
    loadedPages: -1,
    haveMore: true,
    selectedCategory: [401, 402],
    setSelectedCategory: (catCodes: number[] | null) => {
        if (catCodes?.join(',') === get().selectedCategory?.join(',')) {
            // catCodes = null;
            return;
        }
        set({ selectedCategory: catCodes });
        set({ myBookings: [] });
        set({ loadedPages: -1 });
        set({ haveMore: true });
        // get().getMyBookingsList(0);

    },

    getMyBookingsList: async (pageNumber: number | null) => {
        let page = (pageNumber !== null) ? pageNumber : get().loadedPages + 1;
        let catCode = get().selectedCategory;
        const res = await getMyBookings(
            {
                page: page,
                size: 20,
                sort: ["BOOKING_ID,desc"],
                roomCatCodes: catCode !== null ? catCode : undefined
            });
        if (res?.data && catCode?.join(',') === get().selectedCategory?.join(',')) {
            let bookings = get().myBookings || [];
            let newBookings = res?.data?.content || [];
            // const isSame = newBookings.every((newBooking, index) => JSON.stringify(newBooking) === JSON.stringify(bookings?.[index]));
            const isSame = newBookings.every((newBooking, index) => isEqual(newBooking, bookings[index]));
            if (!isSame) {
                set({ loadedPages: page });
                if (page === 0) {
                    bookings = [...newBookings];
                } else {
                    // bookings = [...bookings, ...newBookings];
                    newBookings.forEach((newBooking) => {
                        const index = bookings.findIndex((booking) => booking.bookingId === newBooking.bookingId);
                        if (index === -1) {
                            bookings.push(newBooking);
                        } else {
                            bookings[index] = newBooking;
                        }
                    })
                }
                set({ myBookings: [...bookings] }); // Create new array reference to ensure React detects the change
            }

            const currentHaveMore = res?.data?.page?.totalPages && res?.data?.page?.totalPages > get().loadedPages + 1;
            if (get().haveMore !== currentHaveMore) {
                set({ haveMore: currentHaveMore || false });
            }
        }
    },

    init: () => {
        if (refreshTimer) return; // already started
        get().getMyBookingsList(0);
        refreshTimer = setInterval(() => {
            get().getMyBookingsList(0);
        }, intervalMs);
    },

    stopAndClear: () => {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    },

    confirmBooking: confirmBooking,
    changeBooking: changeBooking,
    extendBooking: extendBooking,
    returnBooking: returnBooking,
    createBooking: createBooking,
    getUserDemography: getUserDemography
}));