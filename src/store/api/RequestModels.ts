
export const SeatBookingRequestTypeEnumConst = {
    Seat: 'SEAT',
    Room: 'ROOM'
} as const;

export type SeatBookingRequestTypeEnum = typeof SeatBookingRequestTypeEnumConst[keyof typeof SeatBookingRequestTypeEnumConst];


export const SigninRequestMobilePlatformTypeEnumConst = {
    A: 'A',
    I: 'I'
} as const;

export type SigninRequestMobilePlatformTypeEnum = typeof SigninRequestMobilePlatformTypeEnumConst[keyof typeof SigninRequestMobilePlatformTypeEnumConst];

export interface Pageable {
    'page'?: number;
    'size'?: number;
    'sort'?: string[];
}

export interface BookingHistoryByUser extends Pageable {
    'startDate'?: string;
    'endDate'?: string;
    'reservationStatusCode'?: number[];
    'roomCatCodes'?: number[];
}

export interface NotificationsByUser extends Pageable {
    'pushMethod'?: 'ALL_USERS' | 'IDENTITY_WISE' | 'USER_SPECIFIC';
    'classificationCode'?: number[];
}

export interface ExternalUserGetOTPModel {
    'name': string;
    'phoneNumber': string;
    'method' ?: 'OTP' | 'LINK'
}

export interface ExternalUserVerifyOTPModel {
    'encOtpTxnData': string;
    'otp': string;
}
export interface ExternalUserGetByTempTokenModel {
    'encUserToken': string;
}

export interface SeatBookingRequest {
    'reserveDeskCode': number;
    'type': SeatBookingRequestTypeEnum;
    'members'?: { [key: string]: string; };
    'timeMinutesOrDays'?: number;
    'bookingStartFrom'?: string;
    'bookingStartFromNow'?: boolean;
}

export interface SigninRequestMobile {
    'userId': string;
    'password': string;
    'platformType'?: SigninRequestMobilePlatformTypeEnum;
    'pushTokenDevice'?: string;
    'pushTokenExpo'?: string;
    'deviceUniqueId'?: string;
}

export interface RoomWiseDesksPayload {
    roomCode: number[];
    mode: 'STRICT' | 'CHART';
    days?: number;
    dateStart?: string;
    dateEnd?: string;
    date?: string;
}

export interface CatWiseRooms {
    includeAvailability: boolean;
    date?: string;
}

export interface DeskBookedList {
    deskCodes: string[];
    bookingType: 'SEAT' | 'ROOM';
}