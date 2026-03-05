type RecorderControlsProps = {
  canRecord: boolean;
  isRecording: boolean;
  isCompressing: boolean;
  onRecord: () => void;
  onStop: () => void;
};

export function RecorderControls({
  canRecord,
  isRecording,
  isCompressing,
  onRecord,
  onStop,
}: RecorderControlsProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 lg:min-h-[24rem]">
      <button
        type="button"
        disabled={!canRecord || isRecording || isCompressing}
        onClick={onRecord}
        className="group relative flex-1 overflow-hidden rounded-3xl border border-primary-300/45 bg-gradient-to-b from-primary-500 to-primary-700 p-5 text-left shadow-xl shadow-primary-900/45 btn-press-bright hover-lift disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
      >
        <span className="relative block text-3xl font-extrabold tracking-[0.16em] text-white">
          REC
        </span>
      </button>
      <button
        type="button"
        disabled={!isRecording}
        onClick={onStop}
        className="group relative flex-1 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-stage-850 to-stage-950 p-5 text-left shadow-xl shadow-black/45 btn-press-bright hover-lift disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
      >
        <span className="relative block text-3xl font-extrabold tracking-[0.16em] text-text-primary">
          DONE
        </span>
      </button>
    </div>
  );
}
