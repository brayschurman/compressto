export type DeviceOption = {
  deviceId: string;
  label: string;
};

export type MediaDeviceOptions = {
  cameras: DeviceOption[];
  microphones: DeviceOption[];
};

const FALLBACK_CAMERA_LABEL = "Camera";
const FALLBACK_MIC_LABEL = "Microphone";

function normalizeLabel(label: string, fallback: string, index: number): string {
  const trimmed = label.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }

  return `${fallback} ${index + 1}`;
}

export async function getDevices(): Promise<MediaDeviceOptions> {
  const devices = await navigator.mediaDevices.enumerateDevices();

  const cameras = devices
    .filter((device) => device.kind === "videoinput")
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: normalizeLabel(device.label, FALLBACK_CAMERA_LABEL, index),
    }));

  const microphones = devices
    .filter((device) => device.kind === "audioinput")
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: normalizeLabel(device.label, FALLBACK_MIC_LABEL, index),
    }));

  return { cameras, microphones };
}
