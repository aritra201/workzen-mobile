import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../utils/storage';
import { isFormDataBody } from '../utils/multipart';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

let refreshPromise = null;

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearTokens();
    return false;
  }

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    await clearTokens();
    return false;
  }

  const data = await parseJsonSafe(response);
  await setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return true;
}

async function executeRequest(url, { auth, skipRefresh, headers, rest }) {
  let response = await fetch(url, { ...rest, headers });

  if (response.status === 401 && auth && !skipRefresh) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      const retryHeaders = new Headers(headers);
      const token = await getAccessToken();
      retryHeaders.set('Authorization', `Bearer ${token}`);
      response = await fetch(url, { ...rest, headers: retryHeaders });
    }
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  const {
    auth = true,
    skipRefresh = false,
    headers: customHeaders,
    signal,
    ...rest
  } = options;

  const headers = new Headers(customHeaders || {});

  if (!headers.has('Content-Type') && rest.body && !isFormDataBody(rest.body)) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = await getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  return executeRequest(url, {
    auth,
    skipRefresh,
    headers,
    rest: { ...rest, headers, signal },
  });
}

export { API_BASE };
