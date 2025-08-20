import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { 
  LogOut, 
  Settings, 
  Moon, 
  Sun, 
  Type,
  GraduationCap,
  User,
  Shield,
  Bell
} from 'lucide-react';
import { CompanyIndicator } from '@/components/ui/CompanyIndicator';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'employee': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Company Name */}
      {user.companyName && (
        <div className="flex items-center">
          <span className="text-sm font-medium text-muted-foreground">
            {user.companyName}
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative p-1 rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.firstName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge className={`text-xs w-fit ${getRoleBadgeColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            {/* Theme Toggle */}
            <div className="px-2 py-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};