import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Wind, Droplets, Gauge } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Zone, Device, Worker, Vehicle, Alert } from '@/lib/simulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  zones: Zone[];
  devices: Device[];
  workers: Worker[];
  vehicles: Vehicle[];
  alerts: Alert[];
}

type GasKey = 'CO' | 'NO2' | 'O2' | 'CH4';

export default function Dashboard({ zones, devices, workers, vehicles, alerts }: Props) {
  const criticalZones = zones.filter(z => z.riskLevel === 'critical').length;
  const warningZones = zones.filter(z => z.riskLevel === 'warning').length;
  const maxCO = zones.length ? Math.max(...zones.map(z => z.gasLevels.CO)) : 0;
  const minO2 = zones.length ? Math.min(...zones.map(z => z.gasLevels.O2)) : 0;
  const activeZones = zones.filter(z => z.fanActive).length;

  const [selectedGas, setSelectedGas] = useState<GasKey>('CO');
  const [trendData, setTrendData] = useState<{ time: string; value: number }[]>([]);
  const tickCount = useRef(0);

  // Build trend data from simulation ticks
  useEffect(() => {
    if (zones.length === 0) return;
    tickCount.current++;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const avg = zones.reduce((s, z) => s + z.gasLevels[selectedGas], 0) / zones.length;
    setTrendData(prev => {
      const next = [...prev, { time: timeStr, value: parseFloat(avg.toFixed(2)) }];
      return next.slice(-40);
    });
  }, [zones, selectedGas]);

  const gasButtons: GasKey[] = ['CO', 'NO2', 'O2', 'CH4'];

  const metricCards = [
    {
      title: 'CRITICAL ZONES',
      value: criticalZones,
      subtitle: `${warningZones} warning zones`,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: criticalZones > 0 ? 'text-destructive' : 'text-success',
      iconColor: criticalZones > 0 ? 'text-destructive' : 'text-warning',
    },
    {
      title: 'MAX CO LEVEL',
      value: `${maxCO.toFixed(1)}`,
      unit: 'ppm',
      subtitle: 'Threshold: 25 ppm',
      icon: <Gauge className="h-5 w-5" />,
      color: maxCO > 25 ? 'text-warning' : 'text-foreground',
      iconColor: 'text-warning',
    },
    {
      title: 'MIN O₂ LEVEL',
      value: `${minO2.toFixed(1)}`,
      unit: '%',
      subtitle: 'Safe minimum: 19.5%',
      icon: <Wind className="h-5 w-5" />,
      color: minO2 < 19.5 ? 'text-destructive' : 'text-foreground',
      iconColor: 'text-accent',
    },
    {
      title: 'ACTIVE ZONES',
      value: activeZones,
      subtitle: 'All zones monitored',
      icon: <Droplets className="h-5 w-5" />,
      color: 'text-accent',
      iconColor: 'text-accent',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Real-Time Monitoring Dashboard</h2>
        <p className="text-sm text-muted-foreground">Underground Mine Environmental Control · VoD Active</p>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(card => (
          <div key={card.title} className="card-industrial flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground tracking-wider">{card.title}</span>
              <span className={card.iconColor}>{card.icon}</span>
            </div>
            <div className="mt-2">
              <span className={`text-3xl font-bold font-mono ${card.color}`}>
                {card.value}
              </span>
              {card.unit && <span className="text-sm text-muted-foreground ml-1">{card.unit}</span>}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">{card.subtitle}</span>
          </div>
        ))}
      </div>

      {/* Chart + Zone cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Gas trend chart */}
        <div className="lg:col-span-3 card-industrial">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold">Gas Level Trend — Main Drive</h3>
              <p className="text-[11px] text-muted-foreground">Last 40 minutes · Live</p>
            </div>
            <div className="flex gap-0.5 bg-muted rounded-md p-0.5">
              {gasButtons.map(gas => (
                <button
                  key={gas}
                  onClick={() => setSelectedGas(gas)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    selectedGas === gas
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {gas}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--warning))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Status Overview */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold">Zone Status Overview</h3>
          <div className="space-y-3 max-h-[340px] overflow-auto pr-1">
            {zones.map(z => (
              <div key={z.id} className="card-industrial py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold font-mono">{z.name}</span>
                  <StatusBadge level={z.riskLevel} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CO</span>
                    <span className="font-medium">{z.gasLevels.CO.toFixed(1)} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">O₂</span>
                    <span className="font-medium">{z.gasLevels.O2.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CH₄</span>
                    <span className="font-medium">{z.gasLevels.CH4.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NO₂</span>
                    <span className="font-medium">{z.gasLevels.NO2.toFixed(2)} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temp</span>
                    <span className="font-medium">{z.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flow</span>
                    <span className="font-medium">{z.airflow.toFixed(2)} m/s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
