import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import Text from "@/components/ui/custom/text";
import { metadata } from "@/config/metadata";

const SeatBookingPage = () => {
    const breadcrumbItems = metadata.seatBookingPage.breadcrumbItems || [];
  return (
    <div>
          <MyBreadcrumb
        items={breadcrumbItems}
        title="General/PC Seat"
        showBackButton={true}
      />
      <div>
        <Text className="font-bold text-muted-foreground m-3">Lighthouse Lounge</Text>
      </div>
    </div>
  )
}

export default SeatBookingPage;