import React, { useEffect, useState } from 'react';
import { residentAPI } from '../../api/services';
import logo from '../../barangay-logo.jpg';

const ZONES = [
  { id:1, name:'Remedios St. Area',    color:'#1a56db', keywords:['remedios'] },
  { id:2, name:'Gen. Malvar St. Area', color:'#7e3af2', keywords:['malvar','gen malvar','general malvar'] },
  { id:3, name:'Adriatico St. Area',   color:'#057a55', keywords:['adriatico'] },
  { id:4, name:'Julio Nakpil Area',    color:'#c27803', keywords:['nakpil','julio nakpil'] },
  { id:5, name:'Bocabo St. Area',      color:'#c81e1e', keywords:['bocabo'] },
  { id:6, name:'Interior Area',        color:'#0891b2', keywords:[] },
];

const BarangayMap = () => {
  const [residents,    setResidents]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    residentAPI.getAll({ limit: 9999 })
      .then(res => setResidents(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getZoneResidents = (zone) => {
    if (zone.id === 6) {
      return residents.filter(r => {
        const addr = (r.address||'').toLowerCase();
        return !ZONES.slice(0,5).some(z => z.keywords.some(k => addr.includes(k)));
      });
    }
    return residents.filter(r => {
      const addr = (r.address||'').toLowerCase();
      return zone.keywords.some(k => addr.includes(k));
    });
  };

  const totalResidents = residents.length;
  const selectedRes    = selectedZone ? getZoneResidents(selectedZone) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Barangay 697 Zone 76 Map</h2>
          <p>Malate, Manila — District V • Based on actual barangay boundary</p>
        </div>
        <button className="btn btn-primary" onClick={()=>window.print()}>🖨️ Print Map</button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{marginBottom:20}}>
        {[
          {label:'TOTAL RESIDENTS',   value:totalResidents,                                 color:'#1a56db'},
          {label:'ACTIVE',            value:residents.filter(r=>r.status==='Active').length, color:'#057a55'},
          {label:'SENIOR CITIZENS',   value:residents.filter(r=>r.isSeniorCitizen).length,  color:'#c27803'},
          {label:'INDIGENT',          value:residents.filter(r=>r.isIndigent).length,       color:'#7e3af2'},
          {label:'REGISTERED VOTERS', value:residents.filter(r=>r.isVoter).length,         color:'#057a55'},
          {label:'TOTAL ZONES',       value:ZONES.length,                                   color:'#0891b2'},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className="stat-label" style={{fontWeight:700,fontSize:11,color:'#6b7280'}}>{s.label}</div>
            <div className="stat-value" style={{fontWeight:800,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:16}}>

        {/* MAP */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{margin:0}}>Barangay 697 Zone 76 — Official Map</h3>
              <div style={{fontSize:11,color:'#6b7280'}}>Malate, Manila • Click a zone to view residents</div>
            </div>
          </div>
          <div className="card-body" style={{padding:12}}>
            <svg viewBox="0 0 700 620" style={{width:'100%',borderRadius:10,border:'1px solid #e5e7eb'}}>

              {/* ===== BACKGROUND ===== */}
              <rect width="700" height="620" fill="#e8f0f7"/>

              {/* ===== SURROUNDING BLOCKS (outside barangay - gray) ===== */}
              {/* Top left block */}
              <rect x="0" y="0" width="160" height="180" fill="#d1d5db"/>
              {/* Top right block */}
              <rect x="580" y="0" width="120" height="180" fill="#d1d5db"/>
              {/* Bottom left */}
              <rect x="0" y="480" width="160" height="140" fill="#d1d5db"/>
              {/* Bottom right */}
              <rect x="580" y="480" width="120" height="140" fill="#d1d5db"/>

              {/* ===== STREETS OUTSIDE ===== */}
              {/* Pedro Gil St - top horizontal */}
              <rect x="0" y="55" width="700" height="16" fill="#9ca3af"/>
              <line x1="0" y1="63" x2="700" y2="63" stroke="#fff" strokeWidth="1.5" strokeDasharray="10,8"/>
              <text x="350" y="52" fontSize="9" fill="#374151" fontWeight="700" textAnchor="middle">PEDRO GIL STREET</text>

              {/* Vasquez St - right vertical border */}
              <rect x="580" y="0" width="16" height="620" fill="#9ca3af"/>
              <line x1="588" y1="0" x2="588" y2="620" stroke="#fff" strokeWidth="1.5" strokeDasharray="10,8"/>
              <text x="596" y="300" fontSize="8" fill="#374151" fontWeight="700" textAnchor="middle" transform="rotate(90,596,300)">VASQUEZ ST / PILAR-HIDIPO LIM</text>

              {/* Ma. Orosa St - left vertical border */}
              <rect x="104" y="0" width="16" height="620" fill="#9ca3af"/>
              <line x1="112" y1="0" x2="112" y2="620" stroke="#fff" strokeWidth="1.5" strokeDasharray="10,8"/>
              <text x="100" y="300" fontSize="8" fill="#374151" fontWeight="700" textAnchor="middle" transform="rotate(-90,100,300)">MA. OROSA STREET</text>

              {/* ===== BARANGAY BOUNDARY (red dotted) ===== */}
              <rect x="120" y="71" width="452" height="478" rx="4"
                fill="none" stroke="#c81e1e" strokeWidth="3" strokeDasharray="10,5"/>
              <text x="346" y="68" fontSize="9" fill="#c81e1e" fontWeight="800" textAnchor="middle">BARANGAY 697 ZONE 76 BOUNDARY</text>

              {/* ===== INTERIOR STREETS ===== */}

              {/* L.M. Guerrero St - diagonal-ish main road (horizontal) */}
              <rect x="120" y="230" width="452" height="14" fill="#9ca3af"/>
              <line x1="120" y1="237" x2="572" y2="237" stroke="#fff" strokeWidth="1.5" strokeDasharray="10,8"/>
              <text x="340" y="227" fontSize="8" fill="#374151" fontWeight="700" textAnchor="middle">L.M. GUERRERO STREET</text>

              {/* Remedios St - horizontal */}
              <rect x="120" y="390" width="452" height="14" fill="#9ca3af"/>
              <line x1="120" y1="397" x2="572" y2="397" stroke="#fff" strokeWidth="1.5" strokeDasharray="10,8"/>
              <text x="340" y="387" fontSize="8" fill="#374151" fontWeight="700" textAnchor="middle">REMEDIOS STREET</text>

              {/* Gen. Malvar St - vertical inside */}
              <rect x="280" y="71" width="14" height="478" fill="#9ca3af"/>
              <line x1="287" y1="71" x2="287" y2="549" stroke="#fff" strokeWidth="1.5" strokeDasharray="10,8"/>
              <text x="287" y="200" fontSize="8" fill="#374151" fontWeight="700" textAnchor="middle" transform="rotate(-90,287,200)">GEN. MALVAR STREET</text>

              {/* Adriatico St - vertical inside */}
              <rect x="440" y="71" width="14" height="478" fill="#9ca3af"/>
              <line x1="447" y1="71" x2="447" y2="549" stroke="#fff" strokeWidth="1.5" strokeDasharray="10,8"/>
              <text x="447" y="350" fontSize="8" fill="#374151" fontWeight="700" textAnchor="middle" transform="rotate(90,447,350)">ADRIATICO STREET</text>

              {/* Bocabo St - horizontal (between Remedios and bottom) */}
              <rect x="120" y="480" width="452" height="10" fill="#b0b9c5"/>
              <text x="340" y="477" fontSize="7" fill="#374151" fontWeight="600" textAnchor="middle">BOCABO STREET</text>

              {/* Julio Nakpil - small horizontal between LM Guerrero and Remedios */}
              <rect x="120" y="315" width="452" height="10" fill="#b0b9c5"/>
              <text x="340" y="312" fontSize="7" fill="#374151" fontWeight="600" textAnchor="middle">JULIO NAKPIL STREET</text>

              {/* ===== ZONE BLOCKS ===== */}
              {/* Zone 1 - Top Left (between Ma.Orosa, LM Guerrero, Gen Malvar, Pedro Gil) */}
              {(()=>{
                const z=ZONES[0]; const cnt=getZoneResidents(z).length; const sel=selectedZone?.id===z.id;
                return (
                  <g onClick={()=>setSelectedZone(sel?null:z)} style={{cursor:'pointer'}}>
                    <rect x="122" y="73" width="156" height="155" rx="6"
                      fill={sel?z.color:'#dbeafe'} fillOpacity={sel?0.85:0.7}
                      stroke={sel?z.color:'#93c5fd'} strokeWidth={sel?3:1.5}/>
                    <circle cx="140" cy="91" r="12" fill={sel?'rgba(255,255,255,0.3)':z.color}/>
                    <text x="140" y="96" fontSize="10" fontWeight="900" fill={sel?z.color:'#fff'} textAnchor="middle">{z.id}</text>
                    <text x="200" y="138" fontSize="28" fontWeight="900" fill={sel?'#fff':z.color} textAnchor="middle">{cnt}</text>
                    <text x="200" y="158" fontSize="9" fontWeight="700" fill={sel?'rgba(255,255,255,0.9)':'#1e40af'} textAnchor="middle">{z.name}</text>
                    <text x="200" y="172" fontSize="8" fill={sel?'rgba(255,255,255,0.7)':'#60a5fa'} textAnchor="middle">{cnt} resident{cnt!==1?'s':''}</text>
                  </g>
                );
              })()}

              {/* Zone 2 - Top Middle (between Gen Malvar, Adriatico, Pedro Gil, LM Guerrero) */}
              {(()=>{
                const z=ZONES[1]; const cnt=getZoneResidents(z).length; const sel=selectedZone?.id===z.id;
                return (
                  <g onClick={()=>setSelectedZone(sel?null:z)} style={{cursor:'pointer'}}>
                    <rect x="296" y="73" width="142" height="155" rx="6"
                      fill={sel?z.color:'#ede9fe'} fillOpacity={sel?0.85:0.7}
                      stroke={sel?z.color:'#a78bfa'} strokeWidth={sel?3:1.5}/>
                    <circle cx="314" cy="91" r="12" fill={sel?'rgba(255,255,255,0.3)':z.color}/>
                    <text x="314" y="96" fontSize="10" fontWeight="900" fill={sel?z.color:'#fff'} textAnchor="middle">{z.id}</text>
                    <text x="367" y="138" fontSize="28" fontWeight="900" fill={sel?'#fff':z.color} textAnchor="middle">{cnt}</text>
                    <text x="367" y="158" fontSize="9" fontWeight="700" fill={sel?'rgba(255,255,255,0.9)':'#5b21b6'} textAnchor="middle">{z.name}</text>
                    <text x="367" y="172" fontSize="8" fill={sel?'rgba(255,255,255,0.7)':'#8b5cf6'} textAnchor="middle">{cnt} resident{cnt!==1?'s':''}</text>
                  </g>
                );
              })()}

              {/* Zone 3 - Top Right (between Adriatico, Vasquez, Pedro Gil, LM Guerrero) */}
              {(()=>{
                const z=ZONES[2]; const cnt=getZoneResidents(z).length; const sel=selectedZone?.id===z.id;
                return (
                  <g onClick={()=>setSelectedZone(sel?null:z)} style={{cursor:'pointer'}}>
                    <rect x="456" y="73" width="114" height="155" rx="6"
                      fill={sel?z.color:'#d1fae5'} fillOpacity={sel?0.85:0.7}
                      stroke={sel?z.color:'#6ee7b7'} strokeWidth={sel?3:1.5}/>
                    <circle cx="474" cy="91" r="12" fill={sel?'rgba(255,255,255,0.3)':z.color}/>
                    <text x="474" y="96" fontSize="10" fontWeight="900" fill={sel?z.color:'#fff'} textAnchor="middle">{z.id}</text>
                    <text x="513" y="138" fontSize="28" fontWeight="900" fill={sel?'#fff':z.color} textAnchor="middle">{cnt}</text>
                    <text x="513" y="158" fontSize="9" fontWeight="700" fill={sel?'rgba(255,255,255,0.9)':'#065f46'} textAnchor="middle">{z.name}</text>
                    <text x="513" y="172" fontSize="8" fill={sel?'rgba(255,255,255,0.7)':'#34d399'} textAnchor="middle">{cnt} resident{cnt!==1?'s':''}</text>
                  </g>
                );
              })()}

              {/* Zone 4 - Middle Left (between Ma.Orosa, Gen Malvar, LM Guerrero, Julio Nakpil) */}
              {(()=>{
                const z=ZONES[3]; const cnt=getZoneResidents(z).length; const sel=selectedZone?.id===z.id;
                return (
                  <g onClick={()=>setSelectedZone(sel?null:z)} style={{cursor:'pointer'}}>
                    <rect x="122" y="246" width="156" height="67" rx="6"
                      fill={sel?z.color:'#fef3c7'} fillOpacity={sel?0.85:0.7}
                      stroke={sel?z.color:'#fcd34d'} strokeWidth={sel?3:1.5}/>
                    <circle cx="140" cy="262" r="11" fill={sel?'rgba(255,255,255,0.3)':z.color}/>
                    <text x="140" y="267" fontSize="9" fontWeight="900" fill={sel?z.color:'#fff'} textAnchor="middle">{z.id}</text>
                    <text x="200" y="272" fontSize="20" fontWeight="900" fill={sel?'#fff':z.color} textAnchor="middle">{cnt}</text>
                    <text x="200" y="286" fontSize="8" fontWeight="700" fill={sel?'rgba(255,255,255,0.9)':'#78350f'} textAnchor="middle">{z.name}</text>
                    <text x="200" y="298" fontSize="7" fill={sel?'rgba(255,255,255,0.7)':'#f59e0b'} textAnchor="middle">{cnt} res.</text>
                  </g>
                );
              })()}

              {/* Zone 5 - Middle Center+Right (between Gen Malvar, Vasquez, LM Guerrero, Remedios) */}
              {(()=>{
                const z=ZONES[4]; const cnt=getZoneResidents(z).length; const sel=selectedZone?.id===z.id;
                return (
                  <g onClick={()=>setSelectedZone(sel?null:z)} style={{cursor:'pointer'}}>
                    <rect x="296" y="246" width="274" height="143" rx="6"
                      fill={sel?z.color:'#fee2e2'} fillOpacity={sel?0.85:0.7}
                      stroke={sel?z.color:'#fca5a5'} strokeWidth={sel?3:1.5}/>
                    <circle cx="314" cy="264" r="11" fill={sel?'rgba(255,255,255,0.3)':z.color}/>
                    <text x="314" y="269" fontSize="9" fontWeight="900" fill={sel?z.color:'#fff'} textAnchor="middle">{z.id}</text>
                    <text x="433" y="310" fontSize="32" fontWeight="900" fill={sel?'#fff':z.color} textAnchor="middle">{cnt}</text>
                    <text x="433" y="330" fontSize="9" fontWeight="700" fill={sel?'rgba(255,255,255,0.9)':'#7f1d1d'} textAnchor="middle">{z.name}</text>
                    <text x="433" y="344" fontSize="8" fill={sel?'rgba(255,255,255,0.7)':'#f87171'} textAnchor="middle">{cnt} resident{cnt!==1?'s':''}</text>
                  </g>
                );
              })()}

              {/* Zone 6 - Bottom (between all streets, Remedios to Bocabo) */}
              {(()=>{
                const z=ZONES[5]; const cnt=getZoneResidents(z).length; const sel=selectedZone?.id===z.id;
                return (
                  <g onClick={()=>setSelectedZone(sel?null:z)} style={{cursor:'pointer'}}>
                    <rect x="122" y="325" width="156" height="63" rx="6"
                      fill={sel?z.color:'#e0f7fa'} fillOpacity={sel?0.85:0.7}
                      stroke={sel?z.color:'#67e8f9'} strokeWidth={sel?3:1.5}/>
                    <circle cx="140" cy="341" r="11" fill={sel?'rgba(255,255,255,0.3)':z.color}/>
                    <text x="140" y="346" fontSize="9" fontWeight="900" fill={sel?z.color:'#fff'} textAnchor="middle">{z.id}</text>
                    <text x="200" y="352" fontSize="20" fontWeight="900" fill={sel?'#fff':z.color} textAnchor="middle">{cnt}</text>
                    <text x="200" y="366" fontSize="8" fontWeight="700" fill={sel?'rgba(255,255,255,0.9)':'#164e63'} textAnchor="middle">{z.name}</text>
                    <text x="200" y="378" fontSize="7" fill={sel?'rgba(255,255,255,0.7)':'#22d3ee'} textAnchor="middle">{cnt} res.</text>
                  </g>
                );
              })()}

              {/* Bottom full-width zone - Remedios to Bocabo */}
              {(()=>{
                const cnt = totalResidents; // show total at bottom strip
                return (
                  <g>
                    <rect x="122" y="405" width="450" height="73" rx="6"
                      fill="#f3f4f6" fillOpacity="0.6" stroke="#d1d5db" strokeWidth="1"/>
                    <text x="347" y="435" fontSize="11" fill="#6b7280" fontWeight="600" textAnchor="middle">Entire Barangay 697 Zone 76</text>
                    <text x="347" y="452" fontSize="9" fill="#9ca3af" textAnchor="middle">All streets within the red boundary</text>
                    <text x="347" y="468" fontSize="9" fill="#6b7280" textAnchor="middle">Total: {totalResidents} registered residents</text>
                  </g>
                );
              })()}

              {/* ===== LANDMARKS ===== */}
              {/* Barangay Hall */}
              <g>
                <circle cx="200" cy="420" r="18" fill="white" stroke="#1a56db" strokeWidth="2"/>
                <text x="200" y="425" fontSize="16" textAnchor="middle">🏛️</text>
                <text x="200" y="443" fontSize="7" fill="#1e40af" fontWeight="800" textAnchor="middle">BRGY HALL</text>
              </g>
              {/* Health Center */}
              <g>
                <circle cx="490" cy="420" r="18" fill="white" stroke="#057a55" strokeWidth="2"/>
                <text x="490" y="425" fontSize="16" textAnchor="middle">🏥</text>
                <text x="490" y="443" fontSize="7" fill="#065f46" fontWeight="800" textAnchor="middle">HEALTH CTR</text>
              </g>
              {/* PCU School mentioned in map */}
              <g>
                <circle cx="490" cy="130" r="14" fill="white" stroke="#c27803" strokeWidth="1.5"/>
                <text x="490" y="135" fontSize="12" textAnchor="middle">🏫</text>
                <text x="490" y="150" fontSize="7" fill="#78350f" fontWeight="700" textAnchor="middle">PCU SCHOOL</text>
              </g>
              {/* St. Paul Building */}
              <g>
                <circle cx="367" cy="130" r="14" fill="white" stroke="#7e3af2" strokeWidth="1.5"/>
                <text x="367" y="135" fontSize="12" textAnchor="middle">🏢</text>
                <text x="367" y="150" fontSize="7" fill="#4c1d95" fontWeight="700" textAnchor="middle">ST. PAUL BLDG</text>
              </g>
              {/* Compass */}
              <circle cx="650" cy="100" r="22" fill="white" stroke="#cbd5e1" strokeWidth="2"/>
              <text x="650" y="93" fontSize="18" textAnchor="middle">🧭</text>
              <text x="650" y="116" fontSize="9" fill="#374151" fontWeight="800" textAnchor="middle">N</text>

              {/* Logo */}
              <circle cx="152" cy="580" r="24" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
              <image href={logo} x="130" y="558" width="44" height="44" clipPath="circle(22px at 22px 22px)"/>
              <text x="185" y="572" fontSize="10" fill="#1e40af" fontWeight="800">BARANGAY 697 ZONE 76</text>
              <text x="185" y="585" fontSize="8" fill="#475569">Malate, Manila • District V • NCR</text>

              {/* Direction labels */}
              <text x="350" y="18" fontSize="8" fill="#475569" fontWeight="600" textAnchor="middle">↑ TOWARD ERMITA / INTRAMUROS</text>
              <text x="350" y="612" fontSize="8" fill="#475569" fontWeight="600" textAnchor="middle">↓ TOWARD MALATE CHURCH / BAY AREA</text>
              <text x="14" y="300" fontSize="7" fill="#475569" fontWeight="600" textAnchor="middle" transform="rotate(-90,14,300)">← MA. OROSA / ROBINSONS</text>
              <text x="692" y="300" fontSize="7" fill="#475569" fontWeight="600" textAnchor="middle" transform="rotate(90,692,300)">→ PILAR-HIDIPO LIM / VASQUEZ</text>

              {/* Scale */}
              <rect x="450" y="582" width="80" height="4" fill="#475569"/>
              <rect x="450" y="578" width="2" height="12" fill="#475569"/>
              <rect x="530" y="578" width="2" height="12" fill="#475569"/>
              <text x="490" y="600" fontSize="7" fill="#475569" textAnchor="middle">~100 meters</text>
            </svg>

            {/* Legend */}
            <div style={{display:'flex',gap:10,marginTop:12,flexWrap:'wrap',fontSize:11,alignItems:'center',padding:'8px 0',borderTop:'1px solid #f3f4f6'}}>
              <span style={{fontWeight:700,color:'#374151'}}>Zones:</span>
              {ZONES.map(z=>(
                <div key={z.id} onClick={()=>setSelectedZone(selectedZone?.id===z.id?null:z)}
                  style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',padding:'3px 8px',borderRadius:12,
                    background:selectedZone?.id===z.id?z.color+'20':'transparent',
                    border:selectedZone?.id===z.id?`1px solid ${z.color}`:'1px solid transparent',
                    fontWeight:selectedZone?.id===z.id?700:400,color:selectedZone?.id===z.id?z.color:'#374151'}}>
                  <div style={{width:10,height:10,borderRadius:2,background:z.color,flexShrink:0}}></div>
                  {z.id}. {z.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>

          {selectedZone ? (
            <div className="card" style={{border:`2px solid ${selectedZone.color}`}}>
              <div className="card-header" style={{background:selectedZone.color,borderRadius:'8px 8px 0 0'}}>
                <h3 style={{color:'#fff',margin:0}}>Zone {selectedZone.id}</h3>
                <button onClick={()=>setSelectedZone(null)}
                  style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:16}}>✕</button>
              </div>
              <div className="card-body" style={{padding:16}}>
                <div style={{fontWeight:700,fontSize:13,color:'#111827',marginBottom:12}}>{selectedZone.name}</div>
                {[
                  {label:'Total Residents', value:selectedRes.length,                                 color:'#1a56db'},
                  {label:'Male',            value:selectedRes.filter(r=>r.gender==='Male').length,    color:'#1a56db'},
                  {label:'Female',          value:selectedRes.filter(r=>r.gender==='Female').length,  color:'#c81e1e'},
                  {label:'Senior Citizens', value:selectedRes.filter(r=>r.isSeniorCitizen).length,   color:'#c27803'},
                  {label:'Indigent',        value:selectedRes.filter(r=>r.isIndigent).length,        color:'#7e3af2'},
                  {label:'Voters',          value:selectedRes.filter(r=>r.isVoter).length,           color:'#057a55'},
                ].map(s=>(
                  <div key={s.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <span style={{fontSize:12,color:'#6b7280',fontWeight:600}}>{s.label}</span>
                    <span style={{fontSize:15,fontWeight:800,color:s.color}}>{s.value}</span>
                  </div>
                ))}
                {selectedRes.length > 0 ? (
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#374151',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>Residents</div>
                    <div style={{maxHeight:200,overflowY:'auto'}}>
                      {selectedRes.map(r=>(
                        <div key={r.id} style={{fontSize:11,padding:'4px 0',borderBottom:'1px solid #f9fafb',color:'#374151',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span>{r.lastName}, {r.firstName}</span>
                          <div style={{display:'flex',gap:3}}>
                            {r.isSeniorCitizen&&<span style={{fontSize:8,background:'#fdf6b2',color:'#c27803',padding:'1px 4px',borderRadius:3}}>SC</span>}
                            {r.isVoter&&<span style={{fontSize:8,background:'#d1fae5',color:'#057a55',padding:'1px 4px',borderRadius:3}}>Voter</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign:'center',padding:'16px 0',color:'#9ca3af',fontSize:12}}>
                    No residents matched.<br/>
                    <span style={{fontSize:10,color:'#d1d5db'}}>Include street name in resident address to auto-assign zone.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{textAlign:'center',padding:28}}>
                <div style={{fontSize:48,marginBottom:10}}>🗺️</div>
                <div style={{fontWeight:700,color:'#374151',fontSize:14,marginBottom:6}}>Select a Zone</div>
                <div style={{fontSize:12,color:'#9ca3af',lineHeight:1.8}}>Click any colored zone on the map to see detailed population data.</div>
              </div>
            </div>
          )}

          {/* Zone summary */}
          <div className="card">
            <div className="card-header"><h3>Zone Population</h3></div>
            <div>
              {ZONES.map(z=>{
                const cnt=getZoneResidents(z).length;
                const pct=totalResidents>0?(cnt/totalResidents)*100:0;
                return (
                  <div key={z.id} onClick={()=>setSelectedZone(selectedZone?.id===z.id?null:z)}
                    style={{padding:'10px 16px',borderBottom:'1px solid #f3f4f6',cursor:'pointer',
                      background:selectedZone?.id===z.id?z.color+'15':'#fff',transition:'background 0.15s'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:6}}>
                        <span style={{background:z.color,color:'#fff',borderRadius:'50%',width:20,height:20,
                          display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,flexShrink:0}}>{z.id}</span>
                        {z.name}
                      </span>
                      <span style={{fontSize:14,fontWeight:800,color:z.color}}>{cnt}</span>
                    </div>
                    <div style={{background:'#e5e7eb',borderRadius:4,height:5}}>
                      <div style={{background:z.color,borderRadius:4,height:5,width:`${Math.max(pct,0)}%`,transition:'width 0.4s'}}></div>
                    </div>
                    <div style={{fontSize:10,color:'#9ca3af',marginTop:3}}>{pct.toFixed(1)}% of population</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Brgy info */}
          <div className="card">
            <div className="card-body" style={{padding:14}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <img src={logo} alt="Logo" style={{width:40,height:40,borderRadius:'50%',objectFit:'cover'}}/>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>Barangay 697 Zone 76</div>
                  <div style={{fontSize:11,color:'#6b7280'}}>Malate, Manila</div>
                </div>
              </div>
              {[
                {label:'District',         value:'District V'},
                {label:'City',             value:'City of Manila'},
                {label:'Region',           value:'NCR'},
                {label:'Zip Code',         value:'1004'},
                {label:'Total Residents',  value:totalResidents},
                {label:'Total Zones',      value:ZONES.length},
              ].map(i=>(
                <div key={i.label} style={{display:'flex',justifyContent:'space-between',fontSize:11,padding:'4px 0',borderBottom:'1px solid #f9fafb'}}>
                  <span style={{color:'#9ca3af'}}>{i.label}</span>
                  <span style={{fontWeight:700,color:'#374151'}}>{i.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarangayMap;
