import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6">
        {/* Logo placeholder */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl">C1</span>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 tracking-wide">Certify One</h1>
        
        {/* Subtitle */}
        <p className="text-gray-600 text-lg">Professional Training Portal</p>
        
        {/* Loading animation */}
        <div className="flex items-center justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
