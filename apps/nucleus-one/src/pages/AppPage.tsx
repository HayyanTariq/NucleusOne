import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNucleusStore } from '@/store/nucleusStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ExternalLink, ArrowLeft, Shield, Users, Settings, RefreshCw } from 'lucide-react';

const AppPage = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { currentUser, apps, currentCompany, refreshCurrentUser } = useNucleusStore();
  const { toast } = useToast();
  const [isLaunching, setIsLaunching] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const app = apps.find(a => a.id === appId);
  
  // Ensure owner has access to all subscribed apps
  useEffect(() => {
    const ensureAccess = async () => {
      if (currentUser?.role === 'owner' && currentCompany && appId) {
        console.log('🔐 Ensuring owner access for app:', appId);
        await useNucleusStore.getState().ensureOwnerAccess();
        
        // Also ensure specific app access for owner
        if (currentCompany.subscribedAppIds?.includes(appId) && !currentUser.appAccess?.[appId]) {
          console.log('🔐 Granting specific app access to owner:', appId);
          await useNucleusStore.getState().setAppRole(currentUser.id, appId, 'admin');
          // Force refresh to update UI
          setTimeout(() => setForceRefresh(prev => prev + 1), 100);
        }
      }
    };
    
    ensureAccess();
  }, [currentUser, currentCompany, appId]);
  
  if (!currentUser || !app) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">App Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested application could not be found.</p>
            <Button onClick={() => navigate('/dashboard/apps')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Apps
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user has access to this app
  const isOwner = currentUser.role === 'owner';
  const isAdmin = currentUser.role === 'admin';
  const isSubscribed = currentCompany?.subscribedAppIds?.includes(appId) || false;
  
  // Enhanced access control logic
  let hasAccess = false;
  
  if (appId === 'certify-one') {
    // For Certify One (free app):
    // - Owners and admins always have access
    // - Employees need explicit access
    if (isOwner || isAdmin) {
      hasAccess = true;
    } else {
      hasAccess = currentUser.appAccess?.[appId] || false;
      // Also check if they have an app role (which implies access)
      if (!hasAccess && currentUser.appRoles?.[appId]) {
        hasAccess = true;
      }
    }
  } else {
    // For paid apps:
    // - Owners have access to all subscribed apps
    // - Others need explicit access to subscribed apps
    if (isOwner) {
      hasAccess = isSubscribed;
    } else if (isSubscribed) {
      hasAccess = currentUser.appAccess?.[appId] || false;
      if (!hasAccess && currentUser.appRoles?.[appId]) {
        hasAccess = true;
      }
    }
  }
  
  // Debug logging
  console.log('🔐 AppPage Access Debug:', {
    appId,
    isOwner,
    isSubscribed,
    userAppAccess: currentUser.appAccess,
    userAppRoles: currentUser.appRoles,
    subscribedAppIds: currentCompany?.subscribedAppIds,
    hasAccess,
    userRole: currentUser.role,
    hasAppRole: currentUser.appRoles?.[appId],
    currentUserFull: currentUser // Log full user object for debugging
  });

  const handleLaunchApp = async () => {
    // Clear any existing app tokens to ensure fresh token generation for current user
    localStorage.removeItem('nucleus-app-token');
    localStorage.removeItem('nucleus-app-id');
    localStorage.removeItem('nucleus-user-data');
    
    // For Certify One (free app), ensure owners/admins have proper access
    if (appId === 'certify-one') {
      if ((isOwner || isAdmin) && !currentUser.appAccess?.[appId]) {
        console.log('🔐 Granting owner/admin access to Certify One');
        await useNucleusStore.getState().setAppRole(currentUser.id, appId, 'admin');
      }
    } else {
      // For paid apps, ensure owners have access to subscribed apps
      if (isOwner && isSubscribed && !currentUser.appAccess?.[appId]) {
        console.log('🔐 Granting owner access to app:', appId);
        await useNucleusStore.getState().setAppRole(currentUser.id, appId, 'admin');
      }
      
      // For non-owners, ensure they have proper access if they have a role
      if (!isOwner && isSubscribed && currentUser.appRoles?.[appId] && !currentUser.appAccess?.[appId]) {
        console.log('🔐 User has app role but no access flag, ensuring access:', appId);
        await useNucleusStore.getState().setAppRole(currentUser.id, appId, currentUser.appRoles[appId]);
      }
    }
    
    if (!hasAccess) {
      toast({
        title: 'Access Denied',
        description: 'You do not have access to this application. Please contact your administrator.',
        variant: 'destructive',
      });
      return;
    }

    setIsLaunching(true);

    try {
      // Generate app-specific token (using fallback since backend token generation is broken)
      console.log('🔐 Generating app token for:', appId);
      console.log('🔐 Current user for token generation:', {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        appRole: currentUser.appRoles?.[appId]
      });
      
      // Generate secure token from Nucleus One backend
      const appRole = currentUser.appRoles?.[appId] || 'employee';
      console.log('🔐 Using app role for token:', appRole);
      
      let appToken;
      try {
        console.log('🔐 Generating secure token from backend...');
        
        const response = await fetch('https://localhost:7296/api/certifytoken/generate-certify-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            appId: appId,
            userId: currentUser.id,
            companyId: currentUser.companyId
          })
        });

        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        } else if (response.status === 403) {
          throw new Error('Access denied - You don\'t have permission to access Certify One');
        } else if (response.status === 404) {
          throw new Error('Service not found - Please contact support');
        } else if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          appToken = data.token;
          console.log('🔐 Secure token generated from backend:', appToken.substring(0, 50) + '...');
        } else {
          throw new Error(data.message || 'Token generation failed');
        }
      } catch (error) {
        console.error('❌ Error generating secure token:', error);
        
        // Fallback to simple token for development
        console.log('🔄 Falling back to simple token for development...');
        const currentTime = Math.floor(Date.now() / 1000);
        const expirationTime = currentTime + 86400; // 24 hour expiry
        
        const payload = {
          sub: currentUser.id,
          userId: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
          companyId: currentUser.companyId,
          companyName: currentCompany?.name || 'Unknown Company',
          appId: appId,
          appRole: appRole,
          iat: currentTime,
          exp: expirationTime
        };
        
        appToken = btoa(JSON.stringify(payload));
        console.log('🔐 Fallback token generated:', appToken.substring(0, 50) + '...');
      }
      
      console.log('🔐 Generated token with user info:', {
        userId: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        appRole: appRole
      });
      console.log('🔐 Token:', appToken.substring(0, 50) + '...');

             // Store the app token for Certify One to use
       const userData = {
         id: currentUser.id,
         email: currentUser.email,
         name: currentUser.name,
         role: currentUser.role,
         companyId: currentUser.companyId,
         companyName: currentCompany?.name,
         appRole: appRole
       };
      
      // Ensure we're storing the current user's specific data
      console.log('🔐 Storing user-specific data for Certify One:', {
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        userRole: currentUser.role,
        appRole: appRole,
        companyId: currentUser.companyId
      });
      
      localStorage.setItem('nucleus-app-token', appToken);
      localStorage.setItem('nucleus-app-id', appId);
      localStorage.setItem('nucleus-user-data', JSON.stringify(userData));
      
      console.log('🔐 Stored Nucleus One data for Certify One:', {
        token: appToken.substring(0, 20) + '...',
        appId,
        userData
      });

      // Launch the app based on appId
      if (appId === 'certify-one') {
        setLaunchError(null);
        
        // For development, redirect to local Certify One
        const certifyOneUrl = 'http://localhost:5174';
        
        // Use the fixed URL for Certify One
        const finalUrl = certifyOneUrl;
        console.log('🚀 Launching Certify One:', `${certifyOneUrl}?token=${appToken}`);
        console.log('🔧 Environment VITE_CERTIFY_ONE_URL:', import.meta.env.VITE_CERTIFY_ONE_URL);
        
        // Store token in URL parameters for Certify One to pick up
        // URL-encode the base64 token to handle special characters
        const encodedToken = encodeURIComponent(appToken);
        const launchUrl = `${finalUrl}?token=${encodedToken}&appId=${appId}`;
        
        // Verify URL parameters are correct
        const urlParams = new URLSearchParams(launchUrl.split('?')[1]);
        const urlToken = urlParams.get('token');
        const urlAppId = urlParams.get('appId');
        const decodedUrlToken = urlToken ? decodeURIComponent(urlToken) : null;
        console.log('🔍 URL parameter verification:', {
          originalToken: appToken.substring(0, 50) + '...',
          encodedToken: encodedToken.substring(0, 50) + '...',
          urlToken: urlToken ? urlToken.substring(0, 50) + '...' : null,
          decodedUrlToken: decodedUrlToken ? decodedUrlToken.substring(0, 50) + '...' : null,
          tokensMatch: appToken === decodedUrlToken,
          originalAppId: appId,
          urlAppId: urlAppId,
          appIdsMatch: appId === urlAppId
        });
        console.log('🔗 Final launch URL:', launchUrl);
        console.log('🔗 Expected Certify One URL: http://localhost:5174');
        console.log('🔗 Token being passed:', appToken.substring(0, 50) + '...');
        console.log('🔗 AppId being passed:', appId);
        console.log('🔗 Full token for debugging:', appToken);
        console.log('🔗 Encoded token for debugging:', encodedToken);
        console.log('🔗 URL search params:', new URLSearchParams(launchUrl.split('?')[1]).toString());
        
        // Test URL parsing
        const testUrl = new URL(launchUrl);
        const testToken = testUrl.searchParams.get('token');
        const testAppId = testUrl.searchParams.get('appId');
        console.log('🔗 URL parsing test:', {
          testToken: testToken ? 'present' : 'none',
          testTokenLength: testToken ? testToken.length : 0,
          testAppId: testAppId,
          tokensMatch: testToken === encodedToken
        });
        
        // Verify we're not accidentally going to Nucleus One
        if (launchUrl.includes('8080')) {
          console.error('❌ ERROR: Launch URL contains port 8080 (Nucleus One) instead of 5174 (Certify One)');
          toast({
            title: 'Configuration Error',
            description: 'Incorrect port configuration detected. Please check environment variables.',
            variant: 'destructive',
          });
          return;
        }
        
                 // Open in new tab using link element method (most reliable)
         console.log('🚀 Opening Certify One in new tab:', launchUrl);
         
         try {
           const link = document.createElement('a');
           link.href = launchUrl;
           link.target = '_blank';
           link.rel = 'noopener noreferrer';
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
           console.log('✅ Certify One opened in new tab successfully');
         } catch (error) {
           console.error('❌ Failed to open in new tab:', error);
           toast({
             title: 'Launch Failed',
             description: 'Failed to open Certify One. Please try again.',
             variant: 'destructive',
           });
           return;
         }
        
        toast({
          title: 'Certify One Launched',
          description: 'Opening Certify One in a new tab...',
        });
      } else {
        // For other apps, you can add their URLs here
        toast({
          title: 'App Launch',
          description: `Launching ${app.name}...`,
        });
      }

    } catch (error) {
      console.error('❌ Launch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to launch application';
      setLaunchError(errorMessage);
      
      toast({
        title: 'Launch Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLaunching(false);
    }
  };

  const handleRefreshUserData = async () => {
    setIsRefreshing(true);
    try {
      await refreshCurrentUser();
      toast({
        title: "Success",
        description: "User data refreshed successfully.",
      });
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh user data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAppIcon = (appId: string) => {
    switch (appId) {
      case 'certify-one':
        return <Shield className="w-8 h-8" />;
      case 'hr-one':
        return <Users className="w-8 h-8" />;
      default:
        return <Settings className="w-8 h-8" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/apps')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Apps
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshUserData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh User Data'}
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              {getAppIcon(appId)}
            </div>
            <CardTitle className="text-2xl">{app.name}</CardTitle>
            <CardDescription className="text-lg">{app.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Category:</span>
                <Badge variant="secondary" className="ml-2">{app.category}</Badge>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Pricing:</span>
                <span className="ml-2">{app.pricing}</span>
              </div>
            </div>

            {launchError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Launch Error</h4>
                <p className="text-sm text-red-700 mb-3">{launchError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLaunchError(null)}
                >
                  Dismiss
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium">Subscription Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {appId === 'certify-one' ? 'Free App - No Subscription Required' : 
                     isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                  </p>
                </div>
                <Badge variant={appId === 'certify-one' ? 'default' : (isSubscribed ? 'default' : 'secondary')}>
                  {appId === 'certify-one' ? 'Free' : (isSubscribed ? 'Active' : 'Inactive')}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium">Your Access</h4>
                  <p className="text-sm text-muted-foreground">
                    {hasAccess ? 'You have access to this app' : 'You do not have access to this app'}
                  </p>
                </div>
                <Badge variant={hasAccess ? 'default' : 'destructive'}>
                  {hasAccess ? 'Access Granted' : 'No Access'}
                </Badge>
              </div>

              {hasAccess && currentUser.appRoles?.[appId] && (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Your Role in {app.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentUser.appRoles[appId] === 'admin' ? 'Administrator' : 'Employee'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {currentUser.appRoles[appId]}
                  </Badge>
                </div>
              )}
            </div>

                                      <div className="flex gap-3">
               <Button
                 onClick={handleLaunchApp}
                 disabled={!hasAccess || isLaunching}
                 className="flex-1"
                 size="lg"
               >
                 {isLaunching ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                     {appId === 'certify-one' ? 'Generating Token...' : 'Launching...'}
                   </>
                 ) : (
                   <>
                     <ExternalLink className="w-4 h-4 mr-2" />
                     Launch {app.name}
                   </>
                 )}
               </Button>
               
               {!hasAccess && (
                 <Button
                   variant="outline"
                   onClick={() => navigate('/dashboard/users')}
                 >
                   Request Access
                 </Button>
               )}
             </div>

            {!isSubscribed && appId !== 'certify-one' && (currentUser.role === 'owner' || currentUser.role === 'admin') && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Subscription Required</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Your company needs to subscribe to {app.name} before users can access it.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard/apps')}
                >
                  Manage Subscriptions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AppPage;