import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface RoleBasedTrainingAccessProps {
  children: React.ReactNode;
  requiredRole?: 'employee' | 'admin' | 'owner';
  action?: 'create' | 'view' | 'edit' | 'delete';
  fallback?: React.ReactNode;
}

/**
 * Component that provides role-based access control for training features
 * Based on API specification:
 * - Employees: Can create and view their own trainings
 * - Admins/Owners: Can only view all company trainings (no creation)
 */
export const RoleBasedTrainingAccess: React.FC<RoleBasedTrainingAccessProps> = ({
  children,
  requiredRole,
  action = 'view',
  fallback
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <ShieldX className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Please log in to access training features.
        </AlertDescription>
      </Alert>
    );
  }

  // Check role-based permissions for training creation
  if (action === 'create') {
    // Only employees can create trainings
    if (user.role !== 'employee') {
      return fallback || (
        <Alert className="border-amber-200 bg-amber-50">
          <ShieldX className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Only employees can create training sessions, courses, and certifications.
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Check specific role requirements
  if (requiredRole) {
    const hasRequiredRole = user.role === requiredRole || 
      (requiredRole === 'admin' && user.role === 'owner'); // Owners have admin permissions

    if (!hasRequiredRole) {
      return fallback || (
        <Alert className="border-red-200 bg-red-50">
          <ShieldX className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You don't have permission to access this feature. Required role: {requiredRole}
          </AlertDescription>
        </Alert>
      );
    }
  }

  return <>{children}</>;
};

/**
 * Hook to check training permissions
 */
export const useTrainingPermissions = () => {
  const { user } = useAuth();

  return {
    canCreateTraining: user?.role === 'employee',
    canViewAllTrainings: user?.role === 'admin' || user?.role === 'owner',
    canViewOwnTrainings: !!user,
    isEmployee: user?.role === 'employee',
    isAdmin: user?.role === 'admin',
    isOwner: user?.role === 'owner',
    isAdminOrOwner: user?.role === 'admin' || user?.role === 'owner'
  };
};
