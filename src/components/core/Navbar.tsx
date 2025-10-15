import { useIsMobile } from "@/hooks/use-mobile";
import { Image } from "../ui/custom/image";
import { commonIcons } from "@/assets";
import BrandLogo from "@/assets/icons/brandLogo.svg?react";
import { LanguageToggle } from "@/features/language-toggle/languageToggle";
import { useLanguage } from "@/contexts/useLanguage";
import { useNavigate } from "react-router";

export function Navbar() {
  const isMobile = useIsMobile();
  const { setLanguage } = useLanguage();
  const handleLanguageToggle = (newLanguage: string) => {
    setLanguage(newLanguage);
  };
  const navigate = useNavigate();

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="relative flex justify-between items-center px-4 py-3 bg-border-accent h-[8vh]">
        {/* Logo Section */}
        <div className="flex items-center">
          <BrandLogo
            width={isMobile ? 170 : 300}
            height={isMobile ? 40 : 60}
            className="text-background"
          />
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <LanguageToggle
            onToggle={handleLanguageToggle}
            fillColor="background"
          />
          <Image
            src={commonIcons.homeIcon}
            onClick={() => navigate("/")}
            alt="Home"
            width={isMobile ? 20 : 24}
            height={isMobile ? 20 : 24}
            className="text-background"
          />
          <Image
            src={commonIcons.bellIcon}
            onClick={() => navigate("/messages")}
            alt="Notifications"
            width={isMobile ? 20 : 24}
            height={isMobile ? 20 : 24}
            className="text-background"
          />
        </div>
      </div>
    </>
  );
}
