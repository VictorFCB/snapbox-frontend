import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Email from '../pages/Email';
import UrlParametrizer from '../pages/UrlParametrizer';
import Login from '../pages/Login';
import Admin from '../pages/Admin';
import Performance from '../pages/Performance';
import MakeVa from '../pages/MakeVa';

// Componente de rota protegida para verificar se o usuário é admin
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('auth_token');
  const isAdmin = localStorage.getItem('is_admin') === 'true';  // Verifica se o usuário é admin

  if (!isAuthenticated) {
    return <Navigate to="/Login" />; // Redireciona para login caso não esteja autenticado
  }

  // Verifica se o usuário tem acesso à rota admin
  if (children.type === Admin && !isAdmin) {
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
      <Route path="/Performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
      <Route path="/MakeVa" element={<MakeVa />} />
    </Routes>
  );
}

export default AppRoutes;
