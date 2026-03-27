import { useState, useMemo } from 'react';
import { Zone, Worker, Vehicle, Device } from '@/lib/simulation';
import { StatusBadge } from '@/components/StatusBadge';
import { Users, Cpu, Wind, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  zones: Zone[];
  workers: Worker[];
  vehicles: Vehicle[];
  devices: Device[];
}

// Mine layout: 2 shafts, 3 levels, tunnels connecting them
const LAYOUT = {
  shafts: [
    { id: 'shaft-a', label: 'Shaft A', x: 60, y: 30 },
    { id: 'shaft-b', label: 'Shaft B', x: 940, y: 30 },
  ],
  levels: [
    { label: 'Level 1 West', y: 120, zones: [0, 1] },
    { label: 'Level 1 East', y: 120, zones: [2] },
    { label: 'Main Drive', y: 280, zones: [3, 5] },
    { label: 'Level 2 West', y: 440, zones: [6, 7] },
    { label: 'Level 2 East', y: 440, zones: [4, 8] },
  ],
  // Zone placement: [zoneIndex, x, y, width, height]
  zonePlacements: [
    { idx: 0, x: 70, y: 100, w: 280, h: 100 },   // Main Shaft Entry
    { idx: 1, x: 360, y: 100, w: 270, h: 100 },   // Primary Tunnel A
    { idx: 2, x: 640, y: 100, w: 290, h: 100 },   // Primary Tunnel B
    { idx: 3, x: 70, y: 250, w: 280, h: 100 },    // Extraction Bay 1
    { idx: 4, x: 640, y: 250, w: 290, h: 100 },   // Extraction Bay 2
    { idx: 5, x: 360, y: 250, w: 270, h: 100 },   // Ventilation Hub
    { idx: 6, x: 70, y: 410, w: 280, h: 100 },    // Deep Level Access
    { idx: 7, x: 360, y: 410, w: 270, h: 100 },   // Ore Processing
    { idx: 8, x: 640, y: 410, w: 290, h: 100 },   // Emergency Exit
  ],
  // Airflow paths (dashed lines between zones)
  airflowPaths: [
    { from: [210, 150], to: [500, 150] },
    { from: [500, 150], to: [780, 150] },
    { from: [210, 300], to: [500, 300] },
    { from: [500, 300], to: [780, 300] },
    { from: [210, 460], to: [500, 460] },
    { from: [500, 460], to: [780, 460] },
    // Vertical shafts
    { from: [100, 200], to: [100, 250] },
    { from: [100, 350], to: [100, 410] },
    { from: [930, 200], to: [930, 250] },
    { from: [930, 350], to: [930, 410] },
  ],
};

const riskColor = (level: string) => {
  if (level === 'critical') return { bg: 'rgba(239,68,68,0.25)', border: '#ef4444', text: '#fca5a5' };
  if (level === 'warning') return { bg: 'rgba(234,179,8,0.2)', border: '#ca8a04', text: '#fde047' };
  return { bg: 'rgba(34,197,94,0.12)', border: '#166534', text: '#86efac' };
};

const deviceIcon = (type: Device['type']) => {
  switch (type) {
    case 'gas_sensor': return '◆';
    case 'env_sensor': return '■';
    case 'ble_tracker': return '▲';
    case 'rfid_reader': return '✦';
    case 'gateway': return '●';
  }
};

const deviceColor = (type: Device['type']) => {
  switch (type) {
    case 'gas_sensor': return '#f59e0b';
    case 'env_sensor': return '#3b82f6';
    case 'ble_tracker': return '#10b981';
    case 'rfid_reader': return '#a855f7';
    case 'gateway': return '#ec4899';
  }
};

