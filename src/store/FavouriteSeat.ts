import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getCategoryWiseDesks, getDesksBooked, getMyBookings } from './api';
import moment, { type Moment } from 'moment-timezone';
import type { CategoryWiseAvailabilityRoom } from './api/ResponseModels';
import { isEqual } from 'lodash';

let refreshTimer: ReturnType<typeof setInterval> | null = null;
const intervalMs = 1500; // Refresh interval in milliseconds

export type FavouriteSeat = {
    deskCode: number;
    deskName: string;
    deskNo: string;
    room: {
        roomCode: number;
        roomName: string;
        roomNumber: string;
        roomcatCode: number;
        roomcatName: string;
        libCode: number;
        libName: string;
        floorCode: number;
        floorName: string;
        floorNumber: number;
        zoneCode: number | null;
    };
}

export type SuggestedFavourite = {
    days: number;
    times: number;
    desk: FavouriteSeat;
}

type favouriteSeatStore = {
    init: () => void;
    stopAndClear: () => void;
    favouriteSeats: FavouriteSeat[];
    suggestedFavourite: SuggestedFavourite[];
    suggestedFavouriteAll: SuggestedFavourite[];
    checkedStatus: boolean;
    checkedRoomInfo: boolean;
    bookedDesks: number[]; // This should be typed based on the response from getDesksBooked
    removeFavouriteSeat: (deskCode: number) => void;
    RoomsInfo: CategoryWiseAvailabilityRoom[];
    prependFavouriteSeat: (seat: FavouriteSeat) => boolean;
    getCategoryWiseDesks: () => Promise<void>;
    getDeskBooked: () => Promise<void>;
    checkLimit: () => boolean;
    // Additional methods can be added as needed
};

export const maxFavouriteSeatsLimit = 4;

async function getSuggestedFavouriteSeats(): Promise<SuggestedFavourite[]> {
    // This function can be implemented to generate suggested favorites;

    const res = await getMyBookings({
        page: 0,
        size: 100,
        sort: ["BOOKING_ID,desc"],
        roomCatCodes: [401, 402],
        reservationStatusCode: [1001, 1002, 1006, 1007, 1008, 1009, 1010, 1011, 1012],
    });

    if (res && res.data) {
        // Filter distinct desks order by frequency and must be booked at least 3 times
        const deskFrequency: Record<string, { count: number; desk: FavouriteSeat, firstFound: Moment, lastFound: Moment }> = {};
        const data = res.data.content.filter(booking => {
            // TODO: Make it back to 30 After Testing
            return moment(booking.reservationDtime).isAfter(moment().subtract(120, 'days'));
        })
        data.forEach(booking => {
            const deskCode = booking.reserveDeskCode;
            if (!deskFrequency[deskCode]) {
                deskFrequency[deskCode] = {
                    count: 0,
                    firstFound: moment(booking.reservationDtime),
                    lastFound: moment(booking.reservationDtime),
                    desk: {
                        deskCode: booking.reserveDeskCode,
                        deskName: booking.bookingType === 'ROOM' ? booking.roomName : '',
                        deskNo: booking.reserveDeskNo,
                        room: {
                            roomCode: booking.roomCode,
                            roomName: booking.roomName,
                            roomNumber: booking.roomNumber,
                            roomcatCode: booking.roomcatCode,
                            roomcatName: booking.roomcatName,
                            libCode: booking.libCode,
                            libName: booking.libName,
                            floorCode: booking.floorCode,
                            floorName: booking.floorName,
                            floorNumber: booking.floorNumber,
                            zoneCode: booking.zoneCode,
                        }
                    }
                };
            }
            deskFrequency[deskCode].count += 1;
            deskFrequency[deskCode].lastFound = moment(booking.reservationDtime);
        });
        const suggested: SuggestedFavourite[] = Object.values(deskFrequency)
            .filter(item => item.count >= 3)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5) // Limit to top 5 suggestions
            .map(item => ({
                days: item.firstFound.diff(item.lastFound, 'days'),
                times: item.count,
                desk: item.desk
            }));
        return suggested;
    }

    return [];
}

