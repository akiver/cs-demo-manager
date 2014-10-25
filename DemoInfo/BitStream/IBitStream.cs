using System;
using System.IO;

namespace DemoInfo
{
	public interface IBitStream
	{
		void Initialize(Stream stream);

		uint ReadInt(int bits);
		uint PeekInt(int bits);
		bool ReadBit();
		byte ReadByte();
		byte ReadByte(int bits);
		byte[] ReadBytes(int bytes);
	}
}

