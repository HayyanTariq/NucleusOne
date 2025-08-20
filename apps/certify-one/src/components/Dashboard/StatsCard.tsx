import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: {
    card: 'border-primary/20 shadow-soft',
    icon: 'gradient-primary text-primary-foreground',
    trend: {
      positive: 'text-success bg-success-light',
      negative: 'text-destructive bg-destructive/10'
    }
  },
  success: {
    card: 'border-success/20 shadow-soft',
    icon: 'gradient-success text-success-foreground',
    trend: {
      positive: 'text-success bg-success-light',
      negative: 'text-destructive bg-destructive/10'
    }
  },
  warning: {
    card: 'border-warning/20 shadow-soft',
    icon: 'bg-warning text-warning-foreground',
    trend: {
      positive: 'text-success bg-success-light',
      negative: 'text-destructive bg-destructive/10'
    }
  },
  destructive: {
    card: 'border-destructive/20 shadow-soft',
    icon: 'bg-destructive text-destructive-foreground',
    trend: {
      positive: 'text-success bg-success-light',
      negative: 'text-destructive bg-destructive/10'
    }
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className
}) => {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-medium transform hover:scale-[1.02]',
      styles.card,
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          'h-8 w-8 rounded-lg flex items-center justify-center',
          styles.icon
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {trend && (
            <Badge 
              variant="secondary" 
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? styles.trend.positive : styles.trend.negative
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
          )}
        </div>
      </CardContent>
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
    </Card>
  );
};