/**
 * NutriAI REST API Client
 * 
 * Production-grade HTTP client with JWT Authorization header injection,
 * token refresh logic, error parsing, and graceful guest fallback.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface ApiTokens {
  access: string;
  refresh: string;
}

export function getStoredTokens(): ApiTokens | null {
  const access = localStorage.getItem('nutriai_token_access');
  const refresh = localStorage.getItem('nutriai_token_refresh');
  if (access && refresh) {
    return { access, refresh };
  }
  return null;
}

export function setStoredTokens(tokens: ApiTokens | null) {
  if (tokens) {
    localStorage.setItem('nutriai_token_access', tokens.access);
    localStorage.setItem('nutriai_token_refresh', tokens.refresh);
  } else {
    localStorage.removeItem('nutriai_token_access');
    localStorage.removeItem('nutriai_token_refresh');
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; isBackendAvailable: boolean }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const tokens = getStoredTokens();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (tokens?.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && tokens?.refresh && endpoint !== '/auth/token/refresh/') {
      // Try refresh token
      const refreshed = await refreshAccessToken(tokens.refresh);
      if (refreshed) {
        headers['Authorization'] = `Bearer ${refreshed.access}`;
        const retryResp = await fetch(url, { ...options, headers });
        if (retryResp.ok) {
          const data = await retryResp.json();
          return { data, error: null, isBackendAvailable: true };
        }
      } else {
        setStoredTokens(null);
      }
    }

    if (!response.ok) {
      let errMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        errMessage = errJson.detail || errJson.error || JSON.stringify(errJson);
      } catch (_) {}
      return { data: null, error: errMessage, isBackendAvailable: true };
    }

    const data = await response.json();
    return { data, error: null, isBackendAvailable: true };
  } catch (err: any) {
    // Network / Offline Error
    return {
      data: null,
      error: err.message || 'Backend connection failed',
      isBackendAvailable: false
    };
  }
}

async function refreshAccessToken(refreshToken: string): Promise<ApiTokens | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      const newTokens: ApiTokens = {
        access: data.access,
        refresh: data.refresh || refreshToken,
      };
      setStoredTokens(newTokens);
      return newTokens;
    }
  } catch (_) {}

  return null;
}
