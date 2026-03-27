import { useState } from 'react';
import { Zone, Worker, Vehicle, Device } from '@/lib/simulation';
import { StatusBadge } from '@/components/StatusBadge';
import { Wind, Users, Truck, Cpu, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  zones: Zone[];
  workers: Worker[];
  vehicles: Vehicle[];
  devices: Device[];
}

const directionIcons = {
  north: ArrowUp, south: ArrowDown, east: ArrowRight, west: ArrowLeft,
};

export default function MineMap({ zones, workers, vehicles, devices }: Props) {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const getZoneWorkers = (zoneId: string) => workers.filter(w => w.zone === zoneId);
  const getZoneVehicles = (zoneId: string) => vehicles.filter(v => v.zone === zoneId);
  const getZoneDevices = (zoneId: string) => devices.filter(d => d.zone === zoneId);

  const bgColor = (zone: Zone) => {
    if (zone.riskLevel === 'critical') return 'bg-destructive/25 border-destructive';
    if (zone.riskLevel === 'warning') return 'bg-warning/15 border-warning/60';
    return 'bg-success/10 border-success/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono">MINE MAP VIEW</h2>
        <p className="text-xs text-muted-foreground">Interactive schematic with sensor, worker, and vehicle overlay</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-industrial grid-overlay p-6">
          <div className="grid grid-cols-3 gap-4">
            {zones.map(zone => {
              const DirIcon = directionIcons[zone.airflowDirection];
              const zWorkers = getZoneWorkers(zone.id);
              const zVehicles = getZoneVehicles(zone.id);
              const zDevices = getZoneDevices(zone.id);

              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`relative p-3 rounded-lg border-2 transition-all hover:scale-[1.02] text-left ${bgColor(zone)} ${
                    selectedZone?.id === zone.id ? 'ring-2 ring-accent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold truncate">{zone.name}</span>
                    <DirIcon className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      <Users className="h-3 w-3" />{zWorkers.length}
                    </span>
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      <Truck className="h-3 w-3" />{zVehicles.length}
                    </span>
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      <Cpu className="h-3 w-3" />{zDevices.length}
                    </span>
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      <Wind className="h-3 w-3" />{zone.airflow.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <StatusBadge level={zone.riskLevel} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-4 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-success/30 border border-success/50" /> Safe</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-warning/30 border border-warning/50" /> Warning</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/30 border border-destructive/50" /> Critical</span>
          </div>
        </div>

        {/* Detail panel */}
        <div className="card-industrial space-y-4">
          <h3 className="text-xs font-mono text-muted-foreground">ZONE DETAIL</h3>
          {selectedZone ? (
            <>
              <div>
                <h4 className="font-mono font-bold text-sm">{selectedZone.name}</h4>
                <StatusBadge level={selectedZone.riskLevel} />
              </div>
              <div className="space-y-1 text-xs font-mono">
                <p className="text-muted-foreground">Gas Levels</p>
                <div className="grid grid-cols-2 gap-1">
                  <span>CO: {selectedZone.gasLevels.CO.toFixed(1)}</span>
                  <span>NO2: {selectedZone.gasLevels.NO2.toFixed(2)}</span>
                  <span>O2: {selectedZone.gasLevels.O2.toFixed(1)}</span>
                  <span>CH4: {selectedZone.gasLevels.CH4.toFixed(2)}</span>
                </div>
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
              <div className="text-xs font-mono space-y-1">
                <p className="text-muted-foreground">Devices ({getZoneDevices(selectedZone.id).length})</p>
                {getZoneDevices(selectedZone.id).slice(0, 5).map(d => (
                  <div key={d.id} className="flex justify-between"><span>{d.name}</span><StatusBadge level={d.status === 'active' ? 'safe' : d.status === 'fault' ? 'critical' : 'warning'} label={d.status} /></div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Click a zone on the map</p>
          )}
        </div>
      </div>
    </div>
  );
}
