import { useState, useEffect } from "react";
import {
  users as seedUsers,
  drivers as seedDrivers,
  stationManagers as seedStationManagers,
  vehicles as seedVehicles,
  trips as seedTrips,
  bookings as seedBookings,
  payments as seedPayments,
  routes as seedRoutes,
  generateSeats,
} from "../data/seed";
import {
  User,
  UserRole,
  Vehicle,
  Trip,
  Booking,
  Payment,
  Seat,
  PassengerTripInfo,
  BookingStatus,
  PaymentStatus,
  TripStatus,
  PaymentMethod,
} from "./types";
import { produce } from "immer";
import { addMinutes, isAfter } from "date-fns";

// --- SIMULATED DATABASE ---
let db = {
  users: seedUsers,
  drivers: seedDrivers,
  stationManagers: seedStationManagers,
  vehicles: seedVehicles,
  trips: seedTrips,
  bookings: seedBookings,
  payments: seedPayments,
  routes: seedRoutes,
};

// --- API Abstraction ---
// This simulates a backend API, allowing us to swap it with a real one later.
export const api = {
  // READ operations
  getUsers: async () => [...db.users],
  getVehicles: async () => [...db.vehicles],
  getTrips: async () => {
    // In a real app, this would be a JOIN query.
    // Here, we'll enrich the trip data.
    return db.trips.map((trip) => {
      const vehicle = db.vehicles.find((v) => v.id === trip.vehicleId);
      const route = db.routes.find((r) => r.id === trip.routeId);
      const driver = db.drivers.find((d) => d.id === vehicle?.driverId);
      const driverUser = db.users.find((u) => u.id === driver?.userId);

      return {
        ...trip,
        vehicleNumber: vehicle?.vehicleNumber || "N/A",
        capacity: vehicle?.capacity || 0,
        origin: route?.origin || "N/A",
        destination: route?.destination || "N/A",
        driverName: driverUser?.name || "Unassigned",
      };
    });
  },
  getTripById: async (tripId: string) => {
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const vehicle = db.vehicles.find((v) => v.id === trip.vehicleId);
    const route = db.routes.find((r) => r.id === trip.routeId);
    const driver = db.drivers.find((d) => d.id === vehicle?.driverId);
    const driverUser = db.users.find((u) => u.id === driver?.userId);

    const seats = generateSeats(vehicle?.capacity || 14);
    trip.passengers.forEach((p) => {
      const seat = seats.find((s) => s.seatNumber === p.seatNumber);
      if (seat) {
        seat.status = "occupied";
      }
    });

    return {
      ...trip,
      vehicleNumber: vehicle?.vehicleNumber || "N/A",
      capacity: vehicle?.capacity || 0,
      origin: route?.origin || "N/A",
      destination: route?.destination || "N/A",
      driverName: driverUser?.name || "Unassigned",
      seats,
    };
  },
  getBookingsForUser: async (userId: string) => {
    const passenger = db.users.find(u => u.id === userId);
    if (!passenger) return [];
    return db.bookings.filter((b) => b.passengerId === passenger.id);
  },

  // WRITE operations
  createBooking: async (
    tripId: string,
    seatNumber: number,
    passengerId: string
  ): Promise<{ booking: Booking; payment: Payment } | { error: string }> => {
    const trip = db.trips.find((t) => t.id === tripId);
    const passenger = db.users.find((u) => u.id === passengerId);

    if (!trip || !passenger) {
      return { error: "Trip or passenger not found." };
    }
    if (trip.passengers.length >= (db.vehicles.find(v => v.id === trip.vehicleId)?.capacity || 14)) {
      return { error: "Vehicle is full." };
    }
    if (trip.passengers.some((p) => p.seatNumber === seatNumber)) {
      return { error: "Seat is already taken." };
    }

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      bookingCode: `WSL-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`,
      passengerId: passenger.id,
      tripId,
      seatNumber,
      boardingStation: db.routes.find(r => r.id === trip.routeId)!.origin,
      status: "pending-payment",
      createdAt: new Date().toISOString(),
      expiresAt: addMinutes(new Date(), 15).toISOString(), // 15 minutes to pay
    };

    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      bookingId: newBooking.id,
      method: "vodafone-cash", // Default, user can change
      amount: 50, // Example price
      walletNumber: "", // To be filled by user
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    db = produce(db, (draft) => {
      draft.bookings.push(newBooking);
      draft.payments.push(newPayment);
    });

    return { booking: newBooking, payment: newPayment };
  },

  submitPayment: async (
    paymentId: string,
    method: PaymentMethod,
    walletNumber: string
  ): Promise<{ payment: Payment } | { error: string }> => {
    let updatedPayment: Payment | undefined;
    db = produce(db, (draft) => {
      const payment = draft.payments.find((p) => p.id === paymentId);
      if (payment) {
        payment.status = "submitted";
        payment.method = method;
        payment.walletNumber = walletNumber;
        updatedPayment = payment;
      }
    });

    if (updatedPayment) {
      // In a real app, this would be followed by a webhook from the payment provider.
      // For now, we'll simulate the station manager approving it.
      return { payment: updatedPayment };
    }
    return { error: "Payment not found." };
  },

  // Station Manager actions
  approvePayment: async (paymentId: string): Promise<{ booking: Booking, trip: Trip } | { error: string }> => {
    let bookingToUpdate: Booking | undefined;
    let tripToUpdate: Trip | undefined;

    db = produce(db, (draft) => {
        const payment = draft.payments.find(p => p.id === paymentId);
        if (!payment || payment.status !== 'submitted') {
            // error handled outside by returning undefined
            return;
        }
        payment.status = 'confirmed';

        const booking = draft.bookings.find(b => b.id === payment.bookingId);
        if (!booking) return;
        booking.status = 'confirmed';
        bookingToUpdate = booking;

        const trip = draft.trips.find(t => t.id === booking.tripId);
        if (!trip) return;

        const passenger = db.users.find(u => u.id === booking.passengerId);
        if (!passenger) return;

        const passengerInfo: PassengerTripInfo = {
            passengerId: passenger.id,
            name: passenger.name,
            seatNumber: booking.seatNumber,
            bookingId: booking.id,
            status: 'reserved',
            paymentStatus: 'confirmed',
        };
        trip.passengers.push(passengerInfo);
        tripToUpdate = trip;
    });

    if (bookingToUpdate && tripToUpdate) {
        return { booking: bookingToUpdate, trip: tripToUpdate };
    }
    return { error: "Could not approve payment." };
  },

  // Driver actions
  updatePassengerStatus: async (
    tripId: string,
    bookingId: string,
    status: "arrived" | "boarded"
  ): Promise<{ trip: Trip } | { error: string }> => {
    let updatedTrip: Trip | undefined;
    db = produce(db, (draft) => {
      const trip = draft.trips.find((t) => t.id === tripId);
      if (trip) {
        const passenger = trip.passengers.find((p) => p.bookingId === bookingId);
        if (passenger) {
          passenger.status = status;
          updatedTrip = trip;
        }
      }
    });
    if (updatedTrip) {
      return { trip: updatedTrip };
    }
    return { error: "Trip or passenger not found." };
  },
};

