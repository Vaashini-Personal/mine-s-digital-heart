// Mine simulation data and logic

export type RiskLevel = 'safe' | 'warning' | 'critical';

export interface GasLevels {
  CO: number;
  NO2: number;
  O2: number;
  CH4: number;
}

export interface Zone {
  id: string;
  name: string;
  level: number;
  x: number;
  y: number;
  gasLevels: GasLevels;
  temperature: number;
  airflow: number;
  airflowDirection: 'north' | 'south' | 'east' | 'west';
  workers: string[];
  vehicles: string[];
  fanActive: boolean;
  fanSpeed: number;
  riskLevel: RiskLevel;
  connected: string[];
}

export interface Device {
  id: string;
  name: string;
  type: 'gas_sensor' | 'env_sensor' | 'ble_tracker' | 'rfid_reader' | 'gateway';
  zone: string;
  status: 'active' | 'inactive' | 'fault';
  battery: number;
  lastComm: Date;
  health: 'normal' | 'fault' | 'calibration_required';
  uptime: number;
}

export interface Worker {
  id: string;
  name: string;
  zone: string;
  role: string;
  bleTag: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'loader' | 'drill';
  zone: string;
  status: 'active' | 'idle';
  speed: number;
  history: { zone: string; timestamp: Date }[];
}

export interface Alert {
  id: string;
  type: 'device_offline' | 'low_battery' | 'gas_spike' | 'sensor_fault' | 'high_temp';
  severity: RiskLevel;
  message: string;
  zone: string;
  timestamp: Date;
  acknowledged: boolean;
}

