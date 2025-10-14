import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import moment from 'moment-timezone';

import {
  submitExternalUserDetails,
  submitExternalUserOTP,
  getQRByTempToken,
  externalUserServiceStatus
} from './api';
import type {
  ExternalUserGetOTPModel,
  ExternalUserVerifyOTPModel,
  ExternalUserGetByTempTokenModel
} from './api/RequestModels';

export interface ExternalUserState {
  // User information
  userName: string | null;
  userPhone: string | null;

  // Authentication tokens
  encUserToken: string | null;
  encOtpTxnData: string | null;

  // OTP expiry
  otpExpireAt: string | null;

  // QR code data
  encQrData: string | null;
  qrTimeRange: string | null; // This can be used to store the time range for QR code validity
  qrGeneratedAt: string | null;
  qrExpireAt: string | null;

  // Token expiry
  tokenExpireAt: string | null;

  // Loading states
  isSubmittingDetails: boolean;
  isSubmittingOTP: boolean;
  isGeneratingQR: boolean;
}

export interface ExternalUserActions {
  // Computed properties
  isAuthenticated: () => boolean;
  isQrCodeGenerated: () => boolean;
  isTokenExpired: () => boolean;
  isOtpExpired: () => boolean;

  // API Methods
  checkServiceStatus: () => Promise<boolean>;
  submitDetails: (payload: ExternalUserGetOTPModel) => Promise<void>;
  submitOTP: (payload: ExternalUserVerifyOTPModel) => Promise<void>;
  generateQRByToken: () => Promise<void>;

  // Utility methods
  clearAllData: () => void;
}

type ExternalUserStore = ExternalUserState & ExternalUserActions;

export const useExternalUserStore = create<ExternalUserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      userName: null,
      userPhone: null,
      encUserToken: null,
      encOtpTxnData: null,
      otpExpireAt: null,
      encQrData: null,
      qrTimeRange: null,
      qrGeneratedAt: null,
      qrExpireAt: null,
      tokenExpireAt: null,
      isSubmittingDetails: false,
      isSubmittingOTP: false,
      isGeneratingQR: false,

      // Computed properties
      isAuthenticated: () => {
        const state = get();
        return !!(state.encUserToken && state.userName && !state.isTokenExpired());
      },

      isQrCodeGenerated: () => {
        const state = get();
        if (!state.encQrData || !state.qrGeneratedAt || !state.qrExpireAt) return false;
        // Check if the QR code is still valid
        if (moment().isAfter(moment(state.qrExpireAt))) { return false; }

        return true;
      },

      isTokenExpired: () => {
        const state = get();
        if (!state.tokenExpireAt) return true;
        return moment().isAfter(moment(state.tokenExpireAt));
      },

      isOtpExpired: () => {
        const state = get();
        if (!state.otpExpireAt) return false;
        return moment().isAfter(moment(state.otpExpireAt));
      },

      // API Methods
      checkServiceStatus: async () => {
        const response = await externalUserServiceStatus();
        return !!(response && response.success && response.data);
      },
      submitDetails: async (payload: ExternalUserGetOTPModel) => {
        set({ isSubmittingDetails: true });

        try {
          const response = await submitExternalUserDetails(payload);

          if (response && response.success && response.data) {
            // Calculate OTP expiry time (typically 5-10 minutes from now)
            const otpExpiryTime = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');
            if (response.data.encOtpTxnData) {
              set({
                encOtpTxnData: response.data.encOtpTxnData,
                otpExpireAt: response.data.ExpireAt || otpExpiryTime, // Use API response or fallback
                userName: payload.name,
                userPhone: payload.phoneNumber,
                isSubmittingDetails: false,
              });
            } else if (response.data.encQrData) {
              if (payload.method === "LINK") {
                set({ isSubmittingDetails: false });
              }

              set({
                encQrData: response.data.encQrData,
                qrTimeRange: response.data.qrTimeRange,
                userPhone: response.data.userPhone,
                userName: response.data.userName,
                qrGeneratedAt: response.data.GeneratedAt,
                qrExpireAt: moment(response.data.ExpireAt).add(-10, 'seconds').format('YYYY-MM-DD HH:mm:ss'),
                isSubmittingDetails: false,
              });
            }


          } else {
            set({ isSubmittingDetails: false });
            throw new Error(response?.msg || 'Failed to submit details');
          }
        } catch (error) {
          set({ isSubmittingDetails: false });
          throw error;
        }
      },

      submitOTP: async (payload: ExternalUserVerifyOTPModel) => {
        set({ isSubmittingOTP: true });

        try {
          const response = await submitExternalUserOTP(payload);

          if (response && response.success && response.data) {
            if (import.meta.env.DEV) console.log("QR Time Range:", response.data.qrTimeRange);
            set({
              encUserToken: response.data.encUserToken,
              encQrData: response.data.encQrData,
              qrTimeRange: response.data.qrTimeRange,
              userPhone: response.data.userPhone,
              userName: response.data.userName,
              tokenExpireAt: response.data.ExpireAt,
              qrGeneratedAt: response.data.GeneratedAt,
              qrExpireAt: moment(response.data.ExpireAt).add(-10, 'seconds').format('YYYY-MM-DD HH:mm:ss'),
              isSubmittingOTP: false,
            });
          } else {
            set({ isSubmittingOTP: false });
            throw new Error(response?.msg || 'Failed to verify OTP');
          }
        } catch (error) {
          set({ isSubmittingOTP: false });
          throw error;
        }
      },

      generateQRByToken: async () => {
        const state = get();
        if (!state.encUserToken) {
          throw new Error('No user token available');
        }

        set({ isGeneratingQR: true });

        try {
          const payload: ExternalUserGetByTempTokenModel = {
            encUserToken: state.encUserToken
          };

          const response = await getQRByTempToken(payload);

          if (response && response.success && response.data) {
            set({
              encQrData: response.data.encQrData,
              qrGeneratedAt: response.data.GeneratedAt,
              qrTimeRange: response.data.qrTimeRange,
              qrExpireAt: moment(response.data.ExpireAt).add(-10, 'seconds').format('YYYY-MM-DD HH:mm:ss'),
              userPhone: response.data.userPhone,
              userName: response.data.userName,
              isGeneratingQR: false,
            });
          } else {
            set({ isGeneratingQR: false });
            throw new Error(response?.msg || 'Failed to generate QR code');
          }
        } catch (error) {
          set({ isGeneratingQR: false });
          throw error;
        }
      },

      // Utility methods
      clearAllData: () => {
        set({
          userName: null,
          userPhone: null,
          encUserToken: null,
          encOtpTxnData: null,
          otpExpireAt: null,
          encQrData: null,
          qrTimeRange: null,
          qrGeneratedAt: null,
          qrExpireAt: null,
          tokenExpireAt: null,
        });

        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      },
    }),
    {
      name: 'external-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userName: state.userName,
        userPhone: state.userPhone,
        encUserToken: state.encUserToken,
        encOtpTxnData: state.encOtpTxnData,
        otpExpireAt: state.otpExpireAt,
        encQrData: state.encQrData,
        qrTimeRange: state.qrTimeRange,
        qrGeneratedAt: state.qrGeneratedAt,
        qrExpireAt: state.qrExpireAt,
        tokenExpireAt: state.tokenExpireAt,
      }),
    }
  )
);

export default useExternalUserStore;
