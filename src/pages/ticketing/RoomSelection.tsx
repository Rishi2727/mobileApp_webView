import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { useCategoryWiseRoomsStore } from "@/store/CategoryWiseRoomsStore";
import { useFavouriteSeatStore } from "@/store/FavouriteSeat";
import { useModelStore } from "@/store/ModelStore";
import { useLanguage } from "@/contexts/useLanguage";
import { commonIcons, dashboardIcons } from "@/assets";
import moment from "moment";
import type { CategoryWiseAvailabilityRoom } from "@/store/api/ResponseModels";
import Text from "@/components/ui/custom/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

  const { init, stopAndClear, categoriesWiseGroupedData } = useCategoryWiseRoomsStore();
  const {
    favouriteSeats,
    init: favInit,
    stopAndClear: favStopAndClear,
    bookedDesks,
    checkedStatus,
  } = useFavouriteSeatStore();
  const { newAlert } = useModelStore();

  // Initialize stores
  useEffect(() => {
    if (catCode) {
      const catCodesArray = catCode.split(',').filter(Boolean);
      init(catCodesArray, true);
      favInit();
    }
    return () => {
      stopAndClear();
      favStopAndClear();
    };
  }, [init, catCode, stopAndClear, favInit, favStopAndClear]);

  // Parse URL params and initialize filters
  useEffect(() => {
    if (catCodes) {
      setCatCode(catCodes);
    }
  }, [catCodes]);

  // Initialize filter defaults after data loads
  useEffect(() => {
    if (!categoriesWiseGroupedData?.grouped) return;

    // Auto-select first category if not set
    if (!selectedCatCode) {
      if (hideCategory) {
        setSelectedCatCode("all");
      } else {
        const firstCatKey = Object.keys(categoriesWiseGroupedData.grouped).find((key) => key !== "all");
        if (firstCatKey) setSelectedCatCode(firstCatKey);
      }
    }

    // Auto-select first library if not set
    if (!selectedLibCode && selectedCatCode && categoriesWiseGroupedData.grouped[selectedCatCode]) {
      if (hideLibrary) {
        setSelectedLibCode("all");
      } else {
        const firstLibKey = Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode]).find(
          (key) => key !== "all"
        );
        if (firstLibKey) setSelectedLibCode(firstLibKey);
      }
    }

    // Auto-select first floor if not set
    if (
      !selectedFloorCode &&
      selectedCatCode &&
      selectedLibCode &&
      categoriesWiseGroupedData.grouped[selectedCatCode]?.[selectedLibCode]
    ) {
      if (hideFloor) {
        setSelectedFloorCode("all");
      } else {
        const firstFloorKey = Object.keys(
          categoriesWiseGroupedData.grouped[selectedCatCode][selectedLibCode]
        ).find((key) => key !== "all");
        if (firstFloorKey) setSelectedFloorCode(firstFloorKey);
      }
    }
  }, [categoriesWiseGroupedData, selectedCatCode, selectedLibCode, selectedFloorCode, hideCategory, hideLibrary, hideFloor]);

  // Auto-select first available options
  useEffect(() => {
    if (categoriesWiseGroupedData?.grouped) {
      if (selectedCatCode !== "all" && !(selectedCatCode in categoriesWiseGroupedData.grouped)) {
        const firstCatKey = Object.keys(categoriesWiseGroupedData.grouped).find((key) => key !== "all");
        if (firstCatKey) setSelectedCatCode(firstCatKey);
        return;
      }

      if (selectedLibCode !== "all" && !(selectedLibCode in categoriesWiseGroupedData.grouped[selectedCatCode])) {
        const firstLibKey = Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode]).find(
          (key) => key !== "all"
        );
        if (firstLibKey) setSelectedLibCode(firstLibKey);
        return;
      }

      if (
        selectedFloorCode !== "all" &&
        !(selectedFloorCode in categoriesWiseGroupedData.grouped[selectedCatCode][selectedLibCode])
      ) {
        const firstFloorKey = Object.keys(
          categoriesWiseGroupedData.grouped[selectedCatCode][selectedLibCode]
        ).find((key) => key !== "all");
        if (firstFloorKey) setSelectedFloorCode(firstFloorKey);
        return;
      }
    }
  }, [categoriesWiseGroupedData, selectedCatCode, selectedFloorCode, selectedLibCode]);

  const handleRoomSelect = useCallback(
    (room: CategoryWiseAvailabilityRoom) => {
      const statusMessage = getRoomStatusMessage(room, t);
      if (statusMessage) {
        newAlert({
          message: statusMessage,
          icon: "error",
          buttons: [{ title: t("common.ok"), action: () => {}, color: "primary" }],
        });
        return;
      }

      // Navigate based on category
      if (room.roomcatCode === 401 || room.roomcatCode === 402) {
        // Seat/PC - go to seat selection
        const params = new URLSearchParams({
          roomCode: String(room.roomCode),
          catCode: String(room.roomcatCode),
          title: room.roomName,
          ...(bookingId && { bookingId }),
          ...(newFavourite && { newFavourite: "true" }),
        });
        navigate(`/ticketing/SeatSelection?${params.toString()}`);
      } else {
        // Group/Carrel - go to time chart
        const params = new URLSearchParams({
          roomCode: String(room.roomCode),
          catCode: String(room.roomcatCode),
          title: room.roomName,
        });
        navigate(`/ticketing/DisplayTimeChart?${params.toString()}`);
      }
    },
    [t, newAlert, navigate, bookingId, newFavourite]
  );

  const handleSeatAction = useCallback(
    (seat: { deskCode: number; deskNo: string; deskName: string; room: { roomCode: number; roomcatCode: number; roomName: string } }) => {
      const roomInfo = categoriesWiseGroupedData?.raw.find((room) => room.roomCode === seat?.room.roomCode);
      if (!roomInfo) return;

      // Check if seat is available
      const isBooked = bookedDesks.includes(seat.deskCode);
      const isFixed = roomInfo?.roomFixedSeatsNumbers.split(",").includes(seat.deskNo) || false;
      const openTime = moment(roomInfo?.date + " " + roomInfo?.roomOpenTime);
      let closeTime = moment(roomInfo?.date + " " + roomInfo?.roomCloseTime);
      closeTime = closeTime.isSameOrBefore(openTime) ? closeTime.add(1, "day") : closeTime;
      const currentTime = moment();
      const isOpen = currentTime.isBetween(openTime, closeTime);
      const isAvailable = !isBooked && isOpen && !isFixed;

      if (!isAvailable) return;

      // Navigate to seat selection with pre-selected desk
      const params = new URLSearchParams({
        roomCode: String(seat.room.roomCode),
        catCode: String(seat.room.roomcatCode),
        title: seat.room.roomName,
        deskCode: String(seat.deskCode),
      });
      navigate(`/ticketing/SeatSelection?${params.toString()}`);
    },
    [categoriesWiseGroupedData, bookedDesks, navigate]
  );

  const chooseCatCode = useCallback(
    (code: string) => {
      if (!categoriesWiseGroupedData?.grouped || !(code in categoriesWiseGroupedData.grouped)) return;
      setSelectedCatCode(code);
    },
    [categoriesWiseGroupedData]
  );

  const chooseLibCode = useCallback(
    (code: string) => {
      if (!categoriesWiseGroupedData?.grouped || !(code in categoriesWiseGroupedData.grouped[selectedCatCode])) return;
      setSelectedLibCode(code);
    },
    [categoriesWiseGroupedData, selectedCatCode]
  );

  const chooseFloorCode = useCallback((code: string) => {
    setSelectedFloorCode(code);
  }, []);

  const breadcrumbItems = metadata.seatBooking?.breadcrumbItems || [];

  if (
    !categoriesWiseGroupedData ||
    !categoriesWiseGroupedData.grouped ||
    categoriesWiseGroupedData.grouped?.[selectedCatCode]?.[selectedLibCode]?.[selectedFloorCode] === undefined
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const rooms =
    categoriesWiseGroupedData.grouped[selectedCatCode]?.[selectedLibCode]?.[selectedFloorCode] || [];

  // Flatten the grouped rooms array
  const roomsList: CategoryWiseAvailabilityRoom[] = rooms.flat();

  return (
    <div className="min-h-[90vh] bg-primary-50">
      <MyBreadcrumb
        items={breadcrumbItems}
        title={pageConfig.CATEGORY[selectedCatCode as ColorKeys]?.fullname || "Room Selection"}
        showBackButton={true}
      />

      <div className="mt-4 px-4">
        {/* Favorite Seats Section */}
        {favouriteSeats.length > 0 && !newFavourite && (
          <div className="mb-6">
            <Text className="text-sm font-bold mb-2">{t("favouriteSeat.myFavoriteSeats")}</Text>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {favouriteSeats.map((seat) => {
                const roomInfo = categoriesWiseGroupedData?.raw.find(
                  (room) => room.roomCode === seat?.room.roomCode
                );
                const isBooked = bookedDesks.includes(seat.deskCode);
                const isFixed =
                  roomInfo?.roomFixedSeatsNumbers.split(",").includes(String(seat.deskNo)) || false;
                const openTime = moment(roomInfo?.date + " " + roomInfo?.roomOpenTime);
                let closeTime = moment(roomInfo?.date + " " + roomInfo?.roomCloseTime);
                closeTime = closeTime.isSameOrBefore(openTime) ? closeTime.add(1, "day") : closeTime;
                const currentTime = moment();
                const isOpen = currentTime.isBetween(openTime, closeTime);
                const isAvailable = !isBooked && isOpen && !isFixed && checkedStatus;

                return (
                  <Button
                    key={seat.deskCode}
                    onClick={() => handleSeatAction(seat)}
                    disabled={!isAvailable}
                    className={`flex-shrink-0 px-2 py-1 rounded-md border-2 font-medium transition-colors ${
                      isAvailable
                        ? "bg-border-accent text-background border-border-accent"
                        : "bg-background text-primary-300 border-border"
                    }`}
                  >
                    <Text className="text-sm font-bold">{seat.deskNo}</Text>
                    <Text className="mx-2">|</Text>
                    <Text className="text-sm">{t(seat?.room?.roomName || "")}</Text>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filters */}
        {!hideCategory && categoriesWiseGroupedData.counts.categories.length > 1 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.keys(categoriesWiseGroupedData.grouped).map((key) => {
                const RoomCatIcon = pageConfig.CATEGORY[key as ColorKeys]?.icon;
                if (key === "all") return null;
                const isSelected = selectedCatCode === key;
                return (
                  <Button
                    key={key}
                    onClick={() => chooseCatCode(key)}
                    variant={isSelected ? "default" : "outline"}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <RoomCatIcon 
                      width={16} 
                      height={16} 
                    />
                    <span>{pageConfig.CATEGORY[key as ColorKeys]?.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Library Filters */}
        {!hideLibrary && categoriesWiseGroupedData.counts.libraries.length > 1 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode] || {}).map((key) => {
                if (key === "all") return null;
                const isSelected = selectedLibCode === key;
                return (
                  <Button
                    key={key}
                    onClick={() => chooseLibCode(key)}
                    variant={isSelected ? "default" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {t(key)}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floor Filters */}
        {!hideFloor && Object.keys(categoriesWiseGroupedData.counts.floors).length > 1 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.keys(categoriesWiseGroupedData.grouped[selectedCatCode]?.[selectedLibCode] || {}).map((key) => {
                if (key === "all") return null;
                const isSelected = selectedFloorCode === key;
                return (
                  <Button
                    key={key}
                    onClick={() => chooseFloorCode(key)}
                    variant={isSelected ? "default" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {t(key)}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rooms List */}
        <div className="space-y-3 max-h-[570px] overflow-y-auto pb-4">
          {roomsList.map((room: CategoryWiseAvailabilityRoom) => {
            const statusMessage = getRoomStatusMessage(room, t);
            const isDisabled = !!statusMessage;
            const RoomCatIcon = pageConfig.CATEGORY[String(room.roomcatCode) as ColorKeys]?.icon;

            return (
              <Card
                key={room.roomCode}
                onClick={() => !isDisabled && handleRoomSelect(room)}
                className={`flex p-3 rounded-md bg-white ${
                  !isDisabled ? "cursor-pointer" : "opacity-50"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-4">
                    {/* For Seat/PC rooms - show circular progress */}
                    {(room.roomcatCode === 401 || room.roomcatCode === 402) && room.roomSeatsCount && room.roomSeatsBooked !== null ? (
                      <div className="flex-shrink-0 w-14 h-14 rounded-full border-4 border-border-accent flex flex-col items-center justify-center">
                        <Text className="text-md font-bold text-border-accent">
                          {room.roomSeatsCount - (room.roomSeatsBooked || 0)}
                        </Text>
                        <Text className="text-xs text-seat-fixed">{room.roomSeatsCount}</Text>
                      </div>
                    ) : (
                      /* For Group/Carrel rooms - show floor badge */
                      <Badge className="bg-orange-100 text-gray-800 font-bold px-4 py-3 text-sm">
                        {t(room.floorName)}
                      </Badge>
                    )}
                    <div>
                      <Text variant="h3">
                        {t(room.roomName)}
                      </Text>
                      {room.roomNumber && (
                        <Text className="text-gray-500 text-sm">{room.roomNumber}</Text>
                      )}
                      {statusMessage ? (
                        <Text className="text-sm text-seat-booked font-medium">{statusMessage}</Text>
                      ) : (
                        <Text variant="h6" className="text-seat-fixed">
                          {room.roomOpenTime} - {room.roomCloseTime}
                        </Text>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 pr-2">
                    {(room.roomcatCode === 401 || room.roomcatCode === 402) && (
                      <Text className="text-md font-bold text-border-accent">
                        {t(room.floorName)}
                      </Text>
                    )}
                    <RoomCatIcon
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;
