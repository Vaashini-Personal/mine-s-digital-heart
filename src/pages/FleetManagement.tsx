import { Vehicle, Zone } from '@/lib/simulation';
import { StatusBadge } from '@/components/StatusBadge';
import { MetricCard } from '@/components/MetricCard';
import { Truck, Gauge, MapPin, Clock } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  zones: Zone[];
}

export default function FleetManagement({ vehicles, zones }: Props) {
  const active = vehicles.filter(v => v.status === 'active').length;
  const idle = vehicles.filter(v => v.status === 'idle').length;
  const zoneName = (id: string) => zones.find(z => z.id === id)?.name || id;

  // Activity heatmap: count vehicles per zone
  const heatmap = zones.map(z => ({
    zone: z.name,
    count: vehicles.filter(v => v.zone === z.id).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono">FLEET MANAGEMENT</h2>
        <p className="text-xs text-muted-foreground">Real-time vehicle tracking with ventilation integration</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Total Vehicles" value={vehicles.length} icon={<Truck className="h-4 w-4" />} />
        <MetricCard title="Active" value={active} variant="success" />
        <MetricCard title="Idle" value={idle} variant={idle > 0 ? 'warning' : 'default'} />
        <MetricCard title="Types" value={[...new Set(vehicles.map(v => v.type))].length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vehicle list */}
        <div className="card-industrial">
          <h3 className="text-sm font-mono font-bold mb-3">VEHICLE STATUS</h3>
          <div className="space-y-2 max-h-96 overflow-auto">
            {vehicles.map(v => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded border border-border bg-muted/20 text-xs font-mono">
                <Truck className={`h-5 w-5 shrink-0 ${v.status === 'active' ? 'text-success' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{v.name}</span>
                    <StatusBadge level={v.status === 'active' ? 'safe' : 'warning'} label={v.status.toUpperCase()} />
                  </div>
                  <div className="flex gap-3 mt-1 text-muted-foreground">
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{zoneName(v.zone)}</span>
                    <span className="flex items-center gap-0.5"><Gauge className="h-3 w-3" />{v.speed.toFixed(0)} km/h</span>
                    <span className="capitalize">{v.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity heatmap + history */}
        <div className="space-y-4">
          <div className="card-industrial">
            <h3 className="text-sm font-mono font-bold mb-3">ZONE ACTIVITY HEATMAP</h3>
            <div className="grid grid-cols-3 gap-2">
              {heatmap.map(h => (
                <div
                  key={h.zone}
                  className={`p-2 rounded border text-center text-[10px] font-mono ${
                    h.count >= 2 ? 'bg-destructive/20 border-destructive/40' :
                    h.count === 1 ? 'bg-warning/15 border-warning/40' :
                    'bg-muted/30 border-border'
                  }`}
                >
                  <div className="font-bold truncate">{h.zone}</div>
                  <div className="text-lg font-bold mt-1">{h.count}</div>
                  <div className="text-muted-foreground">vehicles</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-industrial">
            <h3 className="text-sm font-mono font-bold mb-3">VENTILATION INTEGRATION</h3>
            <div className="space-y-2 text-xs font-mono">
              {zones.map(z => {
                const vCount = vehicles.filter(v => v.zone === z.id && v.status === 'active').length;
                return (
                  <div key={z.id} className="flex items-center justify-between">
                    <span className="truncate">{z.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{vCount} active</span>
                      <span className={`${vCount > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                        Fan: {z.fanActive ? `${z.fanSpeed}%` : 'OFF'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 border-t border-border pt-2">
              Fan speed auto-adjusts based on active vehicle count in each zone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
