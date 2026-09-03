
import { AppProvider } from "./lib/AppContext";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { useWaslaContext } from "./lib/AppContext";
import PassengerDashboard from "./pages/PassengerDashboard";
// import DriverDashboard from "./pages/DriverDashboard";
// import StationManagerDashboard from "./pages/StationManagerDashboard";

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

function MainLayout() {
  const { currentRole, currentUser } = useWaslaContext();

  const renderDashboard = () => {
    switch (currentRole) {
      case "passenger":
        return <PassengerDashboard />;
      case "driver":
        return <div className="p-8">Driver Dashboard (Coming Soon)</div>; // <DriverDashboard />;
      case "station-manager":
        return <div className="p-8">Station Manager Dashboard (Coming Soon)</div>; // <StationManagerDashboard />;
      default:
        return <PassengerDashboard />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/wasla-logo.png" alt="Wasla Logo" className="h-12" />
            <h1 className="text-2xl font-bold text-primary hidden sm:block">وصلة | Wasla</h1>
          </div>
          <div className="flex items-center gap-4">
            <RoleSwitcher />
            {/* Auth button will go here */}
          </div>
        </div>
      </header>
      <main>
        {currentUser ? renderDashboard() : <div className="p-8">Please select a role to start.</div>}
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
