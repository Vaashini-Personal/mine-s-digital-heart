import { useMemo } from 'react';
import { Zap, TrendingDown, Leaf, DollarSign } from 'lucide-react';
import { Zone } from '@/lib/simulation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend,
} from 'recharts';
import { Progress } from '@/components/ui/progress';

interface Props {
  zones: Zone[];
}

const FANS = [
  { name: 'Main Intake Fan A', power: 185, efficiency: 78.7, runtime: '6188h', energy: 3774 },
  { name: 'Main Intake Fan B', power: 168, efficiency: 76.5, runtime: '4102h', energy: 3264 },
  { name: 'Level 1 Booster', power: 75, efficiency: 71.7, runtime: '2910h', energy: 1530 },
  { name: 'Level 2 Booster', power: 95, efficiency: 71.7, runtime: '3346h', energy: 1918 },
  { name: 'Main Exhaust Fan', power: 210, efficiency: 81.5, runtime: '6580h', energy: 4286 },
  { name: 'Level 2 Aux Fan', power: 55, efficiency: 72.4, runtime: '1872h', energy: 1122 },
];

export default function Energy({ zones }: Props) {
  const zoneData = useMemo(() => {
    return zones.map(z => {
      const actual = z.fanActive ? z.fanSpeed * 1.8 : 0;
      const expected = 100 * 1.8;
      return { actual: Math.round(actual), expected: Math.round(expected) };
    });
  }, [zones]);

  const totalActual = zoneData.reduce((s, d) => s + d.actual, 0);
  const totalExpected = zoneData.reduce((s, d) => s + d.expected, 0);
  const totalSavings = totalExpected - totalActual;
  const savingsPercent = totalExpected > 0 ? ((totalSavings / totalExpected) * 100) : 0;

  // 24h power comparison data
  const hourlyData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      const baseline = totalExpected > 0 ? totalExpected : 850;
      const jitter = Math.sin(i * 0.8) * 80 + Math.cos(i * 1.3) * 40;
      const vodActual = Math.round(baseline * 0.65 + jitter);
      return { hour, baseline, vodActual: Math.max(200, vodActual) };
    });
  }, [totalExpected]);

  // Hourly savings bar data
  const savingsData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      const base = totalSavings > 0 ? totalSavings / 24 : 12;
      const variation = Math.sin(i * 0.7) * base * 0.4 + Math.cos(i * 1.1) * base * 0.2;
      return { hour, savings: Math.max(0, Math.round(base + variation)) };
    });
  }, [totalSavings]);

  const currentPower = totalActual > 0 ? totalActual : 576;
  const energySavedToday = Math.round(totalSavings * 24 * 0.85) || 4874;
  const co2Avoided = ((energySavedToday * 0.43) / 1000).toFixed(1);
  const avgSavings = savingsPercent.toFixed(1);
  const todayUsage = Math.round(currentPower * 24 * 1.12) || 15526;
  const annualProjection = Math.round(totalSavings * 365 * 24 * 0.12) || 213481;
  const carbonSaved = Math.round(parseFloat(co2Avoided) * 365) || 765;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wide">Energy Optimization Dashboard</h2>
          <p className="text-xs text-muted-foreground">VoD energy savings vs. traditional constant speed ventilation</p>
        </div>
        <div className="px-3 py-1.5 rounded-md border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold">
          VoD Active — Saving {avgSavings}%
        </div>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-industrial">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">Current Power</span>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold font-mono mt-2 text-foreground">{currentPower} <span className="text-base text-muted-foreground">kW</span></div>
          <p className="text-[10px] text-muted-foreground font-mono mt-1">Baseline: {totalExpected || 850} kW</p>
        </div>
        <div className="card-industrial">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">Energy Saved Today</span>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold font-mono mt-2 text-accent">{energySavedToday.toLocaleString()} <span className="text-base text-muted-foreground">kWh</span></div>
          <p className="text-[10px] text-muted-foreground font-mono mt-1">vs {(energySavedToday * 4.2).toLocaleString()} kWh baseline</p>
        </div>
        <div className="card-industrial">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">CO₂ Avoided</span>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold font-mono mt-2 text-emerald-400">{((parseFloat(co2Avoided) * 1000) || 2095.8).toFixed(1)} <span className="text-base text-muted-foreground">kg</span></div>
          <p className="text-[10px] text-muted-foreground font-mono mt-1">0.43 kg CO₂/kWh factor</p>
        </div>
      </div>

      {/* VoD vs Baseline Power Comparison - full width area chart */}
      <div className="card-industrial">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-mono">VoD vs. Baseline Power Comparison</h3>
          <span className="text-[10px] text-muted-foreground font-mono">Last 24 hours</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: 'hsl(var(--foreground))' }} />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="baseline" name="Baseline (kW)" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.08} strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="vodActual" name="VoD Actual (kW)" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Savings + Fan Performance side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-industrial">
          <h3 className="text-sm font-bold font-mono mb-4">Hourly Energy Savings (kW)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontFamily: 'monospace' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="savings" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fan Unit Performance table */}
        <div className="card-industrial">
          <h3 className="text-sm font-bold font-mono mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" /> Fan Unit Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 pr-2">Fan</th>
                  <th className="text-right py-2 px-2">Power</th>
                  <th className="text-center py-2 px-2">Efficiency</th>
                  <th className="text-right py-2 px-2">Runtime</th>
                  <th className="text-right py-2 pl-2">Energy Today</th>
                </tr>
              </thead>
              <tbody>
                {FANS.map(fan => (
                  <tr key={fan.name} className="border-b border-border/50 hover:bg-accent/5 transition-colors">
                    <td className="py-2.5 pr-2 text-foreground">{fan.name}</td>
                    <td className="text-right py-2.5 px-2 text-foreground">{fan.power} <span className="text-muted-foreground">kW</span></td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2 justify-center">
                        <Progress value={fan.efficiency} className="h-1.5 w-16" />
                        <span className="text-muted-foreground w-10 text-right">{fan.efficiency}%</span>
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-2 text-accent">{fan.runtime}</td>
                    <td className="text-right py-2.5 pl-2 text-muted-foreground">{fan.energy.toLocaleString()} kWh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VoD Performance Summary */}
      <div className="card-industrial">
        <h3 className="text-sm font-bold font-mono mb-4">VoD Performance Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Avg Savings</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{avgSavings}%</p>
            <p className="text-[10px] text-muted-foreground font-mono">vs constant speed</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Today Usage</p>
            <p className="text-2xl font-bold font-mono text-accent mt-1">{todayUsage.toLocaleString()} kWh</p>
            <p className="text-[10px] text-muted-foreground font-mono">actual consumption</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Annual Projection</p>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">${annualProjection.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-mono">cost savings/year</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Carbon Saved</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{carbonSaved} t</p>
            <p className="text-[10px] text-muted-foreground font-mono">CO₂/year projection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
