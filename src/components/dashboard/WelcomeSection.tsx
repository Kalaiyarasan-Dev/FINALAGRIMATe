import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const WelcomeSection: React.FC = () => {
  const { isTamil, language } = useLanguage();
  const { profile } = useAuth();
  const [greeting, setGreeting] = React.useState('');
  const [emoji, setEmoji] = React.useState('');
  const [farmerName, setFarmerName] = React.useState('Muthu Kumar');

  // Load name from profile or localStorage on mount/focus
  React.useEffect(() => {
    if (profile?.name) {
      setFarmerName(profile.name.split(' ')[0]);
      return;
    }

    const loadProfileName = () => {
      try {
        const saved = localStorage.getItem('vivasayi_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) {
            setFarmerName(parsed.name.split(' ')[0]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadProfileName();
    
    // Listen for changes
    window.addEventListener('storage', loadProfileName);
    return () => window.removeEventListener('storage', loadProfileName);
  }, [profile]);

  const updateGreeting = React.useCallback(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    let newEmoji = '';

    if (hour >= 5 && hour < 12) {
      newGreeting = isTamil ? 'இனிய காலை வணக்கம்' : 'Good Morning';
      newEmoji = ' 🌅';
    } else if (hour >= 12 && hour < 17) {
      newGreeting = isTamil ? 'இனிய மதிய வணக்கம்' : 'Good Afternoon';
      newEmoji = ' ☀️';
    } else if (hour >= 17 && hour < 21) {
      newGreeting = isTamil ? 'இனிய மாலை வணக்கம்' : 'Good Evening';
      newEmoji = ' 🌇';
    } else {
      newGreeting = isTamil ? 'இனிய இரவு வணக்கம்' : 'Good Night';
      newEmoji = ' 🌙';
    }
    setGreeting(newGreeting);
    setEmoji(newEmoji);
  }, [isTamil]);

  React.useEffect(() => {
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, [updateGreeting]);

  return (
    <div className="mb-4">
      <h2 className={cn(
        'text-2xl font-bold text-foreground font-heading',
        isTamil && 'font-tamil'
      )}>
        {greeting}, {farmerName}{emoji}
      </h2>
      <p className={cn(
        'text-sm text-muted-foreground mt-1',
        isTamil && 'font-tamil'
      )}>
        {isTamil
          ? 'இன்று உங்கள் பண்ணைக்கு என்ன செய்யலாம்?'
          : "What can we help your farm with today?"}
      </p>
    </div>
  );
};

export default WelcomeSection;
