// In production (Cloud Run), the frontend is served from the same origin as the API.
// So we can use relative paths (empty string prefix).
// In local dev (Vite), we might need localhost:8000 if not using proxy.
// But since we didn't set up Vite proxy, let's stick to absolute for local dev if needed,
// OR better: use import.meta.env.PROD check.

const isProd = import.meta.env.PROD
export const API_BASE_URL = isProd ? '' : 'http://localhost:8000'
