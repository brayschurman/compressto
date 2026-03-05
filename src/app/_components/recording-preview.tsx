"use client";

import { useEffect, useState } from "react";

type RecordingPreviewProps = {
  blob: Blob | null;
  label: string;
  emptyMessage?: string;
};

export function RecordingPreview({
  blob,
  label,
  emptyMessage = "A compressed preview will appear here after recording.",
}: RecordingPreviewProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setVideoUrl(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  if (!videoUrl) {
    return (
      <section className="overflow-hidden rounded-3xl border border-border/70 bg-stage-900/70 p-6 text-center text-sm text-text-muted shadow-xl shadow-black/25">
        {emptyMessage}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border/70 bg-black/40 shadow-2xl shadow-black/35">
      <div className="border-b border-border/70 bg-stage-900/85 px-4 py-2 text-xs tracking-[0.16em] text-text-secondary">
        {label}
      </div>
      <video
        controls
        playsInline
        src={videoUrl}
        className="aspect-video w-full bg-black object-cover"
      />
    </section>
  );
}
