function trimSlash(value: string) {
  return value.replace(/\/$/, '');
}

/** Garante URL absoluta; host sem protocolo vira https://host (evita path relativo no browser). */
function absoluteUrl(value: string | undefined, fallback: string): string {
  const raw = (value ?? '').trim();
  if (!raw) return trimSlash(fallback);

  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('/') ||
    raw.startsWith('ws://') ||
    raw.startsWith('wss://')
  ) {
    return trimSlash(raw);
  }

  return trimSlash(`https://${raw}`);
}

const apiBaseUrl = absoluteUrl(
  import.meta.env.VITE_API_BASE_URL?.toString(),
  '/api',
);
const uploadsBaseUrl = absoluteUrl(
  import.meta.env.VITE_UPLOADS_BASE_URL?.toString(),
  '',
);
const appUrl = absoluteUrl(
  import.meta.env.VITE_APP_URL?.toString(),
  typeof window !== 'undefined' ? window.location.origin : '',
);

export const env = {
  appName: import.meta.env.VITE_APP_NAME?.toString() || 'SmartFood Admin',
  apiBaseUrl,
  uploadsBaseUrl,
  appUrl,
  isDev: import.meta.env.DEV,
} as const;
