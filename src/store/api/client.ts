import axios, { type AxiosRequestConfig } from "axios";
import { randomUUID } from "@/lib/crypto";
import { AvailableAppLanguages, LANGUAGE_STORAGE_KEY } from "@/contexts/LanguageContext";

let getAuthToken: (() => string | null) | null = null;
let clearAuthOnUnauthorized: (() => void) | null = null;
let navigateToLogin: (() => void) | null = null;

export const setAuthStoreReference = (
  getToken: () => string | null,
  clearAuth: () => void
) => {
  getAuthToken = getToken;
  clearAuthOnUnauthorized = clearAuth;
};

export const setNavigationReference = (navigate: () => void) => {
  navigateToLogin = navigate;
};

export const baseUrl = "http" + (import.meta.env.VITE_API_IS_SECURE === "true" ? "s" : "") + "://" + import.meta.env.VITE_API_DOMAIN;

export const getDeviceUUID = async () => {
  let deviceUUID = localStorage.getItem('deviceUUID');
  if (!deviceUUID) {
    deviceUUID = randomUUID();
    if (deviceUUID) localStorage.setItem('deviceUUID', deviceUUID);
  }
  return deviceUUID || null;
};

const getLanguage = async () => {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    } else {
      const browserLang = navigator.language.split('-')[0] || 'en';
      if (AvailableAppLanguages.some(lang => lang.code === browserLang)) {
        return browserLang;
      }
    }
  } catch (error) {
    console.warn('Error getting language:', error);
  }

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
    const language = await getLanguage();
    config.headers['Accept-Language'] = language;

    const deviceUUID = await getDeviceUUID();
    if (deviceUUID) {
      config.headers['traceId'] = deviceUUID;
    }

    const token = getAuthToken ? getAuthToken() : null;
    if (token && token !== 'null' && token !== '') {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(new Error(error.message || 'Request error'))
);

apiClient.defaults.paramsSerializer = (params) => {
  const searchParams = new URLSearchParams();
  for (const key in params) {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, String(v)));
    } else if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
};


// Translation helper - can be overridden by setting external reference
let getTranslation: ((key: string, options?: Record<string, unknown>) => string) | null = null;

export const setTranslationReference = (t: (key: string, options?: Record<string, unknown>) => string) => {
  getTranslation = t;
};

const translate = (key: string, fallback?: string) => {
  if (getTranslation) {
    return getTranslation(key, { defaultValue: fallback });
  }
  return fallback || key;
};

const handleUnauthorizedError = (status: number, url?: string): boolean => {
  const isUnauthorized = status === 401 || status === 403;
  const isNotLoginUrl = url !== '/api/v1/mobile/auth/login';
  
  if (isUnauthorized && isNotLoginUrl) {
    if (clearAuthOnUnauthorized) {
      clearAuthOnUnauthorized();
    } else if (navigateToLogin) {
      setTimeout(navigateToLogin, 100);
    }
    return true;
  }
  return false;
};

const getErrorMessage = (err: any): string => {
  if (err.response) {
    return err.response.data?.msg || translate('errors.general', 'An error occurred. Please try again later.');
  }
  
  if (err.request) {
    console.warn('Network error:', err.request);
    return translate('errors.network', 'Network error: Unable to reach the server. Please check your connection.');
  }
  
  return err.message || translate('errors.unexpected', 'An unexpected error occurred.');
};

export async function request<TResponse, TPayload = any>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig,
  noError?: boolean
): Promise<TResponse | null> {
  try {
    const res = await apiClient.request<TResponse>({
      method,
      url,
      ...(payload && method !== 'get' && { data: payload }),
      ...(payload && { params: payload }),
      ...config,
    });
    return res.data;
  } catch (err: any) {
    if (err.response) {
      const { status, config: reqConfig, data } = err.response;
      
      if (handleUnauthorizedError(status, reqConfig?.url)) {
        return null;
      }
      
      if (noError) return data;
    }

    const message = getErrorMessage(err);
    return Promise.reject(new Error(message));
  }
}