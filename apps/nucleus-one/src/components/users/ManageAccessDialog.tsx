import { useState, useEffect } from 'react';
import { Shield, Check, X, Eye, EyeOff, UserCog, Crown, User as UserIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNucleusStore, User, App } from '@/store/nucleusStore';
import { useToast } from '@/hooks/use-toast';

interface ManageAccessDialogProps {
  user: User;
  trigger: React.ReactNode;
}

export function ManageAccessDialog({ user, trigger }: ManageAccessDialogProps) {
  const [open, setOpen] = useState(false);
  const [appAccess, setAppAccess] = useState<Record<string, boolean>>({});
  const [appRoles, setAppRoles] = useState<Record<string, 'admin' | 'employee'>>({});
  
  const { apps, getCompanyApps, grantAppAccess, revokeAppAccess, setAppRole, removeAppRole, currentUser, refreshCurrentUser } = useNucleusStore();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setAppAccess({ ...user.appAccess });
      // Initialize app roles - default to 'employee' if no role is set
      const initialRoles: Record<string, 'admin' | 'employee'> = {};
      Object.keys(user.appAccess || {}).forEach(appId => {
        initialRoles[appId] = user.appRoles?.[appId] || 'employee';
      });
      setAppRoles(initialRoles);
    }
  }, [open, user.appAccess, user.appRoles]);

  // Show Certify One as available for all companies (since it's free)
  // and any other apps the company has subscribed to
  const companyApps = user.companyId ? getCompanyApps(user.companyId) : [];
  const certifyOne = apps.find(app => app.id === 'certify-one');
  const availableApps = certifyOne ? [certifyOne, ...companyApps.filter(app => app.id !== 'certify-one')] : companyApps;



  const handleAccessToggle = (appId: string, hasAccess: boolean) => {
    setAppAccess(prev => ({ ...prev, [appId]: hasAccess }));
    // When granting access, set default role to employee if not already set
    if (hasAccess && !appRoles[appId]) {
      setAppRoles(prev => ({ ...prev, [appId]: 'employee' }));
    }
  };

  const handleRoleChange = (appId: string, role: 'admin' | 'employee') => {
    setAppRoles(prev => ({ ...prev, [appId]: role }));
  };

  const handleSave = async () => {
    try {
      // Apply access changes
      for (const [appId, hasAccess] of Object.entries(appAccess)) {
        const currentAccess = user.appAccess[appId] || false;
        
        if (hasAccess !== currentAccess) {
          if (hasAccess) {
            await grantAppAccess(user.id, appId);
            // Set the role when granting access
            await setAppRole(user.id, appId, appRoles[appId] || 'employee');
          } else {
            await revokeAppAccess(user.id, appId);
            // Remove the role when revoking access
            await removeAppRole(user.id, appId);
          }
        } else if (hasAccess) {
          // If access is already granted, check if role needs to be updated
          const currentRole = user.appRoles?.[appId];
          const newRole = appRoles[appId];
          if (currentRole !== newRole) {
            await setAppRole(user.id, appId, newRole);
          }
        }
      }

      // Refresh current user data if the updated user is the current user
      if (currentUser && currentUser.id === user.id) {
        console.log('🔄 Refreshing current user data after role change...');
        await refreshCurrentUser();
      }

      toast({
        title: "Success",
        description: `App access and roles updated for ${user.name}.`,
      });

      setOpen(false);
    } catch (error) {
      console.error('Failed to update app access:', error);
      toast({
        title: "Error",
        description: "Failed to update app access. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getAppIcon = (iconName: string) => {
    // Map icon names to actual components or emojis
    const iconMap: Record<string, string> = {
      'Users': '👥',
      'Award': '🏆',
      'UserCheck': '✅',
      'ShoppingCart': '🛒',
      'Clock': '⏰',
      'DollarSign': '💰',
      'FolderOpen': '📁'
    };
    return iconMap[iconName] || '📱';
  };

  const hasChanges = JSON.stringify(appAccess) !== JSON.stringify(user.appAccess);
  const totalApps = availableApps.length;
  const grantedApps = Object.values(appAccess).filter(Boolean).length;

  if (!currentUser || !['owner', 'admin'].includes(currentUser.role?.toLowerCase())) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Manage App Access - {user.name}
          </DialogTitle>
          <DialogDescription>
            Control which applications {user.name} can access within your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Access Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Access Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{grantedApps}</div>
                    <div className="text-xs text-muted-foreground">Granted</div>
                  </div>
                  <div className="text-muted-foreground">/</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalApps}</div>
                    <div className="text-xs text-muted-foreground">Total Apps</div>
                  </div>
                </div>
                <Badge 
                  variant={grantedApps > 0 ? "default" : "secondary"}
                  className="ml-4"
                >
                  {grantedApps === 0 ? 'No Access' : 
                   grantedApps === totalApps ? 'Full Access' : 'Partial Access'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* App Access Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Application Access</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allGranted = availableApps.reduce((acc, app) => {
                      acc[app.id] = true;
                      return acc;
                    }, {} as Record<string, boolean>);
                    const allRoles = availableApps.reduce((acc, app) => {
                      acc[app.id] = 'employee';
                      return acc;
                    }, {} as Record<string, 'admin' | 'employee'>);
                    setAppAccess(allGranted);
                    setAppRoles(allRoles);
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Grant All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allRevoked = availableApps.reduce((acc, app) => {
                      acc[app.id] = false;
                      return acc;
                    }, {} as Record<string, boolean>);
                    setAppAccess(allRevoked);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Revoke All
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {availableApps.map((app) => {
                const hasAccess = appAccess[app.id] || false;
                
                return (
                  <Card key={app.id} className={`transition-all ${hasAccess ? 'border-primary/50 bg-primary/5' : ''}`}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* App Header and Access Toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                              <span className="text-lg">{getAppIcon(app.icon)}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{app.name}</h4>
                              <p className="text-sm text-muted-foreground">{app.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {app.category}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {app.pricing}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {hasAccess ? (
                                <Eye className="w-4 h-4 text-primary" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                              <Label htmlFor={`access-${app.id}`} className="text-sm">
                                {hasAccess ? 'Access Granted' : 'No Access'}
                              </Label>
                            </div>
                            <Switch
                              id={`access-${app.id}`}
                              checked={hasAccess}
                              onCheckedChange={(checked) => handleAccessToggle(app.id, checked)}
                            />
                          </div>
                        </div>

                        {/* Role Selection - Only shown when access is granted */}
                        {hasAccess && (
                          <div className="border-t pt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <UserCog className="w-4 h-4 text-muted-foreground" />
                              <h5 className="text-sm font-medium">
                                Select {user.name}'s role in {app.name}
                              </h5>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">
                              Choose the appropriate permission level for this user within the application.
                            </p>
                            
                            <RadioGroup
                              value={appRoles[app.id] || 'employee'}
                              onValueChange={(value: 'admin' | 'employee') => handleRoleChange(app.id, value)}
                              className="space-y-3"
                            >
                              {/* Employee Role Option */}
                              <div className="space-y-2">
                                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                  <RadioGroupItem value="employee" id={`employee-${app.id}`} className="mt-1" />
                                  <div className="flex-1">
                                    <Label 
                                      htmlFor={`employee-${app.id}`} 
                                      className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                                    >
                                      <UserIcon className="w-4 h-4 text-blue-600" />
                                      Employee Role
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Standard user access with basic features and functionality. Can view and use the application but cannot manage other users or system settings.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Admin Role Option */}
                              <div className="space-y-2">
                                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                  <RadioGroupItem value="admin" id={`admin-${app.id}`} className="mt-1" />
                                  <div className="flex-1">
                                    <Label 
                                      htmlFor={`admin-${app.id}`} 
                                      className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                                    >
                                      <Crown className="w-4 h-4 text-amber-600" />
                                      Administration Role
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Full administrative access including user management, system configuration, and advanced features. Can manage other users within this application.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {availableApps.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h4 className="font-semibold mb-2">No Apps Available</h4>
                    <p className="text-sm">
                      This company has not subscribed to any applications yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
