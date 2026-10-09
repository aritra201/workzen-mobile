import { apiRequest } from './client';

export function login(body) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function loginGoogle(body) {
  return apiRequest('/api/auth/login/google', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function googleAuthCompanyAdmin(body) {
  return apiRequest('/api/auth/google', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function registerCompany(body) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function verifyEmail(body) {
  return apiRequest('/api/auth/verify-email', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function resendVerification(body) {
  return apiRequest('/api/auth/resend-verification', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function forgotPassword(body) {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function resetPassword(body) {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
}

export function fetchMe(options = {}) {
  return apiRequest('/api/auth/me', options);
}

export function changePassword(body) {
  return apiRequest('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
