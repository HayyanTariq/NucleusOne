import { 
  Home, 
  Users, 
  ShoppingBag, 
  Settings, 
  Building,
  Crown,
  Shield,
  User,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
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
import { useNucleusStore } from '@/store/nucleusStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { currentUser } = useNucleusStore();
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  
  const collapsed = state === 'collapsed';
  
  // Check profile completion status
  useEffect(() => {
    if (currentUser?.id) {
      const savedProfile = localStorage.getItem(`profile-${currentUser.id}`);
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        const requiredFields = [
          'gender', 'cnic', 'nationality', 'dateOfBirth', 'bloodGroup',
          'maritalStatus', 'nextOfKinName', 'nextOfKinRelationship', 'nextOfKinContact'
        ];
        const completedFields = requiredFields.filter(field => profileData[field]);
        setIsProfileComplete(completedFields.length === requiredFields.length);
      } else {
        setIsProfileComplete(false);
      }
    }
  }, [currentUser?.id]);
  
  if (!currentUser) return null;

  const isActive = (path: string) => location.pathname === path;

  interface NavigationItem {
    title: string;
    url: string;
    icon: React.ComponentType<any>;
    hasNotification?: boolean;
  }

  const getNavigation = (): NavigationItem[] => {
    const baseNav: NavigationItem[] = [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
    ];

    // Normalize role to lowercase for comparison
    const userRole = currentUser.role?.toLowerCase();

    if (userRole === 'super_admin') {
      return [
        ...baseNav,
        { title: 'All Companies', url: '/dashboard/companies', icon: Building },
        { title: 'All Users', url: '/dashboard/all-users', icon: Users },
        { title: 'System Settings', url: '/dashboard/system-settings', icon: Settings },
      ];
    }

    if (userRole === 'owner' || userRole === 'admin') {
      return [
        ...baseNav,
        { title: 'Applications', url: '/dashboard/apps', icon: ShoppingBag },
        { title: 'Users', url: '/dashboard/users', icon: Users },
        { title: 'Settings', url: '/dashboard/settings', icon: Settings },
      ];
    }

    return [
      ...baseNav,
      { title: 'My Apps', url: '/dashboard/my-apps', icon: ShoppingBag },
      { 
        title: 'Profile', 
        url: '/dashboard/profile', 
        icon: User,
        hasNotification: !isProfileComplete
      },
    ];
  };

  const navigation = getNavigation();

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
               <span className="text-white font-bold text-lg">N</span>
             </div>
             <div>
               <h1 className="text-lg font-semibold text-sidebar-foreground">
                 Nucleus One
               </h1>
               <p className="text-xs text-sidebar-muted-foreground">
                 {currentUser.role === 'super_admin' ? 'System Administration' : 
                  currentUser.companyId ? 'Dashboard' : 'Welcome'}
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
              "px-2 py-1.5 text-xs font-medium text-sidebar-muted-foreground",
              collapsed && "sr-only"
            )}>
         
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      className={cn(
                        "h-10 px-3 rounded-lg transition-all duration-200 relative",
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
                        <div className="relative">
                          <item.icon className={cn(
                            "h-4 w-4 flex-shrink-0 transition-colors",
                            isActive(item.url) ? "text-sidebar-accent-foreground" : "text-sidebar-muted-foreground"
                          )} />
                          {item.hasNotification && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          )}
                        </div>
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
                {currentUser.name}
              </p>
              <p className="text-xs text-sidebar-muted-foreground capitalize">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}