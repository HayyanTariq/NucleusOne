/**
 * Official Training Management API Service
 * 
 * This service implements the complete Training Management API as documented
 * in the official API integration guide. Supports full CRUD operations with
 * soft delete functionality and audit trail capabilities.
 */

import {
  CreateSessionDto,
  CreateCourseDto,
  CreateCertificationDto,
  SessionResponseDto,
  CourseResponseDto,
  CertificationResponseDto,
  SoftDeleteResponseDto,
  ApiErrorResponse,
  TrainingResponse,
  getTrainingName,
  getTrainingType
} from '@/types/officialTrainingApi';

/**
 * Training API Service Class
 */
export class TrainingApiService {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string = '/api', token?: string) {
    this.baseUrl = baseUrl;
    this.token = token || this.getTokenFromStorage();
  }

  private getTokenFromStorage(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jwt-token') || sessionStorage.getItem('jwt-token') || '';
    }
    return '';
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        error: 'Unknown Error',
        message: `HTTP error! status: ${response.status}`
      }));
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ==========================================
  // TRAINING SESSIONS
  // ==========================================

  /**
   * Create a new training session
   * @param sessionData Session creation data
   * @returns Created session response
   */
  async createSession(sessionData: CreateSessionDto): Promise<SessionResponseDto> {
    const response = await fetch(`${this.baseUrl}/training/sessions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(sessionData)
    });

    return this.handleResponse<SessionResponseDto>(response);
  }

  /**
   * Get training sessions (excludes soft-deleted records)
   * Role-based access: Employees see only their own, Admins/Owners see all company sessions
   * @returns Array of session responses
   */
  async getSessions(): Promise<SessionResponseDto[]> {
    const response = await fetch(`${this.baseUrl}/training/sessions`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<SessionResponseDto[]>(response);
  }

  /**
   * Get all sessions with audit trail (includes soft-deleted records)
   * @returns Array of session responses including deleted ones
   */
  async getSessionsWithAudit(): Promise<SessionResponseDto[]> {
    const response = await fetch(`${this.baseUrl}/training/sessions/audit`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<SessionResponseDto[]>(response);
  }

  /**
   * Soft delete a training session
   * Permissions: Employees can delete only their own, Admins/Owners can delete any in their company
   * @param sessionId Session ID to delete
   * @returns Soft delete response
   */
  async deleteSession(sessionId: number): Promise<SoftDeleteResponseDto> {
    const response = await fetch(`${this.baseUrl}/training/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse<SoftDeleteResponseDto>(response);
  }

  // ==========================================
  // TRAINING COURSES
  // ==========================================

  /**
   * Create a new training course
   * @param courseData Course creation data
   * @returns Created course response
   */
  async createCourse(courseData: CreateCourseDto): Promise<CourseResponseDto> {
    const response = await fetch(`${this.baseUrl}/training/courses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(courseData)
    });

    return this.handleResponse<CourseResponseDto>(response);
  }

  /**
   * Get training courses (excludes soft-deleted records)
   * @returns Array of course responses
   */
  async getCourses(): Promise<CourseResponseDto[]> {
    const response = await fetch(`${this.baseUrl}/training/courses`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<CourseResponseDto[]>(response);
  }

  /**
   * Get all courses with audit trail (includes soft-deleted records)
   * @returns Array of course responses including deleted ones
   */
  async getCoursesWithAudit(): Promise<CourseResponseDto[]> {
    const response = await fetch(`${this.baseUrl}/training/courses/audit`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<CourseResponseDto[]>(response);
  }

  /**
   * Soft delete a training course
   * @param courseId Course ID to delete
   * @returns Soft delete response
   */
  async deleteCourse(courseId: number): Promise<SoftDeleteResponseDto> {
    const response = await fetch(`${this.baseUrl}/training/courses/${courseId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse<SoftDeleteResponseDto>(response);
  }

  // ==========================================
  // CERTIFICATIONS
  // ==========================================

  /**
   * Create a new certification
   * @param certData Certification creation data
   * @returns Created certification response
   */
  async createCertification(certData: CreateCertificationDto): Promise<CertificationResponseDto> {
    const response = await fetch(`${this.baseUrl}/training/certifications`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(certData)
    });

    return this.handleResponse<CertificationResponseDto>(response);
  }

  /**
   * Get certifications (excludes soft-deleted records)
   * @returns Array of certification responses
   */
  async getCertifications(): Promise<CertificationResponseDto[]> {
    const response = await fetch(`${this.baseUrl}/training/certifications`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<CertificationResponseDto[]>(response);
  }

  /**
   * Get all certifications with audit trail (includes soft-deleted records)
   * @returns Array of certification responses including deleted ones
   */
  async getCertificationsWithAudit(): Promise<CertificationResponseDto[]> {
    const response = await fetch(`${this.baseUrl}/training/certifications/audit`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<CertificationResponseDto[]>(response);
  }

  /**
   * Soft delete a certification
   * @param certId Certification ID to delete
   * @returns Soft delete response
   */
  async deleteCertification(certId: number): Promise<SoftDeleteResponseDto> {
    const response = await fetch(`${this.baseUrl}/training/certifications/${certId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse<SoftDeleteResponseDto>(response);
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Get all training activities with audit trail for recent activities feed
   * This method combines all three training types for the activity feed
   * @returns Combined array of all training activities
   */
  async getAllTrainingActivities(): Promise<(SessionResponseDto | CourseResponseDto | CertificationResponseDto)[]> {
    try {
      const [sessions, courses, certifications] = await Promise.all([
        this.getSessionsWithAudit(),
        this.getCoursesWithAudit(),
        this.getCertificationsWithAudit()
      ]);

      // Add type property for easier identification in the UI
      const typedSessions = sessions.map(session => ({ ...session, type: 'session' as const }));
      const typedCourses = courses.map(course => ({ ...course, type: 'course' as const }));
      const typedCertifications = certifications.map(cert => ({ ...cert, type: 'certification' as const }));

      // Combine all activities and sort by most recent first
      const allActivities = [...typedSessions, ...typedCourses, ...typedCertifications];
      
      return allActivities.sort((a, b) => {
        const aDate = new Date(a.updatedAt || a.createdAt);
        const bDate = new Date(b.updatedAt || b.createdAt);
        return bDate.getTime() - aDate.getTime(); // Most recent first
      });
    } catch (error) {
      console.error('Error fetching training activities:', error);
      throw error;
    }
  }

  /**
   * Get only active (non-deleted) training activities for regular display
   * @returns Combined array of active training activities
   */
  async getActiveTrainingActivities(): Promise<(SessionResponseDto | CourseResponseDto | CertificationResponseDto)[]> {
    try {
      const [sessions, courses, certifications] = await Promise.all([
        this.getSessions(),
        this.getCourses(),
        this.getCertifications()
      ]);

      // Add type property for easier identification in the UI
      const typedSessions = sessions.map(session => ({ ...session, type: 'session' as const }));
      const typedCourses = courses.map(course => ({ ...course, type: 'course' as const }));
      const typedCertifications = certifications.map(cert => ({ ...cert, type: 'certification' as const }));

      // Combine all activities and sort by most recent first
      const allActivities = [...typedSessions, ...typedCourses, ...typedCertifications];
      
      return allActivities.sort((a, b) => {
        const aDate = new Date(a.updatedAt || a.createdAt);
        const bDate = new Date(b.updatedAt || b.createdAt);
        return bDate.getTime() - aDate.getTime(); // Most recent first
      });
    } catch (error) {
      console.error('Error fetching active training activities:', error);
      throw error;
    }
  }

  /**
   * Update JWT token
   * @param token New JWT token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get current JWT token
   * @returns Current JWT token
   */
  getToken(): string {
    return this.token;
  }
}

// Export a default instance
export const trainingApi = new TrainingApiService();

// Export individual response types for easier importing
export type {
  SessionResponseDto as TrainingSession,
  CourseResponseDto as TrainingCourse,
  CertificationResponseDto as TrainingCertification,
  SoftDeleteResponseDto,
  ApiErrorResponse
};
