"use client";

import { useEffect, useRef } from "react";

type LivePreviewProps = {
  stream: MediaStream | null;
  isRecording: boolean;
};

export function LivePreview({ stream, isRecording }: LivePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.srcObject = stream;
  }, [stream]);

  return (
    <section className="overflow-hidden rounded-3xl border border-border/70 bg-black/40 shadow-2xl shadow-black/35">
      <div className="flex items-center justify-between border-b border-border/70 bg-stage-900/85 px-4 py-2 text-xs tracking-[0.16em] text-text-secondary">
        <span>Live Preview</span>
        <span className={isRecording ? "text-primary-400" : "text-text-muted"}>
          {isRecording ? "REC" : "READY"}
        </span>
      </div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="aspect-video w-full bg-black object-cover"
      />
    </section>
  );
}
