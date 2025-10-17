import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { useCategoryWiseRoomsStore } from "@/store/CategoryWiseRoomsStore";
import { useFavouriteSeatStore, type FavouriteSeat } from "@/store/FavouriteSeat";
import { useBookingsStore } from "@/store/BookingsStore";
import { useModelStore } from "@/store/ModelStore";
import { useLanguage } from "@/contexts/useLanguage";
import { commonIcons, dashboardIcons } from "@/assets";
import moment from "moment";
import type { CategoryWiseAvailabilityRoom } from "@/store/api/ResponseModels";
import Text from "@/components/ui/custom/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// Circular Progress Component (SVG-based like old implementation)
const CircularProgress = ({ value, total }: { value: number; total: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="flex-shrink-0">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <g transform="translate(28, 28)">
        <text y="-6" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="700" fill="#1F2937">
          {value}
        </text>
        <text y="6" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#9CA3AF">
          {total}
        </text>
      </g>
    </svg>
  );
};

const getPageConfig = (t: (key: string) => string) => ({
  CATEGORY: {
    "401": {
      color: "#27304B",
      name: t("bookings.category.seat"),
      fullname: t("bookings.category.generalReadingRoom"),
      icon: dashboardIcons.SeatIcon,
    },
    "402": {
      color: "#27304B",
      name: t("bookings.category.pc"),
      fullname: t("bookings.category.pcRoom"),
      icon: commonIcons.PcIcon,
    },
    "403": {
      color: "#27304B",
      name: t("bookings.category.group"),
      fullname: t("bookings.category.groupStudyRoom"),
      icon: dashboardIcons.GroupIcon,
    },
    "404": {
      color: "#27304B",
      name: t("bookings.category.carrel"),
      fullname: t("bookings.category.personalCarrelRoom"),
      icon: dashboardIcons.CarrelIcon,
    },
  },
} as const);

type ColorKeys = keyof ReturnType<typeof getPageConfig>["CATEGORY"];

const getRoomClosedStatus = (t: (key: string) => string) => ({
  1: t("roomStatus.closedNow"),
  2: t("roomStatus.weekOff"),
  3: t("roomStatus.holiday"),
  4: t("roomStatus.dayOff"),
  5: t("roomStatus.roomFull"),
});

