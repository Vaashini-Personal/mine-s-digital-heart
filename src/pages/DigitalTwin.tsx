import { useState } from 'react';
import { Zone } from '@/lib/simulation';
import { StatusBadge } from '@/components/StatusBadge';
import { Wind, Flame, Droplets, Users, Truck, Power } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface Props {
  zones: Zone[];
  onToggleFan: (zoneId: string) => void;
}

export default function DigitalTwin({ zones, onToggleFan }: Props) {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [whatIfGas, setWhatIfGas] = useState(0);

  const getColor = (zone: Zone) => {
    if (zone.riskLevel === 'critical') return 'border-destructive bg-destructive/20';
    if (zone.riskLevel === 'warning') return 'border-warning bg-warning/15';
    return 'border-success/40 bg-success/10';
  };

  const simulated = selectedZone ? {
    CO: selectedZone.gasLevels.CO + whatIfGas * 5,
    riskPrediction: selectedZone.gasLevels.CO + whatIfGas * 5 > 35 ? 'critical' as const
      : selectedZone.gasLevels.CO + whatIfGas * 5 > 20 ? 'warning' as const : 'safe' as const,
    suggestedFanSpeed: Math.min(100, selectedZone.fanSpeed + whatIfGas * 10),
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono">DIGITAL TWIN SIMULATION</h2>
        <p className="text-xs text-muted-foreground">Interactive zone-based mine model with what-if analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mine network graph */}
        <div className="lg:col-span-2 card-industrial grid-overlay min-h-[400px] relative">
          <h3 className="text-xs font-mono text-muted-foreground mb-4">MINE ZONE NETWORK</h3>
          <div className="grid grid-cols-3 gap-3">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => { setSelectedZone(zone); setWhatIfGas(0); }}
                className={`p-3 rounded border-2 text-left transition-all hover:scale-[1.02] ${getColor(zone)} ${
                  selectedZone?.id === zone.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="text-xs font-mono font-bold truncate">{zone.name}</div>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge level={zone.riskLevel} />
                </div>
                <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] font-mono text-muted-foreground">
                  <span>CO: {zone.gasLevels.CO.toFixed(1)}</span>
                  <span>CH4: {zone.gasLevels.CH4.toFixed(2)}</span>
                  <span>O2: {zone.gasLevels.O2.toFixed(1)}</span>
                  <span>{zone.temperature.toFixed(1)}°C</span>
                </div>
                <div className="flex gap-2 mt-2 text-[10px]">
                  <span className="flex items-center gap-0.5">
                    <Users className="h-3 w-3" />{zone.workers.length}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Truck className="h-3 w-3" />{zone.vehicles.length}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Wind className="h-3 w-3" />{zone.airflow.toFixed(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail / What-if panel */}
        <div className="card-industrial space-y-4">
          <h3 className="text-xs font-mono text-muted-foreground">ZONE DETAILS & WHAT-IF</h3>

          {selectedZone ? (
            <>
              <div>
                <h4 className="font-mono font-bold text-sm">{selectedZone.name}</h4>
                <StatusBadge level={selectedZone.riskLevel} />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between"><span className="text-muted-foreground">CO</span><span>{selectedZone.gasLevels.CO.toFixed(1)} ppm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">NO2</span><span>{selectedZone.gasLevels.NO2.toFixed(2)} ppm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">O2</span><span>{selectedZone.gasLevels.O2.toFixed(1)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CH4</span><span>{selectedZone.gasLevels.CH4.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span>{selectedZone.temperature.toFixed(1)}°C</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Airflow</span><span>{selectedZone.airflow.toFixed(1)} m/s</span></div>
              </div>

              <div className="border-t border-border pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">Fan</span>
                  <Switch
                    checked={selectedZone.fanActive}
                    onCheckedChange={() => onToggleFan(selectedZone.id)}
                  />
                </div>
                <div className="text-xs font-mono">
                  <span className="text-muted-foreground">Fan Speed: </span>{selectedZone.fanSpeed}%
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-3">
                <h5 className="text-xs font-mono font-bold text-accent">WHAT-IF SCENARIO</h5>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground">Simulate Gas Increase</label>
                  <Slider value={[whatIfGas]} onValueChange={v => setWhatIfGas(v[0])} min={0} max={10} step={1} className="mt-1" />
                  <span className="text-[10px] font-mono text-muted-foreground">+{whatIfGas * 5} ppm CO</span>
                </div>

                {simulated && whatIfGas > 0 && (
                  <div className="p-2 rounded bg-muted/50 text-xs font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Predicted CO</span>
                      <span>{simulated.CO.toFixed(1)} ppm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk</span>
                      <StatusBadge level={simulated.riskPrediction} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Suggested Fan</span>
                      <span>{simulated.suggestedFanSpeed}%</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Click a zone to inspect and simulate</p>
          )}
        </div>
      </div>
    </div>
  );
}
