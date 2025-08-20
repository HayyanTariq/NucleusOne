import React, { createContext, useContext, useState, useEffect } from 'react';
import { Training, TrainingFormData } from '@/types/training';
import { toast } from '@/hooks/use-toast';
import { trainingService } from '@/services/trainingService';
import { useAuth } from '@/contexts/AuthContext';
// Backend handles company isolation - no need for frontend validation
import { trainingActivityService } from '@/services/trainingActivityService';

interface TrainingContextType {
  trainings: Training[];
  isLoading: boolean;
  addTraining: (data: TrainingFormData) => Promise<void>;
  updateTraining: (id: string, data: TrainingFormData) => Promise<void>;
  deleteTraining: (id: string) => Promise<void>;
  getTrainingById: (id: string) => Training | undefined;
  getCertifications: () => Training[];
  getCourses: () => Training[];
  getSessions: () => Training[];
  refreshTrainings: () => Promise<void>;
  canViewAllTrainings: () => boolean;
  canAccessTraining: (training: Training) => boolean;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTrainings, setAllTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = React.useRef(false);
  
  // Add debugging to see what's happening
  console.log('🔄 TrainingProvider: Starting initialization');
  
  // Use auth context - this should work since TrainingProvider is inside AuthProvider
  const { user, isLoading: authLoading } = useAuth();
  
  console.log('✅ TrainingProvider: useAuth successful', { 
    user: user ? 'present' : 'null',
    isLoading: authLoading,
    isAuthenticated: !!user
  });

  // Backend handles all company isolation and role-based filtering
  const trainings = React.useMemo(() => {
    console.log('✅ Backend company isolation active:', {
      userCompany: user?.companyName,
      userRole: user?.role,
      totalTrainings: allTrainings.length,
      note: 'All data is pre-filtered by backend'
    });

    if (!allTrainings.length) {
      return [];
    }

    // Backend already filters by company and role - trust the response
    return allTrainings;
  }, [allTrainings, user?.companyName, user?.role]);

  // Fetch training data from backend
  const refreshTrainings = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Fetching trainings from backend...');
      console.log('👤 Current user:', user);
      console.log('🏢 User company:', user?.companyName);
      
