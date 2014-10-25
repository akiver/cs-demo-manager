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
			Position = 0;
			/*Position = -(8 * 8);
			Advance(4 * 8);
			Advance(4 * 8);*/
		}

		private void Advance(int howMuch)
		{
			Debug.Assert(howMuch <= (SLED * 8));

			Position += howMuch;
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

		public int ReadSignedInt(int numBits)
		{
			// Read the int normally and then shift it back and forth to extend the sign bit.
			return (((int)ReadInt(numBits)) << (32 - numBits)) >> (32 - numBits);
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

		public string ReadString()
		{
			return ReadString(Int32.MaxValue);
		}

		public string ReadString(int limit)
		{
			var result = new List<byte>(512);
			for (int pos = 0; pos < limit; pos++) {
				var b = ReadByte();
				if ((b == 0) || (b == 10))
					break;
				result.Add(b);
			}
			return Encoding.ASCII.GetString(result.ToArray());
		}

		public uint ReadVarInt()
		{
			uint tmpByte = 0x80;
			uint result = 0;
			for (int count = 0; (tmpByte & 0x80) != 0; count++) {
				if (count > 5)
					throw new InvalidDataException("VarInt32 out of range");
				tmpByte = ReadByte();
				result |= (tmpByte & 0x7F) << (7 * count);
			}
			return result;
		}

		public uint ReadUBitInt()
		{
			uint ret = ReadInt(6);
			switch (ret & (16 | 32))
			{
			case 16:
				ret = (ret & 15) | (ReadInt(4) << 4);
				break;
			case 32:
				ret = (ret & 15) | (ReadInt(8) << 4);
				break;
			case 48:
				ret = (ret & 15) | (ReadInt(32 - 4) << 4);
				break;
			}
			return ret;
		}
	}
}

