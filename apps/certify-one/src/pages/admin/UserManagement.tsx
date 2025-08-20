import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Users, UserCheck, Loader2, GraduationCap, Shield, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmployeeFormDialog } from '@/components/Employee/EmployeeFormDialog';
import { TrainingFormSlideout } from '@/components/TrainingForm/TrainingFormSlideout';
import { User } from '@/types/user';
import { TrainingFormData } from '@/types/training';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTraining } from '@/contexts/TrainingContext';
import { authApi } from '@/services/api';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}


export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [isTrainingFormOpen, setIsTrainingFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addTraining } = useTraining();

  // Fetch employees from backend on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        if (user?.isNucleusUser) {
          // For Nucleus users, fetch from Nucleus One API
          console.log('🔄 Fetching employees from Nucleus One API...');
          const nucleusToken = localStorage.getItem('nucleus-app-token');
          
          if (!nucleusToken) {
            throw new Error('No Nucleus token found');
          }
          
          // Fetch users from Nucleus One API
          const response = await fetch(`${import.meta.env.VITE_NUCLEUS_ONE_URL || 'https://localhost:7296'}/api/users`, {
            headers: {
              'Authorization': `Bearer ${nucleusToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch users from Nucleus One');
          }
          
          const result = await response.json();
          const nucleusUsers = result.data || result;
          
                     // Filter users who have access to Certify One (exclude owners)
           const certifyOneUsers = nucleusUsers.filter((nucleusUser: any) => {
             const hasAccess = nucleusUser.appAccess && nucleusUser.appAccess['certify-one'];
             const isNotOwner = nucleusUser.role?.toLowerCase() !== 'owner';
             return hasAccess && isNotOwner;
           });
          
          console.log('✅ Fetched Certify One users:', certifyOneUsers);
          
          // Transform Nucleus users to local User interface
          const transformedUsers: User[] = certifyOneUsers.map((nucleusUser: any) => {
            const [firstName, ...lastNameParts] = (nucleusUser.name || '').split(' ');
            const lastName = lastNameParts.join(' ') || '';
            
            return {
              id: nucleusUser.id.toString(),
              firstName: firstName || nucleusUser.email.split('@')[0],
              lastName: lastName,
              email: nucleusUser.email,
              role: nucleusUser.appRoles?.['certify-one'] || 'employee',
              department: nucleusUser.department || '',
              position: nucleusUser.jobTitle || '',
              phone: '',
              emergencyContact: {
                name: '',
                relationship: '',
                phone: ''
              },
              address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
              },
              employmentDetails: {
                employeeId: '',
                startDate: nucleusUser.createdAt?.split('T')[0] || '',
                manager: '',
                salary: 0,
                employmentType: 'full-time'
              },
              status: 'active', // All Nucleus users with access are active
              lastLogin: nucleusUser.lastLoginAt,
              isFirstLogin: false,
              createdAt: nucleusUser.createdAt || new Date().toISOString(),
              updatedAt: nucleusUser.updatedAt || new Date().toISOString(),
              // Nucleus One specific fields
              nucleusUserId: nucleusUser.id,
              appRole: nucleusUser.appRoles?.['certify-one'],
              hasCertifyOneAccess: nucleusUser.appAccess?.['certify-one'] || false
            };
          });
          
          setUsers(transformedUsers);
        } else {
          // For regular Certify One users, use existing logic
          console.log('🔄 Fetching employees from Certify One backend...');
          const apiUsers = await authApi.getCompanyUsers('employee');
          console.log('✅ Fetched employees:', apiUsers);
          
          // Transform API response to local User interface
          const transformedUsers: User[] = apiUsers.map(apiUser => ({
            id: apiUser.id.toString(),
            firstName: apiUser.firstName,
            lastName: apiUser.lastName,
            email: apiUser.email,
            role: 'employee',
            department: apiUser.department || '',
            position: apiUser.position || '',
            phone: apiUser.phoneNumber || '',
            emergencyContact: {
              name: '',
              relationship: '',
              phone: ''
            },
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            },
            employmentDetails: {
              employeeId: '',
              startDate: apiUser.createdAt.split('T')[0],
              manager: '',
              salary: 0,
              employmentType: 'full-time'
            },
            status: 'inactive', // Default to inactive as requested
            lastLogin: apiUser.lastLogin || undefined,
            isFirstLogin: apiUser.isFirstLogin || false,
            createdAt: apiUser.createdAt,
            updatedAt: apiUser.createdAt
          }));
          
          setUsers(transformedUsers);
        }
      } catch (error) {
        console.error('❌ Failed to fetch employees:', error);
        toast({
          title: "Error",
          description: "Failed to load employees. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
  }, [toast, user?.isNucleusUser]);

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    toast({
      title: "Employee status updated",
      description: "The employee's status has been successfully updated.",
    });
  };

  const handleRemoveEmployee = async (userId: string) => {
    if (user?.isNucleusUser) {
      // For Nucleus users, revoke Certify One access
      try {
        const nucleusToken = localStorage.getItem('nucleus-app-token');
        if (!nucleusToken) {
          throw new Error('No Nucleus token found');
        }
        
        const response = await fetch(`${import.meta.env.VITE_NUCLEUS_ONE_URL || 'http://localhost:8080'}/api/UserAppAccess/revoke`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${nucleusToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            appId: 'certify-one'
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to revoke access');
        }
        
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast({
          title: "Access revoked",
          description: "Certify One access has been revoked for this employee.",
        });
      } catch (error) {
        console.error('Failed to revoke access:', error);
        toast({
          title: "Error",
          description: "Failed to revoke access. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // For regular Certify One users
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "Employee removed",
        description: "The employee has been successfully removed.",
      });
    }
  };

  const handleAddEmployee = async (employeeData: EmployeeFormData) => {
    console.log('🔄 handleAddEmployee called with data:', employeeData);
    setIsLoading(true);
    try {
      console.log('📡 Calling authApi.createEmployee...');
      const apiUser = await authApi.createEmployee(employeeData);
      console.log('✅ API Response:', apiUser);
      
      // Transform API response to a User object
      const newEmployee: User = {
        id: apiUser.id.toString(),
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        email: apiUser.email,
        role: 'employee',
        department: apiUser.department || '',
        position: apiUser.position || '',
        phone: apiUser.phoneNumber || '',
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        employmentDetails: {
          employeeId: '',
          startDate: '',
          manager: '',
          salary: 0,
          employmentType: 'full-time'
        },
        status: 'inactive', // Default to inactive as requested
        lastLogin: undefined,
        isFirstLogin: true,
        createdAt: apiUser.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      setUsers(prev => [...prev, newEmployee]);
      toast({
        title: "Employee created",
        description: `${newEmployee.firstName} ${newEmployee.lastName} has been added as an employee.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create employee.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrainingForEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    setIsTrainingFormOpen(true);
  };

  const handleAddTraining = async (data: TrainingFormData) => {
    if (!selectedEmployee) return;
    
    setIsLoading(true);
    try {
      // Pre-fill employee data
      const trainingData = {
        ...data,
        employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        role: selectedEmployee.position,
        department: selectedEmployee.department,
        companyName: user?.companyName || ''
      };
      
      await addTraining(trainingData);
      toast({
        title: "Training Added",
        description: `Training for ${selectedEmployee.firstName} ${selectedEmployee.lastName} has been added successfully.`,
      });
      setIsTrainingFormOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add training. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTrainingForm = () => {
    setIsTrainingFormOpen(false);
    setSelectedEmployee(null);
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'employee') => {
    if (user?.isNucleusUser) {
      try {
        const nucleusToken = localStorage.getItem('nucleus-app-token');
        if (!nucleusToken) {
          throw new Error('No Nucleus token found');
        }
        
        const response = await fetch(`${import.meta.env.VITE_NUCLEUS_ONE_URL || 'http://localhost:8080'}/api/UserAppAccess/grant`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${nucleusToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            appId: 'certify-one',
            hasAccess: true,
            appRole: newRole
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update role');
        }
        
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, role: newRole, appRole: newRole }
            : user
        ));
        
        toast({
          title: "Role updated",
          description: `User role has been changed to ${newRole}.`,
        });
      } catch (error) {
        console.error('Failed to update role:', error);
        toast({
          title: "Error",
          description: "Failed to update role. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
      
        {!user?.isNucleusUser && (
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsEmployeeFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {user?.isNucleusUser ? 'Employees' : 'Employee Accounts'}
          </CardTitle>
          <CardDescription>
            {user?.isNucleusUser 
              ? 'Employees from your company who have access to Certify One'
              : 'Manage users with employee privileges'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={user?.isNucleusUser ? "Search Certify One users..." : "Search employees..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              {filteredUsers.filter(u => u.status === 'active').length} Active
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading employees...</span>
            </div>
          ) : (
            <div className="rounded-md border">
                              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredUsers.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {getInitials(employee.firstName, employee.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {employee.appRole || 'Employee'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.lastLogin ? (
                            <>
                              <div>{new Date(employee.lastLogin).toLocaleDateString()}</div>
                              <div className="text-muted-foreground text-xs">
                                {new Date(employee.lastLogin).toLocaleTimeString()}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          {user?.isNucleusUser && employee.appRole === 'employee' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeRole(employee.id, 'admin')}
                              className="h-8 text-xs w-32"
                            >
                              <Shield className="mr-1 h-3 w-3" />
                              Make Admin
                            </Button>
                          )}
                          {user?.isNucleusUser && employee.appRole === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeRole(employee.id, 'employee')}
                              className="h-8 text-xs w-32"
                            >
                              <UserX className="mr-1 h-3 w-3" />
                              Make Employee
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveEmployee(employee.id)}
                            className="h-8 text-xs text-destructive hover:text-destructive"
                          >
                            {user?.isNucleusUser ? 'Revoke Access' : 'Remove'}
                          </Button>
                          {user?.role === 'owner' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddTrainingForEmployee(employee)}
                              className="h-8 text-xs"
                            >
                              <GraduationCap className="mr-1 h-3 w-3" />
                              Add Training
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {user?.isNucleusUser ? 'No Certify One users found' : 'No employees found'}
              </h3>
              <p className="text-muted-foreground">
                {user?.isNucleusUser 
                  ? (searchTerm ? 'No Certify One users match your search.' : 'No users from your company have access to Certify One yet.')
                  : (searchTerm ? 'No employees match your search.' : 'No employees have been added yet.')
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeFormDialog
        isOpen={isEmployeeFormOpen}
        onClose={() => setIsEmployeeFormOpen(false)}
        onSubmit={handleAddEmployee}
      />

      <TrainingFormSlideout
        isOpen={isTrainingFormOpen}
        onClose={handleCloseTrainingForm}
        onSubmit={handleAddTraining}
        isLoading={isLoading}
                  initialData={selectedEmployee ? {
            type: 'session',
            employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
          } : undefined}
      />
    </div>
  );
};