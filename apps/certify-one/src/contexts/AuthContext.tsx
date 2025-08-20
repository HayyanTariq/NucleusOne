import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, AuthResponse, LoginRequest, SignupRequest, roleToString } from '@/services/api';

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'employee';
  firstName: string;
  lastName: string;
  department?: string;
  companyName?: string;
  avatar?: string;
  isFirstLogin?: boolean;
  // Nucleus One specific fields
  companyId?: string;
  appRole?: 'admin' | 'employee';
  appAccess?: Record<string, boolean>;
  isNucleusUser?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signupOwner: (signupData: SignupData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Nucleus One integration
  isNucleusUser: boolean;
  nucleusAppId: string | null;
  sessionKey: string; // Force re-renders when session changes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isNucleusUser, setIsNucleusUser] = useState(false);
  const [nucleusAppId, setNucleusAppId] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<string>(''); // Force re-renders when session changes
  
  console.log('🔄 AuthProvider: Starting initialization');

  useEffect(() => {
    // Check for URL parameters first (new launch from Nucleus One)
    const urlParams = new URLSearchParams(window.location.search);
    const encodedUrlToken = urlParams.get('token');
    const urlAppId = urlParams.get('appId');
    
    // Decode the URL-encoded token
    const urlToken = encodedUrlToken ? decodeURIComponent(encodedUrlToken) : null;
    
    console.log('🔍 URL Parameters detected:', {
      urlToken: urlToken ? 'present' : 'none',
      urlAppId: urlAppId || 'none',
      fullUrl: window.location.href,
      search: window.location.search,
      urlTokenLength: urlToken ? urlToken.length : 0,
      urlTokenPreview: urlToken ? urlToken.substring(0, 50) + '...' : 'none',
      encodedUrlToken: encodedUrlToken ? 'present' : 'none',
      encodedUrlTokenLength: encodedUrlToken ? encodedUrlToken.length : 0
    });
    
    // Check if we have any URL parameters at all
    console.log('🔍 All URL parameters:', Object.fromEntries(urlParams.entries()));
    
    // Check for Nucleus One authentication first
    const nucleusToken = localStorage.getItem('nucleus-app-token');
    const nucleusUserData = localStorage.getItem('nucleus-user-data');
    const nucleusAppId = localStorage.getItem('nucleus-app-id');
    
    // If we have a token from URL (coming from Nucleus One), store it immediately

    
    if (urlToken) {
      console.log('🔄 New URL token detected, storing immediately');
      console.log('🔄 Token to store:', {
        token: urlToken,
        tokenLength: urlToken.length,
        tokenPreview: urlToken.substring(0, 50) + '...',
        appId: urlAppId || 'certify-one'
      });
      
      // Store the token immediately before clearing anything
      localStorage.setItem('nucleus-app-token', urlToken);
      localStorage.setItem('nucleus-app-id', urlAppId || 'certify-one');
      console.log('✅ Token stored immediately from URL');
      
      // Verify the token was stored
      const storedToken = localStorage.getItem('nucleus-app-token');
      const storedAppId = localStorage.getItem('nucleus-app-id');
      console.log('🔍 Verification - stored token:', {
        stored: !!storedToken,
        storedLength: storedToken ? storedToken.length : 0,
        storedPreview: storedToken ? storedToken.substring(0, 50) + '...' : 'none',
        storedAppId
      });
      
      // Clear old session data (but keep the new token)
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      localStorage.removeItem('nucleus-user-data');
      
      // Clear any other app-related data (but keep the new token)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nucleus-') && key !== 'nucleus-app-token' && key !== 'nucleus-app-id') {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('✅ Cleared old session data, kept new token');
      
      // Final verification that token is still there
      const finalToken = localStorage.getItem('nucleus-app-token');
      const finalAppId = localStorage.getItem('nucleus-app-id');
      console.log('🔍 Final verification after clearing:', {
        tokenStillThere: !!finalToken,
        tokenLength: finalToken ? finalToken.length : 0,
        appIdStillThere: !!finalAppId,
        appId: finalAppId
      });
      
      
    }
    
    // Debug logging for token detection
    console.log('🔍 AuthContext token detection:', {
      urlToken: urlToken ? 'present' : 'none',
      nucleusToken: nucleusToken ? 'present' : 'none',
      nucleusAppId: nucleusAppId,
      hasUrlToken: !!urlToken,
      hasNucleusToken: !!nucleusToken
    });
    
             // URL parameters are already extracted above
    

    
    // Use URL token if available, otherwise use localStorage token
    let tokenToUse = null;
    let appIdToUse = null;
    
    if (urlToken) {
      // Decode URL token and use it
      tokenToUse = decodeURIComponent(urlToken);
      appIdToUse = urlAppId;
      console.log('🔍 Using URL token (decoded)');
    } else if (nucleusToken) {
      // Use localStorage token
      tokenToUse = nucleusToken;
      appIdToUse = nucleusAppId;
      console.log('🔍 Using localStorage token');
    }
    
    // Debug logging for token selection
    console.log('🔍 Token selection debug:', {
      urlToken: urlToken ? 'present' : 'none',
      nucleusToken: nucleusToken ? 'present' : 'none',
      selectedToken: tokenToUse ? 'present' : 'none',
      tokenSource: tokenToUse === urlToken ? 'URL' : 'localStorage',
      appIdToUse
    });
    
    // Debug logging for token processing decision
    console.log('🔍 Token processing decision:', {
      tokenToUse: tokenToUse ? 'present' : 'none',
      appIdToUse,
      isCertifyOne: appIdToUse === 'certify-one',
      isLocalhost: window.location.hostname === 'localhost',
      port: window.location.port,
      isPort5174: window.location.port === '5174',
      hasUrlToken: !!urlToken,
      condition1: appIdToUse === 'certify-one',
      condition2: window.location.hostname === 'localhost' && window.location.port === '5174' && urlToken,
      willProcess: !!(tokenToUse && (appIdToUse === 'certify-one' || (window.location.hostname === 'localhost' && window.location.port === '5174' && urlToken)))
    });
    
    // Check if we have a token - if we do, process it (we're on Certify One domain)

    
    if (tokenToUse) {
      // Always ensure token is stored
      console.log('💾 Storing token:', {
        tokenLength: tokenToUse.length,
        appId: appIdToUse || 'certify-one',
        tokenPreview: tokenToUse.substring(0, 50) + '...'
      });
      localStorage.setItem('nucleus-app-token', tokenToUse);
      localStorage.setItem('nucleus-app-id', appIdToUse || 'certify-one');
      console.log('✅ Token stored successfully');
      
      try {
        // Decode the token (in production, this should be verified by backend)
        console.log('🔍 Attempting to decode token:', {
          tokenLength: tokenToUse.length,
          tokenPreview: tokenToUse.substring(0, 50) + '...'
        });
        
        let tokenPayload;
        try {
          // Try to decode as base64 first (our new format)
          try {
            const decoded = atob(tokenToUse);
            tokenPayload = JSON.parse(decoded);
            console.log('✅ Base64 token payload decoded successfully:', {
              userId: tokenPayload.userId,
              email: tokenPayload.email,
              name: tokenPayload.name,
              appRole: tokenPayload.appRole,
              appId: tokenPayload.appId
            });
          } catch (base64Error) {
            // Fallback: try traditional JWT format
            const tokenParts = tokenToUse.split('.');
            if (tokenParts.length !== 3) {
              throw new Error('Invalid token format');
            }
            
            const payloadString = tokenParts[1];
            tokenPayload = JSON.parse(atob(payloadString));
            
            console.log('✅ JWT token payload decoded successfully:', {
              userId: tokenPayload.userId,
              email: tokenPayload.email,
              name: tokenPayload.name,
              appRole: tokenPayload.appRole,
              appId: tokenPayload.appId
            });
          }
        } catch (decodeError) {
          console.error('❌ Token decode failed:', decodeError);
          console.log('🔍 Token content:', tokenToUse.substring(0, 50) + '...');
          throw decodeError;
        }
        
        // Check token expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (tokenPayload.exp && currentTime > tokenPayload.exp) {
          console.error('❌ Token has expired');
          throw new Error('Token has expired');
        }
        
        console.log('🔍 Token payload received:', {
          userId: tokenPayload.userId,
          email: tokenPayload.email,
          name: tokenPayload.name,
          appRole: tokenPayload.appRole,
          appId: tokenPayload.appId,
          companyId: tokenPayload.companyId,
          companyName: tokenPayload.companyName,
          exp: tokenPayload.exp
        });

        // Extract user data from token payload
        const userData = {
          id: tokenPayload.userId,
          email: tokenPayload.email,
          name: tokenPayload.name,
          companyId: tokenPayload.companyId,
          appRole: tokenPayload.appRole || 'employee',
          appId: tokenPayload.appId
        };
          


          // Transform Nucleus user data to Certify One user format
          const [firstName, ...lastNameParts] = (userData.name || '').split(' ');
          const lastName = lastNameParts.join(' ') || '';
          
          const companyName = tokenPayload.companyName || 'AcmeOne'; // Use correct company name from database
          console.log('🏢 Setting company name:', {
            fromToken: tokenPayload.companyName,
            fallback: 'AcmeOne',
            final: companyName
          });
          
          const nucleusUser: User = {
            id: userData.id,
            email: userData.email,
            role: userData.appRole || 'employee', // Use app-specific role
            firstName: firstName || userData.email.split('@')[0],
            lastName: lastName,
            companyName: companyName, // Use actual company name from token
            companyId: String(userData.companyId),
            appRole: userData.appRole,
            appAccess: { 'certify-one': true },
            isFirstLogin: false, // Nucleus users are already authenticated
            isNucleusUser: true,
          };

          // Set all state in the correct order
          setUser(nucleusUser);
          setIsNucleusUser(true);
          setNucleusAppId(appIdToUse);
          setSessionKey(`${userData.id}-${userData.appRole}-${Date.now()}`); // Force re-render
          


          // Clear URL parameters after successful authentication
          if (urlToken || urlAppId) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            console.log('✅ URL parameters cleared');
          }
        } catch (error) {
          console.error('❌ Error processing Nucleus One token:', error);
          
          // Keep the token for later exchange with backend
          const nucleusUser: User = {
            id: 'temp',
            email: 'temp@example.com',
            role: 'employee',
            firstName: 'Temporary',
            lastName: 'User',
            companyName: 'Your Company',
            companyId: '0',
            appRole: 'employee',
            appAccess: { 'certify-one': true },
            isFirstLogin: false,
            isNucleusUser: true,
          };
          
          setUser(nucleusUser);
          setIsNucleusUser(true);
          setNucleusAppId(appIdToUse || 'certify-one');
        }
    } else {
      // Fallback: check if there's a token in URL but no appId
      if (urlToken && !appIdToUse) {
        try {
          const tokenPayload = JSON.parse(atob(urlToken));
          
          // Store the token
          localStorage.setItem('nucleus-app-token', urlToken);
          localStorage.setItem('nucleus-app-id', 'certify-one');
          
          // Process the token
          const userData = {
            id: tokenPayload.userId || tokenPayload.id,
            email: tokenPayload.userEmail || tokenPayload.email,
            name: tokenPayload.userName || tokenPayload.name,
            companyId: tokenPayload.companyId,
            appRole: tokenPayload.appRole || 'employee',
            appId: 'certify-one'
          };
          


          const [firstName, ...lastNameParts] = (userData.name || '').split(' ');
          const lastName = lastNameParts.join(' ') || '';
          
          const nucleusUser: User = {
            id: userData.id,
            email: userData.email,
            role: userData.appRole || 'employee',
            firstName: firstName || userData.email.split('@')[0],
            lastName: lastName,
            companyName: tokenPayload.companyName || 'Demo Company',
            companyId: String(userData.companyId),
            appRole: userData.appRole,
            appAccess: { 'certify-one': true },
            isFirstLogin: false,
            isNucleusUser: true,
          };

          // Set all state in the correct order
          setUser(nucleusUser);
          setIsNucleusUser(true);
          setNucleusAppId('certify-one');
          setSessionKey(`${userData.id}-${userData.appRole}-${Date.now()}`); // Force re-render
          

          
                     // Clear URL parameters
           const newUrl = window.location.pathname;
           window.history.replaceState({}, '', newUrl);
        } catch (error) {
          // Silent error handling
        }
      }
      
      // Check for existing Certify One token
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user-data');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user-data');
        }
      } else if (nucleusToken) {
        // If we have a Nucleus One token but no JWT, create a temporary user session
        // This prevents redirect to login while token exchange happens
        console.log('🔄 Creating temporary user session from Nucleus One token');
        try {
          const tokenPayload = JSON.parse(atob(nucleusToken));
          const userData = {
            id: tokenPayload.userId || tokenPayload.id,
            email: tokenPayload.userEmail || tokenPayload.email,
            name: tokenPayload.userName || tokenPayload.name,
            companyId: tokenPayload.companyId,
            appRole: tokenPayload.appRole || 'employee',
            appId: tokenPayload.appId
          };

          const [firstName, ...lastNameParts] = (userData.name || '').split(' ');
          const lastName = lastNameParts.join(' ') || '';
          
          const nucleusUser: User = {
            id: userData.id,
            email: userData.email,
            role: userData.appRole || 'employee',
            firstName: firstName || userData.email.split('@')[0],
            lastName: lastName,
            companyName: tokenPayload.companyName || 'Demo Company',
            companyId: String(userData.companyId),
            appRole: userData.appRole,
            appAccess: { 'certify-one': true },
            isFirstLogin: false,
            isNucleusUser: true,
          };

          setUser(nucleusUser);
          setIsNucleusUser(true);
          setNucleusAppId(nucleusAppId || 'certify-one');
          console.log('✅ Temporary user session created');
        } catch (error) {
          console.error('❌ Error creating temporary user session:', error);
        }
      }
    }
    
    setIsLoading(false);
    console.log('✅ AuthProvider: Initialization complete', { 
      user: user ? 'present' : 'null',
      isLoading: false,
      isAuthenticated: !!user
    });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const credentials: LoginRequest = { email, password };
      const authResponse: AuthResponse = await authApi.login(credentials);
      
      // Transform API response to our User interface
      const user: User = {
        id: authResponse.token, // Using token as ID for now
        email: authResponse.email,
        role: roleToString(authResponse.role),
        firstName: authResponse.firstName,
        lastName: authResponse.lastName,
        companyName: authResponse.companyName,
        isFirstLogin: authResponse.isFirstLogin || false,
      };



      // Store token and user data
      localStorage.setItem('auth-token', authResponse.token);
      localStorage.setItem('user-data', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signupOwner = async (signupData: SignupData) => {
    setIsLoading(true);
    try {
      const signupRequest: SignupRequest = {
        companyName: signupData.companyName,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
      };
      
      const authResponse: AuthResponse = await authApi.companySignup(signupRequest);

      // Transform API response to our User interface
      const user: User = {
        id: authResponse.token, // Using token as ID for now
        email: authResponse.email,
        role: roleToString(authResponse.role),
        firstName: authResponse.firstName,
        lastName: authResponse.lastName,
        companyName: authResponse.companyName,
      };

      // Store token and user data
      localStorage.setItem('auth-token', authResponse.token);
      localStorage.setItem('user-data', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear both Certify One and Nucleus One data
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    localStorage.removeItem('nucleus-app-token');
    localStorage.removeItem('nucleus-user-data');
    localStorage.removeItem('nucleus-app-id');
    
    // Clear any other potential cached data
    sessionStorage.clear();
    
    setUser(null);

    setIsNucleusUser(false);
    setNucleusAppId(null);
    setSessionKey(''); // Clear session key
  };

  const value = {
    user,
    login,
    signupOwner,
    logout,
    isLoading,
    isAuthenticated: !!user,

    isNucleusUser,
    nucleusAppId,
    sessionKey, // Include session key to force re-renders
  };
  
  console.log('🔄 AuthProvider: Creating context value', { 
    user: user ? 'present' : 'null',
    isLoading,
    isAuthenticated: !!user,
    contextValueCreated: true
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};