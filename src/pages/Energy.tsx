import { useMemo } from 'react';
import { Zap, TrendingDown, Leaf, DollarSign } from 'lucide-react';
import { Zone } from '@/lib/simulation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Props {
  zones: Zone[];
}

export default function Energy({ zones }: Props) {
  const data = useMemo(() => {
    return zones.map(z => {
      const actual = z.fanActive ? z.fanSpeed * 1.8 : 0;
      const expected = 100 * 1.8;
      return {
        name: z.name.split(' ').slice(0, 2).join(' '),
        actual: Math.round(actual),
        expected: Math.round(expected),
        savings: Math.round(expected - actual),
      };
    });
  }, [zones]);

  const totalActual = data.reduce((s, d) => s + d.actual, 0);
  const totalExpected = data.reduce((s, d) => s + d.expected, 0);
  const totalSavings = totalExpected - totalActual;
  const savingsPercent = totalExpected > 0 ? ((totalSavings / totalExpected) * 100).toFixed(1) : '0';
  const costSaved = (totalSavings * 0.12).toFixed(0);
  const co2Saved = (totalSavings * 0.0005).toFixed(1);

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    actual: Math.round(totalActual * (0.6 + Math.random() * 0.8)),
    baseline: totalExpected,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold font-mono tracking-wide">Energy Dashboard</h2>
        <p className="text-xs text-muted-foreground">VoD power optimization · Cost & emissions tracking</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ACTUAL POWER', value: `${totalActual} kW`, icon: <Zap className="h-5 w-5" />, color: 'text-accent' },
          { label: 'VoD SAVINGS', value: `${savingsPercent}%`, icon: <TrendingDown className="h-5 w-5" />, color: 'text-success' },
          { label: 'COST SAVED', value: `$${costSaved}/hr`, icon: <DollarSign className="h-5 w-5" />, color: 'text-warning' },
          { label: 'CO₂ REDUCED', value: `${co2Saved} t`, icon: <Leaf className="h-5 w-5" />, color: 'text-success' },
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
        {/* Actual vs Expected bar chart */}
        <div className="card-industrial">
          <h3 className="text-sm font-bold font-mono mb-1">Actual vs Expected Power by Zone</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Green = VoD savings</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expected" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24h trend */}
        <div className="card-industrial">
          <h3 className="text-sm font-bold font-mono mb-1">24-Hour Power Trend</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Actual vs baseline</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'hsl(var(--foreground))' }} />
                <Line type="monotone" dataKey="actual" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
