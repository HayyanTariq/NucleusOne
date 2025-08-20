export type TrainingType = 'session' | 'course' | 'certification';

export type TrainingStatus = 'completed' | 'in-progress' | 'scheduled' | 'pending';

export interface BaseTraining {
  id: string;
  type: TrainingType;
  // Employee information from backend
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  // Company information from backend
  companyId: number;
  companyName: string;
  // Legacy fields for compatibility
  role?: string;
  department?: string;
  category?: string;
  status?: TrainingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionTraining extends BaseTraining {
  type: 'session';
  instructorName: string;
  sessionTopic: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: 'online' | 'on-site';
  agenda: string;
  learnedOutcome: string;
}

export interface CourseTraining extends BaseTraining {
  type: 'course';
  courseTitle: string;
  platform: string;
  startDate: string;
  completionDate?: string;
  courseDuration: string;
  certificateLink?: string;
  courseDescription: string;
  outcomesLearned?: string;
  skillsLearned: string[];
  certificateFile?: File;
}

export interface CertificationTraining extends BaseTraining {
  type: 'certification';
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description: string;
  skillsLearned: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certificateFile?: File;
}

export type Training = SessionTraining | CourseTraining | CertificationTraining;

// API Request Bodies for Training Creation (matching backend DTOs)

// Certification API Request Body (CreateCertificationDto)
export interface CertificationRequest {
  CertificationName: string;
  IssuingOrganization: string;
  IssueDate: string; // ISO format
  ExpirationDate?: string; // ISO format, optional
  CredentialId: string;
  CredentialUrl: string; // valid URL
  Description: string;
  Level: string; // beginner, intermediate, advanced, expert
  SkillsLearned: string[];
}

// Course API Request Body (CreateCourseDto)
export interface CourseRequest {
  CourseTitle: string;
  Platform: string;
  StartDate: string; // ISO format
  CompletionDate?: string; // ISO format, optional
  CourseDuration: string;
  CertificateLink: string; // valid URL
  CourseDescription: string;
  SkillsLearned: string[];
}

// Training Session API Request Body (CreateSessionDto)
export interface SessionRequest {
  SessionTopic: string;
  InstructorName: string;
  SessionDate: string; // ISO format
  StartTime: string;
  EndTime: string;
  Duration: string;
  Location: string; // online or on-site
  Agenda: string;
  LearnedOutcome: string;
}

// Form Data Interface (for frontend form handling)
export interface TrainingFormData {
  // Training type selector
  type: TrainingType;
  
  // Employee information (added from context during submission)
  employeeName?: string;
  
  // Session fields
  sessionTopic?: string;
  instructorName?: string;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  location?: 'online' | 'on-site';
  agenda?: string;
  learnedOutcome?: string;

  // Course fields
  courseTitle?: string;
  platform?: string;
  startDate?: string;
  completionDate?: string;
  courseDuration?: string;
  certificateLink?: string;
  courseDescription?: string;
  outcomesLearned?: string;

  // Certification fields
  certificationName?: string;
  issuingOrganization?: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  // Common to Course and Certification
  skillsLearned?: string[];
  certificateFile?: File;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  department: string;
  phone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  hireDate?: string;
  employeeId?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingFilters {
  search?: string;
  type?: TrainingType | 'all';
  status?: TrainingStatus | 'all';
  department?: string | 'all';
  category?: string | 'all';
  dateFrom?: string;
  dateTo?: string;
  employee?: string | 'all';
}

export interface Course {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  companyId: number;
  createdBy: number;
  createdAt: string;
  isEnrolled?: boolean;
  progressPercentage?: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  content: string;
  durationMinutes: number;
  orderIndex: number;
  isCompleted?: boolean;
  completedAt?: string;
  score?: number;
}

export interface UserEnrollment {
  id: number;
  userId: number;
  courseId: number;
  companyId: number;
  enrolledAt: string;
  progressPercentage: number;
  course?: Course;
}

export interface LessonCompletion {
  id: number;
  userId: number;
  lessonId: number;
  completedAt: string;
  score?: number;
  lesson?: Lesson;
}

export interface UserProgress {
  userId: number;
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  enrollments: UserEnrollment[];
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  durationMinutes: number;
  lessons?: CreateLessonRequest[];
}

export interface CreateLessonRequest {
  title: string;
  content: string;
  durationMinutes: number;
  orderIndex: number;
}

export interface CompleteLessonRequest {
  courseId: number;
  lessonId: number;
  score?: number;
}

export interface CompanyAnalytics {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  averageCompletionRate: number;
  topCourses: Course[];
  recentActivity: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}