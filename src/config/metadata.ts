import { commonIcons, dashboardIcons } from "@/assets";
import type { IconName } from "@/components/ui/custom/icon";

export const metadata: Record<string, { title: string; icon?: IconName; path: string; image?: string }> = {
    dashboard: {
        title: "Dashboard",
        icon: "LayoutDashboard",
        path: "/"
    },
    profile: {
        title: "My Profile",
        image: dashboardIcons.profileIcon,
        path: "/profile"
    },
    booking: {
        title: "My Bookings",
        image: dashboardIcons.bookIcon,
        path: "/bookings"
    },
    notice: {
        title: "Notices",
        image: dashboardIcons.messageIcon,
        path: "/notices"
    },
    seatBooking: {
        title: "Seat Booking",
        image: dashboardIcons.bookIcon,
        path: "/seat-booking"
    },
    groupBooking: {
        title: "Group Bookings",
        image: dashboardIcons.groupIcon,
        path: "/group-bookings"
    },
    carrelBooking: {
        title: "Carrel Booking",
        image: dashboardIcons.carrelIcon,
        path: "/carrel-booking"
    },
    message: {
        title: "Messages",
        image: commonIcons.bellIcon,
        path: "/messages"
    },
    bookSearch: {
        title: "Book Search",
        image: dashboardIcons.bookLoanIcon,
        path: "/book-search"
    },
    bookPurchase: {
        title: "Book Purchase",
        image: dashboardIcons.bookRequestIcon,
        path: "/book-purchase"
    },
    loanHistory: {
        title: "Loan History",
        image: dashboardIcons.loanHistoryIcon,
        path: "/loan-history"
    },
    eBook: {
        title: "E-Books",
        image: dashboardIcons.eBookIcon,
        path: "/e-books"
    },
    setting: {
        title: "Settings",
        image: dashboardIcons.settingIcon,
        path: "/settings"
    },
    login: {
        title: "Login",
        image: "KeyRound",
        path: "/login"
    },
}