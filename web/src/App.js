import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import SiteHeader    from './SiteHeader';
import Login         from './views/Login';
import Dashboard     from './views/Dashboard/Dashboard';
import Residents     from './views/Residents/Residents';
import Documents     from './views/Documents/Documents';
import Blotter       from './views/Blotter/Blotter';
import Officials     from './views/Officials/Officials';
import Users         from './views/Users/Users';
import Statistics    from './views/Statistics/Statistics';
import IDCard        from './views/IDCard/IDCard';
import Transparency  from './views/Transparency/Transparency';

const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const titles = {
    '/dashboard':    'Dashboard',
    '/residents':    'Resident Management',
    '/documents':    'Document Requests',
    '/blotter':      'Blotter Records',
    '/officials':    'Barangay Officials',
    '/users':        'User Accounts',
    '/statistics':   'Population Statistics',
    '/idcard':       'Barangay ID Card Generator',
    '/transparency': 'Barangay Transparency Board',
  };
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U';

  return (
    <div className="layout">
      <SiteHeader />
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{titles[location.pathname] || 'Barangay Management System'}</span>
          <div className="topbar-user">
            <span>{user.name}</span>
            <div className="avatar">{initials}</div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>
        <Route path="/login"        element={<Login />} />
        <Route path="/"             element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"    element={<PrivateRoute><Layout><Dashboard    /></Layout></PrivateRoute>} />
        <Route path="/residents"    element={<PrivateRoute><Layout><Residents    /></Layout></PrivateRoute>} />
        <Route path="/documents"    element={<PrivateRoute><Layout><Documents    /></Layout></PrivateRoute>} />
        <Route path="/blotter"      element={<PrivateRoute><Layout><Blotter      /></Layout></PrivateRoute>} />
        <Route path="/officials"    element={<PrivateRoute><Layout><Officials    /></Layout></PrivateRoute>} />
        <Route path="/users"        element={<PrivateRoute><Layout><Users        /></Layout></PrivateRoute>} />
        <Route path="/statistics"   element={<PrivateRoute><Layout><Statistics   /></Layout></PrivateRoute>} />
        <Route path="/idcard"       element={<PrivateRoute><Layout><IDCard       /></Layout></PrivateRoute>} />
        <Route path="/transparency" element={<PrivateRoute><Layout><Transparency /></Layout></PrivateRoute>} />
        <Route path="*"             element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
