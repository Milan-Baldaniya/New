import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['consumer', 'farmer', 'admin'] 
}: {
  children: React.ReactNode,
  allowedRoles?: Array<'consumer' | 'farmer' | 'admin'>
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    } else if (user && !allowedRoles.includes(user.userType)) {
      // Redirect based on role if accessing incorrect route
      if (user.userType === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (user.userType === 'consumer') {
        navigate('/consumer/dashboard');
      } else if (user.userType === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [user, isLoading, navigate, allowedRoles]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 