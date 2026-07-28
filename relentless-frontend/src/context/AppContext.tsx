"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Space, Booking, User, UpdateUserPayload } from "@/data/types";
import {
  fetchMe,
  fetchMyBookings,
  fetchSavedSpaces,
  fetchSpace,
  createBooking,
  leaveReview,
  saveSpace,
  unsaveSpace,
  login,
  register,
  logout,
  updateUser,
  setUnauthorizedHandler
} from "@/lib/api";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth";

export interface Checkout {
  spaceId: number;
  spaceName: string;
  total: number;
  duration: number;
  startIso: string;
  endIso: string;
}

interface AppContextValue {
  auth: boolean;
  authReady: boolean;
  user: User | null;
  savedIds: Set<number>;
  savedSpaces: Space[];
  bookings: Booking[];
  detail: Space | null;
  reviewing: Booking | null;
  checkout: Checkout | null;
  toast: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: { username: string; email: string; password: string; dateOfBirth: string }) => Promise<void>;
  onSignOut: () => void;
  onSave: (id: number) => void;
  onBook: (params: { space: Space; startIso: string; endIso: string; total: number; duration: number }) => void;
  onOpen: (space: Space) => void;
  onOpenById: (id: number) => void;
  onClose: () => void;
  onLeaveReview: (booking: Booking) => void;
  onCloseReview: () => void;
  onSubmitReview: (params: { rating: number; comment: string }) => void;
  onUpdateProfile: (payload: UpdateUserPayload) => Promise<void>;
  onCloseCheckout: () => void;
  onProceedPayment: () => void;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [savedSpaces, setSavedSpaces] = useState<Space[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [detail, setDetail] = useState<Space | null>(null);
  const [reviewing, setReviewing] = useState<Booking | null>(null);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savedIds = useMemo(() => new Set(savedSpaces.map((s) => s.id)), [savedSpaces]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (getAccessToken()) setAuth(true);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearTokens();
      setAuth(false);
      setUser(null);
      setBookings([]);
      setSavedSpaces([]);
      setDetail(null);
      router.push("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    if (!auth) return;
    let active = true;
    fetchMe()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null));
    fetchMyBookings()
      .then((b) => active && setBookings(b))
      .catch(() => active && setBookings([]));
    fetchSavedSpaces()
      .then((s) => active && setSavedSpaces(s))
      .catch(() => active && setSavedSpaces([]));
    return () => {
      active = false;
    };
  }, [auth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const tokens = await login({ email, password });
      setTokens(tokens.accessToken, tokens.refreshToken);
      setAuth(true);
      try {
        const me = await fetchMe();
        setUser(me);
        router.push(me.role === "HOST" ? "/dashboard" : "/explore");
      } catch {
        router.push("/explore");
      }
    },
    [router]
  );

  const signUp = useCallback(
    async (payload: { username: string; email: string; password: string; dateOfBirth: string }) => {
      const tokens = await register(payload);
      setTokens(tokens.accessToken, tokens.refreshToken);
      setAuth(true);
      router.push("/explore");
    },
    [router]
  );

  const onSignOut = useCallback(() => {
    const refreshToken = getRefreshToken();
    if (refreshToken) logout(refreshToken);
    clearTokens();
    setAuth(false);
    setDetail(null);
    setUser(null);
    setBookings([]);
    setSavedSpaces([]);
    router.push("/login");
  }, [router]);

  const onSave = useCallback(
    async (id: number) => {
      const wasSaved = savedSpaces.some((s) => s.id === id);
      try {
        if (wasSaved) {
          await unsaveSpace(id);
          showToast("REMOVED FROM SAVED");
        } else {
          await saveSpace(id);
          showToast("ADDED TO SAVED");
        }
        setSavedSpaces(await fetchSavedSpaces());
      } catch {
        showToast("COULD NOT UPDATE SAVED");
      }
    },
    [savedSpaces, showToast]
  );

  const onOpen = useCallback((space: Space) => setDetail(space), []);
  const onOpenById = useCallback(
    (id: number) => {
      fetchSpace(id)
        .then(setDetail)
        .catch(() => showToast("COULD NOT OPEN SPACE"));
    },
    [showToast]
  );
  const onClose = useCallback(() => setDetail(null), []);
  const onLeaveReview = useCallback((booking: Booking) => setReviewing(booking), []);
  const onCloseReview = useCallback(() => setReviewing(null), []);

  const onBook = useCallback(
    ({
      space,
      startIso,
      endIso,
      total,
      duration
    }: {
      space: Space;
      startIso: string;
      endIso: string;
      total: number;
      duration: number;
    }) => {
      setCheckout({ spaceId: space.id, spaceName: space.name, total, duration, startIso, endIso });
    },
    []
  );

  const onCloseCheckout = useCallback(() => setCheckout(null), []);

  const onProceedPayment = useCallback(async () => {
    if (!checkout) return;
    try {
      const booking = await createBooking({
        spaceId: checkout.spaceId,
        startTime: checkout.startIso,
        endTime: checkout.endIso
      });
      localStorage.setItem("pendingBookingId", String(booking.id));
      window.location.href = booking.checkoutSessionUrl;
    } catch {
      showToast("BOOKING FAILED");
      setCheckout(null);
    }
  }, [checkout, showToast]);

  const onSubmitReview = useCallback(
    async ({ rating, comment }: { rating: number; comment: string }) => {
      if (!reviewing) return;
      try {
        await leaveReview({ bookingId: reviewing.id, rating, comment });
        setBookings(await fetchMyBookings());
        setReviewing(null);
        showToast(`REVIEW SUBMITTED - ${rating}★`);
      } catch {
        showToast("REVIEW FAILED");
      }
    },
    [reviewing, showToast]
  );

  const onUpdateProfile = useCallback(
    async (payload: UpdateUserPayload) => {
      if (!user) return;
      const updated = await updateUser(user.id, payload);
      setUser(updated);
      showToast("PROFILE UPDATED");
    },
    [user, showToast]
  );

  return (
    <AppContext.Provider
      value={{
        auth,
        authReady,
        user,
        savedIds,
        savedSpaces,
        bookings,
        detail,
        reviewing,
        checkout,
        toast,
        signIn,
        signUp,
        onSignOut,
        onSave,
        onBook,
        onOpen,
        onOpenById,
        onClose,
        onLeaveReview,
        onCloseReview,
        onSubmitReview,
        onUpdateProfile,
        onCloseCheckout,
        onProceedPayment,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
