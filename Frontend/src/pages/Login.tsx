import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await authService.login(email, password);
      
      // Redirect based on user type
      if (user.userType === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (user.userType === 'consumer') {
        navigate('/consumer/dashboard');
      } else if (user.userType === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>Login Form</div>
  );
};

export default Login; 