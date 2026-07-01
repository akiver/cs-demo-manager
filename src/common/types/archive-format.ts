// Supported archive formats from which demos can be automatically extracted.
// Values match the archive file extension (without the leading dot).
export const ArchiveFormat = {
  Zip: 'zip',
  Gz: 'gz',
  Bz2: 'bz2',
} as const;

export type ArchiveFormat = (typeof ArchiveFormat)[keyof typeof ArchiveFormat];

export const supportedArchiveFormats: ArchiveFormat[] = [ArchiveFormat.Zip, ArchiveFormat.Gz, ArchiveFormat.Bz2];
