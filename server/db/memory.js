import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

const adminHash = bcrypt.hashSync(process.env.DEMO_ADMIN_PASSWORD || 'Admin@12345', 10);

export const memory = {
  users: [
    {
      id: id(),
      email: process.env.DEMO_ADMIN_EMAIL || 'admin@ebharat.local',
      mobile: '9999999999',
      password_hash: adminHash,
      full_name: 'Portal Administrator',
      role: 'admin',
      status: 'active',
      created_at: now(),
    },
  ],
  kendras: [
    { id: id(), name: 'Central Digital Seva Kendra', state: 'Delhi', district: 'New Delhi', address: 'Janpath Citizen Facilitation Centre', status: 'open', open_hours: '10:00 AM - 6:00 PM' },
    { id: id(), name: 'Nagar Citizen Service Desk', state: 'Maharashtra', district: 'Mumbai City', address: 'Ward Office Public Service Counter', status: 'busy', open_hours: '9:30 AM - 5:30 PM' },
  ],
  services: [
    { id: id(), code: 'VOTER_HELP', name: 'Voter Services', description: 'EPIC lookup, form guidance, EVM awareness, and polling information.', required_docs: ['Identity proof', 'Address proof'], fee: 0, sla_hours: 24, active: true },
    { id: id(), code: 'AADHAAR_UPDATE', name: 'Aadhaar Update', description: 'Slot booking and document checklist for Aadhaar demographic update.', required_docs: ['Aadhaar number', 'Address proof'], fee: 50, sla_hours: 72, active: true },
    { id: id(), code: 'CERTIFICATE', name: 'Citizen Certificates', description: 'Income, domicile, caste, and local certificate application support.', required_docs: ['Identity proof', 'Supporting document'], fee: 30, sla_hours: 120, active: true },
    { id: id(), code: 'MOBILE_SEVA', name: 'Mobile Seva', description: 'DigiLocker, OTP, SMS alert and mobile-linked services.', required_docs: ['Mobile number', 'Identity proof'], fee: 0, sla_hours: 12, active: true },
  ],
  requests: [],
  events: [],
  audit: [],
  refreshSessions: [],
  election: { id: id(), title: 'EVM Awareness Demo Election', status: 'open' },
  candidates: [],
  votes: [],
};

memory.candidates = [
  { id: id(), election_id: memory.election.id, name: 'Jan Pragati Party', symbol: 'कमल', color: '#ff9933' },
  { id: id(), election_id: memory.election.id, name: 'Lok Seva Front', symbol: 'चक्र', color: '#1a5fb4' },
  { id: id(), election_id: memory.election.id, name: 'Gramin Vikas Dal', symbol: 'पत्ता', color: '#138808' },
  { id: id(), election_id: memory.election.id, name: 'Nagrik Ekta Manch', symbol: 'दीप', color: '#7c3aed' },
];
