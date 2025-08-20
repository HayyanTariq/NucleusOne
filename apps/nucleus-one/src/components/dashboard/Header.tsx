import { Bell, LogOut, User, Settings, Menu, Palette, Shield, Building, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNucleusStore } from '@/store/nucleusStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider';
import { useState, useEffect } from 'react';

export function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, currentCompany, logout } = useNucleusStore();
  const { theme, setTheme } = useTheme();
  const [profileData, setProfileData] = useState<any>({});

  // Load profile data from localStorage
  useEffect(() => {
    if (currentUser?.id) {
      const savedProfile = localStorage.getItem(`profile-${currentUser.id}`);
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      }
    }
  }, [currentUser?.id]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail.userId === currentUser?.id) {
        setProfileData(event.detail.profileData);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, [currentUser?.id]);
  
  // Debug: Check what company data we have
  console.log('🔍 Header Debug:', {
    currentUser: currentUser?.name,
    currentCompany: currentCompany?.name,
    companyId: currentUser?.companyId,
    storedData: JSON.parse(localStorage.getItem('nucleus-store') || '{}')
  });
  
  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account.",
    });
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'owner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'employee': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Company Name */}
      <div className="flex items-center">
        <span className="text-sm font-medium text-muted-foreground">
          {currentCompany?.name || 'Company Name'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative p-1 rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profileData.profilePhoto} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profileData.profilePhoto} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  <Badge className={`text-xs w-fit ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            {/* Notifications Toggle */}
            <DropdownMenuItem className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                <span>Notifications</span>
              </div>
              <div className="relative">
                <span className="w-2 h-2 bg-primary rounded-full" />
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            
            {/* Settings Submenu with Hamburger Icon */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Menu className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                {/* Change Password */}
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings?section=security')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                
                {/* Company Settings (for owners/admins) */}
                {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings?section=company')}>
                    <Building className="w-4 h-4 mr-2" />
                    Company Settings
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                {/* Theme Selection */}
                <DropdownMenuItem>
                  <Palette className="w-4 h-4 mr-2" />
                  <span className="flex-1">Theme</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setTheme('light')}>
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('dark')}>
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('system')}>
                        System
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuItem>
                
                {/* Font Size */}
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings?section=appearance')}>
                  <Type className="w-4 h-4 mr-2" />
                  Font Size
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* All Settings */}
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  All Settings
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}