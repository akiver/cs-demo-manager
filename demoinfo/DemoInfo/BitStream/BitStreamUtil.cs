using System;
using System.IO;
using DemoInfo.BitStreamImpl;
using System.Collections.Generic;
using System.Text;

namespace DemoInfo
{
    public static class BitStreamUtil
    {
        /// <summary>
        /// Creates an instance of the preferred <see cref="IBitStream"/> implementation for streams.
        /// </summary>
        public static IBitStream Create(Stream stream)
        {
            var bs = new UnsafeBitStream();
            bs.Initialize(stream);
            return bs;
        }

        /// <summary>
        /// Creates an instance of the preferred <see cref="IBitStream"/> implementation for byte arrays.
        /// </summary>
        public static IBitStream Create(byte[] data)
        {
            var bs = new UnsafeBitStream();
            bs.Initialize(new MemoryStream(data));
            return bs;
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
            return bs.ReadStringLimited(4096, false);
        }

        private static string ReadStringLimited(this IBitStream bs, int limit, bool endOnNewLine = true)
        {
            var result = new List<byte>(512);
            for (int pos = 0; pos < limit; pos++)
            {
                var b = bs.ReadByte();
                if (b == 0 || (endOnNewLine && b == 10))
                {
                    break;
                }

                result.Add(b);
            }

            return Encoding.ASCII.GetString(result.ToArray());
        }

        public static string ReadDataTableString(this IBitStream bs)
        {
            using (var memstream = new MemoryStream())
            {
                // not particulary efficient, but probably fine
                for (byte b = bs.ReadByte(); b != 0; b = bs.ReadByte())
                {
                    memstream.WriteByte(b);
                }

                return Encoding.Default.GetString(memstream.GetBuffer(), 0, checked((int)memstream.Length));
            }
        }

        public static string ReadCString(this IBitStream reader, int length)
        {
            return Encoding.UTF8.GetString(reader.ReadBytes(length)).Split(new char[] { '\0' }, 2)[0];
        }

        public static uint ReadVarInt(this IBitStream bs)
        {
            uint tmpByte = 0x80;
            uint result = 0;
            for (int count = 0; (tmpByte & 0x80) != 0; count++)
            {
                if (count > 5)
                {
                    throw new InvalidDataException("VarInt32 out of range");
                }

                tmpByte = bs.ReadByte();
                result |= (tmpByte & 0x7F) << (7 * count);
            }

            return result;
        }

        public static uint ReadSignedVarInt(this IBitStream bs)
        {
            uint result = bs.ReadVarInt();
            return (uint)((result >> 1) ^ -(result & 1));
        }

        public static int ReadProtobufVarIntStub(IBitStream reader)
        {
            byte b = 0x80;
            int result = 0;
            for (int count = 0; (b & 0x80) != 0; count++)
            {
                b = reader.ReadByte();

                if (count < 4 || count == 4 && ((b & 0xF8) == 0 || (b & 0xF8) == 0xF8))
                {
                    result |= (b & ~0x80) << (7 * count);
                }
                else
                {
                    if (count >= 10)
                    {
                        throw new OverflowException("Nope nope nope nope! 10 bytes max!");
                    }

                    if (count == 9 ? b != 1 : (b & 0x7F) != 0x7F)
                    {
                        throw new NotSupportedException("more than 32 bits are not supported");
                    }
                }
            }

            return result;
        }

        public static string ReadProtobufString(this IBitStream reader)
        {
            return Encoding.UTF8.GetString(reader.ReadBytes(reader.ReadProtobufVarInt()));
        }
    }
}
