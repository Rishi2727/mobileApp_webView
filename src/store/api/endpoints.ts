const basePath = '/api/v1/mobile';

export const endpoints = {
  main: {
    serverTime: `${basePath}/serverTime`,
  },
  auth: {
    login: `${basePath}/auth/login`,
    profile: `${basePath}/users/myProfile`,
    qrCode: `${basePath}/users/generateQrCode`,
    notifications: {
      get: `${basePath}/users/MyNotifications`,
      markReceived: (id: number) => `${basePath}/users/notification/${id}/received`,
      markRead: (id: number) => `${basePath}/users/notification/${id}/read`,
    },
  },
  booking: {
    new: `${basePath}/bookings/new`,
    confirm: (id: string) => `${basePath}/bookings/${id}/confirm`,
    change: (id: string) => `${basePath}/bookings/${id}/change`,
    extend: (id: string) => `${basePath}/bookings/${id}/extend`,
    return: (id: string) => `${basePath}/bookings/${id}/return`,
    demography: (userId: string) => `${basePath}/bookings/userDemoGraphy/${userId}`,
    history: `${basePath}/bookings/history`,
  },
  availability: {
    roomWiseDesks: `${basePath}/availability/roomWise/desks`,
    desksBooked: `${basePath}/availability/desks/booked`,
    categoryWise: (catCodes: string) => `${basePath}/availability/categoryWise/${catCodes}`,
    categories: `${basePath}/availability/categories`,
  },
  externalUser: {
    serviceStatus: `${basePath}/external/serviceStatus`,
    submitOtp: `${basePath}/external/submitOtp`,
    submitDetails: `${basePath}/external/submitDetails`,
    qrByTempToken: `${basePath}/external/QrByTempToken`,
  },
  thirdParty: {
    call: (apiName: string) => `${basePath}/thirdParty/apiCaller/${apiName}`,
    weather: `${basePath}/thirdParty/weather`,
  },
  config: {
    appConfigs: `${basePath}/app_config/configs`,
  },
  store: {
    getImage: `${basePath}/store/**`,
  },
  appRelease: {
    latest: (platform: 'A' | 'I', appVersion: string | undefined, runtimeVersion: string | undefined) => `${basePath}/app_release/latest?platform=${platform}&versionName=${appVersion}&versionCode=${runtimeVersion}`,
  },
};