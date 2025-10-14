import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { useBookingsStore } from "@/store/BookingsStore";
import { useAuthStore } from "@/store/AuthStore";
import { useMainStore } from "@/store/MainStore";
import { useModelStore } from "@/store/ModelStore";
import { useLanguage } from "@/contexts/useLanguage";
import { commonIcons, dashboardIcons } from "@/assets";
import moment from "moment";
import type { MyBookingModel } from "@/store/api/ResponseModels";
import { Button } from "@/components/ui/button";
import Text from "@/components/ui/custom/text";
import MyTab from "@/components/ui/custom/MyTab";

const getPageConfig = (t: (key: string) => string) => ({
  CATEGORY: {
    "401": {
      color: "#27304B",
      name: t("bookings.category.seat"),
      fullname: t("bookings.category.generalReadingRoom"),
      icon: dashboardIcons.seatIcon,
    },
    "402": {
      color: "#27304B",
      name: t("bookings.category.pc"),
      fullname: t("bookings.category.pcRoom"),
      icon: commonIcons.pcIcon,
    },
    "403": {
      color: "#27304B",
      name: t("bookings.category.group"),
      fullname: t("bookings.category.groupStudyRoom"),
      icon: dashboardIcons.groupIcon,
    },
    "404": {
      color: "#27304B",
      name: t("bookings.category.carrel"),
      fullname: t("bookings.category.personalCarrelRoom"),
      icon: dashboardIcons.carrelIcon,
    },
  },
  STATUS: {
    BOOKED: {
      color: "#27304B",
      darkColor: "#1a2033",
      name: t("bookings.status.booked"),
    },
    RETURNED: {
      color: "#EF4444",
      darkColor: "#0a0a0a",
      name: t("bookings.status.returned"),
    },
    CANCELLED: {
      color: "#EF4444",
      darkColor: "#0a0a0a",
      name: t("bookings.status.cancelled"),
    },
    IN_USE: {
      color: "#10B981",
      darkColor: "#059669",
      name: t("bookings.status.inuse"),
    },
  },
} as const);

const getRelativeTime = (momentDate: moment.Moment, t: (key: string) => string): string => {
  const now = moment();
  const diff = momentDate.diff(now, "minutes");

  if (diff > 720) {
    // 12 hours
    return momentDate.fromNow(true);
  }
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (hours > 0) {
    const hourText = hours === 1 ? t("time.hour") : t("time.hours");
    const minuteText = minutes === 1 ? t("time.minute") : t("time.minutes");
    return `${hours} ${hourText} ${minutes} ${minuteText}`;
  }
  const minuteText = minutes === 1 ? t("time.minute") : t("time.minutes");
  return `${minutes} ${minuteText}`;
};

type ColorKeys = "401" | "402" | "403" | "404";

