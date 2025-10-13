
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { metadata } from "@/config/metadata";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import Text from "@/components/ui/custom/text";
import { useState } from "react";
import { Image } from "@/components/ui/custom/image";
import { ShowAlert } from "@/components/ui/custom/my-alert";
import { commonIcons } from "@/assets";

const CarrelTimeSelection = () => {
  const breadcrumbItems = metadata.timeSelection.breadcrumbItems || [];

  const [selectedDay, setSelectedDay] = useState(13);
  const [currentRoomType] = useState(0);
  const [startIndex, setStartIndex] = useState(0); 

  const roomsPerPage = 3; 

  const weekDays = [
    { day: "M", date: 13 },
    { day: "T", date: 14 },
    { day: "W", date: 15 },
    { day: "T", date: 16 },
    { day: "F", date: 17 },
  ];

  const roomTypes = [
    {
      name: "Personal Carrel Room ",
      rooms: [
        "Carrel Room 301",
        "Carrel Room 302",
        "Carrel Room 303",
        "Carrel Room 304",
        "Carrel Room 305",
        "Carrel Room 306",
      ],
    },
  ];

  const timeSlots = ["2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"];

  const currentRooms = roomTypes[currentRoomType].rooms.slice(
    startIndex,
    startIndex + roomsPerPage
  );

  const handlePrevRoomSet = () => {
    setStartIndex((prev) => Math.max(prev - roomsPerPage, 0));
  };

  const handleNextRoomSet = () => {
    setStartIndex((prev) =>
      Math.min(
        prev + roomsPerPage,
        roomTypes[currentRoomType].rooms.length - roomsPerPage
      )
    );
  };
const handleBooking = async (room: string, time: string) => {
  const confirmed = await ShowAlert({
    title: (
      <div className="flex justify-center mb-2">
        <Image
          src={commonIcons.questionMark}
          alt="question mark"
          width={40}
          height={40}
        />
      </div>
    ),
    description: (
      <Text>
        Are you sure you want to book <strong>{room}</strong> at{" "}
        <strong>{time}</strong>?
      </Text>
    ),
    confirmText: "Yes",
    cancelText: "No",
    isDangerous: false,
  });

  if (confirmed) {
    console.log(`Booking confirmed for ${room} at ${time}`);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <MyBreadcrumb
        items={breadcrumbItems}
        title="Personal Carrel Time Selection"
        showBackButton={true}
      />

      {/* Day Selection */}
      <div className="p-4">
        <div className="flex gap-4">
          {weekDays.map((item) => (
            <div key={item.date} className="flex flex-col items-center">
              <div className="text-sm text-gray-600 mb-1">{item.day}</div>
              <button
                onClick={() => setSelectedDay(item.date)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-md font-semibold transition-colors ${
                  selectedDay === item.date
                    ? "bg-slate-800 text-white"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                }`}
              >
                {item.date}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Room Type Selector */}
      <div className="p-2">
        <div className="p-3 flex items-center justify-between border-t">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevRoomSet}
            disabled={startIndex === 0}
            className="bg-gray-300 hover:bg-gray-400 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Text className="text-lg font-bold text-gray-900">
            {roomTypes[currentRoomType].name}
          </Text>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextRoomSet}
            disabled={
              startIndex + roomsPerPage >=
              roomTypes[currentRoomType].rooms.length
            }
            className="bg-gray-300 hover:bg-gray-400 rounded-md disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Time Slots Table Header */}
        <div className="mt-1 bg-white rounded-sm overflow-hidden">
          <div
            className={`grid gap-3 p-1 ${
              currentRooms.length === 1
                ? "grid-cols-[120px_1fr]"
                : currentRooms.length === 2
                ? "grid-cols-3"
                : "grid-cols-4"
            }`}
          >
            {/* Header - Time */}
            <div className="bg-gray-50 border border-primary-300 rounded-lg flex items-center justify-center">
              <Text className="text-sm font-semibold text-gray-900 p-3">
                Time
              </Text>
            </div>

            {/* Header - Room Names */}
            {currentRooms.map((room, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-primary-300 rounded-lg flex items-center justify-center"
              >
                <Text className="text-[12px] font-semibold text-gray-900 p-2 text-center">
                  {room}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slot Rows */}
        <div className=" max-h-[55vh] overflow-y-auto pb-10">
        {timeSlots.map((time, idx) => (
          <div key={idx} className="bg-white rounded-lg overflow-hidden">
            <div
              className={`grid gap-1 p-1 ${
                currentRooms.length === 1
                  ? "grid-cols-[120px_1fr]"
                  : currentRooms.length === 2
                  ? "grid-cols-3"
                  : "grid-cols-4"
              }`}
            >
              {/* Time Column */}
              <div className="border-gray-300 rounded-lg flex items-center justify-center">
                <Text className="text-[13px] font-semibold text-gray-900">
                  {time}
                </Text>
              </div>

              {/* Room Columns */}
              {currentRooms.map((room, roomIdx) => (
                <button
                  key={roomIdx}
                  onClick={() => handleBooking(room, time)}
                  className="bg-blue-100 rounded-sm p-2 flex items-center justify-center transition-colors w-full hover:bg-blue-200"
                >
                  <Text className="text-[13px] font-semibold text-gray-900">
                    Available
                  </Text>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default CarrelTimeSelection;
