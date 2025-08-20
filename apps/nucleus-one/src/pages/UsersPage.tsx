import React, { useState, useMemo, useEffect } from 'react';
import { Users, Plus, Search, MoreHorizontal, UserPlus, Shield, Eye, Trash2, User as UserIcon, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNucleusStore, User } from '@/store/nucleusStore';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddUserDialog } from '@/components/users/AddUserDialog';
import { ManageAccessDialog } from '@/components/users/ManageAccessDialog';
import { ViewProfileDialog } from '@/components/users/ViewProfileDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';


// Department options for filtering
const departmentOptions = [
  { id: 'all', name: 'All Departments', icon: '🏢' },
  { id: 'software_engineering', name: 'Software Engineering', icon: '💻' },
  { id: 'frontend_development', name: 'Frontend Development', icon: '🎨' },
  { id: 'backend_development', name: 'Backend Development', icon: '⚙️' },
  { id: 'mobile_development', name: 'Mobile Development', icon: '📱' },
  { id: 'devops_engineering', name: 'DevOps Engineering', icon: '🚀' },
  { id: 'quality_assurance', name: 'Quality Assurance', icon: '🔍' },
  { id: 'data_science', name: 'Data Science', icon: '📊' },
  { id: 'product_management', name: 'Product Management', icon: '📋' },
  { id: 'ui_ux_design', name: 'UI/UX Design', icon: '🎯' },
  { id: 'sales', name: 'Sales', icon: '📈' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'business_development', name: 'Business Development', icon: '🤝' },
  { id: 'customer_success', name: 'Customer Success', icon: '🎉' },
  { id: 'operations', name: 'Operations', icon: '⚙️' },
  { id: 'project_management', name: 'Project Management', icon: '📅' },
  { id: 'human_resources', name: 'Human Resources', icon: '👥' },
  { id: 'finance', name: 'Finance', icon: '💰' },
  { id: 'legal', name: 'Legal', icon: '⚖️' },
  { id: 'it_support', name: 'IT Support', icon: '🛠️' },
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'content_creation', name: 'Content Creation', icon: '✍️' },
  { id: 'research_development', name: 'Research & Development', icon: '🔬' },
  { id: 'consulting', name: 'Consulting', icon: '💼' },
  { id: 'training', name: 'Training & Development', icon: '🎓' }
];

