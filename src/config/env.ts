function trimSlash(value: string) {
  return value.replace(/\/$/, '');
}

const apiBaseUrl = trimSlash(
  import.meta.env.VITE_API_BASE_URL?.toString() || '/api',
);
const uploadsBaseUrl = trimSlash(
  import.meta.env.VITE_UPLOADS_BASE_URL?.toString() || '',
);
const appUrl = trimSlash(
  import.meta.env.VITE_APP_URL?.toString() || window.location.origin,
);

export const env = {
  appName: import.meta.env.VITE_APP_NAME?.toString() || 'SmartFood Admin',
  apiBaseUrl,
  uploadsBaseUrl,
  appUrl,
  isDev: import.meta.env.DEV,
} as const;
