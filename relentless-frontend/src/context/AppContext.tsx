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
  registerHost,
  logout,
  editUser,
  deleteAccount,
  setUnauthorizedHandler
} from "@/lib/api";
import { getAccessToken, getRefreshToken, setTokens, clearTokens, setPendingBookingId } from "@/lib/auth";

export interface Checkout {
  spaceId: number;
  spaceName: string;
  total: number;
  duration: number;
  startIso: string;
  endIso: string;
}

export interface AuthGate {
  action: "save" | "book";
  spaceId: number;
}

const PENDING_SPACE_KEY = "relentless.pendingSpaceId";

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
  authGate: AuthGate | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: { username: string; email: string; password: string; dateOfBirth: string }) => Promise<void>;
  signUpHost: (payload: {
    username: string;
    email: string;
    password: string;
    dateOfBirth: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    iban: string;
    acceptedTerms: boolean;
  }) => Promise<void>;
  onSignOut: () => void;
  onDeleteAccount: () => Promise<void>;
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
  onCloseAuthGate: () => void;
  onAuthGateContinue: (mode: "login" | "register") => void;
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
  const [authGate, setAuthGate] = useState<AuthGate | null>(null);
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

  const resumePendingSpace = useCallback(() => {
    const id = sessionStorage.getItem(PENDING_SPACE_KEY);
    if (!id) return;
    sessionStorage.removeItem(PENDING_SPACE_KEY);
    fetchSpace(Number(id))
      .then(setDetail)
      .catch(() => {});
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const tokens = await login({ email, password });
      setTokens(tokens.accessToken, tokens.refreshToken);
      setAuth(true);
      try {
        const me = await fetchMe();
        setUser(me);
        if (me.role === "HOST") {
          sessionStorage.removeItem(PENDING_SPACE_KEY);
          router.push("/dashboard");
        } else {
          router.push("/explore");
          resumePendingSpace();
        }
      } catch {
        router.push("/explore");
        resumePendingSpace();
      }
    },
    [router, resumePendingSpace]
  );

  const signUp = useCallback(
    async (payload: { username: string; email: string; password: string; dateOfBirth: string }) => {
      const tokens = await register(payload);
      setTokens(tokens.accessToken, tokens.refreshToken);
      setAuth(true);
      router.push("/explore");
      resumePendingSpace();
    },
    [router, resumePendingSpace]
  );

  const signUpHost = useCallback(
    async (payload: {
      username: string;
      email: string;
      password: string;
      dateOfBirth: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      iban: string;
      acceptedTerms: boolean;
    }) => {
      const tokens = await registerHost(payload);
      setTokens(tokens.accessToken, tokens.refreshToken);
      setAuth(true);
      try {
        setUser(await fetchMe());
      } catch {
        // best-effort refresh; user stays authed either way
      }
      router.push("/dashboard");
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

  const onDeleteAccount = useCallback(async () => {
    await deleteAccount();
    onSignOut();
  }, [onSignOut]);

  const onSave = useCallback(
    async (id: number) => {
      if (!auth) {
        setAuthGate({ action: "save", spaceId: id });
        return;
      }
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
        showToast("COULD NOT SAVE");
      }
    },
    [auth, savedSpaces, showToast]
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
      if (!auth) {
        setAuthGate({ action: "book", spaceId: space.id });
        return;
      }
      setCheckout({ spaceId: space.id, spaceName: space.name, total, duration, startIso, endIso });
    },
    [auth]
  );

  const onCloseCheckout = useCallback(() => setCheckout(null), []);

  const onCloseAuthGate = useCallback(() => setAuthGate(null), []);

  const onAuthGateContinue = useCallback(
    (mode: "login" | "register") => {
      if (authGate?.action === "book") {
        sessionStorage.setItem(PENDING_SPACE_KEY, String(authGate.spaceId));
      }
      setAuthGate(null);
      router.push(mode === "login" ? "/login" : "/register");
    },
    [authGate, router]
  );

  const onProceedPayment = useCallback(async () => {
    if (!checkout) return;
    try {
      const booking = await createBooking({
        spaceId: checkout.spaceId,
        startTime: checkout.startIso,
        endTime: checkout.endIso
      });
      setPendingBookingId(booking.id);
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
      const updated = await editUser(payload);
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
        authGate,
        signIn,
        signUp,
        signUpHost,
        onSignOut,
        onDeleteAccount,
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
        onCloseAuthGate,
        onAuthGateContinue,
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
