import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// API Configuration
import { API_BASE_URL } from '@/config/api';



// Types
export interface App {
  id: string;
  name: string;
  description: string;
  pricing: string;
  icon: string;
  category: string;
}

export interface ProfileDetails {
  gender?: string;
  cnic?: string;
  nationality?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  medicalCondition?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinContactNumber?: string;
  profilePhotoUrl?: string;
}

export interface ProfileResponse {
  userId: number;
  profileDetails: ProfileDetails;
  isProfileComplete: boolean;
  completionPercentage: number;
}

export interface EmployeeProfile {
  userId: number;
  userName: string;
  userEmail: string;
  department?: string;
  jobTitle?: string;
  profileDetails: ProfileDetails;
  isProfileComplete: boolean;
  completionPercentage: number;
}

export interface EmployeeProfilesResponse {
  employees: EmployeeProfile[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProfileCompletionResponse {
  userId: number;
  completionPercentage: number;
  isProfileComplete: boolean;
}

export interface PhotoUploadResponse {
  photoUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface User {
  id: string;
  companyId: string | null;
  email: string;
  password?: string; // Optional for API responses
  name: string;
  role: 'owner' | 'admin' | 'employee' | 'super_admin';
  jobTitle?: string;
  department?: string;
  appAccess: Record<string, boolean>;
  appRoles?: Record<string, 'admin' | 'employee'>; // Role within each app
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  profilePhoto?: string; // Optional profile photo URL
  profileDetails?: ProfileDetails; // Backend profile details
  isProfileComplete?: boolean;
  completionPercentage?: number;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  ownerUserId: string;
  subscribedAppIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    company: Company;
    token: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp?: string;
  requestId?: string;
}

// API Service Functions
class ApiService {
  private static isLoggingIn = false; // Flag to prevent token refresh during login
  
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401 && !this.isLoggingIn) {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { token: newToken, refreshToken: newRefreshToken } = await this.refreshToken(refreshToken);
          localStorage.setItem('accessToken', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          return { token: newToken, refreshToken: newRefreshToken } as T;
        } catch (refreshError) {
          // Clear invalid tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          throw new Error('Authentication failed. Please log in again.');
        }
      } else {
        localStorage.removeItem('accessToken');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed. Please log in again.');
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  }

  // Authentication APIs
  static async registerCompany(companyData: {
    companyName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
  }): Promise<AuthResponse> {
    const url = `${API_BASE_URL}/Auth/register-company`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });
      
      const rawData = await this.handleResponse<any>(response);
      
      // Transform backend response to match our interface
      const transformedResponse: AuthResponse = {
        success: rawData.success !== false,
        message: rawData.message || 'Company registered successfully',
        data: {
          user: {
            id: rawData.user?.id?.toString() || rawData.userId?.toString() || 'temp-id',
            companyId: rawData.user?.companyId?.toString() || rawData.companyId?.toString() || null,
            email: rawData.user?.email || rawData.email || companyData.ownerEmail,
            name: rawData.user?.name || rawData.name || companyData.ownerName,
            role: (rawData.user?.role || rawData.role || 'owner').toLowerCase(),
            appAccess: rawData.user?.appAccess || { 'certify-one': true },
            appRoles: rawData.user?.appRoles || { 'certify-one': 'admin' },
            isActive: rawData.user?.isActive !== false,
            createdAt: rawData.user?.createdAt || new Date().toISOString(),
            jobTitle: rawData.user?.jobTitle,
            department: rawData.user?.department
          },
          company: {
            id: rawData.company?.id?.toString() || rawData.companyId?.toString() || 'temp-company-id',
            name: rawData.company?.name || rawData.companyName || companyData.companyName,
            ownerUserId: rawData.company?.ownerUserId?.toString() || rawData.user?.id?.toString() || 'temp-id',
            subscribedAppIds: rawData.company?.subscribedAppIds || ['certify-one'],
            createdAt: rawData.company?.createdAt || new Date().toISOString(),
            domain: rawData.company?.domain,
            updatedAt: rawData.company?.updatedAt
          },
          token: rawData.token || rawData.accessToken || '',
          refreshToken: rawData.refreshToken || rawData.refresh_token || ''
        }
      };
      
      console.log('✅ Transformed response:', transformedResponse);
      return transformedResponse;
    } catch (error) {
      console.error('❌ Network Error:', error);
      console.error('🔍 Debug Info:', {
        url: `${API_BASE_URL}/Auth/register-company`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const url = `${API_BASE_URL}/Auth/login`;
    console.log('🚀 Logging in:', { url, email: credentials.email });
    
    try {
      this.isLoggingIn = true; // Prevent token refresh during login
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const rawData = await this.handleResponse<any>(response);
      
      // Transform backend response to match our interface
      const transformedResponse: AuthResponse = {
        success: rawData.success !== false,
        message: rawData.message || 'Login successful',
        data: {
          user: {
            id: rawData.user?.id?.toString() || rawData.userId?.toString() || 'temp-id',
            companyId: rawData.user?.companyId?.toString() || rawData.companyId?.toString() || null,
            email: rawData.user?.email || rawData.email || credentials.email,
            name: rawData.user?.name || rawData.name || rawData.userName || '',
            role: (rawData.user?.role || rawData.role || 'employee').toLowerCase(),
            appAccess: rawData.user?.appAccess || rawData.appAccess || {},
            appRoles: rawData.user?.appRoles || rawData.appRoles || {},
            isActive: rawData.user?.isActive !== false,
            createdAt: rawData.user?.createdAt || rawData.createdAt || new Date().toISOString(),
            jobTitle: rawData.user?.jobTitle || rawData.jobTitle,
            department: rawData.user?.department || rawData.department,
            lastLoginAt: rawData.user?.lastLoginAt || rawData.lastLoginAt
          },
          company: {
            id: rawData.company?.id?.toString() || rawData.companyId?.toString() || 'temp-company-id',
            name: rawData.company?.name || rawData.companyName || '',
            ownerUserId: rawData.company?.ownerUserId?.toString() || rawData.user?.id?.toString() || 'temp-id',
            subscribedAppIds: rawData.company?.subscribedAppIds || rawData.subscribedAppIds || [],
            createdAt: rawData.company?.createdAt || rawData.companyCreatedAt || new Date().toISOString(),
            domain: rawData.company?.domain || rawData.companyDomain,
            updatedAt: rawData.company?.updatedAt || rawData.companyUpdatedAt
          },
          token: rawData.token || rawData.accessToken || rawData.access_token || '',
          refreshToken: rawData.refreshToken || rawData.refresh_token || ''
        }
      };
      
      return transformedResponse;
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isLoggingIn = false; // Reset flag after login attempt
    }
  }

  static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const result = await this.handleResponse<{ success: boolean; data: { token: string; refreshToken: string } }>(response);
    return result.data;
  }

  static async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/Auth/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    const result = await this.handleResponse<{ success: boolean; message: string }>(response);
    return result;
  }

