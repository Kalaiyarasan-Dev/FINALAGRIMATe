import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-28 px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
