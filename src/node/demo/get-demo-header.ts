import fs from 'fs-extra';
import { CDemoFileHeaderSchema, fromBinary } from 'csgo-protobuf';
import { InvalidDemoHeader } from './errors/invalid-demo-header';

class BitStream {
  private buffer: Buffer;
  private raw: Uint8Array;
  private bitOffset = 0;
  private bitsInBuffer = 0;
  private sled = 8;
  private sledBits = this.sled << 3;
  private position = 0;

  constructor(buffer: Buffer) {
    if ((buffer.length & (this.sled - 1)) !== 0) {
      throw new Error(`Buffer must be a multiple of ${this.sled}`);
    }
    if (buffer.length < this.sled << 1) {
      throw new Error(`Buffer must be larger than ${this.sled << 1}`);
    }

    this.buffer = buffer;
    this.raw = new Uint8Array(buffer);
    this.bitsInBuffer = (this.raw.length << 3) - this.sledBits;
    if (this.bitsInBuffer < 0) {
      this.bitsInBuffer += this.sledBits;
    }
  }

  public readVarInt32(): number {
    let res = 0;
    let b = 0x80;

    for (let count = 0; (b & 0x80) !== 0 && count !== 5; count++) {
      b = this.readByte();
      res |= (b & 0x7f) << (7 * count);
    }

    return res;
  }

  public readBytes(bitCount: number): Uint8Array {
    const res = this.raw.subarray(this.bitOffset >> 3, (this.bitOffset >> 3) + bitCount);
    this.advance(bitCount << 3);

    return res;
  }

  public readByte(): number {
    const res = this.raw[this.bitOffset >> 3];
    this.advance(8);

    return res;
  }

  public advance(bitCount: number) {
    this.bitOffset += bitCount;
    while (this.bitOffset > this.bitsInBuffer) {
      this.refillBuffer();
    }
  }

  private refillBuffer() {
    this.raw.set(this.raw.subarray(this.bitsInBuffer >> 3, (this.bitsInBuffer >> 3) + this.sled), 0);

    this.bitOffset -= this.bitsInBuffer;
    this.position += this.bitsInBuffer;

    const newByteCount = this.buffer.copy(this.raw, this.sled, this.position, this.position + this.sled);
    this.bitsInBuffer = newByteCount << 3;
  }
}

export type DemoHeaderSource1 = {
  filestamp: 'HL2DEMO';
  serverName: string;
  clientName: string;
  mapName: string;
  networkProtocol: number;
  playbackTime: number;
  playbackTicks: number;
  playbackFrames: number;
  signonLength: number;
};

type DemoHeaderSource2 = {
  filestamp: 'PBDEMS2';
  serverName: string;
  clientName: string;
  mapName: string;
  networkProtocol: number;
  buildNumber: number;
  demoVersionGuid: string;
  demoVersionName: string;
  game: string; // Seems to be present only with POV demos, we could use it to detect them.
};

export type DemoHeader = DemoHeaderSource1 | DemoHeaderSource2;

function removeNullBytesFromString(value: string) {
  return value.replaceAll('\0', '');
}

function removeUnicodeReplacementChars(value: string) {
  return value.replaceAll('\uFFFD', '');
}

function readSource1DemoHeader(buffer: Buffer) {
  // const protocol = buffer.readUInt32LE(8); // 4
  const networkProtocol = buffer.readUInt32LE(12); // 4
  const serverName = removeNullBytesFromString(buffer.toString('utf8', 16, 276)); // 260
  const clientName = removeNullBytesFromString(buffer.toString('utf8', 276, 536)); // 260
  const mapName = removeNullBytesFromString(buffer.toString('utf8', 536, 796)); // 260
  // const gameDirectory = removeNullBytesFromString(buffer.toString('utf8', 796, 1056)); // 260
  const playbackTime = buffer.readFloatLE(1056); // 4
  const playbackTicks = buffer.readUInt32LE(1060); // 4
  const playbackFrames = buffer.readUInt32LE(1064); // 4
  const signonLength = buffer.readUInt32LE(1068); // 4

  const header: DemoHeader = {
    filestamp: 'HL2DEMO',
    networkProtocol,
    serverName,
    clientName,
    mapName,
    playbackTime,
    playbackTicks,
    playbackFrames,
    signonLength,
  };

  return header;
}

function readSource2DemoHeader(buffer: Buffer) {
  const stream = new BitStream(buffer);
  stream.advance(128); // Skip filestamp + 8 bytes (4 bytes for the expected demo data length and the rest of unknown data)

  const type = stream.readVarInt32();
  // The first proto message should always be EDemoCommands.DEM_FileHeader
  if (type !== 1) {
    throw new InvalidDemoHeader('Unexpected first proto message type');
  }

  stream.readVarInt32(); // tick
  const size = stream.readVarInt32();
  const bytes = stream.readBytes(size);
  const msg = fromBinary(CDemoFileHeaderSchema, bytes);
  if (
    !msg.networkProtocol ||
    !msg.serverName ||
    !msg.clientName ||
    !msg.mapName ||
    !msg.buildNum ||
    !msg.demoVersionGuid ||
    !msg.demoVersionName
  ) {
    throw new InvalidDemoHeader('Missing required protobuf fields');
  }

  const header: DemoHeader = {
    filestamp: 'PBDEMS2',
    networkProtocol: msg.networkProtocol,
    serverName: removeUnicodeReplacementChars(msg.serverName),
    clientName: removeUnicodeReplacementChars(msg.clientName),
    mapName: msg.mapName,
    buildNumber: msg.buildNum,
    demoVersionGuid: msg.demoVersionGuid,
    demoVersionName: msg.demoVersionName,
    game: msg.game,
  };

  return header;
}

export async function getDemoHeader(demoFilePath: string): Promise<DemoHeader> {
  const fd = await fs.open(demoFilePath, 'r');

  try {
    // The buffer size is arbitrary, we don't need to read the whole demo but we don't know yet the size of the
    // CDemoFileHeader message for Source 2 demos.
    const bufferSize = 4096;
    const buffer = Buffer.alloc(bufferSize);
    await fs.read(fd, buffer, 0, bufferSize, null);
    const filestamp = removeNullBytesFromString(buffer.toString('utf8', 0, 8)); // 8

    if (filestamp === 'HL2DEMO') {
      return readSource1DemoHeader(buffer);
    }

    if (filestamp === 'PBDEMS2') {
      return readSource2DemoHeader(buffer);
    }

    throw new InvalidDemoHeader(`Invalid filestamp ${filestamp}`);
  } finally {
    await fs.close(fd);
  }
}
