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
import { Training, TrainingFormData, CourseTraining } from '@/types/training';
import { Plus, Search, Filter, BookOpen, Clock, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';

export const MyCourses = () => {
  const { user } = useAuth();
  const { trainings, addTraining, updateTraining, deleteTraining } = useTraining();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Training | null>(null);
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter only course type trainings
  const courses = trainings.filter(training => training.type === 'course') as CourseTraining[];

  const handleAddCourse = async (data: TrainingFormData) => {
    setIsLoading(true);
    try {
      const courseData = { ...data, type: 'course' as const };
      if (editingCourse) {
        await updateTraining(editingCourse.id, courseData);
        setEditingCourse(null);
      } else {
        await addTraining(courseData);
      }
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourse = (course: Training) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleDeleteCourse = async (course: Training) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await deleteTraining(course.id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
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
    'scheduled': BookOpen,
    'pending': AlertCircle
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            Manage and track your online courses
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} variant="gradient">
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusColors).map(([status, variant]) => {
          const count = courses.filter(c => c.status === status).length;
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
            placeholder="Search courses..."
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

      {/* Courses List */}
      <EmployeeTrainingList
        trainings={filteredCourses}
        title={`Online Courses (${filteredCourses.length})`}
        showActions={true}
        onView={setViewingTraining}
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
      />

      <TrainingFormSlideout
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddCourse}
        isLoading={isLoading}
        fixedType="course"
        initialData={editingCourse ? {
          employeeName: editingCourse.employeeName,
          role: editingCourse.role,
          department: editingCourse.department,
          category: editingCourse.category,
          status: editingCourse.status,
          type: 'course',
          ...editingCourse
        } : { type: 'course' } as any}
      />
      
      <TrainingViewModal
        training={viewingTraining}
        isOpen={!!viewingTraining}
        onClose={() => setViewingTraining(null)}
      />
    </div>
  );
};