const ZONE_NAMES = [
  'Main Shaft Entry', 'Primary Tunnel A', 'Primary Tunnel B',
  'Extraction Bay 1', 'Extraction Bay 2', 'Ventilation Hub',
  'Deep Level Access', 'Ore Processing', 'Emergency Exit'
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function calcRisk(gas: GasLevels, temp: number): RiskLevel {
  if (gas.CO > 35 || gas.CH4 > 1.5 || gas.O2 < 19 || gas.NO2 > 3 || temp > 40) return 'critical';
  if (gas.CO > 20 || gas.CH4 > 0.8 || gas.O2 < 19.5 || gas.NO2 > 2 || temp > 35) return 'warning';
  return 'safe';
}

export function generateZones(): Zone[] {
  const positions = [
    [1, 0], [0, 1], [2, 1], [0, 2], [2, 2], [1, 2], [1, 3], [0, 3], [2, 3]
  ];
  const connections: Record<number, number[]> = {
    0: [1, 2], 1: [0, 3, 5], 2: [0, 4, 5], 3: [1, 5, 7],
    4: [2, 5, 8], 5: [1, 2, 3, 4, 6], 6: [5, 7, 8], 7: [3, 6], 8: [4, 6]
  };

  return ZONE_NAMES.map((name, i) => {
    const gas: GasLevels = {
      CO: rand(2, 30),
      NO2: rand(0.1, 2.5),
      O2: rand(19.5, 21),
      CH4: rand(0, 1.2),
    };
    const temp = rand(22, 38);
    return {
      id: `zone-${i}`,
      name,
      level: positions[i][1],
      x: positions[i][0],
      y: positions[i][1],
      gasLevels: gas,
      temperature: temp,
      airflow: rand(1, 8),
      airflowDirection: pick(['north', 'south', 'east', 'west'] as const),
      workers: [],
      vehicles: [],
      fanActive: Math.random() > 0.3,
      fanSpeed: randInt(40, 100),
      riskLevel: calcRisk(gas, temp),
      connected: connections[i].map(c => `zone-${c}`),
    };
  });
}

export function generateDevices(zones: Zone[]): Device[] {
  const types: Device['type'][] = ['gas_sensor', 'env_sensor', 'ble_tracker', 'rfid_reader', 'gateway'];
  const devices: Device[] = [];
  let id = 0;

  zones.forEach(zone => {
    const count = randInt(2, 5);
    for (let i = 0; i < count; i++) {
      const type = pick(types);
      const status = Math.random() > 0.85 ? (Math.random() > 0.5 ? 'fault' : 'inactive') : 'active';
      devices.push({
        id: `dev-${id++}`,
        name: `${type.replace('_', ' ').toUpperCase()} ${id}`,
        type,
        zone: zone.id,
        status,
        battery: type === 'gateway' ? 100 : randInt(10, 100),
        lastComm: new Date(Date.now() - randInt(0, 3600000)),
        health: status === 'fault' ? 'fault' : (Math.random() > 0.9 ? 'calibration_required' : 'normal'),
        uptime: rand(85, 99.9),
      });
    }
  });
  return devices;
}

export function generateWorkers(zones: Zone[]): Worker[] {
  const names = ['J. Martinez', 'A. Chen', 'R. Petrov', 'M. Singh', 'D. Okafor', 'L. Müller', 'S. Tanaka', 'K. Johansson', 'B. Ndlovu', 'F. Costa', 'H. Kim', 'P. Williams'];
  const roles = ['Operator', 'Engineer', 'Safety Inspector', 'Geologist', 'Mechanic'];
  return names.map((name, i) => {
    const zone = pick(zones);
    zone.workers.push(`worker-${i}`);
    return {
      id: `worker-${i}`,
      name,
      zone: zone.id,
      role: pick(roles),
      bleTag: `BLE-${String(i).padStart(4, '0')}`,
    };
  });
}

export function generateVehicles(zones: Zone[]): Vehicle[] {
  const vehicles: Vehicle[] = [];
  const types: Vehicle['type'][] = ['truck', 'loader', 'drill'];
  for (let i = 0; i < 6; i++) {
    const zone = pick(zones);
    const v: Vehicle = {
      id: `veh-${i}`,
      name: `${pick(types).toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
      type: pick(types),
      zone: zone.id,
      status: Math.random() > 0.3 ? 'active' : 'idle',
      speed: rand(0, 25),
      history: Array.from({ length: 5 }, (_, j) => ({
        zone: pick(zones).id,
        timestamp: new Date(Date.now() - (5 - j) * 600000),
      })),
    };
    zone.vehicles.push(v.id);
    vehicles.push(v);
  }
  return vehicles;
}

export function generateAlerts(zones: Zone[], devices: Device[]): Alert[] {
  const alerts: Alert[] = [];
  let id = 0;
  devices.filter(d => d.status === 'fault').forEach(d => {
    alerts.push({
      id: `alert-${id++}`,
      type: 'sensor_fault',
      severity: 'warning',
      message: `${d.name} reporting fault in ${zones.find(z => z.id === d.zone)?.name}`,
      zone: d.zone,
      timestamp: new Date(Date.now() - randInt(0, 7200000)),
      acknowledged: false,
    });
  });
  devices.filter(d => d.battery < 20).forEach(d => {
    alerts.push({
      id: `alert-${id++}`,
      type: 'low_battery',
      severity: 'warning',
      message: `${d.name} battery at ${d.battery}%`,
      zone: d.zone,
      timestamp: new Date(Date.now() - randInt(0, 3600000)),
      acknowledged: false,
    });
  });
  zones.filter(z => z.riskLevel === 'critical').forEach(z => {
    alerts.push({
      id: `alert-${id++}`,
      type: 'gas_spike',
      severity: 'critical',
      message: `Critical gas levels detected in ${z.name}`,
      zone: z.id,
      timestamp: new Date(Date.now() - randInt(0, 1800000)),
      acknowledged: false,
    });
  });
  return alerts;
}

// Simulation tick - mutate data slightly
export function simulateTick(zones: Zone[]) {
  zones.forEach(zone => {
    zone.gasLevels.CO = Math.max(0, zone.gasLevels.CO + rand(-2, 2));
    zone.gasLevels.NO2 = Math.max(0, zone.gasLevels.NO2 + rand(-0.2, 0.2));
    zone.gasLevels.O2 = Math.min(21, Math.max(18, zone.gasLevels.O2 + rand(-0.1, 0.1)));
    zone.gasLevels.CH4 = Math.max(0, zone.gasLevels.CH4 + rand(-0.1, 0.1));
    zone.temperature = Math.max(20, Math.min(45, zone.temperature + rand(-0.5, 0.5)));
    zone.airflow = Math.max(0.5, zone.airflow + rand(-0.3, 0.3));

    if (zone.fanActive && zone.vehicles.length > 0) {
      zone.fanSpeed = Math.min(100, zone.fanSpeed + 2);
    } else if (zone.fanActive && zone.vehicles.length === 0) {
      zone.fanSpeed = Math.max(30, zone.fanSpeed - 1);
    }

    zone.riskLevel = calcRisk(zone.gasLevels, zone.temperature);
  });
}
