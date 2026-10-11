import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardAPI } from '../../api/services';
import { BARANGAY_NAME } from '../../config';
import logo from '../../brand-icon.png';

// Chart colours are plain hex because SVG attributes can't read CSS variables.
const DOCS_COLOR    = '#1e3a9a'; // ballpen blue
const BLOTTER_COLOR = '#c42b2b'; // stamp red

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Magandang umaga';
  if (h < 13) return 'Magandang tanghali';
  if (h < 18) return 'Magandang hapon';
  return 'Magandang gabi';
};

const show = v => (v == null ? '—' : Number(v).toLocaleString('en-PH'));
const pct  = (n, total) => (total ? Math.round(((n || 0) / total) * 100) : 0);

// One line of the records ledger: label ..... number  percent
const Row = ({ label, note, value, percent, total }) => (
  <li className={`dash-row${total ? ' is-total' : ''}`}>
    <span className="dash-row-label">{label}{note && <small>{note}</small>}</span>
    <span className="dash-leader" aria-hidden="true" />
    <span className="dash-row-num">{show(value)}</span>
    <span className="dash-row-pct">{percent == null ? '' : `${percent}%`}</span>
  </li>
);

// A queue-ticket for work that is waiting. It only turns yellow or red when
// there is something to do; at zero it goes green.
const Ticket = ({ to, title, value, waiting, clear, go, tone }) => {
  const isClear = value === 0;
  return (
    <Link to={to} className={`dash-ticket ${isClear ? 'is-clear' : tone}`}>
      <span className="dash-ticket-main">
        <span className="dash-ticket-title">{title}</span>
        <span className="dash-ticket-sub">{isClear ? clear : waiting}</span>
        <span className="dash-ticket-go">{go}</span>
      </span>
      <span className="dash-ticket-stub">
        <span className="dash-ticket-num">{show(value)}</span>
      </span>
    </Link>
  );
};

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="dash-tip">
      <strong>{label}</strong>
      {payload.map(p => (
        <div key={p.dataKey}><i style={{ background: p.color }} />{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

// Blank logbook shown before any records exist for the year.
const EmptyBook = () => (
  <svg className="dash-empty-art" viewBox="0 0 150 100" aria-hidden="true">
    <path d="M75 20 C62 12 38 12 18 18 V84 C38 78 62 78 75 86 Z" />
    <path d="M75 20 C88 12 112 12 132 18 V84 C112 78 88 78 75 86 Z" />
    <path className="rule" d="M30 34 C42 31 56 31 66 34" />
    <path className="rule" d="M30 46 C42 43 56 43 66 46" />
    <path className="rule" d="M30 58 C42 55 56 55 66 58" />
    <path className="rule" d="M84 34 C94 31 108 31 120 34" />
    <path className="rule" d="M84 46 C94 43 108 43 120 46" />
    <path className="mark" d="M100 66 L108 74 L122 58" />
  </svg>
);

const Dashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const now        = new Date();
  const year       = now.getFullYear();
  const today      = now.toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const stampDay   = now.toLocaleDateString('en-PH', { weekday:'long' });
  const stampDate  = now.toLocaleDateString('en-PH', { month:'short', day:'numeric' });
  const firstName  = (readUser().name || '').trim().split(' ')[0];

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats().then(r => setStats(r.data.data)),
      dashboardAPI.getMonthly().then(r => setMonthly(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const total   = stats?.totalResidents || 0;
  const waiting = (stats?.pendingDocuments || 0) + (stats?.openBlotters || 0);
  const isEmpty = monthly.every(m => m.documents === 0 && m.blotters === 0);
  const deskLine = waiting === 0
    ? 'Nothing is waiting at the desk right now.'
    : `${waiting} ${waiting === 1 ? 'item is' : 'items are'} waiting at the desk.`;

  return (
    <div className="dash">
      {/* Masthead: a manila folder with today's date stamped on it */}
      <section className="dash-folder">
        <span className="dash-folder-tab">BaryoHub</span>
        <div className="dash-folder-body">
          <img
            className="dash-seal"
            src={logo}
            alt="Barangay Logo"
            onError={e => { e.target.style.display='none'; }}
          />
          <div className="dash-folder-text">
            <h1>{BARANGAY_NAME}</h1>
            <p className="dash-hello">{greeting()}{firstName ? `, ${firstName}` : ''}.</p>
            <p className="dash-desk">{deskLine}</p>
          </div>
          <div className="dash-stamp" role="img" aria-label={`Today is ${today}`}>
            <span className="dash-stamp-day">{stampDay}</span>
            <span className="dash-stamp-date">{stampDate}</span>
            <span className="dash-stamp-year">{year}</span>
          </div>
        </div>
      </section>

      <div className="dash-main">
        {/* Records ledger */}
        <section className="dash-panel">
          <h2 className="dash-h">Residents</h2>
          <ul className="dash-rows">
            <Row total label="Total residents" note="Registered in the system" value={stats?.totalResidents} />
            <Row label="Active residents"   note="Currently residing"      value={stats?.activeResidents} percent={pct(stats?.activeResidents, total)} />
            <Row label="Senior citizens"    note="60 years old and above"  value={stats?.seniorCitizens}  percent={pct(stats?.seniorCitizens, total)} />
            <Row label="Indigent residents" note="Listed as indigent"      value={stats?.indigents}       percent={pct(stats?.indigents, total)} />
          </ul>

          <div className="dash-group">
            <h2 className="dash-h">Barangay hall</h2>
            <ul className="dash-rows">
              <Row label="Active officials" note="Serving officials" value={stats?.totalOfficials} />
              <Row label="Documents released" note="All time"        value={stats?.releasedDocuments} />
            </ul>
          </div>
        </section>

        {/* Work waiting */}
        <div className="dash-tickets">
          <Ticket
            to="/documents"
            tone="is-highlight"
            title="Pending documents"
            value={stats?.pendingDocuments}
            waiting="Awaiting action."
            clear="Nothing waiting for release."
            go="Open documents"
          />
          <Ticket
            to="/blotter"
            tone="is-stamp"
            title="Open blotters"
            value={stats?.openBlotters}
            waiting="Unresolved cases."
            clear="No unresolved cases."
            go="Open blotter records"
          />
        </div>
      </div>

      <section className="dash-panel">
        <div className="dash-chart-head">
          <div>
            <h2 className="dash-h">Monthly activity, {year}</h2>
            <p>Documents requested and blotters filed each month.</p>
          </div>
          <span className="dash-note">Live from the database</span>
        </div>

        {isEmpty ? (
          <div className="dash-empty">
            <EmptyBook />
            <h3>Nothing recorded for {year} yet</h3>
            <p>Documents and blotter entries you add will show up here, month by month.</p>
            <div className="dash-empty-actions">
              <Link to="/documents" className="btn btn-primary btn-sm">Add a document</Link>
              <Link to="/blotter" className="btn btn-ghost btn-sm">Record a blotter</Link>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly} margin={{ top:8, right:8, left:-14, bottom:0 }} barGap={4} barCategoryGap="26%">
              <CartesianGrid vertical={false} stroke="#cdd8f2" />
              <XAxis dataKey="month" tick={{ fontSize:12, fill:'#4d5772' }} tickLine={false} axisLine={{ stroke:'#aeb8d3' }} />
              <YAxis tick={{ fontSize:12, fill:'#4d5772' }} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill:'rgba(30,58,154,0.06)' }} />
              <Legend verticalAlign="top" align="right" iconType="square" iconSize={10} wrapperStyle={{ fontSize:12.5, paddingBottom:10 }} />
              <Bar dataKey="documents" name="Documents" fill={DOCS_COLOR}    radius={[2,2,0,0]} />
              <Bar dataKey="blotters"  name="Blotters"  fill={BLOTTER_COLOR} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
