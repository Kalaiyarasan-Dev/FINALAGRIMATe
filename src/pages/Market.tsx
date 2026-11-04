import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TodayMarketPrices from '@/components/dashboard/TodayMarketPrices';

const Market: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in pb-10 max-w-6xl mx-auto">
        <TodayMarketPrices showFilters={true} />
      </div>
    </AppLayout>
  );
};

export default Market;