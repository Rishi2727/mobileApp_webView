import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { commonIcons, dashboardIcons } from "@/assets";
import { Image } from "@/components/ui/custom/image";
import Text from "@/components/ui/custom/text";


const notifications = [
  {
    id: 1,
    title: "TEST",
    message: "TEST",
    date: "September 23, 2025 8:35 PM",
    category: "General",
  },
  {
    id: 2,
    title: "Carrel Room Reservation Cancellation",
    message: "Your reservation [Carrel 01] has been cancelled by the system.",
    date: "September 11, 2025 4:10 PM",
    category: "Carrel",
  },
  {
    id: 3,
    title: "Group Study Room Reservation Cancellation",
    message: "Your reservation [Study Room 203] has been cancelled by the system.",
    date: "September 11, 2025 4:10 PM",
    category: "Group",
  },
  {
    id: 4,
    title: "Reading Room Reservation Cancellation",
    message:
      "Your reading room reservation [Media Lounge Laptop Access, 9] has been cancelled by the system because you did not confirm your booking within the allotted time. You now have 3 no-show record(s). After 3 no-shows, you will not be able to use the service for 7 days.",
    date: "September 11, 2025 3:53 PM",
    category: "Notices",
  },
  {
    id: 5,
    title: "Upcoming Group Study Room Booking Reminder",
    message:
      "You have an upcoming reservation [Study Room 203]. Please confirm the usage at the KIOSK.",
    date: "September 11, 2025 3:50 PM",
    category: "Group",
  },
];

const NotificationCard = ({
  title,
  message,
  date,
}: {
  title: string;
  message: string;
  date: string;
}) => (
  <Card className=" rounded-md p-3 mb-2 bg-white">
    <CardHeader className="p-0">
      <CardTitle className="text-gray-900 text-sm font-semibold">{title}</CardTitle>
      <CardDescription className="text-gray-700 mt-1 text-sm">{message}</CardDescription>
      <Text variant="h6">{date}</Text>
    </CardHeader>
  </Card>
);

const Message = () => {
  const breadcrumbItems = metadata.message.breadcrumbItems || [];
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { value: "all", label: "All", icon: commonIcons.bellIcon },
    { value: "general", label: "General", icon: dashboardIcons.bookIcon },
    { value: "group", label: "Group", icon: dashboardIcons.groupIcon },
    { value: "carrel", label: "Carrel", icon: dashboardIcons.carrelIcon },
    { value: "notices", label: "Notices", icon: dashboardIcons.messageIcon },
  ];

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.category.toLowerCase() === activeFilter);

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
          {filters.map(({ value, label, icon }) => (
            <div
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`w-[40px] h-[40px] flex flex-col items-center justify-center p-1 rounded-md transition-colors ${
                activeFilter === value
                  ? "text-gray-900 bg-gray-100 border-2 border-border-accent"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Image 
                src={icon} 
                alt={label} 
                width={15}
                height={15}
                className={` mb-1 ${activeFilter === value ? "" : ""}`}
              />
              <Text className="text-[10px] font-medium">{label}</Text>
            </div>
          ))}
        </div>

        {/* Notifications List */}
        <div className="max-h-[620px] overflow-y-auto">
          {filteredNotifications.map((n) => (
            <NotificationCard key={n.id} title={n.title} message={n.message} date={n.date} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Message;