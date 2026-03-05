import {
  COMPRESSION_PRESETS,
  type CompressionPresetId,
} from "~/lib/encode/nativeEncode";

type PresetSelectorProps = {
  value: CompressionPresetId;
  disabled?: boolean;
  onChange: (presetId: CompressionPresetId) => void;
};

export function PresetSelector({
  value,
  disabled = false,
  onChange,
}: PresetSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-xs tracking-[0.18em] text-text-secondary">Compression Preset</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {COMPRESSION_PRESETS.map((preset) => {
          const isActive = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(preset.id)}
              className={`rounded-2xl border px-3 py-3 text-left btn-press-bright ${
                isActive
                  ? "border-primary-400 bg-primary-200/45 text-text-primary"
                  : "border-border/80 bg-stage-900 text-text-secondary hover:border-primary-300/80 hover:text-text-primary"
              } disabled:cursor-not-allowed disabled:opacity-55`}
            >
              <p className="text-xs font-semibold tracking-[0.12em]">{preset.name}</p>
              <p className="mt-1 text-[11px] normal-case tracking-normal">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
