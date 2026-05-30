import { Space, Category, Review, Booking, User } from "@/data";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return false;
  }
  const data: { accessToken: string } = await res.json();
  setTokens(data.accessToken);
  return true;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401 && retry && getRefreshToken()) {
    if (await tryRefresh()) {
      return request<T>(path, init, false);
    }
  }

  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
}): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
  return res.json();
}

export async function logout(refreshToken: string): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {});
}

export function fetchSpaces(): Promise<Space[]> {
  return request<Space[]>("/api/spaces");
}

export function fetchCategories(): Promise<Category[]> {
  return request<Category[]>("/api/categories");
}

export function fetchReviews(spaceId: number): Promise<Review[]> {
  return request<Review[]>(`/api/reviews/${spaceId}`);
}

export function fetchSpace(id: number): Promise<Space> {
  return request<Space>(`/api/spaces/${id}`);
}

export function fetchMe(): Promise<User> {
  return request<User>("/api/users/me");
}

export function fetchMyBookings(): Promise<Booking[]> {
  return request<Booking[]>("/api/bookings/me");
}

export function fetchSavedSpaces(): Promise<Space[]> {
  return request<Space[]>("/api/spaces/me/saved");
}

export function createBooking(params: {
  spaceId: number;
  startTime: string;
  endTime: string;
}): Promise<Booking> {
  return request<Booking>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function leaveReview(params: {
  bookingId: number;
  rating: number;
  comment: string;
}): Promise<Review> {
  return request<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function saveSpace(id: number): Promise<void> {
  return request<void>(`/api/spaces/${id}/save`, { method: "POST" });
}

export function unsaveSpace(id: number): Promise<void> {
  return request<void>(`/api/spaces/${id}/unsave`, { method: "DELETE" });
}
