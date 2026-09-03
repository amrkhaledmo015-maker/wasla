
import { QRCode } from "react-qr-code";

// 1. USER ROLES & CORE AUTH
export type UserRole = "passenger" | "driver" | "station-manager";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  avatarUrl?: string;
  status: "active" | "pending" | "suspended";
  createdAt: string;
}

// 2. ENTITY-SPECIFIC PROFILES
export interface Passenger {
  id: string;
  userId: string;
}

export interface Driver {
  id: string;
  userId: string;
  nationalId: string;
  licenseImageUrl: string;
  verificationStatus: "pending-verification" | "verified" | "rejected" | "suspended";
}

export interface StationManager {
  id: string;
  userId: string;
  nationalId: string;
  approvalStatus: "pending" | "approved" | "rejected" | "suspended";
}

// 3. TRANSPORTATION CORE
export type StationName = "Fayoum" | "Beni Suef";

export interface Route {
  id: string;
  origin: StationName;
  destination: StationName;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  capacity: number;
  status:
    | "at-station"
    | "loading"
    | "ready-to-depart"
    | "en-route"
    | "missing"
    | "suspended";
  currentStation: StationName;
  driverId: string | null;
}

export type TripStatus =
  | "scheduled"
  | "boarding"
  | "ready-to-depart"
  | "departed"
  | "arrived"
  | "cancelled";

export interface Trip {
  id: string;
  vehicleId: string;
  routeId: string;
  departureTime: string; // ISO 8601 format
  countdownStart: string; // ISO 8601 format
  status: TripStatus;
  passengers: PassengerTripInfo[];
}

// 4. SEATING & BOOKING
export type SeatStatus =
  | "available"
  | "selected"
  | "reserved"
  | "occupied"
  | "disabled";

export interface Seat {
  id: string;
  seatNumber: number;
  status: SeatStatus;
}

export type BookingStatus =
  | "pending-payment"
  | "confirmed"
  | "cancelled"
  | "no-show"
  | "completed";

export interface Booking {
  id: string;
  bookingCode: string; // e.g., WSL-2026-000123
  passengerId: string;
  tripId: string;
  seatNumber: number;
  boardingStation: StationName;
  status: BookingStatus;
  createdAt: string;
  expiresAt: string;
}

export interface PassengerTripInfo {
  passengerId: string;
  name: string;
  seatNumber: number;
  bookingId: string;
  status: "reserved" | "arrived" | "boarded" | "no-show";
  paymentStatus: PaymentStatus;
}

// 5. FINANCIAL & TRANSACTIONS
export type PaymentMethod = "vodafone-cash" | "etisalat-cash" | "orange-cash";
export type PaymentStatus = "pending" | "submitted" | "confirmed" | "failed" | "refunded";

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  walletNumber: string;
  status: PaymentStatus;
  transactionReference?: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  bookingId: string;
  amount: number;
  status: "pending" | "processed" | "failed";
  reason: string;
  createdAt: string;
}

// 6. LOGS & NOTIFICATIONS
export type VehicleEventType =
  | "arrival"
  | "departure"
  | "loading-start"
  | "overdue-check";

export interface VehicleEvent {
  id: string;
  vehicleId: string;
  eventType: VehicleEventType;
  station: StationName;
  timestamp: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// 7. App-specific context and state
export interface AppState {
  currentUser: User | null;
  currentRole: UserRole;
  vehicles: Vehicle[];
  trips: Trip[];
  bookings: Booking[];
  users: User[];
  drivers: Driver[];
  stationManagers: StationManager[];
  payments: Payment[];
  refunds: Refund[];
  notifications: Notification[];
}

export interface AppContextType extends AppState {
  // Role switching
  setRole: (role: UserRole) => void;

  // Passenger actions
  selectSeat: (tripId: string, seatNumber: number) => void;
  createBooking: (tripId: string, seatNumber: number) => Promise<Booking>;
  cancelBooking: (bookingId: string) => void;

  // Driver actions
  updatePassengerStatus: (
    tripId: string,
    passengerId: string,
    status: "arrived" | "boarded"
  ) => void;
  departTrip: (tripId: string) => void;

  // Station Manager actions
  approveDriver: (driverId: string) => void;
  assignDriverToVehicle: (driverId: string, vehicleId: string) => void;
  updateVehicleStatus: (vehicleId: string, status: Vehicle["status"]) => void;
  approvePayment: (paymentId: string) => void;
}
