import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Text from "@/components/ui/custom/text";
import { useNavigate } from "react-router";

const CarrelBooking = () => {
  const breadcrumbItems = metadata.carrelBooking.breadcrumbItems || [];
  const navigate = useNavigate();

  const rooms = [
    {
      floor: "2F",
      title: "Personal Carrel Room ",
      numbers: ["01 | 02 | 03"],
      accessible: true,
    },
  ];

  return (
    <div className="min-h-screen bg-primary-50">
      <MyBreadcrumb
        items={breadcrumbItems}
        title="Personal Carrel"
        showBackButton={true}
      />

      <div className="mt-4 space-y-3 px-4">
        {rooms.map((room, index) => (
          <Card
            key={index}
            className="flex  p-3 rounded-md bg-white"
            onClick={() => navigate("/carrel-time-selection")}
          >
            <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Badge className="bg-orange-100 text-gray-800 font-bold px-4 py-3 text-sm">
                {room.floor}
              </Badge>
              <div>
                <Text variant="h3">
                  {room.title}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {room.numbers.join(" | ")}
                </Text>
              </div>
            </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CarrelBooking;
