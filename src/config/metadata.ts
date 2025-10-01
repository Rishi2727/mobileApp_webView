import type { IconName } from "@/components/ui/custom/icon";

export const metadata: Record<string, { title: string; icon: IconName; path: string }> = {
    dashboard: {
        title: "Dashboard",
        icon: "LayoutDashboard",
        path: "/dashboard"
    },
    profile: {
        title: "My Profile",
        icon: "User",
        path: "/profile"
    },
    booking: {
        title: "My Bookings",
        icon: "Book",
        path: "/bookings"
    },
    notice: {
        title: "Notices",
        icon: "Megaphone",
        path: "/notices"
    },
    seatBooking: {
        title: "Seat Booking",
        icon: "Armchair",
        path: "/seat-booking"
    },
    groupBooking: {
        title: "Group Bookings",
        icon: "Group",
        path: "/group-bookings"
    },
    carrelBooking: {
        title: "Carrel Booking",
        icon: "Sofa",
        path: "/carrel-booking"
    },
    message: {
        title: "Messages",
        icon: "Mail",
        path: "/messages"
    },
    bookSearch: {
        title: "Book Search",
        icon: "FileSearch2",
        path: "/book-search"
    },
    bookPurchase: {
        title: "Book Purchase",
        icon: "BookUp",
        path: "/book-purchase"
    },
    loanHistory: {
        title: "Loan History",
        icon: "History",
        path: "/loan-history"
    },
    eBook: {
        title: "E-Books",
        icon: "NotepadTextDashed",
        path: "/e-books"
    },
    setting: {
        title: "Settings",
        icon: "Settings",
        path: "/settings"
    },
    login: {
        title: "Login",
        icon: "KeyRound",
        path: "/login"
    },
}