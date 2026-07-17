import React from 'react';

const DocumentPrint = ({ doc, onClose }) => {
  const resident = doc.Resident || {};
  const today = new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });
  const issued = doc.issuedDate
    ? new Date(doc.issuedDate).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' })
    : today;

  const templates = {
    'Barangay Clearance': {
      title: 'BARANGAY CLEARANCE',
      body: `This is to certify that <strong>${resident.firstName} ${resident.middleName || ''} ${resident.lastName}</strong>, of legal age, ${resident.civilStatus || ''}, Filipino citizen, and a bonafide resident of <strong>${resident.address || 'this Barangay'}</strong>, is personally known to me and has no derogatory record filed in this office.<br/><br/>This certification is issued upon the request of the above-named person for <strong>${doc.purpose}</strong> purposes.`,
    },
    'Certificate of Residency': {
      title: 'CERTIFICATE OF RESIDENCY',
      body: `This is to certify that <strong>${resident.firstName} ${resident.middleName || ''} ${resident.lastName}</strong>, of legal age, ${resident.civilStatus || ''}, Filipino citizen, is a bonafide resident of <strong>${resident.address || 'this Barangay'}</strong> for the past years up to the present.<br/><br/>This certification is issued upon the request of the above-named person for <strong>${doc.purpose}</strong> purposes.`,
    },
    'Certificate of Indigency': {
      title: 'CERTIFICATE OF INDIGENCY',
      body: `This is to certify that <strong>${resident.firstName} ${resident.middleName || ''} ${resident.lastName}</strong>, of legal age, ${resident.civilStatus || ''}, Filipino citizen, and a resident of <strong>${resident.address || 'this Barangay'}</strong>, belongs to an indigent family and is one of the underprivileged constituents of this barangay.<br/><br/>This certification is issued upon the request of the above-named person for <strong>${doc.purpose}</strong> purposes.`,
    },
    'Business Clearance': {
      title: 'BUSINESS CLEARANCE',
      body: `This is to certify that <strong>${resident.firstName} ${resident.middleName || ''} ${resident.lastName}</strong>, of legal age, ${resident.civilStatus || ''}, Filipino citizen, and a resident of <strong>${resident.address || 'this Barangay'}</strong>, has applied for a business clearance and has no pending obligations or derogatory records filed in this office.<br/><br/>This clearance is issued for <strong>${doc.purpose}</strong> purposes.`,
    },
    'Good Moral Certificate': {
      title: 'CERTIFICATE OF GOOD MORAL CHARACTER',
      body: `This is to certify that <strong>${resident.firstName} ${resident.middleName || ''} ${resident.lastName}</strong>, of legal age, ${resident.civilStatus || ''}, Filipino citizen, and a bonafide resident of <strong>${resident.address || 'this Barangay'}</strong>, is a person of good moral character and has not been involved in any criminal or illegal activities within our jurisdiction.<br/><br/>This certification is issued upon the request of the above-named person for <strong>${doc.purpose}</strong> purposes.`,
    },
  };

  const template = templates[doc.documentType] || templates['Barangay Clearance'];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Document</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4; margin: 20mm; margin-top: 15mm; }
          body { font-family: 'Times New Roman', serif; color: #000 !important; font-size: 14px; -webkit-print-color-adjust: exact; }
          a { color: #000 !important; text-decoration: none !important; }
          * { color: #000 !important; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 3px double #000; padding-bottom: 16px; }
          .bry-name { font-size: 22px; font-weight: bold; margin: 6px 0; }
          .control-no { text-align: right; font-size: 11px; margin-bottom: 16px; }
          .doc-title { text-align: center; margin: 20px 0; }
          .doc-title h2 { font-size: 18px; font-weight: bold; letter-spacing: 2px; text-decoration: underline; }
          .body-text { font-size: 14px; line-height: 2.2; text-align: justify; margin: 16px 0; }
          .footer-row { margin-top: 48px; display: flex; justify-content: space-between; align-items: flex-end; }
          .fee-stamp { border: 2px solid #000; padding: 6px 14px; font-size: 12px; font-weight: bold; display: inline-block; }
          .sig-block { text-align: center; }
          .sig-line { border-top: 1px solid #000; width: 220px; margin: 4px auto; }
          .witnesses { display: flex; justify-content: space-between; margin-top: 40px; }
          .witness-line { border-top: 1px solid #000; width: 180px; margin: 4px auto; }
          .doc-meta { display: flex; justify-content: space-between; font-size: 11px; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size:12px;letter-spacing:1px">Republic of the Philippines</div>
          <div class="bry-name">BARANGAY 697 ZONE 76</div>
          <div style="font-size:13px">District V, City of Manila</div>
          <div style="font-size:11px">Office of the Punong Barangay</div>
        </div>
        <div class="control-no">Control No.: <strong>${doc.controlNumber}</strong></div>
        <div class="doc-title"><h2>${template.title}</h2></div>
        <div style="font-weight:bold;margin-bottom:16px">TO WHOM IT MAY CONCERN:</div>
        <div class="body-text">${template.body}</div>
        <div style="font-size:13px;margin-top:16px">
          Issued this <strong>${issued}</strong> at Barangay 697 Zone 76, District V, City of Manila, Philippines.
        </div>
        <div class="footer-row">
          ${parseFloat(doc.fee||0)>0?`<div class="fee-stamp">Fee Paid: &#8369;${parseFloat(doc.fee).toFixed(2)}</div>`:''}
          <div class="sig-block">
            <div style="font-weight:bold;text-transform:uppercase">HON. [CAPTAIN NAME]</div>
            <div class="sig-line"></div>
            <div style="font-size:12px">Punong Barangay</div>
          </div>
        </div>
        <div class="witnesses">
          <div style="text-align:center"><div class="witness-line"></div><div style="font-size:12px">Barangay Secretary</div></div>
          <div style="text-align:center"><div class="witness-line"></div><div style="font-size:12px">Barangay Treasurer</div></div>
        </div>
        <div class="doc-meta">
          <span>Date Issued: ${issued}</span>
          <span>OR No.: ______________</span>
          <span>Not valid without official seal</span>
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
          <h3>🖨️ Print Preview — {doc.documentType}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding:'0 24px 16px', display:'flex', gap:10, alignItems:'center' }}>
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print Document</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <span style={{ marginLeft:'auto', fontSize:12, color:'#6b7280' }}>
            ⚠️ Uncheck "Headers and footers" in print settings to remove date/page number
          </span>
        </div>
        <div style={{ margin:'0 24px 24px', border:'1px solid #e5e7eb', borderRadius:6, padding:32, maxHeight:'60vh', overflowY:'auto', fontFamily:'Times New Roman, serif', fontSize:14, color:'#000', background:'#fff' }}>
          <div style={{ textAlign:'center', marginBottom:20, borderBottom:'3px double #000', paddingBottom:14 }}>
            <div style={{ fontSize:12, letterSpacing:1 }}>Republic of the Philippines</div>
            <div style={{ fontSize:20, fontWeight:'bold', margin:'4px 0' }}>BARANGAY 697 ZONE 76</div>
            <div style={{ fontSize:13 }}>District V, City of Manila</div>
            <div style={{ fontSize:11, color:'#555' }}>Office of the Punong Barangay</div>
          </div>
          <div style={{ textAlign:'right', fontSize:11, marginBottom:14 }}>Control No.: <strong>{doc.controlNumber}</strong></div>
          <div style={{ textAlign:'center', margin:'16px 0' }}>
            <h2 style={{ fontSize:16, fontWeight:'bold', letterSpacing:2, textDecoration:'underline' }}>{template.title}</h2>
          </div>
          <div style={{ fontWeight:'bold', marginBottom:12 }}>TO WHOM IT MAY CONCERN:</div>
          <div style={{ lineHeight:2.2, textAlign:'justify' }} dangerouslySetInnerHTML={{ __html: template.body }} />
          <div style={{ fontSize:13, marginTop:16 }}>Issued this <strong>{issued}</strong> at Barangay 697 Zone 76, District V, City of Manila, Philippines.</div>
          <div style={{ marginTop:40, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            {parseFloat(doc.fee||0)>0 && (
              <div style={{ border:'2px solid #000', padding:'6px 14px', fontSize:12, fontWeight:'bold' }}>
                Fee Paid: ₱{parseFloat(doc.fee).toFixed(2)}
              </div>
            )}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:'bold', textTransform:'uppercase' }}>HON. Garphil Andrey Lee</div>
              <div style={{ borderTop:'1px solid #000', width:220, margin:'4px auto' }}></div>
              <div style={{ fontSize:12 }}>Punong Barangay</div>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:40 }}>
            <div style={{ textAlign:'center' }}><div style={{ borderTop:'1px solid #000', width:180, margin:'4px auto' }}></div><div style={{ fontSize:12 }}>Barangay Secretary</div></div>
            <div style={{ textAlign:'center' }}><div style={{ borderTop:'1px solid #000', width:180, margin:'4px auto' }}></div><div style={{ fontSize:12 }}>Barangay Treasurer</div></div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginTop:20, borderTop:'1px solid #ccc', paddingTop:8, color:'#555' }}>
            <span>Date Issued: {issued}</span><span>OR No.: ______________</span><span>Not valid without official seal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPrint;
