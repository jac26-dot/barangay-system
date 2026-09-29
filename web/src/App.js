import React, { useState, useEffect } from 'react';
import RequestForm from './RequestForm';
import TrackRequest from './TrackRequest';
import Hotlines from './Hotlines';
import Gallery from './Gallery';
import VerifyResidency from './VerifyResidency';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Terms from './Terms';
import Privacy from './Privacy';
import MyRequests from './MyRequests';
import Notifications from './Notifications';
import About from './About';
import Services from './Services';
import HeroSlider from './HeroSlider';
import logo from './barangay-logo.png';
import './App.css';

// Simple, consistent line-style icons (no emoji) for each document type.
const DocIcon = ({ type }) => {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'clearance':
      return (
        <svg {...common}><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>
      );
    case 'residency':
      return (
        <svg {...common}><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></svg>
      );
    case 'indigency':
      return (
        <svg {...common}><path d="M12 20s-7-4.4-9.3-8.4C1.3 8.6 3 5.5 6 5.2c1.8-.2 3.3.8 4 2.2.7-1.4 2.2-2.4 4-2.2 3 .3 4.7 3.4 3.3 6.4C19 15.6 12 2012 20z" /></svg>
      );
    case 'business':
      return (
        <svg {...common}><path d="M4 9l1-5h14l1 5" /><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M9 20v-5h6v5" /></svg>
      );
    case 'goodmoral':
      return (
        <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
      );
    default:
      return null;
  }
};

const DOCUMENTS = [
  { key: 'clearance',  name: 'Barangay Clearance',       desc: 'For employment, business, and legal purposes' },
  { key: 'residency',  name: 'Certificate of Residency',  desc: 'Proof that you are a resident of this barangay' },
  { key: 'indigency',  name: 'Certificate of Indigency',  desc: 'For free medical, legal, and educational assistance' },
  { key: 'business',   name: 'Business Clearance',        desc: 'Required for registering or renewing a business permit' },
  { key: 'goodmoral',  name: 'Good Moral Certificate',    desc: 'For school, employment, and other requirements' },
];

// Every page reachable by hash, so a direct link or refresh lands
// on the right screen instead of always resetting to Home.
const VALID_PAGES = ['home', 'request', 'verify', 'track', 'hotlines', 'gallery', 'register', 'login', 'dashboard', 'terms', 'privacy', 'track-requests', 'request-history', 'notifications', 'about', 'services'];

function pageFromHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  return VALID_PAGES.includes(raw) ? raw : 'home';
}

