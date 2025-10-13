import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image } from "@/components/ui/custom/image";
import { commonIcons } from "@/assets";
import Text from "@/components/ui/custom/text";
import { useNavigate } from "react-router";

const GroupBooking = () => {
  const breadcrumbItems = metadata.groupBooking.breadcrumbItems || [];
  const navigate = useNavigate();

  const rooms = [
    {
      floor: "2F",
      title: "Group Study Room for 8 People",
      numbers: ["201"],
      accessible: true,
    },
    {
      floor: "2F",
      title: "Group Study Room for 6 People",
      numbers: ["202", "203", "204", "207"],
    },
    {
      floor: "2F",
      title: "Group Study Room for 12 People",
      numbers: ["205", "206"],
    },
  ];

  return (
    <div className="min-h-screen bg-primary-50">
      <MyBreadcrumb
        items={breadcrumbItems}
        title="Group Study"
        showBackButton={true}
      />

      <div className="mt-4 space-y-3 px-4">
        {rooms.map((room, index) => (
          <Card
            key={index}
            className="flex  p-3 rounded-md bg-white"
            onClick={() => navigate("/time-selection")}
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
            <div>
              {room.accessible && (
                <Image
                  src={commonIcons.handiCaped}
                  alt="handicaped"
                  width={18}
                  height={18}
                />
              )}
            </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupBooking;
