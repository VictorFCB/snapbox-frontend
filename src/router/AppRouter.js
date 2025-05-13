import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Email from '../pages/Email';
import UrlParametrizer from '../pages/UrlParametrizer';
import Login from '../pages/Login';
import Admin from '../pages/Admin';
import MakeVa from '../pages/MakeVa';

// Componente de rota protegida para verificar se o usuário é admin
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('auth_token');
  const isAdmin = localStorage.getItem('is_admin');  // Verifica se o usuário é admin
  
  if (!isAuthenticated) {
    return <Navigate to="/" />; // Redireciona para login caso não esteja autenticado
  }

  if (children.type === Admin && isAdmin !== 'true') {
    // Se a rota for para Admin e o usuário não for admin, redireciona para Home
    return <Navigate to="/Home" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/Email" element={<ProtectedRoute><Email /></ProtectedRoute>} />
      <Route path="/UrlParametrizer" element={<ProtectedRoute><UrlParametrizer /></ProtectedRoute>} />
      <Route path="/Admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/MakeVa" element={<MakeVa />} />
    </Routes>
  );
}

export default AppRoutes;
