import { API_CONFIG } from '@/config/api';

export const debugTokenExchange = async () => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('nucleus-app-token');
    
    if (!token) {
      console.error('❌ No nucleus-app-token found in localStorage');
      return;
    }

    console.log('🔍 Debugging token exchange...');
    console.log('🔍 Token from localStorage:', token.substring(0, 50) + '...');
    
    // Decode the token to see what we're sending
    try {
      const decodedToken = JSON.parse(atob(token));
      console.log('🔍 Decoded token payload:', decodedToken);
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
      return;
    }

    // Test the debug endpoint first
    console.log('🔍 Testing debug endpoint...');
    const debugResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/debug-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const debugData = await debugResponse.json();
    console.log('🔍 Debug endpoint response:', debugData);

    if (debugData.success) {
      console.log('✅ Token format is valid!');
      
      // Now test the actual exchange
      console.log('🔍 Testing token exchange...');
      const exchangeResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/exchange-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (exchangeResponse.ok) {
        const exchangeData = await exchangeResponse.json();
        console.log('✅ Token exchange successful:', exchangeData);
        
        // Store the tokens
        localStorage.setItem('certify-auth-token', exchangeData.token);
        localStorage.setItem('certify-user-info', JSON.stringify(exchangeData.user));
        
        console.log('✅ Certify One JWT stored successfully');
        return exchangeData;
      } else {
        const errorData = await exchangeResponse.json();
        console.error('❌ Token exchange failed:', errorData);
        return null;
      }
    } else {
      console.error('❌ Token format is invalid:', debugData);
      return null;
    }
  } catch (error) {
    console.error('❌ Debug error:', error);
    return null;
  }
};

// Function to test training endpoints after successful token exchange
export const testTrainingEndpoints = async () => {
  try {
    const token = localStorage.getItem('certify-auth-token');
    
    if (!token) {
      console.error('❌ No certify-auth-token found. Run debugTokenExchange first.');
      return;
    }

    console.log('🔍 Testing training endpoints...');

    // Test certifications endpoint
    const certsResponse = await fetch(`${API_CONFIG.BASE_URL}/trainings/certifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (certsResponse.ok) {
      const certsData = await certsResponse.json();
      console.log('✅ Certifications loaded:', certsData);
    } else {
      console.error('❌ Failed to load certifications:', certsResponse.status);
    }

    // Test courses endpoint
    const coursesResponse = await fetch(`${API_CONFIG.BASE_URL}/trainings/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (coursesResponse.ok) {
      const coursesData = await coursesResponse.json();
      console.log('✅ Courses loaded:', coursesData);
    } else {
      console.error('❌ Failed to load courses:', coursesResponse.status);
    }

    // Test sessions endpoint
    const sessionsResponse = await fetch(`${API_CONFIG.BASE_URL}/trainings/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (sessionsResponse.ok) {
      const sessionsData = await sessionsResponse.json();
      console.log('✅ Sessions loaded:', sessionsData);
    } else {
      console.error('❌ Failed to load sessions:', sessionsResponse.status);
    }

  } catch (error) {
    console.error('❌ Training endpoints test error:', error);
  }
};





