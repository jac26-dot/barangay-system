import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { residentAPI } from '../../api/services';

const COLORS = ['#1a56db','#c81e1e','#057a55','#c27803','#7e3af2','#9ca3af'];

const StatBox = ({ label, value, color }) => (
  <div className="stat-card">
    <div className="stat-label" style={{ fontWeight:700, fontSize:11, color:'#6b7280' }}>{label}</div>
    <div className="stat-value" style={{ fontWeight:800, color }}>{value}</div>
  </div>
);

const SectionTitle = ({ title }) => (
  <div style={{ fontWeight:700, fontSize:15, color:'#111827', margin:0 }}>{title}</div>
);

const Statistics = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    residentAPI.getAll({ limit: 9999 })
      .then(res => setResidents(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading statistics...</div>;

  const withAge = residents.map(r => ({
    ...r,
    age: r.birthDate ? Math.floor((new Date() - new Date(r.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
  }));

  const active      = withAge.filter(r => r.status === 'Active');
  const total       = residents.length;
  const totalActive = active.length;
  const males       = active.filter(r => r.gender === 'Male').length;
  const females     = active.filter(r => r.gender === 'Female').length;
  const seniors     = active.filter(r => r.isSeniorCitizen || r.age >= 60).length;
  const indigents   = active.filter(r => r.isIndigent).length;
  const voters      = active.filter(r => r.isVoter).length;
  const deceased    = residents.filter(r => r.status === 'Deceased').length;
  const transferred = residents.filter(r => r.status === 'Transferred').length;

  const ageGroups = [
    { group:'0-12',  label:'Children',     count: active.filter(r => r.age !== null && r.age <= 12).length,                color:'#1a56db' },
    { group:'13-17', label:'Teenagers',    count: active.filter(r => r.age !== null && r.age >= 13 && r.age <= 17).length, color:'#7e3af2' },
    { group:'18-35', label:'Young Adults', count: active.filter(r => r.age !== null && r.age >= 18 && r.age <= 35).length, color:'#057a55' },
    { group:'36-59', label:'Adults',       count: active.filter(r => r.age !== null && r.age >= 36 && r.age <= 59).length, color:'#c27803' },
    { group:'60+',   label:'Senior',       count: active.filter(r => r.age !== null && r.age >= 60).length,                color:'#c81e1e' },
    { group:'N/A',   label:'No Birthdate', count: active.filter(r => r.age === null).length,                               color:'#9ca3af' },
  ];

  const civilStatus = ['Single','Married','Widowed','Separated'].map(s => ({
    name: s, count: active.filter(r => r.civilStatus === s).length,
  }));

  const genderData = [
    { name:'Male',   value: males },
    { name:'Female', value: females },
  ];

  const statusData = [
    { name:'Active',      value: totalActive },
    { name:'Deceased',    value: deceased },
    { name:'Transferred', value: transferred },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Population Statistics</h2>
          <p>Demographic overview of {total} registered residents</p>
        </div>
        <div style={{ fontSize:12, color:'#6b7280' }}>
          As of {new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        <StatBox />
        <StatBox />
        <StatBox />
        <StatBox />
        <StatBox />
        <StatBox />
        <StatBox />
        <StatBox />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div className="card">
          <div className="card-header">
            <SectionTitle title="Gender Distribution" />
          </div>
          <div className="card-body">
            {males + females === 0 ? (
              <div className="empty-state"><div className="empty-icon">📊</div><p>No data yet.</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} residents`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <SectionTitle title="Residency Status" />
          </div>
          <div className="card-body">
            {total === 0 ? (
              <div className="empty-state"><div className="empty-icon">📊</div><p>No data yet.</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {statusData.map((_, i) => <Cell key={i} fill={[COLORS[0], COLORS[5], COLORS[2]][i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} residents`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Age Group */}
      <div className="card" style={{ marginBottom:16 }}>
        <div className="card-header">
          <SectionTitle title="Age Group Distribution" />
        </div>
        <div className="card-body">
          {totalActive === 0 ? (
            <div className="empty-state"><div className="empty-icon">📊</div><p>No data yet.</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ageGroups} margin={{ top:5, right:20, left:0, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="group" tick={{ fontSize:12, fontWeight:600 }} />
                  <YAxis tick={{ fontSize:12 }} allowDecimals={false} />
                  <Tooltip formatter={(v, n, p) => [`${v} residents`, p.payload.label]} />
                  <Bar dataKey="count" name="Residents" radius={[4,4,0,0]}>
                    {ageGroups.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:12, justifyContent:'center' }}>
                {ageGroups.map(g => (
                  <div key={g.group} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                    <div style={{ width:12, height:12, borderRadius:2, background:g.color }}></div>
                    <span style={{ fontWeight:600 }}>{g.group}</span> — {g.label}: <strong>{g.count}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Civil Status */}
      <div className="card" style={{ marginBottom:16 }}>
        <div className="card-header">
          <SectionTitle title="Civil Status Distribution" />
        </div>
        <div className="card-body">
          {totalActive === 0 ? (
            <div className="empty-state"><div className="empty-icon">📊</div><p>No data yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={civilStatus} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize:12, fontWeight:600 }} />
                <YAxis tick={{ fontSize:12 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v} residents`]} />
                <Bar dataKey="count" name="Residents" fill="#1a56db" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Special Groups */}
      <div className="card">
        <div className="card-header">
          <SectionTitle title="Special Groups Summary" />
        </div>
        <div className="card-body">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12 }}>
            {[
              { label:'Registered Voters',  value:voters,   color:'#057a55' },
              { label:'Senior Citizens',    value:seniors,  color:'#c27803' },
              { label:'Indigent Residents', value:indigents,color:'#7e3af2' },
            ].map(item => (
              <div key={item.label} style={{ background:'#f9fafb', borderRadius:8, padding:16, border:'1px solid #e5e7eb' }}>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{item.label}</div>
                <div style={{ fontSize:28, fontWeight:800, color:item.color }}>{item.value}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>
                  {totalActive > 0 ? `${((item.value/totalActive)*100).toFixed(1)}% of active residents` : '—'}
                </div>
                <div style={{ background:'#e5e7eb', borderRadius:4, height:6, marginTop:8 }}>
                  <div style={{ background:item.color, borderRadius:4, height:6, width: totalActive > 0 ? `${Math.min((item.value/totalActive)*100,100)}%` : '0%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
