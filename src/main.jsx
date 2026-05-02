import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Accessibility, AlertTriangle, BadgeCheck, BarChart3, Bell, Building2, CheckCircle2, ChevronRight,
  ClipboardList, FileCheck2, Fingerprint, Globe2, HelpCircle, Landmark, Languages, LayoutDashboard,
  LockKeyhole, MapPin, Menu, PhoneCall, Search, ShieldCheck, Smartphone, UserRound, Vote, X
} from 'lucide-react';
import { authApi, portalApi, setToken } from './lib/api.js';
import { fallbackKendras, fallbackServices } from './data/fallback.js';
import './styles.css';

const statusLabels = {
  submitted: 'Submitted', in_review: 'In Review', documents_needed: 'Docs Needed', approved: 'Approved', rejected: 'Rejected', completed: 'Completed'
};

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [services, setServices] = useState(fallbackServices);
  const [kendras, setKendras] = useState(fallbackKendras);
  const [requests, setRequests] = useState([]);
  const [election, setElection] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [contrast, setContrast] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState('');

  async function loadPublicData() {
    try {
      const [health, serviceData, kendraData, electionData] = await Promise.all([
        portalApi.health(), portalApi.services(), portalApi.kendras(), portalApi.election(),
      ]);
      setApiStatus(health.database);
      setServices(serviceData.services);
      setKendras(kendraData.kendras);
      setElection(electionData.election);
    } catch {
      setApiStatus('offline-demo');
    }
  }

  async function loadPrivateData() {
    if (!user) return;
    try {
      const data = await portalApi.requests();
      setRequests(data.requests);
    } catch (error) {
      setNotice(error.message);
    }
  }

  useEffect(() => { loadPublicData(); }, []);
  useEffect(() => { loadPrivateData(); }, [user]);

  const stats = useMemo(() => ({
    services: services.length,
    kendras: kendras.length,
    pending: requests.filter((request) => ['submitted', 'in_review', 'documents_needed'].includes(request.status)).length,
    completed: requests.filter((request) => request.status === 'completed').length,
  }), [services, kendras, requests]);

  function logout() {
    setToken(null);
    setUser(null);
    setView('home');
    setRequests([]);
  }

  return (
    <main className={contrast ? 'app high-contrast' : 'app'}>
      <GovHeader user={user} view={view} setView={setView} language={language} setLanguage={setLanguage} contrast={contrast} setContrast={setContrast} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} logout={logout} />
      {notice && <div className="toast" role="status"><AlertTriangle /> {notice}<button onClick={() => setNotice('')}>Dismiss</button></div>}
      <AlertBar apiStatus={apiStatus} />
      {view === 'home' && <Home user={user} setView={setView} stats={stats} services={services} kendras={kendras} />}
      {view === 'auth' && <AuthScreen setUser={setUser} setView={setView} setNotice={setNotice} />}
      {view === 'dashboard' && <Dashboard user={user} services={services} kendras={kendras} requests={requests} setRequests={setRequests} setView={setView} setNotice={setNotice} />}
      {view === 'evm' && <EVMSimulator user={user} election={election} setView={setView} setNotice={setNotice} />}
      {view === 'admin' && <AdminDesk user={user} requests={requests} setRequests={setRequests} setNotice={setNotice} />}
      <Footer />
    </main>
  );
}

function GovHeader({ user, view, setView, language, setLanguage, contrast, setContrast, mobileOpen, setMobileOpen, logout }) {
  const nav = [ ['home', 'Home'], ['dashboard', 'Citizen Desk'], ['evm', 'EVM Demo'], ['admin', 'Operator'] ];
  return <header className="topbar">
    <div className="gov-strip"><span>भारत सरकार शैली डिजिटल सेवा पोर्टल</span><span>Last updated: 02 May 2026 • WCAG-friendly</span></div>
    <nav className="nav">
      <button className="brand reset" onClick={() => setView('home')} aria-label="eBharat home">
        <span className="emblem"><Landmark /></span><span><strong>eBharat EVM</strong><small>Digital Seva Kendra</small></span>
      </button>
      <div className={mobileOpen ? 'navlinks open' : 'navlinks'}>
        {nav.map(([key, label]) => <button key={key} className={view === key ? 'nav-active reset' : 'reset'} onClick={() => { setView(key); setMobileOpen(false); }}>{label}</button>)}
      </div>
      <div className="nav-actions">
        <button className="ghost" onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}><Languages /> {language}</button>
        <button className="ghost" onClick={() => setContrast(!contrast)} aria-pressed={contrast}><Accessibility /> Contrast</button>
        {user ? <button className="secondary compact" onClick={logout}>Logout</button> : <button className="primary compact" onClick={() => setView('auth')}>Login</button>}
        <button className="menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X /> : <Menu />}</button>
      </div>
    </nav>
  </header>;
}

function AlertBar({ apiStatus }) {
  return <div className="alertbar"><ShieldCheck /><strong>Demo public-service system.</strong><span>Backend: {apiStatus}. EVM module is awareness-only, not real election infrastructure.</span></div>;
}

