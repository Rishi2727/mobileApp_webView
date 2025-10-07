import { metadata } from "./metadata";

export const dashboard: Array<{ title: string; image?: string; path: string }> = [
    {
        title: metadata.profile.title,
        image: metadata.profile.image,
        path: metadata.profile.path
    },
    {
        title: metadata.booking.title,
        image: metadata.booking.image,
        path: metadata.booking.path
    },
    {
        title: metadata.notice.title,
        image: metadata.notice.image,
        path: metadata.notice.path
    },
    {
        title: metadata.seatBooking.title,
        image: metadata.seatBooking.image,
        path: metadata.seatBooking.path
    },
    {
        title: metadata.groupBooking.title,
        image: metadata.groupBooking.image,
        path: metadata.groupBooking.path
    },
    {
        title: metadata.carrelBooking.title,
        image: metadata.carrelBooking.image,
        path: metadata.carrelBooking.path
    },
    {
        title: metadata.message.title,
        image: metadata.message.image,
        path: metadata.message.path
    },
    {
        title: metadata.bookSearch.title,
        image: metadata.bookSearch.image,
        path: metadata.bookSearch.path
    },
    {
        title: metadata.bookPurchase.title,
        image: metadata.bookPurchase.image,
        path: metadata.bookPurchase.path
    },
    {
        title: metadata.loanHistory.title,
        image: metadata.loanHistory.image,
        path: metadata.loanHistory.path
    },
    {
        title: metadata.eBook.title,
        image: metadata.eBook.image,
        path: metadata.eBook.path
    },
    {
        title: metadata.setting.title,
        image: metadata.setting.image,
        path: metadata.setting.path
    }
]