// --- React Hook for using the API ---
export function useWasla(currentUser: User | null) {
  const [state, setState] = useState({
    users: [] as User[],
    vehicles: [] as Vehicle[],
    trips: [] as any[],
    bookings: [] as Booking[],
    isLoading: true,
  });

  const refreshData = async () => {
    setState((s) => ({ ...s, isLoading: true }));
    const [users, vehicles, trips] = await Promise.all([
      api.getUsers(),
      api.getVehicles(),
      api.getTrips(),
    ]);
    
    let bookings: Booking[] = [];
    if (currentUser) {
        bookings = await api.getBookingsForUser(currentUser.id);
    }

    setState({ users, vehicles, trips, bookings, isLoading: false });
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Periodically check for trip status changes (e.g., countdowns)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let needsUpdate = false;
      const newDb = produce(db, draft => {
          draft.trips.forEach(trip => {
              const departureTime = new Date(trip.departureTime);
              if (trip.status === 'boarding' && isAfter(now, departureTime)) {
                  trip.status = 'ready-to-depart';
                  needsUpdate = true;
              }
          });
      });
      if (needsUpdate) {
          db = newDb;
          refreshData();
      }
    }, 1000); // Check every second
    return () => clearInterval(interval);
  }, []);

  return { ...state, refreshData };
}
