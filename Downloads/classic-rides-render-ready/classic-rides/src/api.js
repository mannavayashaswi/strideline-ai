const configuredApiHost = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "") || "";
const apiBaseUrl = configuredApiHost && !/^https?:\/\//i.test(configuredApiHost)
  ? `https://${configuredApiHost}`
  : configuredApiHost;

export function apiUrl(path) {
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}