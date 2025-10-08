import { metadata } from "./metadata";
export type DashboardTypeProps = {
    title: string;
    path: string;
    image?: string;
    animetedImage?: string;
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
        title: metadata.bookPurchase.title,
        image: metadata.bookPurchase.image,
        path: metadata.bookPurchase.path,
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
        title: metadata.loanHistory.title,
        image: metadata.loanHistory.image,
        path: metadata.loanHistory.path,
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
        title: metadata.eBook.title,
        image: metadata.eBook.image,
        path: metadata.eBook.path,
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