import { commonIcons } from "@/assets";
import { Image } from "@/components/ui/custom/image";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
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
              <button
                key={index}
                className={`flex-shrink-0 px-2 py-1 rounded-md border-2 font-medium transition-colors ${
                  seat.type === "lighthouse"
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                <span className="text-sm font-bold">{seat.id}</span>
                <span className="mx-2">|</span>
                <span className="text-sm">{seat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Seat List */}
        <div className="space-y-3 max-h-[570px] overflow-y-auto pb-4">
          {seats.map((seat) => (
            <div
              key={seat.id}
              onClick={() => navigate("/seat-booking-page")}
              className="bg-white rounded-2xl p-2 flex items-center gap-4"
            >
              {/* Seat Number Circle */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center">
                <div className="text-md font-bold text-slate-800">
                  {seat.id}
                </div>
                <div className="text-xs text-gray-400">{seat.id}</div>
              </div>

              {/* Seat Info */}
              <div className="flex-1">
                <h3 className="text-md font-semibold text-slate-900 ">
                  {seat.name}
                </h3>
                {seat.available ? (
                  <p className="text-[12px] text-gray-500">{seat.time}</p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">
                    Room is closed now!
                  </p>
                )}
              </div>

              {/* Floor Info */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1 pr-2">
                <div className="text-md font-bold text-slate-800">
                  {seat.floor}
                </div>
                <Image
                  src={commonIcons.seatTableIcon}
                  alt="Seat Table"
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
