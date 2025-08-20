import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Building,
  Award,
  BookOpen,
  Users,
  Clock,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  Plus,
  PenTool,
  X,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { TrainingActivity, trainingActivityService } from '@/services/trainingActivityService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface RecentTrainingActivitiesProps {
  companyName: string;
  title?: string;
  limit?: number;
  showViewAll?: boolean;
  showClearButton?: boolean;
}

const typeIcons = {
  session: Users,
  course: BookOpen,
  certification: Award
};

const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return format(date, 'MMM dd');
  } catch {
    return 'Recently';
  }
};

const getTrainingTypeLabel = (trainingType: string) => {
  switch (trainingType) {
    case 'session':
      return 'Session';
    case 'course':
      return 'Course';
    case 'certification':
      return 'Certification';
    default:
      return 'Training';
  }
};

export const RecentTrainingActivities: React.FC<RecentTrainingActivitiesProps> = ({
  companyName,
  title = "Recent Activities",
  limit = 10,
  showViewAll = false,
  showClearButton = true
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<TrainingActivity[]>([]);

  // Function to refresh activities from localStorage
  const refreshActivities = useCallback(() => {
    const latestActivities = trainingActivityService.getActivities(companyName);
    setActivities(latestActivities);
  }, [companyName]);

  // Load activities on mount and when companyName changes
  useEffect(() => {
    refreshActivities();
  }, [refreshActivities]);

  // Auto-refresh activities every 2 seconds to catch new activities
  useEffect(() => {
    const interval = setInterval(() => {
      refreshActivities();
    }, 2000);

    return () => clearInterval(interval);
  }, [refreshActivities]);

  // Limit activities
  const displayActivities = activities.slice(0, limit);

  const handleViewAllClick = () => {
    navigate('/admin/trainings');
  };

  const handleClearActivities = () => {
    trainingActivityService.clearActivitiesForCompany(companyName);
    setActivities([]);
    toast({
      title: "Activities Cleared",
      description: "All recent training activities for your company have been cleared.",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{title}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {activities.length} total
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={refreshActivities}
              title="Refresh activities"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            {showClearButton && activities.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Recent Activities?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove all recent training activities from the list. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearActivities}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear Activities
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {displayActivities.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activities</p>
            </div>
        ) : (
          <div className="space-y-0">
            {displayActivities.map((activity, index) => {
              const { trainingType, trainingName, activityType, employeeName } = activity;
              const TypeIcon = typeIcons[trainingType] || Users;
              const isLast = index === displayActivities.length - 1;
              const isCurrentUser = user?.email === activity.employeeEmail;
              const ActionIcon = activityType === 'created' ? Plus :
                                activityType === 'deleted' ? Trash2 :
                                PenTool;
              
              return (
                <div
                  key={activity.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-all duration-200 group',
                    !isLast && 'border-b border-border/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Activity Icon */}
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      activityType === 'created' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : activityType === 'deleted'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    )}>
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    
                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Activity Message */}
                          <p className="text-sm font-medium text-foreground leading-5 mb-1">
                            {isCurrentUser ? `You ${activityType === 'created' ? 'Created a New' : activityType === 'deleted' ? 'Deleted a' : 'Updated a'} ${getTrainingTypeLabel(trainingType)}` :
                              `${employeeName} ${activityType === 'created' ? 'created a new' : activityType === 'deleted' ? 'deleted a' : 'updated a'} ${getTrainingTypeLabel(trainingType)}`}
                          </p>
                          
                          {/* Meta Information */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <TypeIcon className="h-3 w-3" />
                              <span className="capitalize">{trainingType}</span>
                            </div>
                            {!isCurrentUser && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span className="truncate">{activity.companyName || 'Unknown Company'}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatRelativeTime(activity.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View Details
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* View All button - only show if explicitly enabled */}
        {showViewAll && displayActivities.length > 0 && (
          <div className="p-4 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAllClick}
              className="w-full justify-center text-sm text-muted-foreground hover:text-primary"
            >
              <span>View All Trainings</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
