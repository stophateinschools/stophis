
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to dashboard or signin
  return <Navigate to="/dashboard" replace />;
};

export default Index;
