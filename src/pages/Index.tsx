import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import MarketTicker from '@/components/dashboard/MarketTicker';
import WeatherCard from '@/components/dashboard/WeatherCard';
import TodayMarketPrices from '@/components/dashboard/TodayMarketPrices';
import AlertsCard from '@/components/dashboard/AlertsCard';
import QuickActions from '@/components/dashboard/QuickActions';

const Index: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <WelcomeSection />
        <MarketTicker />
        <WeatherCard />
        <TodayMarketPrices limitDisplay={6} showFilters={true} />
        <QuickActions />
        <AlertsCard />
      </div>
    </AppLayout>
  );
};

export default Index;
