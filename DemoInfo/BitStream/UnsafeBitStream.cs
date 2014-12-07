using System;
using System.IO;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace DemoInfo
{
	public unsafe class UnsafeBitStream : IBitStream
	{
		private static readonly int SLED = 4;
		public static readonly int BUFSIZE = 2048 + SLED;

		/// <summary>
		/// Gets the current position in bits.
		/// </summary>
		/// <value>The position in bits.</value>
		public int Position { get; private set; }
		private int Offset;
		private Stream Underlying;
		private GCHandle HBuffer;
		private byte* PBuffer;
		private byte[] Buffer = new byte[BUFSIZE];

		public int BitsInBuffer;

		public void Initialize(Stream underlying)
		{
			HBuffer = GCHandle.Alloc(Buffer, GCHandleType.Pinned);
			PBuffer = (byte*)HBuffer.AddrOfPinnedObject().ToPointer();

			this.Underlying = underlying;
			RefillBuffer();

			Offset = SLED * 8;
		}

		void IDisposable.Dispose()
		{
			PBuffer = (byte*)IntPtr.Zero.ToPointer(); // null it out
			HBuffer.Free();
			Buffer = null;
		}

		private void Advance(int howMuch)
		{
			Offset += howMuch;
			if (Offset >= BitsInBuffer)
				RefillBuffer();
		}

		private void RefillBuffer()
		{
			// copy the sled
			*(uint*)PBuffer = *(uint*)&PBuffer[(BitsInBuffer / 8)];

			Offset -= BitsInBuffer;
			BitsInBuffer = 8 * Underlying.Read(Buffer, SLED, BUFSIZE - SLED);
			if (BitsInBuffer == 0) // end of stream, so we can consume the sled now
				BitsInBuffer = SLED * 8;
		}

		public uint ReadInt(int numBits)
		{
			uint result = PeekInt(numBits);
			Advance(numBits);
			return result;
		}

		public uint PeekInt(int numBits)
		{
			BitStreamUtil.AssertMaxBits(32, numBits);
			Debug.Assert((Offset + numBits) <= (BitsInBuffer + (SLED * 8)), "gg", "This code just fell apart. We're all dead. Offset={0} numBits={1} BitsInBuffer={2}", Offset, numBits, BitsInBuffer);

			return (uint)(((*(ulong*)(PBuffer + ((Offset / 8) & ~3))) << ((8 * 8) - (Offset % (8 * 4)) - numBits)) >> ((8 * 8) - numBits));
		}

		public bool ReadBit()
		{
			return ReadInt(1) == 1;
		}

		public byte ReadByte()
		{
			return ReadByte(8);
		}

		public byte ReadByte(int bits)
		{
			BitStreamUtil.AssertMaxBits(8, bits);
			return (byte)ReadInt(bits);
		}

		public byte[] ReadBytes(int bytes)
		{
			var ret = new byte[bytes];
			if (bytes < 3) {
				for (int i = 0; i < bytes; i++)
					ret[i] = ReadByte();
			} else if ((Offset % 8) == 0) {
				// zomg we have byte alignment
				int offset = 0;
				while (offset < bytes) {
					int remainingBytes = Math.Min((BitsInBuffer - Offset) / 8, bytes - offset);
					System.Buffer.BlockCopy(Buffer, Offset / 8, ret, offset, remainingBytes);
					offset += remainingBytes;
					Advance(remainingBytes * 8);
				}
			} else fixed (byte* retptr = ret) {
				int offset = 0;
				while (offset < bytes) {
					int remainingBytes = Math.Min((BitsInBuffer - Offset) / 8 + 1, bytes - offset);
					HyperspeedCopyRound(remainingBytes, retptr + offset);
					offset += remainingBytes;
				}
			}
			return ret;
		}

		private void HyperspeedCopyRound(int bytes, byte* retptr) // you spin me right round baby right round...
		{
			// Probably the most significant unsafe speedup:
			// We can copy ~64 bits at a time (vs 8)

			// begin by aligning to the first byte
			int misalign = 8 - (Offset % 8);
			int realign = sizeof(ulong) * 8 - misalign;
			ulong step = ReadByte(misalign);
			var inptr = (ulong*)(PBuffer + (Offset / 8));
			var outptr = (ulong*)retptr;
			// main loop
			for (int i = 0; i < ((bytes - 1) / sizeof(ulong)); i++) {
				ulong current = *inptr++;
				step |= current << misalign;
				*outptr++ = step;
				step = current >> realign;
			}
			// now process the (nonaligned) rest
			int rest = (bytes - 1) % sizeof(ulong);
			Offset += (bytes - rest - 1) * 8;
			var bout = (byte*)outptr;
			bout[0] = (byte)((ReadInt(8 - misalign) << misalign) | step);
			for (int i = 1; i < rest + 1; i++)
				bout[i] |= ReadByte();
		}

		public int ReadSignedInt(int numBits)
		{
			// Just like PeekInt, but we cast to signed long before the shr because we need to sext
			BitStreamUtil.AssertMaxBits(32, numBits);
			var result = (int)(((long)((*(ulong*)(PBuffer + ((Offset / 8) & ~3))) << ((8 * 8) - (Offset % (8 * 4)) - numBits))) >> ((8 * 8) - numBits));
			Advance(numBits);
			return result;
		}

		public float ReadFloat()
		{
			uint iResult = PeekInt(32); // omfg please inline this
			Advance(32);
			return *(float*)&iResult; // standard reinterpret cast
		}
	}
}
