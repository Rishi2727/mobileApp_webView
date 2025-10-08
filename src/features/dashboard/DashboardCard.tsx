import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/custom/image";
import Text from "@/components/ui/custom/text";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

type DashboardCardProps = {
  title: string;
  image?: string;
  path: string;
  borderColor?: string;
  iconFillColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  width?: number;
  height?: number;
};

const DashboardCard = ({
  title,
  path,
  image,
  iconFillColor,
  backgroundColor,
  borderRadius,
  padding,
  width,
  height,
}: Readonly<DashboardCardProps>) => {
  return (
    <Card className="w-full">
      <Link to={path}>
        <div className="flex flex-col items-center justify-center gap-4">
          {image && (
            <Image
              src={image}
              alt={title}
              width={width || 50}
              height={height || 50}
               className={cn(`text-${iconFillColor}`, `bg-${backgroundColor}`, `rounded-${borderRadius}`, `p-${padding}`)}
            />
          )}
          <Text variant="subtitle">{title}</Text>
        </div>
      </Link>
    </Card>
  );
};

export default DashboardCard;
