import React from 'react';
import { Loader2, Award } from 'lucide-react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = "Loading Certify One..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Award className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-2xl animate-spin mx-auto"></div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Certify One
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Initializing your workspace...
          </span>
        </div>
      </div>
    </div>
  );
};





