import { metadata } from "./metadata";
export type DashboardTypeProps = {
    title: string;
    path: string;
    queryParams?: string;
    image?: string | React.ComponentType<any>;
    animetedImage?: string | React.ComponentType<any>;
    isVisible?: boolean;
    borderAnimation?: boolean;
    borderColor?: string;
    iconFillColor?: string;
    iconStrokeColor?: string;
    backgroundColor?: string;
    borderRadius?: number;
    padding?: number;
    width?: number;
    height?: number;
    isExternal?: boolean;
    requiresSecret?: boolean;
    externalUrl?: (secret?: string) => string;
};
export const dashboard: DashboardTypeProps[] = [
    {
        title: metadata.profile.title,
        image: metadata.profile.image,
        path: metadata.profile.path,
        animetedImage: metadata.profile.animetedImage,
        isVisible: metadata.profile.isVisible,
        borderAnimation: metadata.profile.borderAnimation,
        borderColor: metadata.profile.borderColor,
        iconFillColor: metadata.profile.iconFillColor,
        iconStrokeColor: metadata.profile.iconStrokeColor,
        backgroundColor: metadata.profile.backgroundColor,
        borderRadius: metadata.profile.borderRadius,
        padding: metadata.profile.padding,
        width: metadata.profile.width,
        height: metadata.profile.height

    },
    {
        title: metadata.booking.title,
        image: metadata.booking.image,
        path: metadata.booking.path,
        animetedImage: metadata.profile.animetedImage,
        isVisible: metadata.profile.isVisible,
        borderAnimation: metadata.profile.borderAnimation,
        borderColor: metadata.profile.borderColor,
        iconFillColor: metadata.profile.iconFillColor,
        iconStrokeColor: metadata.profile.iconStrokeColor,
        backgroundColor: metadata.profile.backgroundColor,
        borderRadius: metadata.profile.borderRadius,
        padding: metadata.profile.padding,
        width: metadata.profile.width,
        height: metadata.profile.height
    },
    {
        title: metadata.notice.title,
        image: metadata.notice.image,
        path: metadata.notice.path,
        animetedImage: metadata.profile.animetedImage,
        isVisible: metadata.profile.isVisible,
        borderAnimation: metadata.profile.borderAnimation,
        borderColor: metadata.profile.borderColor,
        iconFillColor: metadata.profile.iconFillColor,
        iconStrokeColor: metadata.profile.iconStrokeColor,
        backgroundColor: metadata.profile.backgroundColor,
        borderRadius: metadata.profile.borderRadius,
        padding: metadata.profile.padding,
        width: metadata.profile.width,
        height: metadata.profile.height
    },
    {
        title: metadata.seatBooking.title,
        image: metadata.seatBooking.image,
        path: metadata.seatBooking.path,
        queryParams: metadata.seatBooking.queryParams,
        animetedImage: metadata.profile.animetedImage,
        isVisible: metadata.profile.isVisible,
        borderAnimation: metadata.profile.borderAnimation,
        borderColor: metadata.profile.borderColor,
        iconFillColor: metadata.profile.iconFillColor,
        iconStrokeColor: metadata.profile.iconStrokeColor,
        backgroundColor: metadata.profile.backgroundColor,
        borderRadius: metadata.profile.borderRadius,
        padding: metadata.profile.padding,
        width: metadata.profile.width,
        height: metadata.profile.height
    },
    {
        title: metadata.groupBooking.title,
        image: metadata.groupBooking.image,
        path: metadata.groupBooking.path,
        queryParams: metadata.groupBooking.queryParams,
        animetedImage: metadata.profile.animetedImage,
        isVisible: metadata.profile.isVisible,
        borderAnimation: metadata.profile.borderAnimation,
        borderColor: metadata.profile.borderColor,
        iconFillColor: metadata.profile.iconFillColor,
        iconStrokeColor: metadata.profile.iconStrokeColor,
        backgroundColor: metadata.profile.backgroundColor,
        borderRadius: metadata.profile.borderRadius,
        padding: metadata.profile.padding,
        width: metadata.profile.width,
        height: metadata.profile.height
    },
    {
        title: metadata.carrelBooking.title,
        image: metadata.carrelBooking.image,
        path: metadata.carrelBooking.path,
        queryParams: metadata.carrelBooking.queryParams,
        animetedImage: metadata.profile.animetedImage,
        isVisible: metadata.profile.isVisible,
        borderAnimation: metadata.profile.borderAnimation,
        borderColor: metadata.profile.borderColor,
        iconFillColor: metadata.profile.iconFillColor,
        iconStrokeColor: metadata.profile.iconStrokeColor,
        backgroundColor: metadata.profile.backgroundColor,
        borderRadius: metadata.profile.borderRadius,
        padding: metadata.profile.padding,
        width: metadata.profile.width,
        height: metadata.profile.height
    },
    {
        title: metadata.message.title,
        image: metadata.message.image,
        path: metadata.message.path,
        animetedImage: metadata.profile.animetedImage,
        isVisible: metadata.profile.isVisible,
        borderAnimation: metadata.profile.borderAnimation,
        borderColor: metadata.profile.borderColor,
        iconFillColor: metadata.profile.iconFillColor,
        iconStrokeColor: metadata.profile.iconStrokeColor,
        backgroundColor: metadata.profile.backgroundColor,
        borderRadius: metadata.profile.borderRadius,
        padding: metadata.profile.padding,
        width: metadata.profile.width,
        height: metadata.profile.height
    },
    {
        title: metadata.bookSearch.title,
        image: metadata.bookSearch.image,
        path: metadata.bookSearch.path,
        animetedImage: metadata.bookSearch.animetedImage,
        isVisible: metadata.bookSearch.isVisible,
        borderAnimation: metadata.bookSearch.borderAnimation,
        borderColor: metadata.bookSearch.borderColor,
        iconFillColor: metadata.bookSearch.iconFillColor,
        iconStrokeColor: metadata.bookSearch.iconStrokeColor,
        backgroundColor: metadata.bookSearch.backgroundColor,
        borderRadius: metadata.bookSearch.borderRadius,
        padding: metadata.bookSearch.padding,
        width: metadata.bookSearch.width,
        height: metadata.bookSearch.height,
        isExternal: metadata.bookSearch.isExternal,
        requiresSecret: metadata.bookSearch.requiresSecret,
        externalUrl: metadata.bookSearch.externalUrl
    },
    {
        title: metadata.bookPurchase.title,
        image: metadata.bookPurchase.image,
        path: metadata.bookPurchase.path,
        animetedImage: metadata.bookPurchase.animetedImage,
        isVisible: metadata.bookPurchase.isVisible,
        borderAnimation: metadata.bookPurchase.borderAnimation,
        borderColor: metadata.bookPurchase.borderColor,
        iconFillColor: metadata.bookPurchase.iconFillColor,
        iconStrokeColor: metadata.bookPurchase.iconStrokeColor,
        backgroundColor: metadata.bookPurchase.backgroundColor,
        borderRadius: metadata.bookPurchase.borderRadius,
        padding: metadata.bookPurchase.padding,
        width: metadata.bookPurchase.width,
        height: metadata.bookPurchase.height,
        isExternal: metadata.bookPurchase.isExternal,
        requiresSecret: metadata.bookPurchase.requiresSecret,
        externalUrl: metadata.bookPurchase.externalUrl
    },
    {
        title: metadata.loanHistory.title,
        image: metadata.loanHistory.image,
        path: metadata.loanHistory.path,
        animetedImage: metadata.loanHistory.animetedImage,
        isVisible: metadata.loanHistory.isVisible,
        borderAnimation: metadata.loanHistory.borderAnimation,
        borderColor: metadata.loanHistory.borderColor,
        iconFillColor: metadata.loanHistory.iconFillColor,
        iconStrokeColor: metadata.loanHistory.iconStrokeColor,
        backgroundColor: metadata.loanHistory.backgroundColor,
        borderRadius: metadata.loanHistory.borderRadius,
        padding: metadata.loanHistory.padding,
        width: metadata.loanHistory.width,
        height: metadata.loanHistory.height,
        isExternal: metadata.loanHistory.isExternal,
        requiresSecret: metadata.loanHistory.requiresSecret,
        externalUrl: metadata.loanHistory.externalUrl
    },
    {
        title: metadata.eBook.title,
        image: metadata.eBook.image,
        path: metadata.eBook.path,
        animetedImage: metadata.eBook.animetedImage,
        isVisible: metadata.eBook.isVisible,
        borderAnimation: metadata.eBook.borderAnimation,
        borderColor: metadata.eBook.borderColor,
        iconFillColor: metadata.eBook.iconFillColor,
        iconStrokeColor: metadata.eBook.iconStrokeColor,
        backgroundColor: metadata.eBook.backgroundColor,
        borderRadius: metadata.eBook.borderRadius,
        padding: metadata.eBook.padding,
        width: metadata.eBook.width,
        height: metadata.eBook.height,
        isExternal: metadata.eBook.isExternal,
        requiresSecret: metadata.eBook.requiresSecret,
        externalUrl: metadata.eBook.externalUrl
    },
    {
        title: metadata.setting.title,
        image: metadata.setting.image,
        path: metadata.setting.path,
        animetedImage: metadata.profile.animetedImage,
        isVisible: metadata.profile.isVisible,
        borderAnimation: metadata.profile.borderAnimation,
        borderColor: metadata.profile.borderColor,
        iconFillColor: metadata.profile.iconFillColor,
        iconStrokeColor: metadata.profile.iconStrokeColor,
        backgroundColor: metadata.profile.backgroundColor,
        borderRadius: metadata.profile.borderRadius,
        padding: metadata.profile.padding,
        width: metadata.profile.width,
        height: metadata.profile.height
    }


]
