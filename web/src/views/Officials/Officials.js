import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { officialAPI } from '../../api/services';
import { OFFICIAL_POSITIONS, STATUS_BADGE } from '../../config';

const EMPTY = { firstName:'', middleName:'', lastName:'', position:'Barangay Captain', committee:'', contactNumber:'', termStart:'', termEnd:'', status:'Active' };

const Officials = () => {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setModal]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await officialAPI.getAll(); setData(res.data.data); }
    catch { toast.error('Failed to load officials.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (o) => { setSelected(o); setForm({ ...o, termStart: o.termStart?.slice(0,10), termEnd: o.termEnd?.slice(0,10) }); setModal(true); };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.termStart || !form.termEnd) return toast.error('Fill in all required fields.');
    setSaving(true);
    try {
      if (selected) { await officialAPI.update(selected.id, form); toast.success('Official updated.'); }
      else          { await officialAPI.create(form); toast.success('Official added.'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this official?')) return;
    try { await officialAPI.remove(id); toast.success('Removed.'); load(); }
    catch { toast.error('Failed.'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Barangay Officials</h2><p>{data.length} officials on record</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Official</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Position</th><th>Committee</th><th>Contact</th><th>Term</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon"></div><p>No officials added yet.</p></div></td></tr>
                ) : data.map(o=>(
                  <tr key={o.id}>
                    <td><strong>{o.lastName}, {o.firstName} {o.middleName}</strong></td>
                    <td>{o.position}</td>
                    <td>{o.committee || '—'}</td>
                    <td>{o.contactNumber || '—'}</td>
                    <td style={{fontSize:12}}>{new Date(o.termStart).toLocaleDateString('en-PH')} – {new Date(o.termEnd).toLocaleDateString('en-PH')}</td>
                    <td><span className={`badge ${STATUS_BADGE[o.status]||'badge-gray'}`}>{o.status}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{marginRight:4}} onClick={()=>openEdit(o)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(o.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selected ? 'Edit Official' : 'Add Official'}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Middle Name</label><input className="form-control" value={form.middleName} onChange={e=>setForm({...form,middleName:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Contact Number</label><input className="form-control" value={form.contactNumber} onChange={e=>setForm({...form,contactNumber:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Position *</label>
                  <select className="form-control" value={form.position} onChange={e=>setForm({...form,position:e.target.value})}>
                    {OFFICIAL_POSITIONS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Committee</label><input className="form-control" value={form.committee} onChange={e=>setForm({...form,committee:e.target.value})} placeholder="e.g. Peace & Order" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Term Start *</label><input className="form-control" type="date" value={form.termStart} onChange={e=>setForm({...form,termStart:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Term End *</label><input className="form-control" type="date" value={form.termEnd} onChange={e=>setForm({...form,termEnd:e.target.value})} /></div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option>Active</option><option>Inactive</option>
                </select>
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

export default Officials;
