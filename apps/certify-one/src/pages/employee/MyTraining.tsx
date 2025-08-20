import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTraining } from '@/contexts/TrainingContext';
import { Button } from '@/components/ui/button';
import { EmployeeTrainingList } from '@/components/Employee/EmployeeTrainingList';
import { TrainingViewModal } from '@/components/Training/TrainingViewModal';
import { TrainingFormSlideout } from '@/components/TrainingForm/TrainingFormSlideout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Training, TrainingFormData } from '@/types/training';
import { Plus, Search, Filter, BookOpen, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const MyTraining = () => {
  const { user } = useAuth();
  const { trainings, addTraining, updateTraining, deleteTraining, refreshTrainings, isLoading: contextLoading } = useTraining();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleAddTraining = async (data: TrainingFormData) => {
    setIsLoading(true);
    try {
      if (editingTraining) {
        await updateTraining(editingTraining.id, data);
        setEditingTraining(null);
      } else {
        await addTraining(data);
      }
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTraining = (training: Training) => {
    setEditingTraining(training);
    setIsFormOpen(true);
  };

  const handleDeleteTraining = async (training: Training) => {
    if (window.confirm('Are you sure you want to delete this training?')) {
      await deleteTraining(training.id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTraining(null);
  };

  // Debug logging
  console.log('🎯 MyTraining: Training data:', {
    totalTrainings: trainings.length,
    userCompany: user?.companyName,
    userRole: user?.role,
    isLoading: contextLoading,
    trainings: trainings.slice(0, 3) // Show first 3 trainings for debugging
  });

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.type === 'certification' 
      ? training.certificationName?.toLowerCase().includes(searchTerm.toLowerCase())
      : training.type === 'course'
      ? training.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      : training.sessionTopic?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || training.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (training.category ?? 'Uncategorized') === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusColors = {
    'completed': 'secondary',
    'in-progress': 'outline',
    'scheduled': 'default',
    'pending': 'destructive'
  } as const;

  const statusIcons = {
    'completed': CheckCircle,
    'in-progress': Clock,
    'scheduled': BookOpen,
    'pending': AlertCircle
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Training</h1>
          <p className="text-muted-foreground">
            Manage and track all your training activities
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
          <Button onClick={() => setIsFormOpen(true)} variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            Add Training
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusColors).map(([status, variant]) => {
          const count = trainings.filter(t => t.status === status).length;
          const Icon = statusIcons[status as keyof typeof statusIcons];
          
          return (
            <div key={status} className="rounded-lg border bg-card p-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium capitalize">{status.replace('-', ' ')}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-2xl font-bold">{count}</span>
                <Badge variant={variant}>{status}</Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Soft Skills">Soft Skills</SelectItem>
            <SelectItem value="Compliance">Compliance</SelectItem>
            <SelectItem value="Leadership">Leadership</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Training List */}
      <EmployeeTrainingList
        trainings={filteredTrainings}
        title={`Training Records (${filteredTrainings.length})`}
        showActions={true}
        onView={setViewingTraining}
        onEdit={handleEditTraining}
        onDelete={handleDeleteTraining}
      />

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
    </div>
  );
};