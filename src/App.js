import React from 'react';
import AppHeader from './components/AppHeader';
import AppRoutes from './router/AppRouter';
import { HashRouter } from 'react-router-dom'; 

const App = () => {
  return (
    <HashRouter> 
      <AppHeader />
      <div style={{ paddingTop: '64px' }}>
        <AppRoutes />
      </div>
    </HashRouter>
  );
};

export default App;
