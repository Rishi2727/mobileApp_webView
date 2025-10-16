import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useNavigate } from 'react-router';
import moment from 'moment-timezone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import MyBreadcrumb from '@/components/ui/custom/my-breadcrumb';
import { metadata } from '@/config/metadata';
import { useLanguage } from '@/contexts/useLanguage';
import { useCategoryWiseRoomsStore } from "@/store/CategoryWiseRoomsStore";
import type { CategoryWiseAvailabilityRoom } from '@/store/api/ResponseModels';
import type { FavouriteSeat } from '@/store/FavouriteSeat';
import { useFavouriteSeatStore } from '@/store/FavouriteSeat';
import { useBookingsStore } from '@/store/BookingsStore';
import { useModelStore } from '@/store/ModelStore';
import { cn } from '@/lib/utils';

const getPageConfig = (t: any) => ({
    "CATEGORY": {
        "401": {
            "color": "hsl(var(--primary))",
            "name": t('bookings.category.seat'),
            "fullname": t('bookings.category.generalReadingRoom'),
            "icon": "📚"
        },
        "402": {
            "color": "hsl(var(--accent))",
            "name": t('bookings.category.pc'),
            "fullname": t('bookings.category.pcRoom'),
            "icon": "💻"
        },
        "403": {
            "color": "hsl(var(--secondary))",
            "name": t('bookings.category.group'),
            "fullname": t('bookings.category.groupStudyRoom'),
            "icon": "👥"
        },
        "404": {
            "color": "hsl(var(--destructive))",
            "name": t('bookings.category.carrel'),
            "fullname": t('bookings.category.personalCarrelRoom'),
            "icon": "🏢"
        },
    },
    "STATUS": {
        "BOOKED": {
            "color": "hsl(var(--primary))",
            "darkColor": "hsl(var(--primary) / 0.8)",
            "name": t('bookings.status.booked')
        },
        "RETURNED": {
            "color": "hsl(var(--muted))",
            "darkColor": "hsl(var(--muted) / 0.8)",
            "name": t('bookings.status.returned')
        },
        "CANCELLED": {
            "color": "hsl(var(--muted))",
            "darkColor": "hsl(var(--muted) / 0.8)",
            "name": t('bookings.status.cancelled')
        },
        "IN_USE": {
            "color": "hsl(142 76% 36%)",
            "darkColor": "hsl(142 76% 36% / 0.8)",
            "name": t('bookings.status.inuse')
        },
    }
} as const);

type ColorKeys = keyof ReturnType<typeof getPageConfig>["CATEGORY"];

const getRoomClosedStatus = (t: any) => ({
    1: t('roomStatus.closedNow'),
    2: t('roomStatus.weekOff'),
    3: t('roomStatus.holiday'),
    4: t('roomStatus.dayOff'),
    5: t('roomStatus.roomFull')
});

const getRoomStatusMessage = (item: CategoryWiseAvailabilityRoom, t: any) => {
    const roomClosedStatus = getRoomClosedStatus(t);

    const currentTime = moment();
    const roomOpenTime = moment(`${currentTime.format("YYYY-MM-DD")} ${item.roomOpenTime}`, "YYYY-MM-DD HH:mm:ss");
    let roomCloseTime = moment(`${currentTime.format("YYYY-MM-DD")} ${item.roomCloseTime}`, "YYYY-MM-DD HH:mm:ss");
    roomCloseTime = (roomCloseTime.isSameOrBefore(roomOpenTime)) ? roomCloseTime.add(1, 'day') : roomCloseTime;

    if (item.isTodayOperation && currentTime.isBetween(roomOpenTime, roomCloseTime)) {
        return null;
    } else if (item.isWeekOff) {
        return roomClosedStatus[2];
    } else if (item.isHoliday) {
        return roomClosedStatus[3];
    } else if (item.isDayOff) {
        return roomClosedStatus[4];
    } else if (item.roomSeatsBooked === item.roomSeatsCount) {
        return roomClosedStatus[5];
    }
    return roomClosedStatus[1];
};

