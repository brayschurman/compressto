export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );

  const value = bytes / 1024 ** exponent;
  const decimals = exponent === 0 ? 0 : value < 10 ? 2 : 1;

  return `${value.toFixed(decimals)} ${units[exponent]}`;
}

export function getReductionPercent(
  originalBytes: number,
  compressedBytes: number,
): number {
  if (originalBytes <= 0) {
    return 0;
  }

  return Math.max(0, (1 - compressedBytes / originalBytes) * 100);
}

export function blobToFile(
  blob: Blob,
  fileName: string,
  mimeType: string,
): File {
  return new File([blob], fileName, {
    type: mimeType,
    lastModified: Date.now(),
  });
}

export function fileExtensionForMime(mimeType: string): string {
  if (mimeType.includes("quicktime")) {
    return "mov";
  }

  if (mimeType.includes("mp4")) {
    return "mov";
  }

  if (mimeType.includes("webm")) {
    return "webm";
  }

  return "bin";
}

export function buildOutputFilename(
  presetName: string,
  mimeType: string,
  now: Date = new Date(),
): string {
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  const slug = presetName.toLowerCase().replace(/\s+/g, "-");

  return `compress.to-${slug}-${stamp}.${fileExtensionForMime(mimeType)}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
