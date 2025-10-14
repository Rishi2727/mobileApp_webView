
import type { ReactNode } from "react"
import GlobalLoader from "../core/GlobalLoader"
import { Toaster } from "../ui/sonner"
import { ThemeProvider } from "next-themes"
import { LanguageProvider } from "@/contexts/LanguageProvider"
import { GlobalAlertDialog } from "../ui/custom/AlertDialog"

interface RootLayoutProps {
    children: ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <GlobalLoader />
                <GlobalAlertDialog />
                {children}
                <Toaster richColors closeButton />
            </LanguageProvider>
        </ThemeProvider>
    )
}
