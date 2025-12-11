// In production (Cloud Run), the frontend is served from the same origin as the API.
// In local dev (Vite), we use proxy in vite.config.ts to forward /api and /static.
// So we can always use relative paths.

export const API_BASE_URL = ''
