import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Search, Award, FolderOpen, Clock, Users, DollarSign, ExternalLink, Settings, Star, Zap, Shield, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNucleusStore } from '@/store/nucleusStore';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const AppsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subscribed');
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, currentCompany, apps, getCompanyApps, getUserApps, subscribeToApp, unsubscribeFromApp, ensureOwnerAccess } = useNucleusStore();
  const { toast } = useToast();
  
  // Ensure owner has access to all subscribed apps
  useEffect(() => {
    const ensureAccess = async () => {
      if (currentUser?.role === 'owner') {
        await ensureOwnerAccess();
      }
    };
    
    ensureAccess();
  }, [currentUser, ensureOwnerAccess]);
  
  if (!currentUser) return null;

  const getAvailableApps = () => {
    // Everyone can see all Nucleus One apps
    return apps;
  };

  const getSubscribedApps = () => {
    // Show only Certify One as subscribed (since it's the only accessible app)
    return apps.filter(app => app.id === 'certify-one');
  };

  const hasAccessToApp = (appId: string) => {
    // Only Certify One is accessible
    if (appId === 'certify-one') {
      // Owners and admins have access to Certify One
      if (currentUser.role === 'owner' || currentUser.role === 'admin') {
        return true;
      }
      // Employees need explicit access
      return currentUser.appAccess?.[appId] || false;
    }
    // All other apps are not accessible yet
    return false;
  };

  const getAvailableAppsForSubscription = () => {
    // Show all apps as available but only Certify One can be subscribed
    const userRole = currentUser.role?.toLowerCase();
    
    if (userRole === 'employee') {
      return [];
    } else if (userRole === 'owner' || userRole === 'admin') {
      const isSubscribed = currentCompany?.subscribedAppIds?.includes('certify-one') || false;
      return isSubscribed ? [] : apps;
    }
    
    return [];
  };

  const availableApps = getAvailableApps();
  const subscribedApps = getSubscribedApps();
  const availableForSubscription = getAvailableAppsForSubscription();

  // Helper function to check if user can manage apps
  const canManageApps = () => {
    const userRole = currentUser.role?.toLowerCase();
    return userRole === 'owner' || userRole === 'admin';
  };

  // Filter apps based on search query
  const filterApps = (appsList: any[]) => {
    if (!searchQuery) return appsList;
    return appsList.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSubscribe = async (appId: string) => {
    // Only allow subscription to Certify One
    if (appId !== 'certify-one') {
      toast({
        title: 'Coming Soon',
        description: 'This app is not available for subscription yet.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await subscribeToApp(appId);
      toast({
        title: 'Subscribed to app',
        description: 'You have successfully subscribed to the app.',
      });
    } catch (error) {
      toast({
        title: 'Failed to subscribe',
        description: 'Backend endpoint not available. Please check your backend API.',
        variant: 'destructive',
      });
    }
  };

  const handleUnsubscribe = async (appId: string) => {
    // Only allow unsubscription from Certify One
    if (appId !== 'certify-one') {
      toast({
        title: 'Coming Soon',
        description: 'This app is not available for unsubscription yet.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await unsubscribeFromApp(appId);
      toast({
        title: 'Unsubscribed from app',
        description: 'You have successfully unsubscribed from the app.',
      });
    } catch (error) {
      toast({
        title: 'Failed to unsubscribe',
        description: 'Backend endpoint not available. Please check your backend API.',
        variant: 'destructive',
      });
    }
  };

  const getAppIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Award': Award,
      'FolderOpen': FolderOpen,
      'Clock': Clock,
      'Users': Users,
      'DollarSign': DollarSign,
      'ShoppingCart': ShoppingBag,
    };
    return iconMap[iconName] || ShoppingBag;
  };

  const getAppStatus = (app: any) => {
    if (app.pricing === 'Coming Soon') return 'coming-soon';
    if (subscribedApps.some(subApp => subApp.id === app.id)) return 'subscribed';
    if (app.id === 'certify-one') return 'available';
    return 'locked';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Applications Hub
            </h1>
            <p className="text-muted-foreground">
              {!canManageApps() 
                ? 'Access your authorized applications' 
                : 'Manage and discover applications for your organization'
              }
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search applications..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscribed Apps</p>
                  <p className="text-2xl font-bold">{subscribedApps.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Apps</p>
                  <p className="text-2xl font-bold">{availableApps.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coming Soon</p>
                  <p className="text-2xl font-bold">{availableApps.filter(app => app.pricing === 'Coming Soon').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="subscribed" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your Applications
            </TabsTrigger>
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Available Applications
            </TabsTrigger>
          </TabsList>

          {/* Your Applications Tab */}
          <TabsContent value="subscribed" className="mt-6">
            <div className="space-y-6">
              {!canManageApps() ? (
                // Employee View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterApps(subscribedApps).map((app, index) => {
                    const hasAccess = hasAccessToApp(app.id);
                    const IconComponent = getAppIcon(app.icon);
                    
                    return (
                      <Card 
                        key={app.id} 
                        className={`group hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-4 duration-500 ${
                          !hasAccess ? 'opacity-60' : 'hover:border-primary/50'
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            {hasAccess && (
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg mt-4">{app.name}</CardTitle>
                          <CardDescription className="text-sm">{app.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">{app.category}</Badge>
                            <Badge variant="secondary" className="text-xs">{app.pricing}</Badge>
                            {!hasAccess && (
                              <Badge variant="destructive" className="text-xs">No Access</Badge>
                            )}
                          </div>
                          <Button 
                            className="w-full group-hover:bg-primary/90 transition-colors duration-200"
                            disabled={!hasAccess}
                            onClick={() => navigate(`/app/${app.id}`)}
                          >
                            {hasAccess ? (
                              <>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Application
                              </>
                            ) : (
                              'Request Access'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                // Admin/Owner View
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterApps(subscribedApps).map((app, index) => {
                      const IconComponent = getAppIcon(app.icon);
                      
                      return (
                        <Card 
                          key={app.id} 
                          className="group hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-4 duration-500 hover:border-primary/50"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <Badge variant="default" className="text-xs">
                                Subscribed
                              </Badge>
                            </div>
                            <CardTitle className="text-lg mt-4">{app.name}</CardTitle>
                            <CardDescription className="text-sm">{app.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">{app.category}</Badge>
                              <Badge variant="secondary" className="text-xs">{app.pricing}</Badge>
                            </div>
                                                         <Button 
                               className="w-full group-hover:bg-primary/90 transition-colors duration-200"
                               onClick={() => navigate(`/app/${app.id}`)}
                             >
                               <ExternalLink className="w-4 h-4 mr-2" />
                               Open Application
                             </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Available Applications Tab */}
          <TabsContent value="available" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterApps(availableApps).map((app, index) => {
                  const isSubscribed = subscribedApps.some(subApp => subApp.id === app.id);
                  const canSubscribe = app.id === 'certify-one' && !isSubscribed;
                  const isComingSoon = app.pricing === 'Coming Soon';
                  const appStatus = getAppStatus(app);
                  const IconComponent = getAppIcon(app.icon);
                  
                  return (
                    <Card 
                      key={app.id} 
                      className={`group hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-4 duration-500 ${
                        isComingSoon ? 'opacity-60' : 'hover:border-primary/50'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                            isComingSoon ? 'bg-muted' : 'bg-gradient-primary'
                          }`}>
                            <IconComponent className={`w-6 h-6 ${
                              isComingSoon ? 'text-muted-foreground' : 'text-white'
                            }`} />
                          </div>
                          <Badge 
                            variant={
                              appStatus === 'coming-soon' ? 'secondary' :
                              appStatus === 'subscribed' ? 'default' :
                              appStatus === 'available' ? 'outline' : 'destructive'
                            } 
                            className="text-xs"
                          >
                            {appStatus === 'coming-soon' ? 'Coming Soon' :
                             appStatus === 'subscribed' ? 'Subscribed' :
                             appStatus === 'available' ? 'Available' : 'Locked'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-4">{app.name}</CardTitle>
                        <CardDescription className="text-sm">{app.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">{app.category}</Badge>
                          <Badge variant="secondary" className="text-xs">{app.pricing}</Badge>
                        </div>
                        {isComingSoon ? (
                          <Button variant="outline" disabled className="w-full">
                            <Clock className="w-4 h-4 mr-2" />
                            Coming Soon
                          </Button>
                        ) : isSubscribed ? (
                          <Button disabled className="w-full">
                            <Shield className="w-4 h-4 mr-2" />
                            Subscribed
                          </Button>
                        ) : canSubscribe ? (
                          <Button 
                            onClick={() => handleSubscribe(app.id)}
                            className="w-full group-hover:bg-primary/90 transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Subscribe Now
                          </Button>
                        ) : (
                          <Button variant="outline" disabled className="w-full">
                            <Shield className="w-4 h-4 mr-2" />
                            No Access
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AppsPage;