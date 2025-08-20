import { TrainingFormData, CertificationRequest, CourseRequest, SessionRequest } from '@/types/training';

/**
 * Transforms frontend form data to backend API format
 */
export const transformTrainingFormData = (formData: TrainingFormData) => {
  // Get user info from localStorage for company/employee data
  const nucleusToken = localStorage.getItem('nucleus-app-token');
  let userData = null;
  
  if (nucleusToken) {
    try {
      const tokenParts = nucleusToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        userData = payload;
      }
    } catch (error) {
      console.warn('Failed to decode user data from token:', error);
    }
  }

  const baseData = {
    // Only include company information - let backend extract employee from JWT
    CompanyId: userData?.companyId || 0,
    CompanyName: userData?.companyName || 'Unknown Company'
    // Remove EmployeeId, EmployeeName, EmployeeEmail - let backend get from JWT token
  };

  console.log('👤 User data from token:', userData);
  console.log('🏢 Base data being sent:', baseData);

  switch (formData.type) {
    case 'certification':
      return { ...transformToCertificationRequest(formData), ...baseData };
    case 'course':
      return { ...transformToCourseRequest(formData), ...baseData };
    case 'session':
      return { ...transformToSessionRequest(formData), ...baseData };
    default:
      throw new Error(`Unsupported training type: ${formData.type}`);
  }
};

/**
 * Utility function to format dates to yyyy-MM-dd format
 */
const formatDateToYYYYMMDD = (dateString: string | undefined) => {
  if (!dateString) return undefined;
  try {
    // If already in yyyy-MM-dd format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Get only the date part
  } catch {
    return dateString; // Return as-is if invalid
  }
};

/**
 * Transform form data to CertificationRequest (CreateCertificationDto)
 */
const transformToCertificationRequest = (formData: TrainingFormData): CertificationRequest => {
  return {
    CertificationName: formData.certificationName || '',
    IssuingOrganization: formData.issuingOrganization || '',
    IssueDate: formatDateToYYYYMMDD(formData.issueDate) || '',
    ExpirationDate: formatDateToYYYYMMDD(formData.expirationDate),
    CredentialId: formData.credentialId || '',
    CredentialUrl: formData.credentialUrl || '',
    Description: formData.description || '',
    Level: formData.level || 'beginner',
    SkillsLearned: formData.skillsLearned || [],
  };
};

/**
 * Transform form data to CourseRequest (CreateCourseDto)
 */
const transformToCourseRequest = (formData: TrainingFormData): CourseRequest => {
  return {
    CourseTitle: formData.courseTitle || '',
    Platform: formData.platform || '',
    StartDate: formatDateToYYYYMMDD(formData.startDate) || '',
    CompletionDate: formatDateToYYYYMMDD(formData.completionDate),
    CourseDuration: formData.courseDuration || '',
    CertificateLink: formData.certificateLink || '',
    CourseDescription: formData.courseDescription || '',
    SkillsLearned: formData.skillsLearned || [],
  };
};

/**
 * Transform form data to SessionRequest (CreateSessionDto)
 */
const transformToSessionRequest = (formData: TrainingFormData): SessionRequest => {
  return {
    SessionTopic: formData.sessionTopic || '',
    InstructorName: formData.instructorName || '',
    SessionDate: formatDateToYYYYMMDD(formData.sessionDate) || '',
    StartTime: formData.startTime || '',
    EndTime: formData.endTime || '',
    Duration: formData.duration || '',
    Location: formData.location || 'online',
    Agenda: formData.agenda || '',
    LearnedOutcome: formData.learnedOutcome || '',
  };
};
