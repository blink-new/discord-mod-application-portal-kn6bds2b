import React, { useState, useEffect } from 'react';
import './index.css';
import { AdminPanel } from './components/AdminPanel';

function getLocalApplications() {
  try {
    return JSON.parse(localStorage.getItem('mod_applications') || '[]');
  } catch {
    return [];
  }
}
function setLocalApplications(apps: any[]) {
  localStorage.setItem('mod_applications', JSON.stringify(apps));
}

export default function App() {
  // User is just a local username now
  const [username, setUsername] = useState('');
  const [applications, setApplications] = useState<any[]>(getLocalApplications());
  const [page, setPage] = useState<'dashboard'|'apply'|'admin'>('dashboard');
  const [form, setForm] = useState({ age: '', experience: '', motivation: '' });
  const [status, setStatus] = useState<string>('');
  const [submitMsg, setSubmitMsg] = useState<string>('');
  const [confirmSend, setConfirmSend] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  // Load own application if username changes
  useEffect(() => {
    if (!username) return;
    const app = applications.find(a => a.username === username);
    if (app) {
      setForm({ age: app.age, experience: app.experience, motivation: app.motivation });
      setStatus(app.status);
    } else {
      setForm({ age: '', experience: '', motivation: '' });
      setStatus('');
    }
  }, [username, applications]);

  // Sync applications to localStorage
  useEffect(() => {
    setLocalApplications(applications);
  }, [applications]);

  function handleNav(p: typeof page) {
    setPage(p);
    setSubmitMsg('');
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmSend) {
      setSubmitMsg('Bitte bestätige die Checkbox.');
      return;
    }
    if (!username) {
      setSubmitMsg('Bitte gib deinen Benutzernamen ein.');
      return;
    }
    let apps = [...applications];
    let app = apps.find(a => a.username === username);
    if (!app) {
      app = { username, ...form, status: 'Submitted' };
      apps.push(app);
    } else {
      app.age = form.age;
      app.experience = form.experience;
      app.motivation = form.motivation;
      app.status = 'Submitted';
    }
    setApplications(apps);
    setStatus('Submitted');
    setSubmitMsg('Danke für deine Bewerbung!');
  }

  function handleAdminStatus(idx: number, newStatus: string) {
    let apps = [...applications];
    apps[idx].status = newStatus;
    setApplications(apps);
  }
  function handleAdminDelete(idx: number) {
    let apps = [...applications];
    apps.splice(idx, 1);
    setApplications(apps);
  }

  // Admin mode: simple toggle (no login)
  function toggleAdmin() {
    setAdminMode(a => !a);
    setPage('admin');
  }

  // UI
  return (
    <>
      <div className="portal-nav">
        <div className="nav-links">
          <a className={page==='dashboard'? 'active':''} onClick={()=>handleNav('dashboard')}>Dashboard</a>
          <a className={page==='apply'? 'active':''} onClick={()=>handleNav('apply')}>Bewerben</a>
        </div>
        <div className="nav-actions">
          <button id="show-admin-panel-btn" style={{display: 'inline-block'}} onClick={toggleAdmin}>
            {adminMode ? 'User Modus' : 'Admin Panel'}
          </button>
        </div>
      </div>
      <div className="container">
        {/* Username Eingabe */}
        {!username && (
          <form style={{marginBottom: 24}} onSubmit={e => {e.preventDefault(); if(username) setUsername(username);}}>
            <label htmlFor="username">Benutzername (z.B. Max#1234):</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{width:'100%',padding:'10px',borderRadius:'6px',marginBottom:'12px',fontSize:'1em'}}
            />
            <button type="button" className="submit-btn" onClick={()=>setUsername(username)}>Weiter</button>
          </form>
        )}
        {/* Dashboard */}
        {username && page==='dashboard' && (
          <>
            <div className="info-card">
              <h2>Dein Bewerbungsstatus</h2>
              <p>Status: <span id="dashboard-status">{status || '-'}</span></p>
            </div>
            <div className="info-cards-row">
              <div className="info-card">
                <div style={{fontSize:'2em', marginBottom:8}}>🔒</div>
                <div style={{fontWeight:600, marginBottom:4}}>Sicher</div>
                <div style={{fontSize:'0.98em', color:'#b9bbbe'}}>Deine Bewerbung bleibt privat im Browser gespeichert</div>
              </div>
              <div className="info-card">
                <div style={{fontSize:'2em', marginBottom:8}}>⚡</div>
                <div style={{fontWeight:600, marginBottom:4}}>Sofort verfügbar</div>
                <div style={{fontSize:'0.98em', color:'#b9bbbe'}}>Du kannst deine Bewerbung jederzeit ansehen und ändern</div>
              </div>
              <div className="info-card">
                <div style={{fontSize:'2em', marginBottom:8}}>📈</div>
                <div style={{fontWeight:600, marginBottom:4}}>Status verfolgen</div>
                <div style={{fontSize:'0.98em', color:'#b9bbbe'}}>Behalte den Überblick über deine Bewerbung</div>
              </div>
            </div>
            {/* Eigene Bewerbung anzeigen */}
            <div className="info-card" style={{marginTop:24}}>
              <h3>Deine Bewerbung</h3>
              <div><b>Alter:</b> {form.age}</div>
              <div><b>Erfahrung:</b> {form.experience}</div>
              <div><b>Motivation:</b> {form.motivation}</div>
            </div>
          </>
        )}
        {/* Bewerbungsformular */}
        {username && page==='apply' && (
          <form id="mod-form" onSubmit={handleSubmit}>
            <label htmlFor="age">Alter</label>
            <input type="number" id="age" name="age" min={13} max={99} value={form.age} onChange={handleFormChange} required />
            <label htmlFor="experience">Hast du Moderationserfahrung?</label>
            <textarea id="experience" name="experience" value={form.experience} onChange={handleFormChange} required />
            <label htmlFor="motivation">Warum möchtest du Mod werden?</label>
            <textarea id="motivation" name="motivation" value={form.motivation} onChange={handleFormChange} required />
            <label style={{marginTop:14}}>
              <input type="checkbox" id="confirm-send" checked={confirmSend} onChange={e=>setConfirmSend(e.target.checked)} required />
              Ich bestätige, dass meine Angaben korrekt sind und ich die Bewerbung absenden möchte.
            </label>
            <button type="submit" className="submit-btn">Bewerbung absenden</button>
            {submitMsg && <div style={{marginTop:12, color:'#43B581', fontWeight:500}}>{submitMsg}</div>}
          </form>
        )}
        {/* Admin Panel */}
        {adminMode && page==='admin' && (
          <AdminPanel 
            applications={applications.map((app, idx) => ({
              id: String(idx),
              userId: app.userId || '',
              discordUsername: app.username || app.discordUsername || '',
              age: Number(app.age),
              timezone: app.timezone || '-',
              experience: app.experience || '',
              motivation: app.motivation || '',
              scenario: app.scenario || '',
              status: (app.status === 'Accepted' ? 'approved' : app.status === 'Rejected' ? 'rejected' : 'pending'),
              createdAt: app.createdAt || new Date().toISOString(),
              userEmail: app.userEmail || ''
            }))}
            onApplicationSelect={()=>{}}
            onStatusUpdate={(id, status) => {
              const idx = Number(id);
              let apps = [...applications];
              apps[idx].status = status === 'approved' ? 'Accepted' : status === 'rejected' ? 'Rejected' : 'Submitted';
              setApplications(apps);
            }}
          />
        )}
      </div>
      <div className="footer">&copy; 2025</div>
    </>
  );
}