const CircularProgress = React.memo(function CircularProgress({ value, total }: { value: number; total: number }) {
    const percentage = (value / total) * 100;

    return (
        <div className="flex flex-col items-center justify-center w-12 h-12 relative">
            <div className="w-12 h-12 rounded-full border-4 border-muted relative">
                <div
                    className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-pulse"
                    style={{
                        background: `conic-gradient(hsl(var(--primary)) ${percentage}%, transparent ${percentage}%)`,
                        maskImage: 'radial-gradient(circle, transparent 65%, black 65%)'
                    }}
                />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-foreground">{value}</span>
                <span className="text-[10px] text-muted-foreground">{total}</span>
            </div>
        </div>
    );
});

const RoomSelection = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pageConfig = useMemo(() => getPageConfig(t), [t]);

    const catCodes = searchParams.get('catCodes');
    const hideCategory = searchParams.get('hideCategory') === 'true';
    const hideLibrary = searchParams.get('hideLibrary') === 'true';
    const hideFloor = searchParams.get('hideFloor') === 'true';
    const bookingId = searchParams.get('bookingId');
    const newFavourite = searchParams.get('newFavourite') === 'true';

    const [catCode, setCatCode] = useState<string | null>(null);
    const [showFav, setShowFav] = useState<boolean>(false);
    const [selectedCatCode, setSelectedCatCode] = useState<string>('');
    const [selectedLibCode, setSelectedLibCode] = useState<string>('');
    const [selectedFloorCode, setSelectedFloorCode] = useState<string>('');

    const { init, stopAndClear, categoriesWiseGroupedData } = useCategoryWiseRoomsStore();
    const {
        favouriteSeats,
        init: favInit,
        stopAndClear: favStopAndClear,
        bookedDesks,
        checkedStatus
    } = useFavouriteSeatStore();
    const { createBooking } = useBookingsStore();
    const { newAlert } = useModelStore();

    const breadcrumbItems = metadata.seatBooking?.breadcrumbItems || [];

    // Memoized getRoomStatusMessage function
    const getRoomStatusMessageMemo = useMemo(() => {
        const cache = new Map();
        return (item: CategoryWiseAvailabilityRoom) => {
            const cacheKey = `${item.roomCode}-${item.isTodayOperation}-${item.isWeekOff}-${item.isHoliday}-${item.isDayOff}-${item.roomSeatsBooked}-${item.roomSeatsCount}`;

            if (cache.has(cacheKey)) {
                return cache.get(cacheKey);
            }

            const result = getRoomStatusMessage(item, t);
            cache.set(cacheKey, result);
            return result;
        };
    }, [t]);

    useEffect(() => {
        if (catCodes) {
            setCatCode(catCodes);
        }
        if (hideCategory) {
            setSelectedCatCode('all');
        }
        if (hideLibrary) {
            setSelectedLibCode('all');
        }
        if (hideFloor) {
            setSelectedFloorCode('all');
        }
    }, [catCodes, hideCategory, hideFloor, hideLibrary]);

    useEffect(() => {
        if (categoriesWiseGroupedData?.grouped) {
            if (selectedCatCode !== 'all' && !(selectedCatCode in categoriesWiseGroupedData.grouped)) {
                const firstCatKey = Object.keys(categoriesWiseGroupedData.grouped).find(key => key !== 'all');
                if (firstCatKey !== undefined) setSelectedCatCode(firstCatKey);
                return;
            }

            if (selectedLibCode !== 'all' && !(selectedLibCode in categoriesWiseGroupedData.grouped[selectedCatCode])) {
                const firstLibKey = Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode]).find(key => key !== 'all');
                if (firstLibKey !== undefined) setSelectedLibCode(firstLibKey);
                return;
            }

            if (selectedFloorCode !== 'all' && !(selectedFloorCode in categoriesWiseGroupedData.grouped[selectedCatCode][selectedLibCode])) {
                const firstFloorKey = Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode][selectedLibCode]).find(key => key !== 'all');
                if (firstFloorKey !== undefined) setSelectedFloorCode(firstFloorKey);
                return;
            }
        }
    }, [categoriesWiseGroupedData, selectedCatCode, selectedFloorCode, selectedLibCode]);

    const chooseCatCode = useCallback((catCode: string) => {
        let libCode = selectedLibCode;
        if (!categoriesWiseGroupedData?.grouped || !(catCode in categoriesWiseGroupedData.grouped)) { return; }

        setSelectedCatCode(catCode);

        if (libCode !== 'all' && !(libCode in categoriesWiseGroupedData.grouped[catCode])) {
            const firstLibKey = Object.keys(categoriesWiseGroupedData.grouped[catCode]).find(key => key !== 'all');
            if (firstLibKey !== undefined) {
                libCode = firstLibKey;
                setSelectedLibCode(libCode);
            }
            return;
        }
        if (selectedFloorCode !== 'all' && !(selectedFloorCode in categoriesWiseGroupedData.grouped[catCode][libCode])) {
            const firstFloorKey = Object.keys(categoriesWiseGroupedData.grouped[catCode][libCode]).find(key => key !== 'all');
            if (firstFloorKey !== undefined) setSelectedFloorCode(firstFloorKey);
            return;
        }
    }, [categoriesWiseGroupedData?.grouped, selectedLibCode, selectedFloorCode]);

    const chooseLibCode = useCallback((libCode: string) => {
        if (!categoriesWiseGroupedData?.grouped || !(libCode in categoriesWiseGroupedData.grouped[selectedCatCode])) { return; }

        setSelectedLibCode(libCode);
        if (selectedFloorCode !== 'all' && !(selectedFloorCode in categoriesWiseGroupedData.grouped[selectedCatCode][libCode])) {
            const firstFloorKey = Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode][libCode]).find(key => key !== 'all');
            if (firstFloorKey !== undefined) setSelectedFloorCode(firstFloorKey);
            return;
        }
    }, [categoriesWiseGroupedData?.grouped, selectedCatCode, selectedFloorCode]);

    useEffect(() => {
        if (!catCode) return;
        if (!showFav && (catCode.includes('401') || catCode.includes('402'))) {
            setShowFav(true);
            return;
        }
        init(catCode.split(','), true);
        if (showFav) favInit();

        return () => {
            stopAndClear();
            if (showFav) favStopAndClear();
        };
    }, [catCode, favInit, favStopAndClear, init, showFav, stopAndClear]);

    const handleRoomSelect = useCallback((type: 'SEAT' | 'ROOM', roomcode: string, catCode: number, title: string) => {
        const bkId = (bookingId && bookingId !== '') ? bookingId : undefined;
        const path = (type === 'SEAT') ? "/seat-booking-page" : "/time-selection";
        const params = new URLSearchParams({
            roomCode: roomcode,
            catCode: String(catCode),
            title,
            ...(bkId && { bookingId: bkId }),
            ...(newFavourite && { newFavourite: 'true' })
        });

        navigate(`${path}?${params.toString()}`);
    }, [bookingId, navigate, newFavourite]);

    const handleSeatAction = useCallback(async (seat: FavouriteSeat) => {
        newAlert({
            disableOnClick: true,
            message: `${t('favouriteSeat.areYouSureBookPrefix')} ${seat.deskNo}${t('favouriteSeat.areYouSureBookSuffix')}`,
            icon: 'question',
            buttons: [
                {
                    title: t('common.yes'),
                    onClickLoading: true,
                    color: 'primary',
                    onFailure: (msg) => {
                        newAlert({
                            message: String(msg),
                            icon: 'error',
                            buttons: [{
                                title: t('common.ok'),
                                action: () => navigate(-1),
                                closeOnSuccess: true,
                                color: 'primary',
                            }]
                        });
                    },
                    onSuccess: (result) => {
                        newAlert({
                            message: result.msg,
                            icon: 'success',
                            buttons: [{
                                title: t('common.ok'),
                                action: () => {
                                    navigate(`/bookings?bookingId=${result.data.bookingId}&catCode=${seat.room.roomcatCode}`);
                                },
                                closeOnSuccess: true,
                                color: 'primary',
                            }],
                        });
                    },
                    action: async () => {
                        const bk = await createBooking({
                            reserveDeskCode: seat.deskCode,
                            type: 'SEAT',
                            bookingStartFromNow: true
                        });

                        if (bk?.success) return Promise.resolve(bk);
                        return Promise.reject(bk?.msg);
                    },
                    closeOnSuccess: true,
                },
                { title: t('common.no'), action: () => { }, color: 'secondary' }
            ],
        });
    }, [createBooking, newAlert, navigate, t]);

    const renderRoomItem = useCallback((item: CategoryWiseAvailabilityRoom[]) => {
        if (!item || item.length === 0) { return null; }

        if (item.length > 1 || item[0].roomWiseBooking) {
            // For multiple rooms or room-wise booking
            const isForHandiCaped = item.some(room => ["201"].includes(room.roomNumber));
            const floor = categoriesWiseGroupedData?.counts.floors.find(f => f.code === String(item[0].floorCode));
            const rooms = item.map(room => room.roomNumber).sort().join(' | ');
            const roomCodes = item.map(room => room.roomCode).sort().join(',');
            const zeroIndex = item[0];

            let title = t(item[0].roomName);
            let persons = zeroIndex.featureMultiUserBooking && (zeroIndex?.roomMaxUsers || -1) > 0 ? ' ' + zeroIndex.roomMaxUsers + ' ' + t('roomSelection.people') : '';
            let fullCatName = pageConfig.CATEGORY[String(zeroIndex.roomcatCode) as ColorKeys]?.fullname || '';
            let shortCatName = pageConfig.CATEGORY[String(zeroIndex.roomcatCode) as ColorKeys]?.name || '';

            title = (persons === '') ? fullCatName : `${(selectedCatCode === 'all' && (categoriesWiseGroupedData?.counts.categories.length || 0) > 1) ? shortCatName : t(fullCatName)} ${t('roomSelection.for')}${persons}`;
            title += (selectedLibCode === 'all' && (categoriesWiseGroupedData?.counts.libraries.length || 0) > 1) ? ` - ${t(zeroIndex.libName)}` : '';

            return (
                <Card
                    key={roomCodes}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleRoomSelect('ROOM', roomCodes, zeroIndex.roomcatCode, title)}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold"
                                    style={{ backgroundColor: floor?.color }}
                                >
                                    {t(floor?.name || '')}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm">{title}</h3>
                                    <p className="text-xs text-muted-foreground truncate max-w-60">{rooms}</p>
                                </div>
                                {isForHandiCaped && (
                                    <Badge variant="secondary">♿</Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        } else {
            const room = item[0];
            const statusMessage = getRoomStatusMessageMemo(room);
            const is24Hours = room.roomOpenTime === '00:00:00' && room.roomCloseTime === '00:00:00' ? t('roomSelection.24Open') : null;
            const isDisabled = !!statusMessage && !newFavourite;

            return (
                <Card
                    key={room.roomCode}
                    className={cn(
                        "cursor-pointer hover:shadow-md transition-shadow",
                        isDisabled && "opacity-60 cursor-not-allowed"
                    )}
                    onClick={() => {
                        if (!isDisabled) {
                            handleRoomSelect('SEAT', String(room.roomCode), room.roomcatCode, room.roomName);
                        }
                    }}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CircularProgress
                                    value={(room.roomSeatsCount || 1) - ((room.roomSeatsBooked || 0) + (room.totalSeatsFixed || 0))}
                                    total={(room.roomSeatsCount || 1) - (room.totalSeatsFixed || 0)}
                                />
                                <div>
                                    <h3 className="font-bold text-sm">{t(room.roomName)}</h3>
                                    <p className={cn(
                                        "text-xs",
                                        statusMessage ? "text-destructive" : "text-muted-foreground"
                                    )}>
                                        {statusMessage || is24Hours || (
                                            moment(room.roomOpenTime, "HH:mm:ss").format("LT") + " - " +
                                            moment(room.roomCloseTime, "HH:mm:ss").format("LT")
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                {(selectedFloorCode === 'all') && (
                                    <span className="text-xs font-bold">{t(room.floorName)}</span>
                                )}
                                <div className="p-2 bg-muted rounded-lg">
                                    <span className="text-lg">
                                        {pageConfig.CATEGORY[String(room.roomcatCode) as ColorKeys]?.icon || "📖"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        }
    }, [categoriesWiseGroupedData?.counts.floors, categoriesWiseGroupedData?.counts.categories.length, categoriesWiseGroupedData?.counts.libraries.length, t, pageConfig, selectedCatCode, selectedLibCode, handleRoomSelect, getRoomStatusMessageMemo, newFavourite, selectedFloorCode]);

    const SyncedFavSeats = !(showFav && !!favouriteSeats.length) || (checkedStatus && !!categoriesWiseGroupedData?.raw?.length);

    if (!categoriesWiseGroupedData || !categoriesWiseGroupedData.grouped || categoriesWiseGroupedData.grouped?.[selectedCatCode]?.[selectedLibCode]?.[selectedFloorCode] === undefined || !SyncedFavSeats) {
        return (
            <div className="container mx-auto px-4 py-6">
                <MyBreadcrumb items={breadcrumbItems} showBackButton={true} />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <MyBreadcrumb items={breadcrumbItems} showBackButton={true} />
            <div className="container mx-auto px-4 py-6 space-y-6">

                {/* Favorite Seats Section */}
                {(showFav && favouriteSeats.length > 0 && !newFavourite) && (
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-bold mb-3">{t('favouriteSeat.myFavoriteSeats')}</h3>
                            {!SyncedFavSeats ? (
                                <div className="flex gap-3">
                                    <Skeleton className="w-20 h-6 rounded" />
                                    <Skeleton className="w-20 h-6 rounded" />
                                    <Skeleton className="w-20 h-6 rounded" />
                                </div>
                            ) : (
                                <ScrollArea className="w-full">
                                    <div className="flex gap-3 pb-2">
                                        {favouriteSeats.map((seat) => {
                                            let isBooked = false;
                                            let isFixed = false;
                                            let isOpen = false;
                                            let isAvailable = false;
                                            const roomInfo = categoriesWiseGroupedData?.raw.find(room => room.roomCode === seat?.room.roomCode);
                                            if (seat && roomInfo) {
                                                isBooked = bookedDesks.includes(seat.deskCode);
                                                isFixed = roomInfo?.roomFixedSeatsNumbers.split(',').includes(String(seat.deskNo)) || false;
                                                const openTime = moment(roomInfo?.date + ' ' + roomInfo?.roomOpenTime);
                                                let closeTime = moment(roomInfo?.date + ' ' + roomInfo?.roomCloseTime);
                                                closeTime = closeTime.isSameOrBefore(openTime) ? closeTime.add(1, 'day') : closeTime;
                                                const currentTime = moment();
                                                isOpen = currentTime.isBetween(openTime, closeTime);
                                                isAvailable = !isBooked && isOpen && !isFixed && SyncedFavSeats;
                                            }

                                            return (
                                                <Button
                                                    key={seat.deskCode}
                                                    variant={isAvailable ? "default" : "secondary"}
                                                    size="sm"
                                                    disabled={!isAvailable}
                                                    onClick={() => handleSeatAction(seat)}
                                                    className={cn(
                                                        "flex-shrink-0 min-w-fit",
                                                        !isAvailable && "opacity-60"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{seat.deskNo}</span>
                                                        <div className="w-px h-4 bg-border" />
                                                        <span className="text-xs max-w-14 truncate">
                                                            {t(seat?.room?.roomName || '')}
                                                        </span>
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Category Selection */}
                {(selectedCatCode !== 'all' && categoriesWiseGroupedData.counts.categories.length > 1) && (
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-bold mb-3">{t('roomSelection.selectCategory')}</h3>
                            <ScrollArea className="w-full">
                                <div className="flex gap-3 pb-2">
                                    {categoriesWiseGroupedData.counts.categories
                                        .sort((a, b) => Number(a.code) - Number(b.code))
                                        .map((item) => {
                                            const isSelected = String(selectedCatCode) === String(item.code);
                                            const icon = pageConfig.CATEGORY[String(item.code) as ColorKeys]?.icon || null;
                                            const name = pageConfig.CATEGORY[String(item.code) as ColorKeys]?.name || null;

                                            return (
                                                <Button
                                                    key={item.code}
                                                    variant={isSelected ? "default" : "secondary"}
                                                    size="sm"
                                                    onClick={() => chooseCatCode(item.code)}
                                                    className="flex-shrink-0"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">{icon}</span>
                                                        <span>{name || item.name}</span>
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}

                {/* Library Selection */}
                {(selectedLibCode !== 'all' && categoriesWiseGroupedData.counts.libraries.length > 1) && (
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-bold mb-3">{t('roomSelection.selectLibrary')}</h3>
                            <div className="space-y-3">
                                {categoriesWiseGroupedData.counts.libraries.filter(
                                    ({ code }) => Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode] || {}).includes(code)
                                ).map((item) => {
                                    const isSelected = String(selectedLibCode) === String(item.code);
                                    return (
                                        <div
                                            key={item.code}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-muted rounded-lg">
                                                    <span className="text-lg">📖</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{item.name}</h4>
                                                </div>
                                            </div>
                                            <Button
                                                variant={isSelected ? "default" : "secondary"}
                                                size="sm"
                                                onClick={() => chooseLibCode(item.code)}
                                            >
                                                {isSelected ? t('roomSelection.selected') : t('roomSelection.select')}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Floor Selection */}
                {(selectedFloorCode !== 'all' && categoriesWiseGroupedData.counts.floors.length > 1) && (
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-bold mb-3">{t('roomSelection.selectFloor')}</h3>
                            {selectedLibCode === 'all' ? (
                                <div className="space-y-3">
                                    {categoriesWiseGroupedData.counts.floors.filter(
                                        ({ code }) => Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode]?.[selectedLibCode] || {}).includes(code)
                                    ).map((item) => {
                                        const isSelected = String(selectedFloorCode) === String(item.code);
                                        return (
                                            <div
                                                key={item.code}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-muted rounded-lg">
                                                        <span className="text-lg">🏢</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm">{t(item.libName)} - {t(item.name)}</h4>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant={isSelected ? "default" : "secondary"}
                                                    size="sm"
                                                    onClick={() => setSelectedFloorCode(item.code)}
                                                >
                                                    {isSelected ? t('roomSelection.selected') : t('roomSelection.select')}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <ScrollArea className="w-full">
                                    <div className="flex gap-3 pb-2">
                                        {categoriesWiseGroupedData.counts.floors.filter(
                                            ({ code }) => Object.keys(categoriesWiseGroupedData.grouped[String(selectedCatCode)]?.[String(selectedLibCode)] || {}).includes(String(code))
                                        ).map((item) => {
                                            const isSelected = String(selectedFloorCode) === String(item.code);
                                            return (
                                                <Button
                                                    key={item.code}
                                                    variant={isSelected ? "default" : "secondary"}
                                                    size="sm"
                                                    onClick={() => setSelectedFloorCode(item.code)}
                                                    className="flex-shrink-0"
                                                >
                                                    {item.name}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Room List */}
                <div className="space-y-3">
                    {categoriesWiseGroupedData.grouped[selectedCatCode]?.[selectedLibCode]?.[selectedFloorCode]?.map((item, index) => (
                        <div key={index}>
                            {renderRoomItem(item)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomSelection;