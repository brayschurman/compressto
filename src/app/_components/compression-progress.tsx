type CompressionProgressProps = {
  progress: number;
};

export function CompressionProgress({ progress }: CompressionProgressProps) {
  const progressPercent = Math.round(progress * 100);

  return (
    <section className="rounded-3xl border border-border/70 bg-surface-800/80 p-5 shadow-xl shadow-black/30 backdrop-blur-sm animate-fade-in">
      <div className="mb-2 flex items-center justify-between text-xs tracking-[0.16em] text-text-secondary">
        <span>Compressing</span>
        <span>{progressPercent}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-stage-900">
        <div
          className="h-full rounded-full bg-primary-400 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </section>
  );
}
