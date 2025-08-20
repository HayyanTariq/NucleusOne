import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Briefcase, Shield, ShoppingBag, X, Calendar, MapPin, FileText, Heart, Phone, Users, AlertTriangle, Info, Contact, Settings, Activity } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User as UserType, ProfileDetails, ApiService } from '@/store/nucleusStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ViewProfileDialogProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewProfileDialog({ user, open, onOpenChange }: ViewProfileDialogProps) {
  const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<{ isComplete: boolean; percentage: number } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch profile details when dialog opens
  useEffect(() => {
    if (open && user?.id) {
      fetchProfileDetails();
      fetchProfileCompletion();
    }
  }, [open, user?.id]);

  if (!user) return null;

  const fetchProfileDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ApiService.getUserProfile(user.id);
      if (result.success) {
        setProfileDetails(result.data.profileDetails);
        setProfileCompletion({
          isComplete: result.data.isProfileComplete,
          percentage: result.data.completionPercentage
        });
      } else {
        setError('Failed to load profile details');
      }
    } catch (err) {
      setError('Error loading profile details');
      console.error('Error fetching profile details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfileCompletion = async () => {
    try {
      const result = await ApiService.getProfileCompletion(user.id);
      if (result.success) {
        setProfileCompletion({
          isComplete: result.data.isProfileComplete,
          percentage: result.data.completionPercentage
        });
      }
    } catch (err) {
      console.error('Error fetching profile completion:', err);
    }
  };

  // Get profile photo from backend or localStorage fallback
  const getUserProfilePhoto = (userId: string) => {
    // Try backend first
    if (profileDetails?.profilePhotoUrl) {
      return profileDetails.profilePhotoUrl;
    }
    
    // Fallback to localStorage
    try {
      const savedProfile = localStorage.getItem(`profile-${userId}`);
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        return profileData.profilePhoto || null;
      }
    } catch (error) {
      console.error('Error reading profile photo:', error);
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={getUserProfilePhoto(user.id)} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-primary text-white font-semibold text-xl">
                  {getInitials(user.name || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {user.role === 'admin' ? 'Administrator' : 
                     user.role === 'employee' ? 'Employee' : 
                     user.role === 'owner' ? 'Owner' : 
                     user.role === 'super_admin' ? 'System Administrator' : 
                     user.role}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-muted-foreground">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          {/* Horizontal Tabs */}
          <div className="px-6 py-4 border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-muted">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center gap-2">
                  <Contact className="w-4 h-4" />
                  <span className="hidden sm:inline">Emergency</span>
                </TabsTrigger>
                <TabsTrigger value="access" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Access</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Status</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="m-0 p-6">
                  <OverviewTab user={user} profileDetails={profileDetails} profileCompletion={profileCompletion} isLoading={isLoading} error={error} />
                </TabsContent>
                <TabsContent value="personal" className="m-0 p-6">
                  <PersonalDetailsTab profileDetails={profileDetails} />
                </TabsContent>
                <TabsContent value="emergency" className="m-0 p-6">
                  <EmergencyContactTab profileDetails={profileDetails} />
                </TabsContent>
                <TabsContent value="access" className="m-0 p-6">
                  <AccessTab user={user} />
                </TabsContent>
                <TabsContent value="activity" className="m-0 p-6">
                  <ActivityTab user={user} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Tab Components
const OverviewTab = ({ user, profileDetails, profileCompletion, isLoading, error }: any) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Overview</h3>
        
        {/* Profile Completion Status */}
        {profileCompletion && (
          <Card className={profileCompletion.isComplete ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-orange-200 bg-orange-50 dark:bg-orange-950/20"}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${profileCompletion.isComplete ? 'bg-green-500' : 'bg-orange-500'}`}>
                    {profileCompletion.isComplete ? (
                      <User className="w-6 h-6 text-white" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {profileCompletion.isComplete ? 'Profile Complete' : 'Profile Incomplete'}
                    </p>
                    <p className="text-muted-foreground">
                      {profileCompletion.percentage}% of profile information completed
                    </p>
                  </div>
                </div>
                <Badge variant={profileCompletion.isComplete ? "default" : "secondary"} className="text-lg px-4 py-2 self-start sm:self-center">
                  {profileCompletion.percentage}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium break-all">{user.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-muted-foreground">Department:</span>
                <span className="text-sm font-medium">{user.department || 'Not specified'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-muted-foreground">Job Title:</span>
                <span className="text-sm font-medium">{user.jobTitle || 'Not specified'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-muted-foreground">Gender:</span>
                <span className="text-sm font-medium">{profileDetails?.gender || 'Not specified'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-muted-foreground">Nationality:</span>
                <span className="text-sm font-medium">{profileDetails?.nationality || 'Not specified'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-muted-foreground">Date of Birth:</span>
                <span className="text-sm font-medium">{formatDate(profileDetails?.dateOfBirth)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const PersonalDetailsTab = ({ profileDetails }: any) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium truncate">{profileDetails?.gender || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">CNIC</p>
                  <p className="font-medium break-all">{profileDetails?.cnic || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium truncate">{profileDetails?.nationality || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium truncate">{formatDate(profileDetails?.dateOfBirth)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Health Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium truncate">{profileDetails?.bloodGroup || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Marital Status</p>
                  <p className="font-medium truncate">{profileDetails?.maritalStatus || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Medical Condition</p>
                  <p className="font-medium break-words">{profileDetails?.medicalCondition || 'None'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const EmergencyContactTab = ({ profileDetails }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next of Kin Information</CardTitle>
            <CardDescription>Emergency contact details for this employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Next of Kin Name</p>
                <p className="font-medium break-words">{profileDetails?.nextOfKinName || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p className="font-medium break-words">{profileDetails?.nextOfKinRelationship || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium break-all">{profileDetails?.nextOfKinContactNumber || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AccessTab = ({ user }: any) => {
  return (
    <div className="space-y-6">
           <div>
        <h3 className="text-lg font-semibold mb-4">Access & Permissions</h3>
        
             {user.appAccess && Object.keys(user.appAccess).length > 0 ? (
          <div className="space-y-4">
                 {Object.entries(user.appAccess).map(([appId, hasAccess], index) => {
                   if (!hasAccess) return null;
                   const appRole = user.appRoles?.[appId] || 'employee';
                   return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                             {appId.charAt(0).toUpperCase()}
                           </span>
                         </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold capitalize text-lg truncate">
                             {appId.replace('-', ' ')}
                           </p>
                          <p className="text-muted-foreground">
                             Access granted
                           </p>
                         </div>
                       </div>
                      <Badge variant="outline" className="capitalize text-sm self-start sm:self-center">
                          {appRole === 'admin' ? 'Administrator' : 'Employee'}
                      </Badge>
                     </div>
                  </CardContent>
                </Card>
                   );
                 })}
               </div>
             ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">No application access granted</p>
              <p className="text-sm text-muted-foreground mt-2">This user doesn't have access to any applications</p>
            </CardContent>
          </Card>
             )}
           </div>
    </div>
  );
};

const ActivityTab = ({ user }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Account Status</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge variant="outline" className="capitalize self-start sm:self-center">
                  {user.role === 'admin' ? 'Administrator' : 
                   user.role === 'employee' ? 'Employee' : 
                   user.role === 'owner' ? 'Owner' : 
                   user.role === 'super_admin' ? 'System Administrator' : 
                   user.role}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm text-muted-foreground">Member Since:</span>
                <span className="text-sm font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
        </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm text-muted-foreground">Department:</span>
                <span className="text-sm font-medium break-words">{user.department || 'Not assigned'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm text-muted-foreground">Job Title:</span>
                <span className="text-sm font-medium break-words">{user.jobTitle || 'Not specified'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm text-muted-foreground">Last Login:</span>
                <span className="text-sm font-medium">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
