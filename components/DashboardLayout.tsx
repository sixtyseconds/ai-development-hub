'use client';

import Header from './Header';
import Sidebar from './Sidebar';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="ml-16 md:ml-60 pt-16 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 