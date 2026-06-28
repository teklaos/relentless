"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Space, Booking, User } from "@/data";
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
  setUnauthorizedHandler,
} from "@/lib/api";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/auth";

interface AppContextValue {
  auth: boolean;
  user: User | null;
  savedIds: Set<number>;
  savedSpaces: Space[];
  bookings: Booking[];
  detail: Space | null;
  reviewing: Booking | null;
  toast: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: {
    username: string;
    email: string;
    password: string;
    dateOfBirth: string;
  }) => Promise<void>;
  onSignOut: () => void;
  onSave: (id: number) => void;
  onBook: (params: {
    space: Space;
    startIso: string;
    endIso: string;
    total: number;
    duration: number;
  }) => void;
  onOpen: (space: Space) => void;
  onOpenById: (id: number) => void;
  onClose: () => void;
  onLeaveReview: (booking: Booking) => void;
  onCloseReview: () => void;
  onSubmitReview: (params: { rating: number; comment: string }) => void;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [savedSpaces, setSavedSpaces] = useState<Space[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [detail, setDetail] = useState<Space | null>(null);
  const [reviewing, setReviewing] = useState<Booking | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savedIds = useMemo(
    () => new Set(savedSpaces.map((s) => s.id)),
    [savedSpaces],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (getAccessToken()) setAuth(true);
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
      router.push("/explore");
    },
    [router],
  );

  const signUp = useCallback(
    async (payload: {
      username: string;
      email: string;
      password: string;
      dateOfBirth: string;
    }) => {
      const tokens = await register(payload);
      setTokens(tokens.accessToken, tokens.refreshToken);
      setAuth(true);
      router.push("/explore");
    },
    [router],
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
    [savedSpaces, showToast],
  );

  const onOpen = useCallback((space: Space) => setDetail(space), []);
  const onOpenById = useCallback(
    (id: number) => {
      fetchSpace(id)
        .then(setDetail)
        .catch(() => showToast("COULD NOT OPEN SPACE"));
    },
    [showToast],
  );
  const onClose = useCallback(() => setDetail(null), []);
  const onLeaveReview = useCallback(
    (booking: Booking) => setReviewing(booking),
    [],
  );
  const onCloseReview = useCallback(() => setReviewing(null), []);

  const onBook = useCallback(
    async ({
      space,
      startIso,
      endIso,
      duration,
    }: {
      space: Space;
      startIso: string;
      endIso: string;
      total: number;
      duration: number;
    }) => {
      try {
        await createBooking({
          spaceId: space.id,
          startTime: startIso,
          endTime: endIso,
        });
        setBookings(await fetchMyBookings());
        setDetail(null);
        showToast(`BOOKED · ${space.name} · ${duration}H`);
        setTimeout(() => router.push("/bookings"), 400);
      } catch {
        showToast("BOOKING FAILED");
      }
    },
    [showToast, router],
  );

  const onSubmitReview = useCallback(
    async ({ rating, comment }: { rating: number; comment: string }) => {
      if (!reviewing) return;
      try {
        await leaveReview({ bookingId: reviewing.id, rating, comment });
        setBookings(await fetchMyBookings());
        setReviewing(null);
        showToast(`REVIEW SUBMITTED · ${rating}★`);
      } catch {
        showToast("REVIEW FAILED");
      }
    },
    [reviewing, showToast],
  );

  return (
    <AppContext.Provider
      value={{
        auth,
        user,
        savedIds,
        savedSpaces,
        bookings,
        detail,
        reviewing,
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
        showToast,
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
