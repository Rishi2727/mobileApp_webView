// api/client.ts
import axios, { type AxiosRequestConfig } from "axios";
import qs from 'qs';

// Web equivalents for React Native constants
export const AvailableAppLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  // Add other languages as needed
];
export const LANGUAGE_STORAGE_KEY = 'app_language';

// Import the auth store to access token
let getAuthToken: (() => string | null) | null = null;
let clearAuthOnUnauthorized: (() => void) | null = null;

// Function to set the auth store reference (called from AuthStore)
export const setAuthStoreReference = (
  getToken: () => string | null,
  clearAuth: () => void
) => {
  getAuthToken = getToken;
  clearAuthOnUnauthorized = clearAuth;
};

export const baseUrl = "http" + (import.meta.env.VITE_API_IS_SECURE === "true" ? "s" : "") + "://" + import.meta.env.VITE_API_DOMAIN;

export const getDeviceUUID = () => {
  let deviceUUID = localStorage.getItem('deviceUUID');
  if (!deviceUUID) {
    deviceUUID = crypto.randomUUID();
    localStorage.setItem('deviceUUID', deviceUUID);
  }
  return deviceUUID;
};
const getLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    } else {
      // If no saved language, use browser locale
      const deviceLang = navigator.language.split('-')[0] || 'en';
      if (AvailableAppLanguages.some(lang => lang.code === deviceLang)) {
        return deviceLang;
      }
    }
  } catch (error) {
    console.warn('Error getting language:', error);
  }

  // Default to English if device language is not supported
  return 'en';
};

export const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 1000 * 120,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': 'en-US',
    'x-api-key': import.meta.env.VITE_API_X_API_KEY,
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // Get the current language from localStorage
    const language = getLanguage();
    config.headers['Accept-Language'] = language;

    const deviceUUID = getDeviceUUID();
    if (deviceUUID) {
      config.headers['traceId'] = deviceUUID;
    }

    // Get token from AuthStore instead of localStorage
    const token = getAuthToken ? getAuthToken() : null;
    if (token && token !== 'null' && token !== '') {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

apiClient.defaults.paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'repeat' }); // or 'brackets', 'comma', 'indices', etc.


export async function request<TResponse, TPayload = any>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig,
  noError?: boolean
): Promise<TResponse | null> {
  // Simple translation fallback function
  const t = (key: string, fallback?: string) => {
    // Return fallback text or key as is
    return fallback || key;
  };

  try {
    const res = await apiClient.request<TResponse>({
      method,
      url,
      // ...(payload && { data: payload }),
      // ...(method === 'get' ? { params: payload } : { data: payload }),
      ...(payload && method !== 'get' && { data: payload }),
      ...(payload && { params: payload }),
      ...config,
    });
    return res.data;
  } catch (err: any) {
    // Detect network error vs server error
    let msg = '';
    if (err.response) {

      if ((err.response.status === 401 || err.response.status === 403) && err.config?.url !== '/api/v1/mobile/auth/login') {
        // Use AuthStore to clear authentication instead of localStorage
        if (clearAuthOnUnauthorized) {
          clearAuthOnUnauthorized();
        } else {
          // Fallback if auth store not available
          setTimeout(() => {
            window.location.href = '/Login';
          }, 100);
        }
        return null;
      }

      // Use server message or translated fallback
      msg = err.response.data?.msg || t('errors.general', 'Uh oh, an error occurred. Please try again later.');

      if (noError) return err.response.data;

    } else if (err.request) {
      // Request was made but no response received (network error)
      console.warn('Network error:', err.request);
      msg = t('errors.network', 'Network error: Unable to reach the server. Please check your connection.');
    } else {
      // Something else happened
      msg = err.message || t('errors.unexpected', 'An unexpected error occurred.');
    }

    return Promise.reject(new Error(msg));
  }
}