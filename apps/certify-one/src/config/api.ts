// API Configuration
// Update the port number to match your backend's launchSettings.json

export const API_CONFIG = {
  // Development URL - Updated to match your backend
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-url.com/api'
    : 'https://localhost:7086/api', // ✅ CERTIFY ONE BACKEND PORT

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },

  // Request timeout in milliseconds
  TIMEOUT: 30000,
};

// Debug logging to ensure correct URL is being used
console.log('🔧 API_CONFIG loaded:', {
  BASE_URL: API_CONFIG.BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production'
});

// Helper to get the correct API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};