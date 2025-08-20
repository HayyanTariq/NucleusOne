import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserFormData } from '@/types/user';
import { Save, X, Loader2, User as UserIcon, MapPin, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const userFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'employee']),
  department: z.string().min(2, 'Department is required'),
  position: z.string().min(2, 'Position is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  country: z.string().min(2, 'Country is required'),
  employeeId: z.string().min(3, 'Employee ID is required'),
  startDate: z.string().min(1, 'Start date is required'),
  manager: z.string().min(2, 'Manager is required'),
  salary: z.number().min(0, 'Salary must be a positive number'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'intern']),
  status: z.enum(['active', 'inactive']),
});

interface UserFormSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingUser?: User | null;
  isLoading?: boolean;
}

export const UserFormSlideout: React.FC<UserFormSlideoutProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  isLoading = false,
}) => {
  const { toast } = useToast();
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'employee',
      department: '',
      position: '',
      phone: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      employeeId: '',
      startDate: '',
      manager: '',
      salary: 0,
      employmentType: 'full-time',
      status: 'active',
    },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        role: editingUser.role,
        department: editingUser.department,
        position: editingUser.position,
        phone: editingUser.phone,
        emergencyContactName: editingUser.emergencyContact.name,
        emergencyContactRelationship: editingUser.emergencyContact.relationship,
        emergencyContactPhone: editingUser.emergencyContact.phone,
        street: editingUser.address.street,
        city: editingUser.address.city,
        state: editingUser.address.state,
        zipCode: editingUser.address.zipCode,
        country: editingUser.address.country,
        employeeId: editingUser.employmentDetails.employeeId,
        startDate: editingUser.employmentDetails.startDate,
        manager: editingUser.employmentDetails.manager,
        salary: editingUser.employmentDetails.salary,
        employmentType: editingUser.employmentDetails.employmentType,
        status: editingUser.status,
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        role: 'employee',
        department: '',
        position: '',
        phone: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        employeeId: '',
        startDate: '',
        manager: '',
        salary: 0,
        employmentType: 'full-time',
        status: 'active',
      });
    }
  }, [editingUser, form]);

  const handleSubmit = async (data: UserFormData) => {
    const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      department: data.department,
      position: data.position,
      phone: data.phone,
      emergencyContact: {
        name: data.emergencyContactName,
        relationship: data.emergencyContactRelationship,
        phone: data.emergencyContactPhone,
      },
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      },
      employmentDetails: {
        employeeId: data.employeeId,
        startDate: data.startDate,
        manager: data.manager,
        salary: data.salary,
        employmentType: data.employmentType,
      },
      status: data.status,
    };

    try {
      await onSubmit(userData);
      toast({
        title: "User Saved Successfully",
        description: `${data.firstName} ${data.lastName} has been ${editingUser ? 'updated' : 'added'} to the system.`,
        variant: "default",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserIcon className="h-5 w-5" />
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {editingUser 
              ? 'Update user information and professional details.'
              : 'Enter personal and professional details for the new user.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
              <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-success/5 rounded-lg p-4 mb-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-background/80 backdrop-blur-sm">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Personal & Emergency
                    </TabsTrigger>
                    <TabsTrigger value="professional" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Professional Data
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-6 mt-6">
                    <Card className="border-0 shadow-md bg-background/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <UserIcon className="h-5 w-5 text-primary" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-background/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MapPin className="h-5 w-5 text-primary" />
                          Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Zip Code *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-background/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Phone className="h-5 w-5 text-primary" />
                          Emergency Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact Name *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="emergencyContactRelationship"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., Spouse, Parent, Sibling" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Phone *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="professional" className="space-y-6 mt-6">
                    <Card className="border-0 shadow-md bg-background/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Phone className="h-5 w-5 text-primary" />
                          Professional Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Employee ID *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="employee">Employee</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="manager"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Manager *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="employmentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Employment Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="full-time">Full Time</SelectItem>
                                    <SelectItem value="part-time">Part Time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="intern">Intern</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="salary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Annual Salary *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-end space-x-3 pt-6 bg-background/80 backdrop-blur-sm border-t p-4 -mx-6 -mb-6 rounded-b-lg">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} variant="gradient">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingUser ? 'Update User' : 'Add User'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};