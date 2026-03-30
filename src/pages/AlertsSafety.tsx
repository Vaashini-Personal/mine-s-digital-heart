import { useState } from 'react';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { Alert, Zone } from '@/lib/simulation';
import { StatusBadge } from '@/components/StatusBadge';

interface Props {
  alerts: Alert[];
  zones: Zone[];
  onAcknowledge: (alertId: string) => void;
}

export default function AlertsSafety({ alerts, zones, onAcknowledge }: Props) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const zoneMap = Object.fromEntries(zones.map(z => [z.id, z]));

  const filtered = alerts.filter(a =>
    filter === 'all' ? true : a.severity === filter
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const critCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const warnCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length;
  const ackCount = alerts.filter(a => a.acknowledged).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wide">Alerts & Safety</h2>
          <p className="text-xs text-muted-foreground">Real-time hazard detection · Safety compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">{alerts.length} total alerts</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-industrial border-destructive/30">
          <span className="text-[10px] font-mono text-muted-foreground">CRITICAL</span>
          <div className="text-3xl font-bold font-mono text-destructive">{critCount}</div>
          <span className="text-[10px] text-muted-foreground">Unacknowledged</span>
        </div>
        <div className="card-industrial border-warning/30">
          <span className="text-[10px] font-mono text-muted-foreground">WARNING</span>
          <div className="text-3xl font-bold font-mono text-warning">{warnCount}</div>
          <span className="text-[10px] text-muted-foreground">Unacknowledged</span>
        </div>
        <div className="card-industrial border-success/30">
          <span className="text-[10px] font-mono text-muted-foreground">ACKNOWLEDGED</span>
          <div className="text-3xl font-bold font-mono text-success">{ackCount}</div>
          <span className="text-[10px] text-muted-foreground">Resolved</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-muted rounded-md p-0.5 w-fit">
        {(['all', 'critical', 'warning'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
              filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-2 max-h-[500px] overflow-auto">
        {filtered.map(a => (
          <div key={a.id} className={`card-industrial flex items-center gap-3 ${a.acknowledged ? 'opacity-50' : ''}`}>
            <AlertTriangle className={`h-4 w-4 shrink-0 ${
              a.severity === 'critical' ? 'text-destructive' : 'text-warning'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-bold">{a.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge level={a.severity} />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {zoneMap[a.zone]?.name || a.zone}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {a.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
            {!a.acknowledged && (
              <button
                onClick={() => onAcknowledge(a.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-success/15 text-success border border-success/30 rounded text-[10px] font-mono font-bold hover:bg-success/25 transition-colors shrink-0"
              >
                <CheckCircle className="h-3 w-3" />
                ACK
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card-industrial text-center py-8 text-muted-foreground text-sm font-mono">
            No alerts matching filter
          </div>
        )}
      </div>
    </div>
  );
}
