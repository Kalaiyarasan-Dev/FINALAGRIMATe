import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, TrendingUp, Stethoscope, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isTamil } = useLanguage();

  const isAssistantActive = [
    '/crop-assistant', 
    '/weather-alerts', 
    '/crop-protection', 
    '/insurance-assistant', 
    '/damage-reporting'
  ].includes(location.pathname);

  const navItems = [
    { path: '/', icon: Home, label: t('home'), active: location.pathname === '/' },
    { 
      path: '/crop-assistant', 
      icon: ShieldCheck, 
      label: isTamil ? 'பயிர் உதவி' : 'Assistant', 
      active: isAssistantActive,
      highlight: true
    },
    { path: '/planner', icon: Calendar, label: t('planner'), active: location.pathname === '/planner' },
    { path: '/market', icon: TrendingUp, label: t('market'), active: location.pathname === '/market' },
    { path: '/doctor', icon: Stethoscope, label: t('doctor'), active: location.pathname === '/doctor' },
    { path: '/profile', icon: User, label: t('profile'), active: location.pathname === '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-1.5 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = item.active;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 touch-feedback flex-1',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all duration-200 relative',
                  isActive && 'bg-primary/10',
                  item.highlight && !isActive && 'text-primary/80'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.highlight && !isActive && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <span
                className={cn(
                  'text-[9px] font-medium transition-all duration-200 truncate max-w-[60px]',
                  isTamil && 'font-tamil text-[8px]',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