export default function MineMap({ zones, workers, vehicles, devices }: Props) {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showDevices, setShowDevices] = useState(true);
  const [showAirflow, setShowAirflow] = useState(true);

  const getZoneWorkers = (zoneId: string) => workers.filter(w => w.zone === zoneId);
  const getZoneVehicles = (zoneId: string) => vehicles.filter(v => v.zone === zoneId);
  const getZoneDevices = (zoneId: string) => devices.filter(d => d.zone === zoneId);

  // Seed-based pseudo-random positions for entities within zones
  const entityPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const seededRand = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) % 1;
      return x - Math.floor(x);
    };
    workers.forEach((w, i) => {
      const placement = LAYOUT.zonePlacements.find(p => zones[p.idx]?.id === w.zone);
      if (placement) {
        positions[w.id] = {
          x: placement.x + 30 + seededRand(i * 7 + 1) * (placement.w - 60),
          y: placement.y + 25 + seededRand(i * 13 + 3) * (placement.h - 50),
        };
      }
    });
    vehicles.forEach((v, i) => {
      const placement = LAYOUT.zonePlacements.find(p => zones[p.idx]?.id === v.zone);
      if (placement) {
        positions[v.id] = {
          x: placement.x + 30 + seededRand(i * 11 + 5) * (placement.w - 60),
          y: placement.y + 25 + seededRand(i * 17 + 7) * (placement.h - 50),
        };
      }
    });
    devices.forEach((d, i) => {
      const placement = LAYOUT.zonePlacements.find(p => zones[p.idx]?.id === d.zone);
      if (placement) {
        positions[d.id] = {
          x: placement.x + 20 + seededRand(i * 23 + 11) * (placement.w - 40),
          y: placement.y + 20 + seededRand(i * 29 + 13) * (placement.h - 40),
        };
      }
    });
    return positions;
  }, [workers, vehicles, devices, zones]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-mono tracking-wide">Mine Map Visualization</h2>
          <p className="text-xs text-muted-foreground">2D tunnel layout · Sensors, workers &amp; airflow overlay</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showWorkers ? 'default' : 'outline'}
            onClick={() => setShowWorkers(!showWorkers)}
            className="text-xs font-mono gap-1.5"
          >
            <Users className="h-3.5 w-3.5" /> Workers
          </Button>
          <Button
            size="sm"
            variant={showDevices ? 'default' : 'outline'}
            onClick={() => setShowDevices(!showDevices)}
            className="text-xs font-mono gap-1.5"
          >
            <Cpu className="h-3.5 w-3.5" /> Devices
          </Button>
          <Button
            size="sm"
            variant={showAirflow ? 'default' : 'outline'}
            onClick={() => setShowAirflow(!showAirflow)}
            className="text-xs font-mono gap-1.5"
          >
            <Wind className="h-3.5 w-3.5" /> Airflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        {/* SVG Mine Map */}
        <div className="card-industrial p-2 overflow-hidden" style={{ perspective: '1200px' }}>
          <div style={{ transform: 'rotateX(8deg) rotateY(-2deg)', transformOrigin: 'center center' }}>
            <svg
              viewBox="0 0 1020 560"
              className="w-full h-auto"
              style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
            >
              <defs>
                <linearGradient id="shaftGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                  <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--accent))" opacity="0.6" />
                </marker>
              </defs>

              {/* Background */}
              <rect x="0" y="0" width="1020" height="560" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />

              {/* Shaft columns */}
              <rect x="50" y="80" width="40" height="450" fill="url(#shaftGrad)" rx="4" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.4" />
              <rect x="920" y="80" width="40" height="450" fill="url(#shaftGrad)" rx="4" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.4" />

              {/* Shaft labels */}
              <text x="70" y="65" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="11" fontFamily="monospace">Shaft A</text>
              <text x="940" y="65" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="11" fontFamily="monospace">Shaft B</text>

              {/* Level labels */}
              <text x="350" y="92" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="monospace" opacity="0.7">Level 1 West</text>
              <text x="780" y="92" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="monospace" opacity="0.7">Level 1 East</text>
              <text x="500" y="242" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="monospace" opacity="0.7">Main Drive</text>
              <text x="350" y="402" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="monospace" opacity="0.7">Level 2 West</text>
              <text x="780" y="402" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="monospace" opacity="0.7">Level 2 East</text>

              {/* Airflow paths */}
              {showAirflow && LAYOUT.airflowPaths.map((path, i) => (
                <line
                  key={`airflow-${i}`}
                  x1={path.from[0]} y1={path.from[1]}
                  x2={path.to[0]} y2={path.to[1]}
                  stroke="hsl(var(--accent))"
                  strokeWidth="1.5"
                  strokeDasharray="8 4"
                  strokeOpacity="0.5"
                  markerEnd="url(#arrowhead)"
                >
                  <animate attributeName="stroke-dashoffset" from="24" to="0" dur="2s" repeatCount="indefinite" />
                </line>
              ))}

              {/* Zone rectangles */}
              {LAYOUT.zonePlacements.map(({ idx, x, y, w, h }) => {
                const zone = zones[idx];
                if (!zone) return null;
                const colors = riskColor(zone.riskLevel);
                const isSelected = selectedZone?.id === zone.id;

                return (
                  <g key={zone.id} onClick={() => { setSelectedZone(zone); setSelectedDevice(null); }} style={{ cursor: 'pointer' }}>
                    <rect
                      x={x} y={y} width={w} height={h} rx="6"
                      fill={colors.bg}
                      stroke={isSelected ? 'hsl(var(--accent))' : colors.border}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeOpacity={isSelected ? 1 : 0.6}
                    />
                    {/* CO label */}
                    <rect x={x + w / 2 - 55} y={y + h / 2 - 10} width="110" height="20" rx="10" fill="rgba(0,0,0,0.6)" />
                    <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill={colors.text} fontSize="10" fontFamily="monospace" fontWeight="bold">
                      CO: {zone.gasLevels.CO.toFixed(1)} ppm
                    </text>
                  </g>
                );
              })}

              {/* Workers */}
              {showWorkers && workers.map(w => {
                const pos = entityPositions[w.id];
                if (!pos) return null;
                return (
                  <g key={w.id} filter="url(#glow)">
                    <circle cx={pos.x} cy={pos.y} r="6" fill="#22d3ee" opacity="0.9" />
                    <circle cx={pos.x} cy={pos.y} r="3" fill="#fff" opacity="0.8" />
                  </g>
                );
              })}

              {/* Vehicles */}
              {showWorkers && vehicles.map(v => {
                const pos = entityPositions[v.id];
                if (!pos) return null;
                return (
                  <g key={v.id} filter="url(#glow)">
                    <circle cx={pos.x} cy={pos.y} r="7" fill="#f97316" opacity="0.9" />
                    <circle cx={pos.x} cy={pos.y} r="3.5" fill="#fff" opacity="0.7" />
                  </g>
                );
              })}

              {/* Devices */}
              {showDevices && devices.map(d => {
                const pos = entityPositions[d.id];
                if (!pos) return null;
                return (
                  <text
                    key={d.id}
                    x={pos.x} y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={deviceColor(d.type)}
                    fontSize="10"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setSelectedDevice(d); setSelectedZone(null); }}
                  >
                    {deviceIcon(d.type)}
                  </text>
                );
              })}

              {/* Legend */}
              <g transform="translate(180, 530)">
                <circle cx="0" cy="0" r="5" fill="#22d3ee" />
                <text x="10" y="4" fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="monospace">Worker</text>
                <circle cx="80" cy="0" r="5" fill="#f97316" />
                <text x="90" y="4" fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="monospace">Vehicle</text>
                <text x="160" y="4" fill="#f59e0b" fontSize="10" fontFamily="monospace">◆</text>
                <text x="175" y="4" fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="monospace">Gas Sensor</text>
                <text x="265" y="4" fill="#3b82f6" fontSize="10" fontFamily="monospace">■</text>
                <text x="280" y="4" fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="monospace">Env Sensor</text>
                <text x="370" y="4" fill="#10b981" fontSize="10" fontFamily="monospace">▲</text>
                <text x="385" y="4" fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="monospace">BLE Tracker</text>
                <text x="475" y="4" fill="#a855f7" fontSize="10" fontFamily="monospace">✦</text>
                <text x="490" y="4" fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="monospace">RFID Reader</text>
              </g>

              {/* Scale */}
              <text x="510" y="552" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="monospace" opacity="0.6">
                ← North · Mine Level -350m · East →
              </text>
            </svg>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          <div className="card-industrial p-4 min-h-[280px]">
            {selectedZone ? (
              <div className="space-y-3">
                <h3 className="font-mono font-bold text-sm">{selectedZone.name}</h3>
                <StatusBadge level={selectedZone.riskLevel} />
                <div className="space-y-1 text-xs font-mono">
                  <p className="text-muted-foreground mb-1">Gas Levels</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span>CO: <span className="text-accent">{selectedZone.gasLevels.CO.toFixed(1)}</span> ppm</span>
                    <span>NO₂: <span className="text-accent">{selectedZone.gasLevels.NO2.toFixed(2)}</span> ppm</span>
                    <span>O₂: <span className="text-accent">{selectedZone.gasLevels.O2.toFixed(1)}</span>%</span>
                    <span>CH₄: <span className="text-accent">{selectedZone.gasLevels.CH4.toFixed(2)}</span>%</span>
                  </div>
                </div>
                <div className="text-xs font-mono space-y-1">
                  <p className="text-muted-foreground">Temp: {selectedZone.temperature.toFixed(1)}°C · Airflow: {selectedZone.airflow.toFixed(1)} m/s</p>
                  <p className="text-muted-foreground">Fan: {selectedZone.fanActive ? `ON ${selectedZone.fanSpeed}%` : 'OFF'}</p>
                </div>
                <div className="text-xs font-mono space-y-1">
                  <p className="text-muted-foreground">Workers ({getZoneWorkers(selectedZone.id).length})</p>
                  {getZoneWorkers(selectedZone.id).map(w => (
                    <div key={w.id} className="flex justify-between"><span>{w.name}</span><span className="text-muted-foreground">{w.role}</span></div>
                  ))}
                </div>
                <div className="text-xs font-mono space-y-1">
                  <p className="text-muted-foreground">Vehicles ({getZoneVehicles(selectedZone.id).length})</p>
                  {getZoneVehicles(selectedZone.id).map(v => (
                    <div key={v.id} className="flex justify-between"><span>{v.name}</span><StatusBadge level={v.status === 'active' ? 'safe' : 'warning'} label={v.status} /></div>
                  ))}
                </div>
              </div>
            ) : selectedDevice ? (
              <div className="space-y-3">
                <h3 className="font-mono font-bold text-sm">{selectedDevice.name}</h3>
                <StatusBadge level={selectedDevice.status === 'active' ? 'safe' : selectedDevice.status === 'fault' ? 'critical' : 'warning'} label={selectedDevice.status} />
                <div className="text-xs font-mono space-y-1">
                  <p>Type: {selectedDevice.type.replace('_', ' ')}</p>
                  <p>Zone: {zones.find(z => z.id === selectedDevice.zone)?.name}</p>
                  <p>Battery: {selectedDevice.battery}%</p>
                  <p>Health: {selectedDevice.health}</p>
                  <p>Uptime: {selectedDevice.uptime.toFixed(1)}%</p>
                  <p>Last Comm: {selectedDevice.lastComm.toLocaleTimeString()}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-12">
                <TriangleAlert className="h-12 w-12 opacity-30" />
                <p className="text-xs font-mono text-center">Click a zone or device to view details</p>
              </div>
            )}
          </div>

          {/* Zone Status Legend */}
          <div className="card-industrial p-4">
            <h4 className="text-xs font-mono font-bold mb-3 tracking-wider">ZONE STATUS</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-3.5 h-3.5 rounded-full bg-green-500" /> Safe
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500" /> Warning
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500" /> Critical
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
