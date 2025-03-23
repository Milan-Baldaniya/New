import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['consumer', 'farmer', 'admin'] 
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        if (!currentUser) {
          navigate('/login');
        } else if (!allowedRoles.includes(currentUser.userType)) {
          console.log('User type:', currentUser.userType, 'not allowed in:', allowedRoles);
          
          // Redirect based on role
          if (currentUser.userType === 'farmer') {
            navigate('/farmer/dashboard');
          } else if (currentUser.userType === 'consumer') {
            navigate('/consumer/dashboard');
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, allowedRoles]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
} 