import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the register choice page
    navigate("/register", { replace: true });
  }, [navigate]);
  
  // Return null since this component will redirect
  return null;
};

export default Register;