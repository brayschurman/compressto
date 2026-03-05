import {
  COMPRESSION_PRESETS,
  type CompressionPresetId,
} from "~/lib/encode/nativeEncode";

type PresetSelectorProps = {
  value: CompressionPresetId;
  disabled?: boolean;
  className?: string;
  onChange: (presetId: CompressionPresetId) => void;
};

export function PresetSelector({
  value,
  disabled = false,
  className,
  onChange,
}: PresetSelectorProps) {
  return (
    <div className={`flex h-full min-h-0 flex-col ${className ?? ""}`}>
      <p className="mb-2 text-xs tracking-[0.18em] text-text-secondary">Compression Preset</p>
      <div className="grid flex-1 gap-2 sm:grid-cols-3">
        {COMPRESSION_PRESETS.map((preset) => {
          const isActive = value === preset.id;
          const presetMark = preset.name.charAt(0);
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(preset.id)}
              className={`flex h-full min-h-[10.5rem] flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center btn-press-bright ${
                isActive
                  ? "border-primary-400 bg-primary-200/45 text-text-primary"
                  : "border-border/80 bg-stage-900 text-text-secondary hover:border-primary-300/80 hover:text-text-primary"
              } disabled:cursor-not-allowed disabled:opacity-55`}
            >
              <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/40 text-xs font-semibold tracking-[0.12em]">
                {presetMark}
              </span>
              <p className="text-sm font-semibold tracking-[0.14em] uppercase">
                {preset.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
