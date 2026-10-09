import { apiRequest } from './client';

export function createUnlockRequest(body) {
  return apiRequest('/api/unlock-requests/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listMyUnlockRequests(params = {}) {
  const search = new URLSearchParams(params).toString();
  const qs = search ? `?${search}` : '';
  return apiRequest(`/api/unlock-requests/me${qs}`);
}

export function cancelMyUnlockRequest(requestId) {
  return apiRequest(`/api/unlock-requests/me/${requestId}`, { method: 'DELETE' });
}

export function listUnlockRequestsAdmin(params = {}) {
  const search = new URLSearchParams(params).toString();
  const qs = search ? `?${search}` : '';
  return apiRequest(`/api/unlock-requests/${qs}`);
}

export function decideUnlockRequest(body) {
  return apiRequest('/api/unlock-requests/decide', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
