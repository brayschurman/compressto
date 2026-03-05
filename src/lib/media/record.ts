const MIME_CANDIDATES = [
  "video/mp4;codecs=h264,aac",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
] as const;

export type RecorderOptions = {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
};

export type RecordingSession = {
  mimeType: string;
  recorder: MediaRecorder;
  stop: () => Promise<Blob>;
};

export function pickSupportedMimeType(
  preferredMimeType?: string,
): string | undefined {
  if (preferredMimeType && MediaRecorder.isTypeSupported(preferredMimeType)) {
    return preferredMimeType;
  }

  return MIME_CANDIDATES.find((candidate) =>
    MediaRecorder.isTypeSupported(candidate),
  );
}

export function startRecording(
  stream: MediaStream,
  options: RecorderOptions,
): RecordingSession {
  const mimeType = pickSupportedMimeType(options.mimeType);

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: options.videoBitsPerSecond,
    audioBitsPerSecond: options.audioBitsPerSecond,
  });

  const chunks: BlobPart[] = [];
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  });

  const stop = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      recorder.addEventListener(
        "stop",
        () => {
          const blob = new Blob(chunks, {
            type: recorder.mimeType ?? mimeType ?? "video/webm",
          });
          resolve(blob);
        },
        { once: true },
      );

      recorder.addEventListener(
        "error",
        () => {
          reject(new Error("Recording failed."));
        },
        { once: true },
      );

      recorder.stop();
    });
  };

  recorder.start(500);

  return {
    mimeType: recorder.mimeType ?? mimeType ?? "video/webm",
    recorder,
    stop,
  };
}
