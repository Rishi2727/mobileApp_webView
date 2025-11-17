import type { BookingHistoryByUser, CatWiseRooms, DeskBookedList, ExternalUserGetByTempTokenModel, ExternalUserGetOTPModel, ExternalUserVerifyOTPModel, NotificationsByUser, RoomWiseDesksPayload, SeatBookingRequest, SigninRequestMobile } from './RequestModels';
import type { ApiResponse, ApiResponseList, ApiResponsePageable, AppConfig, CategoryWiseAvailabilityRoom, ExternalUserOTPResponse, ExternalUserQRResponse, ExternalUserVerifyOTPResponse, LatestAppVersion, MyBookingModel, OpenWeatherResponse, PushNotification, RoomCategoryConfig, RoomWiseDesk, ServerTimeResponse, SliderImages, UserDemography, UserProfile, UserQrCode } from './ResponseModels';
import { request } from './client';
import { endpoints } from './endpoints';

export async function getServerTime() {
  return request<ApiResponse<ServerTimeResponse>>('get', endpoints.main.serverTime);
}

export async function signin(payload: SigninRequestMobile) {
  return request<ApiResponse<string>>('post', endpoints.auth.login, payload);
}

export async function getAppConfig() {
  return request<ApiResponse<AppConfig>>('get', endpoints.config.appConfigs);
}

export async function getMyProfile() {
  return request<ApiResponse<UserProfile>>('get', endpoints.auth.profile);
}
export async function getMyQrCode() {
  return request<ApiResponse<UserQrCode>>('get', endpoints.auth.qrCode);
}
export async function getMyNotifications(payload: NotificationsByUser | null) {
  return request<ApiResponsePageable<PushNotification>>('post', endpoints.auth.notifications.get, payload);
}

export async function getMyBookings(payload: BookingHistoryByUser | null) {
  return request<ApiResponsePageable<MyBookingModel>>('get', endpoints.booking.history, payload);
}


export async function createBooking(payload: SeatBookingRequest) {
  return request<ApiResponse<MyBookingModel>>('post', endpoints.booking.new, payload);
}

export async function confirmBooking(id: string) {
  return request<ApiResponse<MyBookingModel>>('post', endpoints.booking.confirm(id));
}

export async function changeBooking(id: string, payload: SeatBookingRequest) {
  return request<ApiResponse<MyBookingModel>>('post', endpoints.booking.change(id), payload);
}

export async function extendBooking(id: string) {
  return request<ApiResponse<MyBookingModel>>('post', endpoints.booking.extend(id));
}

export async function returnBooking(id: string) {
  return request<ApiResponse<MyBookingModel>>('post', endpoints.booking.return(id));
}

export async function getUserDemography(userId: string) {
  return request<ApiResponse<UserDemography>>('post', endpoints.booking.demography(userId), undefined, undefined, true);
}



export async function getRoomWiseDesks(payload?: RoomWiseDesksPayload) {
  return request<ApiResponseList<RoomWiseDesk>>('post', endpoints.availability.roomWiseDesks, payload);
}

export async function getDesksBooked(payload?: DeskBookedList) {
  return request<ApiResponseList<number>>('post', endpoints.availability.desksBooked, payload);
}

export async function getCategoryWiseDesks(catCodes: string, payload?: CatWiseRooms) {
  return request<ApiResponseList<CategoryWiseAvailabilityRoom>>('post', endpoints.availability.categoryWise(catCodes), payload);
}

export async function getAvailabilityCategories() {
  return request<ApiResponseList<RoomCategoryConfig>>('post', endpoints.availability.categories);
}



export async function getWeatherInfo() {
  return request<ApiResponse<OpenWeatherResponse>>('get', endpoints.thirdParty.weather);
}

// External User API Functions
export async function submitExternalUserDetails(payload: ExternalUserGetOTPModel) {
  return request<ApiResponse<ExternalUserOTPResponse>>('post', endpoints.externalUser.submitDetails, payload);
}

export async function externalUserServiceStatus() {
  return request<ApiResponse<boolean>>('get', endpoints.externalUser.serviceStatus);
}

export async function submitExternalUserOTP(payload: ExternalUserVerifyOTPModel) {
  return request<ApiResponse<ExternalUserVerifyOTPResponse>>('post', endpoints.externalUser.submitOtp, payload);
}

export async function getQRByTempToken(payload: ExternalUserGetByTempTokenModel) {
  return request<ApiResponse<ExternalUserQRResponse>>('post', endpoints.externalUser.qrByTempToken, payload);
}


export async function getLatestVersionDetails(platform: 'A' | 'I', appVersion: string | undefined, runtimeVersion: string | undefined) {
  return request<ApiResponse<LatestAppVersion>>('get', endpoints.appRelease.latest(platform, appVersion, runtimeVersion));
}

export async function getAllMobileSliders() {
  return request<ApiResponseList<SliderImages>>('get', endpoints.mobileSlider.getAll);
}

export async function getMobileSliderIds() {
  return request<ApiResponseList<number>>('get', endpoints.mobileSlider.getIds);
}