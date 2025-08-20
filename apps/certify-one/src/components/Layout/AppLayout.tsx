import React, { useState, createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
} | null>(null);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within SidebarProvider');
  }
  return context;
};

const AppLayoutContent: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  if (!user) {
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

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
        <AppLayoutContent>{children}</AppLayoutContent>
      </SidebarContext.Provider>
    </SidebarProvider>
  );
};
