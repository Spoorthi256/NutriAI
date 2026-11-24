import { apiRequest, setStoredTokens, ApiTokens } from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export async function login(username: string, password: string) {
  const res = await apiRequest<{ access: string; refresh: string }>('/auth/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (res.data) {
    setStoredTokens(res.data);
  }
  return res;
}

export async function register(userData: { username: string; email?: string; password: string }) {
  const res = await apiRequest<{ user: User; profile: any; tokens: ApiTokens }>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (res.data?.tokens) {
    setStoredTokens(res.data.tokens);
  }
  return res;
}

export async function getMe() {
  return apiRequest<{ user: User; profile: any }>('/auth/me/');
}

export function logout() {
  setStoredTokens(null);
}
