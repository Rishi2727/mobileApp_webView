import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import type { LanguageContextType } from './LanguageContext';

export const useLanguage = (): LanguageContextType => useContext(LanguageContext);
