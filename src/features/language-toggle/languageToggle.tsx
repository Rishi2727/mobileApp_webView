import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/useLanguage';
import LanguageIconEn from '../../assets/icons/lang-eng.svg?react';
import LanguageIconKo  from '../../assets/icons/lang-eng.svg?react';
interface LanguageToggleProps {
  onToggle?: (newLanguage: string) => void;
  className?: string;
  fillColor?: string; 
}
export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  onToggle,
  className,
  fillColor = 'background',
}) => {
  const { language } = useLanguage(); 
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotated, setRotated] = useState(language === 'en');
  const [hasInteracted, setHasInteracted] = useState(false);
  useEffect(() => {
    if (!hasInteracted) {
      setRotated(language === 'en');
    }
  }, [language, hasInteracted]);

  const toggleLanguage = () => {
    if (isAnimating) return;

    setHasInteracted(true); 
    setIsAnimating(true);
    setRotated((prev) => {
      const newRotated = !prev;
      const newLanguage = newRotated ? 'en' : 'ko';
      if (onToggle) {
        onToggle(newLanguage);
      }

      return newRotated;
    });

    setTimeout(() => {
      setIsAnimating(false);
      setHasInteracted(false); 
    }, 500);
  };
const LanguageIcon = rotated ? LanguageIconEn : LanguageIconKo;

return (
  <button
    onClick={toggleLanguage}
    type="button"
    aria-label={`Switch to ${rotated ? 'Korean' : 'English'}`}
    className={cn(
      'inline-flex items-center justify-center',
      'hover:opacity-80 active:opacity-60',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      className
    )}
  >
    <LanguageIcon
      className={cn(
        'w-7 h-7',
        isAnimating && 'transition-transform duration-500 ease-in-out transform',
        isAnimating && (rotated ? 'rotate-[360deg]' : 'rotate-[-360deg]')
      )}
      color={fillColor} // ✅ now works
    />
  </button>
);

};