import React, { useEffect } from 'react';
import AppHeader from './components/AppHeader';
import AppRoutes from './router/AppRouter';
import { HashRouter, useLocation } from 'react-router-dom'; 

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const pathCounts = JSON.parse(localStorage.getItem('visited_paths')) || {};
    
    pathCounts[path] = (pathCounts[path] || 0) + 1;
    
    localStorage.setItem('visited_paths', JSON.stringify(pathCounts));
  }, [location]);

  return null;
};

const App = () => {
  return (
    <HashRouter> 
      <RouteTracker />
      <AppHeader />
      <div style={{ paddingTop: '64px', height: 'calc(100vh - 64px)' }}>
        <AppRoutes />
      </div>
    </HashRouter>
  );
};

export default App;