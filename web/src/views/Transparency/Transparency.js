import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import logo from '../../barangay-logo.jpg';

const TABS = ['Budget', 'Projects', 'Officials Salary', 'Ordinances', 'Contracts'];

const EMPTY_BUDGET = { year: new Date().getFullYear(), totalBudget:'', income:'', expenses:'', category:'', description:'', amount:'' };
const EMPTY_PROJECT = { name:'', description:'', budget:'', spent:'', status:'Planned', startDate:'', endDate:'', contractor:'', location:'' };
const EMPTY_ORDINANCE = { number:'', title:'', dateApproved:'', status:'Approved', description:'' };
const EMPTY_CONTRACT = { contractorName:'', projectName:'', amount:'', dateAwarded:'', duration:'', status:'Active' };
const EMPTY_SALARY = { position:'', name:'', monthlySalary:'', annualSalary:'' };

const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(() => {
    try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : initial; }
    catch { return initial; }
  });
  const set = (v) => { setValue(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [value, set];
};

const Transparency = () => {
  const [activeTab, setActiveTab] = useState('Budget');
  const [budgets,     setBudgets]     = useLocalStorage('bry_budgets', []);
  const [projects,    setProjects]    = useLocalStorage('bry_projects', []);
  const [ordinances,  setOrdinances]  = useLocalStorage('bry_ordinances', []);
  const [contracts,   setContracts]   = useLocalStorage('bry_contracts', []);
  const [salaries,    setSalaries]    = useLocalStorage('bry_salaries', []);
  const [showModal,   setModal]       = useState(false);
  const [form,        setForm]        = useState({});
  const [selected,    setSelected]    = useState(null);

  const openAdd = (empty) => { setSelected(null); setForm(empty); setModal(true); };
  const openEdit = (item, empty) => { setSelected(item); setForm({...item}); setModal(true); };

  const handleDelete = (list, setList, id) => {
    if (!window.confirm('Delete this record?')) return;
    setList(list.filter(i => i.id !== id));
    toast.success('Deleted.');
  };

  const handleSave = (list, setList) => {
    if (selected) {
      setList(list.map(i => i.id === selected.id ? { ...form, id: selected.id } : i));
      toast.success('Updated.');
    } else {
      setList([...list, { ...form, id: Date.now() }]);
      toast.success('Added.');
    }
    setModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const STATUS_COLORS = {
    'Planned':    '#c27803',
    'Ongoing':    '#1a56db',
    'Completed':  '#057a55',
    'Cancelled':  '#c81e1e',
    'Approved':   '#057a55',
    'Pending':    '#c27803',
    'Active':     '#057a55',
    'Terminated': '#c81e1e',
  };

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { display: block !important; }
        }
      `}</style>

      <div className="page-header no-print">
        <div>
          <h2>Barangay Transparency Board</h2>
          <p>Public disclosure of barangay finances, projects and ordinances — RA 7160</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print Report</button>
      </div>

      {/* Banner */}
      <div className="card no-print" style={{ marginBottom:20, background:'linear-gradient(135deg, #0f172a, #1e3a5f)', border:'none' }}>
        <div className="card-body" style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 24px' }}>
          <img src={logo} alt="Logo" style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.3)' }} />
          <div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:1 }}>Republic of the Philippines • City of Manila</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#fff' }}>BARANGAY 697 ZONE 76 — Transparency Board</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>In compliance with RA 7160 (Local Government Code) and RA 6713 (Code of Conduct)</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ display:'flex', gap:4, marginBottom:16, borderBottom:'2px solid #e5e7eb', paddingBottom:0 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding:'10px 18px', border:'none', background:'none', cursor:'pointer',
            fontSize:13, fontWeight:600,
            borderBottom: activeTab===tab ? '2px solid #1a56db' : '2px solid transparent',
            color: activeTab===tab ? '#1a56db' : '#6b7280',
            marginBottom:-2,
          }}>
            {tab === 'Budget' && ' '}
            {tab === 'Projects' && ' '}
            {tab === 'Officials Salary' && ' '}
            {tab === 'Ordinances' && ' '}
            {tab === 'Contracts' && ' '}
            {tab}
          </button>
        ))}
      </div>

      {/* ===== BUDGET TAB ===== */}
      {activeTab === 'Budget' && (
        <div>
          <div className="page-header no-print">
            <div><h3 style={{ margin:0 }}>Annual Budget & Financial Report</h3></div>
            <button className="btn btn-primary" onClick={() => openAdd(EMPTY_BUDGET)}>+ Add Budget Entry</button>
          </div>
          <div className="card">
            <div className="card-header"><h3> Annual Budget Allocation</h3></div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Year</th><th>Category</th><th>Description</th><th>Amount (₱)</th><th className="no-print">Actions</th></tr></thead>
                <tbody>
                  {budgets.length === 0 ? (
                    <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon"></div><p>No budget entries yet. Click "Add Budget Entry" to start.</p></div></td></tr>
                  ) : budgets.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.year}</strong></td>
                      <td>{b.category}</td>
                      <td>{b.description}</td>
                      <td><strong>₱{parseFloat(b.amount||0).toLocaleString('en-PH', {minimumFractionDigits:2})}</strong></td>
                      <td className="no-print">
                        <button className="btn btn-ghost btn-sm" style={{marginRight:4}} onClick={()=>openEdit(b, EMPTY_BUDGET)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(budgets,setBudgets,b.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {budgets.length > 0 && (
                    <tr style={{ background:'#f0f9ff' }}>
                      <td colSpan={3} style={{ fontWeight:700, textAlign:'right' }}>TOTAL</td>
                      <td style={{ fontWeight:800, color:'#1a56db' }}>
                        ₱{budgets.reduce((sum,b)=>sum+parseFloat(b.amount||0),0).toLocaleString('en-PH',{minimumFractionDigits:2})}
                      </td>
                      <td className="no-print"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== PROJECTS TAB ===== */}
      {activeTab === 'Projects' && (
        <div>
          <div className="page-header no-print">
            <div><h3 style={{ margin:0 }}>Barangay Projects & Programs</h3></div>
            <button className="btn btn-primary" onClick={() => openAdd(EMPTY_PROJECT)}>+ Add Project</button>
          </div>
          <div className="card">
            <div className="card-header"><h3> Projects & Programs</h3></div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Project Name</th><th>Location</th><th>Budget (₱)</th><th>Spent (₱)</th><th>Contractor</th><th>Status</th><th className="no-print">Actions</th></tr></thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon"></div><p>No projects yet.</p></div></td></tr>
                  ) : projects.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <div style={{ fontSize:11, color:'#6b7280' }}>{p.description}</div>
                      </td>
                      <td style={{ fontSize:12 }}>{p.location}</td>
                      <td>₱{parseFloat(p.budget||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                      <td>₱{parseFloat(p.spent||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                      <td style={{ fontSize:12 }}>{p.contractor || '—'}</td>
                      <td>
                        <span style={{ background: STATUS_COLORS[p.status]+'20', color: STATUS_COLORS[p.status], padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:600 }}>
                          {p.status}
                        </span>
                      </td>
                      <td className="no-print">
                        <button className="btn btn-ghost btn-sm" style={{marginRight:4}} onClick={()=>openEdit(p, EMPTY_PROJECT)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(projects,setProjects,p.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== OFFICIALS SALARY TAB ===== */}
      {activeTab === 'Officials Salary' && (
        <div>
          <div className="page-header no-print">
            <div><h3 style={{ margin:0 }}>Officials Honoraria / Salary</h3></div>
            <button className="btn btn-primary" onClick={() => openAdd(EMPTY_SALARY)}>+ Add Official</button>
          </div>
          <div className="card">
            <div className="card-header"><h3> Officials Honoraria & Salary Schedule</h3></div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Position</th><th>Name</th><th>Monthly (₱)</th><th>Annual (₱)</th><th className="no-print">Actions</th></tr></thead>
                <tbody>
                  {salaries.length === 0 ? (
                    <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon"></div><p>No salary records yet.</p></div></td></tr>
                  ) : salaries.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.position}</strong></td>
                      <td>{s.name}</td>
                      <td>₱{parseFloat(s.monthlySalary||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                      <td><strong>₱{parseFloat(s.annualSalary||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</strong></td>
                      <td className="no-print">
                        <button className="btn btn-ghost btn-sm" style={{marginRight:4}} onClick={()=>openEdit(s, EMPTY_SALARY)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(salaries,setSalaries,s.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {salaries.length > 0 && (
                    <tr style={{ background:'#f0f9ff' }}>
                      <td colSpan={2} style={{ fontWeight:700, textAlign:'right' }}>TOTAL ANNUAL</td>
                      <td></td>
                      <td style={{ fontWeight:800, color:'#1a56db' }}>
                        ₱{salaries.reduce((sum,s)=>sum+parseFloat(s.annualSalary||0),0).toLocaleString('en-PH',{minimumFractionDigits:2})}
                      </td>
                      <td className="no-print"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== ORDINANCES TAB ===== */}
      {activeTab === 'Ordinances' && (
        <div>
          <div className="page-header no-print">
            <div><h3 style={{ margin:0 }}>Barangay Ordinances & Resolutions</h3></div>
            <button className="btn btn-primary" onClick={() => openAdd(EMPTY_ORDINANCE)}>+ Add Ordinance</button>
          </div>
          <div className="card">
            <div className="card-header"><h3> Ordinances & Resolutions</h3></div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Number</th><th>Title</th><th>Date Approved</th><th>Description</th><th>Status</th><th className="no-print">Actions</th></tr></thead>
                <tbody>
                  {ordinances.length === 0 ? (
                    <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon"></div><p>No ordinances yet.</p></div></td></tr>
                  ) : ordinances.map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.number}</strong></td>
                      <td>{o.title}</td>
                      <td style={{ fontSize:12 }}>{o.dateApproved ? new Date(o.dateApproved).toLocaleDateString('en-PH') : '—'}</td>
                      <td style={{ fontSize:12 }}>{o.description}</td>
                      <td>
                        <span style={{ background: STATUS_COLORS[o.status]+'20', color: STATUS_COLORS[o.status], padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:600 }}>
                          {o.status}
                        </span>
                      </td>
                      <td className="no-print">
                        <button className="btn btn-ghost btn-sm" style={{marginRight:4}} onClick={()=>openEdit(o, EMPTY_ORDINANCE)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(ordinances,setOrdinances,o.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTRACTS TAB ===== */}
      {activeTab === 'Contracts' && (
        <div>
          <div className="page-header no-print">
            <div><h3 style={{ margin:0 }}>Awarded Contracts</h3></div>
            <button className="btn btn-primary" onClick={() => openAdd(EMPTY_CONTRACT)}>+ Add Contract</button>
          </div>
          <div className="card">
            <div className="card-header"><h3> Awarded Contracts</h3></div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Contractor</th><th>Project</th><th>Amount (₱)</th><th>Date Awarded</th><th>Duration</th><th>Status</th><th className="no-print">Actions</th></tr></thead>
                <tbody>
                  {contracts.length === 0 ? (
                    <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon"></div><p>No contracts yet.</p></div></td></tr>
                  ) : contracts.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.contractorName}</strong></td>
                      <td>{c.projectName}</td>
                      <td>₱{parseFloat(c.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                      <td style={{ fontSize:12 }}>{c.dateAwarded ? new Date(c.dateAwarded).toLocaleDateString('en-PH') : '—'}</td>
                      <td style={{ fontSize:12 }}>{c.duration}</td>
                      <td>
                        <span style={{ background: STATUS_COLORS[c.status]+'20', color: STATUS_COLORS[c.status], padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:600 }}>
                          {c.status}
                        </span>
                      </td>
                      <td className="no-print">
                        <button className="btn btn-ghost btn-sm" style={{marginRight:4}} onClick={()=>openEdit(c, EMPTY_CONTRACT)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(contracts,setContracts,c.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {contracts.length > 0 && (
                    <tr style={{ background:'#f0f9ff' }}>
                      <td colSpan={2} style={{ fontWeight:700, textAlign:'right' }}>TOTAL</td>
                      <td style={{ fontWeight:800, color:'#1a56db' }}>
                        ₱{contracts.reduce((sum,c)=>sum+parseFloat(c.amount||0),0).toLocaleString('en-PH',{minimumFractionDigits:2})}
                      </td>
                      <td colSpan={4} className="no-print"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay no-print">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>{selected ? 'Edit' : 'Add'} — {activeTab}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setModal(false)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Budget Form */}
              {activeTab === 'Budget' && (
                <>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Year</label><input className="form-control" type="number" value={form.year||''} onChange={e=>setForm({...form,year:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Category</label>
                      <select className="form-control" value={form.category||''} onChange={e=>setForm({...form,category:e.target.value})}>
                        <option value="">Select...</option>
                        <option>General Fund</option>
                        <option>Development Fund</option>
                        <option>Calamity Fund</option>
                        <option>SK Fund</option>
                        <option>Health Fund</option>
                        <option>Peace & Order</option>
                        <option>Others</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Amount (₱)</label><input className="form-control" type="number" step="0.01" value={form.amount||''} onChange={e=>setForm({...form,amount:e.target.value})} /></div>
                </>
              )}

              {/* Project Form */}
              {activeTab === 'Projects' && (
                <>
                  <div className="form-group"><label className="form-label">Project Name *</label><input className="form-control" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} /></div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Budget (₱)</label><input className="form-control" type="number" step="0.01" value={form.budget||''} onChange={e=>setForm({...form,budget:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Amount Spent (₱)</label><input className="form-control" type="number" step="0.01" value={form.spent||''} onChange={e=>setForm({...form,spent:e.target.value})} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Location</label><input className="form-control" value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Contractor</label><input className="form-control" value={form.contractor||''} onChange={e=>setForm({...form,contractor:e.target.value})} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Start Date</label><input className="form-control" type="date" value={form.startDate||''} onChange={e=>setForm({...form,startDate:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">End Date</label><input className="form-control" type="date" value={form.endDate||''} onChange={e=>setForm({...form,endDate:e.target.value})} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Status</label>
                    <select className="form-control" value={form.status||'Planned'} onChange={e=>setForm({...form,status:e.target.value})}>
                      <option>Planned</option><option>Ongoing</option><option>Completed</option><option>Cancelled</option>
                    </select>
                  </div>
                </>
              )}

              {/* Salary Form */}
              {activeTab === 'Officials Salary' && (
                <>
                  <div className="form-group"><label className="form-label">Position *</label>
                    <select className="form-control" value={form.position||''} onChange={e=>setForm({...form,position:e.target.value})}>
                      <option value="">Select...</option>
                      <option>Barangay Captain</option>
                      <option>Barangay Kagawad</option>
                      <option>SK Chairman</option>
                      <option>Barangay Secretary</option>
                      <option>Barangay Treasurer</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Name *</label><input className="form-control" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Monthly (₱)</label><input className="form-control" type="number" step="0.01" value={form.monthlySalary||''} onChange={e=>setForm({...form,monthlySalary:e.target.value, annualSalary:(parseFloat(e.target.value||0)*12).toFixed(2)})} /></div>
                    <div className="form-group"><label className="form-label">Annual (₱)</label><input className="form-control" type="number" step="0.01" value={form.annualSalary||''} onChange={e=>setForm({...form,annualSalary:e.target.value})} /></div>
                  </div>
                </>
              )}

              {/* Ordinance Form */}
              {activeTab === 'Ordinances' && (
                <>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Ordinance Number *</label><input className="form-control" placeholder="e.g. BRY-ORD-2026-001" value={form.number||''} onChange={e=>setForm({...form,number:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Date Approved</label><input className="form-control" type="date" value={form.dateApproved||''} onChange={e=>setForm({...form,dateApproved:e.target.value})} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Status</label>
                    <select className="form-control" value={form.status||'Approved'} onChange={e=>setForm({...form,status:e.target.value})}>
                      <option>Approved</option><option>Pending</option><option>Cancelled</option>
                    </select>
                  </div>
                </>
              )}

              {/* Contract Form */}
              {activeTab === 'Contracts' && (
                <>
                  <div className="form-group"><label className="form-label">Contractor Name *</label><input className="form-control" value={form.contractorName||''} onChange={e=>setForm({...form,contractorName:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Project Name *</label><input className="form-control" value={form.projectName||''} onChange={e=>setForm({...form,projectName:e.target.value})} /></div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Contract Amount (₱)</label><input className="form-control" type="number" step="0.01" value={form.amount||''} onChange={e=>setForm({...form,amount:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Date Awarded</label><input className="form-control" type="date" value={form.dateAwarded||''} onChange={e=>setForm({...form,dateAwarded:e.target.value})} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Duration</label><input className="form-control" placeholder="e.g. 6 months" value={form.duration||''} onChange={e=>setForm({...form,duration:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Status</label>
                      <select className="form-control" value={form.status||'Active'} onChange={e=>setForm({...form,status:e.target.value})}>
                        <option>Active</option><option>Completed</option><option>Terminated</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (activeTab==='Budget')           handleSave(budgets,    setBudgets);
                if (activeTab==='Projects')         handleSave(projects,   setProjects);
                if (activeTab==='Officials Salary') handleSave(salaries,   setSalaries);
                if (activeTab==='Ordinances')       handleSave(ordinances, setOrdinances);
                if (activeTab==='Contracts')        handleSave(contracts,  setContracts);
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transparency;
