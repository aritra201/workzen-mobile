/**
 * Dynamic App Link host from EXPO_PUBLIC_WEB_ORIGIN (see .env).
 * Note: only list real config plugins here (e.g. expo-router). Do not add
 * expo-web-browser — it has no plugin and breaks config load on Node 22+.
 */

function webAppLinkHost() {
  const origin = process.env.EXPO_PUBLIC_WEB_ORIGIN;
  if (!origin) return 'YOUR_WEB_DOMAIN';
  try {
    return new URL(origin).hostname;
  } catch {
    return 'YOUR_WEB_DOMAIN';
  }
}

function appLinkHosts() {
  const raw = process.env.EXPO_PUBLIC_APP_LINK_HOSTS;
  if (raw?.trim()) {
    return raw
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);
  }
  const primary = webAppLinkHost();
  if (!primary || primary === 'YOUR_WEB_DOMAIN') {
    return [];
  }
  const hosts = new Set([primary]);
  if (!primary.startsWith('www.')) {
    hosts.add(`www.${primary}`);
  }
  return [...hosts];
}

function isLocalOrLanHost(host) {
  if (!host || host === 'YOUR_WEB_DOMAIN') return true;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  return /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(host);
}

function cleanEnv(value) {
  if (!value || typeof value !== 'string') return '';
  return value.replace(/^['"]|['"]$/g, '').trim();
}

function googleOAuthScheme(androidClientId) {
  const id = cleanEnv(androidClientId);
  if (!id) return null;
  const bare = id.replace(/\.apps\.googleusercontent\.com$/i, '');
  return bare ? `com.googleusercontent.apps.${bare}` : null;
}

module.exports = ({ config }) => {
  const hosts = appLinkHosts().filter((h) => !isLocalOrLanHost(h));
  const googleScheme =
    googleOAuthScheme(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID) ||
    'com.googleusercontent.apps.129004661399-6a0dp0a3281fm9krefavak3oqtsg54vv';

  const httpsAppLinks = hosts.map((host) => ({
    action: 'VIEW',
    autoVerify: true,
    data: [
      { scheme: 'https', host, pathPrefix: '/invite/member' },
      { scheme: 'https', host, pathPrefix: '/invite/employee' },
    ],
    category: ['BROWSABLE', 'DEFAULT'],
  }));

  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      ['@react-native-google-signin/google-signin', { iosUrlScheme: googleScheme }],
    ],
    android: {
      ...config.android,
      intentFilters: [
        {
          action: 'VIEW',
          data: [{ scheme: config.scheme || 'workzen', host: 'invite', pathPrefix: '/' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          data: [{ scheme: googleScheme, path: '/oauth2redirect' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        ...httpsAppLinks,
      ],
    },
    extra: {
      ...config.extra,
      webAppLinkHosts: hosts,
    },
  };
};
