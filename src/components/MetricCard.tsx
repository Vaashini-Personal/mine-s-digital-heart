import { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  variant?: 'default' | 'success' | 'warning' | 'critical';
}

const variantClasses = {
  default: 'border-border',
  success: 'border-success/30 glow-safe',
  warning: 'border-warning/30 glow-warning',
  critical: 'border-destructive/30 glow-critical',
};

export function MetricCard({ title, value, subtitle, icon, variant = 'default' }: Props) {
  return (
    <div className={`card-industrial ${variantClasses[variant]} flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono uppercase">{title}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
      {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
    </div>
  );
}
