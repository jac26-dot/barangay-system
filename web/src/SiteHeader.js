import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { APP_NAME, BARANGAY_NAME } from './config';
import logo from './brand-icon.png';

// Small line icons on a 24x24 grid. They draw with currentColor, so they
// follow the link colour (grey normally, blue when the page is active).
const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </>
  ),
  residents: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  officials: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  statistics: (
    <>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </>
  ),
  documents: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  blotter: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  idcard: (
    <>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </>
  ),
  transparency: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  registrations: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </>
  ),
  backup: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </>
  ),
  users: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
};

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name]}
  </svg>
);

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',  icon: 'dashboard' },
  { section: 'Records' },
  { to: '/residents',    label: 'Residents',  icon: 'residents' },
  { to: '/officials',    label: 'Officials',  icon: 'officials' },
  { to: '/statistics',   label: 'Statistics', icon: 'statistics' },
  { section: 'Services' },
  { to: '/documents',    label: 'Documents',  icon: 'documents' },
  { to: '/blotter',      label: 'Blotter',    icon: 'blotter' },
  { to: '/idcard',       label: 'ID Card',    icon: 'idcard' },
  { section: 'Governance' },
  { to: '/transparency', label: 'Transparency', icon: 'transparency' },
  { section: 'System' },
  { to: '/registrations', label: 'Resident Registrations', icon: 'registrations' },
  { to: '/backup',       label: 'Backup & Export', icon: 'backup' },
  { to: '/users',        label: 'User Accounts',   icon: 'users' },
];

const SiteHeader = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-brand">
          <img className="sidebar-seal" src={logo} alt="Barangay Logo" />
          <div>
            <h2>{APP_NAME}</h2>
            <p>{BARANGAY_NAME}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section-label">{item.section}</div>
          ) : (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon"><Icon name={item.icon} /></span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-user">
          <span className="sidebar-user-label">Logged in as</span>
          <span className="sidebar-user-name">{user.name}</span>
          <span className="sidebar-user-role">{user.role}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SiteHeader;