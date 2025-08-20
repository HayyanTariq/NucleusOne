import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTraining } from '@/contexts/TrainingContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { TrainingFormSlideout } from '@/components/TrainingForm/TrainingFormSlideout';
import { TrainingViewModal } from '@/components/Training/TrainingViewModal';
import { RecentTrainingActivities } from '@/components/Admin/RecentTrainingActivities';
import { 
  Users, 
  Award, 
  BookOpen, 
  TrendingUp,
  Plus,
  Calendar,
  GraduationCap,
  Shield,
  Building
} from 'lucide-react';
import { Training, TrainingFormData } from '@/types/training';
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
            Are you sure you want to delete the training "{trainingName}" for {training?.employeeName}? This action cannot be undone.
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

// OwnerDashboard component
export const OwnerDashboard = () => {
  const { user } = useAuth();
  const { trainings, addTraining, deleteTraining } = useTraining();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<Training | null>(null);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);

  // Fetch real employee and admin counts from backend
  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const employees = await authApi.getCompanyUsers('employee');
        const admins = await authApi.getCompanyUsers('admin');
        setTotalEmployees(employees.length);
        setTotalAdmins(admins.length);
      } catch (error) {
        console.error('Failed to fetch user counts:', error);
        setTotalEmployees(0);
        setTotalAdmins(0);
      }
    };

    fetchUserCounts();
  }, []);


  const stats = {
    totalEmployees,
    totalAdmins,
    totalTrainings: trainings.length,
    completedTrainings: trainings.filter(t => t.status === 'completed').length,
    inProgressTrainings: trainings.filter(t => t.status === 'in-progress').length,
  };

  const handleAddTraining = async (data: TrainingFormData) => {
    setIsLoading(true);
    try {
      await addTraining(data);
      toast({
        title: "Training Added",
        description: `Training for ${data.employeeName} has been added successfully.`,
      });
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
        description: `Training "${trainingToDelete.type === 'certification' ? trainingToDelete.certificationName : trainingToDelete.type === 'course' ? trainingToDelete.courseTitle : trainingToDelete.sessionTopic}" for ${trainingToDelete.employeeName} has been deleted.`,
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
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Here's your company overview.
          </p>
        </div>
        
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          description="Active employees"
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Total Admins"
          value={stats.totalAdmins}
          description="System administrators"
          icon={Shield}
          variant="success"
        />
        <StatsCard
          title="Total Trainings"
          value={stats.totalTrainings}
          description="All training records"
          icon={BookOpen}
          variant="success"
        />
        <StatsCard
          title="Completed"
          value={stats.completedTrainings}
          description="Finished trainings"
          icon={Award}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTrainingActivities
          companyName={user?.companyName || ''}
          title="Recent Activities"
          limit={10}
          showViewAll={false}
        />
        
        <div className="space-y-6">
          <StatsCard
            title="This Month"
            value={trainings.filter(t => {
              const date = new Date(t.createdAt || '');
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
            description="New trainings added"
            icon={Calendar}
            variant="default"
            className="w-full"
          />
          
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-success/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/manage-admins')}
              >
                <Shield className="mr-2 h-4 w-4" />
                Manage Admins
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/users')}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Employees
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/reports')}
              >
                <Award className="mr-2 h-4 w-4" />
                View Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/trainings')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                All Trainings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <TrainingFormSlideout
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddTraining}
        isLoading={isLoading}
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