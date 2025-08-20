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
import { Training, TrainingFormData, CertificationTraining } from '@/types/training';
import { Plus, Search, Filter, Award, Clock, CheckCircle, AlertCircle, Shield, Star } from 'lucide-react';

export const MyCertificates = () => {
  const { user } = useAuth();
  const { trainings, addTraining, updateTraining, deleteTraining } = useTraining();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Training | null>(null);
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const certificates = trainings.filter(training => training.type === 'certification') as CertificationTraining[];

  const handleAddCertification = async (data: TrainingFormData) => {
    setIsLoading(true);
    try {
      const certificationData = { ...data, type: 'certification' as const };
      if (editingCertificate) {
        await updateTraining(editingCertificate.id, certificationData);
        setEditingCertificate(null);
      } else {
        await addTraining(certificationData);
      }
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCertificate = (certificate: Training) => {
    setEditingCertificate(certificate);
    setIsFormOpen(true);
  };

  const handleDeleteCertificate = async (certificate: Training) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      await deleteTraining(certificate.id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCertificate(null);
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.certificationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuingOrganization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.skillsLearned && cert.skillsLearned.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    
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
    'scheduled': Award,
    'pending': AlertCircle
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Certifications</h1>
          <p className="text-muted-foreground">
            View and manage your professional certifications
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} variant="gradient">
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusColors).map(([status, variant]) => {
          const count = certificates.filter(c => c.status === status).length;
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
            placeholder="Search certifications..."
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

      {/* Certificates List */}
      <EmployeeTrainingList
        trainings={filteredCertificates}
        title={`Certifications (${filteredCertificates.length})`}
        showActions={true}
        onView={setViewingTraining}
        onEdit={handleEditCertificate}
        onDelete={handleDeleteCertificate}
      />

      <TrainingFormSlideout
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddCertification}
        isLoading={isLoading}
        fixedType="certification"
        initialData={editingCertificate ? {
          employeeName: editingCertificate.employeeName,
          role: editingCertificate.role,
          department: editingCertificate.department,
          category: editingCertificate.category,
          status: editingCertificate.status,
          type: 'certification',
          ...editingCertificate
        } : { type: 'certification' } as any}
      />
      
      <TrainingViewModal
        training={viewingTraining}
        isOpen={!!viewingTraining}
        onClose={() => setViewingTraining(null)}
      />
    </div>
  );
};