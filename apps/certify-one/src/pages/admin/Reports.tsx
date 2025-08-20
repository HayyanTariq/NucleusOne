import React from 'react';
import { useTraining } from '@/contexts/TrainingContext';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  BookOpen, 
  Clock,
  Target
} from 'lucide-react';

export const Reports = () => {
  const { trainings } = useTraining();

  const stats = {
    totalTrainings: trainings.length,
    completedTrainings: trainings.filter(t => t.status === 'completed').length,
    inProgressTrainings: trainings.filter(t => t.status === 'in-progress').length,
    scheduledTrainings: trainings.filter(t => t.status === 'scheduled').length,
    certifications: trainings.filter(t => t.type === 'certification').length,
    courses: trainings.filter(t => t.type === 'course').length,
    sessions: trainings.filter(t => t.type === 'session').length,
  };

  const completionRate = stats.totalTrainings > 0 
    ? Math.round((stats.completedTrainings / stats.totalTrainings) * 100) 
    : 0;

  const departmentStats = trainings.reduce((acc, training) => {
    const dept = training.department || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for training programs
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Trainings"
          value={stats.totalTrainings}
          description="All training records"
          icon={BookOpen}
          variant="default"
        />
        <StatsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Training completion"
          icon={Target}
          trend={{ value: 15, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressTrainings}
          description="Active trainings"
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
          variant="warning"
        />
        <StatsCard
          title="Certifications"
          value={stats.certifications}
          description="Certificates earned"
          icon={Award}
          trend={{ value: 23, isPositive: true }}
          variant="success"
        />
      </div>

      {/* Training Type Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Training Type Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of training types in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Certifications</span>
                <span className="text-sm text-muted-foreground">{stats.certifications}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${stats.totalTrainings > 0 ? (stats.certifications / stats.totalTrainings) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Courses</span>
                <span className="text-sm text-muted-foreground">{stats.courses}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full" 
                  style={{ width: `${stats.totalTrainings > 0 ? (stats.courses / stats.totalTrainings) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sessions</span>
                <span className="text-sm text-muted-foreground">{stats.sessions}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-warning h-2 rounded-full" 
                  style={{ width: `${stats.totalTrainings > 0 ? (stats.sessions / stats.totalTrainings) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Department Breakdown
            </CardTitle>
            <CardDescription>
              Training distribution across departments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(departmentStats).map(([department, count]) => (
              <div key={department} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{department}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${stats.totalTrainings > 0 ? (count / stats.totalTrainings) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Training Status Overview
          </CardTitle>
          <CardDescription>
            Current status of all training programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completedTrainings}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgressTrainings}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.scheduledTrainings}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.totalTrainings}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};