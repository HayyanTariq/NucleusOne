import { useState, useEffect } from 'react';
import { Settings, Building, Shield, Bell, Palette, Type, Monitor, Sun, Moon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNucleusStore } from '@/store/nucleusStore';
import { ApiService } from '@/store/nucleusStore';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Security Settings Component
const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ApiService.changePassword(
        currentPassword,
        newPassword
      );
      
      if (result.success) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        toast({
          title: "Password Changed Successfully",
          description: "Your password has been updated.",
        });
      } else {
        throw new Error(result.message || 'Password change failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password. Please try again.';
      setError(errorMessage);
      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 ease-out">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your security preferences and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Company Settings Component
const CompanySettings = () => {
  return (
    <div className="animate-in slide-in-from-right-4 duration-300 ease-out">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Company Settings
          </CardTitle>
          <CardDescription>
            Manage your company information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input id="company" defaultValue="Acme Inc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Company Domain</Label>
            <Input id="domain" defaultValue="acme.com" />
          </div>
          <Button>Update Company</Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Appearance Settings Component
const AppearanceSettings = () => {
  const [fontSize, setFontSize] = useState([16]);
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize[0]}px`;
  }, [fontSize]);
  
  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value);
    localStorage.setItem('nucleus-font-size', value[0].toString());
  };
  
  useEffect(() => {
    const savedFontSize = localStorage.getItem('nucleus-font-size');
    if (savedFontSize) {
      setFontSize([parseInt(savedFontSize)]);
    }
  }, []);

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 ease-out">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="h-auto p-4 flex flex-col gap-2 transition-all duration-200"
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs font-medium">Light</span>
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="h-auto p-4 flex flex-col gap-2 transition-all duration-200"
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-medium">Dark</span>
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="h-auto p-4 flex flex-col gap-2 transition-all duration-200"
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-medium">System</span>
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Font Size Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Font Size
                </Label>
                <p className="text-xs text-muted-foreground">
                  Adjust the font size for better readability
                </p>
              </div>
              <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                {fontSize[0]}px
              </span>
            </div>
            <div className="px-3">
              <Slider
                value={fontSize}
                onValueChange={handleFontSizeChange}
                max={24}
                min={12}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Small (12px)</span>
                <span>Default (16px)</span>
                <span>Large (24px)</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFontSizeChange([14])}
                className="transition-all duration-200"
              >
                Small
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFontSizeChange([16])}
                className="transition-all duration-200"
              >
                Default
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFontSizeChange([18])}
                className="transition-all duration-200"
              >
                Large
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  return (
    <div className="animate-in slide-in-from-right-4 duration-300 ease-out">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about security events
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Settings Page Component
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('security');
  const { currentUser } = useNucleusStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  if (!currentUser) return null;

  // Read section from URL on component mount
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['security', 'company', 'appearance', 'notifications'].includes(section)) {
      setActiveTab(section);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    ...(currentUser.role === 'owner' || currentUser.role === 'admin' 
      ? [{ id: 'company', label: 'Company', icon: Building }] 
      : []),
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without page reload
    navigate(`/dashboard/settings?section=${tabId}`, { replace: true });
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'security':
        return <SecuritySettings />;
      case 'company':
        return <CompanySettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <SecuritySettings />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-out whitespace-nowrap hover:scale-105",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-all duration-300",
                    activeTab === tab.id ? "scale-110" : "scale-100"
                  )} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Settings Component */}
        <div className="min-h-[400px] transition-all duration-300">
          {renderActiveComponent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;