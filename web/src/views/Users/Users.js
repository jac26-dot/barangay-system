import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../../api/services';

const EMPTY = { name:'', email:'', password:'', role:'staff', isActive:true };

const Users = () => {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setModal]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await userAPI.getAll(); setData(res.data.data); }
    catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (u) => { setSelected(u); setForm({ name:u.name, email:u.email, password:'', role:u.role, isActive:u.isActive }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required.');
    if (!selected && !form.password) return toast.error('Password is required for new users.');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (selected) { await userAPI.update(selected.id, payload); toast.success('User updated.'); }
      else          { await userAPI.create(payload); toast.success('User created.'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const me = JSON.parse(localStorage.getItem('user')||'{}');
    if (me.id === id) return toast.error("You can't delete your own account.");
    if (!window.confirm('Delete this user?')) return;
    try { await userAPI.remove(id); toast.success('User deleted.'); load(); }
    catch { toast.error('Failed.'); }
  };

  const roleBadge = { admin:'badge-danger', staff:'badge-primary', viewer:'badge-gray' };

  return (
    <div>
      <div className="page-header">
        <div><h2>User Accounts</h2><p>Manage system access and roles</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🔐</div><p>No users found.</p></div></td></tr>
                ) : data.map(u=>(
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${roleBadge[u.role]||'badge-gray'}`} style={{textTransform:'capitalize'}}>{u.role}</span></td>
                    <td><span className={`badge ${u.isActive?'badge-success':'badge-gray'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                    <td style={{fontSize:12}}>{new Date(u.createdAt).toLocaleDateString('en-PH')}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{marginRight:4}} onClick={()=>openEdit(u)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(u.id)}>🗑️</button>
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
              <h3>{selected ? 'Edit User' : 'Add New User'}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Email *</label><input className="form-control" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{selected ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                  <input className="form-control" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder={selected ? 'Leave blank to keep current' : 'Enter password'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className="form-control" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} />
                  Account is Active
                </label>
              </div>
              <div style={{ background:'#f3f4f6', borderRadius:6, padding:'12px 14px', fontSize:12, color:'#6b7280' }}>
                <strong>Role permissions:</strong><br/>
                🔴 Admin — Full access, manage users<br/>
                🔵 Staff — Add/edit records, process documents<br/>
                ⚪ Viewer — View only, no edits
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
