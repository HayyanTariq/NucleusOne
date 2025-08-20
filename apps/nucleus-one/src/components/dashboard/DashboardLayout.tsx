import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useNucleusStore } from '@/store/nucleusStore';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayoutContent = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useNucleusStore();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  useEffect(() => {
    if (!isLoggedIn || !currentUser) {
      navigate('/login');
    }
  }, [isLoggedIn, currentUser, navigate]);

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Sidebar spanning full height */}
      <Sidebar />
      
      {/* Main content area with header */}
      <div className={cn(
        "flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "ml-16" : "ml-64"
      )}>
        {/* Header */}
        <Header />
        
        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;