
import type { ReactNode } from "react"
import GlobalLoader from "../core/GlobalLoader"
import { Toaster } from "../ui/sonner"
import { ThemeProvider } from "next-themes"

interface RootLayoutProps {
    children: ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
    return (
        <ThemeProvider>
            <GlobalLoader />
            {children}
            <Toaster richColors closeButton />
        </ThemeProvider>
    )
}
