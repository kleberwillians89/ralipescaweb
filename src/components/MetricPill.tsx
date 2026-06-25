type MetricPillProps = {
  label: string;
  value: string;
  className?: string;
};

export function MetricPill({ label, value, className = '' }: MetricPillProps) {
  return (
    <div className={`rounded-2xl border border-white/25 bg-white/95 px-4 py-3 shadow-soft ${className}`}>
      <span className="block text-xs text-graphite/70">{label}</span>
      <strong className="mt-1 block text-xl font-bold text-sea">{value}</strong>
    </div>
  );
}