const UsersPage = () => {
  const { currentUser, users, getUsersByCompany, updateUser, createUser , fetchUsers} = useNucleusStore();
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [userList, setUserList] = useState<User[]>([]);
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0); // Force re-render when profiles update
  const { toast } = useToast();

  // Simple session check - redirect if no user
  if (!currentUser) {
    console.log('❌ No current user, redirecting to login');
    window.location.href = '/login';
    return null;
  }

  // Listen for profile updates to refresh the user list
  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfileUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const getUsers = () => {
    try {
      let allUsers = [];
      if (currentUser?.role === 'super_admin') {
        allUsers = users || [];
      } else if (currentUser?.companyId) {
        allUsers = getUsersByCompany(currentUser.companyId) || [];
      }
      
      console.log('🔍 Debug getUsers:', {
        currentUserRole: currentUser?.role,
        currentUserId: currentUser?.id,
        allUsersCount: allUsers.length,
        allUsers: allUsers.map(u => ({ id: u.id, name: u.name, role: u.role }))
      });
      
      // Filter out owners from the list (except for super_admin who can see all)
      if (currentUser?.role !== 'super_admin') {
        const beforeFilter = allUsers.length;
        allUsers = allUsers.filter(user => user.role?.toLowerCase() !== 'owner');
        const afterFilter = allUsers.length;
        console.log('🔍 Owner filtering:', { beforeFilter, afterFilter, filteredOut: beforeFilter - afterFilter });
      }
      
      return allUsers;
    } catch (error) {
      console.error('Error in getUsers:', error);
      return [];
    }
  };
  
  // Simple API call on mount
  useEffect(() => {
    console.log('🚀 UsersPage: Making API call to fetch users...');
    fetchUsers().catch(error => {
      console.error('❌ UsersPage: Error fetching users:', error);
    });
  }, []); // Fetch on mount

  // Update userList whenever users change
  useEffect(() => {
    try {
      const updatedUserList = getUsers();
      setUserList(updatedUserList);
      
      // Don't add current user as fallback - owners should not see themselves in the list
      // The getUsers() function already handles filtering correctly
    } catch (error) {
      console.error('Error updating user list:', error);
      setUserList([]);
    }
  }, [users, currentUser]);


  
  // Filter users based on search term, role filter, and department filter
  const filteredUsers = useMemo(() => {
    let filtered = userList || [];
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user?.role === roleFilter);
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(user => user?.department === departmentFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [userList, searchTerm, roleFilter, departmentFilter]);


  
  const handleDeactivateUser = (userId: string) => {
    try {
      const userToDeactivate = userList.find(u => u.id === userId);
      if (!userToDeactivate) {
        toast({
          title: "Error",
          description: "User not found.",
          variant: "destructive"
        });
        return;
      }

      // Prevent deactivating yourself
      if (userId === currentUser.id) {
        toast({
          title: "Error",
          description: "You cannot deactivate your own account.",
          variant: "destructive"
        });
        return;
      }

      // Prevent owners from deactivating other owners (only super admin should do this)
      if (currentUser.role === 'owner' && userToDeactivate.role === 'owner') {
        toast({
          title: "Error",
          description: "Owners cannot deactivate other owners.",
          variant: "destructive"
        });
        return;
      }

      updateUser(userId, { isActive: false });
      toast({
        title: "Success",
        description: `${userToDeactivate.name} has been deactivated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate user. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get profile photo from localStorage for a specific user
  const getUserProfilePhoto = (userId: string) => {
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

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'owner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'employee': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {currentUser.role === 'super_admin' ? 'All Users' : 'Team Members'}
            </h1>
            <p className="text-muted-foreground">
              {currentUser.role === 'super_admin' 
                ? 'Manage users across all companies' 
                : 'Manage your team members and their access'
              }
            </p>
          </div>
          {(currentUser.role?.toLowerCase() === 'owner' || currentUser.role?.toLowerCase() === 'admin') && currentUser.companyId && (
            <div className="flex gap-2">

              <AddUserDialog 
                setTrigger={setTrigger}
                companyId={currentUser.companyId} 
                currentUserRole={currentUser.role?.toLowerCase() as 'owner' | 'admin' | 'super_admin'}
              />
            </div>
          )}
        </div>

        {/* User Management Info for Owners/Admins
        {(currentUser.role?.toLowerCase() === 'owner' || currentUser.role?.toLowerCase() === 'admin') && (
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    User Management Permissions
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {currentUser.role === 'owner' 
                      ? 'As an owner, you can create, edit, and delete both admins and employees.'
                      : 'As an admin, you can create, edit, and delete employees only.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}



        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{userList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">{userList.filter(u => u.role === 'admin').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="text-2xl font-bold">{userList.filter(u => u.role === 'employee').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search users..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Department Filter */}
          <Select
            value={departmentFilter}
            onValueChange={setDepartmentFilter}
          >
            <SelectTrigger className="w-48">
              {/* <Building className="w-4 h-4 mr-2" /> */}
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  <div className="flex items-center gap-2">
                    <span>{dept.icon}</span>
                    <span>{dept.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Role Filters */}
          <div className="flex gap-2">
            <Button
              variant={roleFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('all')}
              className="text-xs"
            >
              All
            </Button>
            <Button
              variant={roleFilter === 'admin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('admin')}
              className="text-xs"
            >
              <Shield className="w-3 h-3 mr-1" />
              Admins
            </Button>
            <Button
              variant={roleFilter === 'employee' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('employee')}
              className="text-xs"
            >
              <UserIcon className="w-3 h-3 mr-1" />
              Employees
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredUsers.length === 0 && searchTerm && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h4 className="font-semibold mb-2">No users found</h4>
                  <p className="text-sm">
                    No users match your search criteria. Try adjusting your search terms.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {filteredUsers.length === 0 && !searchTerm && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h4 className="font-semibold mb-2">No users available</h4>
                  <p className="text-sm">
                    {currentUser ? `You are the only user in ${currentUser.companyId ? 'your company' : 'the system'}.` : 'No users found.'}
                  </p>
                  {currentUser && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground">
                        Current user: {currentUser.name} ({currentUser.role})
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {filteredUsers.map((user) => (
            <Card key={user?.id || 'unknown'} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage 
                      src={getUserProfilePhoto(user?.id || '')} 
                      className="object-cover"
                      key={`profile-${user?.id}-${profileUpdateTrigger}`}
                    />
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {getInitials(user?.name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{user?.name || 'Unknown User'}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground capitalize">
                          {user?.role === 'admin' ? 'Admin' : 'Employee'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {user && (
                      <ManageAccessDialog 
                        user={user}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Shield className="w-4 h-4 mr-2" />
                            Manage Access
                          </Button>
                        }
                      />
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setViewProfileUser(user);
                        setViewProfileOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserIcon className="w-4 h-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeactivateUser(user?.id || '')}
                          disabled={user?.id === currentUser?.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {user?.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* View Profile Dialog */}
      <ViewProfileDialog
        user={viewProfileUser}
        open={viewProfileOpen}
        onOpenChange={setViewProfileOpen}
      />
    </DashboardLayout>
  );
};

export default UsersPage;