import { apiRequest } from './client';
import { appendImageToFormData, postMultipartRequest } from '../utils/multipart';

function attendanceHeaders({ shiftKey, attendanceDate } = {}) {
  const headers = {};
  if (shiftKey) headers['Shift-Key'] = shiftKey;
  if (attendanceDate) headers['Attendance-Date'] = attendanceDate;
  return headers;
}

export function getTodayAttendance(options = {}) {
  return apiRequest('/api/attendance/me/today', {
    headers: attendanceHeaders(options),
  });
}

export function listMyAttendance(params = {}) {
  const search = new URLSearchParams(params).toString();
  const qs = search ? `?${search}` : '';
  return apiRequest(`/api/attendance/me${qs}`);
}

export function confirmShift(body, options) {
  return apiRequest('/api/attendance/me/today/shifts/confirm', {
    method: 'POST',
    headers: attendanceHeaders(options),
    body: JSON.stringify(body || {}),
  });
}

export function submitShift(body, options) {
  return apiRequest('/api/attendance/me/today/shifts/submit', {
    method: 'PUT',
    headers: attendanceHeaders(options),
    body: JSON.stringify(body),
  });
}

export function updateShiftDetails(body, options) {
  return apiRequest('/api/attendance/me/today/shifts', {
    method: 'PATCH',
    headers: attendanceHeaders(options),
    body: JSON.stringify(body),
  });
}

export async function uploadWorkPictures(assets, options) {
  const formData = new FormData();
  const list = Array.isArray(assets) ? assets : [assets];
  for (let i = 0; i < list.length; i += 1) {
    await appendImageToFormData(formData, 'workPictures', list[i]);
  }
  return postMultipartRequest('/api/attendance/me/today/shifts/work-pictures', formData, {
    method: 'POST',
    headers: attendanceHeaders(options),
  });
}

export function deleteWorkPictures(body, options) {
  return apiRequest('/api/attendance/me/today/shifts/work-pictures', {
    method: 'DELETE',
    headers: attendanceHeaders(options),
    body: JSON.stringify(body),
  });
}

export async function replaceWorkPictures(assets, removeUrls, options) {
  const formData = new FormData();
  const list = Array.isArray(assets) ? assets : [assets];
  for (let i = 0; i < list.length; i += 1) {
    await appendImageToFormData(formData, 'workPictures', list[i]);
  }
  formData.append('removeUrls', JSON.stringify(removeUrls || []));
  return postMultipartRequest('/api/attendance/me/today/shifts/work-pictures/replace', formData, {
    method: 'PUT',
    headers: attendanceHeaders(options),
  });
}

export function getMyAttendanceRecord(params) {
  const search = new URLSearchParams(params).toString();
  return apiRequest(`/api/attendance/me/record?${search}`);
}

export function replyCommentThread(body) {
  return apiRequest('/api/attendance/me/shifts/comment-thread/reply', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
