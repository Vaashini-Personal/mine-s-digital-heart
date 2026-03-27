import { useState, useEffect, useCallback } from 'react';
import {
  Zone, Device, Worker, Vehicle, Alert,
  generateZones, generateDevices, generateWorkers, generateVehicles, generateAlerts, simulateTick
} from '@/lib/simulation';

export function useSimulation() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const z = generateZones();
    const d = generateDevices(z);
    const w = generateWorkers(z);
    const v = generateVehicles(z);
    const a = generateAlerts(z, d);
    setZones(z);
    setDevices(d);
    setWorkers(w);
    setVehicles(v);
    setAlerts(a);
  }, []);

  useEffect(() => {
    if (!running || zones.length === 0) return;
    const interval = setInterval(() => {
      setZones(prev => {
        const copy = prev.map(z => ({ ...z, gasLevels: { ...z.gasLevels } }));
        simulateTick(copy);
        return copy;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [running, zones.length]);

  const toggleSimulation = useCallback(() => setRunning(r => !r), []);

  const toggleFan = useCallback((zoneId: string) => {
    setZones(prev => prev.map(z =>
      z.id === zoneId ? { ...z, fanActive: !z.fanActive } : z
    ));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, []);

  return {
    zones, devices, workers, vehicles, alerts,
    running, toggleSimulation, toggleFan, acknowledgeAlert,
    setDevices, setZones,
  };
}
