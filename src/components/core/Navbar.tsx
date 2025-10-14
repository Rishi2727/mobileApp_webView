import { useIsMobile } from "@/hooks/use-mobile";
import { Image } from "../ui/custom/image";
import { commonIcons } from "@/assets";
import { LanguageToggle } from "@/features/language-toggle/languageToggle";
import { useLanguage } from "@/contexts/useLanguage";

export function Navbar() {
  const isMobile = useIsMobile();
  const {  setLanguage } = useLanguage();
  const handleLanguageToggle = (newLanguage: string) => {
    console.log('Language changed to:', newLanguage);
    setLanguage(newLanguage);
    // Add your language change logic here
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
          <LanguageToggle
            onToggle={handleLanguageToggle}
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
      </>
  );
}
