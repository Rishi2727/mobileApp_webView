import { useIsMobile } from "@/hooks/use-mobile";
import { Image } from "../ui/custom/image";
import { commonIcons } from "@/assets";
import { useLanguage } from "@/contexts/useLanguage";

export function Navbar() {
  const isMobile = useIsMobile();
  const { language } = useLanguage(); 
  // console.log("first", language)

  return (
    <>
      {/* Top Navigation Bar */}
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
          <div className="flex items-center space-x-4 pointer-events-auto">
           <Image
            src={
              language === "ko"
                ? commonIcons.languageIconKo
                : commonIcons.languageIconEn
            }
            alt="language"
            width={isMobile ? 20 : 24}
            height={isMobile ? 20 : 24}
            className="text-background "
          />
            <Image
              src={commonIcons.homeIcon}
              alt="home"
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background"
            />
            <Image
              src={commonIcons.bellIcon}
              alt="notification"
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background"
            />
          </div>
    </>
  );
}
