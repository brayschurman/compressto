import { pickSupportedMimeType, startRecording } from "~/lib/media/record";

export type CompressionPresetId =
  | "large"
  | "medium"
  | "small";

export type CompressionPreset = {
  id: CompressionPresetId;
  name: string;
  description: string;
  maxWidth: number;
  fps: number;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
  pixelation: number;
};

export const COMPRESSION_PRESETS: CompressionPreset[] = [
  {
    id: "large",
    name: "Large",
    description: "Best quality for short iMessage clips",
    maxWidth: 640,
    fps: 24,
    videoBitsPerSecond: 700_000,
    audioBitsPerSecond: 96_000,
    pixelation: 1,
  },
  {
    id: "medium",
    name: "Medium",
    description: "Balanced size and clarity for everyday texting",
    maxWidth: 480,
    fps: 20,
    videoBitsPerSecond: 450_000,
    audioBitsPerSecond: 64_000,
    pixelation: 1,
  },
  {
    id: "small",
    name: "Small",
    description: "Smallest iMessage-friendly output with solid quality",
    maxWidth: 360,
    fps: 18,
    videoBitsPerSecond: 280_000,
    audioBitsPerSecond: 48_000,
    pixelation: 1,
  },
];

export type NativeEncodeOptions = {
  presetId: CompressionPresetId;
  onProgress?: (progress: number) => void;
};

export type NativeEncodeResult = {
  blob: Blob;
  mimeType: string;
};

const MAX_PROGRESS = 0.98;

function waitForEvent<T extends Event>(
  target: EventTarget,
  eventName: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const onSuccess = (event: Event): void => {
      cleanup();
      resolve(event as T);
    };

    const onError = (): void => {
      cleanup();
      reject(new Error(`Failed while waiting for ${eventName}.`));
    };

    const cleanup = (): void => {
      target.removeEventListener(eventName, onSuccess);
      target.removeEventListener("error", onError);
    };

    target.addEventListener(eventName, onSuccess, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

function getPreset(presetId: CompressionPresetId): CompressionPreset {
  const preset = COMPRESSION_PRESETS.find((item) => item.id === presetId);
  if (!preset) {
    throw new Error("Unknown compression preset.");
  }

  return preset;
}

function computeTargetSize(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
): { width: number; height: number } {
  const width = Math.max(2, Math.min(maxWidth, sourceWidth));
  const ratio = width / sourceWidth;
  const scaledHeight = Math.max(2, Math.round(sourceHeight * ratio));

  return {
    width,
    height: scaledHeight % 2 === 0 ? scaledHeight : scaledHeight + 1,
  };
}

export async function nativeEncode(
  inputBlob: Blob,
  options: NativeEncodeOptions,
): Promise<NativeEncodeResult> {
  const preset = getPreset(options.presetId);
  const objectUrl = URL.createObjectURL(inputBlob);

  const videoElement = document.createElement("video");
  videoElement.src = objectUrl;
  videoElement.preload = "metadata";
  // Keep the element unmuted so MediaElementSource includes audio in the mix.
  // We never connect this graph to AudioContext.destination, so it stays silent.
  videoElement.muted = false;
  videoElement.playsInline = true;

  try {
    await waitForEvent<Event>(videoElement, "loadedmetadata");

    const { width, height } = computeTargetSize(
      videoElement.videoWidth,
      videoElement.videoHeight,
      preset.maxWidth,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw new Error("Failed to initialize canvas context.");
    }
    context.imageSmoothingEnabled = false;
    context.imageSmoothingQuality = "low";

    const pixelation = Math.max(1, Math.floor(preset.pixelation));
    const downscaledWidth = Math.max(2, Math.floor(width / pixelation));
    const downscaledHeight = Math.max(2, Math.floor(height / pixelation));

    const pixelCanvas = document.createElement("canvas");
    pixelCanvas.width = downscaledWidth;
    pixelCanvas.height = downscaledHeight;
    const pixelContext = pixelCanvas.getContext("2d", { alpha: false });
    if (!pixelContext) {
      throw new Error("Failed to initialize pixel canvas context.");
    }
    pixelContext.imageSmoothingEnabled = true;
    pixelContext.imageSmoothingQuality = "medium";

    const visualStream = canvas.captureStream(preset.fps);

    const audioContext = new AudioContext();
    const sourceNode = audioContext.createMediaElementSource(videoElement);
    const gainNode = audioContext.createGain();
    const destination = audioContext.createMediaStreamDestination();

    gainNode.gain.value = 1;
    sourceNode.connect(gainNode);
    gainNode.connect(destination);

    const mixedTracks = [
      ...visualStream.getVideoTracks(),
      ...destination.stream.getAudioTracks(),
    ];

    const mixedStream = new MediaStream(mixedTracks);

    const mimeType =
      pickSupportedMimeType("video/mp4;codecs=h264,aac") ??
      pickSupportedMimeType("video/mp4") ??
      pickSupportedMimeType("video/webm;codecs=vp8,opus") ??
      pickSupportedMimeType("video/webm");

    const recording = startRecording(mixedStream, {
      mimeType,
      videoBitsPerSecond: preset.videoBitsPerSecond,
      audioBitsPerSecond: preset.audioBitsPerSecond,
    });

    await audioContext.resume();

    const drawFrame = (): void => {
      if (pixelation > 1) {
        pixelContext.drawImage(videoElement, 0, 0, downscaledWidth, downscaledHeight);
        context.drawImage(
          pixelCanvas,
          0,
          0,
          downscaledWidth,
          downscaledHeight,
          0,
          0,
          width,
          height,
        );
      } else {
        context.drawImage(videoElement, 0, 0, width, height);
      }

      if (videoElement.duration > 0) {
        const progress = Math.min(
          MAX_PROGRESS,
          videoElement.currentTime / videoElement.duration,
        );
        options.onProgress?.(progress);
      }
    };

    const useVideoFrameCallback =
      "requestVideoFrameCallback" in HTMLVideoElement.prototype;

    let animationFrameId: number | undefined;
    let videoFrameRequestId: number | undefined;

    const drawLoop = (): void => {
      if (videoElement.paused || videoElement.ended) {
        return;
      }

      drawFrame();

      if (!useVideoFrameCallback) {
        animationFrameId = requestAnimationFrame(drawLoop);
      }
    };

    const scheduleVideoFrameLoop = (): void => {
      const requestVideoFrameCallback = (
        videoElement as HTMLVideoElement & {
          requestVideoFrameCallback: (callback: () => void) => number;
          cancelVideoFrameCallback: (handle: number) => void;
        }
      ).requestVideoFrameCallback.bind(videoElement);

      const onVideoFrame = (): void => {
        drawLoop();
        if (!videoElement.paused && !videoElement.ended) {
          videoFrameRequestId = requestVideoFrameCallback(onVideoFrame);
        }
      };

      videoFrameRequestId = requestVideoFrameCallback(onVideoFrame);
    };

    await videoElement.play();

    if (useVideoFrameCallback) {
      scheduleVideoFrameLoop();
    } else {
      drawLoop();
    }

    await waitForEvent<Event>(videoElement, "ended");

    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
    }
    if (videoFrameRequestId !== undefined) {
      (
        videoElement as HTMLVideoElement & {
          cancelVideoFrameCallback: (handle: number) => void;
        }
      ).cancelVideoFrameCallback(videoFrameRequestId);
    }

    const outputBlob = await recording.stop();
    options.onProgress?.(1);

    for (const track of mixedStream.getTracks()) {
      track.stop();
    }
    await audioContext.close();

    return {
      blob: outputBlob,
      mimeType: recording.mimeType,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
