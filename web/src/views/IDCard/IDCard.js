import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { residentAPI } from '../../api/services';
import logo from '../../barangay-logo.jpg';

const IDCard = () => {
  const [residents,   setResidents]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const LIMIT = 10;

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const params = { limit: LIMIT, page };
    if (search) params.search = search;
    residentAPI.getAll(params)
      .then(res => { setResidents(res.data.data); setTotal(res.data.pagination.total); })
      .catch(() => toast.error('Failed to load residents.'))
      .finally(() => setLoading(false));
  }, [search, page]);

  const computeAge = (birthDate) => {
    if (!birthDate) return '—';
    return Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handlePrint = (resident) => {
    const age      = computeAge(resident.birthDate);
    const idNumber = `BRY697-${String(resident.id).padStart(5, '0')}`;
    const issued   = new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });
    const expiry   = new Date(new Date().setFullYear(new Date().getFullYear() + 3))
      .toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barangay ID - ${resident.lastName}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; background:#f5f5f5; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; }
          .id-card { width:340px; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.2); margin-bottom:16px; }
          .card-front { background:linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); }
          .card-front-header { background:linear-gradient(90deg, #1a56db, #1e3a5f); padding:10px 14px; display:flex; align-items:center; gap:10px; border-bottom:2px solid rgba(255,255,255,0.2); }
          .card-front-header img { width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,0.5); }
          .header-text h3 { font-size:10px; font-weight:800; letter-spacing:1px; color:#fff; }
          .header-text p { font-size:8px; color:rgba(255,255,255,0.7); }
          .card-body { padding:14px; display:flex; gap:12px; align-items:flex-start; }
          .photo-box { width:70px; height:80px; border-radius:6px; background:rgba(255,255,255,0.1); border:2px solid rgba(255,255,255,0.3); display:flex; align-items:center; justify-content:center; font-size:28px; flex-shrink:0; }
          .info { flex:1; }
          .resident-name { font-size:12px; font-weight:800; text-transform:uppercase; margin-bottom:6px; line-height:1.3; color:#fff; }
          .detail { font-size:9px; color:rgba(255,255,255,0.7); margin-bottom:3px; }
          .detail span { color:#fff; font-weight:600; }
          .id-box { background:rgba(255,255,255,0.1); border-radius:4px; padding:4px 8px; margin-top:8px; }
          .id-box p { font-size:8px; color:rgba(255,255,255,0.6); }
          .id-box h4 { font-size:12px; font-weight:800; color:#60a5fa; letter-spacing:1px; }
          .card-footer { background:rgba(0,0,0,0.3); padding:8px 14px; display:flex; justify-content:space-between; }
          .card-footer p { font-size:8px; color:rgba(255,255,255,0.5); }
          .card-footer h5 { font-size:9px; color:#fff; font-weight:700; }
          .card-back { background:#fff; border:1px solid #e5e7eb; }
          .back-header { background:#1e3a5f; padding:8px 14px; }
          .back-header p { font-size:9px; color:#fff; font-weight:600; text-align:center; }
          .back-body { padding:14px; }
          .back-row { display:flex; justify-content:space-between; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #f3f4f6; }
          .back-label { font-size:8px; color:#6b7280; font-weight:600; text-transform:uppercase; }
          .back-value { font-size:9px; font-weight:700; text-align:right; max-width:60%; color:#111; }
          .sig-row { display:flex; justify-content:space-between; margin-top:16px; }
          .sig-block { text-align:center; }
          .sig-line { border-top:1px solid #000; width:100px; margin:4px auto; }
          .sig-label { font-size:7px; color:#6b7280; }
          .emergency { background:#fef3c7; border:1px solid #f59e0b; border-radius:4px; padding:6px 8px; margin-top:10px; }
          .emergency p { font-size:7px; color:#92400e; font-weight:600; }
          .emergency h5 { font-size:9px; color:#78350f; font-weight:800; }
          .back-footer { background:#1e3a5f; padding:6px 14px; }
          .back-footer p { font-size:7px; color:rgba(255,255,255,0.6); text-align:center; }
          .cut-line { border-top:1px dashed #ccc; width:340px; margin:8px 0; text-align:center; font-size:9px; color:#aaa; }
        </style>
      </head>
      <body>
        <div class="id-card">
          <div class="card-front">
            <div class="card-front-header">
              <img src="${logo}" alt="Logo"/>
              <div class="header-text">
                <h3>BARANGAY 697 ZONE 76</h3>
                <p>District V, City of Manila • Philippines</p>
              </div>
            </div>
            <div class="card-body">
              <div class="photo-box">👤</div>
              <div class="info">
                <div class="resident-name">${resident.lastName}, ${resident.firstName} ${resident.middleName||''}</div>
                <div class="detail">Address: <span>${resident.address}</span></div>
                <div class="detail">Gender: <span>${resident.gender}</span> &nbsp; Age: <span>${age}</span></div>
                <div class="detail">Civil Status: <span>${resident.civilStatus}</span></div>
                ${resident.isSeniorCitizen?'<div class="detail"><span style="color:#fbbf24">★ SENIOR CITIZEN</span></div>':''}
                ${resident.isVoter?'<div class="detail"><span style="color:#34d399">✓ REGISTERED VOTER</span></div>':''}
                <div class="id-box">
                  <p>BARANGAY ID NO.</p>
                  <h4>${idNumber}</h4>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div><p>Date Issued</p><h5>${issued}</h5></div>
              <div style="text-align:right"><p>Valid Until</p><h5>${expiry}</h5></div>
            </div>
          </div>
        </div>

        <div class="cut-line">✂ fold here</div>

        <div class="id-card">
          <div class="card-back">
            <div class="back-header"><p>BARANGAY 697 ZONE 76 — IDENTIFICATION CARD (BACK)</p></div>
            <div class="back-body">
              <div class="back-row"><div class="back-label">Full Name</div><div class="back-value">${resident.lastName}, ${resident.firstName} ${resident.middleName||''}</div></div>
              <div class="back-row"><div class="back-label">Date of Birth</div><div class="back-value">${resident.birthDate?new Date(resident.birthDate).toLocaleDateString('en-PH'):'—'}</div></div>
              <div class="back-row"><div class="back-label">Contact</div><div class="back-value">${resident.contactNumber||'—'}</div></div>
              <div class="back-row"><div class="back-label">Occupation</div><div class="back-value">${resident.occupation||'—'}</div></div>
              <div class="back-row" style="border:none;margin:0;padding:0"><div class="back-label">ID Number</div><div class="back-value" style="color:#1a56db;font-size:11px">${idNumber}</div></div>
              <div class="emergency">
                <p>IN CASE OF EMERGENCY:</p>
                <h5>Barangay 697 Zone 76 Hall</h5>
                <p>District V, City of Manila</p>
              </div>
              <div class="sig-row">
                <div class="sig-block"><div style="height:24px"></div><div class="sig-line"></div><div class="sig-label">Signature of Holder</div></div>
                <div class="sig-block"><div style="height:24px"></div><div class="sig-line"></div><div class="sig-label">Punong Barangay</div></div>
              </div>
            </div>
            <div class="back-footer"><p>This ID is the property of Barangay 697 Zone 76. If found, please return to the nearest barangay hall.</p></div>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Barangay ID Card Generator</h2>
          <p>{total} total residents</p>
        </div>
      </div>

      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>🪪</span>
        <div>
          <div style={{ fontWeight:600, fontSize:13, color:'#1e40af' }}>How to use</div>
          <div style={{ fontSize:12, color:'#3b82f6' }}>Search for a resident then click "Print ID" to generate their official Barangay ID Card.</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ position:'relative', flex:1, maxWidth:360 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }}>🔍</span>
            <input className="form-control" style={{ paddingLeft:34 }} placeholder="Search resident by name..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="loading">Loading residents...</div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>Address</th><th>Gender</th><th>Age</th><th>Status</th><th>Tags</th><th>Action</th></tr>
              </thead>
              <tbody>
                {residents.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon">🪪</div>
                      <p>No residents found. Add residents in the Residents module first.</p>
                    </div>
                  </td></tr>
                ) : residents.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.lastName}, {r.firstName} {r.middleName}</strong></td>
                    <td style={{ fontSize:12 }}>{r.address}</td>
                    <td>{r.gender}</td>
                    <td><strong>{computeAge(r.birthDate)}</strong></td>
                    <td><span className={`badge ${r.status==='Active'?'badge-success':'badge-gray'}`}>{r.status}</span></td>
                    <td>
                      {r.isVoter         && <span className="badge badge-primary" style={{marginRight:3,fontSize:10}}>Voter</span>}
                      {r.isIndigent      && <span className="badge badge-warning" style={{marginRight:3,fontSize:10}}>Indigent</span>}
                      {r.isSeniorCitizen && <span className="badge badge-gray"    style={{fontSize:10}}>Senior</span>}
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handlePrint(r)}>🪪 Print ID</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pages > 1 && (
              <div className="pagination">
                <button onClick={()=>setPage(p=>p-1)} disabled={page===1}>← Prev</button>
                {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                  <button key={p} className={page===p?'active':''} onClick={()=>setPage(p)}>{p}</button>
                ))}
                <button onClick={()=>setPage(p=>p+1)} disabled={page===pages}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IDCard;
