/**
 * Training Activity Service
 * 
 * This service creates activity records from existing training data
 * and maintains them in localStorage for persistence across sessions.
 * It tracks create, update, and delete activities for the Recent Activities feed.
 */

import { Training } from '@/types/training';

export interface TrainingActivity {
  id: string;
  trainingId: string;
  trainingType: 'session' | 'course' | 'certification';
  trainingName: string;
  activityType: 'created' | 'updated' | 'deleted';
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  companyId: number;
  companyName: string;
  timestamp: string;
  description: string;
  isDeleted?: boolean;
}

class TrainingActivityService {
  private storageKey = 'training-activities';
  private clearedTimestampKey = 'training-activities-cleared-timestamp';
  private maxActivities = 50; // Keep last 50 activities

  /**
   * Get all activities for the current user's company
   */
  getActivities(userCompanyName: string): TrainingActivity[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const activities: TrainingActivity[] = JSON.parse(stored);
      
      // Filter by company and sort by most recent first
      return activities
        .filter(activity => activity.companyName === userCompanyName)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  }

  /**
   * Add a new activity
   */
  addActivity(activity: Omit<TrainingActivity, 'id' | 'timestamp'>): void {
    try {
      const activities = this.getAllActivities();
      
      console.log('🔍 Adding activity:', {
        trainingId: activity.trainingId,
        activityType: activity.activityType,
        trainingName: activity.trainingName,
        employeeName: activity.employeeName
      });
      
      // Enhanced duplicate prevention: check for duplicates within last 30 seconds to allow for timing issues
      const now = Date.now();
      const isDuplicate = activities.some(existingActivity => {
        const timeDiff = now - new Date(existingActivity.timestamp).getTime();
        const isWithinTimeWindow = timeDiff < 30000; // 30 seconds
        const isSameActivity = existingActivity.trainingId === activity.trainingId &&
                              existingActivity.activityType === activity.activityType &&
                              existingActivity.employeeEmail === activity.employeeEmail &&
                              existingActivity.companyName === activity.companyName;
        return isSameActivity && isWithinTimeWindow;
      });
      
      if (isDuplicate) {
        console.log('🔄 Skipping duplicate activity for training:', activity.trainingId, '(within 30s window)');
        return;
      }
      
      const newActivity: TrainingActivity = {
        ...activity,
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      
      activities.unshift(newActivity);
      console.log('✅ Activity added successfully:', newActivity.id);
      
      // Keep only the most recent activities
      const trimmedActivities = activities.slice(0, this.maxActivities);
      
      localStorage.setItem(this.storageKey, JSON.stringify(trimmedActivities));
      console.log('💾 Saved', trimmedActivities.length, 'activities to localStorage');
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  }

  /**
   * Record training creation activity
   */
  recordCreation(training: Training, userCompanyName: string): void {
    const trainingName = this.getTrainingName(training);
    const trainingType = training.type;
    
    this.addActivity({
      trainingId: training.id,
      trainingType,
      trainingName,
      activityType: 'created',
      employeeId: training.employeeId,
      employeeName: training.employeeName,
      employeeEmail: training.employeeEmail,
      companyId: training.companyId,
      companyName: userCompanyName,
      description: `Created a new ${trainingType}: "${trainingName}"`
    });
  }

  /**
   * Record training update activity
   */
  recordUpdate(training: Training, userCompanyName: string): void {
    const trainingName = this.getTrainingName(training);
    const trainingType = training.type;
    
    this.addActivity({
      trainingId: training.id,
      trainingType,
      trainingName,
      activityType: 'updated',
      employeeId: training.employeeId,
      employeeName: training.employeeName,
      employeeEmail: training.employeeEmail,
      companyId: training.companyId,
      companyName: userCompanyName,
      description: `Updated ${trainingType}: "${trainingName}"`
    });
  }

  /**
   * Record training deletion activity
   */
  recordDeletion(training: Training, userCompanyName: string): void {
    const trainingName = this.getTrainingName(training);
    const trainingType = training.type;
    
    this.addActivity({
      trainingId: training.id,
      trainingType,
      trainingName,
      activityType: 'deleted',
      employeeId: training.employeeId,
      employeeName: training.employeeName,
      employeeEmail: training.employeeEmail,
      companyId: training.companyId,
      companyName: userCompanyName,
      description: `Deleted ${trainingType}: "${trainingName}"`,
      isDeleted: true
    });
  }

  /**
   * Get the timestamp when activities were last cleared for a company
   */
  private getClearedTimestamp(companyName: string): number {
    try {
      const stored = localStorage.getItem(`${this.clearedTimestampKey}-${companyName}`);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Error getting cleared timestamp:', error);
      return 0;
    }
  }

  /**
   * Set the timestamp when activities were cleared for a company
   */
  private setClearedTimestamp(companyName: string): void {
    try {
      localStorage.setItem(`${this.clearedTimestampKey}-${companyName}`, Date.now().toString());
    } catch (error) {
      console.error('Error setting cleared timestamp:', error);
    }
  }

  /**
   * Initialize activities from existing trainings (one-time setup)
   */
  initializeFromExistingTrainings(trainings: Training[], userCompanyName: string): void {
    const existingActivities = this.getActivities(userCompanyName);
    const clearedTimestamp = this.getClearedTimestamp(userCompanyName);
    
    console.log('🔄 Initializing activities for', trainings.length, 'trainings');
    console.log('📋 Existing activities:', existingActivities.length);
    console.log('🗑️ Last cleared timestamp:', new Date(clearedTimestamp).toISOString());
    
    // Create "created" activities for existing trainings
    trainings.forEach(training => {
      // Check if we already have a 'created' activity for this training
      const hasCreatedActivity = existingActivities.some(activity => 
        activity.trainingId === training.id && activity.activityType === 'created'
      );
      
      if (!hasCreatedActivity) {
        const trainingName = this.getTrainingName(training);
        const createdDate = training.createdAt ? new Date(training.createdAt) : new Date();
        const createdTimestamp = createdDate.getTime();
        
        // Only add activities for trainings created AFTER the last clear operation
        // or for very recent trainings (today) even if activities were cleared
        const daysSinceCreation = Math.floor((Date.now() - createdTimestamp) / (1000 * 60 * 60 * 24));
        const isToday = daysSinceCreation === 0;
        const wasCreatedAfterClear = createdTimestamp > clearedTimestamp;
        const isRecent = daysSinceCreation <= 7;
        
        // Only add if:
        // 1. Training was created after activities were cleared, OR
        // 2. Training was created today (to catch new trainings immediately)
        if ((wasCreatedAfterClear && isRecent) || isToday) {
          console.log('➕ Adding creation activity for training:', training.id, trainingName, `(${daysSinceCreation} days ago, created after clear: ${wasCreatedAfterClear})`);
          this.addActivity({
            trainingId: training.id,
            trainingType: training.type,
            trainingName,
            activityType: 'created',
            employeeId: training.employeeId,
            employeeName: training.employeeName,
            employeeEmail: training.employeeEmail,
            companyId: training.companyId,
            companyName: userCompanyName,
            description: `Created a new ${training.type}: "${trainingName}"`
          });
        } else {
          console.log('⏭️ Skipping training activity:', trainingName, `(created ${daysSinceCreation} days ago, was cleared: ${createdTimestamp <= clearedTimestamp})`);
        }
      }
    });
  }

  /**
   * Clear all activities (for testing/reset)
   */
  clearActivities(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Clear activities for a specific company
   */
  clearActivitiesForCompany(companyName: string): void {
    try {
      const allActivities = this.getAllActivities();
      const filteredActivities = allActivities.filter(
        activity => activity.companyName !== companyName
      );
      localStorage.setItem(this.storageKey, JSON.stringify(filteredActivities));
      
      // Record the timestamp when activities were cleared for this company
      this.setClearedTimestamp(companyName);
      console.log('🗑️ Activities cleared for company:', companyName, 'at', new Date().toISOString());
    } catch (error) {
      console.error('Error clearing company activities:', error);
    }
  }

  /**
   * Get training name based on type
   */
  private getTrainingName(training: Training): string {
    console.log('🏷️ Getting training name for:', training.type, 'with data:', training);
    
    let name = '';
    switch (training.type) {
      case 'session':
        name = (training as any).sessionTopic || (training as any).SessionTopic || 'Untitled Session';
        console.log('📝 Session name candidates:', {
          sessionTopic: (training as any).sessionTopic,
          SessionTopic: (training as any).SessionTopic,
          resolved: name
        });
        break;
      case 'course':
        name = (training as any).courseTitle || (training as any).CourseTitle || 'Untitled Course';
        console.log('📝 Course name candidates:', {
          courseTitle: (training as any).courseTitle,
          CourseTitle: (training as any).CourseTitle,
          resolved: name
        });
        break;
      case 'certification':
        name = (training as any).certificationName || (training as any).CertificationName || 'Untitled Certification';
        console.log('📝 Certification name candidates:', {
          certificationName: (training as any).certificationName,
          CertificationName: (training as any).CertificationName,
          resolved: name
        });
        break;
      default:
        name = 'Unknown Training';
    }
    
    console.log('🏷️ Resolved training name:', name);
    return name;
  }

  /**
   * Get all activities (without company filtering)
   */
  private getAllActivities(): TrainingActivity[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading all activities:', error);
      return [];
    }
  }
}

export const trainingActivityService = new TrainingActivityService();
