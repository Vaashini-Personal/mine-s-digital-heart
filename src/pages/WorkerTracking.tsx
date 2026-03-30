import { Users, Radio, Battery, Heart } from 'lucide-react';
import { Worker, Vehicle, Zone } from '@/lib/simulation';
import { StatusBadge } from '@/components/StatusBadge';

interface Props {
  workers: Worker[];
  vehicles: Vehicle[];
  zones: Zone[];
}

export default function WorkerTracking({ workers, vehicles, zones }: Props) {
  const zoneMap = Object.fromEntries(zones.map(z => [z.id, z]));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold font-mono tracking-wide">Worker & Vehicle Tracking</h2>
        <p className="text-xs text-muted-foreground">BLE/RFID real-time location · Safety monitoring</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'WORKERS UNDERGROUND', value: workers.length, icon: <Users className="h-5 w-5" />, color: 'text-accent' },
          { label: 'VEHICLES ACTIVE', value: vehicles.filter(v => v.status === 'active').length, icon: <Radio className="h-5 w-5" />, color: 'text-success' },
          { label: 'ZONES OCCUPIED', value: new Set(workers.map(w => w.zone)).size, icon: <Users className="h-5 w-5" />, color: 'text-warning' },
          { label: 'CRITICAL ZONES', value: zones.filter(z => z.riskLevel === 'critical').length, icon: <Heart className="h-5 w-5" />, color: 'text-destructive' },
        ].map(c => (
          <div key={c.label} className="card-industrial">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{c.label}</span>
              <span className="text-muted-foreground">{c.icon}</span>
            </div>
            <div className={`text-3xl font-bold font-mono mt-2 ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Workers table */}
        <div className="card-industrial">
          <h3 className="text-sm font-bold font-mono mb-3 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" /> Personnel ({workers.length})
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {workers.map(w => {
              const zone = zoneMap[w.zone];
              const hr = Math.round(65 + Math.random() * 30);
              const bat = Math.round(40 + Math.random() * 60);
              return (
                <div key={w.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded text-xs font-mono">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{w.name}</p>
                    <p className="text-[10px] text-muted-foreground">{w.role} · {w.bleTag}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-muted-foreground">{zone?.name || 'Unknown'}</p>
                      {zone && <StatusBadge level={zone.riskLevel} />}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span>{hr}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Battery className="h-3 w-3" />
                      <span>{bat}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vehicles table */}
        <div className="card-industrial">
          <h3 className="text-sm font-bold font-mono mb-3 flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-accent" /> Vehicles ({vehicles.length})
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {vehicles.map(v => {
              const zone = zoneMap[v.zone];
              return (
                <div key={v.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded text-xs font-mono">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">{v.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{v.type} · {v.status}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-muted-foreground">{zone?.name || 'Unknown'}</p>
                      {zone && <StatusBadge level={zone.riskLevel} />}
                    </div>
                    <span className={`font-bold ${v.status === 'active' ? 'text-success' : 'text-muted-foreground'}`}>
                      {v.speed.toFixed(0)} km/h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
