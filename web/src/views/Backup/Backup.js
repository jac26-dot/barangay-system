import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { residentAPI, documentAPI, blotterAPI, officialAPI } from '../../api/services';
import * as XLSX from 'xlsx';

const Backup = () => {
  const [loading, setLoading] = useState({});
  const setLoad = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  const exportData = async (type) => {
    setLoad(type, true);
    try {
      let rows = [], sheetName = '', filename = '';

      if (type === 'residents') {
        const res = await residentAPI.getAll({ limit: 9999 });
        rows = res.data.data.map((r, i) => ({
          '#': i+1, 'Last Name': r.lastName, 'First Name': r.firstName, 'Middle Name': r.middleName||'',
          'Birthdate': r.birthDate||'', 'Age': r.birthDate ? Math.floor((new Date()-new Date(r.birthDate))/(365.25*24*60*60*1000)) : '',
          'Gender': r.gender, 'Civil Status': r.civilStatus, 'Address': r.address,
          'Contact': r.contactNumber||'', 'Email': r.email||'', 'Occupation': r.occupation||'',
          'Voter': r.isVoter?'Yes':'No', 'Indigent': r.isIndigent?'Yes':'No', 'Senior Citizen': r.isSeniorCitizen?'Yes':'No',
          'Status': r.status, 'Date Registered': new Date(r.createdAt).toLocaleDateString('en-PH'),
        }));
        sheetName = 'Residents'; filename = `residents-${new Date().toISOString().slice(0,10)}.xlsx`;
      }

      if (type === 'documents') {
        const res = await documentAPI.getAll({ limit: 9999 });
        rows = res.data.data.map((d, i) => ({
          '#': i+1, 'Control #': d.controlNumber,
          'Resident': d.Resident ? `${d.Resident.lastName}, ${d.Resident.firstName}` : '',
          'Document Type': d.documentType, 'Purpose': d.purpose,
          'Fee': parseFloat(d.fee||0).toFixed(2), 'Status': d.status, 'Remarks': d.remarks||'',
          'Date Requested': new Date(d.createdAt).toLocaleDateString('en-PH'),
        }));
        sheetName = 'Documents'; filename = `documents-${new Date().toISOString().slice(0,10)}.xlsx`;
      }

      if (type === 'blotters') {
        const res = await blotterAPI.getAll({ limit: 9999 });
        rows = res.data.data.map((b, i) => ({
          '#': i+1, 'Case #': b.caseNumber, 'Complainant': b.complainantName, 'Respondent': b.respondentName,
          'Incident Type': b.incidentType, 'Incident Date': b.incidentDate ? new Date(b.incidentDate).toLocaleDateString('en-PH') : '',
          'Location': b.incidentLocation, 'Narrative': b.narrative, 'Status': b.status, 'Resolution': b.resolution||'',
          'Date Filed': new Date(b.createdAt).toLocaleDateString('en-PH'),
        }));
        sheetName = 'Blotters'; filename = `blotters-${new Date().toISOString().slice(0,10)}.xlsx`;
      }

      if (type === 'officials') {
        const res = await officialAPI.getAll();
        rows = res.data.data.map((o, i) => ({
          '#': i+1, 'Last Name': o.lastName, 'First Name': o.firstName, 'Middle Name': o.middleName||'',
          'Position': o.position, 'Committee': o.committee||'', 'Contact': o.contactNumber||'',
          'Term Start': o.termStart ? new Date(o.termStart).toLocaleDateString('en-PH') : '',
          'Term End': o.termEnd ? new Date(o.termEnd).toLocaleDateString('en-PH') : '', 'Status': o.status,
        }));
        sheetName = 'Officials'; filename = `officials-${new Date().toISOString().slice(0,10)}.xlsx`;
      }

      if (type === 'all') {
        const [resRes, docRes, bltRes, offRes] = await Promise.all([
          residentAPI.getAll({ limit: 9999 }),
          documentAPI.getAll({ limit: 9999 }),
          blotterAPI.getAll({ limit: 9999 }),
          officialAPI.getAll(),
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resRes.data.data.map((r,i)=>({ '#':i+1,'Last Name':r.lastName,'First Name':r.firstName,'Gender':r.gender,'Address':r.address,'Status':r.status }))), 'Residents');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(docRes.data.data.map((d,i)=>({ '#':i+1,'Control #':d.controlNumber,'Document Type':d.documentType,'Purpose':d.purpose,'Status':d.status }))), 'Documents');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bltRes.data.data.map((b,i)=>({ '#':i+1,'Case #':b.caseNumber,'Incident Type':b.incidentType,'Status':b.status }))), 'Blotters');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(offRes.data.data.map((o,i)=>({ '#':i+1,'Name':`${o.lastName}, ${o.firstName}`,'Position':o.position,'Status':o.status }))), 'Officials');
        XLSX.writeFile(wb, `barangay-697-backup-${new Date().toISOString().slice(0,10)}.xlsx`);
        toast.success('Full backup exported!');
        setLoad(type, false);
        return;
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, filename);
      toast.success(`${sheetName} exported successfully!`);
    } catch { toast.error('Export failed.'); }
    finally { setLoad(type, false); }
  };

  const exports = [
    { key:'all',       label:'Full Backup',       desc:'All data in one Excel file',                        color:'#1a56db' },
    { key:'residents', label:'Residents List',     desc:'Complete list of all registered residents',         color:'#057a55' },
    { key:'documents', label:'Document Requests',  desc:'All document requests with status and fees',        color:'#c27803' },
    { key:'blotters',  label:'Blotter Records',    desc:'All blotter records with narrative and resolution', color:'#c81e1e' },
    { key:'officials', label:'Officials List',     desc:'All barangay officials with positions',             color:'#7e3af2' },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h2>Backup & Export</h2><p>Export barangay data to Excel for backup and reporting</p></div>
      </div>

      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'14px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:24 }}>💡</span>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:'#1e40af' }}>Backup Recommendation</div>
          <div style={{ fontSize:12, color:'#3b82f6', marginTop:2 }}>Export a full backup regularly (weekly or monthly). Store the file in a USB drive or Google Drive.</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16, marginBottom:24 }}>
        {exports.map(exp => (
          <div key={exp.key} className="card" style={{ border:`1px solid ${exp.color}30` }}>
            <div className="card-body" style={{ padding:20 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#111827', marginBottom:4 }}>{exp.label}</div>
              <div style={{ fontSize:12, color:'#6b7280', marginBottom:14 }}>{exp.desc}</div>
              <button
                className="btn"
                style={{ width:'100%', justifyContent:'center', background:exp.color, color:'#fff', border:'none', padding:'9px' }}
                onClick={() => exportData(exp.key)}
                disabled={loading[exp.key]}
              >
                {loading[exp.key] ? 'Exporting...' : `Export ${exp.label}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3>How to Use</h3></div>
        <div className="card-body">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>For Backup:</div>
              <ol style={{ fontSize:12, color:'#6b7280', paddingLeft:16, lineHeight:2 }}>
                <li>Click <strong>Export Full Backup</strong></li>
                <li>Save the Excel file</li>
                <li>Copy to USB or Google Drive</li>
                <li>Do this weekly or monthly</li>
              </ol>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>For LGU Reports:</div>
              <ol style={{ fontSize:12, color:'#6b7280', paddingLeft:16, lineHeight:2 }}>
                <li>Click the specific export needed</li>
                <li>Open the Excel file</li>
                <li>Format for submission</li>
                <li>Print or send via email</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;
