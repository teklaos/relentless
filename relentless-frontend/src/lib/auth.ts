const ACCESS_KEY = "relentless.accessToken";
const REFRESH_KEY = "relentless.refreshToken";
const PENDING_BOOKING_KEY = "pendingBookingId";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getPendingBookingId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PENDING_BOOKING_KEY);
  return raw ? Number(raw) : null;
}

export function setPendingBookingId(id: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_BOOKING_KEY, String(id));
}

export function clearPendingBookingId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_BOOKING_KEY);
}
