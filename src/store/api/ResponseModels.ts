export interface ApiResponseModel {
    'success'?: boolean;
    'code'?: number;
    'msg'?: string;
}

export interface ApiResponse<T = any> extends ApiResponseModel {
    'data'?: T;
}

// Union type aliases
export type RoomDepartmentState = 'NOT_IN_USE' | 'SELECTED_ALLOWED' | 'SELECTED_BLOCKED';
export type SeatState = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
export type BookingStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ApiResponseList<T = any> extends ApiResponseModel {
    'data'?: T[];
}

export interface ApiResponsePageable<T = any> extends ApiResponseModel {
    'data'?: {
        'content': T[];
        'page': {
            'size': number;
            'number': number;
            'totalElements': number;
            'totalPages': number;
        };
    };
}

// -------------------------------------------------------------

export interface ServerTimeResponse {
    currentTime: string;
    timezone: string;
}
export interface UserProfile {
    isExternal: boolean;
    userSeq: number;
    userId: string;
    userName: string;
    userSchoolNo: string;
    userBarcode: string;
    userDeptCode: string;
    userDeptName: string;
    userPosCode: string;
    userPosName: string;
    userStatusCode: string;
    userStatusName: string;
    userMobile: string | null;
    userPhone: string | null;
    userAddress: string | null;
    userPassChangeDttime: string;
    authToken: string | null;
    univAltId: string;
    inOutStatus: boolean;
    isActive: boolean;
    isWebAdmin: boolean;
    webAdminRole: string;
}

export interface UserQrCode {
    QrData: string;
    GeneratedAt: string;
    ExpireAt: string;
}

// -------------------------------------------------------------
// MyBookingModel

export interface MyBookingMember {
    createdAt: string;
    updatedAt: string;
    bookingId: string;
    userId: string;
    userName: string;
    schoolNo: string;
    reservationStatusCode: number;
    confirmationDtTime: string;
    returnDtTime: string | null;
}

export interface MyBookingModel {
    bookingId: string;
    bookingType: 'SEAT' | 'ROOM';
    seatChangeCount: number;
    seatChangeDttime: string | null;
    extensionCount: number;
    extensionDttime: string | null;
    managerAction: number | null;
    managerBookingId: string | null;
    reservationDtime: string;
    reservationMode: string;
    reservationFrom: string;
    reservationTill: string;
    reservationConfirmed: string | null;
    reservationFinished: string | null;
    reservationUsedPercent: number | null;
    reserveDeskCode: number;
    reserveDeskNo: string;
    deskPassword: string | null;
    multiUserBooking: boolean;
    userId: string;
    userName: string;
    userSchoolNo: string;
    userDeptCode: string;
    userPosCode: string;
    userStatusCode: string;
    reservationStatusCode: number;
    reservationStatusName:
    | 'BOOKED_USER_WAIT_APPROVAL'
    | 'BOOKED_USER_WAIT_CONFIRMATION'
    | 'CANCELLED_USER'
    | 'CANCELLED_MANAGER'
    | 'CANCELLED_SYSTEM'
    | 'IN_USE_AUTO'
    | 'IN_USE_MANAGER'
    | 'IN_USE_APPROVED'
    | 'IN_USE_CONFIRMED'
    | 'RETURNED_USER'
    | 'RETURNED_SYSTEM'
    | 'RETURNED_MANAGER';
    actualStatus: 'BOOKED' | 'CANCELLED' | 'IN_USE' | 'RETURNED';
    floorCode: number;
    floorNumber: number;
    floorName: string;
    roomCode: number;
    roomName: string;
    roomNumber: string;
    zoneCode: number | null;
    libCode: number;
    libName: string;
    roomcatCode: number;
    roomcatName: string;
    roomMinUsers: number | null;
    roomMaxUsers: number | null;
    roomExtensionLimit: number;
    roomConfirmationWaitingTime: number;
    roomAutoCancellationWaitingTime: number;
    mobileTicketLinkage: boolean;
    issueAfterCheckin: boolean;
    passingThroughWaitingTime: number;
    automaticTerminationLeaveRoom: boolean;
    automaticTerminationLeaveRoomWaitingTime: number;
    configSeatchange: string;
    buttonSeatchange: boolean;
    buttonExtension: boolean;
    buttonConfirmation: boolean;
    buttonReturn: boolean;
    buttonCancellation: boolean;
    webBooking: boolean;
    isNonReturnCorrected: boolean;
    members: MyBookingMember[] | null;
}


export interface UserDemography {
    userId: string;
    userName: string;
    userDeptCode: string;
    userDeptName: string;
    userPosCode: string;
    userPosName: string;
    userStatusCode: string;
    userStatusName: string;
}


export interface AppConfig {
    ALLOW_MOBILE_RETURN: "true" | "false";
    ALLOW_MOBILE_CANCELLATION: "true" | "false";
    ALLOW_MOBILE_EXTENSION: "true" | "false";
    ALLOW_MOBILE_CONFIRMATION: "true" | "false";
    ALLOW_MOBILE_SEAT_CHANGE: "true" | "false";
}


