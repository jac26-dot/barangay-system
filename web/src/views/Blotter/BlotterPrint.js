import React from 'react';

const BlotterPrint = ({ blotter, onClose }) => {
  const today   = new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });
  const incDate = blotter.incidentDate
    ? new Date(blotter.incidentDate).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' })
    : '—';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Document</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; color: #000 !important; }
          @page { size: A4; margin: 20mm; margin-top: 15mm; }
          body { font-family: 'Times New Roman', serif; font-size: 13px; -webkit-print-color-adjust: exact; }
          a { color: #000 !important; text-decoration: none !important; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #000; padding-bottom: 14px; }
          .bry-name { font-size: 20px; font-weight: bold; margin: 4px 0; }
          .doc-title { text-align: center; margin: 16px 0; }
          .doc-title h2 { font-size: 16px; font-weight: bold; letter-spacing: 2px; text-decoration: underline; }
          .meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 16px; }
          .section { font-weight: bold; font-size: 13px; margin: 14px 0 6px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; table-layout: fixed; }
          td { padding: 8px 10px; border: 1px solid #000; vertical-align: top; word-break: break-word; }
          .label { background: #f0f0f0 !important; font-weight: bold; width: 35%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .narrative { border: 1px solid #000; padding: 12px; min-height: 100px; line-height: 1.8; margin-bottom: 16px; word-break: break-word; white-space: pre-wrap; }
          .status-badge { border: 1px solid #000; padding: 2px 10px; font-weight: bold; }
          .sig-row { display: flex; justify-content: space-around; margin-top: 50px; }
          .sig-line { border-top: 1px solid #000; width: 180px; margin: 4px auto; }
          .footer-note { font-size: 11px; text-align: center; margin-top: 24px; border-top: 1px solid #ccc; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size:12px;letter-spacing:1px">Republic of the Philippines</div>
          <div class="bry-name">BARANGAY 697 ZONE 76</div>
          <div style="font-size:13px">District V, City of Manila</div>
          <div style="font-size:11px">Office of the Punong Barangay</div>
        </div>

        <div class="doc-title"><h2>BARANGAY BLOTTER REPORT</h2></div>

        <div class="meta">
          <span>Case No.: <strong>${blotter.caseNumber}</strong></span>
          <span>Date Filed: <strong>${today}</strong></span>
          <span>Status: <span class="status-badge">${blotter.status}</span></span>
        </div>

        <div class="section">Incident Information</div>
        <table>
          <tr>
            <td class="label" style="width:25%">Incident Type</td>
            <td style="width:25%">${blotter.incidentType}</td>
            <td class="label" style="width:25%">Incident Date</td>
            <td style="width:25%">${incDate}</td>
          </tr>
          <tr>
            <td class="label">Location</td>
            <td colspan="3">${blotter.incidentLocation}</td>
          </tr>
        </table>

        <div class="section">Parties Involved</div>
        <table>
          <tr><td class="label">Complainant</td><td>${blotter.complainantName}</td></tr>
          <tr><td class="label">Respondent</td><td>${blotter.respondentName}</td></tr>
        </table>

        <div class="section">Narrative / Statement of Facts</div>
        <div class="narrative">${blotter.narrative}</div>

        ${blotter.resolution ? `
        <div class="section">Resolution / Action Taken</div>
        <div class="narrative">${blotter.resolution}</div>
        ` : ''}

        <div class="sig-row">
          <div style="text-align:center">
            <div class="sig-line"></div>
            <div style="font-weight:bold;text-transform:uppercase;font-size:12px">${blotter.complainantName}</div>
            <div style="font-size:11px">Complainant</div>
          </div>
          <div style="text-align:center">
            <div class="sig-line"></div>
            <div style="font-weight:bold;text-transform:uppercase;font-size:12px">${blotter.respondentName}</div>
            <div style="font-size:11px">Respondent</div>
          </div>
          <div style="text-align:center">
            <div class="sig-line"></div>
            <div style="font-weight:bold;text-transform:uppercase;font-size:12px">HON. Garphil Andrey Lee</div>
            <div style="font-size:11px">Punong Barangay</div>
          </div>
        </div>

        <div style="margin-top:40px">
          <div style="border-top:1px solid #000;width:220px;margin-bottom:4px"></div>
          <div style="font-size:12px">Recorded by: Barangay Secretary</div>
        </div>

        <div class="footer-note">
          This blotter report is an official document of Barangay 697 Zone 76. Unauthorized reproduction is prohibited.
        </div>

        <script>
          window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <h3>🖨️ Print Blotter Report — {blotter.caseNumber}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding:'0 24px 16px', display:'flex', gap:10, alignItems:'center' }}>
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print Report</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <span style={{ marginLeft:'auto', fontSize:12, color:'#6b7280' }}>
            ⚠️ Uncheck "Headers and footers" in print settings
          </span>
        </div>

        {/* Preview */}
        <div style={{ margin:'0 24px 24px', border:'1px solid #e5e7eb', borderRadius:6, padding:32, maxHeight:'60vh', overflowY:'auto', fontFamily:'Times New Roman, serif', fontSize:13, color:'#000', background:'#fff' }}>
          <div style={{ textAlign:'center', marginBottom:20, borderBottom:'3px double #000', paddingBottom:14 }}>
            <div style={{ fontSize:12, letterSpacing:1 }}>Republic of the Philippines</div>
            <div style={{ fontSize:20, fontWeight:'bold', margin:'4px 0' }}>BARANGAY 697 ZONE 76</div>
            <div style={{ fontSize:13 }}>District V, City of Manila</div>
            <div style={{ fontSize:11, color:'#555' }}>Office of the Punong Barangay</div>
          </div>
          <div style={{ textAlign:'center', margin:'16px 0' }}>
            <h2 style={{ fontSize:16, fontWeight:'bold', letterSpacing:2, textDecoration:'underline' }}>BARANGAY BLOTTER REPORT</h2>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:16, flexWrap:'wrap', gap:6 }}>
            <span>Case No.: <strong>{blotter.caseNumber}</strong></span>
            <span>Date Filed: <strong>{today}</strong></span>
            <span>Status: <span style={{ border:'1px solid #000', padding:'1px 10px', fontWeight:'bold' }}>{blotter.status}</span></span>
          </div>
          <div style={{ fontWeight:'bold', fontSize:13, margin:'14px 0 6px', textTransform:'uppercase', borderBottom:'2px solid #000', paddingBottom:2 }}>Incident Information</div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:16, tableLayout:'fixed' }}>
            <tbody>
              <tr>
                <td style={{ padding:'8px 10px', border:'1px solid #000', background:'#f0f0f0', fontWeight:'bold', width:'25%' }}>Incident Type</td>
                <td style={{ padding:'8px 10px', border:'1px solid #000', width:'25%', wordBreak:'break-word' }}>{blotter.incidentType}</td>
                <td style={{ padding:'8px 10px', border:'1px solid #000', background:'#f0f0f0', fontWeight:'bold', width:'25%' }}>Incident Date</td>
                <td style={{ padding:'8px 10px', border:'1px solid #000', width:'25%' }}>{incDate}</td>
              </tr>
              <tr>
                <td style={{ padding:'8px 10px', border:'1px solid #000', background:'#f0f0f0', fontWeight:'bold' }}>Location</td>
                <td style={{ padding:'8px 10px', border:'1px solid #000', wordBreak:'break-word' }} colSpan={3}>{blotter.incidentLocation}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontWeight:'bold', fontSize:13, margin:'14px 0 6px', textTransform:'uppercase', borderBottom:'2px solid #000', paddingBottom:2 }}>Parties Involved</div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:16, tableLayout:'fixed' }}>
            <tbody>
              <tr>
                <td style={{ padding:'8px 10px', border:'1px solid #000', background:'#f0f0f0', fontWeight:'bold', width:'35%' }}>Complainant</td>
                <td style={{ padding:'8px 10px', border:'1px solid #000', wordBreak:'break-word' }}>{blotter.complainantName}</td>
              </tr>
              <tr>
                <td style={{ padding:'8px 10px', border:'1px solid #000', background:'#f0f0f0', fontWeight:'bold' }}>Respondent</td>
                <td style={{ padding:'8px 10px', border:'1px solid #000', wordBreak:'break-word' }}>{blotter.respondentName}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontWeight:'bold', fontSize:13, margin:'14px 0 6px', textTransform:'uppercase', borderBottom:'2px solid #000', paddingBottom:2 }}>Narrative / Statement of Facts</div>
          <div style={{ border:'1px solid #000', padding:12, minHeight:100, lineHeight:1.8, marginBottom:16, wordBreak:'break-word', whiteSpace:'pre-wrap' }}>{blotter.narrative}</div>
          {blotter.resolution && (
            <>
              <div style={{ fontWeight:'bold', fontSize:13, margin:'14px 0 6px', textTransform:'uppercase', borderBottom:'2px solid #000', paddingBottom:2 }}>Resolution / Action Taken</div>
              <div style={{ border:'1px solid #000', padding:12, minHeight:80, lineHeight:1.8, marginBottom:16, wordBreak:'break-word', whiteSpace:'pre-wrap' }}>{blotter.resolution}</div>
            </>
          )}
          <div style={{ display:'flex', justifyContent:'space-around', marginTop:50 }}>
            {[{ name: blotter.complainantName, title:'Complainant' },{ name: blotter.respondentName, title:'Respondent' },{ name:'HON. Garphil Andrey Lee', title:'Punong Barangay' }].map(s => (
              <div key={s.title} style={{ textAlign:'center' }}>
                <div style={{ borderTop:'1px solid #000', width:180, margin:'4px auto' }}></div>
                <div style={{ fontWeight:'bold', textTransform:'uppercase', fontSize:12 }}>{s.name}</div>
                <div style={{ fontSize:11 }}>{s.title}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:40 }}>
            <div style={{ borderTop:'1px solid #000', width:220, marginBottom:4 }}></div>
            <div style={{ fontSize:12 }}>Recorded by: Barangay Secretary</div>
          </div>
          <div style={{ fontSize:11, textAlign:'center', marginTop:24, borderTop:'1px solid #ccc', paddingTop:8, color:'#555' }}>
            This blotter report is an official document of Barangay 697 Zone 76. Unauthorized reproduction is prohibited.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlotterPrint;
