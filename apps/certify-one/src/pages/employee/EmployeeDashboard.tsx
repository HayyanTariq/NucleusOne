
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTraining } from '@/contexts/TrainingContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { TrainingFormSlideout } from '@/components/TrainingForm/TrainingFormSlideout';
import { TrainingViewModal } from '@/components/Training/TrainingViewModal';
import { 
  Award, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Plus,
  Calendar,
  Target,
  CheckCircle,
  Eye,
  Pencil,
  Trash2,
  GraduationCap,
  RefreshCw
} from 'lucide-react';
import { RecentTrainingActivities } from '@/components/Admin/RecentTrainingActivities';
import { Training, TrainingFormData } from '@/types/training';
import { RoleBasedTrainingAccess, useTrainingPermissions } from '@/components/Training/RoleBasedTrainingAccess';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// DeleteTrainingModal component
interface DeleteTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  training: Training | null;
  isLoading: boolean;
}

const DeleteTrainingModal: React.FC<DeleteTrainingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  training,
  isLoading,
}) => {
  const trainingName = training
    ? training.type === 'certification'
      ? training.certificationName
      : training.type === 'course'
      ? training.courseTitle
      : training.sessionTopic
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Training</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the training "{trainingName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// TrainingList component
interface TrainingListProps {
  trainings: Training[];
  title: string;
  limit?: number;
  onView: (training: Training) => void;
  onEdit: (training: Training) => void;
  onDelete: (training: Training) => void;
}

const TrainingList: React.FC<TrainingListProps> = ({
  trainings,
  title,
  limit,
  onView,
  onEdit,
  onDelete,
}) => {
  const displayedTrainings = limit ? trainings.slice(0, limit) : trainings;

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-black">Training</TableHead>
              <TableHead className="text-black">Type</TableHead>
              <TableHead className="text-black">Status</TableHead>
              <TableHead className="text-black">Date</TableHead>
              <TableHead className="text-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTrainings.map((training) => (
              <TableRow key={training.id}>
                <TableCell className="text-black">
                  {training.type === 'certification'
                    ? training.certificationName
                    : training.type === 'course'
                    ? training.courseTitle
                    : training.sessionTopic}
                </TableCell>
                <TableCell className="text-black capitalize">{training.type}</TableCell>
                <TableCell className="text-black capitalize">{(training.status ?? 'pending').replace('-', ' ')}</TableCell>
                <TableCell className="text-black">
                  {training.type === 'certification' && training.issueDate && 
                    new Date(training.issueDate).toLocaleDateString()}
                  {training.type === 'course' && training.startDate && 
                    new Date(training.startDate).toLocaleDateString()}
                  {training.type === 'session' && training.sessionDate && 
                    new Date(training.sessionDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onView(training)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      aria-label={`View training`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onEdit(training)}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      aria-label={`Edit training`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(training)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      aria-label={`Delete training`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {displayedTrainings.length === 0 && (
        <p className="mt-4 text-center text-muted-foreground">No training activities found.</p>
      )}
    </div>
  );
};

// EmployeeDashboard component
export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { trainings, isLoading: contextLoading, addTraining, updateTraining, deleteTraining, refreshTrainings } = useTraining();
  const permissions = useTrainingPermissions();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(false);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [trainingToDelete, setTrainingToDelete] = useState<Training | null>(null);

  // Backend handles company isolation - all trainings returned are for this user's company
  // For employees, backend returns only their own trainings
  // For admins, backend returns all company trainings
  const myTrainings = trainings;
  
  // Debug logging
  console.log('🎯 EmployeeDashboard: Training data:', {
    totalTrainings: trainings.length,
    userCompany: user?.companyName,
    userRole: user?.role,
    isLoading: contextLoading,
    trainings: trainings.slice(0, 3) // Show first 3 trainings for debugging
  });

  const stats = {
    myTrainings: myTrainings.length,
    completedTrainings: myTrainings.filter(t => t.status === 'completed').length,
    inProgressTrainings: myTrainings.filter(t => t.status === 'in-progress').length,
    certificates: myTrainings.filter(t => t.type === 'certification').length,
  };

  const handleAddTraining = async (data: TrainingFormData) => {
    setIsLoading(true);
    try {
      if (editingTraining) {
        await updateTraining(editingTraining.id, data);
        toast({
          title: "Training Updated",
          description: `Training for ${data.employeeName} has been updated successfully.`,
        });
        setEditingTraining(null);
      } else {
        await addTraining(data);
        toast({
          title: "Training Added",
          description: `Training for ${data.employeeName} has been added successfully.`,
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save training. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTraining = (training: Training) => {
    setEditingTraining(training);
    setIsFormOpen(true);
  };

  const handleDeleteTraining = (training: Training) => {
    setTrainingToDelete(training);
    setDeleteModalOpen(true);
  };

  const confirmDeleteTraining = async () => {
    if (!trainingToDelete) return;
    setIsLoading(true);
    try {
      await deleteTraining(trainingToDelete.id);
      toast({
        title: "Training Deleted",
        description: `Training "${trainingToDelete.type === 'certification' ? trainingToDelete.certificationName : trainingToDelete.type === 'course' ? trainingToDelete.courseTitle : trainingToDelete.sessionTopic}" has been deleted.`,
      });
      setDeleteModalOpen(false);
      setTrainingToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete training. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTraining(null);
  };


// Show loading spinner while fetching data
if (contextLoading) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading training data...</p>
      </div>
    </div>
  );
}

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Certify One</h1>
          <p className="text-muted-foreground">
           {user?.firstName}! Track your learning journey.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => refreshTrainings()} 
            variant="outline"
            disabled={contextLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {contextLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <RoleBasedTrainingAccess action="create">
            <Button onClick={() => setIsFormOpen(true)} variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              Add Training
            </Button>
          </RoleBasedTrainingAccess>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Trainings"
          value={stats.myTrainings}
          description="Total training records"
          icon={BookOpen}
          variant="default"
        />
        <StatsCard
          title="Completed"
          value={stats.completedTrainings}
          description="Finished trainings"
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressTrainings}
          description="Ongoing trainings"
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Certificates"
          value={stats.certificates}
          description="Earned certificates"
          icon={Award}
          variant="success"
        />
      </div>



      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTrainingActivities
            companyName={user?.companyName || ''}
            title="Recent Activities"
            limit={10}
            showViewAll={false}
          />
        </div>
        
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-success/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Learning Goals
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <span className="text-sm">Complete 5 courses</span>
                 <span className="text-sm font-medium text-success">
                   {myTrainings.filter(t => t.type === 'course' && t.status === 'completed').length}/5
                 </span>
               </div>
               <div className="w-full bg-muted rounded-full h-2">
                 <div 
                   className="bg-success h-2 rounded-full" 
                   style={{ width: `${Math.min((myTrainings.filter(t => t.type === 'course' && t.status === 'completed').length / 5) * 100, 100)}%` }}
                 ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Certifications Goal
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <span className="text-sm">Earn 3 certificates</span>
                 <span className="text-sm font-medium text-success">
                   {myTrainings.filter(t => t.type === 'certification' && t.status === 'completed').length}/3
                 </span>
               </div>
               <div className="w-full bg-muted rounded-full h-2">
                 <div 
                   className="bg-success h-2 rounded-full" 
                   style={{ width: `${Math.min((myTrainings.filter(t => t.type === 'certification' && t.status === 'completed').length / 3) * 100, 100)}%` }}
                 ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming
            </h3>
             <div className="space-y-3 text-sm">
               {myTrainings
                 .filter(t => t.status === 'scheduled' || t.status === 'in-progress')
                 .slice(0, 2)
                 .map((training) => (
                   <div key={training.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                     <div>
                       <p className="font-medium">
                         {training.type === 'certification' 
                           ? training.certificationName 
                           : training.type === 'course' 
                           ? training.courseTitle 
                           : training.sessionTopic}
                       </p>
                       <p className="text-muted-foreground capitalize">{training.type} - {(training.status ?? 'pending').replace('-', ' ')}</p>
                     </div>
                     <span className="text-warning text-xs">upcoming</span>
                   </div>
                 ))}
               {myTrainings.filter(t => t.status === 'scheduled' || t.status === 'in-progress').length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No upcoming trainings</p>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-background rounded-lg" style={{ display: 'none' }}>
                <div>
                  <p className="font-medium">Team Training Session</p>
                  <p className="text-muted-foreground">Scheduled session</p>
                </div>
                <span className="text-primary text-xs">Next week</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <RoleBasedTrainingAccess action="create">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Training
              </Button>
            </RoleBasedTrainingAccess>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/employee/certificates')}
            >
              <Award className="mr-2 h-4 w-4" />
              View My Certificates
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/employee/courses')}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              View My Courses
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/employee/sessions')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              My Sessions
            </Button>
          </div>
        </div>
      </div>

      <TrainingFormSlideout
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddTraining}
        isLoading={isLoading}
        initialData={editingTraining ? {
          employeeName: editingTraining.employeeName,
          role: editingTraining.role,
          department: editingTraining.department,
          category: editingTraining.category,
          status: editingTraining.status,
          type: editingTraining.type,
          ...editingTraining
        } : undefined}
      />
      
      <TrainingViewModal
        training={viewingTraining}
        isOpen={!!viewingTraining}
        onClose={() => setViewingTraining(null)}
      />

      <DeleteTrainingModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTrainingToDelete(null);
        }}
        onConfirm={confirmDeleteTraining}
        training={trainingToDelete}
        isLoading={isLoading}
      />
    </div>
  );
};
