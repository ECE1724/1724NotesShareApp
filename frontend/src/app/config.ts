export const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + '/api';
export const SPACES_BASE = (import.meta.env.VITE_SPACES_BASE || 'https://ece1724-final-project.tor1.digitaloceanspaces.com/');

export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, { credentials: 'include', ...init });
}
