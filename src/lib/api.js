const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
const TOKEN_KEY = 'ebharat_access_token';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(token) { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); }

export async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const authApi = {
  login: (payload) => api('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => api('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => api('/auth/me'),
};

export const portalApi = {
  health: () => api('/health'),
  services: () => api('/services'),
  kendras: () => api('/kendras'),
  requests: () => api('/requests'),
  createRequest: (payload) => api('/requests', { method: 'POST', body: JSON.stringify(payload) }),
  updateRequest: (id, payload) => api(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  election: () => api('/demo-election'),
  castVote: (payload) => api('/demo-votes', { method: 'POST', body: JSON.stringify(payload) }),
  results: () => api('/demo-results'),
};
