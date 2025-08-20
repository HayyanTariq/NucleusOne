/**
 * Official Training Management API - TypeScript Interfaces
 * 
 * These interfaces match the official API documentation exactly
 * for proper type safety and integration.
 */

// =====================================
// REQUEST DTOs (Data Transfer Objects)
// =====================================

export interface CreateSessionDto {
  sessionTopic: string;
  instructorName: string;
  sessionDate: string; // yyyy-MM-dd format
  startTime: string;   // HH:mm format
  endTime: string;     // HH:mm format
  duration?: string;
  location?: string;
  agenda?: string;
  learnedOutcome?: string;
}

export interface CreateCourseDto {
  courseTitle: string;
  platform: string;
  startDate: string;      // yyyy-MM-dd format
  completionDate?: string; // yyyy-MM-dd format
  courseDuration?: string;
  certificateLink?: string;
  courseDescription?: string;
  skillsLearned?: string;
}

export interface CreateCertificationDto {
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;        // yyyy-MM-dd format
  expirationDate?: string;  // yyyy-MM-dd format
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  level?: string;
  skillsLearned?: string;
}

// =====================================
// RESPONSE DTOs
// =====================================

export interface SessionResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  companyId: number;
  companyName: string;
  sessionTopic: string;
  instructorName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  location?: string;
  agenda?: string;
  learnedOutcome?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CourseResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  companyId: number;
  companyName: string;
  courseTitle: string;
  platform: string;
  startDate: string;
  completionDate?: string;
  courseDuration?: string;
  certificateLink?: string;
  courseDescription?: string;
  skillsLearned?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CertificationResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  companyId: number;
  companyName: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  level?: string;
  skillsLearned?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface SoftDeleteResponseDto {
  id: number;
  type: string;
  name: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  message: string;
}

// =====================================
// ERROR RESPONSE DTOs
// =====================================

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: {
    field?: string;
    value?: string;
    expectedFormat?: string;
  };
}

export interface ValidationErrorResponse extends ApiErrorResponse {
  error: "Validation failed";
  details: {
    field: string;
    value: string;
    expectedFormat: string;
  };
}

export interface UnauthorizedErrorResponse extends ApiErrorResponse {
  error: "Unauthorized";
  message: "Invalid or expired JWT token";
}

export interface ForbiddenErrorResponse extends ApiErrorResponse {
  error: "Forbidden";
  message: string; // e.g., "You can only delete your own training sessions"
}

export interface NotFoundErrorResponse extends ApiErrorResponse {
  error: "Not Found";
  message: string; // e.g., "Training session with ID 123 not found"
}

export interface ConflictErrorResponse extends ApiErrorResponse {
  error: "Invalid Operation";
  message: string; // e.g., "Training session is already deleted"
}

export interface InternalServerErrorResponse extends ApiErrorResponse {
  error: "Internal Server Error";
  message: "An unexpected error occurred";
}

// =====================================
// UNION TYPES FOR ALL POSSIBLE RESPONSES
// =====================================

export type TrainingResponse = SessionResponseDto | CourseResponseDto | CertificationResponseDto;

export type ApiError = 
  | ValidationErrorResponse
  | UnauthorizedErrorResponse
  | ForbiddenErrorResponse
  | NotFoundErrorResponse
  | ConflictErrorResponse
  | InternalServerErrorResponse;

// =====================================
// VALIDATION CONSTRAINTS
// =====================================

export const ValidationRules = {
  session: {
    sessionTopic: { required: true, maxLength: 200 },
    instructorName: { required: true, maxLength: 100 },
    sessionDate: { required: true, format: 'yyyy-MM-dd' },
    startTime: { required: true, format: 'HH:mm' },
    endTime: { required: true, format: 'HH:mm' }, // must be after startTime
    duration: { required: false },
    location: { required: false, maxLength: 150 },
    agenda: { required: false, maxLength: 1000 },
    learnedOutcome: { required: false, maxLength: 1000 }
  },
  course: {
    courseTitle: { required: true, maxLength: 200 },
    platform: { required: true, maxLength: 100 },
    startDate: { required: true, format: 'yyyy-MM-dd' },
    completionDate: { required: false, format: 'yyyy-MM-dd' }, // must be after startDate
    courseDuration: { required: false, maxLength: 50 },
    certificateLink: { required: false, format: 'url' },
    courseDescription: { required: false, maxLength: 1000 },
    skillsLearned: { required: false, maxLength: 1000 }
  },
  certification: {
    certificationName: { required: true, maxLength: 200 },
    issuingOrganization: { required: true, maxLength: 100 },
    issueDate: { required: true, format: 'yyyy-MM-dd' },
    expirationDate: { required: false, format: 'yyyy-MM-dd' }, // must be after issueDate
    credentialId: { required: false, maxLength: 100 },
    credentialUrl: { required: false, format: 'url' },
    description: { required: false, maxLength: 1000 },
    level: { required: false, maxLength: 50 },
    skillsLearned: { required: false, maxLength: 1000 }
  }
} as const;

// =====================================
// UTILITY TYPES
// =====================================

export type TrainingType = 'session' | 'course' | 'certification';

export type CreateTrainingDto = CreateSessionDto | CreateCourseDto | CreateCertificationDto;

export type TrainingResponseDto = SessionResponseDto | CourseResponseDto | CertificationResponseDto;

// Type guards to check training types
export const isSessionResponse = (training: TrainingResponse): training is SessionResponseDto => {
  return 'sessionTopic' in training;
};

export const isCourseResponse = (training: TrainingResponse): training is CourseResponseDto => {
  return 'courseTitle' in training;
};

export const isCertificationResponse = (training: TrainingResponse): training is CertificationResponseDto => {
  return 'certificationName' in training;
};

// Helper to get training name regardless of type
export const getTrainingName = (training: TrainingResponse): string => {
  if (isSessionResponse(training)) {
    return training.sessionTopic;
  } else if (isCourseResponse(training)) {
    return training.courseTitle;
  } else if (isCertificationResponse(training)) {
    return training.certificationName;
  }
  return 'Unknown Training';
};

// Helper to get training type
export const getTrainingType = (training: TrainingResponse): TrainingType => {
  if (isSessionResponse(training)) {
    return 'session';
  } else if (isCourseResponse(training)) {
    return 'course';
  } else if (isCertificationResponse(training)) {
    return 'certification';
  }
  throw new Error('Unknown training type');
};