      const allTrainings = await trainingService.getAllTrainings();
      console.log('✅ Trainings fetched successfully:', allTrainings);
      console.log('🔍 Training data details:', {
        totalCount: allTrainings.length,
        types: allTrainings.reduce((acc, t) => {
          acc[t.type] = (acc[t.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        sampleData: allTrainings.slice(0, 3).map(t => ({
          id: t.id,
          type: t.type,
          name: t.type === 'session' ? (t as any).sessionTopic : 
                t.type === 'course' ? (t as any).courseTitle : 
                t.type === 'certification' ? (t as any).certificationName : 'Unknown',
          employeeName: t.employeeName,
          companyName: t.companyName
        }))
      });
      
      // Ensure we have an array
      if (Array.isArray(allTrainings)) {
        setAllTrainings(allTrainings);
      } else {
        console.warn('⚠️ Backend returned non-array data:', allTrainings);
        setAllTrainings([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch trainings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch training data. Please check your backend connection.",
        variant: "destructive",
      });
      setAllTrainings([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch training data on mount and when user changes
  useEffect(() => {
    console.log('🔄 TrainingContext useEffect triggered:', {
      authLoading,
      hasUser: !!user,
      companyName: user?.companyName,
      role: user?.role,
      shouldFetch: !authLoading && !!user?.companyName,
      hasInitialized: hasInitialized.current
    });
    
    // Only fetch trainings if auth is ready and user is available, and we haven't initialized yet
    if (!authLoading && user?.companyName && !hasInitialized.current) {
      console.log('🔄 TrainingContext: Triggering refreshTrainings');
      console.log('🔧 User details:', { companyName: user?.companyName, role: user?.role });
      hasInitialized.current = true;
      refreshTrainings();
    } else {
      console.log('❌ TrainingContext: Not fetching trainings because:', {
        authLoading,
        hasCompanyName: !!user?.companyName,
        hasInitialized: hasInitialized.current
      });
    }
  }, [user?.companyName, authLoading]); // Reverted to specific dependency

  // Initialize activities from existing trainings when trainings are loaded
  useEffect(() => {
    if (trainings.length > 0 && user?.companyName) {
      console.log('🎯 TrainingContext: Initializing activities for trainings:', {
        totalTrainings: trainings.length,
        trainingTypes: trainings.reduce((acc, t) => {
          acc[t.type] = (acc[t.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        sampleTrainings: trainings.slice(0, 3).map(t => ({
          id: t.id,
          type: t.type,
          name: t.type === 'session' ? (t as any).sessionTopic || (t as any).SessionTopic : 
                t.type === 'course' ? (t as any).courseTitle || (t as any).CourseTitle : 
                t.type === 'certification' ? (t as any).certificationName || (t as any).CertificationName : 'Unknown',
          rawData: t // Include raw data to see what fields are actually available
        }))
      });
      trainingActivityService.initializeFromExistingTrainings(trainings, user.companyName);
    }
  }, [trainings, user?.companyName]);



  const addTraining = async (data: TrainingFormData) => {
    try {
      console.log('📤 Submitting training to backend:', data);
      
      // SECURITY: Ensure training is created for user's company
      if (!user?.companyName) {
        throw new Error('User company not found - cannot create training');
      }
      
      console.log('🏢 Security check - Training will be created for company:', user.companyName);
      
      // Submit to backend API
      const response = await trainingService.submitTraining(data);
      console.log('✅ Training created successfully:', response);
      
      // Immediately record creation activity for all training types
      if (user?.companyName && response) {
        console.log('🎯 Recording immediate creation activity for:', data.type, response);
        
        // Create a training object from the response and form data
        const newTraining = {
          id: response.id?.toString() || response.Id?.toString() || Date.now().toString(),
          type: data.type,
          employeeId: user.id ? parseInt(user.id) : 0,
          employeeName: data.employeeName || `${user.firstName} ${user.lastName}`,
          employeeEmail: user.email,
          companyId: 0,
          companyName: user.companyName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Add type-specific fields
          ...(data.type === 'session' && {
            sessionTopic: data.sessionTopic,
            SessionTopic: data.sessionTopic
          }),
          ...(data.type === 'course' && {
            courseTitle: data.courseTitle,
            CourseTitle: data.courseTitle
          }),
          ...(data.type === 'certification' && {
            certificationName: data.certificationName,
            CertificationName: data.certificationName
          }),
          ...data
        } as any;
        
        console.log('🎯 Creating activity for training object:', newTraining);
        trainingActivityService.recordCreation(newTraining, user.companyName);
      }
      
      // Add a small delay to ensure backend has processed the creation
      console.log('⏳ Waiting 1 second for backend to process...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh trainings from backend to get latest data
      await refreshTrainings();
      
      toast({
        title: "Training Added Successfully",
        description: `New ${data.type} has been submitted to the system.`,
      });
    } catch (error) {
      console.error('❌ Training submission failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add training. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTraining = async (id: string, data: TrainingFormData) => {
    try {
      console.log('📝 Updating training:', id, data);
      
      // Backend handles company isolation - just verify training exists
      const existingTraining = trainings.find(t => t.id === id);
      if (!existingTraining) {
        throw new Error('Training not found');
      }
      
      // Call backend API to create training
      await trainingService.updateTraining(id, data);
      
      // Refresh trainings from backend
      await refreshTrainings();
      
      // Record the update activity
      if (user?.companyName && existingTraining) {
        const updatedTraining = { 
          ...existingTraining, 
          ...data, 
          updatedAt: new Date().toISOString() 
        } as Training;
        trainingActivityService.recordUpdate(updatedTraining, user.companyName);
      }
      
      toast({
        title: "Training Updated",
        description: `${data.type} has been successfully updated.`,
      });
    } catch (error) {
      console.error('❌ Training update failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create training. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTraining = async (id: string) => {
    try {
      console.log('🗑️ Deleting training:', id);
      
      const training = trainings.find(t => t.id === id);
      
      if (!training) {
        throw new Error('Training not found');
      }
      
      // Backend handles company isolation - no additional checks needed
      
      // Record the deletion activity before actual deletion
      if (training && user?.companyName) {
        trainingActivityService.recordDeletion(training, user.companyName);
      }
      
      // Call backend API to delete training with type for soft delete
      await trainingService.deleteTraining(id, training?.type);
      
      // Refresh trainings from backend
      await refreshTrainings();
      
      toast({
        title: "Training Deleted",
        description: `${training?.type || 'Training'} has been successfully deleted.`,
      });
    } catch (error) {
      console.error('❌ Training deletion failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete training. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getTrainingById = (id: string) => {
    return trainings.find(training => training.id === id);
  };

  const getCertifications = () => {
    return trainings.filter(training => training.type === 'certification');
  };

  const getCourses = () => {
    return trainings.filter(training => training.type === 'course');
  };

  const getSessions = () => {
    return trainings.filter(training => training.type === 'session');
  };

  const canViewAllTrainings = () => {
    return user?.role === 'admin' || user?.role === 'owner';
  };

  const canAccessTraining = (training: Training) => {
    // Backend handles all access control - if training is in the list, user can access it
    return trainings.some(t => t.id === training.id);
  };

  const value = {
    trainings,
    isLoading,
    addTraining,
    updateTraining,
    deleteTraining,
    getTrainingById,
    getCertifications,
    getCourses,
    getSessions,
    refreshTrainings,
    canViewAllTrainings,
    canAccessTraining,
  };

  // Don't render children until auth is ready to prevent useTraining calls before provider is ready
  if (authLoading) {
    return (
      <TrainingContext.Provider value={value}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </TrainingContext.Provider>
    );
  }

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
};
