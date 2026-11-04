import React from 'react';
import { Sprout, Globe, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { language, setLanguage, t, isTamil } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const location = useLocation();
  const navigate = useNavigate();
  const showBackButton = location.pathname !== '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section: Back Btn or Logo */}
        <div className="flex items-center gap-2">
          {showBackButton ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
          )}

          <div>
            <h1 className={cn(
              'text-lg font-bold font-brand text-foreground leading-tight',
              isTamil && 'font-tamil'
            )}>
              {isTamil ? 'அக்ரிமேட்' : 'AgriMate'}
            </h1>
            <p className={cn(
              'text-[10px] text-muted-foreground -mt-0.5',
              isTamil && 'font-tamil'
            )}>
              {isTamil ? 'உங்கள் ஸ்மார்ட் விவசாய நண்பன்' : 'Smart Farming Assistant'}
            </p>
          </div>
        </div>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors touch-feedback"
        >
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className={cn(
            'text-sm font-medium',
            isTamil && 'font-tamil'
          )}>
            {language === 'en' ? 'தமிழ்' : 'EN'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
