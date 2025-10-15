import { useIsMobile } from "@/hooks/use-mobile";
import { commonIcons } from "@/assets";
import { LanguageToggle } from "@/features/language-toggle/languageToggle";
import { useLanguage } from "@/contexts/useLanguage";
import { useNavigate } from "react-router";
import { HomeIcon } from "lucide-react";

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
          <commonIcons.BrandLogo
            width={isMobile ? 170 : 300}
            height={isMobile ? 40 : 60}
            className="text-background"
          />
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <LanguageToggle
            onToggle={handleLanguageToggle}
          />
          <HomeIcon
            onClick={() => navigate("/")}
            width={isMobile ? 20 : 24}
            height={isMobile ? 20 : 24}
            className="text-background"
          />
          <commonIcons.BellIcon
            onClick={() => navigate("/messages")}
            width={isMobile ? 20 : 24}
            height={isMobile ? 20 : 24}
            className="text-background"
          />
        </div>
      </div>
    </>
  );
}
