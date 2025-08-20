import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface CompanyIndicatorProps {
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'secondary' | 'outline';
}

export const CompanyIndicator: React.FC<CompanyIndicatorProps> = ({
  className,
  showIcon = true,
  variant = 'outline'
}) => {
  const { user } = useAuth();

  if (!user?.companyName) {
    return null;
  }

  return (
    <Badge 
      variant={variant} 
      className={cn(
        'flex items-center space-x-1 text-xs font-medium',
        'border border-primary/20 bg-primary/5 text-primary',
        className
      )}
    >
      {showIcon && <Building className="h-3 w-3" />}
      <span>{user.companyName}</span>
    </Badge>
  );
};
