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
import Ventilation from "./pages/Ventilation";
import WorkerTracking from "./pages/WorkerTracking";
import AlertsSafety from "./pages/AlertsSafety";
import Energy from "./pages/Energy";
import AIPredictions from "./pages/AIPredictions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const {
    zones, devices, workers, vehicles, alerts,
    running, toggleSimulation, toggleFan, acknowledgeAlert,
  } = useSimulation();

  const unackAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <AppLayout running={running} onToggleSimulation={toggleSimulation} alertCount={unackAlerts}>
      <Routes>
        <Route path="/" element={<Dashboard zones={zones} devices={devices} workers={workers} vehicles={vehicles} alerts={alerts} />} />
        <Route path="/map" element={<MineMap zones={zones} workers={workers} vehicles={vehicles} devices={devices} />} />
        <Route path="/workers" element={<WorkerTracking workers={workers} vehicles={vehicles} zones={zones} />} />
        <Route path="/ventilation" element={<Ventilation zones={zones} onToggleFan={toggleFan} />} />
        <Route path="/alerts" element={<AlertsSafety alerts={alerts} zones={zones} onAcknowledge={acknowledgeAlert} />} />
        <Route path="/energy" element={<Energy zones={zones} />} />
        <Route path="/predictions" element={<AIPredictions zones={zones} />} />
        <Route path="/digital-twin" element={<DigitalTwin zones={zones} devices={devices} workers={workers} vehicles={vehicles} alerts={alerts} onToggleFan={toggleFan} />} />
        <Route path="/devices" element={<DeviceManagement devices={devices} zones={zones} />} />
        <Route path="/health" element={<DeviceHealth devices={devices} zones={zones} />} />
        <Route path="/fleet" element={<FleetManagement vehicles={vehicles} zones={zones} />} />
        <Route path="/reports" element={<Reports zones={zones} devices={devices} workers={workers} vehicles={vehicles} alerts={alerts} />} />
        <Route path="/settings" element={<Settings />} />
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