export const useFavouriteSeatStore = create<favouriteSeatStore>()(
    persist(
        (set, get) => ({
            favouriteSeats: [],
            suggestedFavourite: [],
            suggestedFavouriteAll: [],
            RoomsInfo: [],
            bookedDesks: [],
            checkedStatus: false,
            checkedRoomInfo: false,
            init: async () => {
                if (refreshTimer) return; // already started
                set({ checkedRoomInfo: false, checkedStatus: false, bookedDesks: [] });
                getSuggestedFavouriteSeats().then(suggested => {
                    set({ suggestedFavouriteAll: suggested });
                    // Filter suggested favourites to only include those that are not already in favouriteSeats
                    const currentFavouriteCodes = new Set(get().favouriteSeats.map(seat => seat.deskCode));
                    const filteredSuggested = suggested.filter(s => !currentFavouriteCodes.has(s.desk.deskCode));
                    set({ suggestedFavourite: filteredSuggested });
                }).catch(error => {
                    console.warn("Error fetching suggested favourite seats:", error);
                    set({ suggestedFavouriteAll: [] });
                });

                get().getDeskBooked();
                get().getCategoryWiseDesks();
                refreshTimer = setInterval(() => {
                    get().getDeskBooked();
                }, intervalMs);
            },
            removeFavouriteSeat: (deskCode: number) => {
                set({ checkedStatus: false })
                const currentSeats = get().favouriteSeats;
                const updatedSeats = currentSeats.filter(seat => seat.deskCode !== deskCode);
                set({ favouriteSeats: updatedSeats });

                // Update suggested favourites to remove the seat if it was suggested
                const currentFavouriteCodes = new Set(get().favouriteSeats.map(seat => seat.deskCode));
                const filteredSuggested = get().suggestedFavouriteAll.filter(s => !currentFavouriteCodes.has(s.desk.deskCode))
                set({ suggestedFavourite: filteredSuggested });
            },
            prependFavouriteSeat: (seat: FavouriteSeat) => {
                set({ checkedStatus: false })
                const currentSeats = get().favouriteSeats;
                // Check if the seat already exists
                const existingSeat = currentSeats.find(s => s.deskCode === seat.deskCode);
                if (existingSeat) {
                    return false;
                }
                // If the limit is reached, remove the oldest seat
                if (currentSeats.length >= maxFavouriteSeatsLimit) {
                    currentSeats.pop();
                }
                // Add the new seat to the beginning of the list
                const updatedSeats = [seat, ...currentSeats];
                set({ favouriteSeats: updatedSeats });

                const currentFavouriteCodes = new Set(get().favouriteSeats.map(seat => seat.deskCode));
                const filteredSuggested = get().suggestedFavouriteAll.filter(s => !currentFavouriteCodes.has(s.desk.deskCode))
                set({ suggestedFavourite: filteredSuggested });
                return true;
            },
            getCategoryWiseDesks: async () => {
                getCategoryWiseDesks('401,402', { includeAvailability: true }).then(res => {
                    if (res && res.data) {
                        set({ RoomsInfo: res.data });
                        set({ checkedRoomInfo: true });
                    }
                }).catch(error => {
                    console.warn("Error fetching category wise desks:", error);
                });
            },
            getDeskBooked: async () => {
                const seatCodes = get().favouriteSeats.map(seat => String(seat.deskCode));
                if (seatCodes.length === 0) { return; }

                getDesksBooked({
                    bookingType: 'SEAT',
                    deskCodes: seatCodes
                }).then(res => {
                    if (res && res.data) {
                        if (!get().checkedStatus && isEqual(seatCodes, get().favouriteSeats.map(seat => String(seat.deskCode)))) set({ checkedStatus: true });
                        if (isEqual(get().bookedDesks, res.data)) return; // No change in booked desks
                        set({ bookedDesks: res.data });
                    }
                }).catch(error => {
                    console.warn("Error fetching booked desks:", error);
                });
            },
            checkLimit: () => {
                const currentSeats = get().favouriteSeats;
                return currentSeats.length < maxFavouriteSeatsLimit;
            },
            stopAndClear: () => {
                if (refreshTimer) {
                    clearInterval(refreshTimer);
                    refreshTimer = null;
                }
            },

        }),
        {
            name: 'favourite-seats-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                favouriteSeats: state.favouriteSeats,
            }),
        }
    )
);