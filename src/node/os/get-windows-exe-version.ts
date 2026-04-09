import fs from 'node:fs/promises';

// Returns the version string of a Windows executable by parsing its embedded version resource.
// ! This only works for executables that embed a VS_VERSION_INFO resource.
export async function getWindowsExeVersion(executablePath: string): Promise<string | undefined> {
  const fd = await fs.open(executablePath, 'r');
  const buffer = Buffer.alloc(1024 * 512);
  await fd.read(buffer, 0, buffer.length, 0);
  await fd.close();

  // Find 'VS_VERSION_INFO' magic bytes to locate the VS_FIXEDFILEINFO structure in the executable's version resource.
  const magic = Buffer.from('VS_VERSION_INFO', 'utf16le');
  const index = buffer.indexOf(magic);
  if (index === -1) {
    logger.error(`Failed to find executable version info in ${executablePath}`);
    throw new Error('Version info not found');
  }

  // https://learn.microsoft.com/en-us/windows/win32/api/verrsrc/ns-verrsrc-vs_fixedfileinfo
  // The VS_FIXEDFILEINFO structure immediately follows the 'VS_VERSION_INFO' string.
  const base = index + magic.length + 2; // 2 bytes for its null terminator
  // VS_FIXEDFILEINFO layout (all fields are 4 bytes, little-endian):
  //   offset  0: dwSignature      (magic value 0xFEEF04BD)
  //   offset  4: dwStrucVersion
  //   offset  8: dwFileVersionMS  (upper 32 bits of the file version)
  //   offset 12: dwFileVersionLS  (lower 32 bits of the file version)
  const fileVersionMS = buffer.readUInt32LE(base + 8);
  const fileVersionLS = buffer.readUInt32LE(base + 12);

  // The high 16 bits of fileVersionMS hold the major version, the low 16 bits hold the minor version.
  // The high 16 bits of fileVersionLS hold the patch version, and the low 16 bits hold the build number.
  const major = (fileVersionMS >> 16) & 0xffff;
  const minor = fileVersionMS & 0xffff;
  const patch = (fileVersionLS >> 16) & 0xffff;
  const build = fileVersionLS & 0xffff;

  return `${major}.${minor}.${patch}.${build}`;
}
