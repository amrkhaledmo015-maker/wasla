
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppProvider } from "./lib/AppContext";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { Notifications } from "./components/Notifications";
import { useWaslaContext } from "./lib/AppContext";
import PassengerDashboard from "./pages/PassengerDashboard";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import PaymentPage from "./pages/PaymentPage";
import DriverDashboard from "./pages/DriverDashboard";
import StationManagerDashboard from "./pages/StationManagerDashboard";

function App() {
  return (
    <AppProvider>
      <Router>
        <MainLayout />
      </Router>
    </AppProvider>
  );
}

function MainLayout() {
  const { currentRole, currentUser } = useWaslaContext();

  const renderDashboard = () => {
    switch (currentRole) {
      case "passenger":
        return (
          <Routes>
            <Route path="/" element={<PassengerDashboard />} />
            <Route path="/trip/:tripId" element={<SeatSelectionPage />} />
            <Route path="/payment/:bookingId/:paymentId" element={<PaymentPage />} />
            <Route path="/booking/:bookingId" element={<BookingConfirmationPage />} />
          </Routes>
        );
      case "driver":
        return <DriverDashboard />;
      case "station-manager":
        return <StationManagerDashboard />;
      default:
        return <div className="p-8 text-center">الرجاء اختيار دور للبدء.</div>;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-6">
              <img src="/wasla-logo.png" alt="Wasla Logo" className="h-12" />
              <h1 className="text-2xl font-bold text-primary hidden sm:block">وصلة | Wasla</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Notifications />
            <RoleSwitcher />
            {/* Auth button will go here */}
          </div>
        </div>
      </header>
      <main className="flex-1">
        {currentUser ? renderDashboard() : <div className="p-8 text-center">الرجاء اختيار دور للبدء.</div>}
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background/95 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by Amr KH.Gebba. The source code is available on GitHub.
            </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
