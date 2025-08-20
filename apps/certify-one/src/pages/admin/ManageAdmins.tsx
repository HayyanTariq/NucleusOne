import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, UserCog, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminFormSlideout } from '@/components/Admin/AdminFormSlideout';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';

interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  phoneNumber: string;
}

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}


export const ManageAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch admins from backend on component mount
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Fetching admins from backend...');
        const apiUsers = await authApi.getCompanyUsers('admin');
        console.log('✅ Fetched admins:', apiUsers);
        
        // Transform API response to local Admin interface
        const transformedAdmins: Admin[] = apiUsers.map(apiUser => ({
          id: apiUser.id.toString(),
          firstName: apiUser.firstName,
          lastName: apiUser.lastName,
          email: apiUser.email,
          department: apiUser.department || '',
          status: apiUser.isActive ? 'active' : 'inactive',
          createdAt: apiUser.createdAt.split('T')[0], // Convert ISO date to YYYY-MM-DD format
        }));
        
        setAdmins(transformedAdmins);
      } catch (error) {
        console.error('❌ Failed to fetch admins:', error);
        toast({
          title: "Error",
          description: "Failed to load administrators. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdmins();
  }, [toast]);

  const filteredAdmins = admins.filter(admin =>
    admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (adminId: string) => {
    setAdmins(prev => prev.map(admin => 
      admin.id === adminId 
        ? { ...admin, status: admin.status === 'active' ? 'inactive' : 'active' }
        : admin
    ));
    toast({
      title: "Admin status updated",
      description: "The admin's status has been successfully updated.",
    });
  };

  const handleRemoveAdmin = (adminId: string) => {
    setAdmins(prev => prev.filter(admin => admin.id !== adminId));
    toast({
      title: "Admin removed",
      description: "The admin has been successfully removed.",
    });
  };

  const handleAddAdmin = async (adminData: AdminFormData) => {
    try {
      const apiUser = await authApi.createAdmin(adminData);
      
      // Transform API response to local Admin interface
      const newAdmin: Admin = {
        id: apiUser.id.toString(),
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        email: apiUser.email,
        department: apiUser.department || '',
        status: apiUser.isActive ? 'active' : 'inactive',
        createdAt: apiUser.createdAt.split('T')[0], // Convert ISO date to YYYY-MM-DD format
      };
      
      setAdmins(prev => [...prev, newAdmin]);
      toast({
        title: "Admin created",
        description: `${newAdmin.firstName} ${newAdmin.lastName} has been added as an admin.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create admin.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Admins</h1>
          <p className="text-muted-foreground">
            Add, remove, and manage administrator accounts
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administrator Accounts
          </CardTitle>
          <CardDescription>
            Manage users with administrative privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <UserCog className="h-3 w-3" />
              {filteredAdmins.filter(a => a.status === 'active').length} Active
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading administrators...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {getInitials(admin.firstName, admin.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {admin.firstName} {admin.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{admin.department}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={admin.status === 'active' ? 'default' : 'secondary'}
                      >
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {admin.lastLogin 
                        ? new Date(admin.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleStatus(admin.id)}>
                            {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="text-destructive"
                          >
                            Remove Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && filteredAdmins.length === 0 && (
            <div className="text-center py-8">
              <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No admins found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No admins match your search.' : 'No administrators have been added yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminFormSlideout
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddAdmin}
      />
    </div>
  );
};