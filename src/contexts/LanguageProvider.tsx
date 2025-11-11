import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';
import {
  LanguageContext,
  LANGUAGE_STORAGE_KEY,
  AvailableAppLanguages
} from './LanguageContext';

const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return AvailableAppLanguages.some(lang => lang.code === browserLang)
    ? browserLang
    : 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguageState] = useState<string>(i18n.language);
  const [isRTL, setIsRTL] = useState<boolean>(i18n.dir() === 'rtl');

  const setLanguage = async (lang: string) => {
    window.ReactNativeWebView?.postMessage(JSON.stringify({ cmd: "setLanguage", value : lang }));
    try {
      await i18n.changeLanguage(lang);
      setLanguageState(lang);
      setIsRTL(i18n.dir() === 'rtl');
      moment.locale(lang);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.warn('Error setting language:', error);
    }
  };

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage) {
          await setLanguage(savedLanguage);
        } else {
          const browserLang = getBrowserLanguage();
          await setLanguage(browserLang);
        }
      } catch (error) {
        console.warn('Error loading language:', error);
      }
    };

    loadLanguage();
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        languages: AvailableAppLanguages
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
