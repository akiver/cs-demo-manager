using System;
using System.IO;
using DemoInfo.BitStreamImpl;

namespace DemoInfo
{
	public static class BitStreamUtil
	{
		/// <summary>
		/// Creates an instance of the preferred <see cref="BitStream"/> implementation for streams.
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
			return new DebugBitStream(bs1, bs2);
			#else
			var bs = new ManagedBitStream();
			bs.Initialize(stream);
			return bs;
			#endif
		}

		/// <summary>
		/// Creates an instance of the preferred <see cref="BitStream"/> implementation for byte arrays.
		/// </summary>
		public static IBitStream Create(byte[] data)
		{
			#if DEBUG
			var bs1 = new ManagedBitStream();
			bs1.Initialize(new MemoryStream(data));
			var bs2 = new BitArrayStream(data);
			return new DebugBitStream(bs1, bs2);
			#else
			var bs = new ManagedBitStream();
			bs.Initialize(new MemoryStream(data));
			return bs;
			#endif
		}
	}
}

