import { useState, useMemo } from 'react';
import { Fan, AlertTriangle, Settings2, Zap } from 'lucide-react';
import { Zone } from '@/lib/simulation';
import { Slider } from '@/components/ui/slider';

interface Props {
  zones: Zone[];
  onToggleFan: (zoneId: string) => void;
}

interface FanUnit {
  id: string;
  name: string;
  zone: string;
  zoneName: string;
  speed: number;
  running: boolean;
  power: number;
  airflow: number;
  efficiency: number;
  runtime: number;
}

export default function Ventilation({ zones, onToggleFan }: Props) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const fans: FanUnit[] = useMemo(() => {
    const fanNames = [
      'Main Intake Fan A', 'Main Intake Fan B',
      'Level 1 Booster', 'Level 2 Booster',
      'Exhaust Fan C', 'Auxiliary Fan D',
    ];
    return zones.slice(0, 6).map((z, i) => ({
      id: `fan-${i}`,
      name: fanNames[i] || `Fan ${i + 1}`,
      zone: z.id,
      zoneName: z.name,
      speed: overrides[`fan-${i}`] ?? z.fanSpeed,
      running: z.fanActive,
      power: Math.round((overrides[`fan-${i}`] ?? z.fanSpeed) * 1.8),
      airflow: parseFloat(((overrides[`fan-${i}`] ?? z.fanSpeed) * 0.085).toFixed(1)),
      efficiency: parseFloat((70 + Math.random() * 20).toFixed(1)),
      runtime: Math.round(50 + Math.random() * 50),
    }));
  }, [zones, overrides]);

  const totalAirflow = fans.reduce((s, f) => s + (f.running ? f.airflow : 0), 0);
  const totalPower = fans.reduce((s, f) => s + (f.running ? f.power : 0), 0);
  const activeFans = fans.filter(f => f.running).length;

  const handleOverride = (fanId: string, value: number) => {
    setOverrides(prev => ({ ...prev, [fanId]: value }));
  };

  const presets = [40, 60, 80, 100];

  const automationRules = [
    { level: 'HIGH', color: 'bg-warning', condition: 'CO > 25 ppm in any zone', action: 'Increase zone fan speed +20%' },
    { level: 'CRITICAL', color: 'bg-destructive', condition: 'CH4 > 1.0% detected', action: 'Activate emergency ventilation (100%)' },
    { level: 'CRITICAL', color: 'bg-destructive', condition: 'O2 < 19.5% in any zone', action: 'Open all dampers + max airflow' },
    { level: 'MEDIUM', color: 'bg-accent', condition: 'Workers detected in zone', action: 'Maintain minimum 3 m/s airflow' },
    { level: 'LOW', color: 'bg-success', condition: 'No activity for 30 min', action: 'Reduce to eco mode (40%)' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wide">Ventilation Control Engine</h2>
          <p className="text-xs text-muted-foreground">VoD automation · Fan & damper SCADA control</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-md p-0.5">
            <button
              onClick={() => setMode('auto')}
              className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                mode === 'auto' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                mode === 'manual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Manual
            </button>
          </div>
          <button className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-4 py-1.5 rounded text-xs font-mono font-bold hover:bg-destructive/90 transition-colors">
            <AlertTriangle className="h-3.5 w-3.5" />
            EMERGENCY VENT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Fan Cards - 2 column grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold font-mono">Fan Speed Control</h3>
            <span className="text-xs text-muted-foreground">({fans.length} units)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fans.map(fan => (
              <div key={fan.id} className="card-industrial space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold font-mono">{fan.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono">Zone: {fan.zoneName.toUpperCase()}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    fan.running
                      ? 'bg-success/15 text-success'
                      : 'bg-destructive/15 text-destructive'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${fan.running ? 'bg-success' : 'bg-destructive'}`} />
                    {fan.running ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>

                {/* Speed display */}
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold font-mono ${
                      fan.speed > 85 ? 'text-warning' : 'text-foreground'
                    }`}>
                      {fan.speed}
                    </span>
                    <span className="text-lg text-muted-foreground font-mono">%</span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground font-mono">
                    <span>{fan.power} kW · {fan.airflow} m³/s</span>
                  </div>
                </div>

                {/* Speed bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      fan.speed > 85 ? 'bg-warning' : fan.speed > 60 ? 'bg-accent' : 'bg-success'
                    }`}
                    style={{ width: `${fan.speed}%` }}
                  />
                </div>

                {/* Manual Override */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-mono">Manual Override</span>
                    <span className="text-xs font-mono font-bold text-accent">{overrides[fan.id] ?? fan.speed}%</span>
                  </div>
                  <Slider
                    value={[overrides[fan.id] ?? fan.speed]}
                    onValueChange={([v]) => handleOverride(fan.id, v)}
                    min={0}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex gap-1">
                    {presets.map(p => (
                      <button
                        key={p}
                        onClick={() => handleOverride(fan.id, p)}
                        className="flex-1 py-1 text-[10px] font-mono text-muted-foreground border border-border rounded hover:bg-muted transition-colors"
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply button */}
                <button
                  onClick={() => onToggleFan(fan.zone)}
                  className="w-full py-2 bg-accent/15 text-accent border border-accent/30 rounded text-xs font-mono font-bold hover:bg-accent/25 transition-colors"
                >
                  Apply Speed
                </button>

                {/* Footer stats */}
                <div className="flex justify-between text-xs font-mono pt-1 border-t border-border">
                  <div>
                    <span className="text-muted-foreground">Efficiency</span>
                    <p className="font-bold">{fan.efficiency}%</p>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Runtime</span>
                    <p className="font-bold">{fan.runtime}h</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* System Status */}
          <div className="card-industrial">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold font-mono flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5 text-primary" />
                System Status
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                mode === 'auto' ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-muted text-muted-foreground'
              }`}>
                {mode.toUpperCase()}
              </span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-bold">{mode === 'auto' ? 'AUTO' : 'MANUAL'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Airflow</span>
                <span className="font-bold">{totalAirflow.toFixed(1)} m³/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Power</span>
                <span className="font-bold">{totalPower} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Fans</span>
                <span className="font-bold">{activeFans}/{fans.length}</span>
              </div>
            </div>
          </div>

          {/* Automation Rules */}
          <div className="card-industrial">
            <h3 className="text-sm font-bold font-mono mb-3">Automation Rules</h3>
            <div className="space-y-3">
              {automationRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${rule.color} text-background`}>
                      {rule.level}
                    </span>
                    <span className={`h-2 w-2 rounded-full ${rule.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-muted-foreground">
                      IF: {rule.condition}
                    </p>
                    <p className="text-[11px] font-mono text-foreground">
                      → {rule.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
