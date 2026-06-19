import { ReactNode } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 pt-20 lg:pt-0">
        <div className="p-6 sm:p-8 md:p-12">{children}</div>
      </main>
    </div>
  );
}
