// Used to read values packed as big-endian binary in bytea columns.
export function createDataView(buffer: Buffer) {
  // Buffers may not be aligned on 4 bytes, a DataView doesn't require it unlike typed arrays.
  return new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
