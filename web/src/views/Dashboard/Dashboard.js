import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardAPI } from '../../api/services';
import { BARANGAY_NAME } from '../../config';
import logo from '../../barangay-logo.jpg';

const StatCard = ({ label, value, sub, color }) => (
  <div className="stat-card">
    <div className="stat-label" style={{ fontWeight:700, fontSize:11, color:'#6b7280' }}>{label}</div>
    <div className="stat-value" style={{ fontWeight:800, color }}>{value ?? '—'}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();
  const today = new Date().toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats().then(r => setStats(r.data.data)),
      dashboardAPI.getMonthly().then(r => setMonthly(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{ marginBottom:20, background:'linear-gradient(135deg, #1e3a5f 0%, #1a56db 100%)', border:'none', color:'#fff' }}>
        <div className="card-body" style={{ display:'flex', alignItems:'center', gap:20, padding:'20px 24px' }}>
          <img
            src={logo}
            alt="Barangay Logo"
            style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(255,255,255,0.3)', flexShrink:0 }}
            onError={e => { e.target.style.display='none'; }}
          />
          <div>
            <div style={{ fontSize:11, opacity:0.7, textTransform:'uppercase', letterSpacing:1 }}>Republic of the Philippines • City of Manila</div>
            <div style={{ fontSize:22, fontWeight:700, margin:'4px 0' }}>{BARANGAY_NAME}</div>
            <div style={{ fontSize:12, opacity:0.8 }}>Barangay Management System • {today}</div>
          </div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of barangay records and activities</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Residents"    value={stats?.totalResidents}    sub="Registered in the system" color="#1a56db" />
        <StatCard label="Active Residents"   value={stats?.activeResidents}   sub="Currently residing"       color="#057a55" />
        <StatCard label="Senior Citizens"    value={stats?.seniorCitizens}    sub="60 years old and above"   color="#c27803" />
        <StatCard label="Indigent Residents" value={stats?.indigents}         sub="Listed as indigent"       color="#7e3af2" />
        <StatCard label="Pending Documents"  value={stats?.pendingDocuments}  sub="Awaiting action"          color="#e3a008" />
        <StatCard label="Open Blotters"      value={stats?.openBlotters}      sub="Unresolved cases"         color="#c81e1e" />
        <StatCard label="Active Officials"   value={stats?.totalOfficials}    sub="Serving officials"        color="#1a56db" />
        <StatCard label="Docs Released"      value={stats?.releasedDocuments} sub="All time"                 color="#057a55" />
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Monthly Activity — {year}</h3>
          <span style={{ fontSize:12, color:'#6b7280' }}>Live data from database</span>
        </div>
        <div className="card-body">
          {monthly.every(m => m.documents === 0 && m.blotters === 0) ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <p>No activity data yet for {year}. Start adding documents and blotters!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize:12 }} />
                <YAxis tick={{ fontSize:12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="documents" name="Documents" fill="#1a56db" radius={[4,4,0,0]} />
                <Bar dataKey="blotters"  name="Blotters"  fill="#c81e1e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
