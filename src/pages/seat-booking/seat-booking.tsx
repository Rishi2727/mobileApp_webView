import { commonIcons } from "@/assets";
import { Button } from "@/components/ui/button";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import Text from "@/components/ui/custom/text";
import { metadata } from "@/config/metadata";
import { useNavigate } from "react-router";


const SeatBooking = () => {
  const navigate = useNavigate();
  const breadcrumbItems = metadata.seatBooking.breadcrumbItems || [];

  const favoriteSeats = [
    { id: "6", name: "Lounge'80", type: "lounge" },
    { id: "7", name: "Lounge'80", type: "lounge" },
    { id: "7", name: "Lighthouse Lounge", type: "lighthouse" },
    { id: "1", name: "Room 1", type: "other" },
  ];

  const seats = [
    {
      id: 24,
      name: "Lighthouse Lounge",
      time: "9:00 AM - 12:00 AM",
      floor: "3F",
      available: true,
    },
    {
      id: 8,
      name: "Lighthouse Lounge(Wall)",
      floor: "3F",
      available: false,
    },
    {
      id: 12,
      name: "Lounge'80",
      floor: "3F",
      available: false,
    },
    {
      id: 16,
      name: "Media Lounge Laptop Access",
      floor: "3F",
      available: false,
    },
    {
      id: 6,
      name: "Media Lounge PC Use Seats",
      floor: "3F",
      available: false,
    },
    {
      id: 3,
      name: "Media Lounge Media Zone",
      floor: "3F",
      available: false,
    },
    {
      id: 157,
      name: "Focused Reading Room",
      time: "9:00 AM - 12:00 AM",
      floor: "4F",
      available: true,
    },
    {
      id: 157,
      name: "Focused Reading Room",
      time: "9:00 AM - 12:00 AM",
      floor: "4F",
      available: true,
    },
    {
      id: 157,
      name: "Focused Reading Room",
      time: "9:00 AM - 12:00 AM",
      floor: "4F",
      available: true,
    },
    {
      id: 157,
      name: "Focused Reading Room",
      time: "9:00 AM - 12:00 AM",
      floor: "4F",
      available: true,
    },
  ];
  return (
    <div>
      <MyBreadcrumb
        items={breadcrumbItems}
        title="General/PC Seat"
        showBackButton={true}
      />
      <div className="p-4 bg-accent">
        {/* Favorite Seats */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-2">My Favorite Seats</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {favoriteSeats.map((seat, index) => (
              <Button
                key={index}
                className={`flex-shrink-0 px-2 py-1 rounded-md border-2 font-medium transition-colors ${
                  seat.type === "lighthouse"
                    ? "bg-border-accent text-background border-border-accent"
                    : "bg-background text-primary-300 border-border"
                }`}
              >
                <Text className="text-sm font-bold">{seat.id}</Text>
                <Text className="mx-2">|</Text>
                <Text className="text-sm">{seat.name}</Text>
              </Button>
            ))}
          </div>
        </div>

        {/* Seat List */}
        <div className="space-y-3 max-h-[570px] overflow-y-auto pb-4">
          {seats.map((seat) => (
            <div
              key={seat.id}
              onClick={() => navigate("/seat-booking-page")}
              className="bg-background rounded-2xl p-2 flex items-center gap-4"
            >
              {/* Seat Number Circle */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full border-4 border-border-accent flex flex-col items-center justify-center">
                <Text className="text-md font-bold text-border-accent">
                  {seat.id}
                </Text>
                <Text className="text-xs text-seat-fixed">{seat.id}</Text>
              </div>

              {/* Seat Info */}
              <div className="flex-1">
                <Text className="text-md font-semibold text-border-accent ">
                  {seat.name}
                </Text>
                {seat.available ? (
                  <Text variant="h6" className=" text-seat-fixed">{seat.time}</Text>
                ) : (
                  <Text className="text-sm text-seat-booked font-medium">
                    Room is closed now!
                  </Text>
                )}
              </div>

              {/* Floor Info */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1 pr-2">
                <Text className="text-md font-bold text-border-accent">
                  {seat.floor}
                </Text>
                <commonIcons.SeatTableIcon
                  width={20}
                  height={20}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SeatBooking;
