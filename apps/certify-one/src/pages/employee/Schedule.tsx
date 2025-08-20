import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTraining } from '@/contexts/TrainingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, BookOpen, Video, Users, Plus } from 'lucide-react';
import { SessionTraining } from '@/types/training';

export const Schedule = () => {
  const { user } = useAuth();
  const { trainings } = useTraining();

  // Filter and get only scheduled sessions
  const scheduledSessions = trainings.filter(
    training => training.type === 'session' && training.status === 'scheduled'
  ) as SessionTraining[];

  const upcomingSessions = scheduledSessions.filter(session => {
    if (!session.sessionDate) return false;
    const sessionDate = new Date(session.sessionDate);
    const today = new Date();
    return sessionDate >= today;
  }).sort((a, b) => {
    const dateA = new Date(a.sessionDate || '');
    const dateB = new Date(b.sessionDate || '');
    return dateA.getTime() - dateB.getTime();
  });

  const pastSessions = scheduledSessions.filter(session => {
    if (!session.sessionDate) return false;
    const sessionDate = new Date(session.sessionDate);
    const today = new Date();
    return sessionDate < today;
  }).sort((a, b) => {
    const dateA = new Date(a.sessionDate || '');
    const dateB = new Date(b.sessionDate || '');
    return dateB.getTime() - dateA.getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSessionTypeIcon = (location: string) => {
    return location?.toLowerCase() === 'online' ? Video : Users;
  };

  const SessionCard = ({ session, isPast = false }: { session: SessionTraining; isPast?: boolean }) => {
    const Icon = getSessionTypeIcon(session.location || '');
    
    return (
      <Card className={`transition-all hover:shadow-md ${isPast ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{session.sessionTopic}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Instructor: {session.instructorName}</span>
              </CardDescription>
            </div>
            <Badge variant={isPast ? "secondary" : "default"}>
              {session.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{session.sessionDate ? formatDate(session.sessionDate) : 'Date TBD'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {session.startTime ? formatTime(session.startTime) : 'Time TBD'}
                {session.endTime && ` - ${formatTime(session.endTime)}`}
                {session.duration && ` (${session.duration})`}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{session.location || 'Location TBD'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{session.department}</span>
            </div>
          </div>
          
          {session.agenda && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Agenda:</strong> {session.agenda}
              </p>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <Badge variant="outline" className="text-xs">
              {isPast ? 'Completed' : 'Scheduled'}
            </Badge>
            {!isPast && (
              <Button size="sm" variant="outline">
                Join Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">
            View your upcoming and past training sessions
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="mr-2 h-4 w-4" />
          Request Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledSessions.reduce((total, session) => {
                if (session.duration) {
                  const hours = parseFloat(session.duration.replace(/[^\d.]/g, ''));
                  return total + (isNaN(hours) ? 0 : hours);
                }
                return total;
              }, 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Training hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Upcoming Sessions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Completed Sessions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastSessions.slice(0, 6).map((session) => (
              <SessionCard key={session.id} session={session} isPast />
            ))}
          </div>
          {pastSessions.length > 6 && (
            <div className="text-center">
              <Button variant="outline">View All Completed Sessions</Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {upcomingSessions.length === 0 && pastSessions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Sessions Scheduled</CardTitle>
            <CardDescription className="mb-4">
              You don't have any training sessions scheduled yet.
            </CardDescription>
            <Button variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              Request a Training Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};