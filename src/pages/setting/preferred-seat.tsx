import { commonIcons } from "@/assets";
import { Card, CardContent } from "@/components/ui/card";
import { Image } from "@/components/ui/custom/image";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { Armchair, Trash2 } from "lucide-react";
import { useState } from "react";
import { ShowAlert } from "@/components/ui/custom/my-alert";
import Text from "@/components/ui/custom/text";

export default function PreferredSeat() {
  const breadcrumbItems = metadata.PreferredSeatSetting.breadcrumbItems || [];

  const [seats, setSeats] = useState([
    { id: 1, floor: "3F", desk: 6, lounge: "Lounge'80", available: true },
    { id: 2, floor: "3F", desk: 7, lounge: "Lounge'80", available: true },
    {
      id: 3,
      floor: "3F",
      desk: 7,
      lounge: "Lighthouse Lounge",
      available: true,
    },
    {
      id: 4,
      floor: "3F",
      desk: 1,
      lounge: "Lighthouse Lounge",
      available: true,
    },
  ]);

  const handleDelete = async (id: number) => {
    const seat = seats.find((s) => s.id === id);
    if (!seat) return;

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
          Are you sure you want to delete <strong>{seat.lounge}</strong> (Desk{" "}
          {seat.desk}) from your preferred seats?
        </Text>
      ),
      confirmText: "OK",
      cancelText: "No",
      isDangerous: false,
    });

    if (confirmed) {
      setSeats((prev) => prev.filter((s) => s.id !== id));
    }
  };
  return (
    <div className="min-h-[90vh] bg-secondary">
      <MyBreadcrumb
        items={breadcrumbItems}
        title="Settings"
        showBackButton={true}
      />

      <div className="p-4 flex justify-between items-center">
        <div>
          <Text variant="h4">My Favourite Seats</Text>
          <Text variant="h6"> Quick access to your preferred seats</Text>
        </div>
        <div className="border border-border-accent bg-primary-200 rounded-xl w-12 h-8 flex justify-center items-center">
          4/4
        </div>
      </div>
      {/* Seats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 p-4">
        {seats.map((seat) => (
          <Card key={seat.id} className="relative overflow-hidden">
            {/* Delete Button */}
            <button
              onClick={() => handleDelete(seat.id)}
              className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-full p-2 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <CardContent className="pt-0 pb-5">
              {/* Seat Icon */}
              <div className="flex justify-center">
                <div className="bg-background rounded-lg p-2">
                  <Image
                    src={commonIcons.seatTableIcon}
                    alt="seat"
                    width={38}
                    height={38}
                  />
                </div>
              </div>

              {/* Seat Info */}
              <div className="text-center">
                <Text variant="h6">
                  {seat.floor} | Desk: {seat.desk}
                </Text>
                <Text variant="h3">{seat.lounge}</Text>
              </div>
            </CardContent>

            {/* Bottom Border for Availability */}
            <div
              className={`absolute bottom-0 left-0 w-full text-center py-1 font-semibold text-sm ${
                seat.available
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {seat.available ? "Available" : "Closed"}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {seats.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Armchair className="w-8 h-8 text-gray-400" />
          </div>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            No favorite seats
          </Text>
          <Text variant="h6">Add seats to your favorites for quick access</Text>
        </div>
      )}
    </div>
  );
}
