import type { IconName } from "@/components/ui/custom/icon";
import { metadata } from "./metadata";

export const dashboard: Array<{ title: string; icon: IconName; path: string }> = [
    {
        title: metadata.profile.title,
        icon: metadata.profile.icon,
        path: metadata.profile.path
    },
    {
        title: metadata.booking.title,
        icon: metadata.booking.icon,
        path: metadata.booking.path
    },
    {
        title: metadata.notice.title,
        icon: metadata.notice.icon,
        path: metadata.notice.path
    },
    {
        title: metadata.seatBooking.title,
        icon: metadata.seatBooking.icon,
        path: metadata.seatBooking.path
    },
    {
        title: metadata.groupBooking.title,
        icon: metadata.groupBooking.icon,
        path: metadata.groupBooking.path
    },
    {
        title: metadata.carrelBooking.title,
        icon: metadata.carrelBooking.icon,
        path: metadata.carrelBooking.path
    },
    {
        title: metadata.message.title,
        icon: metadata.message.icon,
        path: metadata.message.path
    },
    {
        title: metadata.bookSearch.title,
        icon: metadata.bookSearch.icon,
        path: metadata.bookSearch.path
    },
    {
        title: metadata.bookPurchase.title,
        icon: metadata.bookPurchase.icon,
        path: metadata.bookPurchase.path
    },
    {
        title: metadata.loanHistory.title,
        icon: metadata.loanHistory.icon,
        path: metadata.loanHistory.path
    },
    {
        title: metadata.eBook.title,
        icon: metadata.eBook.icon,
        path: metadata.eBook.path
    },
    {
        title: metadata.setting.title,
        icon: metadata.setting.icon,
        path: metadata.setting.path
    }
]