// Category Wise Availability
export interface CategoryWiseAvailabilityRoom {
    date: string;
    roomCode: number;
    roomCapacity: number;
    roomCoords: string;
    roomMap: string;
    roomNavigationMap: string;
    roomName: string;
    roomNumber: string;
    roomSeatsStart: number;
    roomSeatsEnd: number;
    roomMaxUsers: number | null;
    roomMinUsers: number | null;
    roomcatCode: number;
    roomcatName: string;
    roomWiseBooking: boolean;
    scheduleSpecific: boolean;
    featureDayWiseBooking: boolean;
    featureTimePicker: boolean;
    featureFutureBooking: boolean;
    featureMultiUserBooking: boolean;
    featureBookingExtension: boolean;
    featureSeatChange: boolean;
    catDailyLimitDayWise: boolean;
    catDailyLimitValue: number;
    deskDailyLimitDayWise: boolean;
    deskDailyLimitValue: number;
    scheduleTypeCode: number;
    libCode: number;
    libName: string;
    floorCode: number;
    floorColor: string;
    floorMap: string;
    floorName: string;
    floorNumber: number;
    zoneCode: number;
    zoneCoords: string;
    zoneMap: string;
    zoneName: string;
    roomDepartmentState: RoomDepartmentState;
    roomDepartmentMapped: string | null;
    roomAllowSeatChange: boolean;
    roomExtensionAvailableTime: number;
    roomExtensionLimit: number;
    roomExtensionTime: number;
    roomFixedSeatsNumbers: string;
    futureDaysAvailable: number;
    roomMaxUsetime: number;
    roomPositionState: RoomDepartmentState;
    roomPositionMapped: string | null;
    roomAutoCancellationWaitingTime: number;
    roomConfirmationWaitingTime: number;
    roomNeedConfirmation: boolean;
    roomUseUsetimeAsExtension: boolean;
    issueAfterCheckin: boolean;
    mobileTicketInterlocking: boolean;
    accessInterlockingStartTime: string;
    accessInterlockingEndTime: string;
    passingThroughWaitingTime: number;
    automaticTerminationLeaveRoom: boolean;
    automaticTerminationLeaveRoomWaitingTime: number;
    mobileTicketLinkage: boolean;
    roomStatusState: RoomDepartmentState;
    roomStatusMapped: string | null;
    roomOpenTime: string;
    roomCloseTime: string;
    isTodayOperation: number;
    selectedTime: string;
    isDayOff: number;
    isHoliday: number;
    isWeekOff: number;
    totalSeatsFixed: number | null;
    roomSeatsCount: number | null;
    roomSeatsBooked: number | null;
}


export interface RoomCategoryConfig {
    createdAt: string;
    updatedAt: string;
    roomCatCode: number;
    roomCatName: string;
    roomWiseBooking: boolean;
    scheduleSpecific: boolean;
    dayWiseBooking: boolean;
    timePicker: boolean;
    futureBooking: boolean;
    multiUserBooking: boolean;
    bookingExtension: boolean;
    seatChange: boolean;
    catDailyLimitDayWise: boolean;
    catDailyLimitValue: number;
    deskDailyLimitDayWise: boolean;
    deskDailyLimitValue: number;
    active: boolean;
}


export interface RoomWiseDesk {
    deskCode: number;
    date: string;
    deskType: 'SEAT' | 'ROOM';
    roomCode: number;
    deskNo: string;
    deskCoords: string;
    deskName: string;
    isDeskFixed: boolean;
    isDeskBooked: boolean;
    deskBookingChart: string | null;
}


export interface PushNotification {
    pushId: number;
    pushClassificationCode: number;
    pushTitle: string;
    pushTitleEn: string;
    pushMessage: string;
    pushMessageEn: string;
    pushSendMethod: 'ALL_USERS' | 'IDENTITY_WISE' | 'USER_SPECIFIC';
    pushScheduleDateTime: string;
    sendDateTime: string | null;
    deliveryDateTime: string | null;
    readDateTime: string | null;
    variable1: string;
    variable2: string;
}

export interface OpenWeatherResponse {
    coord: {
        lon: number;
        lat: number;
    };
    weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
    }[];
    base: string;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
        sea_level?: number;
        grnd_level?: number;
    };
    visibility: number;
    wind: {
        speed: number;
        deg: number;
        gust?: number;
    };
    clouds: {
        all: number;
    };
    rain?: any;
    snow?: any;
    dt: number;
    sys: {
        type?: number;
        id?: number;
        country: string;
        sunrise: number;
        sunset: number;
    };
    timezone: number;
    id: number;
    name: string;
    cod: number;
}

// External User Models
export interface ExternalUserOTPResponse {
    encOtpTxnData: string;
    GeneratedAt: string;
    ExpireAt: string;

    encQrData: string;
    qrTimeRange: string | null; // Optional field for storing QR code time range
    userName: string;
    userPhone: string;
}

export interface ExternalUserVerifyOTPResponse {
    GeneratedAt: string;
    userPhone: string;
    encUserToken: string;
    ExpireAt: string;
    encQrData: string;
    qrTimeRange: string | null; // Optional field for storing QR code time range
    userName: string;
}

export interface ExternalUserQRResponse {
    GeneratedAt: string;
    userPhone: string;
    ExpireAt: string;
    encQrData: string;
    qrTimeRange: string | null; // Optional field for storing QR code time range
    userName: string;
}

export interface LatestAppVersion {
    versionCode: number;
    versionName: string;
    platform: string;
}
export interface SliderImages {
    createdAt: string;
    updatedAt: string;
    seq: number;
    description: string;
    fileimage: string;
    active: boolean;
}