const ActionButtons = ({ selectedBookingData }: { selectedBookingData: MyBookingModel | null }) => {
  const appConfig = useMainStore((state) => state.appConfig);
  const confirmBooking = useBookingsStore((state) => state.confirmBooking);
  const extendBooking = useBookingsStore((state) => state.extendBooking);
  const returnBooking = useBookingsStore((state) => state.returnBooking);
  const myProfile = useAuthStore((state) => state.myProfile);
  const newAlert = useModelStore((state) => state.newAlert);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const bookingAct = useCallback(
    (booking: MyBookingModel, action: "CONFIRM" | "CANCEL" | "EXTEND" | "SEATCHANGE" | "RETURN") => {
      if (action === "SEATCHANGE") {
        navigate(
          `/seat-booking?roomCode=${booking.roomCode}&catCode=${booking.roomcatCode}&title=${booking.roomName}&bookingId=${booking.bookingId}&configSeatchange=${booking.configSeatchange}`
        );
        return;
      }

      const actionLower =
        action === "CONFIRM"
          ? t("bookings.actions.confirm").toLowerCase()
          : action === "CANCEL"
          ? t("bookings.actions.cancel").toLowerCase()
          : action === "EXTEND"
          ? t("bookings.actions.extend").toLowerCase()
          : action === "RETURN"
          ? t("bookings.actions.return").toLowerCase()
          : t("bookings.actions.seatChange").toLowerCase();

      const confirmText = t(`bookings.actions.confirmText`).replace("{{action}}", actionLower);
      newAlert({
        disableOnClick: true,
        icon: "question",
        message: confirmText,
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
                    action: () => {},
                    closeOnSuccess: true,
                    color: "primary",
                  },
                ],
              });
            },
            onSuccess: (result) => {
              if (!result) return;
              newAlert({
                message: result.msg || t(`bookings.actions.successMessage`).replace("{{action}}", actionLower),
                icon: "success",
                buttons: [
                  {
                    title: t("common.ok"),
                    action: () => {},
                    closeOnSuccess: true,
                    color: "primary",
                  },
                ],
              });
            },
            action: async () => {
              switch (action) {
                case "CONFIRM":
                  return await confirmBooking(booking.bookingId);
                case "CANCEL":
                case "RETURN":
                  return await returnBooking(booking.bookingId);
                case "EXTEND":
                  return await extendBooking(booking.bookingId);
              }
            },
            closeOnSuccess: true,
          },
          {
            title: t("common.no"),
            action: () => {},
            color: "secondary",
          },
        ],
      });
    },
    [confirmBooking, extendBooking, returnBooking, navigate, t, newAlert]
  );

  const bookingData = selectedBookingData;

  const thisMemberReturned = useMemo(() => {
    if (!bookingData) return false;
    const members = bookingData.members || [];
    const meAsMember = members.find((member) => member.userId === myProfile?.userId);
    return meAsMember && meAsMember.returnDtTime !== null;
  }, [bookingData, myProfile?.userId]);

  if (!bookingData) return null;

  return (
    <div className="flex gap-2 p-2">
      {bookingData.actualStatus === "BOOKED" &&
        bookingData.buttonConfirmation &&
        appConfig?.ALLOW_MOBILE_CONFIRMATION === "true" && (
          <Button className="flex-1" onClick={() => bookingAct(bookingData, "CONFIRM")}>
            {t("bookings.actions.confirm")}
          </Button>
        )}
      {bookingData.actualStatus === "IN_USE" &&
        bookingData.buttonExtension &&
        appConfig?.ALLOW_MOBILE_EXTENSION === "true" && (
          <Button className="flex-1" onClick={() => bookingAct(bookingData, "EXTEND")}>
            {t("bookings.actions.extend")}
          </Button>
        )}
      {bookingData.actualStatus === "IN_USE" &&
        bookingData.buttonSeatchange &&
        appConfig?.ALLOW_MOBILE_SEAT_CHANGE === "true" && (
          <Button className="flex-1" onClick={() => bookingAct(bookingData, "SEATCHANGE")}>
            {t("bookings.actions.seatChange")}
          </Button>
        )}
      {bookingData.actualStatus === "BOOKED" &&
        bookingData.buttonCancellation &&
        appConfig?.ALLOW_MOBILE_CANCELLATION === "true" &&
        !thisMemberReturned && (
          <Button className="flex-1" onClick={() => bookingAct(bookingData, "CANCEL")}>
            {t("bookings.actions.cancel")}
          </Button>
        )}
      {bookingData.actualStatus === "IN_USE" &&
        bookingData.buttonReturn &&
        appConfig?.ALLOW_MOBILE_RETURN === "true" &&
        !thisMemberReturned && (
          <Button className="flex-1" onClick={() => bookingAct(bookingData, "RETURN")}>
            {t("bookings.actions.return")}
          </Button>
        )}
    </div>
  );
};

