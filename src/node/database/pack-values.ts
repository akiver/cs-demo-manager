// Packs values as big-endian binary like the analyzer does for bytea columns, used to test decoders.

export function packInt32(values: number[]) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => buffer.writeInt32BE(value, index * 4));

  return buffer;
}

export function packFloat32(values: number[]) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => buffer.writeFloatBE(value, index * 4));

  return buffer;
}

export function packBool(values: boolean[]) {
  return Buffer.from(values.map((value) => (value ? 1 : 0)));
}

// Returns a copy of the buffer that is not aligned on 4 bytes, decoders must support it.
export function unaligned(buffer: Buffer) {
  return Buffer.concat([Buffer.from([0]), buffer]).subarray(1);
}
