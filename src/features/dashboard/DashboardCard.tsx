import { Card } from "@/components/ui/card";
import Text from "@/components/ui/custom/text";
import { Link } from "react-router";

type DashboardCardProps = {
  title: string;
  image?: string;
  path: string;
};

const DashboardCard = ({
  title,
  path,
  image,
}: Readonly<DashboardCardProps>) => {
  return (
    <Card className="w-full">
      <Link to={path}>
        <div className="flex flex-col items-center justify-center gap-4">
          {image && <img src={image} alt={title} className="w-8 h-8" />}
          <Text variant="subtitle">{title}</Text>
        </div>
      </Link>
    </Card>
  );
};

export default DashboardCard;
