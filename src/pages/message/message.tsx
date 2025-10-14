import { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { commonIcons, dashboardIcons } from "@/assets";
import { useMessagesStore } from "@/store/MessagesStore";
import { useLanguage } from "@/contexts/useLanguage";
import moment from "moment";

const getPageConfig = (t: (key: string) => string) => ({
  METHODS: {
    ALL_USERS: {
      color: "#10B981",
      name: t("pushNotifications.notices"),
      icon: commonIcons.bellIcon,
    },
    IDENTITY_WISE: {
      color: "#3B82F6",
      name: t("pushNotifications.group"),
      icon: commonIcons.bellIcon,
    },
    USER_SPECIFIC: {
      color: "#8B5CF6",
      name: t("pushNotifications.personal"),
      icon: commonIcons.bellIcon,
    },
  },
  CLASSIFICATIONS: {
    "0": {
      code: null,
      color: "#27304B",
      name: t("bookings.category.all"),
      icon: commonIcons.bellIcon,
    },
    "1": {
      code: [401, 402],
      color: "#27304B",
      name: t("bookings.category.seat"),
      icon: dashboardIcons.seatIcon,
    },
    "2": {
      code: [403],
      color: "#27304B",
      name: t("bookings.category.group"),
      icon: dashboardIcons.groupIcon,
    },
    "3": {
      code: [404],
      color: "#27304B",
      name: t("bookings.category.carrel"),
      icon: dashboardIcons.carrelIcon,
    },
    "4": {
      code: [1, 2, 3],
      color: "#27304B",
      name: t("pushNotifications.notices"),
      icon: dashboardIcons.messageIcon,
    },
  },
});

type ClassificationsKeys = keyof ReturnType<typeof getPageConfig>["CLASSIFICATIONS"];

const Message = () => {
  const breadcrumbItems = metadata.message.breadcrumbItems || [];
  const {
    init,
    stopAndClear,
    myNotifications,
    getMyNotificationsList,
    selectedMethod,
    setSelectedClassification,
    selectedClassification,
    haveMore,
  } = useMessagesStore();
  
  const { language, t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);

  // Get translated page config
  const pageConfig = getPageConfig(t);

  useEffect(() => {
    init();
    return () => {
      stopAndClear();
    };
  }, [init, stopAndClear]);

  // Handle infinite scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current || isLoadingMore.current || !haveMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8) {
      isLoadingMore.current = true;
      getMyNotificationsList(null).finally(() => {
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

  return (
    <div className="bg-secondary min-h-[90vh]">
      <MyBreadcrumb
        items={breadcrumbItems}
        title="Notifications"
        showBackButton={true}
      />

      <div className="p-3">
        {/* Filter Buttons */}
        <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
          {(Object.keys(pageConfig.CLASSIFICATIONS) as ClassificationsKeys[]).map((key) => {
            const classification = pageConfig.CLASSIFICATIONS[key];
            const isSelected =
              selectedClassification?.sort().join(",") ===
              classification.code?.sort().join(",");
            const isCorrectlyFetched =
              isSelected &&
              myNotifications.length > 0 &&
              myNotifications.every(
                (e) =>
                  e.pushSendMethod === selectedMethod &&
                  (!classification.code ||
                    classification.code?.includes(e.pushClassificationCode))
              );

            return (
              <button
                key={key}
                onClick={() => setSelectedClassification(classification.code)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] transition-all ${
                  isSelected
                    ? "border-2 border-[#4A90E2] bg-white"
                    : "border-0 bg-white"
                }`}
                style={{
                  backgroundColor: isCorrectlyFetched
                    ? "#E3F2FD"
                    : isSelected
                    ? "#FAFAFA"
                    : "#FFFFFF",
                }}
              >
                <img
                  src={classification.icon}
                  alt={classification.name}
                  className="w-[14px] h-[14px] mb-1"
                />
                <span className="text-[8px] text-primary-900 font-medium whitespace-nowrap">
                  {classification.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 180px)" }}
        >
          {myNotifications.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            myNotifications.map((item, index) => (
              <Card
                key={item.pushId + index.toString()}
                className="rounded-md p-3 mb-2 bg-white"
              >
                <CardHeader className="p-0">
                  <CardTitle className="text-primary-900 text-xs font-bold">
                    {language === "ko"
                      ? item.pushTitle || item.pushTitleEn
                      : item.pushTitleEn || item.pushTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-700 mt-2 text-xs">
                    {language === "ko"
                      ? item.pushMessage || item.pushMessageEn
                      : item.pushMessageEn || item.pushMessage}
                  </CardDescription>
                  <p className="text-muted-foreground mt-2 text-[11px]">
                    {moment(item.sendDateTime || item.pushScheduleDateTime).format(
                      "LLL"
                    )}
                  </p>
                </CardHeader>
              </Card>
            ))
          )}
          
          {/* Loading indicator */}
          {haveMore && myNotifications.length > 0 && (
            <div className="flex justify-center py-4">
              <p className="text-muted-foreground text-sm">Loading more...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;