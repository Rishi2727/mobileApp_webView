import { commonIcons } from "@/assets";
import { Image } from "../ui/custom/image";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashbaordNavbar() {
  const isMobile = useIsMobile();

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* Main Container */}
      <div className="relative">
        {isMobile ? (
          <div className="absolute inset-0 ">
            <Image
              src={commonIcons.dashboardBg}
              alt="dashboard background"
              objectFit="cover"
              width={400}
              height={700}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-500"></div>
        )}

        {/* Top Navigation Bar */}
        <div className="relative flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <Image
              src={commonIcons.brandLogo}
              alt="university Logo"
              width={isMobile ? 170 : 300}
              height={isMobile ? 40 : 60}
              className="text-background"
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <Image
              src={commonIcons.languageIconEn}
              alt="language"
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background"
            />
            <Image
              src={commonIcons.homeIcon}
              alt="language"
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background"
            />
            <Image
              src={commonIcons.bellIcon}
              alt="language"
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background"
            />
          </div>
        </div>
      </div>

      {/* Welcome Banner with Background Image */}
      <div className="relative px-4 py-6">
        <div className="flex justify-center items-center">
          <Image
            src={commonIcons.bannarImage}
            alt="banner"
            objectFit="fill"
            width={isMobile ? 400 : 700}
            height={isMobile ? 200 : 300}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
