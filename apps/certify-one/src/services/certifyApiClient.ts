import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Types for API responses
export interface CertifyUser {
  userId: number;
  email: string;
  name: string;
  role: string;
  companyId: number;
  companyName: string;
}

export interface TokenExchangeResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: CertifyUser;
}

export interface Certification {
  id?: number;
  CertificationName: string;
  IssuingOrganization: string;
  IssueDate: string;
  ExpirationDate: string;
  CredentialId: string;
  CredentialUrl: string;
  Description: string;
  Level: string;
  SkillsLearned: string[];
}

export interface Course {
  id?: number;
  CourseTitle: string;
  Platform: string;
  StartDate: string;
  CompletionDate: string;
  CourseDuration: string;
  CertificateLink: string;
  CourseDescription: string;
  SkillsLearned: string[];
}

export interface Session {
  id?: number;
  SessionTopic: string;
  InstructorName: string;
  SessionDate: string;
  StartTime: string;
  EndTime: string;
  Duration: string;
  Location: string;
  Agenda: string;
  LearnedOutcome: string;
}

export class CertifyApiClient {
  public baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('🔧 CertifyApiClient initialized with baseUrl:', this.baseUrl);
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('certify-auth-token');
    if (!token) {
      throw new Error('No authentication token found. Please exchange token first.');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async getNucleusToken(): Promise<string | null> {
    // Use the working token that was working before
    const nucleusToken = localStorage.getItem('nucleus-app-token');
    if (!nucleusToken) {
      console.error('❌ No nucleus-app-token found');
      return null;
    }
    
    console.log('✅ Using nucleus-app-token (working authentication)');
    return nucleusToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use Nucleus One JWT token directly
    const token = await this.getNucleusToken();
    
    if (!token) {
      throw new Error('No valid authentication token found.');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    };

    console.log(`🌐 Making request to: ${url}`);
    console.log(`🔧 Base URL being used: ${this.baseUrl}`);
    console.log(`🔧 Full URL: ${url}`);
    const response = await fetch(url, config);
    console.log(`📡 Response status: ${response.status}`);
    
    if (response.status === 401) {
      console.error('🚨 401 Unauthorized - Authentication failed');
      console.error('🔍 Request details:', {
        url: url,
        method: options.method || 'GET',
        headers: config.headers,
        tokenUsed: token ? 'present' : 'missing'
      });
      
      // Try to get error details from response
      try {
        const errorData = await response.json();
        console.error('📡 Backend error response:', errorData);
      } catch (e) {
        console.error('📡 No error details in response body');
      }
      
      throw new Error('Authentication failed (401). Please check your token and backend configuration.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
    }
    
    const responseData = await response.json();
    console.log(`📡 Raw response data:`, responseData);
    
    // Handle ApiResponse wrapper - extract data property if it exists
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      console.log(`✅ Extracting data from ApiResponse wrapper`);
      return responseData.data;
    }
    
    // Return raw response if no wrapper
    return responseData;
  }

  // Certification endpoints
  async getCertifications(): Promise<Certification[]> {
    return this.request<Certification[]>('/trainings/certifications');
  }

  async createCertification(data: any): Promise<Certification> {
    return this.request<Certification>('/trainings/certifications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCertification(id: number, data: any): Promise<Certification> {
    return this.request<Certification>(`/trainings/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCertification(id: number): Promise<void> {
    return this.request<void>(`/trainings/certifications/${id}`, {
      method: 'DELETE'
    });
  }

  // Course endpoints
  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>('/trainings/courses');
  }

  async createCourse(data: any): Promise<Course> {
    return this.request<Course>('/trainings/courses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCourse(id: number, data: any): Promise<Course> {
    return this.request<Course>(`/trainings/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCourse(id: number): Promise<void> {
    return this.request<void>(`/trainings/courses/${id}`, {
      method: 'DELETE'
    });
  }

  // Session endpoints
  async getSessions(): Promise<Session[]> {
    return this.request<Session[]>('/trainings/sessions');
  }

  async createSession(data: any): Promise<Session> {
    return this.request<Session>('/trainings/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSession(id: number, data: any): Promise<Session> {
    return this.request<Session>(`/trainings/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteSession(id: number): Promise<void> {
    return this.request<void>(`/trainings/sessions/${id}`, {
      method: 'DELETE'
    });
  }

  // Token exchange endpoint
  async exchangeToken(nucleusToken: string): Promise<TokenExchangeResponse> {
    const url = `${this.baseUrl}/certifytoken/generate-certify-token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: nucleusToken })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
    }

    const result = await response.json();
    
    // Store the exchanged token
    localStorage.setItem('certify-auth-token', result.token);
    
    return result;
  }
}

// Export singleton instance
export const certifyApi = new CertifyApiClient();
