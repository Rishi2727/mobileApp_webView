import { useState } from "react";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import MyTab from "@/components/ui/custom/MyTab";
import { Computer, Languages, Smartphone } from "lucide-react";
import Text from "@/components/ui/custom/text";
interface MyBookingModel {
  bookingId: string;
  roomcatCode: number;
  roomcatName: string;
  roomCode: string;
  roomName: string;
  roomNumber: string;
  floorCode: string;
  floorName: string;
  floorNumber: string;
  reserveDeskNo: string;
  reserveDeskCode: string;
  reservationFrom: string;
  reservationTill: string;
  reservationFinished: string | null;
  reservationDtime: string;
  actualStatus: "BOOKED" | "IN_USE" | "RETURNED" | "CANCELLED";
  buttonConfirmation: boolean;
  buttonExtension: boolean;
  buttonSeatchange: boolean;
  buttonCancellation: boolean;
  buttonReturn: boolean;
  deskPassword: string | null;
  roomExtensionLimit: number;
  extensionCount: number;
  roomConfirmationWaitingTime: number;
  bookingType: string;
  reservationMode: "K" | "W" | "M";
  multiUserBooking: boolean;
  userId: string;
}
const mockBookings: MyBookingModel[] = [

  {
    bookingId: "2",
    roomcatCode: 401,
    roomcatName: "General Reading Room",
    roomCode: "L80",
    roomName: "Lounge'80",
    roomNumber: "2",
    floorCode: "3F",
    floorName: "3F",
    floorNumber: "3",
    reserveDeskNo: "6",
    reserveDeskCode: "DESK006",
    reservationFrom: "2025-09-11T15:28:00",
    reservationTill: "2025-09-11T15:32:00",
    reservationFinished: "2025-09-11T15:32:00",
    reservationDtime: "2025-09-11T15:28:00",
    actualStatus: "RETURNED",
    buttonConfirmation: false,
    buttonExtension: false,
    buttonSeatchange: false,
    buttonCancellation: false,
    buttonReturn: false,
    deskPassword: null,
    roomExtensionLimit: 2,
    extensionCount: 0,
    roomConfirmationWaitingTime: 10,
    bookingType: "SEAT",
    reservationMode: "W",
    multiUserBooking: false,
    userId: "user123",
  },
  {
    bookingId: "3",
    roomcatCode: 401,
    roomcatName: "General Reading Room",
    roomCode: "LHL",
    roomName: "Lighthouse Lounge",
    roomNumber: "3",
    floorCode: "3F",
    floorName: "3F",
    floorNumber: "3",
    reserveDeskNo: "18",
    reserveDeskCode: "DESK018",
    reservationFrom: "2025-08-18T16:21:00",
    reservationTill: "2025-08-18T18:00:00",
    reservationFinished: "2025-08-18T18:00:00",
    reservationDtime: "2025-08-18T16:21:00",
    actualStatus: "RETURNED",
    buttonConfirmation: false,
    buttonExtension: false,
    buttonSeatchange: false,
    buttonCancellation: false,
    buttonReturn: false,
    deskPassword: null,
    roomExtensionLimit: 2,
    extensionCount: 1,
    roomConfirmationWaitingTime: 10,
    bookingType: "SEAT",
    reservationMode: "K",
    multiUserBooking: false,
    userId: "user123",
  },
  {
    bookingId: "4",
    roomcatCode: 401,
    roomcatName: "General Reading Room",
    roomCode: "LHL",
    roomName: "Lighthouse Lounge",
    roomNumber: "3",
    floorCode: "3F",
    floorName: "3F",
    floorNumber: "3",
    reserveDeskNo: "2",
    reserveDeskCode: "DESK002",
    reservationFrom: "2025-08-13T17:56:00",
    reservationTill: "2025-08-13T17:58:00",
    reservationFinished: "2025-08-13T17:58:00",
    reservationDtime: "2025-08-13T17:56:00",
    actualStatus: "RETURNED",
    buttonConfirmation: false,
    buttonExtension: false,
    buttonSeatchange: false,
    buttonCancellation: false,
    buttonReturn: false,
    deskPassword: null,
    roomExtensionLimit: 2,
    extensionCount: 0,
    roomConfirmationWaitingTime: 10,
    bookingType: "SEAT",
    reservationMode: "M",
    multiUserBooking: false,
    userId: "user123",
  },
  {
    bookingId: "4",
    roomcatCode: 401,
    roomcatName: "General Reading Room",
    roomCode: "LHL",
    roomName: "Lighthouse Lounge",
    roomNumber: "3",
    floorCode: "3F",
    floorName: "3F",
    floorNumber: "3",
    reserveDeskNo: "2",
    reserveDeskCode: "DESK002",
    reservationFrom: "2025-08-13T17:56:00",
    reservationTill: "2025-08-13T17:58:00",
    reservationFinished: "2025-08-13T17:58:00",
    reservationDtime: "2025-08-13T17:56:00",
    actualStatus: "RETURNED",
    buttonConfirmation: false,
    buttonExtension: false,
    buttonSeatchange: false,
    buttonCancellation: false,
    buttonReturn: false,
    deskPassword: null,
    roomExtensionLimit: 2,
    extensionCount: 0,
    roomConfirmationWaitingTime: 10,
    bookingType: "SEAT",
    reservationMode: "M",
    multiUserBooking: false,
    userId: "user123",
  },
];

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const breadcrumbItems = metadata.booking.breadcrumbItems || [];
  const generalBookings = mockBookings.filter((b) => b.roomcatCode === 401);
  const groupBookings = mockBookings.filter((b) => b.roomcatCode === 403);
  const carrelBookings = mockBookings.filter((b) => b.roomcatCode === 402);

  // Helper to render booking cards
  const renderBookingCards = (bookings: typeof mockBookings) => {
    return (
      <>
        {/* Static Booking Info Header - keep as is */}
        <div className="bg-background rounded-t-2xl m-2">
          <div className="p-2 bg-border-accent rounded-t-2xl">
            <Text className="font-bold text-background">Booking Information</Text>
            <Text className="text-sm text-background">General Seat</Text>
          </div>
          <div className="m-2 p-1 flex rounded-md bg-primary-200">
            <div className="border-r border-secondary flex-1 items-center justify-center text-center">
              <Text className="text-sm font-medium">Floor Number</Text>
              <Text className="text-sm text-muted-foreground">3F</Text>
            </div>
            <div className="border-l border-secondary flex-1 p-1 items-center justify-center text-center">
              <Text className="text-sm font-medium">Floor Number</Text>
              <Text className="text-sm text-muted-foreground">3F</Text>
            </div>
          </div>
          <div className="flex bg-background rounded-lg justify-between items-center p-2">
            <div className="text-center border-r border-primary-100 flex-1">
              <Text className="text-sm font-medium">Seat Number</Text>
              <Text variant="h6">
                {2}
              </Text>
            </div>
            <div className="text-center border-r border-primary-100 flex-1">
              <Text className="text-foreground text-sm font-medium">
                No. of Extensions
              </Text>
              <Text variant="h6">
                {0 / 2}
              </Text>
            </div>
            <div className="text-center border-primary-100 flex-1">
              <Text className="text-foreground text-sm font-medium flex-1">
                Usage Time
              </Text>
              <Text variant="h6">
                4:21 PM-6:00 PM
              </Text>
            </div>
          </div>
        </div>

        {/* Dynamic Bookings */}
        <div className="bg-background p-2">
          <Text className="p-2 font-medium">Booking History</Text>
          {bookings.length === 0 ? (
            <Text className="text-muted-foreground text-center mt-4">
              No bookings available.
            </Text>
          ) : (
            <div className="max-h-[45vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              {bookings.map((b) => {
                const fromDate = new Date(b.reservationFrom);
                const tillDate = new Date(b.reservationTill);
                const year = fromDate.getFullYear();
                const day = fromDate.getDate();
                const monthName = fromDate.toLocaleDateString("en-US", {
                  month: "short",
                });

                return (
                  <div
                    key={b.bookingId}
                    className="border border-border rounded-2xl mb-2 shadow-sm bg-background flex gap-4"
                  >
                    {/* Left Side - Date and Floor */}
                    <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-l-5 rounded-l-2xl">
                      <div className="text-md font-bold text-primary-600">
                        {b.floorName}
                      </div>
                      <div className="text-primary-600 text-sm">{year}</div>
                      <div className="text-primary-600 text-sm font-medium">
                        {day} {monthName}
                      </div>
                    </div>

                    {/* Right Side - Timeline and Details */}
                    <div className="flex-1 flex flex-col">
                      {/* Timeline */}
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2 text-primary-700">
                          <div className="w-3 h-3 rounded-full bg-border border-2 border-border-tile flex-shrink-0" />
                          <Text className="font-semibold text-sm">
                            {fromDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </Text>
                          <Text className="text-muted-foreground text-sm">
                            -{" "}
                            {fromDate.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                        </div>

                        <div className="relative ml-[5px]">
                          <div className="h-2 border-l-2 border-dashed border-primary-300 mx-auto"></div>
                          <div className="absolute left-1/2 top-1/2 w-[90%] h-[1px] bg-primary-200 -translate-x-1/2 -translate-y-1/2"></div>
                        </div>

                        <div className="flex items-center gap-2 text-primary-700">
                          <div className="w-3 h-3 rounded-full bg-border border-2 border-border-tile flex-shrink-0" />
                          <Text className="font-semibold text-sm">
                            {tillDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </Text>
                          <Text className="text-muted-foreground text-sm">
                            -{" "}
                            {tillDate.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                        </div>
                      </div>

                      {/* Location */}
                      <Text className="text-primary-900 text-sm mb-2 mt-1">
                        {b.roomName} » Seat Number {b.reserveDeskNo}
                      </Text>

                      {/* Chips */}
                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        <Text className="flex items-center gap-1 bg-surface-light text-accent-second px-1 text-[13px]">
                          {b.roomcatName}
                        </Text>

                        <span className="flex items-center gap-1 bg-surface-light text-accent-second px-1 text-[13px]">
                          <span className="w-2 h-2 rounded-full bg-error"></span>
                          {b.actualStatus}
                        </span>

                        <span className="flex items-center gap-1 bg-surface-light text-accent-second px-1 text-sm">
                          {b.reservationMode === "K" && (
                            <Computer className="w-5 h-5 text-primary-600" />
                          )}
                          {["I", "M", "A"].includes(b.reservationMode) && (
                            <Smartphone className="w-5 h-5 text-primary-600" />
                          )}
                          {b.reservationMode === "W" && (
                            <Languages className="w-5 h-5 text-primary-600" />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  };

  const tabs = [
    {
      id: "general",
      label: "General",
      content: renderBookingCards(generalBookings),
    },
    {
      id: "group",
      label: "Group",
      content: renderBookingCards(groupBookings),
    },
    {
      id: "carrel",
      label: "Carrel",
      content: renderBookingCards(carrelBookings),
    },
  ];

  return (
    <div className="max-h-screen bg-gray-50">
      <MyBreadcrumb
        items={breadcrumbItems}
        title="Bookings"
        showBackButton={true}
      />
      
      <MyTab
        tabs={tabs}
        defaultTab="general"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabListClassName="bg-white"
        variant="pills"
        fullWidth
      />
    </div>
  );
};

export default MyBookings;
