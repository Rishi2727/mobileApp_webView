import React from "react";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/custom/image";
import Text from "@/components/ui/custom/text";
import { useLanguage } from "@/contexts/useLanguage";
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { useAuthStore } from "@/store/AuthStore";

type DashboardCardProps = {
  title: string;
  image?: string | React.ComponentType<any>;
  path: string;
  queryParams?: string;
  borderColor?: string;
  iconFillColor?: string;
  backgroundColor?: string;
  breadcrumbTitle?: string;
  borderRadius?: number;
  padding?: number;
  width?: number;
  height?: number;
  isExternal?: boolean;
  requiresSecret?: boolean;
  externalUrl?: (secret?: string) => string;
};

const DashboardCard = ({
  title,
  path,
  queryParams,
  image,
  iconFillColor,
  backgroundColor,
  borderRadius,
  padding,
  width,
  height,
  isExternal,
  requiresSecret,
  externalUrl,
}: Readonly<DashboardCardProps>) => {
  const { t } = useLanguage();
  const { kmouSecretGenerate } = useAuthStore();
  
  const handleClick = async () => {
    if (isExternal && externalUrl) {
      // Get the secret from auth store if required
      const secret = requiresSecret ? await kmouSecretGenerate() : undefined;
      const url = externalUrl(secret);
      
      // Open external link in the same window (for mobile web view)
      window.location.href = url;
    }
  };



  const renderImage = () => {
    if (!image) return null;
    
    if (typeof image === 'string') {
      return (
        <Image
          src={image}
          alt={title}
          width={width || 38}
          height={height || 38}
          className={cn(`text-${iconFillColor}`, `bg-${backgroundColor}`, `rounded-${borderRadius}`, `p-${padding}`,)}
        />
      );
    } else {
      // If image is a React component, render it directly
      const ImageComponent = image;
      return (
        <div className={cn(`text-${iconFillColor}`, `bg-${backgroundColor}`, `rounded-${borderRadius}`, `p-${padding}`,)}>
          <ImageComponent 
            width={width || 38}
            height={height || 38}
          />
        </div>
      );
    }
  };

  const cardContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {renderImage()}
      <Text variant="subtitle">{t(title)}</Text>
    </div>
  );

  return (
    <Card className="w-full transition-transform duration-300 hover:rotate-3 shadow-lg border">
      {isExternal ? (
        <button 
          onClick={handleClick} 
          className="w-full cursor-pointer bg-transparent border-none p-0 m-0"
          type="button"
          aria-label={`Open ${t(title)} in external link`}
        >
          {cardContent}
        </button>
      ) : (
        <Link to={queryParams ? `${path}${queryParams}` : path}>
          {cardContent}
        </Link>
      )}
    </Card>
  );
};

export default DashboardCard;
