
import type { ReactNode } from "react"
import GlobalLoader from "../core/GlobalLoader"
import { Toaster } from "../ui/sonner"

interface RootLayoutProps {
    children: ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
    return (
        <>
            <GlobalLoader />
            {children}
            <Toaster richColors closeButton />
        </>
    )
}
