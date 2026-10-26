import React from 'react';
import { Navigate } from 'react-router-dom';

function PartnerProtectedRoute({ children }) {
  const token = localStorage.getItem('partnerToken');
  if (!token) return <Navigate to="/partner/login" replace />;
  return children;
}

export default PartnerProtectedRoute;