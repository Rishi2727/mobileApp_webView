import { useEffect, useRef } from "react";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { commonIcons, dashboardIcons } from "@/assets";
import { useMessagesStore } from "@/store/MessagesStore";
import { useLanguage } from "@/contexts/useLanguage";
import moment from "moment";
import Text from "@/components/ui/custom/text";

const getPageConfig = (t: (key: string) => string) => ({
  METHODS: {
    ALL_USERS: {
      color: "#10B981",
      name: t("pushNotifications.notices"),
      icon: commonIcons.BellIcon,
    },
    IDENTITY_WISE: {
      color: "#3B82F6",
      name: t("pushNotifications.group"),
      icon: commonIcons.BellIcon,
    },
    USER_SPECIFIC: {
      color: "#8B5CF6",
      name: t("pushNotifications.personal"),
      icon: commonIcons.BellIcon,
    },
  },
  CLASSIFICATIONS: {
    "0": {
      code: null,
      color: "#27304B",
      name: t("bookings.category.all"),
      icon: commonIcons.BellIcon,
    },
    "1": {
      code: [401, 402],
      color: "#27304B",
      name: t("bookings.category.seat"),
      icon: dashboardIcons.SeatIcon,
    },
    "2": {
      code: [403],
      color: "#27304B",
      name: t("bookings.category.group"),
      icon: dashboardIcons.GroupIcon,
    },
    "3": {
      code: [404],
      color: "#27304B",
      name: t("bookings.category.carrel"),
      icon: dashboardIcons.CarrelIcon,
    },
    "4": {
      code: [1, 2, 3],
      color: "#27304B",
      name: t("pushNotifications.notices"),
      icon: dashboardIcons.MessageIcon,
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

      <div className="p-4">
        {/* Filter Buttons */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {(Object.keys(pageConfig.CLASSIFICATIONS) as ClassificationsKeys[]).map((key) => {
            const classification = pageConfig.CLASSIFICATIONS[key];
            const isSelected =
              selectedClassification?.sort().join(",") ===
              classification.code?.sort().join(",");

            return (
              <div
                key={key}
                onClick={() => setSelectedClassification(classification.code)}
                className={`min-w-[30px] h-[40px] flex flex-col items-center justify-center p-1 rounded-md transition-colors ${
                  isSelected
                    ? "text-primary-900 bg-surface-tertiary border-2 border-border-accent"
                    : "bg-background text-primary-400 hover:bg-primary-50"
                }`}
              >
                <classification.icon
                  width={15}
                  height={15}
                  className="mb-1"
                />
                <Text className=" text-[10px] font-medium">{classification.name}</Text>
              </div>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="max-h-[620px] overflow-y-auto" ref={scrollContainerRef}>
          {myNotifications.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <Text className="text-muted-foreground">No notifications found</Text>
            </div>
          ) : (
            myNotifications.map((item, index) => (
              <div
                key={item.pushId + index.toString()}
                className="rounded-md p-3 mb-2 bg-white"
              >
                <div className="p-0">
                  <Text className="text-gray-900 text-sm font-semibold">
                    {language === "ko"
                      ? item.pushTitle || item.pushTitleEn
                      : item.pushTitleEn || item.pushTitle}
                  </Text>
                  <Text className="text-gray-700 mt-1 text-sm">
                    {language === "ko"
                      ? item.pushMessage || item.pushMessageEn
                      : item.pushMessageEn || item.pushMessage}
                  </Text>
                  <Text variant="h6" className="mt-1">
                    {moment(item.sendDateTime || item.pushScheduleDateTime).format("LLL")}
                  </Text>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {haveMore && myNotifications.length > 0 && (
            <div className="flex justify-center py-4">
              <Text className="text-muted-foreground text-sm">Loading more...</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;