// Supported archive formats from which demos can be automatically extracted.
// Values match the archive file extension (without the leading dot).
export const ArchiveFormat = {
  Zip: 'zip',
  Gz: 'gz',
  Bz2: 'bz2',
  Zst: 'zst',
} as const;

export type ArchiveFormat = (typeof ArchiveFormat)[keyof typeof ArchiveFormat];

export const supportedArchiveFormats: ArchiveFormat[] = [
  ArchiveFormat.Zip,
  ArchiveFormat.Gz,
  ArchiveFormat.Bz2,
  ArchiveFormat.Zst,
];

// Archive formats holding a single compressed stream, unlike .zip which may hold several files.
export type SingleStreamArchiveFormat = Exclude<ArchiveFormat, typeof ArchiveFormat.Zip>;

const singleStreamArchiveFormats: SingleStreamArchiveFormat[] = [
  ArchiveFormat.Gz,
  ArchiveFormat.Bz2,
  ArchiveFormat.Zst,
];

export function isSingleStreamArchiveFormat(value: string): value is SingleStreamArchiveFormat {
  return singleStreamArchiveFormats.some((format) => {
    return format === value;
  });
}
