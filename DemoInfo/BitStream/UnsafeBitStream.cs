using System;
using System.IO;
using System.Diagnostics;
using System.Collections.Generic;
using System.Runtime.InteropServices;

namespace DemoInfo.BitStreamImpl
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

		private readonly Stack<long> ChunkTargets = new Stack<long>();
		private long LazyGlobalPosition = 0;
		private long ActualGlobalPosition { get { return LazyGlobalPosition + Offset; } }

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
			while (Offset >= BitsInBuffer)
				RefillBuffer();
		}

		private void RefillBuffer()
		{
			// copy the sled
			*(uint*)PBuffer = *(uint*)&PBuffer[(BitsInBuffer / 8)];

			Offset -= BitsInBuffer;
			LazyGlobalPosition += BitsInBuffer;

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

		private uint PeekInt(int numBits, bool mayOverflow = false)
		{
			BitStreamUtil.AssertMaxBits(32, numBits);
			Debug.Assert(mayOverflow || ((Offset + numBits) <= (BitsInBuffer + (SLED * 8))), "gg", "This code just fell apart. We're all dead. Offset={0} numBits={1} BitsInBuffer={2}", Offset, numBits, BitsInBuffer);

			return (uint)(((*(ulong*)(PBuffer + ((Offset / 8) & ~3))) << ((8 * 8) - (Offset % (8 * 4)) - numBits)) >> ((8 * 8) - numBits));
		}

		public bool ReadBit()
		{
			bool bit = (Buffer[Offset / 8] & (1 << (Offset & 7))) != 0;
			Advance(1);
			return bit;
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
			ReadBytes(ret, bytes);
			return ret;
		}

		private void ReadBytes(byte[] ret, int bytes)
		{
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

		public byte[] ReadBits(int bits)
		{
			byte[] result = new byte[(bits + 7) / 8];
			ReadBytes(result, bits / 8);

			if ((bits % 8) != 0)
				result[bits / 8] = ReadByte(bits % 8);

			return result;
		}

		// MSB masks (protobuf varint end signal)
		private const uint MSB_1 = 0x00000080;
		private const uint MSB_2 = 0x00008000;
		private const uint MSB_3 = 0x00800000;
		private const uint MSB_4 = 0x80000000;

		// byte masks (except MSB)
		private const uint MSK_1 = 0x0000007F;
		private const uint MSK_2 = 0x00007F00;
		private const uint MSK_3 = 0x007F0000;
		private const uint MSK_4 = 0x7F000000;
		public int ReadProtobufVarInt()
		{
			var availableBits = BitsInBuffer + (SLED * 8) - Offset;
			// Start by overflowingly reading 32 bits.
			// Reading beyond the buffer contents is safe in this case,
			// because the sled ensures that we stay inside of the buffer.
			uint buf = PeekInt(32, true);

			// always take the first bytes; others if necessary
			uint result = buf & MSK_1;
			BitStreamUtil.AssertMaxBits(availableBits, 1 * 8);
			if ((buf & MSB_1) != 0) {
				result |= (buf & MSK_2) >> 1;
				BitStreamUtil.AssertMaxBits(availableBits, 1 * 8);
				if ((buf & MSB_2) != 0) {
					result |= (buf & MSK_3) >> 2;
					BitStreamUtil.AssertMaxBits(availableBits, 2 * 8);
					if ((buf & MSB_3) != 0) {
						result |= (buf & MSK_4) >> 3;
						BitStreamUtil.AssertMaxBits(availableBits, 3 * 8);
						if ((buf & MSB_4) != 0)
							// dammit, it's too large (probably negative)
							// fall back to the slow implementation, that's rare
							return BitStreamUtil.ReadProtobufVarIntStub(this);
						else Advance(4 * 8);
					} else Advance(3 * 8);
				} else Advance(2 * 8);
			} else Advance(1 * 8);

			return unchecked((int)result);
		}

		public void BeginChunk(int length)
		{
			ChunkTargets.Push(ActualGlobalPosition + length);
		}

		public void EndChunk()
		{
			/*
			 * To provide at least a little (and cheap) bit of sanity even
			 * when performance is of utmost importance, this implementation
			 * chooses a nice tradeoff: Unlike the BitArrayStream, it lets you
			 * read beyond chunk boundaries. Here, we have to calculate the
			 * number of read bits anyways so we know how much we need to skip,
			 * so we might as well verify that this difference isn't negative.
			 */
			var target = ChunkTargets.Pop();
			var delta = checked((int)(target - ActualGlobalPosition));
			if (delta < 0)
				throw new InvalidOperationException("Someone read beyond a chunk boundary");
			else if (delta > 0) {
				// so we need to skip stuff. fun.

				if (Underlying.CanSeek) {
					int bufferBits = BitsInBuffer - Offset;
					if ((bufferBits + (SLED * 8)) < delta) {
						int unbufferedSkipBits = delta - bufferBits;
						Underlying.Seek((unbufferedSkipBits >> 3) - SLED, SeekOrigin.Current);

						BitsInBuffer = 8 * (Underlying.Read(Buffer, 0, BUFSIZE) - SLED);
						if (BitsInBuffer < 0)
							BitsInBuffer = SLED * 8;

						Offset = unbufferedSkipBits & 7;
						LazyGlobalPosition = target - Offset;
					} else
						// no need to efficiently skip, so just read and discard
						Advance(delta);
				} else
					// dammit, can't efficiently skip, so just read and discard
					Advance(delta);
			}
		}

		public bool ChunkFinished { get { return ChunkTargets.Peek() == ActualGlobalPosition; } }
	}
}
