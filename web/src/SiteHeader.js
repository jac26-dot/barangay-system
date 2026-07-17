import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { APP_NAME, BARANGAY_NAME } from './config';
import logo from './barangay-logo.jpg';

const navItems = [
  { to: '/dashboard',    icon: '📊', label: 'Dashboard' },
  { section: 'Records' },
  { to: '/residents',    icon: '👥', label: 'Residents' },
  { to: '/officials',    icon: '🏛️', label: 'Officials' },
  { to: '/statistics',   icon: '📈', label: 'Statistics' },
  { section: 'Services' },
  { to: '/documents',    icon: '📄', label: 'Documents' },
  { to: '/blotter',      icon: '📋', label: 'Blotter' },
  { to: '/idcard',       icon: '🪪', label: 'ID Card' },
  { section: 'Governance' },
  { to: '/transparency', icon: '🔍', label: 'Transparency' },
  { section: 'System' },
  { to: '/users',        icon: '🔐', label: 'User Accounts' },
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
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <img src={logo} alt="Barangay Logo" style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid #374151', flexShrink:0 }} />
          <div>
            <h2 style={{ fontSize:12, fontWeight:700, color:'#3b82f6', letterSpacing:1, textTransform:'uppercase', margin:0 }}>{APP_NAME}</h2>
            <p style={{ fontSize:10, color:'#9ca3af', margin:0, lineHeight:1.3 }}>{BARANGAY_NAME}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section-label">{item.section}</div>
          ) : (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div style={{ padding:'16px', borderTop:'1px solid #374151' }}>
        <div style={{ fontSize:12, color:'#9ca3af', marginBottom:8 }}>
          Logged in as <strong style={{ color:'#fff' }}>{user.name}</strong>
          <br /><span style={{ textTransform:'capitalize' }}>{user.role}</span>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ width:'100%', color:'#9ca3af', borderColor:'#374151' }} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default SiteHeader;
