import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { blotterAPI } from '../../api/services';
import { BLOTTER_STATUS, INCIDENT_TYPES, STATUS_BADGE } from '../../config';
import BlotterPrint from './BlotterPrint';

const EMPTY = { complainantName:'', respondentName:'', incidentType:'Physical Assault', incidentDate:'', incidentLocation:'', narrative:'', status:'Open', resolution:'' };

const Blotter = () => {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setModal]   = useState(false);
  const [printBlotter, setPrint]= useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blotterAPI.getAll({ status: filterStatus || undefined, page, limit: LIMIT });
      setData(res.data.data);
      setTotal(res.data.pagination.total);
    } catch { toast.error('Failed to load blotter records.'); }
    finally { setLoading(false); }
  }, [filterStatus, page]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (b) => { setSelected(b); setForm({ complainantName:b.complainantName, respondentName:b.respondentName, incidentType:b.incidentType, incidentDate:b.incidentDate?.slice(0,10), incidentLocation:b.incidentLocation, narrative:b.narrative, status:b.status, resolution:b.resolution||'' }); setModal(true); };
  const openPrint = async (b) => {
    try {
      const res = await blotterAPI.getOne(b.id);
      setPrint(res.data.data);
    } catch { toast.error('Failed to load blotter details.'); }
  };

  const handleSave = async () => {
    if (!form.complainantName || !form.respondentName || !form.incidentDate || !form.narrative) return toast.error('Fill in all required fields.');
    setSaving(true);
    try {
      if (selected) { await blotterAPI.update(selected.id, form); toast.success('Blotter updated.'); }
      else          { await blotterAPI.create(form); toast.success('Blotter recorded.'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blotter record?')) return;
    try { await blotterAPI.remove(id); toast.success('Deleted.'); load(); }
    catch { toast.error('Delete failed.'); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="page-header">
        <div><h2>Blotter Records</h2><p>{total} total incidents recorded</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Record Incident</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['', ...BLOTTER_STATUS].map(s=>(
              <button key={s} className={`btn btn-sm ${filterStatus===s?'btn-primary':'btn-ghost'}`} onClick={()=>{ setFilterStatus(s); setPage(1); }}>{s||'All'}</button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Case #</th><th>Complainant</th><th>Respondent</th><th>Incident Type</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon"></div><p>No blotter records found.</p></div></td></tr>
                ) : data.map(b=>(
                  <tr key={b.id}>
                    <td><code style={{fontSize:11}}>{b.caseNumber}</code></td>
                    <td>{b.complainantName}</td>
                    <td>{b.respondentName}</td>
                    <td>{b.incidentType}</td>
                    <td>{new Date(b.incidentDate).toLocaleDateString('en-PH')}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status]||'badge-gray'}`}>{b.status}</span></td>
                    <td style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>openPrint(b)} title="Print">🖨️</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(b)} title="Edit">✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(b.id)} title="Delete">🗑️</button>
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

      {/* Print Modal */}
      {printBlotter && <BlotterPrint blotter={printBlotter} onClose={()=>setPrint(null)} />}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selected ? 'Edit Blotter' : 'Record New Incident'}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Complainant *</label><input className="form-control" value={form.complainantName} onChange={e=>setForm({...form,complainantName:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Respondent *</label><input className="form-control" value={form.respondentName} onChange={e=>setForm({...form,respondentName:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Incident Type *</label>
                  <select className="form-control" value={form.incidentType} onChange={e=>setForm({...form,incidentType:e.target.value})}>
                    {INCIDENT_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Incident Date *</label><input className="form-control" type="date" value={form.incidentDate} onChange={e=>setForm({...form,incidentDate:e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Location *</label><input className="form-control" value={form.incidentLocation} onChange={e=>setForm({...form,incidentLocation:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Narrative *</label><textarea className="form-control" rows={4} value={form.narrative} onChange={e=>setForm({...form,narrative:e.target.value})} placeholder="Detailed description of the incident..." /></div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  {BLOTTER_STATUS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              {(form.status === 'Settled' || form.status === 'Closed') && (
                <div className="form-group"><label className="form-label">Resolution</label><textarea className="form-control" rows={3} value={form.resolution} onChange={e=>setForm({...form,resolution:e.target.value})} /></div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blotter;
