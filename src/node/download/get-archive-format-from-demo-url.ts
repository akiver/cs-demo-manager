import type { ArchiveFormat } from 'csdm/common/types/archive-format';
import { supportedArchiveFormats } from 'csdm/common/types/archive-format';

// Returns the archive format a demo URL points to, undefined when it's not a supported archive.
// The format is detected from the URL's pathname because download links may hold query parameters, for example
// signed URLs (i.e. https://host/match.dem.zst?token=abc).
export function getArchiveFormatFromDemoUrl(demoUrl: string): ArchiveFormat | undefined {
  const url = URL.parse(demoUrl);
  const pathname = (url?.pathname ?? demoUrl).toLowerCase();

  return supportedArchiveFormats.find((format) => {
    return pathname.endsWith(`.${format}`);
  });
}
