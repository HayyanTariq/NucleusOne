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
import { Training, TrainingFormData, SessionTraining } from '@/types/training';
import { Plus, Search, Filter, Calendar, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';

export const MySessions = () => {
  const { user } = useAuth();
  const { trainings, addTraining, updateTraining, deleteTraining } = useTraining();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Training | null>(null);
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter only session type trainings
  const sessions = trainings.filter(training => training.type === 'session') as SessionTraining[];

  const handleAddSession = async (data: TrainingFormData) => {
    setIsLoading(true);
    try {
      const sessionData = { ...data, type: 'session' as const };
      if (editingSession) {
        await updateTraining(editingSession.id, sessionData);
        setEditingSession(null);
      } else {
        await addTraining(sessionData);
      }
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSession = (session: Training) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleDeleteSession = async (session: Training) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      await deleteTraining(session.id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSession(null);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.sessionTopic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.agenda?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
    'scheduled': Calendar,
    'pending': AlertCircle
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
          <p className="text-muted-foreground">
            Manage and track your training sessions
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} variant="gradient">
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusColors).map(([status, variant]) => {
          const count = sessions.filter(s => s.status === status).length;
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
            placeholder="Search sessions..."
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
      </div>

      {/* Sessions List */}
      <EmployeeTrainingList
        trainings={filteredSessions}
        title={`Training Sessions (${filteredSessions.length})`}
        showActions={true}
        onView={setViewingTraining}
        onEdit={handleEditSession}
        onDelete={handleDeleteSession}
      />

      <TrainingFormSlideout
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddSession}
        isLoading={isLoading}
        fixedType="session"
        initialData={editingSession ? {
          employeeName: editingSession.employeeName,
          role: editingSession.role,
          department: editingSession.department,
          category: editingSession.category,
          status: editingSession.status,
          type: 'session',
          ...editingSession
        } : { type: 'session' } as any}
      />
      
      <TrainingViewModal
        training={viewingTraining}
        isOpen={!!viewingTraining}
        onClose={() => setViewingTraining(null)}
      />
    </div>
  );
};