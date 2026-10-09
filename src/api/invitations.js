import { apiRequest } from './client';

export function previewMemberInvitation(token) {
  return apiRequest(`/api/invitations/members/preview?token=${encodeURIComponent(token)}`, {
    auth: false,
  });
}

export function acceptMemberInvitation(body) {
  return apiRequest('/api/invitations/members/accept', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function acceptMemberInvitationGoogle(body) {
  return apiRequest('/api/invitations/members/accept/google', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function previewEmployeeInvitation(token) {
  return apiRequest(`/api/invitations/employees/preview?token=${encodeURIComponent(token)}`, {
    auth: false,
  });
}

export function acceptEmployeeInvitation(body) {
  return apiRequest('/api/invitations/employees/accept', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function acceptEmployeeInvitationGoogle(body) {
  return apiRequest('/api/invitations/employees/accept/google', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}
