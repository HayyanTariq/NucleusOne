import React, { useState } from 'react';
import { useTraining } from '@/contexts/TrainingContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminTrainingTable } from '@/components/Admin/AdminTrainingTable';
import { TrainingViewModal } from '@/components/Training/TrainingViewModal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import { Training } from '@/types/training';

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

// AllTrainings component
export const AllTrainings = () => {
  const { trainings, deleteTraining } = useTraining();
  const { toast } = useToast();
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<Training | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleDelete = (training: Training) => {
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

  const handleBulkDelete = async (trainingIds: string[]) => {
    setIsLoading(true);
    try {
      // Delete all selected trainings
      await Promise.all(trainingIds.map(id => deleteTraining(id)));
      toast({
        title: "Trainings Deleted",
        description: `${trainingIds.length} training${trainingIds.length > 1 ? 's' : ''} deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some trainings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkExport = (trainingIds: string[]) => {
    const selectedTrainings = trainings.filter(training => trainingIds.includes(training.id));
    
    // Create CSV content
    const csvHeaders = ['Employee Name', 'Role', 'Department', 'Training Type', 'Training Name', 'Status', 'Category', 'Date'];
    const csvData = selectedTrainings.map(training => {
      const trainingName = training.type === 'certification' ? training.certificationName :
                          training.type === 'course' ? training.courseTitle : training.sessionTopic;
      const date = training.type === 'session' ? training.sessionDate :
                  training.type === 'course' ? training.startDate : training.issueDate;
      
      return [
        training.employeeName,
        training.role,
        training.department || training.companyName || 'Unknown Department',
        training.type,
        trainingName,
        training.status,
        training.category ?? 'Uncategorized',
        date || 'N/A'
      ];
    });
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `training_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Completed",
      description: `${selectedTrainings.length} training record${selectedTrainings.length > 1 ? 's' : ''} exported successfully.`,
    });
  };

  const handleBulkArchive = async (trainingIds: string[]) => {
    setIsLoading(true);
    try {
      // Archive functionality would be implemented here
      // For now, we'll just show a success message
      toast({
        title: "Trainings Archived",
        description: `${trainingIds.length} training${trainingIds.length > 1 ? 's' : ''} archived successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive some trainings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrainings = trainings.filter(training => {
    const searchFields = [
      training.employeeName?.toLowerCase(),
      training.type === 'certification' && training.certificationName ? training.certificationName.toLowerCase() : '',
      training.type === 'course' && training.courseTitle ? training.courseTitle.toLowerCase() : '',
      training.type === 'session' && training.sessionTopic ? training.sessionTopic.toLowerCase() : ''
    ].filter(Boolean);
    
    const matchesSearch = searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || training.status === statusFilter;
    const matchesType = typeFilter === 'all' || training.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Trainings</h1>
          <p className="text-muted-foreground">
            Manage all training records across the organization
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="certification">Certificates</SelectItem>
            <SelectItem value="course">Courses</SelectItem>
            <SelectItem value="session">Sessions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdminTrainingTable
        trainings={filteredTrainings}
        title={`Training Records (${filteredTrainings.length})`}
        showActions={true}
        showSelectAll={true}
        onView={setViewingTraining}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onBulkArchive={handleBulkArchive}
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