import { RiskLevel } from '@/lib/simulation';

const styles: Record<RiskLevel, string> = {
  safe: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function StatusBadge({ level, label }: { level: RiskLevel; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono border ${styles[level]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        level === 'safe' ? 'bg-success' : level === 'warning' ? 'bg-warning' : 'bg-destructive'
      }`} />
      {label || level.toUpperCase()}
    </span>
  );
}
