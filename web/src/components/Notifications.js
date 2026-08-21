import React, { useEffect, useState, useRef } from 'react';
import { documentAPI } from '../api/services';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const [pending,   setPending]   = useState([]);
  const [open,      setOpen]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const [isNew,     setIsNew]     = useState(false);
  const ref      = useRef(null);
  const navigate = useNavigate();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res  = await documentAPI.getAll({ status: 'Pending', limit: 20 });
      const docs = res.data.data;
      if (docs.length > lastCount && lastCount > 0) setIsNew(true);
      setLastCount(docs.length);
      setPending(docs);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen    = () => { setOpen(!open); setIsNew(false); };
  const handleViewDoc = () => { setOpen(false); navigate('/documents'); };

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={handleOpen} style={{ position:'relative', background: open?'#f3f4f6':'transparent', border:'none', cursor:'pointer', padding:'6px 10px', borderRadius:8 }}>
        <span style={{ fontSize:20 }}>🔔</span>
        {pending.length > 0 && (
          <span style={{ position:'absolute', top:2, right:2, background: isNew?'#c81e1e':'#1a56db', color:'#fff', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800 }}>
            {pending.length > 9 ? '9+' : pending.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)', width:340, background:'#fff', borderRadius:10, border:'1px solid #e5e7eb', boxShadow:'0 10px 40px rgba(0,0,0,0.15)', zIndex:9999 }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#111827' }}>Notifications</div>
              <div style={{ fontSize:11, color:'#6b7280' }}>{pending.length} pending document request{pending.length !== 1?'s':''}</div>
            </div>
            <button onClick={fetchPending} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, color:'#6b7280' }}>🔄</button>
          </div>

          <div style={{ maxHeight:320, overflowY:'auto' }}>
            {loading ? (
              <div style={{ padding:20, textAlign:'center', color:'#9ca3af', fontSize:13 }}>Loading...</div>
            ) : pending.length === 0 ? (
              <div style={{ padding:24, textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                <div style={{ fontWeight:600, color:'#374151', fontSize:13 }}>All caught up!</div>
                <div style={{ fontSize:12, color:'#9ca3af' }}>No pending document requests.</div>
              </div>
            ) : pending.map(doc => (
              <div key={doc.id} onClick={handleViewDoc}
                style={{ padding:'12px 16px', borderBottom:'1px solid #f9fafb', display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                onMouseLeave={e=>e.currentTarget.style.background='#fff'}
              >
                <div style={{ width:36, height:36, borderRadius:8, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>📄</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:'#111827', marginBottom:2 }}>{doc.documentType}</div>
                  <div style={{ fontSize:11, color:'#6b7280' }}>{doc.Resident ? `${doc.Resident.lastName}, ${doc.Resident.firstName}` : 'Unknown Resident'}</div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{new Date(doc.createdAt).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' })}</div>
                </div>
                <span style={{ background:'#fef3c7', color:'#c27803', padding:'2px 8px', borderRadius:10, fontSize:10, fontWeight:700, flexShrink:0 }}>Pending</span>
              </div>
            ))}
          </div>

          {pending.length > 0 && (
            <div style={{ padding:'10px 16px', borderTop:'1px solid #e5e7eb' }}>
              <button onClick={handleViewDoc} style={{ width:'100%', padding:'8px', background:'#1a56db', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600, fontSize:13 }}>
                View All Pending Documents
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
