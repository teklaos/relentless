export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  user: UserSummary;
  space: SpaceSummary;
  reviewed: boolean;
}

export interface BookingCheckout extends Booking {
  checkoutSessionUrl: string;
}

export interface WalletBalance {
  balance: number;
}

export interface WalletTransaction {
  id: number;
  amount: number;
  type: "CREDIT" | "DEBIT";
  createdAt: string;
  bookingId: number | null;
  space: SpaceSummary | null;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  dateOfBirth?: string;
  profileImageKey?: string;
}

export type SpaceStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export interface Space {
  id: number;
  name: string;
  description: string;
  address: SpaceAddress;
  pricePerHour: number;
  status: SpaceStatus;
  rating: number;
  reviewCount: number;
  imageKeys: string[];
  host: UserSummary;
  category: CategorySummary;
  amenities: AmenitySummary[];
  workingHours: WorkingHoursPayload[];
}

export interface SpaceAddress {
  street: string;
  streetNumber: string;
  apartmentNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface SpaceSummary {
  id: number;
  name: string;
  city: string;
  country: string;
  categoryName: string;
  coverImageKey: string | null;
}

export interface AmenitySummary {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CategorySummary {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  dateOfBirth: string;
  dateJoined: string;
  profileImageKey: string | null;
  role: "HOST" | "GUEST";
}

export interface UserSummary {
  id: number;
  username: string;
  profileImageKey: string | null;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: UserSummary;
  space: SpaceSummary;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AddressPayload {
  street: string;
  streetNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface CreateSpacePayload {
  name: string;
  description?: string;
  address: AddressPayload;
  pricePerHour: number;
  workingHours: WorkingHoursPayload[];
  imageKeys?: string[];
  categoryId: number;
  amenityIds?: number[];
}

export interface EditSpacePayload {
  name?: string;
  description?: string;
  address?: AddressPayload;
  pricePerHour?: number;
  workingHours?: WorkingHoursPayload[];
  imageKeys?: string[];
  categoryId?: number;
  amenityIds?: number[];
}

export interface WorkingHoursPayload {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
}

export interface Draft {
  name: string;
  category: string;
  description: string;
  street: string;
  streetNumber: string;
  apt: string;
  city: string;
  postalCode: string;
  country: string;
  price: string;
  hours: DayHours[];
  amenities: string[];
  photos: string[];
}

export interface DayHours {
  dayOfWeek: string;
  open: string;
  close: string;
  on: boolean;
}
