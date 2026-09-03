
import {
  User,
  UserRole,
  Passenger,
  Driver,
  StationManager,
  Vehicle,
  Route,
  Trip,
  Seat,
  Booking,
  Payment,
  StationName,
} from "../lib/types";
import { subMinutes, addMinutes, formatISO } from "date-fns";

const now = new Date();

// -- USERS & ROLES --
export const users: User[] = [
  {
    id: "user-pass-1",
    role: "passenger",
    email: "passenger@wasla.app",
    name: "Ahmed Mahmoud",
    avatarUrl: "/avatars/passenger.png",
    status: "active",
    createdAt: formatISO(now),
  },
  {
    id: "user-driver-1",
    role: "driver",
    email: "driver@wasla.app",
    name: "Khaled Ibrahim",
    avatarUrl: "/avatars/driver.png",
    status: "active",
    createdAt: formatISO(now),
  },
  {
    id: "user-manager-1",
    role: "station-manager",
    email: "manager@wasla.app",
    name: "Fatima Ali",
    avatarUrl: "/avatars/manager.png",
    status: "active",
    createdAt: formatISO(now),
  },
];

export const passengers: Passenger[] = [{ id: "pass-1", userId: "user-pass-1" }];

export const drivers: Driver[] = [
  {
    id: "driver-1",
    userId: "user-driver-1",
    nationalId: "29001011234567",
    licenseImageUrl: "/licenses/license-1.jpg",
    verificationStatus: "verified",
  },
];

export const stationManagers: StationManager[] = [
  {
    id: "manager-1",
    userId: "user-manager-1",
    nationalId: "28505051234567",
    approvalStatus: "approved",
  },
];

// -- ROUTES --
export const routes: Route[] = [
  {
    id: "route-fym-bns",
    origin: "Fayoum",
    destination: "Beni Suef",
    isActive: true,
  },
  {
    id: "route-bns-fym",
    origin: "Beni Suef",
    destination: "Fayoum",
    isActive: true,
  },
];

// -- VEHICLES --
export const vehicles: Vehicle[] = [
  {
    id: "vh-1",
    vehicleNumber: "فيوم-١٢٣٤",
    capacity: 14,
    status: "loading",
    currentStation: "Fayoum",
    driverId: "driver-1",
  },
  {
    id: "vh-2",
    vehicleNumber: "بني سويف-٥٦٧٨",
    capacity: 14,
    status: "at-station",
    currentStation: "Beni Suef",
    driverId: null,
  },
  {
    id: "vh-3",
    vehicleNumber: "فيوم-٩١٠١",
    capacity: 14,
    status: "en-route",
    currentStation: "Fayoum", // This means its last known station was Fayoum
    driverId: "driver-2", // Hypothetical second driver
  },
];

// -- TRIPS & BOOKINGS --
// Let's create one active trip for vh-1
const trip1Departure = addMinutes(now, 25);
const trip1CountdownStart = subMinutes(now, 5);

export const trips: Trip[] = [
  {
    id: "trip-1",
    vehicleId: "vh-1",
    routeId: "route-fym-bns",
    departureTime: formatISO(trip1Departure),
    countdownStart: formatISO(trip1CountdownStart),
    status: "boarding",
    passengers: [
      {
        passengerId: "pass-prebooked-1",
        name: "Salma Adel",
        seatNumber: 3,
        bookingId: "booking-1",
        status: "arrived",
        paymentStatus: "confirmed",
      },
      {
        passengerId: "pass-prebooked-2",
        name: "Youssef Omar",
        seatNumber: 4,
        bookingId: "booking-2",
        status: "boarded",
        paymentStatus: "confirmed",
      },
      {
        passengerId: "pass-prebooked-3",
        name: "Hassan Tarek",
        seatNumber: 8,
        bookingId: "booking-3",
        status: "reserved",
        paymentStatus: "pending",
      },
    ],
  },
  {
    id: "trip-2",
    vehicleId: "vh-2",
    routeId: "route-bns-fym",
    departureTime: formatISO(addMinutes(now, 45)),
    countdownStart: formatISO(now),
    status: "scheduled",
    passengers: [],
  },
];

export const bookings: Booking[] = [
  {
    id: "booking-1",
    bookingCode: "WSL-2026-000123",
    passengerId: "pass-prebooked-1",
    tripId: "trip-1",
    seatNumber: 3,
    boardingStation: "Fayoum",
    status: "confirmed",
    createdAt: formatISO(subMinutes(now, 10)),
    expiresAt: formatISO(addMinutes(now, 20)),
  },
  {
    id: "booking-2",
    bookingCode: "WSL-2026-000124",
    passengerId: "pass-prebooked-2",
    tripId: "trip-1",
    seatNumber: 4,
    boardingStation: "Fayoum",
    status: "confirmed",
    createdAt: formatISO(subMinutes(now, 8)),
    expiresAt: formatISO(addMinutes(now, 22)),
  },
  {
    id: "booking-3",
    bookingCode: "WSL-2026-000125",
    passengerId: "pass-prebooked-3",
    tripId: "trip-1",
    seatNumber: 8,
    boardingStation: "Fayoum",
    status: "pending-payment",
    createdAt: formatISO(subMinutes(now, 2)),
    expiresAt: formatISO(addMinutes(now, 28)),
  },
];

export const payments: Payment[] = [
  {
    id: "payment-1",
    bookingId: "booking-1",
    method: "vodafone-cash",
    amount: 50,
    walletNumber: "01012345678",
    status: "confirmed",
    transactionReference: "VFCASH_XYZ123",
    createdAt: formatISO(subMinutes(now, 9)),
  },
  {
    id: "payment-2",
    bookingId: "booking-2",
    method: "orange-cash",
    amount: 50,
    walletNumber: "01212345678",
    status: "confirmed",
    transactionReference: "ORGCASH_ABC456",
    createdAt: formatISO(subMinutes(now, 7)),
  },
  {
    id: "payment-3",
    bookingId: "booking-3",
    method: "etisalat-cash",
    amount: 50,
    walletNumber: "01112345678",
    status: "pending",
    createdAt: formatISO(subMinutes(now, 2)),
  },
];

// Function to generate seats for a vehicle
export const generateSeats = (capacity: number): Seat[] => {
  return Array.from({ length: capacity }, (_, i) => ({
    id: `seat-${i + 1}`,
    seatNumber: i + 1,
    status: "available",
  }));
};
