
import React, { useState, createContext, useContext, useMemo, useEffect } from "react";
import { User, UserRole, AppState, AppContextType, Vehicle } from "./types";
import { users } from "../data/seed";
import { api } from "./api"; // Assuming api is in the same directory

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>("passenger");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start as not authenticated
  
  const currentUser = useMemo(() => {
    return users.find(u => u.role === currentRole) || null;
  }, [currentRole]);

  const { users: allUsers, vehicles, trips, bookings, payments, drivers, notifications, isLoading, refreshData } = useWasla(currentUser, isAuthenticated);

  const login = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRole("passenger");
  };

  const setRole = (role: UserRole) => {
      setCurrentRole(role);
  };

  const createBooking = async (tripId: string, seatNumber: number) => {
      if (!currentUser) throw new Error("User not logged in");
      const result = await api.createBooking(tripId, seatNumber, currentUser.id);
      if ('error' in result) {
          throw new Error(result.error);
      }
      await refreshData();
      return result;
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
      await api.cancelBooking(bookingId, reason);
      await refreshData();
  };

  const updatePassengerStatus = async (tripId: string, bookingId: string, status: "arrived" | "boarded") => {
      await api.updatePassengerStatus(tripId, bookingId, status);
      await refreshData();
  };

  const departTrip = async (tripId: string) => {
      console.log(`Trip ${tripId} departed`);
      await refreshData();
  };

  const approveDriver = async (driverId: string, isApproved: boolean) => {
      await api.approveDriver(driverId, isApproved);
      await refreshData();
  };

  const assignDriverToVehicle = async (driverId: string, vehicleId: string) => {
      await api.assignDriverToVehicle(driverId, vehicleId);
      await refreshData();
  };

  const updateVehicleStatus = async (vehicleId: string, status: Vehicle["status"]) => {
      console.log(`Vehicle ${vehicleId} status updated to ${status}`);
      await refreshData();
  };

  const approvePayment = async (paymentId: string) => {
      await api.approvePayment(paymentId);
      await refreshData();
  }

  const value: AppContextType = {
      currentUser,
      currentRole,
      isAuthenticated,
      login,
      logout,
      users: allUsers || [],
      vehicles: vehicles || [],
      trips: trips || [],
      bookings: bookings || [],
      payments: payments || [],
      drivers: drivers || [],
      notifications: notifications || [],
      isLoading: isLoading || false,
      stationManagers: [],
      refunds: [],
      setRole,
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

function useWasla(currentUser: User | null, isAuthenticated: boolean) {
    const [state, setState] = useState<Partial<AppState> & { isLoading: boolean }>({
        users: [], vehicles: [], trips: [], bookings: [], payments: [], drivers: [], notifications: [], isLoading: true
    });

    const refreshData = async () => {
        if (!isAuthenticated) {
            setState({ users: [], vehicles: [], trips: [], bookings: [], payments: [], drivers: [], notifications: [], isLoading: false });
            return;
        }
        setState((s) => ({ ...s, isLoading: true }));
        const [users, vehicles, trips, payments, bookings, drivers, notifications] = await Promise.all([
            api.getUsers(),
            api.getVehicles(),
            api.getTrips(),
            api.getPayments(),
            currentUser ? api.getBookingsForUser(currentUser.id) : Promise.resolve([]),
            api.getDrivers(),
            api.getNotifications(),
        ]);

        setState({ users, vehicles, trips, bookings, payments, drivers, notifications, isLoading: false });
    };

    useEffect(() => {
        refreshData();
        let interval: NodeJS.Timeout | undefined;
        if (isAuthenticated) {
            interval = setInterval(refreshData, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [currentUser, isAuthenticated]);

    return { ...state, refreshData };
}
