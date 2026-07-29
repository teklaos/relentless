"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Booking,
  Category,
  Review,
  Space,
  AmenitySummary,
  EditSpacePayload,
  Draft,
  HostBooking,
  WalletTransaction
} from "@/data/types";
import { blankDraft, defaultHours, hoursFromSpace } from "@/data/format";
import {
  changeSpaceStatus,
  createSpace,
  editSpace,
  fetchAmenities,
  fetchCategories,
  fetchHostedBookings,
  fetchHostedReviews,
  fetchHostedSpaces,
  fetchWalletBalance,
  fetchWalletTransactions,
  uploadImage
} from "@/lib/api";

const draftWorkingHours = (hours: Draft["hours"]) =>
  hours.filter((h) => h.on).map((h) => ({ dayOfWeek: h.dayOfWeek, openTime: h.open, closeTime: h.close }));

const pad2 = (n: number) => String(n).padStart(2, "0");

const toHostBooking = (b: Booking): HostBooking => {
  const start = new Date(b.startTime);
  const end = new Date(b.endTime);
  return {
    id: b.id,
    username: b.user.username,
    profileImageKey: b.user.profileImageKey,
    spaceId: b.space.id,
    status: b.status,
    date: b.startTime.slice(0, 10),
    start: `${pad2(start.getHours())}:${pad2(start.getMinutes())}`,
    end: `${pad2(end.getHours())}:${pad2(end.getMinutes())}`,
    totalPrice: b.totalPrice
  };
};

export type BookingTab = "upcoming" | "past";

export interface HostContextValue {
  isMobile: boolean;
  spaces: Space[];
  bookings: HostBooking[];
  reviews: Review[];
  categories: Category[];
  amenities: AmenitySummary[];
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  refreshWallet: () => void;
  draft: Draft;
  step: number;
  editingId: number | null;
  listingFilter: string;
  reviewFilter: number;
  bookingTab: BookingTab;

  space: (id: number) => Space | undefined;
  spaceName: (id: number) => string;

  setBookingTab: (t: BookingTab) => void;

  setListingFilter: (f: string) => void;
  toggleStatus: (id: number) => void;

