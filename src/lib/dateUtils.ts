import { useLanguage } from '@/contexts/useLanguage';
import moment from 'moment-timezone';


/**
 * Date format constants for consistent formatting across the app
 */
export const DATE_FORMATS = {
  SHORT_DATE: 'L',           // Short date format (e.g., MM/DD/YYYY or DD/MM/YYYY depending on locale)
  LONG_DATE: 'LL',           // Long date format (e.g., MMMM D, YYYY or D MMMM YYYY depending on locale)
  SHORT_TIME: 'LT',          // Short time format (e.g., HH:MM AM/PM)
  LONG_TIME: 'LTS',          // Long time format with seconds (e.g., HH:MM:SS AM/PM)
  SHORT_DATE_TIME: 'lll',    // Short date and time format
  LONG_DATE_TIME: 'LLLL',    // Long date and time format
  RELATIVE: 'relative',      // Special format for relative time (e.g., "2 hours ago", "in 3 days")
  CALENDAR: 'calendar'       // Calendar format (e.g., "Today at 2:30 PM", "Yesterday", "Next Monday")
};

/**
 * Default date format options by language
 */
const LANGUAGE_DATE_FORMATS = {
  en: {
    defaultDateFormat: 'MM/DD/YYYY',
    defaultTimeFormat: 'h:mm A'
  },
  ko: {
    defaultDateFormat: 'YYYY.MM.DD',
    defaultTimeFormat: 'HH:mm'
  }
};

/**
 * Format a date according to the current language and specified format
 * @param date - Date to format (Date object, ISO string, or timestamp)
 * @param format - Format to use (from DATE_FORMATS or custom Moment format string)
 * @param timezone - Optional timezone (defaults to the app's default timezone)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  format: string = DATE_FORMATS.SHORT_DATE,
  timezone?: string
) => {
  // Use the app's default timezone if not specified
  const tz = timezone || moment.tz.guess();
  
  // Create a moment object with the specified timezone
  const momentDate = moment(date).tz(tz);
  
  // Check if the date is valid
  if (!momentDate.isValid()) {
    console.warn('Invalid date provided to formatDate:', date);
    return '';
  }
  
  // Handle special format cases
  if (format === DATE_FORMATS.RELATIVE) {
    return momentDate.fromNow();
  }
  
  if (format === DATE_FORMATS.CALENDAR) {
    return momentDate.calendar();
  }
  
  // Use the specified format
  return momentDate.format(format);
};

/**
 * A React hook for formatting dates based on the current language setting
 * @returns Date formatting utilities bound to the current language
 */
export const useDateFormatter = () => {
  const { language } = useLanguage();
  
  // Get the format preferences for the current language
  const formatPreferences = LANGUAGE_DATE_FORMATS[language as keyof typeof LANGUAGE_DATE_FORMATS] || 
                            LANGUAGE_DATE_FORMATS.en;
  
  return {
    /**
     * Format a date according to the current language
     */
    formatDate: (date: Date | string | number, format?: string, timezone?: string) => 
      formatDate(date, format, timezone),
    
    /**
     * Format a date using the default date format for the current language
     */
    formatDateDefault: (date: Date | string | number, timezone?: string) => 
      formatDate(date, formatPreferences.defaultDateFormat, timezone),
    
    /**
     * Format a time using the default time format for the current language
     */
    formatTimeDefault: (date: Date | string | number, timezone?: string) => 
      formatDate(date, formatPreferences.defaultTimeFormat, timezone),
    
    /**
     * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
     */
    formatRelative: (date: Date | string | number, timezone?: string) => 
      formatDate(date, DATE_FORMATS.RELATIVE, timezone),
    
    /**
     * Format a date as a calendar date (e.g., "Today at 2:30 PM", "Yesterday")
     */
    formatCalendar: (date: Date | string | number, timezone?: string) => 
      formatDate(date, DATE_FORMATS.CALENDAR, timezone),
    
    /**
     * Get the current language's default date format
     */
    getDefaultDateFormat: () => formatPreferences.defaultDateFormat,
    
    /**
     * Get the current language's default time format
     */
    getDefaultTimeFormat: () => formatPreferences.defaultTimeFormat
  };
};
