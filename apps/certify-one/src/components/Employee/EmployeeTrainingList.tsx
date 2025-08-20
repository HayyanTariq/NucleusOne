import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Building,
  Award,
  BookOpen,
  Users,
  Clock,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
  MapPin,
  User as UserIcon
} from 'lucide-react';
import { Training, TrainingStatus } from '@/types/training';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EmployeeTrainingListProps {
  trainings: Training[];
  title?: string;
  showActions?: boolean;
  limit?: number;
  onEdit?: (training: Training) => void;
  onDelete?: (training: Training) => void;
  onView?: (training: Training) => void;
}

const statusStyles = {
  completed: 'bg-green-50 text-green-700 border-green-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  scheduled: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending: 'bg-gray-50 text-gray-700 border-gray-200'
};

const typeIcons = {
  session: Users,
  course: BookOpen,
  certification: Award
};

const typeColors = {
  session: 'bg-blue-500',
  course: 'bg-green-500',
  certification: 'bg-purple-500'
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

const getTrainingName = (training: Training) => {
  switch (training.type) {
    case 'session':
      return (training as any).sessionTopic || 'Untitled Session';
    case 'course':
      return (training as any).courseTitle || 'Untitled Course';
    case 'certification':
      return (training as any).certificationName || 'Untitled Certification';
    default:
      return 'Unknown Training';
  }
};

const getTrainingDate = (training: Training) => {
  switch (training.type) {
    case 'session':
      return (training as any).sessionDate;
    case 'course':
      return (training as any).startDate;
    case 'certification':
      return (training as any).issueDate;
    default:
      return '';
  }
};

const getTrainingMeta = (training: Training) => {
  switch (training.type) {
    case 'session':
      return {
        instructor: (training as any).instructorName,
        location: (training as any).location,
        duration: (training as any).duration
      };
    case 'course':
      return {
        platform: (training as any).platform,
        duration: (training as any).courseDuration
      };
    case 'certification':
      return {
        organization: (training as any).issuingOrganization,
        credentialId: (training as any).credentialId,
        expiration: (training as any).expirationDate
      };
    default:
      return {};
  }
};

export const EmployeeTrainingList: React.FC<EmployeeTrainingListProps> = ({
  trainings,
  title = "My Trainings",
  showActions = true,
  limit,
  onEdit,
  onDelete,
  onView
}) => {
  const displayTrainings = limit ? trainings.slice(0, limit) : trainings;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary" className="text-xs">
            {trainings.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {displayTrainings.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No trainings found</p>
          </div>
        ) : (
          <div className="space-y-0">
            {displayTrainings.map((training, index) => {
              const TypeIcon = typeIcons[training.type] || Users;
              const isLast = index === displayTrainings.length - 1;
              const trainingDate = getTrainingDate(training);
              const trainingMeta = getTrainingMeta(training);
              
              // Create a unique key combining type, id, and index to ensure uniqueness
              const uniqueKey = `${training.type}-${training.id || index}-${index}`;
              
              return (
                <div
                  key={uniqueKey}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer',
                    !isLast && 'border-b border-border/50'
                  )}
                  onClick={() => onView?.(training)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Left section - Icon and content */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        typeColors[training.type] || 'bg-gray-500'
                      )}>
                        <TypeIcon className="h-5 w-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate">
                            {getTrainingName(training)}
                          </h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {training.type}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                          {trainingDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(trainingDate)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <span>{training.department || training.companyName || 'Unknown'}</span>
                          </div>
                          {training.category && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">{training.category}</span>
                            </div>
                          )}
                        </div>

                        {/* Training-specific meta information */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {training.type === 'session' && trainingMeta.instructor && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              <span>{trainingMeta.instructor}</span>
                            </div>
                          )}
                          {training.type === 'session' && trainingMeta.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="capitalize">{trainingMeta.location}</span>
                            </div>
                          )}
                          {training.type === 'course' && trainingMeta.platform && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{trainingMeta.platform}</span>
                            </div>
                          )}
                          {training.type === 'certification' && trainingMeta.organization && (
                            <div className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              <span>{trainingMeta.organization}</span>
                            </div>
                          )}
                          {(trainingMeta.duration || trainingMeta.expiration) && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {trainingMeta.duration || 
                                 (trainingMeta.expiration && `Expires ${formatDate(trainingMeta.expiration)}`)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right section - Status and actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'text-xs font-medium border',
                          statusStyles[training.status || 'pending']
                        )}
                      >
                        {(training.status || 'pending').replace('-', ' ')}
                      </Badge>
                      
                      {showActions && (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView?.(training);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {onEdit && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(training);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(training);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};