const BookingCard = ({
  selectedBookingData,
  selectedBookingId,
  pageConfig,
  t,
  getRelativeTime,
  selectedCategory,
}: {
  selectedBookingData: MyBookingModel | null;
  selectedBookingId: string | null;
  pageConfig: ReturnType<typeof getPageConfig>;
  t: (key: string) => string;
  getRelativeTime: (momentDate: moment.Moment, t: (key: string) => string) => string;
  selectedCategory: number[] | null;
}) => {
  if (!selectedBookingData && selectedBookingId === "NA") {
    return (
      <div className="m-3 border border-border rounded-lg bg-background shadow-sm">
        <div className="bg-primary text-primary-foreground rounded-t-lg p-3">
          <Text className="text-white text-xs font-bold">{t("bookings.ticketInfo")}</Text>
          <Text className="text-white text-[10px]">{t("NA")}</Text>
        </div>
        <div className="p-0">
          <div className="bg-surface-light flex justify-between items-center gap-2 m-2 p-2 rounded-lg">
            <div className="flex-1 text-center border-r border-primary-100">
              <Text className="text-foreground text-sm font-medium">{t("bookings.floorName")}</Text>
              <Text variant="h6">{t("NA")}</Text>
            </div>
            <div className="flex-1 text-center border-primary-100">
              <Text className="text-foreground text-sm font-medium">{t("bookings.roomName")}</Text>
              <Text variant="h6">{t("NA")}</Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedBookingData) return null;

  return (
    <div className="m-3 border border-border rounded-lg bg-background shadow-sm">
      <div className="bg-primary text-primary-foreground rounded-t-lg p-3 flex flex-row justify-between items-start">
        <div>
          <Text className="text-white text-xs font-bold">{t("bookings.ticketInfo")}</Text>
          <Text className="text-white text-[10px]">
            {pageConfig.CATEGORY[String(selectedBookingData?.roomcatCode) as keyof typeof pageConfig["CATEGORY"]]
              ?.fullname || t("NA")}
          </Text>
        </div>
        {(selectedBookingData?.actualStatus === "BOOKED" || selectedBookingData?.actualStatus === "IN_USE") && (
          <div className="text-right">
            <Text className="text-white text-xs font-bold">
              {selectedBookingData.actualStatus === "BOOKED"
                ? t("bookings.confirmationRequired")
                : t("bookings.bookingRemaining")}
            </Text>
            <Text className="text-white text-[10px]">
              {selectedBookingData.actualStatus === "BOOKED"
                ? getRelativeTime(
                    moment(selectedBookingData.reservationFrom).add(
                      selectedBookingData.roomConfirmationWaitingTime,
                      "m"
                    ),
                    t
                  )
                : getRelativeTime(
                    moment(selectedBookingData.reservationFinished || selectedBookingData.reservationTill),
                    t
                  )}
            </Text>
          </div>
        )}
      </div>
      <div className="p-0">
        <div className="bg-surface-light flex justify-between items-center gap-2 m-2 p-2 rounded-lg">
          <div className="flex-1 text-center border-r border-primary-100">
            <Text className="text-foreground text-sm font-medium">{t("bookings.floorName")}</Text>
            <Text variant="h6">{t(selectedBookingData?.floorName || t("NA"))}</Text>
          </div>
          <div className="flex-1 text-center border-primary-100">
            <Text className="text-foreground text-sm font-medium">{t("bookings.roomName")}</Text>
            <Text variant="h6">{t(selectedBookingData?.roomName || t("NA"))}</Text>
          </div>
        </div>
        <div className="flex justify-between items-center gap-2 p-2">
          <div className="flex-1 text-center border-r border-primary-100">
            <Text className="text-foreground text-sm font-medium">
              {selectedCategory?.includes(401) || selectedCategory?.includes(402)
                ? t("bookings.seatNumber")
                : t("bookings.roomNumber")}
            </Text>
            <Text variant="h6">
              {t("bookings.seatNo")} {selectedBookingData?.reserveDeskNo || t("NA")}
            </Text>
          </div>
          {selectedBookingData?.deskPassword !== null && selectedBookingData?.actualStatus === "IN_USE" && (
            <div className="flex-1 text-center border-r border-primary-100">
              <Text className="text-foreground text-sm font-medium">{t("bookings.password")}</Text>
              <Text variant="h6">{selectedBookingData.deskPassword}</Text>
            </div>
          )}
          {selectedBookingData?.roomExtensionLimit && selectedBookingData.roomExtensionLimit > 0 && (
            <div className="flex-1 text-center border-r border-primary-100">
              <Text className="text-foreground text-sm font-medium">{t("bookings.extensionCount")}</Text>
              <Text variant="h6">
                {selectedBookingData.extensionCount} / {selectedBookingData.roomExtensionLimit}
              </Text>
            </div>
          )}
          <div className="flex-1 text-center border-primary-100">
            <Text className="text-foreground text-sm font-medium flex-1">{t("bookings.usageTime")}</Text>
            <Text variant="h6">
              {moment(selectedBookingData?.reservationFrom).format("LT")}-
              {moment(selectedBookingData?.reservationFinished || selectedBookingData?.reservationTill).format("LT")}
            </Text>
          </div>
        </div>
        <ActionButtons selectedBookingData={selectedBookingData} />
      </div>
    </div>
  );
};

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { init, stopAndClear, myBookings, getMyBookingsList, setSelectedCategory, haveMore } =
    useBookingsStore();
  const { fetchAppConfig } = useMainStore();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const catCode = searchParams.get("catCode");
  const { t, language } = useLanguage();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>("WAIT_FOR_PARAMS");
  const [selectedBookingData, setSelectedBookingData] = useState<MyBookingModel | null>(null);
  const { myProfile } = useAuthStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);

  const pageConfig = useMemo(() => getPageConfig(t), [t]);

  useEffect(() => {
    init();
    if (fetchAppConfig) fetchAppConfig();
    return () => {
      stopAndClear();
    };
  }, [init, fetchAppConfig, stopAndClear]);

  useEffect(() => {
    setSelectedBookingId(bookingId && typeof bookingId === "string" && bookingId.length > 0 ? bookingId : null);
    if (catCode && typeof catCode === "string" && catCode.length > 0) {
      const catCodeNum = parseInt(catCode);
      if (catCodeNum === 401 || catCodeNum === 402) {
        setSelectedCategory([401, 402]);
        setActiveTab("general");
      } else if (catCodeNum === 403) {
        setSelectedCategory([403]);
        setActiveTab("group");
      } else if (catCodeNum === 404) {
        setSelectedCategory([404]);
        setActiveTab("carrel");
      }
    }
  }, [bookingId, catCode, setSelectedCategory]);

  useEffect(() => {
    if (myBookings) {
      if ((selectedBookingId === null || selectedBookingId === "NA" || selectedBookingId === undefined) && myBookings.length > 0) {
        const filteredBookings = myBookings.filter(
          (booking) => booking.actualStatus === "BOOKED" || booking.actualStatus === "IN_USE"
        );
        setSelectedBookingId(filteredBookings?.[0]?.bookingId || "NA");
        return;
      }
      const selectedBookingDataFind = myBookings.find((booking) => booking.bookingId === selectedBookingId);
      setSelectedBookingData(selectedBookingDataFind || null);
    }
  }, [selectedBookingId, myBookings]);

  const handleScroll = () => {
    if (!scrollContainerRef.current || isLoadingMore.current || !haveMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8) {
      isLoadingMore.current = true;
      getMyBookingsList(null).finally(() => {
        isLoadingMore.current = false;
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [haveMore]);

  const renderBookingCards = (catCodes: number[]) => {
    const bookings = myBookings;
    
    return (
      <>
        {/* Static Booking Info Header */}
        {!(!haveMore && myBookings.length === 0) && (
          <BookingCard
            selectedBookingData={selectedBookingData}
            selectedBookingId={selectedBookingId}
            pageConfig={pageConfig}
            t={t}
            getRelativeTime={getRelativeTime}
            selectedCategory={catCodes}
          />
        )}

        {/* Dynamic Bookings */}
        <div className="bg-background p-2">
          <Text className="p-2 font-medium">{t("bookings.bookingsHistory")}</Text>
          {bookings.length === 0 && !haveMore ? (
            <Text className="text-muted-foreground text-center mt-4">{t("bookings.noBookings")}</Text>
          ) : (
            <div
              ref={scrollContainerRef}
              className="max-h-[45vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
            >
              {bookings.map((item) => {
                const isSelected = item.bookingId === selectedBookingId;
                const categoryColor = pageConfig.CATEGORY[String(item.roomcatCode) as ColorKeys]?.color || "#27304B";

                return (
                  <div
                    key={item.bookingId}
                    onClick={() => setSelectedBookingId(item.bookingId)}
                    className="border border-border rounded-2xl mb-2 shadow-sm bg-background flex gap-4 cursor-pointer"
                    style={{
                      borderLeftWidth: "5px",
                      borderLeftColor: categoryColor,
                      backgroundColor: isSelected ? "#f9fafb" : "white",
                    }}
                  >
                    <div className="flex flex-col items-center justify-center min-w-[80px] border-r rounded-l-2xl">
                      <div className="text-md font-bold text-primary-600">{t(item.floorName)}</div>
                      <Text className="text-primary-600 text-sm">{moment(item.reservationDtime).format("YYYY")}</Text>
                      <div className="flex">
                        {language !== "ko" && (
                          <Text className="text-primary-600 text-sm font-medium">
                            {moment(item.reservationDtime).format("DD")}{" "}
                          </Text>
                        )}
                        <Text className="text-primary-600 text-sm font-medium">
                          {moment(item.reservationDtime).format("MMM")}
                        </Text>
                        {language === "ko" && (
                          <Text className="text-primary-600 text-sm font-medium">
                            {" "}
                            {moment(item.reservationDtime).format("DD")}일
                          </Text>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2 text-primary-700">
                          <div className="w-3 h-3 rounded-full bg-border border-2 border-border-tile flex-shrink-0" />
                          <Text className="font-semibold text-sm">{moment(item.reservationFrom).format("LT")}</Text>
                          <Text className="text-muted-foreground text-sm">
                            {" "}
                            - {moment(item.reservationFrom).format("LL")}
                          </Text>
                        </div>

                        <div className="relative ml-[5px]">
                          <div className="h-2 border-l-2 border-dashed border-primary-300 mx-auto"></div>
                          <div className="absolute left-1/2 top-1/2 w-[90%] h-[1px] bg-primary-200 -translate-x-1/2 -translate-y-1/2"></div>
                        </div>

                        <div className="flex items-center gap-2 text-primary-700">
                          <div className="w-3 h-3 rounded-full bg-border border-2 border-border-tile flex-shrink-0" />
                          <Text className="font-semibold text-sm">
                            {moment(item.reservationFinished || item.reservationTill).format("LT")}
                          </Text>
                          <Text className="text-muted-foreground text-sm">
                            {" "}
                            - {moment(item.reservationFinished || item.reservationTill).format("LL")}
                          </Text>
                        </div>
                      </div>

                      <Text className="text-primary-900 text-sm mb-2 mt-1">
                        {t(item.roomName)}
                        {item.bookingType === "SEAT" ? ` » ${t("bookings.seatNumber")} ${item.reserveDeskNo}` : ""}
                      </Text>

                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        <span className="flex items-center gap-1 bg-surface-light text-accent-second px-1 text-[13px]">
                          <img
                            src={pageConfig.CATEGORY[String(item.roomcatCode) as ColorKeys]?.icon}
                            alt=""
                            className="w-3 h-3"
                          />
                          {pageConfig.CATEGORY[String(item.roomcatCode) as ColorKeys]?.name}
                        </span>

                        <span className="flex items-center gap-1 bg-surface-light text-accent-second px-1 text-[13px]">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                pageConfig.STATUS[item.actualStatus as keyof typeof pageConfig["STATUS"]].color,
                            }}
                          ></span>
                          {pageConfig.STATUS[item.actualStatus as keyof typeof pageConfig["STATUS"]].name}
                        </span>

                        {item.multiUserBooking === true && item.userId === myProfile?.userId && (
                          <span className="flex items-center gap-1 bg-surface-light text-accent-second px-1 text-[13px]">
                            <img src={commonIcons.fellowMemberIcon} alt="" className="w-3 h-3" />
                            {t("bookings.managerUser")}
                          </span>
                        )}

                        <span className="flex items-center gap-1 bg-surface-light text-accent-second px-1 text-sm">
                          {item.reservationMode === "K" && (
                            <img src={commonIcons.kioskIcon} alt="Kiosk" className="w-5 h-5 text-primary-600" />
                          )}
                          {item.reservationMode === "W" && (
                            <img src={commonIcons.webIcon} alt="Web" className="w-5 h-5 text-primary-600" />
                          )}
                          {item.reservationMode === "M" && (
                            <img src={commonIcons.mobileIcon} alt="Mobile" className="w-5 h-5 text-primary-600" />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {haveMore && myBookings.length > 0 && (
                <div className="flex justify-center py-4">
                  <Text className="text-muted-foreground text-sm">Loading more...</Text>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  const tabs = [
    {
      id: "general",
      label: t("bookings.tab.seatPc"),
      content: renderBookingCards([401, 402]),
    },
    {
      id: "group",
      label: t("bookings.tab.groupStudy"),
      content: renderBookingCards([403]),
    },
    {
      id: "carrel",
      label: t("bookings.tab.carrel"),
      content: renderBookingCards([404]),
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "general") {
      setSelectedCategory([401, 402]);
    } else if (tabId === "group") {
      setSelectedCategory([403]);
    } else if (tabId === "carrel") {
      setSelectedCategory([404]);
    }
    setSelectedBookingId(null);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadcrumbItems = metadata.myBookings?.breadcrumbItems || [];

  return (
    <div className="max-h-screen bg-gray-50">
      <MyBreadcrumb items={breadcrumbItems} title="My Bookings" showBackButton={true} />

      <MyTab
        tabs={tabs}
        defaultTab="general"
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabListClassName="bg-white"
        variant="pills"
        fullWidth
      />
    </div>
  );
};

export default MyBookings;
