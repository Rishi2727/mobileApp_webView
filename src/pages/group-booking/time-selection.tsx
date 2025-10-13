import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { metadata } from "@/config/metadata";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import Text from "@/components/ui/custom/text";
import { useNavigate } from "react-router";

const TimeSelection = () => {
  const breadcrumbItems = metadata.timeSelection.breadcrumbItems || [];
  const navigate = useNavigate();
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
      name: "Group Study Room for 8 People",
      rooms: [
        "Study Room 301",
        "Study Room 302",
        "Study Room 303",
        "Study Room 304",
        "Study Room 305",
        "Study Room 306",
      ],
    },
  ];

  const timeSlots = ["2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:00 PM", "4:00 PM", "4:00 PM","4:00 PM", "4:00 PM", "4:00 PM", "4:00 PM","4:00 PM"];

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

  return (
    <div className="min-h-[70vh] bg-gray-50">
      <MyBreadcrumb
        items={breadcrumbItems}
        title="Bookings"
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
                <span className="text-[13px] font-semibold text-gray-900">
                  {time}
                </span>
              </div>

              {/* Room Columns */}
              {currentRooms.map((_, roomIdx) => (
                <button
                  key={roomIdx}
                  onClick={() => navigate("/reservation")}
                  className="bg-blue-100 rounded-sm p-2 flex items-center justify-center transition-colors w-full hover:bg-blue-200"
                >
                  <span className="text-[13px] font-semibold text-gray-900">
                    Available
                  </span>
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

export default TimeSelection;
