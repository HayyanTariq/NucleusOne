import { useState } from 'react';
import { Plus, User, Shield, Building, Crown } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNucleusStore } from '@/store/nucleusStore';
import { useToast } from '@/hooks/use-toast';

interface AddUserDialogProps {
  companyId: string;
  currentUserRole: 'owner' | 'admin' | 'super_admin';
  setTrigger: (trigger: boolean) => void;
}

const predefinedRoles = [
  {
    id: 'finance',
    name: 'Finance Manager',
    description: 'Manages financial operations and budgets',
    icon: '💰',
    permissions: ['certify-one']
  },
  {
    id: 'team_lead',
    name: 'Team Lead',
    description: 'Leads team projects and manages resources',
    icon: '👥',
    permissions: ['certify-one']
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Manages human resources and recruitment',
    icon: '👤',
    permissions: ['certify-one']
  },
  {
    id: 'operations',
    name: 'Operations Manager',
    description: 'Oversees daily operations and processes',
    icon: '⚙️',
    permissions: ['certify-one']
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Software development and technical tasks',
    icon: '💻',
    permissions: ['certify-one']
  },
  {
    id: 'sales',
    name: 'Sales Representative',
    description: 'Manages sales and customer relationships',
    icon: '📈',
    permissions: ['certify-one']
  }
];

export function AddUserDialog({ companyId, currentUserRole , setTrigger }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as 'admin' | 'employee',
    customRole: '',
    predefinedRole: ''
  });
  
  const { createUser, fetchUsers } = useNucleusStore();
  const { toast } = useToast();

  const availableRoles = currentUserRole === 'owner' ? ['admin', 'employee'] : ['employee'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.predefinedRole) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including the job role template.",
        variant: "destructive"
      });
      return;
    }

    // Validate role format
    if (!['admin', 'employee'].includes(formData.role)) {
      toast({
        title: "Error",
        description: "Invalid role selected. Please choose a valid role.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the user with app access based on predefined role
      const appAccess: Record<string, boolean> = {};
      if (formData.predefinedRole) {
        const roleConfig = predefinedRoles.find(r => r.id === formData.predefinedRole);
        if (roleConfig) {
          roleConfig.permissions.forEach(appId => {
            appAccess[appId] = true;
          });
        }
      }

      const userPayload = {
        name: formData.name,
        email: formData.email,
        role: formData.role as 'admin' | 'employee',
        jobTitle: formData.customRole || undefined,
        department: formData.predefinedRole || undefined,
        appAccess,
        companyId: companyId,
        isActive: true
      };

      console.log('📝 AddUserDialog - Sending payload:', userPayload);
      console.log('🔍 Role debug:', { 
        formDataRole: formData.role, 
        roleType: typeof formData.role, 
        availableRoles, 
        currentUserRole 
      });
      console.log('🧪 Testing role formats:', {
        originalRole: formData.role,
        lowercaseRole: formData.role.toLowerCase(),
        uppercaseRole: formData.role.toUpperCase(),
        capitalizedRole: formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
      });

      await createUser(userPayload);

      setTrigger(true);

      toast({
        title: "Success",
        description: `${formData.name} has been added to the team.`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        customRole: '',
        predefinedRole: ''
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Create user error:', error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPredefinedRole = predefinedRoles.find(r => r.id === formData.predefinedRole);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Add New Team Member
          </DialogTitle>
          <DialogDescription>
            Add a new user to your organization. A temporary password will be sent to their email address. 
            Job role template is required and will be set as the department.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Role Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Role Assignment</h3>
            <div className="space-y-2">
              <Label htmlFor="role">System Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'employee') => 
                  setFormData({ ...formData, role: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select system role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        {role === 'admin' ? (
                          <Shield className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="capitalize">{role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="predefined-role">Job Role Template (Department) *</Label>
              <Select
                value={formData.predefinedRole}
                onValueChange={(value) => 
                  setFormData({ ...formData, predefinedRole: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job role template" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <span>{role.icon}</span>
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPredefinedRole && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{selectedPredefinedRole.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold">{selectedPredefinedRole.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedPredefinedRole.description}
                    </p>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Default App Access:</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPredefinedRole.permissions.map((appId) => (
                          <Badge key={appId} variant="secondary" className="text-xs">
                            {appId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="custom-role">Custom Job Title (Optional)</Label>
              <Input
                id="custom-role"
                value={formData.customRole}
                onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                placeholder="e.g., Senior Developer, Lead Designer"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Adding User...
                </div>
              ) : (
                'Add User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
