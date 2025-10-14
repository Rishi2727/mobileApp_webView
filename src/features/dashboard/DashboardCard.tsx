import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/custom/image";
import Text from "@/components/ui/custom/text";
import { useLanguage } from "@/contexts/useLanguage";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

type DashboardCardProps = {
  title: string;
  image?: string;
  path: string;
  borderColor?: string;
  iconFillColor?: string;
  backgroundColor?: string;
  breadcrumbTitle?: string;
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
  const { t } = useLanguage();
  return (
    <Card className="w-full transition-transform duration-300 hover:rotate-3 shadow-lg border">
      <Link to={path}>
        <div className="flex flex-col items-center justify-center gap-4">
          {image && (
            <Image
              src={image}
              alt={title}
              width={width || 38}
              height={height || 38}
              className={cn(`text-${iconFillColor}`, `bg-${backgroundColor}`, `rounded-${borderRadius}`, `p-${padding}`,)}
            />
          )}
          <Text variant="subtitle">{t(title)}</Text>
        </div>
      </Link>
    </Card>
  );
};

export default DashboardCard;
