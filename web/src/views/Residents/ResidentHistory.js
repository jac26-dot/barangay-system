import React, { useEffect, useState } from 'react';
import { documentAPI, blotterAPI } from '../../api/services';
import { STATUS_BADGE } from '../../config';

const ResidentHistory = ({ resident, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [blotters,  setBlotters]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('documents');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const docRes = await documentAPI.getAll({ residentId: resident.id, limit: 999 });
        setDocuments(docRes.data.data);
      } catch {}
      try {
        const bltRes = await blotterAPI.getAll({ limit: 999 });
        const filtered = bltRes.data.data.filter(b =>
          b.complainantName?.toLowerCase().includes(resident.firstName?.toLowerCase()) ||
          b.complainantName?.toLowerCase().includes(resident.lastName?.toLowerCase()) ||
          b.respondentName?.toLowerCase().includes(resident.firstName?.toLowerCase()) ||
          b.respondentName?.toLowerCase().includes(resident.lastName?.toLowerCase())
        );
        setBlotters(filtered);
      } catch {}
      setLoading(false);
    };
    load();
  }, [resident]);

  const fullName = `${resident.lastName}, ${resident.firstName} ${resident.middleName || ''}`.trim();
  const age = resident.birthDate
    ? Math.floor((new Date() - new Date(resident.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))
    : '—';

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <h3>📋 Resident History</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Resident Info */}
        <div style={{ padding:'16px 24px', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', display:'flex', gap:24, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:1 }}>Full Name</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{fullName}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:1 }}>Age</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{age} years old</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:1 }}>Address</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{resident.address}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:1 }}>Status</div>
            <span className={`badge ${STATUS_BADGE[resident.status]||'badge-gray'}`}>{resident.status}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid #e5e7eb', padding:'0 24px' }}>
          <button
            style={{ padding:'12px 16px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:600, borderBottom: tab==='documents' ? '2px solid #1a56db' : '2px solid transparent', color: tab==='documents' ? '#1a56db' : '#6b7280' }}
            onClick={()=>setTab('documents')}
          >
            📄 Documents ({documents.length})
          </button>
          <button
            style={{ padding:'12px 16px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:600, borderBottom: tab==='blotters' ? '2px solid #c81e1e' : '2px solid transparent', color: tab==='blotters' ? '#c81e1e' : '#6b7280' }}
            onClick={()=>setTab('blotters')}
          >
            📋 Blotters ({blotters.length})
          </button>
        </div>

        {/* Content */}
        <div style={{ maxHeight:'50vh', overflowY:'auto' }}>
          {loading ? <div className="loading">Loading history...</div> : (
            <>
              {tab === 'documents' && (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Control #</th><th>Document Type</th><th>Purpose</th><th>Fee</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {documents.length === 0 ? (
                        <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📄</div><p>No document requests yet.</p></div></td></tr>
                      ) : documents.map(d=>(
                        <tr key={d.id}>
                          <td><code style={{fontSize:11}}>{d.controlNumber}</code></td>
                          <td>{d.documentType}</td>
                          <td>{d.purpose}</td>
                          <td>₱{parseFloat(d.fee||0).toFixed(2)}</td>
                          <td><span className={`badge ${STATUS_BADGE[d.status]||'badge-gray'}`}>{d.status}</span></td>
                          <td style={{fontSize:12}}>{new Date(d.createdAt).toLocaleDateString('en-PH')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'blotters' && (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Case #</th><th>Role</th><th>Incident Type</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>
                      {blotters.length === 0 ? (
                        <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">📋</div><p>No blotter records found.</p></div></td></tr>
                      ) : blotters.map(b=>(
                        <tr key={b.id}>
                          <td><code style={{fontSize:11}}>{b.caseNumber}</code></td>
                          <td>
                            {b.complainantName?.toLowerCase().includes(resident.firstName?.toLowerCase()) ||
                             b.complainantName?.toLowerCase().includes(resident.lastName?.toLowerCase())
                              ? <span className="badge badge-danger">Complainant</span>
                              : <span className="badge badge-warning">Respondent</span>
                            }
                          </td>
                          <td>{b.incidentType}</td>
                          <td style={{fontSize:12}}>{new Date(b.incidentDate).toLocaleDateString('en-PH')}</td>
                          <td><span className={`badge ${STATUS_BADGE[b.status]||'badge-gray'}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ResidentHistory;
