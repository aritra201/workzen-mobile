import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

export function mobileAppScheme() {
  const fromConfig = Constants.expoConfig?.scheme;
  if (typeof fromConfig === 'string' && fromConfig) return fromConfig;
  return 'workzen';
}

/** Deep link opened by the native app (email “Open in app”, web handoff). */
export function buildMobileInviteUrl(kind, token) {
  const scheme = mobileAppScheme();
  return `${scheme}://invite/${kind}?token=${encodeURIComponent(token)}`;
}

function inviteKindFromPathParts(hostname, path) {
  const normalizedPath = (path || '').replace(/^\//, '');
  const combined = `${hostname}/${normalizedPath}`.replace(/\/$/, '');

  if (
    normalizedPath === 'member' ||
    normalizedPath === 'invite/member' ||
    normalizedPath.endsWith('invite/member') ||
    combined.endsWith('invite/member')
  ) {
    return 'member';
  }
  if (
    normalizedPath === 'employee' ||
    normalizedPath === 'invite/employee' ||
    normalizedPath.endsWith('invite/employee') ||
    combined.endsWith('invite/employee')
  ) {
    return 'employee';
  }
  if (normalizedPath.includes('accept-member-invite')) {
    return 'member';
  }
  if (normalizedPath.includes('accept-employee-invite')) {
    return 'employee';
  }
  return null;
}

/**
 * Map web invitation URLs to in-app routes.
 * HTTPS App Links: https://domain/invite/member?token=...
 * Custom scheme: workzen://invite/member?token=...
 */
export function parseInvitationUrl(url) {
  if (!url) return null;

  try {
    const parsed = Linking.parse(url);
    const tokenParam = parsed.queryParams?.token;
    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
    if (!token || typeof token !== 'string') {
      return null;
    }

    const hostname = parsed.hostname || '';
    const path = parsed.path || '';

    // workzen://invite/employee → hostname "invite", path "employee"
    if (hostname === 'invite') {
      const kind = inviteKindFromPathParts('', path);
      if (kind) return { kind, token };
    }

    const kind = inviteKindFromPathParts(hostname, path);
    if (kind) return { kind, token };
  } catch {
    return null;
  }
  return null;
}

export function invitationRouteForKind(kind) {
  return kind === 'member' ? '/invite/member' : '/invite/employee';
}
