export type StreamOptions = {
  cameraDeviceId?: string;
  microphoneDeviceId?: string;
};

export async function getStream(options: StreamOptions): Promise<MediaStream> {
  const video: MediaTrackConstraints = options.cameraDeviceId
    ? { deviceId: { exact: options.cameraDeviceId } }
    : { facingMode: "user" };

  const audio: MediaTrackConstraints | boolean = options.microphoneDeviceId
    ? { deviceId: { exact: options.microphoneDeviceId } }
    : true;

  return navigator.mediaDevices.getUserMedia({ video, audio });
}

export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) {
    return;
  }

  for (const track of stream.getTracks()) {
    track.stop();
  }
}