  beginCreate: () => void;
  beginEdit: (id: number) => void;
  setDraft: (field: keyof Draft, val: string) => void;
  toggleAmenity: (a: string) => void;
  setDayHour: (index: number, key: "open" | "close", val: string) => void;
  toggleDay: (index: number) => void;
  copyDayToAll: (index: number) => void;
  addPhoto: (file: File) => Promise<void>;
  removePhotoAt: (index: number) => void;
  movePhoto: (from: number, to: number) => void;
  setStep: (n: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  publishDraft: () => void;

  setReviewFilter: (id: number) => void;
}

const HostContext = createContext<HostContextValue | null>(null);

export function HostProvider({ children }: { children: ReactNode }) {
  const { auth, showToast } = useApp();

  const [isMobile, setIsMobile] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amenities, setAmenities] = useState<AmenitySummary[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [draft, setDraftState] = useState<Draft>(blankDraft());
  const [step, setStep] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [listingFilter, setListingFilter] = useState("ALL");
  const [reviewFilter, setReviewFilter] = useState(0);
  const [bookingTab, setBookingTab] = useState<BookingTab>("upcoming");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 880px)");
    const upd = () => setIsMobile(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  const refreshWallet = useCallback(() => {
    fetchWalletBalance()
      .then((b) => setWalletBalance(b.balance))
      .catch(() => setWalletBalance(0));
    fetchWalletTransactions()
      .then(setWalletTransactions)
      .catch(() => setWalletTransactions([]));
  }, []);

  useEffect(() => {
    if (!auth) return;
    let active = true;
    refreshWallet();
    fetchHostedSpaces()
      .then((d) => active && setSpaces(d))
      .catch(() => active && setSpaces([]));
    fetchHostedBookings()
      .then((d) => active && setBookings(d.map(toHostBooking)))
      .catch(() => active && setBookings([]));
    fetchHostedReviews()
      .then((d) => active && setReviews(d))
      .catch(() => active && setReviews([]));
    fetchCategories()
      .then((d) => active && setCategories(d))
      .catch(() => {});
    fetchAmenities()
      .then((d) => active && setAmenities(d))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [auth, refreshWallet]);

  const space = useCallback((id: number) => spaces.find((s) => s.id === id), [spaces]);
  const spaceName = useCallback((id: number) => space(id)?.name ?? "—", [space]);

  const toggleStatus = useCallback(
    async (id: number) => {
      const sp = spaces.find((s) => s.id === id);
      if (!sp) return;
      const next = sp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      try {
        const updated = await changeSpaceStatus(id, next);
        setSpaces((sps) => sps.map((s) => (s.id === id ? updated : s)));
        showToast(next === "ACTIVE" ? "LISTING VISIBLE" : "LISTING HIDDEN");
      } catch {
        showToast("COULD NOT UPDATE STATUS");
      }
    },
    [spaces, showToast]
  );

  const beginCreate = useCallback(() => {
    setEditingId(null);
    setStep(0);
    setDraftState(blankDraft());
  }, []);

  const beginEdit = useCallback(
    (id: number) => {
      const sp = spaces.find((s) => s.id === id);
      setEditingId(id);
      setStep(0);
      if (!sp) {
        setDraftState(blankDraft());
        return;
      }
      setDraftState({
        name: sp.name,
        category: sp.category.name,
        description: sp.description,
        street: sp.address.street,
        streetNumber: sp.address.streetNumber,
        apt: sp.address.apartmentNumber,
        city: sp.address.city,
        postalCode: sp.address.postalCode,
        country: sp.address.country,
        price: String(sp.pricePerHour),
        hours: sp.workingHours?.length ? hoursFromSpace(sp.workingHours) : defaultHours(),
        amenities: sp.amenities.map((a) => a.name),
        photos: sp.imageKeys ?? []
      });
    },
    [spaces]
  );

  const setDraft = useCallback((field: keyof Draft, val: string) => setDraftState((d) => ({ ...d, [field]: val })), []);
  const toggleAmenity = useCallback(
    (a: string) =>
      setDraftState((d) => ({
        ...d,
        amenities: d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a]
      })),
    []
  );
  const setDayHour = useCallback(
    (index: number, key: "open" | "close", val: string) =>
      setDraftState((d) => ({
        ...d,
        hours: d.hours.map((h, i) => {
          if (i !== index) return h;
          const next = { ...h, [key]: val };
          if (key === "open") {
            const [oh, om] = val.split(":").map(Number);
            const [ch, cm] = next.close.split(":").map(Number);
            const openMin = oh * 60 + om;
            const closeMin = ch * 60 + cm || 1440;
            if (closeMin < openMin + 30) {
              const end = openMin + 30;
              next.close = `${String(Math.floor((end % 1440) / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
            }
          }
          return next;
        })
      })),
    []
  );
  const toggleDay = useCallback(
    (index: number) =>
      setDraftState((d) => ({
        ...d,
        hours: d.hours.map((h, i) => (i === index ? { ...h, on: !h.on } : h))
      })),
    []
  );
  const copyDayToAll = useCallback(
    (index: number) =>
      setDraftState((d) => {
        const src = d.hours[index];
        return { ...d, hours: d.hours.map((h) => ({ ...h, open: src.open, close: src.close, on: true })) };
      }),
    []
  );
  const addPhoto = useCallback(
    async (file: File) => {
      if (draft.photos.length >= 6) return;
      try {
        const key = await uploadImage(file);
        setDraftState((d) => (d.photos.length >= 6 ? d : { ...d, photos: [...d.photos, key] }));
      } catch {
        showToast("PHOTO UPLOAD FAILED");
      }
    },
    [draft.photos.length, showToast]
  );
  const removePhotoAt = useCallback(
    (index: number) =>
      setDraftState((d) => ({
        ...d,
        photos: d.photos.filter((_, i) => i !== index)
      })),
    []
  );
  const movePhoto = useCallback(
    (from: number, to: number) =>
      setDraftState((d) => {
        if (from === to) return d;
        const photos = [...d.photos];
        const [moved] = photos.splice(from, 1);
        photos.splice(to, 0, moved);
        return { ...d, photos };
      }),
    []
  );
  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 6)), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const publishDraft = useCallback(async () => {
    const d = draft;
    const categoryId = categories.find((c) => c.name.toLowerCase() === d.category.toLowerCase())?.id;
    const amenityIds = d.amenities
      .map((n) => amenities.find((a) => a.name.toLowerCase() === n.toLowerCase())?.id)
      .filter((x): x is number => x != null);
    const address = {
      street: d.street,
      streetNumber: d.streetNumber,
      apartmentNumber: d.apt || undefined,
      postalCode: d.postalCode,
      city: d.city,
      country: d.country
    };

    try {
      if (editingId) {
        const payload: EditSpacePayload = {
          name: d.name || undefined,
          description: d.description || undefined,
          address,
          pricePerHour: d.price ? Number(d.price) : undefined,
          workingHours: draftWorkingHours(d.hours),
          imageKeys: d.photos,
          categoryId,
          amenityIds
        };
        const updated = await editSpace(editingId, payload);
        setSpaces((sps) => sps.map((s) => (s.id === editingId ? updated : s)));
        setEditingId(null);
        showToast("LISTING UPDATED");
        return;
      }
      if (categoryId == null) {
        showToast("PICK A VALID CATEGORY");
        return;
      }
      const created = await createSpace({
        name: d.name || "UNTITLED SPACE",
        description: d.description || undefined,
        address,
        pricePerHour: Number(d.price) || 0,
        workingHours: draftWorkingHours(d.hours),
        imageKeys: d.photos,
        categoryId,
        amenityIds
      });
      setSpaces((sps) => [created, ...sps]);
      setListingFilter("ALL");
      showToast("LISTING PUBLISHED — NOW LIVE");
    } catch {
      showToast("COULD NOT SAVE LISTING");
    }
  }, [draft, editingId, categories, amenities, showToast]);

  const value = useMemo<HostContextValue>(
    () => ({
      isMobile,
      spaces,
      bookings,
      reviews,
      categories,
      amenities,
      walletBalance,
      walletTransactions,
      refreshWallet,
      draft,
      step,
      editingId,
      listingFilter,
      reviewFilter,
      bookingTab,
      space,
      spaceName,
      setBookingTab,
      setListingFilter,
      toggleStatus,
      beginCreate,
      beginEdit,
      setDraft,
      toggleAmenity,
      setDayHour,
      toggleDay,
      copyDayToAll,
      addPhoto,
      removePhotoAt,
      movePhoto,
      setStep,
      nextStep,
      prevStep,
      publishDraft,
      setReviewFilter
    }),
    [
      isMobile,
      spaces,
      bookings,
      reviews,
      categories,
      amenities,
      walletBalance,
      walletTransactions,
      refreshWallet,
      draft,
      step,
      editingId,
      listingFilter,
      reviewFilter,
      bookingTab,
      space,
      spaceName,
      toggleStatus,
      beginCreate,
      beginEdit,
      setDraft,
      toggleAmenity,
      setDayHour,
      toggleDay,
      copyDayToAll,
      addPhoto,
      removePhotoAt,
      movePhoto,
      nextStep,
      prevStep,
      publishDraft
    ]
  );

  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
}

export function useHost() {
  const ctx = useContext(HostContext);
  if (!ctx) throw new Error("useHost must be used within HostProvider");
  return ctx;
}
