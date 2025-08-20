// Simple utility to test token storage and retrieval
export const testTokenStorage = () => {
  const token = localStorage.getItem('nucleus-app-token');
  const appId = localStorage.getItem('nucleus-app-id');
  
  console.log('🔍 Token storage test:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    appId: appId,
    tokenPreview: token ? token.substring(0, 50) + '...' : 'none'
  });
  
  if (token) {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('✅ Token is valid JWT:', {
          userId: payload.userId,
          email: payload.email,
          name: payload.name,
          appRole: payload.appRole,
          exp: payload.exp
        });
        return true;
      } else {
        console.error('❌ Token is not valid JWT format');
        return false;
      }
    } catch (error) {
      console.error('❌ Token decode failed:', error);
      return false;
    }
  } else {
    console.error('❌ No token found in localStorage');
    return false;
  }
};

// Test token storage immediately
export const testTokenStorageImmediate = () => {
  console.log('🚀 Running immediate token storage test...');
  const result = testTokenStorage();
  console.log('📊 Token storage test result:', result);
  return result;
};

// Test URL parameters
export const testUrlParameters = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedToken = urlParams.get('token');
  const appId = urlParams.get('appId');
  
  console.log('🔍 URL Parameters test:', {
    hasEncodedToken: !!encodedToken,
    encodedTokenLength: encodedToken ? encodedToken.length : 0,
    appId: appId,
    fullUrl: window.location.href,
    search: window.location.search
  });
  
  if (encodedToken) {
    try {
      const decodedToken = decodeURIComponent(encodedToken);
      console.log('✅ URL token decoded successfully:', {
        originalLength: encodedToken.length,
        decodedLength: decodedToken.length,
        decodedPreview: decodedToken.substring(0, 50) + '...'
      });
      
      // Test if it's a valid JWT
      const tokenParts = decodedToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('✅ URL token is valid JWT:', {
          userId: payload.userId,
          email: payload.email,
          name: payload.name,
          appRole: payload.appRole
        });
        return true;
      } else {
        console.error('❌ URL token is not valid JWT format');
        return false;
      }
    } catch (error) {
      console.error('❌ URL token decode failed:', error);
      return false;
    }
  } else {
    console.log('ℹ️ No token found in URL parameters');
    return false;
  }
};

// Force token storage test on page load
if (typeof window !== 'undefined') {
  // Run test after a short delay to ensure AuthContext has processed
  setTimeout(() => {
    console.log('🔍 === TOKEN FLOW DEBUG ===');
    testUrlParameters();
    testTokenStorageImmediate();
    console.log('🔍 === END TOKEN FLOW DEBUG ===');
  }, 1000);
}
