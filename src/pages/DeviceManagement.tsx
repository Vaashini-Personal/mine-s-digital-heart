import { useState, useMemo } from 'react';
import { Device, Zone } from '@/lib/simulation';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Battery, Wifi, WifiOff, Search } from 'lucide-react';

interface Props {
  devices: Device[];
  zones: Zone[];
}

const typeLabels: Record<Device['type'], string> = {
  gas_sensor: 'Gas Sensor',
  env_sensor: 'Env Sensor',
  ble_tracker: 'BLE Tracker',
  rfid_reader: 'RFID Reader',
  gateway: 'Gateway',
};

export default function DeviceManagement({ devices, zones }: Props) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return devices.filter(d => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.id.includes(search)) return false;
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      return true;
    });
  }, [devices, search, typeFilter, statusFilter]);

  const zoneName = (id: string) => zones.find(z => z.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono">DEVICE MANAGEMENT</h2>
        <p className="text-xs text-muted-foreground">{devices.length} devices registered across {zones.length} zones</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 w-64 bg-muted/50 border-border text-sm font-mono"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-muted/50 text-sm font-mono">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(typeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-muted/50 text-sm font-mono">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="fault">Fault</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="card-industrial overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2 px-3">Device ID</th>
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Type</th>
              <th className="text-left py-2 px-3">Zone</th>
              <th className="text-center py-2 px-3">Status</th>
              <th className="text-center py-2 px-3">Battery</th>
              <th className="text-right py-2 px-3">Last Comm</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2 px-3 text-muted-foreground">{d.id}</td>
                <td className="py-2 px-3">{d.name}</td>
                <td className="py-2 px-3">{typeLabels[d.type]}</td>
                <td className="py-2 px-3">{zoneName(d.zone)}</td>
                <td className="py-2 px-3 text-center">
                  <StatusBadge
                    level={d.status === 'active' ? 'safe' : d.status === 'fault' ? 'critical' : 'warning'}
                    label={d.status.toUpperCase()}
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Battery className={`h-3.5 w-3.5 ${d.battery < 20 ? 'text-destructive' : d.battery < 50 ? 'text-warning' : 'text-success'}`} />
                    <span>{d.battery}%</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right text-muted-foreground">
                  <div className="flex items-center justify-end gap-1">
                    {d.status === 'active' ? <Wifi className="h-3 w-3 text-success" /> : <WifiOff className="h-3 w-3 text-destructive" />}
                    {d.lastComm.toLocaleTimeString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No devices match filters</p>}
      </div>
    </div>
  );
}
