// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7296/api',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Token configuration
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Environment-specific settings
export const ENV_CONFIG = {
  // Development
  development: {
    API_BASE_URL: 'https://localhost:7296/api',
    ENABLE_LOGGING: true,
  },
  
  // Production
  production: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.nucleus-one.com/api',
    ENABLE_LOGGING: false,
  },
  
  // Test
  test: {
    API_BASE_URL: 'https://localhost:7296/api',
    ENABLE_LOGGING: true,
  },
};

// Get current environment configuration
export const getCurrentEnvConfig = () => {
  const env = import.meta.env.MODE || 'development';
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;
};

// Export current API base URL
export const API_BASE_URL = getCurrentEnvConfig().API_BASE_URL; 