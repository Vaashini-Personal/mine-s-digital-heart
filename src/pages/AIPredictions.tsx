import { useMemo } from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Zone } from '@/lib/simulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { StatusBadge } from '@/components/StatusBadge';
import { calcRisk, RiskLevel } from '@/lib/simulation';

interface Props {
  zones: Zone[];
}

export default function AIPredictions({ zones }: Props) {
  const predictions = useMemo(() => {
    return zones.map(z => {
      const steps = Array.from({ length: 12 }, (_, i) => {
        const t = (i + 1) * 10;
        const drift = (i + 1) * 0.3;
        const co = Math.max(0, z.gasLevels.CO + drift * (Math.random() - 0.3));
        const ch4 = Math.max(0, z.gasLevels.CH4 + drift * 0.05 * (Math.random() - 0.3));
        const o2 = Math.min(21, z.gasLevels.O2 - drift * 0.02);
        return { min: t, CO: parseFloat(co.toFixed(1)), CH4: parseFloat(ch4.toFixed(2)), O2: parseFloat(o2.toFixed(1)) };
      });
      const lastStep = steps[steps.length - 1];
      const futureRisk = calcRisk({ CO: lastStep.CO, NO2: z.gasLevels.NO2, O2: lastStep.O2, CH4: lastStep.CH4 }, z.temperature);
      const confidence = Math.round(75 + Math.random() * 20);
      return { zone: z, steps, futureRisk, confidence };
    });
  }, [zones]);

  const highRiskCount = predictions.filter(p => p.futureRisk === 'critical').length;
  const warningCount = predictions.filter(p => p.futureRisk === 'warning').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wide">AI Predictions</h2>
          <p className="text-xs text-muted-foreground">2-hour gas forecasts · Risk timelines · Confidence scores</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Clock className="h-4 w-4" />
          Updated every 30s
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'PREDICTED CRITICAL', value: highRiskCount, icon: <AlertTriangle className="h-5 w-5" />, color: 'text-destructive' },
          { label: 'PREDICTED WARNING', value: warningCount, icon: <TrendingUp className="h-5 w-5" />, color: 'text-warning' },
          { label: 'ZONES SAFE', value: predictions.filter(p => p.futureRisk === 'safe').length, icon: <BrainCircuit className="h-5 w-5" />, color: 'text-success' },
          { label: 'AVG CONFIDENCE', value: `${Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length)}%`, icon: <BrainCircuit className="h-5 w-5" />, color: 'text-accent' },
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

      {/* Risk timeline grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map(p => (
          <div key={p.zone.id} className="card-industrial">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold font-mono">{p.zone.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">{p.confidence}%</span>
                <StatusBadge level={p.futureRisk} label={`→ ${p.futureRisk.toUpperCase()}`} />
              </div>
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={p.steps}>
                  <defs>
                    <linearGradient id={`grad-${p.zone.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={p.futureRisk === 'critical' ? 'hsl(var(--destructive))' : p.futureRisk === 'warning' ? 'hsl(var(--warning))' : 'hsl(var(--success))'} stopOpacity={0.3} />
                      <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="min" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 8 }} tickFormatter={v => `${v}m`} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'hsl(var(--foreground))' }} />
                  <Area type="monotone" dataKey="CO" stroke={p.futureRisk === 'critical' ? 'hsl(var(--destructive))' : p.futureRisk === 'warning' ? 'hsl(var(--warning))' : 'hsl(var(--success))'} fill={`url(#grad-${p.zone.id})`} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
              <span>CO: {p.steps[p.steps.length - 1].CO} ppm</span>
              <span>O₂: {p.steps[p.steps.length - 1].O2}%</span>
              <span>CH₄: {p.steps[p.steps.length - 1].CH4}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
