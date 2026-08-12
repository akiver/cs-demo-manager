import { describe, expect, it } from 'vite-plus/test';
import { ArchiveFormat } from 'csdm/common/types/archive-format';
import { getArchiveFormatFromDemoUrl } from './get-archive-format-from-demo-url';

describe('Get archive format from demo URL', () => {
  it('given a URL without query parameters, when getting its archive format, then the format is returned', () => {
    // Given
    const demoUrls = [
      'https://host.com/match.dem.zst',
      'https://host.com/match.dem.gz',
      'https://host.com/match.dem.bz2',
      'https://host.com/match.zip',
    ];

    // When
    const formats = demoUrls.map(getArchiveFormatFromDemoUrl);

    // Then
    expect(formats).toStrictEqual([ArchiveFormat.Zst, ArchiveFormat.Gz, ArchiveFormat.Bz2, ArchiveFormat.Zip]);
  });

  it('given a signed URL holding query parameters, when getting its archive format, then they are ignored', () => {
    // Given
    const demoUrl = 'https://host.com/match.dem.zst?token=abc&expires=1';

    // When
    const format = getArchiveFormatFromDemoUrl(demoUrl);

    // Then
    expect(format).toBe(ArchiveFormat.Zst);
  });

  it('given a query parameter holding another extension, when getting the format, then the pathname wins', () => {
    // Given
    const demoUrl = 'https://host.com/folder.zip/match.dem.zst?file=demo.zip';

    // When
    const format = getArchiveFormatFromDemoUrl(demoUrl);

    // Then
    expect(format).toBe(ArchiveFormat.Zst);
  });

  it('given a URL holding a fragment, when getting its archive format, then it is ignored', () => {
    // Given
    const demoUrl = 'https://host.com/match.dem.zst#fragment';

    // When
    const format = getArchiveFormatFromDemoUrl(demoUrl);

    // Then
    expect(format).toBe(ArchiveFormat.Zst);
  });

  it('given a URL holding an uppercase extension, when getting its archive format, then the case is ignored', () => {
    // Given
    const demoUrl = 'https://host.com/MATCH.DEM.ZST';

    // When
    const format = getArchiveFormatFromDemoUrl(demoUrl);

    // Then
    expect(format).toBe(ArchiveFormat.Zst);
  });

  it('given a URL that is not a supported archive, when getting its archive format, then undefined is returned', () => {
    // Given
    const demoUrls = [
      'https://host.com/match.dem',
      'https://host.com/match.dem.rar?token=abc',
      'https://host.com/',
      '',
    ];

    // When
    const formats = demoUrls.map(getArchiveFormatFromDemoUrl);

    // Then
    expect(formats).toStrictEqual([undefined, undefined, undefined, undefined]);
  });
});
