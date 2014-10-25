using System;
using System.IO;

namespace DemoInfo
{
	public interface IBitStream
	{
		void Initialize(Stream stream);

		uint ReadInt(int bits);
		int ReadSignedInt(int bits);
		uint PeekInt(int bits);
		bool ReadBit();
		byte ReadByte();
		byte ReadByte(int bits);
		byte[] ReadBytes(int bytes);
		string ReadString();
		string ReadString(int size);
		uint ReadVarInt();
		uint ReadUBitInt();
	}
}