function App() {
  const [page, setPageState] = useState(pageFromHash);
  const [trackNumber, setTrackNumber] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // "About Barangay" and "Services" have real sections on Home —
  // smooth-scroll to them if already on Home, otherwise navigate
  // to Home first and scroll once it's rendered.
  const scrollToHomeSection = (id) => {
    if (page !== 'home') {
      setPage('home');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  // Central place every navigation goes through, so the URL hash
  // always matches what's on screen — this is what makes a page
  // like #/terms survive a refresh or work as a direct link.
  const setPage = (p) => {
    setPageState(p);
    setMenuOpen(false);
    const target = `#/${p}`;
    if (window.location.hash !== target) window.location.hash = target;
  };

  // Keep in sync if the hash changes from outside React (back/forward
  // buttons, a bookmarked link, or someone typing a URL directly).
  useEffect(() => {
    const onHashChange = () => setPageState(pageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goRequest = () => setPage('request');
  const goVerify = () => setPage('verify');
  const [residentLoggedIn, setResidentLoggedIn] = useState(!!localStorage.getItem('residentToken'));
  const goDashboard = () => setPage('dashboard');
  const handleLogout = () => {
    localStorage.removeItem('residentToken');
    localStorage.removeItem('residentInfo');
    setResidentLoggedIn(false);
    setPage('home');
  };
  const goTrack = (controlNumber) => {
    if (controlNumber) setTrackNumber(controlNumber);
    setPage('track');
  };
  const navTo = (p) => setPage(p);

  return (
    <div className="app">
      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <div className="header-left">
            <div className="header-title">Barangay 697 Zone 76</div>
            <div className="header-sub">Malate, Manila — Zone 76 e-Serbisyo</div>
          </div>

          <button
            className="nav-toggle"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
            <button className={`nav-btn ${page === 'home' ? 'active' : ''}`} onClick={() => navTo('home')}>Home</button>
            <button className={`nav-btn ${page === 'about' ? 'active' : ''}`} onClick={() => scrollToHomeSection('about-section')}>About Barangay</button>
            <button className={`nav-btn ${page === 'services' ? 'active' : ''}`} onClick={() => scrollToHomeSection('services-section')}>Services</button>
            {residentLoggedIn ? (
              <button className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`} onClick={goDashboard}>My Account</button>
            ) : (
              <>
                <button className={`nav-btn ${page === 'login' ? 'active' : ''}`} onClick={() => navTo('login')}>Login</button>
                <button className={`nav-btn ${page === 'register' ? 'active' : ''}`} onClick={() => navTo('register')}>Register</button>
              </>
            )}
            <button className={`nav-btn ${page === 'hotlines' ? 'active' : ''}`} onClick={() => navTo('hotlines')}>Hotlines</button>
            <button className={`nav-btn ${page === 'gallery' ? 'active' : ''}`} onClick={() => navTo('gallery')}>Gallery</button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="main">
        {page === 'home' && (
          <div>
            {/* Hero */}
            <HeroSlider>
              <img src={logo} alt="Barangay 697 Zone 76 Logo" className="hero-slider-logo" />
              <div className="hero-badge">Republic of the Philippines • City of Manila</div>
              <h1 className="hero-slider-title">Barangay 697 Zone 76</h1>
              <p className="hero-slider-sub">Online Resident Portal — Malate, Manila</p>
              <p className="hero-slider-desc">Access barangay information, submit document requests, and monitor your requests online — anytime, anywhere.</p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => navTo('login')}>Login</button>
                <button className="btn-outline" onClick={() => navTo('register')}>Register</button>
              </div>
            </HeroSlider>

            {/* Barangay Information */}
            <div className="section" id="about-section">
              <h2 className="section-title">About This Portal</h2>
              <p style={{ maxWidth: 720, margin: '0 auto 24px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: 15, lineHeight: 1.6 }}>
                The Barangay 697 Zone 76 Resident Portal is an online service that lets registered residents request barangay documents, track their requests, and manage their resident information — without needing to visit the barangay hall for every transaction.
              </p>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Address</div>
                  <div className="info-value">1858 L. M. Guerrero St., Manila, Philippines, 1004</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Office Hours</div>
                  <div className="info-value">Monday–Sunday, 24/7</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Email</div>
                  <div className="info-value">pb.brgy697@gmail.com</div>
                </div>
              </div>
            </div>

            {/* Online Services */}
            <div className="section section-muted" id="services-section">
              <h2 className="section-title">Online Services</h2>
              <div className="doc-grid">
                {DOCUMENTS.map((doc) => (
                  <div className="doc-card" key={doc.key}>
                    <div className="doc-icon"><DocIcon type={doc.key} /></div>
                    <h3 className="doc-name">{doc.name}</h3>
                    <p className="doc-desc">{doc.desc}</p>
                    <button className="btn-link" onClick={() => navTo('services')}>Learn more →</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Resident Portal Features */}
            <div className="section">
              <h2 className="section-title">What You Can Do in My Account</h2>
              <div className="doc-grid">
                <div className="doc-card">
                  <h3 className="doc-name">Request Documents</h3>
                  <p className="doc-desc">Submit a document request online in a few simple steps, with your resident information filled in automatically.</p>
                </div>
                <div className="doc-card">
                  <h3 className="doc-name">Track Your Requests</h3>
                  <p className="doc-desc">See the real-time status of every request you've submitted, from pending to released.</p>
                </div>
                <div className="doc-card">
                  <h3 className="doc-name">Notifications</h3>
                  <p className="doc-desc">Get notified when your request is approved, ready for pickup, or needs attention.</p>
                </div>
                <div className="doc-card">
                  <h3 className="doc-name">Digital Barangay ID</h3>
                  <p className="doc-desc">View your resident identification with your uploaded photo, ready for the barangay to print.</p>
                </div>
              </div>
            </div>

            {/* Disaster / Emergency Response */}
            <div className="section section-muted">
              <h2 className="section-title">Emergency &amp; Disaster Preparedness</h2>
              <p style={{ maxWidth: 720, margin: '0 auto 24px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: 15, lineHeight: 1.6 }}>
                In case of an emergency, stay calm, keep your family together, and follow instructions from barangay officials and local authorities. Keep emergency contact numbers accessible, prepare a basic emergency kit, and know your nearest evacuation area.
              </p>
              <div className="success-btns" style={{ marginTop: 8 }}>
                <button className="btn-primary" onClick={() => navTo('hotlines')}>View Emergency Hotlines</button>
              </div>
            </div>

            {/* Hotlines preview */}
            <div className="section">
              <h2 className="section-title">Emergency Hotlines</h2>
              <p style={{ maxWidth: 620, margin: '0 auto 20px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: 15 }}>
                Quick access to barangay and emergency contact numbers, whenever you need them.
              </p>
              <div className="success-btns">
                <button className="btn-outline-dark" onClick={() => navTo('hotlines')}>View All Hotlines →</button>
              </div>
            </div>

            {/* Gallery preview */}
            <div className="section section-muted">
              <h2 className="section-title">Community Gallery</h2>
              <p style={{ maxWidth: 620, margin: '0 auto 20px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: 15 }}>
                A look at barangay events, projects, and community activities.
              </p>
              <div className="success-btns">
                <button className="btn-outline-dark" onClick={() => navTo('gallery')}>View Gallery →</button>
              </div>
            </div>
          </div>
        )}

        {page === 'request' && <RequestForm onTrack={goTrack} onVerify={goVerify} onBack={() => (residentLoggedIn ? goDashboard() : navTo('home'))} />}
        {page === 'verify' && <VerifyResidency onGoRequest={goRequest} />}
        {page === 'track' && <TrackRequest initialNumber={trackNumber} />}
        {page === 'hotlines' && <Hotlines />}
        {page === 'gallery' && <Gallery />}
        {page === 'register' && <Register onGoLogin={() => navTo('login')} onBack={() => navTo('home')} />}
        {page === 'login' && <Login onLoggedIn={() => { setResidentLoggedIn(true); goDashboard(); }} onGoRegister={() => navTo('register')} onBack={() => navTo('home')} />}
        {page === 'dashboard' && <Dashboard onLogout={handleLogout} onRequestDocument={goRequest} onTrack={goTrack} onTrackRequests={() => navTo('track-requests')} onRequestHistory={() => navTo('request-history')} onOpenNotifications={() => navTo('notifications')} />}
        {page === 'track-requests' && <MyRequests initialFilter="Active" title="Track My Requests" onBack={goDashboard} onRequestDocument={goRequest} />}
        {page === 'request-history' && <MyRequests initialFilter="All" title="Request History" onBack={goDashboard} onRequestDocument={goRequest} />}
        {page === 'notifications' && <Notifications onBack={goDashboard} />}
        {page === 'about' && <About onBack={() => navTo('home')} />}
        {page === 'services' && <Services onBack={() => navTo('home')} onGoLogin={() => navTo('login')} />}
        {page === 'terms' && <Terms onBack={() => navTo('home')} />}
        {page === 'privacy' && <Privacy onBack={() => navTo('home')} />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-main">
            <div className="footer-title">Barangay 697 Zone 76</div>
            <div>Malate, Manila, District V, City of Manila</div>
          </div>
          <div className="footer-links">
            <button onClick={() => navTo('home')}>Home</button>
            <button onClick={() => navTo('about')}>About</button>
            <button onClick={() => navTo('services')}>Services</button>
            {residentLoggedIn && <button onClick={goDashboard}>My Account</button>}
            <button onClick={() => navTo('hotlines')}>Hotlines</button>
            <button onClick={() => navTo('gallery')}>Gallery</button>
            <button onClick={() => navTo('terms')}>Terms &amp; Conditions</button>
            <button onClick={() => navTo('privacy')}>Privacy Notice</button>
          </div>
        </div>
        <div className="footer-copyright">© {new Date().getFullYear()} Barangay Management System</div>
      </footer>
    </div>
  );
}

export default App;
