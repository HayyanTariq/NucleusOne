import { useState, useEffect, useRef } from 'react';
import { User, Camera, Edit, Save, X, Phone, Heart, Calendar, MapPin, FileText, Users, AlertTriangle, Crop, RotateCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useNucleusStore, ApiService, ProfileDetails } from '@/store/nucleusStore';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface ProfileData {
  profilePhoto?: string;
  gender?: string;
  cnic?: string;
  nationality?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  medicalCondition?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinContact?: string;
}

// Profile Photo Component
const ProfilePhotoSection = ({ currentUser, profileData, isEditing, handlePhotoUpload, getInitials, setProfileData }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev: any) => ({
          ...prev,
          profilePhoto: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 ease-out">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Photo
          </CardTitle>
          <CardDescription>
            Upload and manage your profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profileData.profilePhoto} className="object-cover" />
                <AvatarFallback className="text-2xl">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Action buttons below profile picture */}
            {isEditing && (
              <div className="flex items-center gap-3">
                <label className="bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-5 h-5" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {profileData.profilePhoto && (
                  <button
                    onClick={() => {
                      // Simple crop functionality - just re-upload
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    className="bg-secondary text-secondary-foreground rounded-full p-3 cursor-pointer hover:bg-secondary/90 transition-colors"
                    title="Change Photo"
                  >
                    <Crop className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-semibold">{currentUser.name}</h3>
              <p className="text-muted-foreground">{currentUser.email}</p>
              <Badge className="mt-3 text-sm">{currentUser.role.replace('_', ' ')}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Personal Details Component
const PersonalDetailsSection = ({ profileData, isEditing, setProfileData }: any) => {
  return (
    <div className="animate-in slide-in-from-right-4 duration-300 ease-out">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Details
          </CardTitle>
          <CardDescription>
            Your personal information and identification details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            // Edit Mode - Show Input Fields
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={profileData.gender} onValueChange={(value) => setProfileData((prev: any) => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC *</Label>
                  <p className="text-xs text-muted-foreground">Format: 00000-0000000-0</p>
                  <Input
                    id="cnic"
                    placeholder="00000-0000000-0"
                    value={profileData.cnic || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 13) value = value.slice(0, 13);
                      if (value.length >= 5) {
                        value = value.slice(0, 5) + '-' + value.slice(5);
                      }
                      if (value.length >= 13) {
                        value = value.slice(0, 13) + '-' + value.slice(13);
                      }
                      setProfileData((prev: any) => ({ ...prev, cnic: value }));
                    }}
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    placeholder="e.g., Pakistani"
                    value={profileData.nationality || ''}
                    onChange={(e) => setProfileData((prev: any) => ({ ...prev, nationality: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <p className="text-xs text-muted-foreground">Must be 18 years or older</p>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth || ''}
                    max={(() => {
                      const today = new Date();
                      const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                      return maxDate.toISOString().split('T')[0];
                    })()}
                    onChange={(e) => setProfileData((prev: any) => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group *</Label>
                  <Select value={profileData.bloodGroup} onValueChange={(value) => setProfileData((prev: any) => ({ ...prev, bloodGroup: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status *</Label>
                  <Select value={profileData.maritalStatus} onValueChange={(value) => setProfileData((prev: any) => ({ ...prev, maritalStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalCondition">Medical Condition (if any)</Label>
                <Textarea
                  id="medicalCondition"
                  placeholder="Any medical conditions, allergies, or special requirements..."
                  value={profileData.medicalCondition || ''}
                  onChange={(e) => setProfileData((prev: any) => ({ ...prev, medicalCondition: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
          ) : (
            // Preview Mode - Show Interactive Cards
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CNIC</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileData.cnic || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileData.nationality || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4">
                    <Heart className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileData.bloodGroup || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Marital Status</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileData.maritalStatus ? profileData.maritalStatus.charAt(0).toUpperCase() + profileData.maritalStatus.slice(1) : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {profileData.medicalCondition && (
                <div className="flex items-start p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4 mt-1">
                    <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Medical Condition</p>
                    <p className="text-base text-foreground">
                      {profileData.medicalCondition}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Emergency Contact Component
const EmergencyContactSection = ({ profileData, isEditing, setProfileData }: any) => {
  return (
    <div className="animate-in slide-in-from-right-4 duration-300 ease-out">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contact
          </CardTitle>
          <CardDescription>
            Next of kin information for emergency situations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            // Edit Mode - Show Input Fields
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nextOfKinName">Next of Kin Name *</Label>
                  <Input
                    id="nextOfKinName"
                    placeholder="Full name"
                    value={profileData.nextOfKinName || ''}
                    onChange={(e) => setProfileData((prev: any) => ({ ...prev, nextOfKinName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextOfKinRelationship">Relationship *</Label>
                  <Select value={profileData.nextOfKinRelationship} onValueChange={(value) => setProfileData((prev: any) => ({ ...prev, nextOfKinRelationship: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nextOfKinContact">Contact Number *</Label>
                  <p className="text-xs text-muted-foreground">Format: +923001234567</p>
                  <Input
                    id="nextOfKinContact"
                    placeholder="+923001234567"
                    value={profileData.nextOfKinContact || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d+]/g, '');
                      if (value.length > 16) value = value.slice(0, 16);
                      if (value && !value.startsWith('+')) {
                        value = '+' + value;
                      }
                      setProfileData((prev: any) => ({ ...prev, nextOfKinContact: value }));
                    }}
                    maxLength={16}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Preview Mode - Show Interactive Cards
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Next of Kin Name</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileData.nextOfKinName || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileData.nextOfKinRelationship ? profileData.nextOfKinRelationship.charAt(0).toUpperCase() + profileData.nextOfKinRelationship.slice(1) : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-4">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                  <p className="text-lg font-semibold text-foreground">
                    {profileData.nextOfKinContact || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main Profile Page Component
const ProfilePage = () => {
  const { currentUser } = useNucleusStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('photo');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load profile data from backend API
  useEffect(() => {
    const loadProfileData = async () => {
      if (currentUser?.id) {
        try {
          const result = await ApiService.getUserProfile(currentUser.id);
          if (result.success && result.data.profileDetails) {
            // Convert ProfileDetails to ProfileData format
            const backendData = result.data.profileDetails;
            const localData: ProfileData = {
              profilePhoto: backendData.profilePhotoUrl,
              gender: backendData.gender,
              cnic: backendData.cnic,
              nationality: backendData.nationality,
              dateOfBirth: backendData.dateOfBirth ? new Date(backendData.dateOfBirth).toISOString().split('T')[0] : undefined,
              bloodGroup: backendData.bloodGroup,
              maritalStatus: backendData.maritalStatus,
              medicalCondition: backendData.medicalCondition,
              nextOfKinName: backendData.nextOfKinName,
              nextOfKinRelationship: backendData.nextOfKinRelationship,
              nextOfKinContact: backendData.nextOfKinContactNumber
            };
            setProfileData(localData);
          } else {
            // Fallback to localStorage if backend fails
            const savedProfile = localStorage.getItem(`profile-${currentUser.id}`);
            if (savedProfile) {
              const localData = JSON.parse(savedProfile);
              // Load profile photo from localStorage
              const savedPhoto = localStorage.getItem(`profile-photo-${currentUser.id}`);
              if (savedPhoto) {
                localData.profilePhoto = savedPhoto;
              }
              setProfileData(localData);
            }
          }
        } catch (error) {
          console.error('Error loading profile from backend:', error);
          // Fallback to localStorage
          const savedProfile = localStorage.getItem(`profile-${currentUser.id}`);
          if (savedProfile) {
            const localData = JSON.parse(savedProfile);
            // Load profile photo from localStorage
            const savedPhoto = localStorage.getItem(`profile-photo-${currentUser.id}`);
            if (savedPhoto) {
              localData.profilePhoto = savedPhoto;
            }
            setProfileData(localData);
          }
        }
      }
    };

    loadProfileData();
  }, [currentUser?.id]);

  // Read section from URL on component mount
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['photo', 'personal', 'emergency'].includes(section)) {
      setActiveTab(section);
    }
  }, [searchParams]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate required fields before sending
      const requiredFields = ['gender', 'cnic', 'nationality', 'dateOfBirth', 'bloodGroup', 'maritalStatus', 'nextOfKinName', 'nextOfKinRelationship', 'nextOfKinContact'];
      const missingFields = requiredFields.filter(field => !profileData[field as keyof ProfileData]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Validate CNIC format (00000-0000000-0)
      const cnicRegex = /^\d{5}-\d{7}-\d$/;
      if (profileData.cnic && !cnicRegex.test(profileData.cnic)) {
        toast({
          title: "Invalid CNIC Format",
          description: "CNIC must be in format: 00000-0000000-0",
          variant: "destructive",
        });
        return;
      }

      // Validate phone number format
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (profileData.nextOfKinContact && !phoneRegex.test(profileData.nextOfKinContact)) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must be in valid format (e.g., +923001234567)",
          variant: "destructive",
        });
        return;
      }

      // Validate age (must be 18+)
      if (profileData.dateOfBirth) {
        const birthDate = new Date(profileData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          toast({
            title: "Age Requirement",
            description: "You must be at least 18 years old",
            variant: "destructive",
          });
          return;
        }
      }

      // Handle profile photo locally (base64 stored in localStorage)
      const photoUrl = profileData.profilePhoto;

      // Convert ProfileData to ProfileDetails format according to backend API specification
      const profileDetails: ProfileDetails = {
        gender: profileData.gender,
        cnic: profileData.cnic,
        nationality: profileData.nationality,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString() : undefined,
        bloodGroup: profileData.bloodGroup,
        maritalStatus: profileData.maritalStatus,
        medicalCondition: profileData.medicalCondition || undefined,
        nextOfKinName: profileData.nextOfKinName,
        nextOfKinRelationship: profileData.nextOfKinRelationship,
        nextOfKinContactNumber: profileData.nextOfKinContact
        // Note: profilePhotoUrl is handled locally, not sent to backend
      };

      // Call backend API to update profile
      console.log('🚀 Sending profile data to backend:', profileDetails);
      const result = await ApiService.updateUserProfile(profileDetails);
      console.log('📡 Backend response:', result);
      
      if (result.success) {
        // Save profile data to localStorage (including photo)
        localStorage.setItem(`profile-${currentUser?.id}`, JSON.stringify(profileData));
        
        // Save profile photo separately for easy access
        if (profileData.profilePhoto) {
          localStorage.setItem(`profile-photo-${currentUser?.id}`, profileData.profilePhoto);
        }
        
        // Trigger a custom event to notify other components about profile update
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: { profileData, userId: currentUser?.id } 
        }));
        
        toast({
          title: "Profile updated successfully",
          description: "Your profile information has been saved.",
        });
        setIsEditing(false);
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to saved data
    const savedProfile = localStorage.getItem(`profile-${currentUser?.id}`);
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    } else {
      setProfileData({});
    }
    setIsEditing(false);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profilePhoto: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCompletionPercentage = () => {
    const fields = [
      'gender', 'cnic', 'nationality', 'dateOfBirth', 'bloodGroup',
      'maritalStatus', 'nextOfKinName', 'nextOfKinRelationship', 'nextOfKinContact'
    ];
    const completedFields = fields.filter(field => profileData[field as keyof ProfileData]);
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();
  const isProfileComplete = completionPercentage === 100;

  const tabs = [
    { id: 'photo', label: 'Profile Photo', icon: User },
    { id: 'personal', label: 'Personal Details', icon: FileText },
    { id: 'emergency', label: 'Emergency Contact', icon: Phone },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without page reload
    navigate(`/dashboard/profile?section=${tabId}`, { replace: true });
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'photo':
        return (
          <ProfilePhotoSection 
            currentUser={currentUser}
            profileData={profileData}
            isEditing={isEditing}
            handlePhotoUpload={handlePhotoUpload}
            getInitials={getInitials}
            setProfileData={setProfileData}
          />
        );
      case 'personal':
        return (
          <PersonalDetailsSection 
            profileData={profileData}
            isEditing={isEditing}
            setProfileData={setProfileData}
          />
        );
      case 'emergency':
        return (
          <EmergencyContactSection 
            profileData={profileData}
            isEditing={isEditing}
            setProfileData={setProfileData}
          />
        );
      default:
        return (
          <ProfilePhotoSection 
            currentUser={currentUser}
            profileData={profileData}
            isEditing={isEditing}
            handlePhotoUpload={handlePhotoUpload}
            getInitials={getInitials}
            setProfileData={setProfileData}
          />
        );
    }
  };

  if (!currentUser) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal and emergency information
            </p>
          </div>
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {isProfileComplete ? 'Edit Profile' : 'Complete Profile'}
            </Button>
          )}
        </div>

        {/* Profile Completion Status */}
        {!isProfileComplete && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      Complete Your Profile
                    </p>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {completionPercentage}%
                    </Badge>
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    Please fill in all required fields to complete your profile.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Edit className="w-4 h-4" />
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Complete Status */}
        {isProfileComplete && !isEditing && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Profile Complete
                    </p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {completionPercentage}%
                    </Badge>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Your profile is complete. You can edit it anytime.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Action Buttons - Show when editing */}
        {isEditing && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Editing Profile
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Make your changes and save when ready.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Profile Tabs */}
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

        {/* Active Profile Component */}
        <div className="min-h-[400px] transition-all duration-300">
          {renderActiveComponent()}
        </div>


      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
