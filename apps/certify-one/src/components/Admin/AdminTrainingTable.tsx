import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Award,
  BookOpen,
  Building,
  Calendar,
  ChevronDown,
  Clock,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Download,
  Archive,
  Mail,
  FileText
} from 'lucide-react';
import { Training, TrainingStatus } from '@/types/training';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AdminTrainingTableProps {
  trainings: Training[];
  title: string;
  onView?: (training: Training) => void;
  onEdit?: (training: Training) => void;
  onDelete?: (training: Training) => void;
  onBulkDelete?: (trainingIds: string[]) => void;
  onBulkExport?: (trainingIds: string[]) => void;
  onBulkArchive?: (trainingIds: string[]) => void;
  showActions?: boolean;
  showSelectAll?: boolean;
}

const statusStyles = {
  completed: 'bg-green-50 text-green-700 border-green-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  scheduled: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending: 'bg-gray-50 text-gray-700 border-gray-200'
};

const statusIcons = {
  completed: CheckCircle,
  'in-progress': Timer,
  scheduled: Clock,
  pending: AlertCircle
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

export const AdminTrainingTable: React.FC<AdminTrainingTableProps> = ({
  trainings,
  title,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkExport,
  onBulkArchive,
  showActions = true,
  showSelectAll = false
}) => {
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedTrainings(trainings.map(t => t.id));
    } else {
      setSelectedTrainings([]);
    }
  };

  const handleRowClick = (trainingId: string) => {
    if (selectedTrainings.includes(trainingId)) {
      setSelectedTrainings(selectedTrainings.filter(id => id !== trainingId));
      setSelectAll(false);
    } else {
      setSelectedTrainings([...selectedTrainings, trainingId]);
    }
  };

  const handleBulkAction = (action: 'delete' | 'export' | 'archive') => {
    if (selectedTrainings.length === 0) return;
    
    switch (action) {
      case 'delete':
        onBulkDelete?.(selectedTrainings);
        break;
      case 'export':
        onBulkExport?.(selectedTrainings);
        break;
      case 'archive':
        onBulkArchive?.(selectedTrainings);
        break;
    }
    
    // Clear selection after action
    setSelectedTrainings([]);
    setSelectAll(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {selectedTrainings.length > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {selectedTrainings.length} selected
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction('export')}
                  className="cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkAction('archive')}
                  className="cursor-pointer"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction('delete')}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center space-x-3">
                  {showSelectAll && (
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all trainings"
                    />
                  )}
                  <span>Employee</span>
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Training</TableHead>
              <TableHead className="font-semibold text-gray-900">Type</TableHead>
              <TableHead className="font-semibold text-gray-900">Date</TableHead>
              <TableHead className="font-semibold text-gray-900">Category</TableHead>
              {showActions && (
                <TableHead className="font-semibold text-gray-900 w-20">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainings.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={5} 
                  className="text-center py-12 text-gray-500"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Award className="h-12 w-12 text-gray-400" />
                    <p className="text-sm">No training records found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              trainings.map((training) => {
                const TypeIcon = typeIcons[training.type] || Users;
                const StatusIcon = statusIcons[training.status || 'pending'] || AlertCircle;
                const trainingDate = getTrainingDate(training);
                const isSelected = selectedTrainings.includes(training.id);

                return (
                  <TableRow 
                    key={training.id} 
                    className={cn(
                      "hover:bg-gray-50/50 transition-colors cursor-pointer",
                      isSelected && "bg-blue-50/50"
                    )}
                    onClick={() => showSelectAll && handleRowClick(training.id)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        {showSelectAll && (
                          <div className="flex items-center">
                            <div className={cn(
                              "w-4 h-4 border-2 rounded flex items-center justify-center",
                              isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                            )}>
                              {isSelected && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                        )}
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium">
                            {getInitials(training.employeeName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {training.employeeName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {training.role}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="max-w-48">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getTrainingName(training)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {training.type === 'session' && (training as any).instructorName && 
                            `Instructor: ${(training as any).instructorName}`}
                          {training.type === 'course' && (training as any).platform && 
                            `Platform: ${(training as any).platform}`}
                          {training.type === 'certification' && (training as any).issuingOrganization && 
                            `By: ${(training as any).issuingOrganization}`}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900 capitalize">
                          {training.type}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {trainingDate ? formatDate(trainingDate) : 'No date'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <Badge variant="outline" className="text-xs">
                        {training.category ?? 'Uncategorized'}
                      </Badge>
                    </TableCell>

                    {showActions && (
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onView?.(training);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {onEdit && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(training);
                                }}
                                className="cursor-pointer"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Training
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(training);
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Training
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {trainings.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 px-2">
          <p>Showing {trainings.length} training{trainings.length !== 1 ? 's' : ''}</p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrainingTable;
