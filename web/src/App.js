import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import SiteHeader   from './SiteHeader';
import Notifications from './components/Notifications';
import Login        from './views/Login';
import Dashboard    from './views/Dashboard/Dashboard';
import Residents    from './views/Residents/Residents';
import Documents    from './views/Documents/Documents';
import Blotter      from './views/Blotter/Blotter';
import Officials    from './views/Officials/Officials';
import Users        from './views/Users/Users';
import Statistics   from './views/Statistics/Statistics';
import IDCard       from './views/IDCard/IDCard';
import Transparency from './views/Transparency/Transparency';
import Backup       from './views/Backup/Backup';
import ResidentRegistrations from './views/ResidentRegistrations/ResidentRegistrations';

const isAuthenticated = () => !!localStorage.getItem('token');

// The Barangay Management System is admin/staff/viewer only.
// A Resident Portal account must never render these pages, even if
// a token somehow ended up in localStorage here — checking that a
// token merely exists isn't enough; its role must be checked too.
const ADMIN_ROLES = ['admin', 'staff', 'viewer'];

const hasAdminAccess = () => {
  if (!isAuthenticated()) return false;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return ADMIN_ROLES.includes(user.role);
  } catch {
    return false;
  }
};

const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!hasAdminAccess()) {
    // A resident (or any non-admin role) token must never render
    // admin pages — clear it and bounce to login rather than trust
    // the frontend alone. The backend independently rejects these
    // roles on every admin API route regardless of this check.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  return children;
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
    '/backup':       'Backup & Export',
    '/registrations':'Resident Registrations',
  };
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U';

  return (
    <div className="layout">
      <SiteHeader />
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{titles[location.pathname] || 'Barangay Management System'}</span>
          <div className="topbar-user" style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Notifications />
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
        <Route path="/backup"       element={<PrivateRoute><Layout><Backup       /></Layout></PrivateRoute>} />
        <Route path="/registrations" element={<PrivateRoute><Layout><ResidentRegistrations /></Layout></PrivateRoute>} />
        <Route path="*"             element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
