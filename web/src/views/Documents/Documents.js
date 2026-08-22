import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { documentAPI, residentAPI } from '../../api/services';
import { DOCUMENT_TYPES, DOCUMENT_STATUS, STATUS_BADGE } from '../../config';
import DocumentPrint from './DocumentPrint';

const EMPTY = { residentId:'', documentType:'Barangay Clearance', purpose:'', status:'Pending', fee:0, remarks:'' };

const Documents = () => {
  const [data, setData]           = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setModal]     = useState(false);
  const [printDoc, setPrintDoc]   = useState(null);
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const docRes = await documentAPI.getAll({ status: filterStatus || undefined, page, limit: LIMIT });
      setData(docRes.data.data);
      setTotal(docRes.data.pagination.total);
    } catch { toast.error('Failed to load documents.'); }
    finally { setLoading(false); }
    try {
      const resRes = await residentAPI.getAll({ limit: 999 });
      setResidents(resRes.data.data);
    } catch { toast.error('Failed to load residents.'); }
  }, [filterStatus, page]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (d) => { setSelected(d); setForm({ residentId:d.residentId, documentType:d.documentType, purpose:d.purpose, status:d.status, fee:d.fee||0, remarks:d.remarks||'' }); setModal(true); };
  const openPrint = async (d) => {
    try {
      const res = await documentAPI.getOne(d.id);
      setPrintDoc(res.data.data);
    } catch { toast.error('Failed to load document details.'); }
  };

  const handleSave = async () => {
    if (!form.residentId || !form.purpose) return toast.error('Please fill in all required fields.');
    setSaving(true);
    try {
      if (selected) { await documentAPI.update(selected.id, form); toast.success('Document updated.'); }
      else          { await documentAPI.create(form); toast.success('Document request created.'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document request?')) return;
    try { await documentAPI.remove(id); toast.success('Deleted.'); load(); }
    catch { toast.error('Delete failed.'); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="page-header">
        <div><h2>Document Requests</h2><p>{total} total requests</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ New Request</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display:'flex', gap:10 }}>
            {['', ...DOCUMENT_STATUS].map(s => (
              <button key={s} className={`btn btn-sm ${filterStatus===s ? 'btn-primary' : 'btn-ghost'}`} onClick={()=>{ setFilterStatus(s); setPage(1); }}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Control #</th><th>Resident</th><th>Document Type</th><th>Purpose</th><th>Fee</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon"></div><p>No document requests found.</p></div></td></tr>
                ) : data.map(d => (
                  <tr key={d.id}>
                    <td><code style={{ fontSize:11 }}>{d.controlNumber}</code></td>
                    <td>{d.Resident ? `${d.Resident.lastName}, ${d.Resident.firstName}` : '—'}</td>
                    <td>{d.documentType}</td>
                    <td>{d.purpose}</td>
                    <td>₱{parseFloat(d.fee||0).toFixed(2)}</td>
                    <td><span className={`badge ${STATUS_BADGE[d.status]||'badge-gray'}`}>{d.status}</span></td>
                    <td>{new Date(d.createdAt).toLocaleDateString('en-PH')}</td>
                    <td style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>openPrint(d)} title="Print">🖨️</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(d)} title="Edit">✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(d.id)} title="Delete">🗑️</button>
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
      {printDoc && <DocumentPrint doc={printDoc} onClose={()=>setPrintDoc(null)} />}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selected ? 'Edit Document Request' : 'New Document Request'}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Resident *</label>
                <select className="form-control" value={form.residentId} onChange={e=>setForm({...form,residentId:e.target.value})}>
                  <option value="">— Select Resident —</option>
                  {residents.map(r=><option key={r.id} value={r.id}>{r.lastName}, {r.firstName} {r.middleName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Document Type *</label>
                <select className="form-control" value={form.documentType} onChange={e=>setForm({...form,documentType:e.target.value})}>
                  {DOCUMENT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose *</label>
                <input className="form-control" value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} placeholder="e.g. Employment, School enrollment..." />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  {DOCUMENT_STATUS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea className="form-control" rows={3} value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})} />
              </div>
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

export default Documents;