const getRoomStatusMessage = (item: CategoryWiseAvailabilityRoom, t: (key: string) => string) => {
  const roomClosedStatus = getRoomClosedStatus(t);

  const currentTime = moment();
  const roomOpenTime = moment(`${currentTime.format("YYYY-MM-DD")} ${item.roomOpenTime}`, "YYYY-MM-DD HH:mm:ss");
  let roomCloseTime = moment(`${currentTime.format("YYYY-MM-DD")} ${item.roomCloseTime}`, "YYYY-MM-DD HH:mm:ss");
  roomCloseTime = roomCloseTime.isSameOrBefore(roomOpenTime) ? roomCloseTime.add(1, "day") : roomCloseTime;

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

const RoomSelection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageConfig = useMemo(() => getPageConfig(t), [t]);

  const catCodes = searchParams.get("catCodes");
  const hideCategory = searchParams.get("hideCategory") === "true";
  const hideLibrary = searchParams.get("hideLibrary") === "true";
  const hideFloor = searchParams.get("hideFloor") === "true";
  const bookingId = searchParams.get("bookingId");
  const newFavourite = searchParams.get("newFavourite") === "true";

  const [catCode, setCatCode] = useState<string | null>(null);
  const [selectedCatCode, setSelectedCatCode] = useState<string>("");
  const [selectedLibCode, setSelectedLibCode] = useState<string>("");
  const [selectedFloorCode, setSelectedFloorCode] = useState<string>("");
  const [showFav, setShowFav] = useState(false);

  const { init, stopAndClear, categoriesWiseGroupedData } = useCategoryWiseRoomsStore();
  const {
    favouriteSeats,
    init: favInit,
    stopAndClear: favStopAndClear,
    bookedDesks,
    checkedStatus,
  } = useFavouriteSeatStore();
  const { createBooking } = useBookingsStore();
  const { newAlert } = useModelStore();

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

  // Initialize URL params
  useEffect(() => {
    if (catCodes) {
      setCatCode(catCodes);
    }
    if (hideCategory) {
      setSelectedCatCode("all");
    }
    if (hideLibrary) {
      setSelectedLibCode("all");
    }
    if (hideFloor) {
      setSelectedFloorCode("all");
    }
  }, [catCodes, hideCategory, hideLibrary, hideFloor]);

  // Initialize stores with useFocusEffect equivalent
  useEffect(() => {
    if (!catCode) return;
    if (!showFav && (catCode.includes("401") || catCode.includes("402"))) {
      setShowFav(true);
      return;
    }
    init(catCode.split(","), true);
    if (showFav) favInit();
    return () => {
      stopAndClear();
      if (showFav) favStopAndClear();
    };
  }, [catCode, favInit, favStopAndClear, init, showFav, stopAndClear]);

  // Complex cascading logic for filter auto-selection
  useEffect(() => {
    if (categoriesWiseGroupedData?.grouped) {
      // Don't override if hideCategory is set - respect the URL param
      if (!hideCategory && selectedCatCode !== "all" && !(selectedCatCode in categoriesWiseGroupedData.grouped)) {
        const firstCatKey = Object.keys(categoriesWiseGroupedData.grouped).find((key) => key !== "all");
        if (firstCatKey !== undefined) {
          setSelectedCatCode(firstCatKey);
          return;
        }
      }

      // Don't override if hideLibrary is set - respect the URL param
      if (!hideLibrary && selectedLibCode !== "all" && categoriesWiseGroupedData.grouped[selectedCatCode] && !(selectedLibCode in categoriesWiseGroupedData.grouped[selectedCatCode])) {
        const firstLibKey = Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode]).find(
          (key) => key !== "all"
        );
        if (firstLibKey !== undefined) {
          setSelectedLibCode(firstLibKey);
          return;
        }
      }

      // Don't override if hideFloor is set - respect the URL param
      if (
        !hideFloor &&
        selectedFloorCode !== "all" &&
        categoriesWiseGroupedData.grouped[selectedCatCode]?.[selectedLibCode] &&
        !(selectedFloorCode in categoriesWiseGroupedData.grouped[selectedCatCode][selectedLibCode])
      ) {
        const firstFloorKey = Object.keys(
          categoriesWiseGroupedData.grouped[selectedCatCode][selectedLibCode]
        ).find((key) => key !== "all");
        if (firstFloorKey !== undefined) {
          setSelectedFloorCode(firstFloorKey);
          return;
        }
      }
    }
  }, [categoriesWiseGroupedData, selectedCatCode, selectedFloorCode, selectedLibCode, hideCategory, hideLibrary, hideFloor]);

  const chooseCatCode = useCallback(
    (catCode: string) => {
      let libCode = selectedLibCode;
      if (!categoriesWiseGroupedData?.grouped || !(catCode in categoriesWiseGroupedData.grouped)) {
        return;
      }

      setSelectedCatCode(catCode);

      if (libCode !== "all" && !(libCode in categoriesWiseGroupedData.grouped[catCode])) {
        const firstLibKey = Object.keys(categoriesWiseGroupedData.grouped[catCode]).find((key) => key !== "all");
        if (firstLibKey !== undefined) {
          libCode = firstLibKey;
          setSelectedLibCode(libCode);
        }
        return;
      }
      if (
        selectedFloorCode !== "all" &&
        !(selectedFloorCode in categoriesWiseGroupedData.grouped[catCode][libCode])
      ) {
        const firstFloorKey = Object.keys(categoriesWiseGroupedData.grouped[catCode][libCode]).find(
          (key) => key !== "all"
        );
        if (firstFloorKey !== undefined) {
          setSelectedFloorCode(firstFloorKey);
          return;
        }
      }
    },
    [categoriesWiseGroupedData?.grouped, selectedLibCode, selectedFloorCode]
  );

  const chooseLibCode = useCallback(
    (libCode: string) => {
      if (!categoriesWiseGroupedData?.grouped || !(libCode in categoriesWiseGroupedData.grouped[selectedCatCode])) {
        return;
      }

      setSelectedLibCode(libCode);
      if (
        selectedFloorCode !== "all" &&
        !(selectedFloorCode in categoriesWiseGroupedData.grouped[selectedCatCode][libCode])
      ) {
        const firstFloorKey = Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode][libCode]).find(
          (key) => key !== "all"
        );
        if (firstFloorKey !== undefined) {
          setSelectedFloorCode(firstFloorKey);
          return;
        }
      }
    },
    [categoriesWiseGroupedData?.grouped, selectedCatCode, selectedFloorCode]
  );

  const handleRoomSelect = useCallback(
    (type: "SEAT" | "ROOM", roomcode: string, catCode: number, title: string) => {
      const bkId = bookingId && typeof bookingId === "string" && bookingId !== "" ? bookingId : undefined;

      const path = type === "SEAT" ? "/ticketing/SeatSelection" : "/ticketing/DisplayTimeChart";
      const params = new URLSearchParams({
        roomCode: roomcode,
        catCode: String(catCode),
        title,
        ...(bkId && { bookingId: bkId }),
        ...(newFavourite && { newFavourite: "true" }),
      });

      navigate(`${path}?${params.toString()}`);
    },
    [bookingId, navigate, newFavourite]
  );

  const handleSeatAction = useCallback(
    async (seat: FavouriteSeat) => {
      newAlert({
        disableOnClick: true,
        message: `${t("favouriteSeat.areYouSureBookPrefix")} ${seat.deskNo}${t("favouriteSeat.areYouSureBookSuffix")}`,
        icon: "question",
        buttons: [
          {
            title: t("common.yes"),
            onClickLoading: true,
            color: "primary",
            onFailure: (msg) => {
              newAlert({
                message: String(msg),
                icon: "error",
                buttons: [
                  {
                    title: t("common.ok"),
                    action: () => {
                      navigate(-1);
                    },
                    closeOnSuccess: true,
                    color: "primary",
                  },
                ],
              });
            },
            onSuccess: (result) => {
              newAlert({
                message: result.msg,
                icon: "success",
                buttons: [
                  {
                    title: t("common.ok"),
                    action: () => {
                      navigate(
                        `/bookings?bookingId=${result.data.bookingId}&catCode=${seat.room.roomcatCode}`
                      );
                    },
                    closeOnSuccess: true,
                    color: "primary",
                  },
                ],
              });
            },
            action: async () => {
              const bk = await createBooking({
                reserveDeskCode: seat.deskCode,
                type: "SEAT",
                bookingStartFromNow: true,
              });

              if (bk?.success) return Promise.resolve(bk);
              return Promise.reject(bk?.msg);
            },
            closeOnSuccess: true,
          },
          { title: t("common.no"), action: () => { }, color: "secondary" },
        ],
      });
    },
    [createBooking, newAlert, navigate, t]
  );

  // Memoized render function for rooms
  const renderRoomItem = useCallback(
    ({ item }: { item: CategoryWiseAvailabilityRoom[] }) => {
      if (!item || item.length === 0) {
        return null;
      }

      if (item.length > 1 || item[0].roomWiseBooking) {
        // For multiple rooms or room-wise booking
        const isForHandiCaped = item.some((room) => ["201"].includes(room.roomNumber));
        const floor = categoriesWiseGroupedData?.counts.floors.find((f) => f.code === String(item[0].floorCode));
        const rooms = item
          .map((room) => room.roomNumber)
          .sort()
          .join(" | ");
        const roomCodes = item
          .map((room) => room.roomCode)
          .sort()
          .join(",");
        const zeroIndex = item[0];

        let title = t(item[0].roomName);
        const persons =
          zeroIndex.featureMultiUserBooking && (zeroIndex?.roomMaxUsers || -1) > 0
            ? " " + zeroIndex.roomMaxUsers + " " + t("roomSelection.people")
            : "";
        const fullCatName = pageConfig.CATEGORY[String(zeroIndex.roomcatCode) as ColorKeys]?.fullname || "";
        const shortCatName = pageConfig.CATEGORY[String(zeroIndex.roomcatCode) as ColorKeys]?.name || "";

        title =
          persons === ""
            ? fullCatName
            : `${selectedCatCode === "all" && (categoriesWiseGroupedData?.counts.categories.length || 0) > 1
              ? shortCatName
              : t(fullCatName)
            } ${t("roomSelection.for")}${persons}`;
        title +=
          selectedLibCode === "all" && (categoriesWiseGroupedData?.counts.libraries.length || 0) > 1
            ? ` - ${t(zeroIndex.libName)}`
            : "";

        return (
          <Card
            key={roomCodes}
            onClick={() => handleRoomSelect("ROOM", roomCodes, zeroIndex.roomcatCode, title)}
            className="p-3 rounded-md bg-white cursor-pointer border border-neutral-100"
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div
                  className="flex justify-center items-center w-11 h-11 rounded-xl"
                  style={{ backgroundColor: floor?.color }}
                >
                  <Text className="font-bold text-sm text-primary-700">{t(floor?.name || "")}</Text>
                </div>
                <div>
                  <Text className="font-bold text-sm text-primary-800">{title}</Text>
                  <Text className="text-xs flex-wrap flex-shrink" style={{ width: isForHandiCaped ? "215px" : "245px" }}>
                    {rooms}
                  </Text>
                </div>
                {isForHandiCaped && (
                  <commonIcons.HandiCaped width={18} height={18} />
                )}
              </div>
            </div>
          </Card>
        );
      } else {
        const room = item[0];
        const statusMessage = getRoomStatusMessageMemo(room);
        const is24Hours =
          room.roomOpenTime === "00:00:00" && room.roomCloseTime === "00:00:00" ? t("roomSelection.24Open") : null;

        return (
          <Card
            key={room.roomCode}
            onClick={() => {
              if (!statusMessage || newFavourite)
                handleRoomSelect("SEAT", String(room.roomCode), room.roomcatCode, room.roomName);
            }}
            className={`p-3 rounded-md bg-white border border-neutral-100 ${!statusMessage || newFavourite ? "cursor-pointer" : "opacity-50"
              }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <CircularProgress
                  value={(room.roomSeatsCount || 1) - ((room.roomSeatsBooked || 0) + (room.totalSeatsFixed || 0))}
                  total={(room.roomSeatsCount || 1) - (room.totalSeatsFixed || 0)}
                />
                <div>
                  <Text className="font-bold text-sm text-primary-800">{t(room.roomName)}</Text>
                  <Text className={`text-xs flex-wrap flex-shrink ${statusMessage ? "text-seat-booked" : ""}`}>
                    {statusMessage ||
                      is24Hours ||
                      `${moment(room.roomOpenTime, "HH:mm:ss").format("LT")} - ${moment(
                        room.roomCloseTime,
                        "HH:mm:ss"
                      ).format("LT")}`}
                  </Text>
                </div>
              </div>
              <div className="flex flex-col items-center">
                {selectedFloorCode === "all" && (
                  <Text className="text-xs font-bold text-primary-800">{t(room.floorName)}</Text>
                )}
                <div className="bg-white p-1 rounded-md">
                  {React.createElement(pageConfig.CATEGORY[String(room.roomcatCode) as ColorKeys]?.icon, {
                    width: 18,
                    height: 18,
                  })}
                </div>
              </div>
            </div>
          </Card>
        );
      }
    },
    [
      categoriesWiseGroupedData?.counts.floors,
      categoriesWiseGroupedData?.counts.categories.length,
      categoriesWiseGroupedData?.counts.libraries.length,
      t,
      pageConfig,
      selectedCatCode,
      selectedLibCode,
      handleRoomSelect,
      getRoomStatusMessageMemo,
      newFavourite,
      selectedFloorCode,
    ]
  );

  const SyncedFavSeats =
    !(showFav && !!favouriteSeats.length) || (checkedStatus && !!categoriesWiseGroupedData?.raw?.length);

  if (
    !categoriesWiseGroupedData ||
    !categoriesWiseGroupedData.grouped ||
    categoriesWiseGroupedData.grouped?.[selectedCatCode]?.[selectedLibCode]?.[selectedFloorCode] === undefined ||
    !SyncedFavSeats
  ) {
    return (
      <div className="flex flex-1 justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const breadcrumbItems = {
    "401,402": metadata.seatBooking,
    "402,401" : metadata.seatBooking,
    "401" : metadata.seatBooking,
    "402" : metadata.seatBooking,
    "403": metadata.groupBooking,
    "404": metadata.carrelBooking,
  }

  type BreadcrumbKeys = keyof typeof breadcrumbItems;

  return (
    <div className="min-h-[90vh] bg-primary-50">
      <MyBreadcrumb
        items={breadcrumbItems[catCodes as BreadcrumbKeys]?.breadcrumbItems || metadata.ticketingRoomSelection?.breadcrumbItems || []}
        title={breadcrumbItems[catCodes as BreadcrumbKeys]?.title || "Room Selection"}
        showBackButton={true}
      />

      <div className="px-4 py-3">
        {/* Favorite Seats Section */}
        {showFav && favouriteSeats.length > 0 && !newFavourite && (
          <div className="mb-2">
            <Text className="text-xs font-bold mb-1">{t("favouriteSeat.myFavoriteSeats")}</Text>
            {!SyncedFavSeats && (
              <div className="flex gap-3">
                <Skeleton className="w-[85px] h-[21px] rounded-md" />
                <Skeleton className="w-[85px] h-[21px] rounded-md" />
                <Skeleton className="w-[85px] h-[21px] rounded-md" />
              </div>
            )}
            {SyncedFavSeats && (
              <ScrollArea className="w-full">
                <div className="flex gap-3">
                  {favouriteSeats.map((seat) => {
                    let isBooked = false;
                    let isFixed = false;
                    let isOpen = false;
                    let isAvailable = false;
                    const roomInfo = categoriesWiseGroupedData?.raw.find(
                      (room) => room.roomCode === seat?.room.roomCode
                    );
                    if (seat && roomInfo) {
                      isBooked = bookedDesks.includes(seat.deskCode);
                      isFixed = roomInfo?.roomFixedSeatsNumbers.split(",").includes(String(seat.deskNo)) || false;
                      const openTime = moment(roomInfo?.date + " " + roomInfo?.roomOpenTime);
                      let closeTime = moment(roomInfo?.date + " " + roomInfo?.roomCloseTime);
                      closeTime = closeTime.isSameOrBefore(openTime) ? closeTime.add(1, "day") : closeTime;
                      const currentTime = moment();
                      isOpen = currentTime.isBetween(openTime, closeTime);
                      isAvailable = !isBooked && isOpen && !isFixed && SyncedFavSeats;
                    }
                    return (
                      <Button
                        key={seat.deskCode}
                        onClick={() => {
                          handleSeatAction(seat);
                        }}
                        disabled={!isAvailable}
                        className={`flex-1 ${isAvailable ? "bg-primary-500" : "bg-neutral-300"
                          } px-1 py-1 ${isAvailable ? "border-green-500" : SyncedFavSeats ? "border-red-500" : "border-neutral-400"
                          } border rounded-md justify-center`}
                      >
                        <div className="flex items-center gap-2 justify-around">
                          <Text
                            className={`${isAvailable ? "text-white" : "text-black"
                              } font-semibold text-xs text-center`}
                          >
                            {seat.deskNo} |
                          </Text>
                          <Text variant="caption" className={`${isAvailable ? "text-white" : "text-black"} font-semibold w-14`}>
                            {t(seat?.room?.roomName || "")}
                          </Text>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Category Filters */}
        {selectedCatCode !== "all" && categoriesWiseGroupedData.counts.categories.length > 1 && (
          <div className="mb-2">
            <Text className="text-xs font-bold mb-1">{t("roomSelection.selectCategory")}</Text>
            <ScrollArea className="w-full">
              <div className="flex gap-3">
                {categoriesWiseGroupedData.counts.categories
                  .sort((a, b) => Number(a.code) - Number(b.code))
                  .map((item) => {
                    const isSelected = String(selectedCatCode) === String(item.code);
                    const IconComponent = pageConfig.CATEGORY[String(item.code) as ColorKeys]?.icon || null;
                    const name = pageConfig.CATEGORY[String(item.code) as ColorKeys]?.name || null;
                    return (
                      <Button
                        key={item.code}
                        onClick={() => chooseCatCode(item.code)}
                        className={`flex-1 ${isSelected ? "bg-primary-500" : "bg-neutral-300"} h-[35px]`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <div className="bg-neutral-100 p-0.5 rounded">
                              {IconComponent && React.createElement(IconComponent, { width: 16, height: 16 })}
                            </div>
                          ) : (
                            IconComponent && React.createElement(IconComponent, { width: 16, height: 16 })
                          )}
                          <Text className={`${isSelected ? "text-white" : "text-black"} font-semibold text-sm`}>
                            {name || item.name}
                          </Text>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Library Filters */}
        {selectedLibCode !== "all" && categoriesWiseGroupedData.counts.libraries.length > 1 && (
          <div className="mb-2">
            <Text className="text-xs font-bold mb-1">{t("roomSelection.selectLibrary")}</Text>
            <div className="flex flex-col">
              {categoriesWiseGroupedData.counts.libraries
                .filter(({ code }) =>
                  Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode] || {}).includes(code)
                )
                .map((item) => {
                  const isSelected = String(selectedLibCode) === String(item.code);
                  return (
                    <div
                      key={item.code}
                      className={`flex items-center justify-between p-1.5 mb-2 ${isSelected ? "bg-neutral-300" : "bg-primary-100"
                        } rounded-2xl`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-white p-2 rounded-md">
                          <dashboardIcons.BookIcon width={24} height={24} />
                        </div>
                        <div className="ps-2.5">
                          <Text className="text-sm font-bold text-black">{item.name}</Text>
                        </div>
                      </div>
                      <Button
                        onClick={() => chooseLibCode(item.code)}
                        className={`${isSelected ? "bg-primary-700" : "bg-primary-400"
                          } px-4 py-2 h-[35px] justify-center rounded-md`}
                      >
                        <Text className="text-white font-bold text-sm">
                          {isSelected ? t("roomSelection.selected") : t("roomSelection.select")}
                        </Text>
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Floor Filters */}
        {selectedFloorCode !== "all" && categoriesWiseGroupedData.counts.floors.length > 1 && (
          <div className="mb-2">
            <Text className="text-xs font-bold mb-1">{t("roomSelection.selectFloor")}</Text>
            {selectedLibCode === "all" ? (
              <div className="flex flex-col">
                {categoriesWiseGroupedData.counts.floors
                  .filter(({ code }) =>
                    Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode]?.[selectedLibCode] || {}).includes(
                      code
                    )
                  )
                  .map((item) => {
                    const isSelected = String(selectedFloorCode) === String(item.code);
                    return (
                      <div
                        key={item.code}
                        className={`flex items-center justify-between p-2 mb-2 ${isSelected ? "bg-primary-100" : "bg-neutral-200"
                          } rounded-2xl`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-white p-2 rounded-md">
                            <dashboardIcons.BookIcon width={24} height={24} />
                          </div>
                          <div className="ps-2.5">
                            <Text className="text-sm font-bold text-black">
                              {t(item.libName)} - {t(item.name)}
                            </Text>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedFloorCode(item.code)}
                          className={`${isSelected ? "bg-primary-700" : "bg-primary-400"
                            } px-4 py-2 h-[35px] justify-center rounded-md`}
                        >
                          <Text className="text-white font-bold text-sm">
                            {isSelected ? t("roomSelection.selected") : t("roomSelection.select")}
                          </Text>
                        </Button>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex gap-3">
                {categoriesWiseGroupedData.counts.floors
                  .filter(({ code }) =>
                    Object.keys(
                      categoriesWiseGroupedData.grouped[String(selectedCatCode)]?.[String(selectedLibCode)] || {}
                    ).includes(String(code))
                  )
                  .map((item) => {
                    const isSelected = String(selectedFloorCode) === String(item.code);
                    return (
                      <Button
                        key={item.code}
                        onClick={() => setSelectedFloorCode(item.code)}
                        className={`flex-1 ${isSelected ? "bg-primary-500" : "bg-neutral-300"} h-[35px]`}
                      >
                        <div className="flex items-center gap-2">
                          <Text className={`${isSelected ? "text-white" : "text-black"} font-semibold text-sm`}>
                            {item.name}
                          </Text>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Rooms List */}
        <div className="mb-2">
          <div className="space-y-1 pb-[300px] pt-2">
            {(categoriesWiseGroupedData.grouped[selectedCatCode]?.[selectedLibCode]?.[selectedFloorCode] || []).map(
              (item, index) => (
                <React.Fragment key={index}>{renderRoomItem({ item })}</React.Fragment>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;
