import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/LoginForm';

const LoginPage: React.FC = () => {
  const { isAuthenticated, user, requirePasswordChange } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if authenticated AND password change is not required
    if (isAuthenticated && user && !requirePasswordChange) {
      // Redirect based on user role
      if (user.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'employee') {
        navigate('/employee/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, requirePasswordChange, navigate]);

  return <LoginForm />;
};

export default LoginPage;
