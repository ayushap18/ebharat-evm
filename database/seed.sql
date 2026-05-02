INSERT INTO kendras (name, state, district, address, latitude, longitude, status) VALUES
('Central Digital Seva Kendra', 'Delhi', 'New Delhi', 'Janpath Citizen Facilitation Centre', 28.6139, 77.2090, 'open'),
('Nagar Citizen Service Desk', 'Maharashtra', 'Mumbai City', 'Ward Office Public Service Counter', 19.0760, 72.8777, 'busy')
ON CONFLICT DO NOTHING;

INSERT INTO service_catalog (code, name, description, required_docs, fee, sla_hours) VALUES
('VOTER_HELP', 'Voter Services', 'EPIC lookup, form guidance, EVM awareness, and polling information.', '["Identity proof", "Address proof"]', 0, 24),
('AADHAAR_UPDATE', 'Aadhaar Update', 'Slot booking and document checklist for Aadhaar demographic update.', '["Aadhaar number", "Address proof"]', 50, 72),
('CERTIFICATE', 'Citizen Certificates', 'Income, domicile, caste, and local certificate application support.', '["Identity proof", "Supporting document"]', 30, 120),
('MOBILE_SEVA', 'Mobile Seva', 'DigiLocker, OTP, SMS alert and mobile-linked services.', '["Mobile number", "Identity proof"]', 0, 12)
ON CONFLICT (code) DO NOTHING;

INSERT INTO demo_elections (title, status)
SELECT 'EVM Awareness Demo Election', 'open'
WHERE NOT EXISTS (SELECT 1 FROM demo_elections WHERE title = 'EVM Awareness Demo Election');

INSERT INTO demo_candidates (election_id, name, symbol, color)
SELECT e.id, candidate.name, candidate.symbol, candidate.color
FROM demo_elections e
CROSS JOIN (VALUES
  ('Jan Pragati Party', 'कमल', '#ff9933'),
  ('Lok Seva Front', 'चक्र', '#1a5fb4'),
  ('Gramin Vikas Dal', 'पत्ता', '#138808'),
  ('Nagrik Ekta Manch', 'दीप', '#7c3aed')
) AS candidate(name, symbol, color)
WHERE e.title = 'EVM Awareness Demo Election'
  AND NOT EXISTS (SELECT 1 FROM demo_candidates WHERE election_id = e.id);
