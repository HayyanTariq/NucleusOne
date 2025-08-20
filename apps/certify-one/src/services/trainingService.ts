import { TrainingFormData } from '@/types/training';
import { certifyApi } from './certifyApiClient';
import { transformTrainingFormData } from '@/utils/trainingTransformer';

/**
 * Training service that handles form submissions to backend API
 */
export const trainingService = {
  /**
   * Submit training form data to appropriate backend endpoint
   */
  async submitTraining(formData: TrainingFormData): Promise<any> {
    try {
      // Transform form data to backend API format
      const apiData = transformTrainingFormData(formData);
      
      console.log('📤 Transformed API data being sent to backend:', {
        type: formData.type,
        data: apiData,
        includesCompanyData: !!(apiData.CompanyId || apiData.CompanyName),
        includesEmployeeData: !!(apiData.EmployeeId || apiData.EmployeeEmail)
      });
      
      // Call appropriate API endpoint based on training type
      switch (formData.type) {
        case 'certification':
          console.log('🎓 Submitting certification:', apiData);
          return await certifyApi.createCertification(apiData as any);
          
        case 'course':
          console.log('📚 Submitting course:', apiData);
          return await certifyApi.createCourse(apiData as any);
          
        case 'session':
          console.log('👨‍🏫 Submitting session:', apiData);
          return await certifyApi.createSession(apiData as any);
          
        default:
          throw new Error(`Unsupported training type: ${formData.type}`);
      }
    } catch (error) {
      console.error('❌ Training submission failed:', error);
      throw error;
    }
  },

  /**
   * Get all trainings (combined from all endpoints)
   */
  async getAllTrainings(): Promise<any[]> {
    try {
      console.log('🔄 Fetching all training data from separate endpoints...');
      
      // Fetch from all three endpoints in parallel
      console.log('🌐 Making API calls to fetch trainings...');
      const [sessionsResponse, coursesResponse, certificationsResponse] = await Promise.all([
        certifyApi.getSessions().catch(err => {
          console.warn('⚠️ Failed to fetch sessions:', err.message);
          console.error('❌ Sessions API Error Details:', err);
          return [];
        }),
        certifyApi.getCourses().catch(err => {
          console.warn('⚠️ Failed to fetch courses:', err.message);
          console.error('❌ Courses API Error Details:', err);
          return [];
        }),
        certifyApi.getCertifications().catch(err => {
          console.warn('⚠️ Failed to fetch certifications:', err.message);
          console.error('❌ Certifications API Error Details:', err);
          return [];
        })
      ]);

      console.log('📡 Raw API responses:', {
        sessionsResponse: sessionsResponse,
        coursesResponse: coursesResponse,
        certificationsResponse: certificationsResponse
      });

      console.log('🔍 Response structure analysis:', {
        sessionsIsArray: Array.isArray(sessionsResponse),
        coursesIsArray: Array.isArray(coursesResponse),
        certificationsIsArray: Array.isArray(certificationsResponse),
        sessionsLength: sessionsResponse?.length || 0,
        coursesLength: coursesResponse?.length || 0,
        certificationsLength: certificationsResponse?.length || 0
      });

      // Extract data arrays from backend response format
      const sessions = Array.isArray(sessionsResponse) ? sessionsResponse : [];
      const courses = Array.isArray(coursesResponse) ? coursesResponse : [];
      const certifications = Array.isArray(certificationsResponse) ? certificationsResponse : [];

      // Combine and transform the data
      const allTrainings = [
        ...sessions.map(session => ({ ...session, type: 'session' })),
        ...courses.map(course => ({ ...course, type: 'course' })),
        ...certifications.map(cert => ({ ...cert, type: 'certification' }))
      ];

      console.log('✅ Successfully fetched training data:', {
        sessions: sessions.length,
        courses: courses.length,
        certifications: certifications.length,
        total: allTrainings.length,
        sampleData: allTrainings.slice(0, 2) // Log sample for debugging
      });

      return allTrainings;
    } catch (error) {
      console.error('❌ Failed to fetch trainings:', error);
      throw error;
    }
  },

  /**
   * Get training sessions only
   */
  async getAllSessions(): Promise<any[]> {
    try {
      const sessions = await certifyApi.getSessions();
      return sessions.map(session => ({ ...session, type: 'session' }));
    } catch (error) {
      console.error('❌ Failed to fetch training sessions:', error);
      throw error;
    }
  },

  /**
   * Get training courses only
   */
  async getAllCourses(): Promise<any[]> {
    try {
      const courses = await certifyApi.getCourses();
      return courses.map(course => ({ ...course, type: 'course' }));
    } catch (error) {
      console.error('❌ Failed to fetch training courses:', error);
      throw error;
    }
  },

  /**
   * Get certifications only
   */
  async getAllCertifications(): Promise<any[]> {
    try {
      const certifications = await certifyApi.getCertifications();
      return certifications.map(cert => ({ ...cert, type: 'certification' }));
    } catch (error) {
      console.error('❌ Failed to fetch certifications:', error);
      throw error;
    }
  },

  /**
   * Get training by ID and type
   */
  async getTrainingById(id: string, type?: string): Promise<any> {
    try {
      // Use type-specific get method if type is provided
      if (type) {
        switch (type) {
          case 'session':
            console.log('🔍 Getting training session:', id);
            return await certifyApi.getSessionById(parseInt(id));
          case 'course':
            console.log('🔍 Getting training course:', id);
            return await certifyApi.getCourseById(parseInt(id));
          case 'certification':
            console.log('🔍 Getting certification:', id);
            return await certifyApi.getCertificationById(parseInt(id));
          default:
            console.log('🔍 Using legacy get for unknown type:', type);
            return await certifyApi.getTrainingById(parseInt(id));
        }
      } else {
        // Fallback to legacy get method
        console.log('🔍 Using legacy get (no type specified):', id);
        return await certifyApi.getTrainingById(parseInt(id));
      }
    } catch (error) {
      console.error(`❌ Failed to fetch training ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<any> {
    try {
      console.log('🔍 Fetching session:', sessionId);
      return await certifyApi.getSessionById(parseInt(sessionId));
    } catch (error) {
      console.error(`❌ Failed to fetch session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Get course by ID
   */
  async getCourseById(courseId: string): Promise<any> {
    try {
      console.log('🔍 Fetching course:', courseId);
      return await certifyApi.getCourseById(parseInt(courseId));
    } catch (error) {
      console.error(`❌ Failed to fetch course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Get certification by ID
   */
  async getCertificationById(certificationId: string): Promise<any> {
    try {
      console.log('🔍 Fetching certification:', certificationId);
      return await certifyApi.getCertificationById(parseInt(certificationId));
    } catch (error) {
      console.error(`❌ Failed to fetch certification ${certificationId}:`, error);
      throw error;
    }
  },

  /**
   * Update training based on type and ID
   */
  async updateTraining(id: string, formData: TrainingFormData): Promise<any> {
    try {
      const apiData = transformTrainingFormData(formData);
      
      // Use type-specific update method if type is provided
      if (formData.type) {
        switch (formData.type) {
          case 'session':
            console.log('📝 Updating training session:', id);
            return await certifyApi.updateSession(parseInt(id), apiData as any);
          case 'course':
            console.log('📝 Updating training course:', id);
            return await certifyApi.updateCourse(parseInt(id), apiData as any);
          case 'certification':
            console.log('📝 Updating certification:', id);
            return await certifyApi.updateCertification(parseInt(id), apiData as any);
          default:
            console.log('📝 Using legacy update for unknown type:', formData.type);
            return await certifyApi.updateTraining(parseInt(id), apiData);
        }
      } else {
        // Fallback to legacy update method
        console.log('📝 Using legacy update (no type specified):', id);
        return await certifyApi.updateTraining(parseInt(id), apiData);
      }
    } catch (error) {
      console.error(`❌ Failed to update training ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update session by ID
   */
  async updateSession(sessionId: string, formData: TrainingFormData): Promise<any> {
    try {
      const apiData = transformTrainingFormData(formData);
      console.log('📝 Updating session:', sessionId);
      return await certifyApi.updateSession(parseInt(sessionId), apiData as any);
    } catch (error) {
      console.error(`❌ Failed to update session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Update course by ID
   */
  async updateCourse(courseId: string, formData: TrainingFormData): Promise<any> {
    try {
      const apiData = transformTrainingFormData(formData);
      console.log('📝 Updating course:', courseId);
      return await certifyApi.updateCourse(parseInt(courseId), apiData as any);
    } catch (error) {
      console.error(`❌ Failed to update course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Update certification by ID
   */
  async updateCertification(certificationId: string, formData: TrainingFormData): Promise<any> {
    try {
      const apiData = transformTrainingFormData(formData);
      console.log('📝 Updating certification:', certificationId);
      return await certifyApi.updateCertification(parseInt(certificationId), apiData as any);
    } catch (error) {
      console.error(`❌ Failed to update certification ${certificationId}:`, error);
      throw error;
    }
  },

  /**
   * Delete training based on type and ID
   */
  async deleteTraining(id: string, type?: string): Promise<any> {
    try {
      // If type is provided, use specific delete method
      if (type) {
        switch (type) {
          case 'session':
            console.log('🗑️ Deleting training session:', id);
            return await certifyApi.deleteSession(parseInt(id));
          case 'course':
            console.log('🗑️ Deleting training course:', id);
            return await certifyApi.deleteCourse(parseInt(id));
          case 'certification':
            console.log('🗑️ Deleting certification:', id);
            return await certifyApi.deleteCertification(parseInt(id));
          default:
            console.log('🗑️ Using legacy delete for unknown type:', type);
            return await certifyApi.deleteTraining(parseInt(id));
        }
      } else {
        // Fallback to legacy delete method
        console.log('🗑️ Using legacy delete (no type specified):', id);
        return await certifyApi.deleteTraining(parseInt(id));
      }
    } catch (error) {
      console.error(`❌ Failed to delete training ${id}:`, error);
      throw error;
    }
  },

  /**
   * Soft delete session by ID
   */
  async deleteSession(sessionId: string): Promise<any> {
    try {
      console.log('🗑️ Soft deleting session:', sessionId);
      return await certifyApi.deleteSession(parseInt(sessionId));
    } catch (error) {
      console.error(`❌ Failed to delete session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Soft delete course by ID
   */
  async deleteCourse(courseId: string): Promise<any> {
    try {
      console.log('🗑️ Soft deleting course:', courseId);
      return await certifyApi.deleteCourse(parseInt(courseId));
    } catch (error) {
      console.error(`❌ Failed to delete course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Soft delete certification by ID
   */
  async deleteCertification(certificationId: string): Promise<any> {
    try {
      console.log('🗑️ Soft deleting certification:', certificationId);
      return await certifyApi.deleteCertification(parseInt(certificationId));
    } catch (error) {
      console.error(`❌ Failed to delete certification ${certificationId}:`, error);
      throw error;
    }
  },
};
