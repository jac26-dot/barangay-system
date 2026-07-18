import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { residentAPI } from '../../api/services';
import { CIVIL_STATUS, STATUS_BADGE } from '../../config';
import ResidentHistory from './ResidentHistory';
import * as XLSX from 'xlsx';

const computeAge = (birthDate) => {
  if (!birthDate) return null;
  return Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
};

const EMPTY = { firstName:'', middleName:'', lastName:'', birthDate:'', gender:'Male', civilStatus:'Single', address:'', contactNumber:'', email:'', occupation:'', isVoter:false, isIndigent:false, isSeniorCitizen:false, status:'Active' };

const Modal = ({ title, onClose, onSave, form, setForm, saving }) => {
  const age = computeAge(form.birthDate);
  const isSenior = age !== null && age >= 60;

  // Auto-set senior citizen when birthdate changes
  const handleBirthDateChange = (e) => {
    const bd = e.target.value;
    const computedAge = computeAge(bd);
    const senior = computedAge !== null && computedAge >= 60;
    setForm({ ...form, birthDate: bd, isSeniorCitizen: senior });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Middle Name</label><input className="form-control" value={form.middleName} onChange={e=>setForm({...form,middleName:e.target.value})} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} /></div>
            <div className="form-group">
              <label className="form-label">
                Birthdate * {age !== null && <span style={{ color: isSenior ? '#c27803' : '#1a56db', fontWeight:600 }}>— Age: {age} {isSenior ? '👴 Senior Citizen' : ''}</span>}
              </label>
              <input className="form-control" type="date" value={form.birthDate} onChange={handleBirthDateChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Gender *</label>
              <select className="form-control" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Civil Status *</label>
              <select className="form-control" value={form.civilStatus} onChange={e=>setForm({...form,civilStatus:e.target.value})}>
                {CIVIL_STATUS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Address *</label><input className="form-control" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Contact Number</label><input className="form-control" value={form.contactNumber} onChange={e=>setForm({...form,contactNumber:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Occupation</label><input className="form-control" value={form.occupation} onChange={e=>setForm({...form,occupation:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option>Active</option><option>Deceased</option><option>Transferred</option>
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:16, marginTop:8, flexWrap:'wrap' }}>
            <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}><input type="checkbox" checked={form.isVoter} onChange={e=>setForm({...form,isVoter:e.target.checked})} /> Voter</label>
            <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}><input type="checkbox" checked={form.isIndigent} onChange={e=>setForm({...form,isIndigent:e.target.checked})} /> Indigent</label>
            <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
              <input type="checkbox" checked={form.isSeniorCitizen} onChange={e=>setForm({...form,isSeniorCitizen:e.target.checked})} />
              Senior Citizen {isSenior && <span style={{color:'#c27803', fontSize:11}}>(auto-detected)</span>}
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Resident'}</button>
        </div>
      </div>
    </div>
  );
};

const Residents = () => {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [showModal, setModal]         = useState(false);
  const [historyResident, setHistory] = useState(null);
  const [selected, setSelected]       = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [saving, setSaving]           = useState(false);
  const [exporting, setExporting]     = useState(false);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const LIMIT = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search)       params.search = search;
      if (genderFilter) params.gender = genderFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await residentAPI.getAll(params);
      setData(res.data.data);
      setTotal(res.data.pagination.total);
    } catch { toast.error('Failed to load residents.'); }
    finally { setLoading(false); }
  }, [search, genderFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r) => { setSelected(r); setForm({...r, birthDate: r.birthDate?.slice(0,10) }); setModal(true); };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.birthDate || !form.address) return toast.error('Please fill in all required fields.');
    setSaving(true);
    try {
      if (selected) { await residentAPI.update(selected.id, form); toast.success('Resident updated.'); }
      else          { await residentAPI.create(form); toast.success('Resident added.'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resident?')) return;
    try { await residentAPI.remove(id); toast.success('Resident deleted.'); load(); }
    catch { toast.error('Delete failed.'); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await residentAPI.getAll({ limit: 9999 });
      const rows = res.data.data.map((r, i) => ({
        '#':              i + 1,
        'Last Name':      r.lastName,
        'First Name':     r.firstName,
        'Middle Name':    r.middleName || '',
        'Age':            computeAge(r.birthDate) || '',
        'Birthdate':      r.birthDate || '',
        'Gender':         r.gender,
        'Civil Status':   r.civilStatus,
        'Address':        r.address,
        'Contact':        r.contactNumber || '',
        'Email':          r.email || '',
        'Occupation':     r.occupation || '',
        'Voter':          r.isVoter ? 'Yes' : 'No',
        'Indigent':       r.isIndigent ? 'Yes' : 'No',
        'Senior Citizen': r.isSeniorCitizen ? 'Yes' : 'No',
        'Status':         r.status,
        'Date Registered': new Date(r.createdAt).toLocaleDateString('en-PH'),
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();

      // Column widths
      ws['!cols'] = [
        {wch:4},{wch:15},{wch:15},{wch:15},{wch:5},{wch:12},{wch:8},
        {wch:12},{wch:30},{wch:14},{wch:22},{wch:15},{wch:6},{wch:8},{wch:14},{wch:10},{wch:16},
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Residents');
      const today = new Date().toISOString().slice(0,10);
      XLSX.writeFile(wb, `residents-${today}.xlsx`);
      toast.success('Exported successfully!');
    } catch { toast.error('Export failed.'); }
    finally { setExporting(false); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="page-header">
        <div><h2>Residents</h2><p>{total} total residents registered</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" onClick={handleExport} disabled={exporting}>
            {exporting ? '⏳ Exporting...' : '📤 Export Excel'}
          </button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Resident</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap:'wrap', gap:10 }}>
          {/* Quick Search */}
          <div style={{ position:'relative', flex:1, minWidth:200, maxWidth:320 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:14 }}>🔍</span>
            <input
              className="form-control"
              style={{ paddingLeft:34 }}
              placeholder="Search by name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <select className="form-control" style={{ width:'auto' }} value={genderFilter} onChange={e=>{ setGenderFilter(e.target.value); setPage(1); }}>
              <option value="">All Genders</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <select className="form-control" style={{ width:'auto' }} value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option>Active</option>
              <option>Deceased</option>
              <option>Transferred</option>
            </select>
            {(search || genderFilter || statusFilter) && (
              <button className="btn btn-ghost btn-sm" onClick={()=>{ setSearchInput(''); setSearch(''); setGenderFilter(''); setStatusFilter(''); }}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Age</th><th>Gender</th><th>Civil Status</th>
                  <th>Address</th><th>Contact</th><th>Tags</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><p>No residents found.</p></div></td></tr>
                ) : data.map(r => {
                  const age = computeAge(r.birthDate);
                  return (
                    <tr key={r.id}>
                      <td><strong>{r.lastName}, {r.firstName} {r.middleName}</strong></td>
                      <td>{age !== null ? <span style={{ fontWeight:600 }}>{age}</span> : '—'}</td>
                      <td>{r.gender}</td>
                      <td>{r.civilStatus}</td>
                      <td>{r.address}</td>
                      <td>{r.contactNumber || '—'}</td>
                      <td>
                        {r.isVoter        && <span className="badge badge-primary" style={{marginRight:3}}>Voter</span>}
                        {r.isIndigent     && <span className="badge badge-warning" style={{marginRight:3}}>Indigent</span>}
                        {r.isSeniorCitizen && <span className="badge" style={{background:'#fdf6b2',color:'#c27803',marginRight:3}}>👴 Senior</span>}
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[r.status] || 'badge-gray'}`}>{r.status}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" style={{marginRight:4}} title="View History" onClick={()=>setHistory(r)}>📋</button>
                        <button className="btn btn-ghost btn-sm" style={{marginRight:4}} title="Edit" onClick={()=>openEdit(r)}>✏️</button>
                        <button className="btn btn-danger btn-sm" title="Delete" onClick={()=>handleDelete(r.id)}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Resident History Modal */}
      {historyResident && <ResidentHistory resident={historyResident} onClose={()=>setHistory(null)} />}

      {/* Add/Edit Modal */}
      {showModal && <Modal title={selected ? 'Edit Resident' : 'Add New Resident'} onClose={()=>setModal(false)} onSave={handleSave} form={form} setForm={setForm} saving={saving} />}
    </div>
  );
};

export default Residents;
