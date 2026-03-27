import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { useSimulation } from "@/hooks/useSimulation";
import Dashboard from "./pages/Dashboard";
import DigitalTwin from "./pages/DigitalTwin";
import DeviceManagement from "./pages/DeviceManagement";
import MineMap from "./pages/MineMap";
import DeviceHealth from "./pages/DeviceHealth";
import FleetManagement from "./pages/FleetManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const {
    zones, devices, workers, vehicles, alerts,
    running, toggleSimulation, toggleFan,
  } = useSimulation();

  const unackAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <AppLayout running={running} onToggleSimulation={toggleSimulation} alertCount={unackAlerts}>
      <Routes>
        <Route path="/" element={<Dashboard zones={zones} devices={devices} workers={workers} vehicles={vehicles} alerts={alerts} />} />
        <Route path="/digital-twin" element={<DigitalTwin zones={zones} onToggleFan={toggleFan} />} />
        <Route path="/devices" element={<DeviceManagement devices={devices} zones={zones} />} />
        <Route path="/map" element={<MineMap zones={zones} workers={workers} vehicles={vehicles} devices={devices} />} />
        <Route path="/health" element={<DeviceHealth devices={devices} zones={zones} />} />
        <Route path="/fleet" element={<FleetManagement vehicles={vehicles} zones={zones} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
