import type { ReactNode } from "react";
import GlobalLoader from "../core/GlobalLoader";
import { Toaster } from "../ui/sonner";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageProvider";
import { GlobalAlertDialog } from "../ui/custom/AlertDialog";
import moment from "moment";

// @ts-ignore
import "moment/dist/locale/ko";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  moment.tz.setDefault("Asia/Seoul");


  return (
    <ThemeProvider>
      <LanguageProvider>
        <GlobalLoader />
        <GlobalAlertDialog />
        {children}
        <Toaster richColors closeButton />
      </LanguageProvider>
    </ThemeProvider>
  );
}
