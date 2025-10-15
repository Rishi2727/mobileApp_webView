import { commonIcons } from "@/assets"
import { Image } from "@/components/ui/custom/image"
import { useLanguage } from "@/contexts/useLanguage";
import { LanguageToggle } from "@/features/language-toggle/languageToggle";
import { LoginForm } from "@/features/login/LoginForm"
import { useTranslation } from "react-i18next";

export default function Page() {
  const { setLanguage } = useLanguage();
  const { t } = useTranslation();
  const handleLanguageToggle = (newLanguage: string) => {
    console.log("Language changed to:", newLanguage);
    setLanguage(newLanguage);
  };
  return (
    <div className="relative min-h-svh w-full flex items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden ">

      {/* Background image positioned at bottom */}
      <div className="absolute top-[50%] z-0 w-[130%] opacity-10">
        <Image
          src={commonIcons.loginBgIcon}
          alt="login background"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Login form on top */}
      <div className="absolute top-0 right-0 p-10">
        <LanguageToggle onToggle={handleLanguageToggle} fillColor="text-black" />
      </div>
      <div className="relative z-10 w-full max-w-md shadow-4xl">
        <div className="flex justify-center items-center">
          <commonIcons.BrandLogo className="mb-10" />
        </div>
        <LoginForm t={t} />
      </div>
    </div>
  )
}
