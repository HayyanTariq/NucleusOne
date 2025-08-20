import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebarContext } from './AppLayout';
import {
  GraduationCap,
  Home,
  List,
  Users,
  Settings,
  BarChart3,
  FileText,
  Award,
  BookOpen,
  Calendar,
  User,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const getNavigation = (userRole: string) => {
  const baseNav = [
    { title: 'Dashboard', url: '/employee/dashboard', icon: Home },
  ];

  if (userRole === 'admin' || userRole === 'owner') {
    const dashboardHref = userRole === 'owner' ? '/owner/dashboard' : '/admin/dashboard';
    const dashboardTitle = userRole === 'owner' ? 'Owner Dashboard' : 'Dashboard';
    
    return [
      { title: dashboardTitle, url: dashboardHref, icon: Home },
      { title: 'All Trainings', url: '/admin/trainings', icon: List },
      { title: 'Employees', url: '/admin/users', icon: Users },
      { title: 'Reports', url: '/admin/reports', icon: FileText },
      ...(userRole === 'owner' ? [{ title: 'Manage Admins', url: '/admin/manage-admins', icon: Shield }] : []),
    ];
  }

  return [
    ...baseNav,
    { title: 'Trainings', url: '/employee/training', icon: BookOpen },
    { title: 'Certifications', url: '/employee/certificates', icon: Award },
    { title: 'Courses', url: '/employee/courses', icon: GraduationCap },
    { title: 'Sessions', url: '/employee/sessions', icon: Calendar },
  ];
};

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebarContext();
  const { state, toggleSidebar } = useSidebar();
  
  const collapsed = state === 'collapsed';
  
  if (!user) return null;

  const navigation = getNavigation(user.role);
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn(
      "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out fixed left-0 top-0 h-full z-50",
      "bg-gray-100/90",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header Section */}
      <div className="flex items-center justify-between p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">
                Certify One
              </h1>
                             <p className="text-xs text-sidebar-muted-foreground">
                 Training Management
               </p>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            collapsed ? "mx-auto" : ""
          )}
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

             {/* Navigation Section */}
       <div className="flex-1">
        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel className={cn(
              "px-2 py-0.5 text-xs font-medium text-sidebar-muted-foreground",
              collapsed && "sr-only"
            )}>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      className={cn(
                        "h-10 px-3 rounded-lg transition-all duration-200",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                        "data-[active=true]:shadow-sm",
                        collapsed ? "justify-center" : ""
                      )}
                    >
                      <NavLink to={item.url} className={cn(
                        "flex items-center gap-3",
                        collapsed ? "justify-center" : ""
                      )}>
                        <item.icon className={cn(
                          "h-4 w-4 flex-shrink-0 transition-colors",
                          isActive(item.url) ? "text-sidebar-accent-foreground" : "text-sidebar-muted-foreground"
                        )} />
                        {!collapsed && (
                          <span className={cn(
                            "font-medium text-sm transition-colors",
                            isActive(item.url) ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
                          )}>
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>

      {/* Footer Section */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-sidebar-muted-foreground capitalize">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};