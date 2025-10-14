import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { commonIcons } from '@/assets';

interface LanguageToggleProps {
  onToggle?: (newLanguage: string) => void;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  onToggle,
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotated, setRotated] = useState(false);

  const toggleLanguage = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setRotated((prev) => {
      const newRotated = !prev;

      // Call the onToggle callback with the new language
      if (onToggle) {
        onToggle(newRotated ? 'en' : 'ko');
      }

      return newRotated;
    });

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const languageIcon = rotated
    ? commonIcons.languageIconEn
    : commonIcons.languageIconKo;

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      aria-label={`Switch to ${rotated ? 'English' : 'Korean'}`}
      className={cn(
        'inline-flex items-center justify-center',
        'hover:opacity-80 active:opacity-60',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
    >
      <img
        src={languageIcon}
        alt={rotated ? 'English language' : 'Korean language'}
        className={cn(
          'transition-transform duration-500 ease-in-out transform w-7 h-7 invert brightness-0',
          rotated ? 'rotate-[360deg] scale-100' : 'rotate-[-360deg] scale-100'
        )}
      />
    </button>
  );
};
