import React, { useState, useEffect } from 'react';
import './index.css';
import { AdminPanel } from './components/AdminPanel';

const CLIENT_ID = '1309914559481516042';
const REDIRECT_URI = window.location.origin + '/';
const OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;

const WEBHOOK_URL = "https://discord.com/api/webhooks/1392843213097668629/O7B3ryh17BvEzKoUilNvFi4fEx2v7h5U0nnZeYt-zmCh7g-vBv7HrGHQG-xYoC1kBHSe";

const ADMIN_USERS = ['beegboss1919#0'];

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
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>(getLocalApplications());
  const [admins, setAdmins] = useState<string[]>(ADMIN_USERS);
  const [page, setPage] = useState<'dashboard'|'apply'|'admin'>('dashboard');
  const [form, setForm] = useState({ age: '', experience: '', motivation: '' });
  const [status, setStatus] = useState<string>('');
  const [submitMsg, setSubmitMsg] = useState<string>('');
  const [showAdminUsers, setShowAdminUsers] = useState(false);
  const [newAdmin, setNewAdmin] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);

  // Parse token from hash
  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const t = params.get('access_token');
      if (t) setToken(t);
      window.location.hash = '';
    }
  }, []);

  // Fetch user info
  useEffect(() => {
    if (!token) return;
    fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(u => {
        setUser(u);
        // Prefill form if application exists
        const app = applications.find(a => a.username === u.username + '#' + u.discriminator);
        if (app) {
          setForm({ age: app.age, experience: app.experience, motivation: app.motivation });
          setStatus(app.status);
        } else {
          setForm({ age: '', experience: '', motivation: '' });
          setStatus('');
        }
      });
  }, [token]);

  // Sync applications to localStorage
  useEffect(() => {
    setLocalApplications(applications);
  }, [applications]);

  // Admin panel visibility
  useEffect(() => {
    if (!user) return;
    setShowAdminUsers(user.username === 'beegboss1919' && user.discriminator === '0');
  }, [user]);

  function isAdmin() {
    if (!user) return false;
    return admins.includes(user.username + '#' + user.discriminator) || (user.username === 'beegboss1919' && user.discriminator === '0');
  }

  function handleLogin() {
    window.location.href = OAUTH_URL;
  }

  function handleNav(p: typeof page) {
    if (p === 'admin' && !isAdmin()) {
      setSubmitMsg('Du bist kein Admin und hast keinen Zugriff auf das Admin-Panel.');
      return;
    }
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
    if (!user) return;
    const username = user.username + '#' + user.discriminator;
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
    // Send webhook
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: null,
        embeds: [{
          title: 'New Mod Application',
          color: 0x5865F2,
          fields: [
            { name: 'Discord Username', value: username, inline: false },
            { name: 'Age', value: form.age, inline: false },
            { name: 'Moderation Experience', value: form.experience, inline: false },
            { name: 'Motivation', value: form.motivation, inline: false }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });
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
  function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (newAdmin && !admins.includes(newAdmin)) {
      setAdmins(a => [...a, newAdmin]);
      setNewAdmin('');
    }
  }

  // UI
  return (
    <>
      <div className="portal-nav">
        <div className="nav-links">
          <a className={page==='dashboard'? 'active':''} onClick={()=>handleNav('dashboard')}>Dashboard</a>
          <a className={page==='apply'? 'active':''} onClick={()=>handleNav('apply')}>Apply</a>
        </div>
        <div className="nav-actions">
          {isAdmin() && (
            <button id="show-admin-panel-btn" style={{display: 'inline-block'}} onClick={()=>handleNav('admin')}>
              Admin Panel
            </button>
          )}
          {user && (
            <div className="user-info" id="user-info">
              <img
                id="user-avatar"
                className="user-avatar"
                src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/discord.svg'}
                alt="Avatar"
              />
              <div>
                <div id="user-name" style={{fontWeight:600}}>{user.username}</div>
                <div id="user-tag" style={{fontSize:'0.95em', color:'#b9bbbe'}}>{'#'+user.discriminator}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="container">
        {(!user) && (
          <button className="discord-btn" id="discord-login" onClick={handleLogin}>
            <img src="https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/discord.svg" alt="Discord Logo" />
            Continue with Discord
          </button>
        )}
        {user && page==='dashboard' && (
          <>
            <div className="info-card">
              <h2>Your Application Status</h2>
              <p>Status: <span id="dashboard-status">{status || '-'}</span></p>
            </div>
            <div className="info-cards-row">
              <div className="info-card">
                <div style={{fontSize:'2em', marginBottom:8}}>🔒</div>
                <div style={{fontWeight:600, marginBottom:4}}>Secure Process</div>
                <div style={{fontSize:'0.98em', color:'#b9bbbe'}}>OAuth2 integration ensures secure authentication through Discord</div>
              </div>
              <div className="info-card">
                <div style={{fontSize:'2em', marginBottom:8}}>⚡</div>
                <div style={{fontWeight:600, marginBottom:4}}>Instant Notifications</div>
                <div style={{fontSize:'0.98em', color:'#b9bbbe'}}>Real-time webhook alerts notify staff of new applications</div>
              </div>
              <div className="info-card">
                <div style={{fontSize:'2em', marginBottom:8}}>📈</div>
                <div style={{fontWeight:600, marginBottom:4}}>Track Progress</div>
                <div style={{fontSize:'0.98em', color:'#b9bbbe'}}>Monitor your application status and receive updates</div>
              </div>
            </div>
          </>
        )}
        {user && page==='apply' && (
          <form id="mod-form" onSubmit={handleSubmit}>
            <label htmlFor="username">Discord Username</label>
            <input type="text" id="username" name="username" value={user.username + '#' + user.discriminator} readOnly required />
            <label htmlFor="age">Age</label>
            <input type="number" id="age" name="age" min={13} max={99} value={form.age} onChange={handleFormChange} required />
            <label htmlFor="experience">Do you have moderation experience?</label>
            <textarea id="experience" name="experience" value={form.experience} onChange={handleFormChange} required />
            <label htmlFor="motivation">Why do you want to become a mod?</label>
            <textarea id="motivation" name="motivation" value={form.motivation} onChange={handleFormChange} required />
            <label style={{marginTop:14}}>
              <input type="checkbox" id="confirm-send" checked={confirmSend} onChange={e=>setConfirmSend(e.target.checked)} required />
              I confirm that my information is correct and I want to submit the application.
            </label>
            <button type="submit" className="submit-btn">Submit Application</button>
            {submitMsg && <div style={{marginTop:12, color:'#43B581', fontWeight:500}}>{submitMsg}</div>}
          </form>
        )}
        {user && page==='admin' && (
          isAdmin() ? (
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
              onApplicationSelect={() => {}}
              onStatusUpdate={(id, status) => {
                // Finde Index und update Status
                const idx = Number(id);
                let apps = [...applications];
                apps[idx].status = status === 'approved' ? 'Accepted' : status === 'rejected' ? 'Rejected' : 'Submitted';
                setApplications(apps);
              }}
            />
          ) : (
            <div className="info-card" style={{marginTop:32, textAlign:'center', color:'#ff7675'}}>
              Du bist kein Admin und hast keinen Zugriff auf das Admin-Panel.
            </div>
          )
        )}
      </div>
      <div className="footer">&copy; 2025</div>
    </>
  );
}