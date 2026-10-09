import { apiRequest } from './client';

export function getActivityLogListItems(data) {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.logs)) return data.logs;
  if (Array.isArray(data.records)) return data.records;
  return [];
}

export function listActivityLogsForAttendance(attendanceId) {
  const qs = new URLSearchParams({ attendanceId: String(attendanceId) }).toString();
  return apiRequest(`/api/activity-logs?${qs}`);
}

export function formatActivityActionType(actionType) {
  if (!actionType) return 'Activity';
  return String(actionType)
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
