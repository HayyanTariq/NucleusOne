// API configuration and service
import { API_CONFIG } from '@/config/api';
import { CertificationRequest, CourseRequest, SessionRequest } from '@/types/training';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Auth interfaces matching your backend
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: number;
  companyName: string;
  isFirstLogin?: boolean;
  lastLogin?: string;
}

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  phoneNumber: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  phoneNumber: string;
}

export interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  department: string | null;
  position: string | null;
  phoneNumber: string | null;
  createdAt: string;
  isActive: boolean;
  lastLogin?: string;
  isFirstLogin?: boolean;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  // Try to get the secure JWT token from Nucleus One backend first
  const nucleusToken = localStorage.getItem('nucleus-app-token');
  if (nucleusToken) {
    console.log('🔍 Found secure Nucleus One JWT token');
    return nucleusToken;
  }
  
  // Fallback to regular JWT token
  const jwtToken = localStorage.getItem('auth-token');
  if (jwtToken) {
    console.log('🔍 Found regular JWT token');
    return jwtToken;
  }
  
  console.log('❌ No authentication token found');
  return null;
};

// Helper function to exchange Nucleus One token for Certify One JWT
const exchangeNucleusToken = async (): Promise<string | null> => {
  const nucleusToken = localStorage.getItem('nucleus-app-token');
  if (!nucleusToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/exchange-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nucleusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.message}`);
    }

    const data = await response.json();
    
    // Store the Certify One JWT token
    localStorage.setItem('certify-auth-token', data.token);
    localStorage.setItem('certify-user-info', JSON.stringify(data.user));
    
    return data.token;
  } catch (error) {
    throw error;
  }
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please login or launch from Nucleus One.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  console.log('🔐 Making authenticated request to:', `${API_BASE_URL}${url}`);
  console.log('🔐 Using token:', token.substring(0, 50) + '...');
  console.log('🔐 Full token for debugging:', token);
  console.log('🔐 Token type:', typeof token);
  console.log('🔐 Token length:', token.length);

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.error('❌ Authentication failed - token may be expired or invalid');
    throw new Error('Authentication expired. Please re-authenticate from Nucleus One.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API request failed:', response.status, response.statusText, errorData);
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
  }

  console.log('✅ API request successful');
  return response.json();
};

// Auth API calls
export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🔄 Attempting login to:', `${API_BASE_URL}/auth/login`);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('📡 Login response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      console.error('❌ Login error:', errorData);
      throw new Error(errorData.message || 'Invalid credentials');
    }

    return response.json();
  },

  async companySignup(signupData: SignupRequest): Promise<AuthResponse> {
    console.log('🔄 Attempting signup to:', `${API_BASE_URL}/auth/company-signup`);
    console.log('📤 Signup data:', signupData);
    
    const response = await fetch(`${API_BASE_URL}/auth/company-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    console.log('📡 Signup response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Signup failed' }));
      console.error('❌ Signup error:', errorData);
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },



  async getCurrentUser() {
    return makeAuthenticatedRequest('/auth/me');
  },

  async getCompanyUsers(role?: string): Promise<ApiUser[]> {
    // TODO: Implement when backend endpoint is available
    console.log('⚠️ Company users endpoint not implemented yet');
    return [];
    // const url = role ? `/auth/company-users?role=${role}` : '/auth/company-users';
    // return makeAuthenticatedRequest(url);
  },

  async getCertifyOneUsers(): Promise<ApiUser[]> {
    console.log('🔄 Fetching Certify One users from Nucleus One...');
    
    const nucleusToken = localStorage.getItem('nucleus-app-token');
    if (!nucleusToken) {
      console.log('❌ No Nucleus token found, falling back to local users');
      return [];
    }

    try {
      // Fetch users from Nucleus One API
      const response = await fetch(`${import.meta.env.VITE_NUCLEUS_ONE_URL || 'https://localhost:7296'}/api/Users`, {
        headers: {
          'Authorization': `Bearer ${nucleusToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('❌ Failed to fetch users from Nucleus One:', response.status, response.statusText);
        return [];
      }
      
      const result = await response.json();
      const nucleusUsers = result.data || result;
      
      // Filter users who have access to Certify One
      const certifyOneUsers = nucleusUsers.filter((nucleusUser: any) => 
        nucleusUser.appAccess && nucleusUser.appAccess['certify-one']
      );
      
      console.log('✅ Found Certify One users:', certifyOneUsers.length);
      
      // Transform Nucleus users to ApiUser interface
      return certifyOneUsers.map((nucleusUser: any) => ({
        id: nucleusUser.id,
        firstName: nucleusUser.name?.split(' ')[0] || nucleusUser.email?.split('@')[0] || '',
        lastName: nucleusUser.name?.split(' ').slice(1).join(' ') || '',
        email: nucleusUser.email,
        role: nucleusUser.appRoles?.['certify-one'] === 'admin' ? 2 : 3, // Map to Admin or Employee
        department: nucleusUser.department || null,
        position: nucleusUser.jobTitle || null,
        phoneNumber: null, // Not available from Nucleus One
        createdAt: nucleusUser.createdAt || new Date().toISOString(),
        isActive: nucleusUser.isActive !== false,
        lastLogin: nucleusUser.lastLoginAt,
        isFirstLogin: false
      }));
    } catch (error) {
      console.error('❌ Error fetching Certify One users:', error);
      return [];
    }
  },

  async createAdmin(adminData: CreateAdminRequest): Promise<ApiUser> {
    return makeAuthenticatedRequest('/auth/create-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  },

  async createEmployee(employeeData: CreateEmployeeRequest): Promise<ApiUser> {
    return makeAuthenticatedRequest('/auth/create-employee', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },
};

// Role mapping utilities
export const UserRole = {
  Owner: 1,
  Admin: 2,
  Employee: 3,
} as const;

export const roleToString = (role: number): 'owner' | 'admin' | 'employee' => {
  switch (role) {
    case UserRole.Owner:
      return 'owner';
    case UserRole.Admin:
      return 'admin';
    case UserRole.Employee:
      return 'employee';
    default:
      return 'employee';
  }
};

export const stringToRole = (role: string): number => {
  switch (role.toLowerCase()) {
    case 'owner':
      return UserRole.Owner;
    case 'admin':
      return UserRole.Admin;
    case 'employee':
      return UserRole.Employee;
    default:
      return UserRole.Employee;
  }
};

// Training API calls (matching backend endpoints)
export const trainingApi = {
  // Create operations (Employee only)
  async createCertification(certificationData: CertificationRequest): Promise<any> {
    console.log('🔄 Creating certification:', certificationData);
    return makeAuthenticatedRequest('/trainings/certifications', {
      method: 'POST',
      body: JSON.stringify(certificationData),
    });
  },

  async createCourse(courseData: CourseRequest): Promise<any> {
    console.log('🔄 Creating course:', courseData);
    return makeAuthenticatedRequest('/trainings/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  async createSession(sessionData: SessionRequest): Promise<any> {
    console.log('🔄 Creating training session:', sessionData);
    return makeAuthenticatedRequest('/trainings/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  // Get operations (Role-based access)
  async getAllSessions(): Promise<any[]> {
    console.log('🔄 Fetching all training sessions');
    return makeAuthenticatedRequest('/trainings/sessions');
  },

  async getAllCourses(): Promise<any[]> {
    console.log('🔄 Fetching all training courses');
    return makeAuthenticatedRequest('/trainings/courses');
  },

  async getAllCertifications(): Promise<any[]> {
    console.log('🔄 Fetching all certifications');
    return makeAuthenticatedRequest('/trainings/certifications');
  },

  // Legacy endpoint for backward compatibility
  async getAllTrainings(): Promise<any[]> {
    console.log('🔄 Fetching all trainings (legacy)');
    return makeAuthenticatedRequest('/trainings');
  },

  // Get individual training records by ID and type
  async getSessionById(sessionId: string): Promise<any> {
    console.log('🔍 Fetching training session by ID:', sessionId);
    return makeAuthenticatedRequest(`/trainings/sessions/${sessionId}`);
  },

  async getCourseById(courseId: string): Promise<any> {
    console.log('🔍 Fetching training course by ID:', courseId);
    return makeAuthenticatedRequest(`/trainings/courses/${courseId}`);
  },

  async getCertificationById(certificationId: string): Promise<any> {
    console.log('🔍 Fetching certification by ID:', certificationId);
    return makeAuthenticatedRequest(`/trainings/certifications/${certificationId}`);
  },

  // Legacy method for backward compatibility
  async getTrainingById(id: string): Promise<any> {
    console.log('🔍 Legacy get training by ID:', id);
    return makeAuthenticatedRequest(`/trainings/${id}`);
  },

  async updateTraining(id: string, trainingData: any): Promise<any> {
    return makeAuthenticatedRequest(`/trainings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trainingData),
    });
  },

  async deleteSession(sessionId: string): Promise<any> {
    console.log('🗑️ Soft deleting training session:', sessionId);
    return makeAuthenticatedRequest(`/trainings/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  async deleteCourse(courseId: string): Promise<any> {
    console.log('🗑️ Soft deleting training course:', courseId);
    return makeAuthenticatedRequest(`/trainings/courses/${courseId}`, {
      method: 'DELETE',
    });
  },

  async deleteCertification(certificationId: string): Promise<any> {
    console.log('🗑️ Soft deleting certification:', certificationId);
    return makeAuthenticatedRequest(`/trainings/certifications/${certificationId}`, {
      method: 'DELETE',
    });
  },

  // Update methods for type-specific training updates
  async updateSession(sessionId: string, sessionData: SessionRequest): Promise<any> {
    console.log('📝 Updating training session:', sessionId);
    return makeAuthenticatedRequest(`/trainings/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  },

  async updateCourse(courseId: string, courseData: CourseRequest): Promise<any> {
    console.log('📝 Updating training course:', courseId);
    return makeAuthenticatedRequest(`/trainings/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  async updateCertification(certificationId: string, certificationData: CertificationRequest): Promise<any> {
    console.log('📝 Updating certification:', certificationId);
    return makeAuthenticatedRequest(`/trainings/certifications/${certificationId}`, {
      method: 'PUT',
      body: JSON.stringify(certificationData),
    });
  },

  // Legacy delete method for backward compatibility
  async deleteTraining(id: string): Promise<any> {
    console.log('🗑️ Legacy delete training:', id);
    return makeAuthenticatedRequest(`/trainings/${id}`, {
      method: 'DELETE',
    });
  },
};
