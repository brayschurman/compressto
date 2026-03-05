import { formatBytes } from "~/lib/utils/files";

type DownloadSharePanelProps = {
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  mimeType: string;
  onDownload: () => void;
  onShare?: () => void;
};

export function DownloadSharePanel({
  originalSize,
  compressedSize,
  reductionPercent,
  mimeType,
  onDownload,
  onShare,
}: DownloadSharePanelProps) {
  return (
    <section className="rounded-3xl border border-border/70 bg-surface-800/85 p-5 shadow-xl shadow-black/30 backdrop-blur-sm animate-fade-in">
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-stage-900/75 px-4 py-3">
          <p className="text-xs tracking-[0.14em] text-text-muted">Original</p>
          <p className="mt-1 text-text-primary">{formatBytes(originalSize)}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-stage-900/75 px-4 py-3">
          <p className="text-xs tracking-[0.14em] text-text-muted">Compressed</p>
          <p className="mt-1 text-text-primary">{formatBytes(compressedSize)}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-stage-900/75 px-4 py-3">
          <p className="text-xs tracking-[0.14em] text-text-muted">Reduction</p>
          <p className="mt-1 text-primary-300">{reductionPercent.toFixed(1)}%</p>
        </div>
      </div>

      <p className="mt-3 text-xs tracking-[0.14em] text-text-muted">{mimeType}</p>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="flex-1 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary-900/40 btn-press-bright hover-lift"
        >
          Download
        </button>
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className="flex-1 rounded-2xl border border-border/80 bg-stage-900 px-4 py-3 text-sm font-bold text-text-primary btn-press-bright hover-lift"
          >
            Share
          </button>
        ) : null}
      </div>
    </section>
  );
}
