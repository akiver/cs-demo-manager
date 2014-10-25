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

		/// <summary>
		/// Gets the current position in bits.
		/// </summary>
		/// <value>The position in bits.</value>
		public int Position { get; private set; }
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
			Debug.Assert(howMuch <= (SLED * 8));

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
			Debug.Assert((Offset + numBits) <= (BitsInBuffer + (SLED * 8)));


			// _      xxxnno      _
			// _   xxxnno         _
			// _    xxxnno  


			return (uint)((BitConverter.ToUInt64(Buffer, (Offset / 8) & ~3) << ((8 * 8) - (Offset % (8 * 4)) - numBits)) >> ((8 * 8) - numBits));
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
			return (byte)ReadInt(bits);
		}

		public byte[] ReadBytes(int bytes)
		{
			var ret = new byte[bytes];
			for (int i = 0; i < bytes; i++)
				ret[i] = ReadByte();
			return ret;
		}
	}
}

