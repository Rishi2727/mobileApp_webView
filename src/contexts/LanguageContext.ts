import { createContext } from 'react';

export type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
  isRTL: boolean;
  languages: { code: string; name: string }[];
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: string) => key,
  isRTL: false,
  languages: [
    { code: 'en', name: 'English' },
    { code: 'ko', name: 'Korean' }
  ]
});

export const LANGUAGE_STORAGE_KEY = 'app_language';

export const AvailableAppLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: 'Korean' }
];
