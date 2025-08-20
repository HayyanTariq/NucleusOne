import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Clock,
  User,
  Building,
  Award,
  BookOpen,
  Users,
  MapPin,
  Globe,
  ExternalLink,
  FileText,
  Target,
  Star,
  CheckCircle2,
  Eye,
  Tag
} from 'lucide-react';
import { Training } from '@/types/training';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TrainingViewModalProps {
  training: Training | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusStyles = {
  completed: 'bg-success-light text-success border-success/20',
  'in-progress': 'bg-primary/10 text-primary border-primary/20',
  scheduled: 'bg-warning-light text-warning border-warning/20',
  pending: 'bg-muted text-muted-foreground border-border'
};

const typeIcons = {
  session: Users,
  course: BookOpen,
  certification: Award
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  } catch {
    return dateString;
  }
};

const formatTime = (timeString: string) => {
  try {
    return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
  } catch {
    return timeString;
  }
};

export const TrainingViewModal: React.FC<TrainingViewModalProps> = ({
  training,
  isOpen,
  onClose
}) => {
  if (!training) return null;

  const TypeIcon = typeIcons[training.type] || Users;

  const renderSessionDetails = () => {
    const sessionTraining = training as any;
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              <span>Session Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Instructor:</span>
                  <span>{sessionTraining.instructorName || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span>{sessionTraining.sessionDate ? formatDate(sessionTraining.sessionDate) : 'Not scheduled'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Duration:</span>
                  <span>{sessionTraining.duration || 'Not specified'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span className="capitalize">{sessionTraining.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Capacity:</span>
                  <span>{sessionTraining.capacity || 'Not specified'}</span>
                </div>
              </div>
            </div>
            
            {sessionTraining.agenda && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Agenda:</span>
                </div>
                <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                  {sessionTraining.agenda}
                </p>
              </div>
            )}
            
            {sessionTraining.learnedOutcome && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Learning Outcomes:</span>
                </div>
                <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                  {sessionTraining.learnedOutcome}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCourseDetails = () => {
    const courseTraining = training as any;
    return (
      <div className="space-y-6">
        <Card className="border-2 border-success/10 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <BookOpen className="h-5 w-5 text-success" />
              <span>Course Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Platform:</span>
                  <span>{courseTraining.platform || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Start Date:</span>
                  <span>{courseTraining.startDate ? formatDate(courseTraining.startDate) : 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Completion:</span>
                  <span>{courseTraining.completionDate ? formatDate(courseTraining.completionDate) : 'Not completed'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Duration:</span>
                  <span>{courseTraining.courseDuration || 'Not specified'}</span>
                </div>
                {courseTraining.certificateLink && (
                  <div className="flex items-center space-x-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Certificate:</span>
                    <a 
                      href={courseTraining.certificateLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Certificate
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {courseTraining.courseDescription && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Description:</span>
                </div>
                <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                  {courseTraining.courseDescription}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCertificationDetails = () => {
    const certTraining = training as any;
    return (
      <div className="space-y-6">
        <Card className="border-2 border-warning/10 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Award className="h-5 w-5 text-warning" />
              <span>Certification Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Issuing Organization:</span>
                  <span>{certTraining.issuingOrganization || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Issue Date:</span>
                  <span>{certTraining.issueDate ? formatDate(certTraining.issueDate) : 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Expires:</span>
                  <span>{certTraining.expirationDate ? formatDate(certTraining.expirationDate) : 'Never'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Credential ID:</span>
                  <span className="font-mono text-xs bg-background/50 px-2 py-1 rounded">
                    {certTraining.credentialId || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Level:</span>
                  <span className="capitalize">{certTraining.level || 'Not specified'}</span>
                </div>
              </div>
            </div>
            
            {certTraining.description && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Description:</span>
                </div>
                <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                  {certTraining.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-2 animate-scale-in">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-primary/20">
                <AvatarFallback className="gradient-primary text-primary-foreground text-lg font-bold">
                  {getInitials(training.employeeName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center ring-2 ring-background">
                <TypeIcon className="h-3 w-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                <span>
                  {training.type === 'session' && (training as any).sessionTopic}
                  {training.type === 'course' && (training as any).courseTitle}
                  {training.type === 'certification' && (training as any).certificationName}
                </span>
                <Badge 
                  variant="secondary" 
                  className={cn('text-sm font-medium border animate-fade-in', statusStyles[training.status || 'pending'])}
                >
                  {(training.status || 'pending').replace('-', ' ')}
                </Badge>
              </DialogTitle>
              
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{training.employeeName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>{training.department || training.companyName || 'Unknown Department'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Tag className="h-4 w-4" />
                  <span>{training.category ?? 'Uncategorized'}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 animate-fade-in">
          {/* Common Information */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-primary" />
                <span>Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{training.role}</div>
                  <div className="text-sm text-muted-foreground">Role</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-success/5 to-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success capitalize">{training.category ?? 'Uncategorized'}</div>
                  <div className="text-sm text-muted-foreground">Category</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-warning/5 to-warning/10 rounded-lg">
                  <div className="text-2xl font-bold text-warning capitalize">{training.type}</div>
                  <div className="text-sm text-muted-foreground">Type</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Type-specific details */}
          {training.type === 'session' && renderSessionDetails()}
          {training.type === 'course' && renderCourseDetails()}
          {training.type === 'certification' && renderCertificationDetails()}

          {/* Skills Section */}
          {(training as any).skillsLearned && (training as any).skillsLearned.length > 0 && (
            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Skills Learned</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(training as any).skillsLearned.map((skill: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="px-3 py-1 text-sm hover-scale transition-all duration-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator className="my-6" />
          
          {/* Footer Information */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Training record created on {formatDate(training.createdAt)}</p>
            {training.updatedAt !== training.createdAt && (
              <p>Last created on {formatDate(training.updatedAt)}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};