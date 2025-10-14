import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from './locales/en.json';
import ko from './locales/ko.json';

const resources = {
  en: {
    translation: en
  },
  ko: {
    translation: ko
  }
};

// Get browser language
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0]; // Gets 'en' from 'en-US'
  return browserLang === 'en' ? 'en' : 'ko';
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: getBrowserLanguage(), // Use browser locale by default
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;