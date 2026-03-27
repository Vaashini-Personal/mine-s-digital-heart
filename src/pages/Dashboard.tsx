import { Wind, Thermometer, Users, Truck, AlertTriangle } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Zone, Device, Worker, Vehicle, Alert } from '@/lib/simulation';

interface Props {
  zones: Zone[];
  devices: Device[];
  workers: Worker[];
  vehicles: Vehicle[];
  alerts: Alert[];
}

export default function Dashboard({ zones, devices, workers, vehicles, alerts }: Props) {
  const criticalZones = zones.filter(z => z.riskLevel === 'critical').length;
  const warningZones = zones.filter(z => z.riskLevel === 'warning').length;
  const activeDevices = devices.filter(d => d.status === 'active').length;
  const faultDevices = devices.filter(d => d.status === 'fault').length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const unacknowledged = alerts.filter(a => !a.acknowledged).length;
  const avgTemp = zones.length ? (zones.reduce((s, z) => s + z.temperature, 0) / zones.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono text-foreground">SYSTEM OVERVIEW</h2>
        <p className="text-xs text-muted-foreground">Smart Mine Ventilation on Demand — Control Dashboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard title="Zones" value={zones.length} icon={<Wind className="h-4 w-4" />} subtitle={`${criticalZones} critical`} variant={criticalZones > 0 ? 'critical' : 'default'} />
        <MetricCard title="Avg Temp" value={`${avgTemp}°C`} icon={<Thermometer className="h-4 w-4" />} />
        <MetricCard title="Workers" value={workers.length} icon={<Users className="h-4 w-4" />} />
        <MetricCard title="Vehicles" value={`${activeVehicles}/${vehicles.length}`} icon={<Truck className="h-4 w-4" />} />
        <MetricCard title="Devices" value={`${activeDevices}/${devices.length}`} subtitle={`${faultDevices} faults`} variant={faultDevices > 0 ? 'warning' : 'default'} />
        <MetricCard title="Alerts" value={unacknowledged} icon={<AlertTriangle className="h-4 w-4" />} variant={unacknowledged > 3 ? 'critical' : unacknowledged > 0 ? 'warning' : 'success'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Zone status table */}
        <div className="card-industrial">
          <h3 className="text-sm font-mono font-bold mb-3">ZONE STATUS</h3>
          <div className="overflow-auto max-h-72">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-1 px-2">Zone</th>
                  <th className="text-right py-1 px-2">CO</th>
                  <th className="text-right py-1 px-2">CH4</th>
                  <th className="text-right py-1 px-2">O2</th>
                  <th className="text-right py-1 px-2">Temp</th>
                  <th className="text-center py-1 px-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {zones.map(z => (
                  <tr key={z.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-1.5 px-2">{z.name}</td>
                    <td className="text-right py-1.5 px-2">{z.gasLevels.CO.toFixed(1)}</td>
                    <td className="text-right py-1.5 px-2">{z.gasLevels.CH4.toFixed(2)}</td>
                    <td className="text-right py-1.5 px-2">{z.gasLevels.O2.toFixed(1)}</td>
                    <td className="text-right py-1.5 px-2">{z.temperature.toFixed(1)}°</td>
                    <td className="text-center py-1.5 px-2"><StatusBadge level={z.riskLevel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent alerts */}
        <div className="card-industrial">
          <h3 className="text-sm font-mono font-bold mb-3">RECENT ALERTS</h3>
          <div className="space-y-2 max-h-72 overflow-auto">
            {alerts.length === 0 && <p className="text-xs text-muted-foreground">No alerts</p>}
            {alerts.slice(0, 8).map(a => (
              <div key={a.id} className={`flex items-start gap-2 p-2 rounded text-xs border ${
                a.severity === 'critical' ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5'
              } ${a.acknowledged ? 'opacity-50' : ''}`}>
                <AlertTriangle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${a.severity === 'critical' ? 'text-destructive' : 'text-warning'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono truncate">{a.message}</p>
                  <p className="text-muted-foreground mt-0.5">{a.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
