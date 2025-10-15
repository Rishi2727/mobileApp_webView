import { useIsMobile } from "@/hooks/use-mobile";
import { Image } from "../ui/custom/image";
import { commonIcons } from "@/assets";
import { LanguageToggle } from "@/features/language-toggle/languageToggle";
import { useLanguage } from "@/contexts/useLanguage";
import { useNavigate } from "react-router";

export function Navbar() {
  const isMobile = useIsMobile();
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();
  const handleLanguageToggle = (newLanguage: string) => {
    console.log("Language changed to:", newLanguage);
    setLanguage(newLanguage);
  };
  const handleHomeClick = () => {
    navigate("/"); 
  };
  const handleBellClick = () => {
    navigate("/messages"); 
  };
  return (
    <>
      {/* Top Navigation Bar */}
      <div className="relative flex justify-between items-center px-4 py-3 bg-border-accent h-[8vh]">
        {/* Logo Section */}
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
          <LanguageToggle onToggle={handleLanguageToggle} />
          <div onClick={handleHomeClick}>
            <Image
              src={commonIcons.homeIcon}
              alt="Home"
              width={isMobile ? 20 : 24}
              height={isMobile ? 20 : 24}
              className="text-background cursor-pointer"
            />
          </div>
          <div onClick={handleBellClick}>
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
    </>
  );
}