  // Profile Management APIs
  static async getUserProfile(userId?: string): Promise<{ success: boolean; data: ProfileResponse }> {
    const url = userId ? `${API_BASE_URL}/Profile/${userId}` : `${API_BASE_URL}/Profile`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    
    const result = await this.handleResponse<{ success: boolean; data: ProfileResponse }>(response);
    return result;
  }

  static async updateUserProfile(profileData: ProfileDetails): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/Profile`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    
    const result = await this.handleResponse<{ success: boolean; message: string }>(response);
    return result;
  }

  static async updateUserProfileAdmin(userId: string, profileData: ProfileDetails): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/Profile/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    
    const result = await this.handleResponse<{ success: boolean; message: string }>(response);
    return result;
  }

  static async getEmployeeProfiles(params?: { 
    page?: number; 
    pageSize?: number; 
    search?: string; 
    department?: string;
    role?: string;
    isProfileComplete?: boolean;
  }): Promise<{ success: boolean; data: EmployeeProfilesResponse }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isProfileComplete !== undefined) queryParams.append('isProfileComplete', params.isProfileComplete.toString());

    const response = await fetch(`${API_BASE_URL}/Profile/employees?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    
    const result = await this.handleResponse<{ success: boolean; data: EmployeeProfilesResponse }>(response);
    return result;
  }

  static async uploadProfilePhoto(file: File): Promise<{ success: boolean; data: PhotoUploadResponse }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/Profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });
    
    const result = await this.handleResponse<{ success: boolean; data: PhotoUploadResponse }>(response);
    return result;
  }

  static async deleteProfile(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/Profile/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    const result = await this.handleResponse<{ success: boolean; message: string }>(response);
    return result;
  }

  static async getProfileCompletion(userId?: string): Promise<{ success: boolean; data: ProfileCompletionResponse }> {
    const url = userId ? `${API_BASE_URL}/Profile/completion/${userId}` : `${API_BASE_URL}/Profile/completion`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    
    const result = await this.handleResponse<{ success: boolean; data: ProfileCompletionResponse }>(response);
    return result;
  }

  // User Management APIs
  static async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<any>(response);
    
    console.log('🔍 Backend users response:', result);
    
    // Handle both ApiResponse wrapper and raw array formats
    let usersArray: any[] = [];
    
    if (result.success && Array.isArray(result.data)) {
      // ApiResponse wrapper format: { success: true, data: [...] }
      usersArray = result.data;
    } else if (Array.isArray(result)) {
      // Raw array format: [...]
      usersArray = result;
    } else {
      console.error('❌ Unexpected response format:', result);
      throw new Error('Invalid response format from server');
    }
    
    return usersArray.map((user: any) => {
      console.log('🔍 Processing user:', { 
        id: user.id, 
        name: user.name, 
        role: user.role, 
        roleType: typeof user.role,
        hasRole: user.hasOwnProperty('role')
      });
      
      // Get current user from localStorage to check if this is the current user
      const currentUserData = JSON.parse(localStorage.getItem('nucleus-store') || '{}')?.state?.currentUser;
      const isCurrentUser = currentUserData?.id?.toString() === user.id?.toString();
      
      // Use current user's role if this is the current user and role is missing/incorrect
      let userRole = user.role;
      if (isCurrentUser && (!userRole || userRole === 'employee') && currentUserData?.role) {
        userRole = currentUserData.role;
        console.log('🔍 Using current user role for user:', user.name, 'Role:', userRole);
      }
      
      return {
        id: user.id?.toString() || '',
        companyId: user.companyId?.toString() || null,
        email: user.email || '',
        name: user.name || '',
        role: (userRole || 'employee').toLowerCase() as 'owner' | 'admin' | 'employee' | 'super_admin',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        appAccess: user.appAccess || {},
        appRoles: user.appRoles || {},
        isActive: user.isActive !== false,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLoginAt: user.lastLoginAt
      };
    });
  }

  static async createUser(userData: {
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'employee' | 'super_admin';
    jobTitle?: string;
    department?: string;
    appAccess?: Record<string, boolean>;
  }): Promise<User> {
    console.log('🚀 Creating user with data:', userData);
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        jobTitle: userData.jobTitle,
        department: userData.department
        // Note: backend generates password automatically
      }),
    });
    
    const result = await this.handleResponse<any>(response);
    console.log('📦 Create user response:', result);
    
    // Handle the backend response format
    if (result.success && result.data) {
      return {
        id: result.data.id.toString(),
        companyId: result.data.companyId?.toString() || null,
        email: result.data.email,
        name: result.data.name,
        role: result.data.role.toLowerCase() as 'owner' | 'admin' | 'employee' | 'super_admin',
        jobTitle: result.data.jobTitle,
        department: result.data.department,
        appAccess: userData.appAccess || {},
        isActive: result.data.isActive,
        createdAt: result.data.createdAt,
        lastLoginAt: result.data.lastLoginAt
      };
    } else {
      throw new Error(result.message || 'Failed to create user');
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const result = await this.handleResponse<ApiResponse<User>>(response);
    return result.data!;
  }

  static async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  // Test JWT Authentication
  static async testAuth(): Promise<void> {
    console.log('🔑 Testing authentication...');
    try {
      const response = await fetch(`${API_BASE_URL}/users/test-auth`, {
        headers: this.getAuthHeaders(),
      });
      const result = await this.handleResponse<any>(response);
      console.log('💼 Auth test success:', result);
    } catch (error) {
      console.error('❌ Auth test failed:', error);
    }
  }

  // Test backend connectivity
  static async testBackendConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing backend connection to:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        console.log('✅ Backend is reachable');
        return true;
      } else {
        console.log('⚠️ Backend responded with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      console.error('🔍 This could be due to:');
      console.error('   - Backend not running');
      console.error('   - Wrong URL (should be https://localhost:7296/api)');
      console.error('   - SSL certificate issues (try http://localhost:5166/api)');
      console.error('   - CORS configuration');
      return false;
    }
  }

  // Company Management APIs
  static async getCompany(): Promise<Company> {
    console.log('🏢 Fetching company data from backend');
    try {
      // Get current user's company ID
      const currentUser = JSON.parse(localStorage.getItem('nucleus-store') || '{}')?.state?.currentUser;
      const companyId = currentUser?.companyId;
      
      if (!companyId) {
        throw new Error('No company ID found for current user');
      }
      
      // Get all companies and find the one matching the user's company ID
      const response = await fetch(`${API_BASE_URL}/Company`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await this.handleResponse<any>(response);
      
      if (result.success && Array.isArray(result.data)) {
        // Find the company that matches the user's company ID
        const userCompany = result.data.find((company: any) => 
          company.id?.toString() === companyId?.toString()
        );
        
        if (userCompany) {
          return {
            id: userCompany.id?.toString() || companyId,
            name: userCompany.companyName || 'Company', // Use companyName from backend
            ownerUserId: userCompany.ownerName || 'owner-id', // Use ownerName as fallback
            subscribedAppIds: userCompany.subscribedAppIds || [],
            createdAt: userCompany.createdAt || new Date().toISOString(),
            domain: userCompany.domain,
            updatedAt: userCompany.updatedAt
          };
        } else {
          throw new Error(`Company with ID ${companyId} not found`);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch company data');
      }
    } catch (error) {
      console.error('❌ Failed to fetch company from backend, using fallback:', error);
      // Fallback to static data if backend fails
      const currentUser = JSON.parse(localStorage.getItem('nucleus-store') || '{}')?.state?.currentUser;
      return {
        id: currentUser?.companyId || 'static-company-id',
        name: 'Demo Company',
        ownerUserId: currentUser?.id || 'static-owner-id',
        subscribedAppIds: ['hr-one', 'certify-one'],
        createdAt: new Date().toISOString(),
        domain: 'demo.com'
      };
    }
  }

  static async updateCompany(updates: Partial<Company>): Promise<Company> {
    console.log('🏢 Dummy update company (backend integration disabled):', updates);
    // Return updated company with static data
    const currentUser = JSON.parse(localStorage.getItem('nucleus-store') || '{}')?.state?.currentUser;
    return Promise.resolve({
      id: currentUser?.companyId || 'static-company-id',
      name: updates.name || 'Demo Company',
      ownerUserId: currentUser?.id || 'static-owner-id',
      subscribedAppIds: ['hr-one', 'certify-one'],
      createdAt: new Date().toISOString(),
      domain: updates.domain || 'demo.com',
      updatedAt: new Date().toISOString()
    });
  }

  // App Management APIs - Using dummy data for now
  static async getApps(): Promise<App[]> {
    console.log('📱 Using static apps data (backend integration disabled)');
    // Return static apps - no backend call
    return staticApps;
  }

  static async subscribeToApp(appId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/CompanyAppSubscriptions/subscribe`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ appId }),
    });
    await this.handleResponse(response);
  }

  static async unsubscribeFromApp(appId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/CompanyAppSubscriptions/unsubscribe`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ appId }),
    });
    await this.handleResponse(response);
  }

  static async grantAppAccess(userId: string, appId: string, hasAccess: boolean = true, appRole: string = 'employee'): Promise<void> {
    console.log('🔐 Granting app access:', { userId, appId, hasAccess, appRole });
    console.log('🔑 Auth headers:', this.getAuthHeaders());
    
    const response = await fetch(`${API_BASE_URL}/UserAppAccess/grant`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        userId: parseInt(userId),
        appId,
        hasAccess,
        appRole
      }),
    });
    
    console.log('📡 Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Grant failed:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    await this.handleResponse(response);
  }

  static async revokeAppAccess(userId: string, appId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/UserAppAccess/revoke`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        userId: parseInt(userId),
        appId
      }),
    });
    await this.handleResponse(response);
  }

  // Generate app-specific token for cross-app authentication
  static async generateAppToken(appId: string): Promise<{ token: string; expiresAt: number }> {
    const response = await fetch(`${API_BASE_URL}/UserAppAccess/generate-app-token`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ appId }),
    });
    
    const result = await this.handleResponse<any>(response);
    
    return {
      token: result.token,
      expiresAt: result.expiresAt
    };
  }

  static async getCompanySubscriptions(): Promise<any[]> {
    console.log('🔐 Fetching company subscriptions');
    const response = await fetch(`${API_BASE_URL}/CompanyAppSubscriptions/company`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    const result = await this.handleResponse<any>(response);
    console.log('✅ Company subscriptions fetched:', result.data);
    
    return result.data || [];
  }


}

export interface NucleusState {
  // Data
  companies: Company[];
  users: User[];
  apps: App[];
  
  // Current session
  currentUser: User | null;
  currentCompany: Company | null;
  isLoggedIn: boolean;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetStore: () => void;
  signupCompany: (companyData: { companyName: string; ownerName: string; ownerEmail: string; ownerPassword: string }) => Promise<boolean>;
  
  // User management
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  
  // Company management
  updateCompany: (updates: Partial<Company>) => Promise<void>;
  fetchCompany: () => Promise<void>;
  subscribeToApp: (appId: string) => Promise<void>;
  unsubscribeFromApp: (appId: string) => Promise<void>;
  
  // App management
  fetchApps: () => Promise<void>;
  ensureOwnerAccess: () => Promise<void>;
  grantAppAccess: (userId: string, appId: string) => Promise<void>;
  revokeAppAccess: (userId: string, appId: string) => Promise<void>;
  setAppRole: (userId: string, appId: string, role: 'admin' | 'employee') => Promise<void>;
  removeAppRole: (userId: string, appId: string) => Promise<void>;
  generateAppToken: (appId: string) => Promise<{ token: string; expiresAt: number }>;
  refreshCurrentUser: () => Promise<void>;
  
  // Getters
  getUsersByCompany: (companyId: string) => User[];
  getCompanyApps: (companyId: string) => App[];
  getUserApps: (userId: string) => App[];
  
  // Debug
  debugStore: () => void;
}

// Static app data (not from backend) - Only Certify One is ready
const staticApps: App[] = [
  {
    id: 'certify-one',
    name: 'CertifyOne',
    description: 'Certification and compliance management platform',
    pricing: 'Free',
    icon: 'Award',
    category: 'Compliance'
  },
  {
    id: 'pm-one',
    name: 'VerityOne',
    description: 'Project management and team collaboration platform',
    pricing: 'Coming Soon',
    icon: 'FolderOpen',
    category: 'Productivity'
  },
  {
    id: 'timesheet-one',
    name: 'TimeSheetOne',
    description: 'Time tracking and attendance management system',
    pricing: 'Coming Soon',
    icon: 'Clock',
    category: 'HR'
  },
  {
    id: 'hr-one',
    name: 'HROne',
    description: 'Human resources and employee management platform',
    pricing: 'Coming Soon',
    icon: 'Users',
    category: 'HR'
  },
  {
    id: 'finance-one',
    name: 'FinanceOne',
    description: 'Financial management and accounting platform',
    pricing: 'Coming Soon',
    icon: 'DollarSign',
    category: 'Finance'
  },
  {
    id: 'order-one',
    name: 'OrderOne',
    description: 'Order processing and inventory management system',
    pricing: 'Coming Soon',
    icon: 'ShoppingCart',
    category: 'Operations'
  }
];

export const useNucleusStore = create<NucleusState>()(
  persist(
    (set, get) => ({
      // Initial state
      companies: [],
      users: [],
      apps: staticApps, // Use static apps - not from backend
      currentUser: null,
      currentCompany: null,
      isLoggedIn: false,
      isLoading: false,

      // Debug initial state
      resetStore: () => {
        set({
          companies: [],
          users: [],
          apps: staticApps, // Restore static apps
          currentUser: null,
          currentCompany: null,
          isLoggedIn: false,
          isLoading: false
        });
      },

      // Authentication
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await ApiService.login({ email, password });
          
          // Clear any existing app tokens to ensure fresh tokens for new user
          localStorage.removeItem('nucleus-app-token');
          localStorage.removeItem('nucleus-app-id');
          localStorage.removeItem('nucleus-user-data');
          
          // Clear any other app-related data
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('nucleus-')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          // Store tokens
          localStorage.setItem('accessToken', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          set({
            currentUser: response.data.user,
            currentCompany: response.data.company,
            isLoggedIn: true,
            isLoading: false
          });
          
          // Ensure owner has access to all subscribed apps
          if (response.data.user.role === 'owner') {
            setTimeout(() => {
              get().ensureOwnerAccess();
            }, 100);
          }
          
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await ApiService.logout();
        } catch (error) {
          // Silent error handling
        } finally {
          // Clear all authentication tokens and state
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Clear app-specific tokens to prevent cross-user contamination
          localStorage.removeItem('nucleus-app-token');
          localStorage.removeItem('nucleus-app-id');
          localStorage.removeItem('nucleus-user-data');
          
          // Clear any other app-related data
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('nucleus-')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          set({
            currentUser: null,
            currentCompany: null,
            isLoggedIn: false,
            users: [],
            companies: []
          });
        }
      },

      signupCompany: async (companyData) => {
        set({ isLoading: true });
        try {
          const response = await ApiService.registerCompany(companyData);
          
          // Store tokens
          localStorage.setItem('accessToken', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // Auto-subscribe to Certify One (free app)
          const companyWithCertifyOne = {
            ...response.data.company,
            subscribedAppIds: [...(response.data.company.subscribedAppIds || []), 'certify-one']
          };
          
          // Give owner access to ALL subscribed apps (including Certify One)
          const userWithFullAccess = {
            ...response.data.user,
            appAccess: {
              ...response.data.user.appAccess,
              'certify-one': true
            },
            appRoles: {
              ...response.data.user.appRoles,
              'certify-one': 'admin' as const // Owner gets admin role in Certify One
            }
          };
          
          set({
            currentUser: userWithFullAccess,
            currentCompany: companyWithCertifyOne,
            isLoggedIn: true,
            isLoading: false
          });
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      // User management
      createUser: async (userData) => {
        try {
          const newUser = await ApiService.createUser({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            jobTitle: userData.jobTitle,
            department: userData.department,
            appAccess: userData.appAccess,
            // Note: password is not sent - backend will generate and email it
          });

          set({
            users: [...get().users, newUser]
          });
        } catch (error) {
          console.error('Create user failed:', error);
          throw error;
        }
      },

      updateUser: async (userId, updates) => {
        try {
          const updatedUser = await ApiService.updateUser(userId, updates);
          set({
            users: get().users.map(user =>
              user.id === userId ? updatedUser : user
            )
          });
        } catch (error) {
          console.error('Update user failed:', error);
          throw error;
        }
      },

      deleteUser: async (userId) => {
        try {
          await ApiService.deleteUser(userId);
          set({
            users: get().users.map(user =>
              user.id === userId ? { ...user, isActive: false } : user
            )
          });
        } catch (error) {
          console.error('Delete user failed:', error);
          throw error;
        }
      },

      fetchUsers: async () => {
        try {
          const users = await ApiService.getUsers();

          if (users && Array.isArray(users)) {
            // Always update the users array, even if empty
            set({ users });
          } else {
            // Set empty array if response is invalid
            set({ users: [] });
          }
        } catch (error) {
          // Set empty array on error to ensure UI shows correct state
          set({ users: [] });
          // Re-throw the error so the calling code can handle it
          throw error;
        }
      },

      // Company management
      updateCompany: async (updates) => {
        try {
          const updatedCompany = await ApiService.updateCompany(updates);
          set({
            currentCompany: updatedCompany,
            companies: get().companies.map(company =>
              company.id === updatedCompany.id ? updatedCompany : company
            )
          });
        } catch (error) {
          console.error('Update company failed:', error);
          throw error;
        }
      },

      fetchCompany: async () => {
        try {
          const company = await ApiService.getCompany();
          if (company) {
            // Also fetch company subscriptions
            try {
              const subscriptions = await ApiService.getCompanySubscriptions();
              const subscribedAppIds = subscriptions.map((sub: any) => sub.appId);
              
              const companyWithSubscriptions = {
                ...company,
                subscribedAppIds
              };
              
              set({ currentCompany: companyWithSubscriptions });
            } catch (subscriptionError) {
              set({ currentCompany: company });
            }
          }
        } catch (error) {
          // Don't clear company data on error - keep existing data
        }
      },

      subscribeToApp: async (appId) => {
        try {
          await ApiService.subscribeToApp(appId);
          
          // Refresh company data to get updated subscriptions
          await get().fetchCompany();
          
          // Also ensure owner gets access to the new app
          const currentUser = get().currentUser;
          if (currentUser?.role === 'owner') {
            await get().setAppRole(currentUser.id, appId, 'admin');
          }
        } catch (error) {
          throw error;
        }
      },

      unsubscribeFromApp: async (appId) => {
        try {
          await ApiService.unsubscribeFromApp(appId);
          
          // Refresh company data to get updated subscriptions
          await get().fetchCompany();
        } catch (error) {
          throw error;
        }
      },

        // App management
  fetchApps: async () => {
    // Apps are static - no need to fetch from backend
    set({ apps: staticApps });
  },

  // Ensure owner has access to all subscribed apps
  ensureOwnerAccess: async () => {
    const state = get();
    if (state.currentUser?.role === 'owner' && state.currentCompany) {
      const updatedAppAccess = { ...state.currentUser.appAccess };
      const updatedAppRoles = { ...state.currentUser.appRoles };
      let hasChanges = false;
      
      // First, ensure company is subscribed to all available apps
      const availableAppIds = state.apps.map(app => app.id);
      const subscribedAppIds = state.currentCompany.subscribedAppIds || [];
      const missingSubscriptions = availableAppIds.filter(appId => !subscribedAppIds.includes(appId));
      
      if (missingSubscriptions.length > 0) {
        try {
          for (const appId of missingSubscriptions) {
            await ApiService.subscribeToApp(appId);
          }
          
          // Update company's subscribed apps
          const updatedSubscribedAppIds = [...subscribedAppIds, ...missingSubscriptions];
          set({
            currentCompany: {
              ...state.currentCompany,
              subscribedAppIds: updatedSubscribedAppIds
            }
          });
        } catch (error) {
          // Silent error handling
        }
      }
      
      // Give owner access to all subscribed apps
      const allSubscribedApps = state.currentCompany.subscribedAppIds || [];
      for (const appId of allSubscribedApps) {
        if (!updatedAppAccess[appId]) {
          updatedAppAccess[appId] = true;
          hasChanges = true;
        }
        // Set admin role for all apps if not already set
        if (!updatedAppRoles[appId]) {
          updatedAppRoles[appId] = 'admin';
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        // Persist to backend first
        try {
          for (const appId of allSubscribedApps) {
            if (!state.currentUser.appAccess[appId]) {
              await ApiService.grantAppAccess(state.currentUser.id, appId, true, 'admin');
            }
          }
          
          // Update local store after successful backend calls
          set({
            currentUser: {
              ...state.currentUser,
              appAccess: updatedAppAccess,
              appRoles: updatedAppRoles
            }
          });
        } catch (error) {
          // Still update local store for immediate UI feedback
          set({
            currentUser: {
              ...state.currentUser,
              appAccess: updatedAppAccess,
              appRoles: updatedAppRoles
            }
          });
        }
      }
    }
  },

  grantAppAccess: async (userId, appId) => {
    try {
      // For Certify One (free app), skip subscription check
      if (appId === 'certify-one') {
        // Grant access directly for free apps
        await ApiService.grantAppAccess(userId, appId);
        set(state => ({
          users: state.users.map(user =>
            user.id === userId ? { ...user, appAccess: { ...user.appAccess, [appId]: true } } : user
          )
        }));
        return;
      }
      
      // For paid apps, ensure company is subscribed first
      const state = get();
      const subscribedAppIds = state.currentCompany?.subscribedAppIds || [];
      
      if (!subscribedAppIds.includes(appId)) {
        await ApiService.subscribeToApp(appId);
        
        // Update company's subscribed apps
        set({
          currentCompany: {
            ...state.currentCompany!,
            subscribedAppIds: [...subscribedAppIds, appId]
          }
        });
      }
      
      // Now grant access to the user
      await ApiService.grantAppAccess(userId, appId);
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, appAccess: { ...user.appAccess, [appId]: true } } : user
        )
      }));
    } catch (error) {
      throw error;
    }
  },

  revokeAppAccess: async (userId, appId) => {
    try {
      await ApiService.revokeAppAccess(userId, appId);
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, appAccess: { ...user.appAccess, [appId]: false } } : user
        )
      }));
    } catch (error) {
      throw error;
    }
  },

  // App role management
  setAppRole: async (userId: string, appId: string, role: 'admin' | 'employee') => {
    try {
      // For Certify One (free app), skip subscription check
      if (appId === 'certify-one') {
        // Grant access and set role directly for free apps
        await ApiService.grantAppAccess(userId, appId, true, role);
        
        // Update local store after successful backend call
        set(state => ({
          users: state.users.map(user =>
            user.id === userId 
              ? { 
                  ...user, 
                  appRoles: { ...user.appRoles, [appId]: role },
                  appAccess: { ...user.appAccess, [appId]: true } // Grant access when setting role
                } 
              : user
          ),
          // Also update current user if it's the same user
          currentUser: state.currentUser?.id === userId 
            ? {
                ...state.currentUser,
                appRoles: { ...state.currentUser.appRoles, [appId]: role },
                appAccess: { ...state.currentUser.appAccess, [appId]: true }
              }
            : state.currentUser
        }));
        return;
      }
      
      // For paid apps, ensure company is subscribed first
      const state = get();
      const subscribedAppIds = state.currentCompany?.subscribedAppIds || [];
      
      if (!subscribedAppIds.includes(appId)) {
        await ApiService.subscribeToApp(appId);
        
        // Update company's subscribed apps
        set({
          currentCompany: {
            ...state.currentCompany!,
            subscribedAppIds: [...subscribedAppIds, appId]
          }
        });
      }
      
      // Call backend API to grant app access and set role
      await ApiService.grantAppAccess(userId, appId, true, role);
      
      // Update local store after successful backend call
      set(state => ({
        users: state.users.map(user =>
          user.id === userId 
            ? { 
                ...user, 
                appRoles: { ...user.appRoles, [appId]: role },
                appAccess: { ...user.appAccess, [appId]: true } // Grant access when setting role
              } 
            : user
        ),
        // Also update current user if it's the same user
        currentUser: state.currentUser?.id === userId 
          ? {
              ...state.currentUser,
              appRoles: { ...state.currentUser.appRoles, [appId]: role },
              appAccess: { ...state.currentUser.appAccess, [appId]: true }
            }
          : state.currentUser
      }));
      
    } catch (error) {
      throw error;
    }
  },

  removeAppRole: async (userId: string, appId: string) => {
    try {
      console.log('🔐 Removing app role via backend:', { userId, appId });
      
      // Call backend API to revoke app access
      await ApiService.revokeAppAccess(userId, appId);
      
      // Update local store after successful backend call
      set(state => ({
        users: state.users.map(user =>
          user.id === userId 
            ? { 
                ...user, 
                appRoles: { ...user.appRoles, [appId]: undefined },
                appAccess: { ...user.appAccess, [appId]: false } // Revoke access when removing role
              } 
            : user
        ),
        // Also update current user if it's the same user
        currentUser: state.currentUser?.id === userId 
          ? {
              ...state.currentUser,
              appRoles: { ...state.currentUser.appRoles, [appId]: undefined },
              appAccess: { ...state.currentUser.appAccess, [appId]: false }
            }
          : state.currentUser
      }));
      
      console.log('✅ App role removed successfully:', { userId, appId });
    } catch (error) {
      console.error('❌ Remove app role failed:', error);
      throw error;
    }
  },

  // Generate app-specific token for cross-app authentication
  generateAppToken: async (appId: string) => {
    try {
      const result = await ApiService.generateAppToken(appId);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Refresh current user data from backend
  refreshCurrentUser: async () => {
    try {
      const users = await ApiService.getUsers();
      const currentUser = get().currentUser;
      
      if (currentUser) {
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser) {
          set({ currentUser: updatedUser });
        }
      }
    } catch (error) {
      throw error;
    }
  },

      // Getters
      getUsersByCompany: (companyId) => {
        return get().users.filter(user => user.companyId === companyId && user.isActive);
      },

      getCompanyApps: (companyId) => {
        const company = get().companies.find(c => c.id === companyId) || get().currentCompany;
        if (!company || !company.subscribedAppIds) return [];
        return get().apps.filter(app => (company.subscribedAppIds || []).includes(app.id));
      },



      getUserApps: (userId) => {
        const user = get().users.find(u => u.id === userId);
        if (!user || !user.appAccess) return [];
        return get().apps.filter(app => (user.appAccess || {})[app.id] || false);
      },

      debugStore: () => {
        const state = get();
        console.log('=== STORE DEBUG ===');
        console.log('Users:', state.users);
        console.log('Companies:', state.companies);
        console.log('Current User:', state.currentUser);
        console.log('Current Company:', state.currentCompany);
        console.log('Is Logged In:', state.isLoggedIn);
        console.log('Access Token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
        console.log('Refresh Token:', localStorage.getItem('refreshToken') ? 'Present' : 'Missing');
        console.log('Token Preview:', localStorage.getItem('accessToken') ? 
          `${localStorage.getItem('accessToken')?.substring(0, 50)}...` : 'No token');
        console.log('==================');
      }
    }),
    {
      name: 'nucleus-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentCompany: state.currentCompany,
        isLoggedIn: state.isLoggedIn
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Starting store rehydration...');
        if (state) {
          // Check if we have a valid token on rehydration
          const token = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');
          
          console.log('🔑 Rehydration token check:', {
            hasAccessToken: !!token,
            hasRefreshToken: !!refreshToken,
            hasCurrentUser: !!state.currentUser,
            currentUserName: state.currentUser?.name,
            isLoggedIn: state.isLoggedIn
          });
          
          if (token && state.currentUser) {
            state.isLoggedIn = true;
            console.log('✅ Authentication state restored for user:', state.currentUser.name);
          } else {
            // Clear invalid state
            console.log('⚠️ Clearing invalid authentication state');
            state.currentUser = null;
            state.currentCompany = null;
            state.isLoggedIn = false;
          }
        }
        console.log('✅ Store rehydration complete');
      }
    }
  )
);

// Export API service for direct use if needed
export { ApiService };