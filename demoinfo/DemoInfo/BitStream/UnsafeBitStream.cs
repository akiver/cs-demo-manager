using System;
using System.IO;
using System.Diagnostics;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Runtime.CompilerServices;

namespace DemoInfo.BitStreamImpl
{
	public unsafe class UnsafeBitStream : IBitStream
	{
		private const int SLED = 4;
		private const int BUFSIZE = 2048 + SLED;

		private int Offset;
		private Stream Underlying;
		private GCHandle HBuffer;
		private byte* PBuffer;
		private byte[] Buffer = new byte[BUFSIZE];

		private int BitsInBuffer;
		private bool EndOfStream = false;

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

		~UnsafeBitStream()
		{
			Dispose();
		}

		void IDisposable.Dispose()
		{
			Dispose();
			GC.SuppressFinalize(this);
		}

		private void Dispose()
		{
			var nullptr = (byte*)IntPtr.Zero.ToPointer();
			if (PBuffer != nullptr) {
				// GCHandle docs state that Free() must only be called once.
				// So we use PBuffer to ensure that.
				PBuffer = nullptr;
				HBuffer.Free();
			}
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		private bool TryAdvance(int howMuch)
		{
			/*
			 * So the problem is: Apparently mono can't inline the old Advance() because
			 * that would mess up the call stack: Advance->RefillBuffer->Stream.Read
			 * which could then throw. Advance's stack frame would be missing.
			 *
			 * Because of that, the call to RefillBuffer has to be inlined manually:
			 * if (TryAdvance(howMuch)) RefillBuffer();
			 *
			 * Ugly, but it works.
			 */
			return (Offset += howMuch) >= BitsInBuffer;
		}

		private void RefillBuffer()
		{
			do {
				/*
				 * End of stream detection:
				 * These if clauses are kinda reversed, so this is how we're gonna do it:
				 * a) your average read:
				 *    None of them trigger. End of story.
				 * b) the first read into the last buffer:
				 *    the (thisTime == 0) down there fires
				 * c) the LAST read (end of stream follows):
				 *    the if (EndOfStream) fires, setting BitsInBuffer to 0 and zeroing out
				 *    the head of the buffer, so we read zeroes instead of random other stuff
				 * d) the (overflowing) read after the last read:
				 *    BitsInBuffer is 0 now, so we throw
				 *
				 * Just like chunking, this safety net has as little performance overhead as possible,
				 * at the cost of throwing later than it could (which can be too late in some
				 * scenarios; as in: you stop using the bitstream before it throws).
				 */
				if (EndOfStream) {
					if (BitsInBuffer == 0)
						throw new EndOfStreamException();

					/*
					 * Another late overrun detection:
					 * Offset SHOULD be < 0 after this.
					 * So Offset < BitsInBuffer.
					 * So we don't loop again.
					 * If it's not, we'll loop again which is exactly what we want
					 * as we overran the stream and wanna hit the throw above.
					 */
					Offset -= BitsInBuffer + 1;
					LazyGlobalPosition += BitsInBuffer + 1;
					*(uint*)PBuffer = 0; // safety
					BitsInBuffer = 0;
					continue;
				}

				// copy the sled
				*(uint*)PBuffer = *(uint*)(PBuffer + (BitsInBuffer >> 3));

				Offset -= BitsInBuffer;
				LazyGlobalPosition += BitsInBuffer;

				int offset, thisTime = 1337; // I'll cry if this ends up in the generated code
				for (offset = 0; (offset < 4) && (thisTime != 0); offset += thisTime)
					thisTime = Underlying.Read(Buffer, SLED + offset, BUFSIZE - SLED - offset);

				BitsInBuffer = 8 * offset;

				if (thisTime == 0) {
					// end of stream, so we can consume the sled now
					BitsInBuffer += SLED * 8;
					EndOfStream = true;
				}
			} while (Offset >= BitsInBuffer);
		}

		public uint ReadInt(int numBits)
		{
			uint result = PeekInt(numBits);
			if (TryAdvance(numBits)) RefillBuffer();
			return result;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		private uint PeekInt(int numBits, bool mayOverflow = false)
		{
			BitStreamUtil.AssertMaxBits(32, numBits);
			Debug.Assert(mayOverflow || ((Offset + numBits) <= (BitsInBuffer + (SLED * 8))), "gg", "This code just fell apart. We're all dead. Offset={0} numBits={1} BitsInBuffer={2}", Offset, numBits, BitsInBuffer);

			return (uint)(((*(ulong*)(PBuffer + ((Offset >> 3) & ~3))) << ((8 * 8) - ((Offset & ((8 * 4) - 1))) - numBits)) >> ((8 * 8) - numBits));
		}

		public bool ReadBit()
		{
			bool bit = (PBuffer[Offset >> 3] & (1 << (Offset & 7))) != 0;
			if (TryAdvance(1)) RefillBuffer();
			return bit;
		}

		public byte ReadByte()
		{
			var ret = (byte)PeekInt(8);
			if (TryAdvance(8)) RefillBuffer();
			return ret;
		}

		public byte ReadByte(int bits)
		{
			BitStreamUtil.AssertMaxBits(8, bits);
			var ret = (byte)PeekInt(bits);
			if (TryAdvance(bits)) RefillBuffer();
			return ret;
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
			} else if ((Offset & 7) == 0) {
				// zomg we have byte alignment
				int offset = 0;
				while (offset < bytes) {
					int remainingBytes = Math.Min((BitsInBuffer - Offset) >> 3, bytes - offset);
					System.Buffer.BlockCopy(Buffer, Offset >> 3, ret, offset, remainingBytes);
					offset += remainingBytes;
					if (TryAdvance(remainingBytes * 8)) RefillBuffer();
				}
			} else fixed (byte* retptr = ret) {
				int offset = 0;
				while (offset < bytes) {
					int remainingBytes = Math.Min(((BitsInBuffer - Offset) >> 3) + 1, bytes - offset);
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
			int misalign = 8 - (Offset & 7);
			int realign = sizeof(ulong) * 8 - misalign;
			ulong step = ReadByte(misalign);
			var inptr = (ulong*)(PBuffer + (Offset >> 3));
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
			var result = (int)(((long)((*(ulong*)(PBuffer + ((Offset >> 3) & ~3))) << ((8 * 8) - (Offset & ((8 * 4) - 1)) - numBits))) >> ((8 * 8) - numBits));
			if (TryAdvance(numBits)) RefillBuffer();
			return result;
		}

		public float ReadFloat()
		{
			uint iResult = PeekInt(32); // omfg please inline this
			if (TryAdvance(32)) RefillBuffer();
			return *(float*)&iResult; // standard reinterpret cast
		}

		public byte[] ReadBits(int bits)
		{
			byte[] result = new byte[(bits + 7) >> 3];
			ReadBytes(result, bits >> 3);

			if ((bits & 7) != 0)
				result[bits >> 3] = ReadByte(bits & 7);

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
						else if (TryAdvance(4 * 8)) RefillBuffer();
					} else if (TryAdvance(3 * 8)) RefillBuffer();
				} else if (TryAdvance(2 * 8)) RefillBuffer();
			} else if (TryAdvance(1 * 8)) RefillBuffer();

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
						if (EndOfStream)
							throw new EndOfStreamException();

						int unbufferedSkipBits = delta - bufferBits;
						Underlying.Seek((unbufferedSkipBits >> 3) - SLED, SeekOrigin.Current);

						// Read at least 8 bytes, because we rely on that
						int offset, thisTime = 1337; // I'll cry if this ends up in the generated code
						for (offset = 0; (offset < 8) && (thisTime != 0); offset += thisTime)
							thisTime = Underlying.Read(Buffer, offset, BUFSIZE - offset);

						BitsInBuffer = 8 * (offset - SLED);

						if (thisTime == 0) {
							// end of stream, so we can consume the sled now
							BitsInBuffer += SLED * 8;
							EndOfStream = true;
						}

						Offset = unbufferedSkipBits & 7;
						LazyGlobalPosition = target - Offset;
					} else
						// no need to efficiently skip, so just read and discard
						if (TryAdvance(delta)) RefillBuffer();
				} else
					// dammit, can't efficiently skip, so just read and discard
					if (TryAdvance(delta)) RefillBuffer();
			}
		}

		public bool ChunkFinished { get { return ChunkTargets.Peek() == ActualGlobalPosition; } }
	}
}
