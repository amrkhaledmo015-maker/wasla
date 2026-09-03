
import React, { useState, createContext, useContext, useMemo } from "react";
import { User, UserRole, AppState, AppContextType } from "./types";
import { users } from "../data/seed";
import { api } from "./api"; // Assuming api is in the same directory

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>("passenger");
  
  // Simulate a logged-in user based on the selected role
  const currentUser = useMemo(() => {
    return users.find(u => u.role === currentRole) || null;
  }, [currentRole]);

  // The state from our mock API hook
  const { users: allUsers, vehicles, trips, bookings, isLoading, refreshData } = useWasla(currentUser);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  // Placeholder functions for actions. These will be built out with API calls.
  const selectSeat = async (tripId: string, seatNumber: number) => {
    console.log(`Seat ${seatNumber} selected for trip ${tripId}`);
  };

  const createBooking = async (tripId: string, seatNumber: number) => {
    if (!currentUser) throw new Error("User not logged in");
    const result = await api.createBooking(tripId, seatNumber, currentUser.id);
    if ('error' in result) {
        throw new Error(result.error);
    }
    await refreshData();
    return result.booking;
  };

  const cancelBooking = async (bookingId: string) => {
    console.log(`Booking ${bookingId} cancelled`);
    // Here you would call api.cancelBooking(bookingId)
    await refreshData();
  };

  const updatePassengerStatus = async (tripId: string, passengerId: string, status: "arrived" | "boarded") => {
    await api.updatePassengerStatus(tripId, passengerId, status);
    await refreshData();
  };

  const departTrip = async (tripId: string) => {
    console.log(`Trip ${tripId} departed`);
    // Here you would call api.departTrip(tripId)
    await refreshData();
  };

  const approveDriver = async (driverId: string) => {
    console.log(`Driver ${driverId} approved`);
    // Here you would call api.approveDriver(driverId)
    await refreshData();
  };

  const assignDriverToVehicle = async (driverId: string, vehicleId: string) => {
    console.log(`Driver ${driverId} assigned to vehicle ${vehicleId}`);
    // Here you would call api.assignDriverToVehicle(driverId, vehicleId)
    await refreshData();
  };

  const updateVehicleStatus = async (vehicleId: string, status: Vehicle["status"]) => {
    console.log(`Vehicle ${vehicleId} status updated to ${status}`);
    // Here you would call api.updateVehicleStatus(vehicleId, status)
    await refreshData();
  };

  const approvePayment = async (paymentId: string) => {
    await api.approvePayment(paymentId);
    await refreshData();
  }

  const value: AppContextType = {
    currentUser,
    currentRole,
    users: allUsers,
    vehicles,
    trips,
    bookings,
    // Dummy data for now
    drivers: [], 
    stationManagers: [],
    payments: [],
    refunds: [],
    notifications: [],
    setRole,
    selectSeat,
    createBooking,
    cancelBooking,
    updatePassengerStatus,
    departTrip,
    approveDriver,
    assignDriverToVehicle,
    updateVehicleStatus,
    approvePayment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useWaslaContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useWaslaContext must be used within an AppProvider");
  }
  return context;
};

// Helper hook to avoid re-typing `useWasla` from api.ts
function useWasla(currentUser: User | null) {
    const [state, setState] = useState<Partial<AppState> & { isLoading: boolean }>({ isLoading: true });

    const refreshData = async () => {
        setState((s) => ({ ...s, isLoading: true }));
        const [users, vehicles, trips, payments] = await Promise.all([
            api.getUsers(),
            api.getVehicles(),
            api.getTrips(),
            Promise.resolve([]) // Placeholder for api.getPayments()
        ]);

        let bookings: Booking[] = [];
        if (currentUser) {
            bookings = await api.getBookingsForUser(currentUser.id);
        }

        setState({ users, vehicles, trips, bookings, payments, isLoading: false });
    };

    useEffect(() => {
        refreshData();
    }, [currentUser]);

    // Countdown simulation effect from api.ts can be moved or triggered here if needed
    useEffect(() => {
        const interval = setInterval(refreshData, 5000); // Refresh data every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return { ...state, refreshData };
}
