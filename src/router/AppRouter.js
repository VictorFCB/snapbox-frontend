import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Email from '../pages/Email';
import UrlParametrizer from '../pages/UrlParametrizer';
import Login from '../pages/Login';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('auth_token');
  return isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/Email" element={<ProtectedRoute><Email /></ProtectedRoute>} />
      <Route path="/UrlParametrizer" element={<ProtectedRoute><UrlParametrizer /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoutes;
