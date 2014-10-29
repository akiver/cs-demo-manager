using System;
using System.IO;
using DemoInfo.BitStreamImpl;
using System.Collections.Generic;
using System.Text;
using System.Diagnostics;

namespace DemoInfo
{
	public static class BitStreamUtil
	{
		/// <summary>
		/// Creates an instance of the preferred <see cref="IBitStream"/> implementation for streams.
		/// </summary>
		public static IBitStream Create(Stream stream)
		{
			#if DEBUG
			byte[] data;
			using (var memstream = new MemoryStream(checked((int)stream.Length))) {
				stream.CopyTo(memstream);
				data = memstream.GetBuffer();
			}

			var bs1 = new BitArrayStream(data);
			var bs2 = new ManagedBitStream();
			bs2.Initialize(new MemoryStream(data));
			var bs3 = new UnsafeBitStream();
			bs3.Initialize(new MemoryStream(data));
			return new DebugBitStream(bs1, new DebugBitStream(bs2, bs3));
			#else
			var bs = new ManagedBitStream();
			bs.Initialize(stream);
			return bs;
			#endif
		}

		/// <summary>
		/// Creates an instance of the preferred <see cref="IBitStream"/> implementation for byte arrays.
		/// </summary>
		public static IBitStream Create(byte[] data)
		{
			#if DEBUG
			var bs1 = new BitArrayStream(data);
			var bs2 = new ManagedBitStream();
			bs2.Initialize(new MemoryStream(data));
			var bs3 = new UnsafeBitStream();
			bs3.Initialize(new MemoryStream(data));
			return new DebugBitStream(bs1, new DebugBitStream(bs2, bs3));
			#else
			var bs = new ManagedBitStream();
			bs.Initialize(new MemoryStream(data));
			return bs;
			#endif
		}

		public static uint ReadUBitInt(this IBitStream bs)
		{
			uint ret = bs.ReadInt(6);
			switch (ret & (16 | 32))
			{
			case 16:
				ret = (ret & 15) | (bs.ReadInt(4) << 4);
				break;
			case 32:
				ret = (ret & 15) | (bs.ReadInt(8) << 4);
				break;
			case 48:
				ret = (ret & 15) | (bs.ReadInt(32 - 4) << 4);
				break;
			}
			return ret;
		}

		public static string ReadString(this IBitStream bs)
		{
			return bs.ReadString(Int32.MaxValue);
		}

		public static string ReadString(this IBitStream bs, int limit)
		{
			var result = new List<byte>(512);
			for (int pos = 0; pos < limit; pos++) {
				var b = bs.ReadByte();
				if ((b == 0) || (b == 10))
					break;
				result.Add(b);
			}
			return Encoding.ASCII.GetString(result.ToArray());
		}

		public static uint ReadVarInt(this IBitStream bs)
		{
			uint tmpByte = 0x80;
			uint result = 0;
			for (int count = 0; (tmpByte & 0x80) != 0; count++) {
				if (count > 5)
					throw new InvalidDataException("VarInt32 out of range");
				tmpByte = bs.ReadByte();
				result |= (tmpByte & 0x7F) << (7 * count);
			}
			return result;
		}

		[Conditional("DEBUG")]
		public static void AssertMaxBits(int max, int actual)
		{
			Debug.Assert(actual <= max, "trying to read too many bits", "Attempted to read {0} bits (max={1})", actual, max);
		}
	}
}

