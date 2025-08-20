import { ApiService } from '@/store/nucleusStore';

// Token refresh utility
export class AuthManager {
  private static refreshPromise: Promise<{ token: string; refreshToken: string }> | null = null;

  static async refreshTokenIfNeeded(): Promise<string | null> {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!token || !refreshToken) {
      return null;
    }

    try {
      // Check if token is expired (simple check - you might want to decode JWT to check expiration)
      // For now, we'll try to refresh if we have a refresh token
      
      if (!this.refreshPromise) {
        this.refreshPromise = ApiService.refreshToken(refreshToken);
      }

      const { token: newToken, refreshToken: newRefreshToken } = await this.refreshPromise;
      
      // Store new tokens
      localStorage.setItem('accessToken', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.refreshPromise = null;
      
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login
      window.location.href = '/login';
      return null;
    }
  }

  static async getValidToken(): Promise<string | null> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      console.log('🔄 Token expired, attempting refresh...');
      return await this.refreshTokenIfNeeded();
    }

    return token;
  }

  static isTokenExpired(token: string): boolean {
    try {
      // Decode JWT payload (without verification for client-side check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token expires within the next 5 minutes
      return payload.exp && payload.exp < (currentTime + 300);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true; // Assume expired if we can't decode
    }
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  static logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}

// HTTP client with automatic token refresh
export class HttpClient {
  private static baseURL = 'https://localhost:7296/api';

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await AuthManager.getValidToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ HttpClient: Authorization header added with Bearer token');
    } else {
      console.log('⚠️ HttpClient: No token available for Authorization header');
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token might be expired, try to refresh
        const newToken = await AuthManager.refreshTokenIfNeeded();
        if (newToken) {
          // Retry the request with new token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          };
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, config);
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
} 