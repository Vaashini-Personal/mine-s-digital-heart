import { Device, Zone } from '@/lib/simulation';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Battery, Wifi, WifiOff, AlertTriangle, CheckCircle, XCircle, Wrench } from 'lucide-react';

interface Props {
  devices: Device[];
  zones: Zone[];
}

export default function DeviceHealth({ devices, zones }: Props) {
  const online = devices.filter(d => d.status === 'active').length;
  const offline = devices.filter(d => d.status === 'inactive').length;
  const faults = devices.filter(d => d.status === 'fault').length;
  const lowBattery = devices.filter(d => d.battery < 20).length;
  const calibNeeded = devices.filter(d => d.health === 'calibration_required').length;
  const avgUptime = devices.length ? (devices.reduce((s, d) => s + d.uptime, 0) / devices.length).toFixed(1) : '0';

  const zoneName = (id: string) => zones.find(z => z.id === id)?.name || id;

  const healthIcon = (h: Device['health']) => {
    switch (h) {
      case 'normal': return <CheckCircle className="h-3.5 w-3.5 text-success" />;
      case 'fault': return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      case 'calibration_required': return <Wrench className="h-3.5 w-3.5 text-warning" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono">DEVICE HEALTH MONITORING</h2>
        <p className="text-xs text-muted-foreground">Real-time device connectivity, battery, and sensor health</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard title="Online" value={online} icon={<Wifi className="h-4 w-4" />} variant="success" />
        <MetricCard title="Offline" value={offline} icon={<WifiOff className="h-4 w-4" />} variant={offline > 0 ? 'warning' : 'default'} />
        <MetricCard title="Faults" value={faults} icon={<AlertTriangle className="h-4 w-4" />} variant={faults > 0 ? 'critical' : 'default'} />
        <MetricCard title="Low Battery" value={lowBattery} icon={<Battery className="h-4 w-4" />} variant={lowBattery > 0 ? 'warning' : 'default'} />
        <MetricCard title="Calibration" value={calibNeeded} icon={<Wrench className="h-4 w-4" />} />
        <MetricCard title="Avg Uptime" value={`${avgUptime}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fault log */}
        <div className="card-industrial">
          <h3 className="text-sm font-mono font-bold mb-3">FAULT LOG</h3>
          <div className="space-y-2 max-h-80 overflow-auto">
            {devices.filter(d => d.health !== 'normal').length === 0 && (
              <p className="text-xs text-muted-foreground">All devices healthy</p>
            )}
            {devices.filter(d => d.health !== 'normal').map(d => (
              <div key={d.id} className={`flex items-center gap-3 p-2 rounded border text-xs font-mono ${
                d.health === 'fault' ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5'
              }`}>
                {healthIcon(d.health)}
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{d.name}</p>
                  <p className="text-muted-foreground">{zoneName(d.zone)} — {d.health.replace('_', ' ')}</p>
                </div>
                <span className="text-muted-foreground">{d.lastComm.toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health status cards */}
        <div className="card-industrial">
          <h3 className="text-sm font-mono font-bold mb-3">ALL DEVICES</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-auto">
            {devices.map(d => (
              <div key={d.id} className="p-2 rounded border border-border bg-muted/30 text-[10px] font-mono">
                <div className="flex items-center gap-1 mb-1">
                  {healthIcon(d.health)}
                  <span className="font-bold truncate">{d.name}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Battery className={`h-2.5 w-2.5 ${d.battery < 20 ? 'text-destructive' : 'text-success'}`} />
                    {d.battery}%
                  </span>
                  <span>{d.uptime.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
