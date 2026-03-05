"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CompressionProgress } from "~/app/_components/compression-progress";
import { DevicePicker } from "~/app/_components/device-picker";
import { LivePreview } from "~/app/_components/live-preview";
import { PresetSelector } from "~/app/_components/preset-selector";
import { RecorderControls } from "~/app/_components/recorder-controls";
import { RecordingPreview } from "~/app/_components/recording-preview";
import {
  COMPRESSION_PRESETS,
  nativeEncode,
  type CompressionPresetId,
} from "~/lib/encode/nativeEncode";
import { getDevices, type DeviceOption } from "~/lib/media/getDevices";
import { getStream, stopMediaStream } from "~/lib/media/getStream";
import { startRecording } from "~/lib/media/record";
import { buildOutputFilename, formatDuration } from "~/lib/utils/files";

const MAX_DURATION_SECONDS = 120;
const SOURCE_VIDEO_BITS_PER_SECOND = 1_600_000;
const SOURCE_AUDIO_BITS_PER_SECOND = 96_000;

export default function HomePage() {
  const [cameras, setCameras] = useState<DeviceOption[]>([]);
  const [microphones, setMicrophones] = useState<DeviceOption[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState("");

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(MAX_DURATION_SECONDS);

  const [presetId, setPresetId] = useState<CompressionPresetId>("medium");
  const [originalBlob, setOriginalBlob] = useState<Blob | null>(null);
  const [lastCompressedPresetName, setLastCompressedPresetName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderStopRef = useRef<(() => Promise<Blob>) | null>(null);
  const maxDurationTimeoutRef = useRef<number | null>(null);
  const recordingTickerRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number | null>(null);

  const clearRecordingTimers = useCallback((): void => {
    if (maxDurationTimeoutRef.current !== null) {
      window.clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }

    if (recordingTickerRef.current !== null) {
      window.clearInterval(recordingTickerRef.current);
      recordingTickerRef.current = null;
    }
  }, []);

  const clearRecordingResult = useCallback((): void => {
    setOriginalBlob(null);
    setLastCompressedPresetName("");
    setCompressionProgress(0);
    setErrorMessage(null);
  }, []);

  const refreshDeviceList = useCallback(async (): Promise<void> => {
    const devices = await getDevices();
    setCameras(devices.cameras);
    setMicrophones(devices.microphones);
    setSelectedCameraId((current) =>
      current === "" ? (devices.cameras[0]?.deviceId ?? "") : current,
    );
    setSelectedMicrophoneId(
      (current) =>
        current === "" ? (devices.microphones[0]?.deviceId ?? "") : current,
    );
  }, []);

  const replaceStream = useCallback((nextStream: MediaStream): void => {
    stopMediaStream(streamRef.current);
    streamRef.current = nextStream;
    setStream(nextStream);
  }, []);

  const initializeStream = useCallback(
    async (cameraId?: string, microphoneId?: string): Promise<void> => {
      setErrorMessage(null);

      const nextStream = await getStream({
        cameraDeviceId: cameraId,
        microphoneDeviceId: microphoneId,
      });

      replaceStream(nextStream);
      await refreshDeviceList();
    },
    [refreshDeviceList, replaceStream],
  );

  useEffect(() => {
    const bootstrap = async (): Promise<void> => {
      try {
        await initializeStream();
      } catch {
        setErrorMessage(
          "Camera or microphone access was blocked. Enable permissions and reload.",
        );
      }
    };

    void bootstrap();

    return () => {
      clearRecordingTimers();
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    };
  }, [clearRecordingTimers, initializeStream]);

  useEffect(() => {
    if (!selectedCameraId || !selectedMicrophoneId || isRecording) {
      return;
    }

    const reloadStream = async (): Promise<void> => {
      try {
        await initializeStream(selectedCameraId, selectedMicrophoneId);
      } catch {
        setErrorMessage("Could not switch device. Try another camera or microphone.");
      }
    };

    void reloadStream();
  }, [initializeStream, isRecording, selectedCameraId, selectedMicrophoneId]);

  const stopRecording = useCallback(async (): Promise<void> => {
    const stopFn = recorderStopRef.current;
    if (!stopFn) {
      return;
    }
    recorderStopRef.current = null;

    clearRecordingTimers();
    recordingStartRef.current = null;
    setIsRecording(false);
    setSecondsRemaining(MAX_DURATION_SECONDS);

    try {
      const recordedBlob = await stopFn();
      setOriginalBlob(recordedBlob);
      setLastCompressedPresetName("");
      setCompressionProgress(0);
    } catch {
      setErrorMessage("Recording failed. Please try again.");
    }
  }, [clearRecordingTimers]);

  const startRecordingNow = useCallback((): void => {
    if (!stream) {
      return;
    }

    setErrorMessage(null);
    clearRecordingResult();

    const recording = startRecording(stream, {
      videoBitsPerSecond: SOURCE_VIDEO_BITS_PER_SECOND,
      audioBitsPerSecond: SOURCE_AUDIO_BITS_PER_SECOND,
    });

    recorderStopRef.current = recording.stop;
    setIsRecording(true);
    setSecondsRemaining(MAX_DURATION_SECONDS);
    recordingStartRef.current = Date.now();

    recordingTickerRef.current = window.setInterval(() => {
      const startedAt = recordingStartRef.current;
      if (!startedAt) {
        return;
      }

      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, MAX_DURATION_SECONDS - elapsed);
      setSecondsRemaining(remaining);
    }, 250);

    maxDurationTimeoutRef.current = window.setTimeout(() => {
      void stopRecording();
    }, MAX_DURATION_SECONDS * 1000);
  }, [clearRecordingResult, stopRecording, stream]);

  const handleDeleteRecording = useCallback((): void => {
    if (isRecording || isCompressing) {
      return;
    }

    clearRecordingResult();
    setSecondsRemaining(MAX_DURATION_SECONDS);
  }, [clearRecordingResult, isCompressing, isRecording]);

  const handlePresetSelect = useCallback((nextPresetId: CompressionPresetId): void => {
    setPresetId(nextPresetId);
  }, []);

  const handleHomeReset = useCallback((): void => {
    window.location.assign("/");
  }, []);

  const handleDownloadCompressed = useCallback(async (): Promise<void> => {
    if (!originalBlob || isRecording || isCompressing) {
      return;
    }

    const selectedPreset = COMPRESSION_PRESETS.find(
      (candidate) => candidate.id === presetId,
    );
    if (!selectedPreset) {
      return;
    }

    setErrorMessage(null);
    setLastCompressedPresetName("");
    setCompressionProgress(0);
    setIsCompressing(true);

    try {
      const encoded = await nativeEncode(originalBlob, {
        presetId,
        onProgress: (progress) => {
          setCompressionProgress(progress);
        },
      });

      const outputName = buildOutputFilename(selectedPreset.name, encoded.mimeType);
      const href = URL.createObjectURL(encoded.blob);

      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = outputName;
      anchor.click();

      URL.revokeObjectURL(href);
      setLastCompressedPresetName(selectedPreset.name);
    } catch {
      setErrorMessage("Compression failed. Please try a different setting.");
    } finally {
      setIsCompressing(false);
    }
  }, [isCompressing, isRecording, originalBlob, presetId]);

  const remainingText = `Remaining ${formatDuration(secondsRemaining)}`;

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="text-center animate-slide-up">
        <h1 className="mt-2 text-4xl text-primary-400 sm:text-6xl">
          <button
            type="button"
            onClick={handleHomeReset}
            className="[font:inherit] text-inherit transition-transform duration-200 hover:scale-105 focus-visible:scale-105"
            aria-label="Go home and reset"
          >
            compress.to
          </button>
        </h1>
        <p className="mt-3 text-sm text-text-secondary sm:text-base">
          Client-side video recording compressor.
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-border/70 bg-surface-800/80 p-5 shadow-xl shadow-black/30 backdrop-blur-sm animate-slide-up sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.2em] text-text-secondary">RECORDER</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">
              {originalBlob ? "Review & Download" : "Live Capture"}
            </h2>
          </div>
          {!originalBlob ? (
            <p className="text-xs tracking-[0.16em] text-text-secondary">{remainingText}</p>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          {originalBlob ? (
            <RecordingPreview
              blob={originalBlob}
              label="Recorded Preview"
              emptyMessage="Record a clip to preview it here."
            />
          ) : (
            <LivePreview stream={stream} isRecording={isRecording} />
          )}

          {originalBlob ? (
            <div className="flex h-full flex-col">
              {isCompressing ? (
                <div className="mb-3">
                  <CompressionProgress progress={compressionProgress} />
                </div>
              ) : null}
              <PresetSelector
                value={presetId}
                disabled={isRecording || isCompressing}
                onChange={(nextPresetId) => {
                  handlePresetSelect(nextPresetId);
                }}
              />
              <div className="mt-auto space-y-3 pt-3">
                <button
                  type="button"
                  disabled={isRecording || isCompressing}
                  onClick={() => {
                    void handleDownloadCompressed();
                  }}
                  className="w-full rounded-2xl bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-900/40 btn-press-bright hover-lift disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
                >
                  {isCompressing ? "Downloading..." : "Download"}
                </button>
                <button
                  type="button"
                  disabled={isRecording || isCompressing}
                  onClick={handleDeleteRecording}
                  className="w-full rounded-2xl border border-border/80 bg-stage-900 px-5 py-3 text-sm font-bold text-text-primary btn-press-bright hover-lift disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
                >
                  Record New Clip
                </button>
              </div>
            </div>
          ) : (
            <RecorderControls
              canRecord={Boolean(stream)}
              isRecording={isRecording}
              isCompressing={isCompressing}
              onRecord={startRecordingNow}
              onStop={() => {
                void stopRecording();
              }}
            />
          )}
        </div>

        {!originalBlob ? (
          <DevicePicker
            embedded
            cameras={cameras}
            microphones={microphones}
            selectedCameraId={selectedCameraId}
            selectedMicrophoneId={selectedMicrophoneId}
            disabled={isRecording || isCompressing}
            onCameraChange={setSelectedCameraId}
            onMicrophoneChange={setSelectedMicrophoneId}
          />
        ) : null}
      </section>

      {errorMessage ? (
        <p className="rounded-2xl border border-primary-400/60 bg-primary-100/40 px-4 py-3 text-sm text-text-primary animate-fade-in">
          {errorMessage}
        </p>
      ) : null}
    </main>
  );
}
