using System;
using System.IO;
using System.Diagnostics;
using System.Collections.Generic;
using System.Text;

namespace DemoInfo.BitStreamImpl
{
	public class ManagedBitStream : IBitStream
	{
		private static readonly int SLED = 4;
		private static readonly int BUFSIZE = 2048 + SLED;

		private int Offset;
		private Stream Underlying;
		private readonly byte[] Buffer = new byte[BUFSIZE];

		public int BitsInBuffer;

		public void Initialize(Stream underlying)
		{
			this.Underlying = underlying;
			RefillBuffer();

			Offset = SLED * 8;
		}

		private void Advance(int howMuch)
		{
			Debug.Assert(howMuch <= (SLED * 8), "can't advance that far!", "howMuch={0} Offset={1} BitsInBuffer={2}", howMuch, Offset, BitsInBuffer);

			Offset += howMuch;
			if (Offset >= BitsInBuffer)
				RefillBuffer();
		}

		private void RefillBuffer()
		{
			// not even Array.Copy, to hopefully achieve better optimization (just straight 32bit copy)
			// seriously, mono: ༼ つ◕_◕༽つ VECTORIZE PL0X ༼ つ◕_◕༽つ
			for (int i = 0; i < SLED; i++)
				Buffer[i] = Buffer[(BitsInBuffer / 8) + i];

			Offset -= BitsInBuffer;
			BitsInBuffer = 8 * Underlying.Read(Buffer, SLED, BUFSIZE - SLED);
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


			// _      xxxnno      _
			// _   xxxnno         _
			// _    xxxnno  


			return (uint)((BitConverter.ToUInt64(Buffer, (Offset / 8) & ~3) << ((8 * 8) - (Offset % (8 * 4)) - numBits)) >> ((8 * 8) - numBits));
		}

		public int ReadSignedInt(int numBits)
		{
			BitStreamUtil.AssertMaxBits(32, numBits);

			// Just like PeekInt, but we cast to signed long before the shr because we need to sext
			var result = (int)(((long)(BitConverter.ToUInt64(Buffer, (Offset / 8) & ~3) << ((8 * 8) - (Offset % (8 * 4)) - numBits))) >> ((8 * 8) - numBits));
			Advance(numBits);
			return result;
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
			for (int i = 0; i < bytes; i++)
				ret[i] = ReadByte();
			return ret;
		}

		void IDisposable.Dispose()
		{
		}

		public float ReadFloat()
		{
			return BitConverter.ToSingle(ReadBytes(4), 0);
		}

		public byte[] ReadBits(int bits)
		{
			byte[] result = new byte[(bits + 7) / 8];

			for (int i = 0; i < (bits / 8); i++)
				result[i] = this.ReadByte();

			if ((bits % 8) != 0)
				result[bits / 8] = ReadByte(bits % 8);

			return result;
		}
	}
}

