import {
  Space,
  Category,
  Review,
  Booking,
  User,
  AmenitySummary,
  TimeSlot,
  DayAvailability,
  AuthTokens,
  CreateSpacePayload,
  EditSpacePayload,
  BookingCheckout,
  WalletBalance,
  WalletTransaction,
  UpdateUserPayload,
  SpaceStatus,
  AdminUser
} from "@/lib/types";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function imageUrl(key: string): string {
  return `${API_BASE}/api/images/${key}`;
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

let refreshInFlight: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        });
        if (!res.ok) return false;
        const data: { accessToken: string } = await res.json();
        setTokens(data.accessToken);
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers
    }
  });

  if (res.status === 401 && retry) {
    if (await refreshAccessToken()) {
      return request<T>(path, init, false);
    }
    clearTokens();
    onUnauthorized?.();
    throw new Error(`${init?.method ?? "GET"} ${path} failed: 401`);
  }

  if (!res.ok) {
    const text = await res.text();
    let message: string | undefined;
    try {
      message = text ? (JSON.parse(text) as { message?: string }).message : undefined;
    } catch {
      message = undefined;
    }
    throw new Error(message || `${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function login(payload: { email: string; password: string }): Promise<AuthTokens> {
  return request<AuthTokens>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }, false);
}

export function register(payload: {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
}): Promise<AuthTokens> {
  return request<AuthTokens>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }, false);
}

export function registerHost(payload: {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  iban: string;
  acceptedTerms: boolean;
}): Promise<AuthTokens> {
  return request<AuthTokens>("/api/auth/register/host", { method: "POST", body: JSON.stringify(payload) }, false);
}

export async function logout(refreshToken: string): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
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

export function fetchAvailability(id: number, date: string): Promise<TimeSlot[]> {
  return request<TimeSlot[]>(`/api/spaces/${id}/availability?date=${date}`);
}

export function fetchMonthAvailability(id: number, month: string): Promise<DayAvailability[]> {
  return request<DayAvailability[]>(`/api/spaces/${id}/availability/month?month=${month}`);
}

export function fetchMe(): Promise<User> {
  return request<User>("/api/users/me");
}

export function fetchMyBookings(): Promise<Booking[]> {
  return request<Booking[]>("/api/bookings/me");
}

export function fetchBookingCheckout(id: number): Promise<BookingCheckout> {
  return request<BookingCheckout>(`/api/bookings/${id}`);
}

export function fetchSavedSpaces(): Promise<Space[]> {
  return request<Space[]>("/api/spaces/me/saved");
}

export function createBooking(params: {
  spaceId: number;
  startTime: string;
  endTime: string;
}): Promise<BookingCheckout> {
  return request<BookingCheckout>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(params)
  });
}

export function fetchWalletBalance(): Promise<WalletBalance> {
  return request<WalletBalance>("/api/wallet/me");
}

export function fetchWalletTransactions(): Promise<WalletTransaction[]> {
  return request<WalletTransaction[]>("/api/wallet/me/transactions");
}

export function debitWallet(amount: number): Promise<void> {
  return request<void>("/api/wallet/me/debit", {
    method: "POST",
    body: JSON.stringify({ amount })
  });
}

export function editUser(payload: UpdateUserPayload): Promise<User> {
  return request<User>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
  return request<void>("/api/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteAccount(): Promise<void> {
  return request<void>("/api/users/me", { method: "DELETE" });
}

export async function uploadImage(file: File): Promise<string> {
  const token = getAccessToken();
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API_BASE}/api/images`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body
  });
  if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
  const data: { key: string } = await res.json();
  return data.key;
}

export function leaveReview(params: { bookingId: number; rating: number; comment: string }): Promise<Review> {
  return request<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(params)
  });
}

export function saveSpace(id: number): Promise<void> {
  return request<void>(`/api/spaces/${id}/save`, { method: "POST" });
}

export function unsaveSpace(id: number): Promise<void> {
  return request<void>(`/api/spaces/${id}/unsave`, { method: "DELETE" });
}

export function fetchHostedSpaces(): Promise<Space[]> {
  return request<Space[]>("/api/spaces/me/hosted");
}

export function fetchHostedBookings(): Promise<Booking[]> {
  return request<Booking[]>("/api/bookings/me/hosted");
}

export function fetchHostedReviews(): Promise<Review[]> {
  return request<Review[]>("/api/reviews/me/hosted");
}

export function fetchAmenities(): Promise<AmenitySummary[]> {
  return request<AmenitySummary[]>("/api/amenities");
}

export function createSpace(payload: CreateSpacePayload): Promise<Space> {
  return request<Space>("/api/spaces", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function editSpace(id: number, payload: EditSpacePayload): Promise<Space> {
  return request<Space>(`/api/spaces/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function changeSpaceStatus(id: number, status: SpaceStatus): Promise<Space> {
  return request<Space>(`/api/spaces/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function deleteSpace(id: number): Promise<void> {
  return request<void>(`/api/spaces/${id}`, { method: "DELETE" });
}

export function fetchAdminUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>("/api/users");
}

export function fetchAdminBookings(): Promise<Booking[]> {
  return request<Booking[]>("/api/bookings");
}
