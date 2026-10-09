import { apiRequest } from './client';

export function listCompanyAttendance(params = {}) {
  const { fresh: _fresh, signal: _signal, ...query } = params;
  const search = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v != null && v !== '') search.set(k, String(v));
  });
  const qs = search.toString();
  return apiRequest(qs ? `/api/company-attendance/?${qs}` : '/api/company-attendance/');
}

export function getCompanyAttendanceRecord(params) {
  const search = new URLSearchParams(params).toString();
  return apiRequest(`/api/company-attendance/record?${search}`);
}

export function verifyShift(body) {
  return apiRequest('/api/company-attendance/shifts/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function adminReplyCommentThread(body) {
  return apiRequest('/api/company-attendance/shifts/comment-thread/reply', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