function Home({ user, setView, stats, services, kendras }) {
  return <>
    <section className="hero section">
      <div className="hero-copy reveal">
        <div className="official-line">Secure Voting Awareness. Digital Services Near You.</div>
        <h1>One government-style portal for EVM learning and citizen services.</h1>
        <p>Authenticate, access Digital Seva services, track applications, and learn EVM process through a clear kiosk-ready interface.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => setView(user ? 'dashboard' : 'auth')}>Open Citizen Desk <ChevronRight /></button>
          <button className="secondary" onClick={() => setView('evm')}>Try EVM Awareness Demo</button>
        </div>
        <div className="trust-row"><span><ShieldCheck /> RBAC backend</span><span><Globe2 /> Bilingual-ready</span><span><BadgeCheck /> Audit logging</span></div>
      </div>
      <div className="hero-panel reveal delay">
        <div className="panel-header"><span className="status-dot"></span><span>Service Command Centre</span><Bell /></div>
        <div className="tricolor-card"><div><small>Public service coverage</small><strong>{stats.services} services • {stats.kendras} kendras</strong></div><div className="mini-chart" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
        <div className="process-card"><div><Fingerprint /><span>Login / verify</span><b>01</b></div><div><ClipboardList /><span>Submit request</span><b>02</b></div><div><CheckCircle2 /><span>Track status</span><b>03</b></div></div>
      </div>
    </section>
    <section className="section workflow"><SectionTitle label="Portal modules" title="Built as a real frontend over auth, API, service workflow, and demo EVM state." />
      <div className="steps">{['Citizen dashboard', 'Operator service desk', 'Audit-ready backend'].map((step, index) => <article className="step-card" key={step}><b>{String(index + 1).padStart(2, '0')}</b><h3>{step}</h3><p>Structured for hackathon demo and production extension.</p></article>)}</div>
    </section>
    <section className="section seva"><SectionTitle label="Available services" title="Government-style catalogue with documents, fee, SLA, and kendra routing." />
      <div className="service-cards">{services.map((service) => <GovCard key={service.id} icon={<FileCheck2 />} title={service.name} body={service.description} meta={`₹${service.fee} • ${service.sla_hours}h SLA`} />)}</div>
    </section>
    <KendraSection kendras={kendras} />
  </>;
}

function AuthScreen({ setUser, setView, setNotice }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: 'admin@ebharat.local', password: 'Admin@12345', full_name: 'Citizen User', mobile: '9000000000', role: 'citizen' });
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = mode === 'login' ? await authApi.login(form) : await authApi.register(form);
      setToken(data.accessToken);
      setUser(data.user);
      setView('dashboard');
    } catch (error) { setNotice(error.message); } finally { setLoading(false); }
  }

  return <section className="section auth-grid">
    <div><span className="eyebrow">Secure access</span><h2>Login to citizen desk or operator console.</h2><p>Default local admin works when backend runs without database: admin@ebharat.local / Admin@12345.</p><div className="auth-note"><LockKeyhole /><span>JWT access tokens, hashed passwords, role-based API routes, rate-limited auth endpoints.</span></div></div>
    <form className="auth-card" onSubmit={submit}>
      <div className="switcher"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button></div>
      {mode === 'register' && <><label>Full name<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label><label>Mobile<input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></label><label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="citizen">Citizen</option><option value="operator">Kendra Operator</option></select></label></>}
      <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="primary" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}</button>
    </form>
  </section>;
}

function Dashboard({ user, services, kendras, requests, setRequests, setView, setNotice }) {
  const [selectedService, setSelectedService] = useState(services[0]?.id || '');
  const [selectedKendra, setSelectedKendra] = useState(kendras[0]?.id || '');
  const [description, setDescription] = useState('Need assistance with voter service and document verification.');

  useEffect(() => { if (!selectedService && services[0]) setSelectedService(services[0].id); }, [services, selectedService]);
  useEffect(() => { if (!selectedKendra && kendras[0]) setSelectedKendra(kendras[0].id); }, [kendras, selectedKendra]);

  async function createRequest() {
    try {
      const data = await portalApi.createRequest({ service_id: selectedService, kendra_id: selectedKendra, form_data: { description } });
      setRequests([data.request, ...requests]);
      setNotice(`Request submitted: ${data.request.reference_no}`);
    } catch (error) { setNotice(error.message); }
  }

  if (!user) return <Gate setView={setView} />;
  return <section className="section dashboard">
    <SectionTitle label="Citizen dashboard" title={`Namaste, ${user.full_name}. Track services and submit requests.`} />
    <div className="dashboard-grid">
      <div className="request-form gov-panel"><h3>New service request</h3><label>Service<select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label>Kendra<select value={selectedKendra} onChange={(e) => setSelectedKendra(e.target.value)}>{kendras.map((kendra) => <option key={kendra.id} value={kendra.id}>{kendra.name}</option>)}</select></label><label>Citizen note<textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label><button className="primary compact" onClick={createRequest}>Submit Request</button></div>
      <RequestTable requests={requests} />
    </div>
  </section>;
}

