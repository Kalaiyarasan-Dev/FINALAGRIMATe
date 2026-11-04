import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  variant = 'segmented',
  size = 'md',
}) => {
  const { language, setLanguage, isTamil } = useLanguage();

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 hover:bg-muted border border-border/80 transition-all text-xs font-semibold text-foreground shadow-sm touch-feedback',
          className
        )}
        title={isTamil ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className={cn(isTamil && 'font-tamil')}>
          {language === 'en' ? 'தமிழ்' : 'English'}
        </span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={cn(
        'inline-flex items-center p-1 rounded-xl bg-muted/70 border border-border/60 shadow-sm backdrop-blur-sm',
        size === 'sm' && 'p-0.5 text-xs',
        size === 'lg' && 'p-1.5 text-base',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
          size === 'sm' && 'px-2 py-1 text-[11px]',
          size === 'lg' && 'px-4 py-2 text-sm',
          language === 'en'
            ? 'bg-background text-primary shadow-sm font-bold border border-border/50'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
        )}
      >
        <span>English</span>
      </button>

      <span className="text-muted-foreground/40 text-xs px-0.5 font-light">|</span>

      <button
        type="button"
        onClick={() => setLanguage('ta')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 font-tamil',
          size === 'sm' && 'px-2 py-1 text-[11px]',
          size === 'lg' && 'px-4 py-2 text-sm',
          language === 'ta'
            ? 'bg-background text-primary shadow-sm font-bold border border-border/50'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
        )}
      >
        <span>தமிழ்</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;

