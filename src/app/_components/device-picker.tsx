import type { DeviceOption } from "~/lib/media/getDevices";

type DevicePickerProps = {
  cameras: DeviceOption[];
  microphones: DeviceOption[];
  selectedCameraId: string;
  selectedMicrophoneId: string;
  disabled?: boolean;
  embedded?: boolean;
  onCameraChange: (deviceId: string) => void;
  onMicrophoneChange: (deviceId: string) => void;
};

export function DevicePicker({
  cameras,
  microphones,
  selectedCameraId,
  selectedMicrophoneId,
  disabled = false,
  embedded = false,
  onCameraChange,
  onMicrophoneChange,
}: DevicePickerProps) {
  return (
    <section
      className={
        embedded
          ? "mt-3 grid gap-3 sm:grid-cols-2"
          : "grid gap-4 rounded-3xl border border-border/70 bg-surface-800/80 p-5 shadow-xl shadow-black/30 backdrop-blur-sm sm:grid-cols-2"
      }
    >
      <label className="space-y-2">
        <span className="block text-xs tracking-[0.18em] text-text-secondary">
          Camera
        </span>
        <select
          value={selectedCameraId}
          disabled={disabled || cameras.length === 0}
          onChange={(event) => onCameraChange(event.target.value)}
          className="w-full rounded-2xl border border-border/80 bg-stage-900 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="block text-xs tracking-[0.18em] text-text-secondary">
          Microphone
        </span>
        <select
          value={selectedMicrophoneId}
          disabled={disabled || microphones.length === 0}
          onChange={(event) => onMicrophoneChange(event.target.value)}
          className="w-full rounded-2xl border border-border/80 bg-stage-900 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {microphones.map((microphone) => (
            <option key={microphone.deviceId} value={microphone.deviceId}>
              {microphone.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
