import { buildClientApiPath, getClientApiBaseUrl } from "./backend-config";

/** Browser: always `/api`. Server components: same default. */
export function getApiBaseUrl(): string {
  return getClientApiBaseUrl();
}

export function buildApiUrl(endpoint: string): string {
  return buildClientApiPath(endpoint);
}
