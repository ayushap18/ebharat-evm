export const fallbackServices = [
  { id: 'local-voter', code: 'VOTER_HELP', name: 'Voter Services', description: 'EPIC lookup, EVM awareness, polling guidance.', required_docs: ['Identity proof', 'Address proof'], fee: 0, sla_hours: 24 },
  { id: 'local-aadhaar', code: 'AADHAAR_UPDATE', name: 'Aadhaar Update', description: 'Slot booking and document checklist.', required_docs: ['Aadhaar number', 'Address proof'], fee: 50, sla_hours: 72 },
  { id: 'local-cert', code: 'CERTIFICATE', name: 'Citizen Certificates', description: 'Income, domicile, caste, and local certificates.', required_docs: ['Identity proof', 'Supporting document'], fee: 30, sla_hours: 120 },
];

export const fallbackKendras = [
  { id: 'local-kendra-1', name: 'Central Digital Seva Kendra', district: 'New Delhi', state: 'Delhi', status: 'open', open_hours: '10:00 AM - 6:00 PM' },
  { id: 'local-kendra-2', name: 'Nagar Citizen Service Desk', district: 'Mumbai City', state: 'Maharashtra', status: 'busy', open_hours: '9:30 AM - 5:30 PM' },
];
