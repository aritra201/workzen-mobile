import { apiRequest } from './client';

export function linkFcmSubscriber(subscriberId, token) {
  const body = {};
  if (subscriberId != null && subscriberId !== '') {
    body.subscriberId = subscriberId;
  }
  if (token && String(token).trim()) {
    body.token = String(token).trim();
  }
  return apiRequest('/api/fcm/link', {
    method: 'POST',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
