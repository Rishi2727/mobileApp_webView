import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { commonIcons } from '@/assets';
import { useLanguage } from '@/contexts/useLanguage';

interface LanguageToggleProps {
  onToggle?: (newLanguage: string) => void;
  className?: string;
  fillColor?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  onToggle,
  className,
  fillColor = "text-white",
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

    const newRotated = !rotated;
    const newLanguage = newRotated ? 'en' : 'ko';

    setTimeout(() => {
      setRotated(newRotated);
      if (onToggle) {
        onToggle(newLanguage);
      }
      setIsAnimating(false);
      setHasInteracted(false);
    }, 500);
  };

  const LanguageIcon = rotated
    ? commonIcons.LanguageIconEn
    : commonIcons.LanguageIconKo;

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
          'transition-transform duration-500 ease-in-out transform',
          isAnimating && (rotated ? 'rotate-[360deg]' : 'rotate-[-360deg]'),
          fillColor
        )}
      />
    </button>
  );
};
