import React from 'react';
import AppHeader from './components/AppHeader';
import AppRoutes from './router/AppRouter';
import { BrowserRouter } from 'react-router-dom'; 

const App = () => {
  return (
    <BrowserRouter>
    <AppHeader />
    <div style={{ paddingTop: '64px' }}>
      <AppRoutes />
    </div>
  </BrowserRouter>
  
  );
}

export default App;