function EVMSimulator({ user, election, setView, setNotice }) {
  const [selected, setSelected] = useState('');
  const [receipt, setReceipt] = useState('');
  async function castVote() {
    if (!user) return setView('auth');
    try {
      const data = await portalApi.castVote({ election_id: election.id, candidate_id: selected });
      setReceipt(data.vote.receipt_no);
    } catch (error) { setNotice(error.message); }
  }
  const candidates = election?.candidates || [];
  return <section className="section evm-grid"><div className="evm-copy"><span>Digital EVM education</span><h2>Ballot unit simulator with locked vote state and local receipt.</h2><p>This module is demo-only for voter awareness. It is not connected to real elections.</p><div className="receipt-box"><strong>{receipt || 'No demo vote cast yet'}</strong><small>{receipt ? 'Demo receipt generated by backend' : 'Select one option and cast demo vote'}</small></div></div><div className="evm-machine"><div className="machine-top">Ballot Unit • Awareness Mode</div>{candidates.map((candidate) => <button className={selected === candidate.id ? 'candidate selected' : 'candidate'} key={candidate.id} onClick={() => { setSelected(candidate.id); setReceipt(''); }}><span className="symbol" style={{ '--party': candidate.color }}>{candidate.symbol}</span><span>{candidate.name}</span><i>{selected === candidate.id ? 'Selected' : 'Select'}</i></button>)}<button className="cast" disabled={!selected || Boolean(receipt)} onClick={castVote}><Vote /> {receipt ? 'Vote Locked' : 'Cast Demo Vote'}</button></div></section>;
}

function AdminDesk({ user, requests, setRequests, setNotice }) {
  async function updateStatus(request, status) {
    try {
      const data = await portalApi.updateRequest(request.id, { status, note: `Marked ${status}` });
      setRequests(requests.map((item) => item.id === request.id ? { ...item, ...data.request } : item));
    } catch (error) { setNotice(error.message); }
  }
  if (!user) return <Gate setView={() => {}} />;
  if (!['admin', 'operator'].includes(user.role)) return <section className="section"><SectionTitle label="Restricted" title="Operator desk requires operator or admin role." /></section>;
  return <section className="section"><SectionTitle label="Operator desk" title="Review citizen requests, update status, and maintain audit trail." /><div className="admin-grid"><RequestTable requests={requests} actions={updateStatus} /><div className="gov-panel"><h3>Queue policy</h3><p>Every status update writes a service event and audit log entry on backend.</p><div className="metric"><BarChart3 /><span>{requests.length} total requests</span></div><div className="metric"><ShieldCheck /><span>RBAC protected route</span></div></div></div></section>;
}

function RequestTable({ requests, actions }) {
  return <div className="request-table gov-panel"><h3>Application tracker</h3>{requests.length === 0 ? <div className="empty"><Search /><strong>No requests yet</strong><small>Submit a service request to see status here.</small></div> : <div className="table-scroll"><table><thead><tr><th>Reference</th><th>Service</th><th>Citizen</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td>{request.reference_no}</td><td>{request.service_name || request.service_id}</td><td>{request.citizen_name || 'Self'}</td><td><span className={`status ${request.status}`}>{statusLabels[request.status] || request.status}</span></td><td>{actions ? <button className="secondary compact" onClick={() => actions(request, request.status === 'completed' ? 'in_review' : 'completed')}>Toggle</button> : 'Track'}</td></tr>)}</tbody></table></div>}</div>;
}

function KendraSection({ kendras }) { return <section className="section kendra"><div className="map-card"><div className="india-map">भारत</div><span className="pin p1"></span><span className="pin p2"></span><span className="pin p3"></span></div><div><span className="eyebrow">Nearest Kendra</span><h2>Locate verified service counters and prepare documents before visit.</h2><div className="kendra-list">{kendras.map((kendra) => <article key={kendra.id}><Building2 /><strong>{kendra.name}</strong><small>{kendra.district}, {kendra.state} • {kendra.status} • {kendra.open_hours}</small></article>)}</div></div></section>; }
function GovCard({ icon, title, body, meta }) { return <article className="gov-card">{icon}<h3>{title}</h3><p>{body}</p><small>{meta}</small></article>; }
function SectionTitle({ label, title }) { return <div className="section-title"><span>{label}</span><h2>{title}</h2></div>; }
function Gate({ setView }) { return <section className="section"><div className="gate"><UserRound /><h2>Login required</h2><p>Authenticate to access citizen services.</p><button className="primary" onClick={() => setView('auth')}>Go to Login</button></div></section>; }
function Footer() { return <footer><strong>eBharat EVM • Digital Seva Kendra</strong><span>Hackathon prototype with backend auth, Postgres schema, and demo EVM awareness workflow.</span></footer>; }

createRoot(document.getElementById('root')).render(<App />);
