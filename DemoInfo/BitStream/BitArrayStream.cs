using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections;
using System.IO;

namespace DemoInfo.BitStreamImpl
{
	public class BitArrayStream : IBitStream
    {
        BitArray array;

		public int Position { get; private set; }

		public BitArrayStream()
		{
		}

        public BitArrayStream(byte[] data)
		{
			array = new BitArray(data);
			Position = 0;
		}

		public void Initialize(Stream stream)
		{
			using (var memstream = new MemoryStream(checked((int)stream.Length))) {
				stream.CopyTo(memstream);
				array = new BitArray(memstream.GetBuffer());
			}

			Position = 0;
		}

        public void Seek(int pos, SeekOrigin origin)
        {
            if (origin == SeekOrigin.Begin)
                Position = pos;

            if (origin == SeekOrigin.Current)
                Position += pos;

            if (origin == SeekOrigin.End)
                Position = array.Count - pos;
        }

        public uint ReadInt(int numBits)
        {
            uint result = PeekInt(numBits);
            Position += numBits;

            return result;
        }

        public uint PeekInt(int numBits)
        {
            uint result = 0;
            int intPos = 0;

            for (int i = 0; i < numBits; i++)
            {
                result |= ((array[i + Position] ? 1u : 0u) << intPos++);
            }

            return result;
        }

        public bool ReadBit()
        {
            return ReadInt(1) == 1;
        }

        public byte ReadByte()
        {
            return (byte)ReadInt(8);
        }

        public byte ReadByte(int numBits)
        {
            return (byte)ReadInt(numBits);
        }

        public byte[] ReadBytes(int length)
        {
            byte[] result = new byte[length];

            for (int i = 0; i < length; i++)
            {
                result[i] = this.ReadByte();
            }

            return result;
        }

        public string PeekBools(int length)
        {
            byte[] buffer = new byte[length];

            int idx = 0;
            for (int i = Position; i < Math.Min(Position + length, array.Count); i++)
            {
                if (array[i])
                    buffer[idx++] = 49;
                else
                    buffer[idx++] = 48;
            }

            return Encoding.ASCII.GetString(buffer, 0, Math.Min(length, array.Count - Position));
        }

		public int ReadSignedInt(int numBits)
		{
			// Read the int normally and then shift it back and forth to extend the sign bit.
			return (((int)ReadInt(numBits)) << (32 - numBits)) >> (32 - numBits);
		}

		void IDisposable.Dispose()
		{
			array = null;
		}
    }
}
